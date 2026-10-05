// src/main.js - 核心业务逻辑

// 数据存储
let allData = [];
let currentPage = 1;
const itemsPerPage = 8;
let currentPath = '';

// ============ 核心功能 ============

// 把后端返回的 files 映射成前端数据结构
function mapFilesToData(result) {
    if (!result || !result.files) {
        return { path: '', files: [] };
    }
    return {
        path: result.path || '',
        files: result.files.map((file, index) => ({
            id: index + 1,
            name: file.name || `file_${index}`,
            size: file.size ? formatFileSize(file.size) : (file.type === 'dir' ? '' : '0 B'),
            rawSize: file.size || 0,
            type: file.type || 'file',
            isDir: file.type === 'dir'
        }))
    };
}

// 加载数据
async function loadData() {
    if (typeof get === 'undefined') {
        console.error('get.js 未加载');
        return;
    }

    try {
        const result = await get.fileList();
        const mapped = mapFilesToData(result);
        currentPath = mapped.path;
        allData = mapped.files;
        console.log(`加载了 ${allData.length} 个项目，当前路径: ${currentPath}`);
    } catch (error) {
        console.error('加载数据失败:', error);
        allData = [];
    }

    renderPage(1);
    updateUI();
}

// 刷新文件列表
window.refreshFileList = function () {
    const btns = document.querySelectorAll('#refresh, #refreshBtn');
    btns.forEach(btn => {
        if (btn) {
            btn.textContent = '⏳ 加载中...';
            btn.disabled = true;
        }
    });

    const restoreButtons = () => {
        btns.forEach(btn => {
            if (btn) {
                btn.textContent = '🔄 刷新';
                btn.disabled = false;
            }
        });
    };

    if (typeof get === 'undefined' || !get.fileList) {
        alert('get.js 未加载');
        restoreButtons();
        return;
    }

    get.fileList()
        .then(result => {
            const mapped = mapFilesToData(result);
            currentPath = mapped.path;
            allData = mapped.files;
            renderPage(1);
            updateUI();
            console.log(`刷新成功，共 ${allData.length} 个项目`);
        })
        .catch(error => {
            console.error('刷新失败:', error);
            alert('刷新失败: ' + error.message);
        })
        .finally(restoreButtons);
};

// ============ 目录操作 ============

// 切换目录
window.changeDirectory = function (dirname) {
    if (typeof get === 'undefined' || !get.changeDirectory) {
        alert('目录切换功能不可用');
        return;
    }
    get.changeDirectory(dirname).then(result => {
        if (result) {
            loadData();   // 切换成功才刷新
        }
    });
};

// 返回上级
function goUp() {
    changeDirectory('..');
}

// 分页导航
function goToPage(direction) {
    const totalPages = Math.ceil(allData.length / itemsPerPage) || 1;
    if (direction === 'prev' && currentPage > 1) {
        renderPage(currentPage - 1);
    } else if (direction === 'next' && currentPage < totalPages) {
        renderPage(currentPage + 1);
    } else if (direction === 'prev') {
        alert('已经是第一页了！');
    } else if (direction === 'next') {
        alert('已经是最后一页了！');
    }
}

// ============ 渲染函数 ============

// 渲染分页
function renderPage(page) {
    const totalPages = Math.ceil(allData.length / itemsPerPage) || 1;
    if (page < 1) page = 1;
    if (page > totalPages) page = totalPages;

    currentPage = page;
    const start = (page - 1) * itemsPerPage;
    const end = Math.min(start + itemsPerPage, allData.length);
    const pageData = allData.slice(start, end);

    if (typeof dpUtil !== 'undefined') {
        dpUtil.renderTable(pageData, currentPage, itemsPerPage);
    }
    updateUI();
}

// 更新所有 UI
function updateUI() {
    const totalFiles = allData.length;
    const totalPages = Math.ceil(totalFiles / itemsPerPage) || 1;

    if (typeof dpUtil !== 'undefined') {
        dpUtil.updatePathDisplay(currentPath);
        dpUtil.updateStats(totalFiles, totalPages, currentPage);

        const showDiv = document.getElementById('showBar');
        if (showDiv && showDiv.innerHTML.includes('文件管理器')) {
            dpUtil.updateWelcomeMessage(totalFiles, totalPages, currentPath);
        }
    }
}

// 更新欢迎信息（供外部调用）
function updateWelcomeMessage() {
    const totalFiles = allData.length;
    const totalPages = Math.ceil(totalFiles / itemsPerPage) || 1;
    if (typeof dpUtil !== 'undefined') {
        dpUtil.updateWelcomeMessage(totalFiles, totalPages, currentPath);
    }
}

// 格式化文件大小
function formatFileSize(bytes) {
    if (bytes === 0 || !bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// 删除文件（供 UI 调用）
function deleteFile(item) {
    if (item.isDir) {
        alert('暂不支持删除文件夹');
        return;
    }
    if (typeof get === 'undefined' || !get.deleteFile) {
        alert('删除功能不可用');
        return;
    }
    get.deleteFile(item.name).then(result => {
        if (result) {
            loadData();   // 删除成功才刷新
        }
    });
}

// 新建文件夹（供 UI 调用）
function makeDirectory() {
    const name = prompt('请输入文件夹名称:');
    if (name === null) return;   // 用户取消

    const trimmed = name.trim();
    if (trimmed === '') {
        alert('目录名不能为空');
        return;
    }
    if (typeof get === 'undefined' || !get.makeDirectory) {
        alert('新建文件夹功能不可用');
        return;
    }
    get.makeDirectory(trimmed).then(result => {
        if (result) {
            loadData();
        }
    });
}

// ============ 页面初始化 ============

// 页面加载完成后执行
document.addEventListener('DOMContentLoaded', function () {
    if (typeof dpUtil !== 'undefined') {
        dpUtil.init();
    }

    // 绑定"新建文件夹"按钮
    const newFolderBtn = document.getElementById('newFolder');
    if (newFolderBtn) {
        newFolderBtn.addEventListener('click', function () {
            makeDirectory();
        });
    }

    loadData();
});