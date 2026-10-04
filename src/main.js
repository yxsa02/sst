// src/main.js - 核心业务逻辑

// 数据存储
let allData = [];
let currentPage = 1;
const itemsPerPage = 8;
let currentPath = '';

// ============ 核心功能 ============

// 加载数据
async function loadData() {
    if (typeof get === 'undefined') {
        console.error('get.js 未加载');
        return;
    }
    
    try {
        const result = await get.fileList();
        if (result && result.files) {
            currentPath = result.path || '';
            allData = result.files.map((file, index) => ({
                id: index + 1,
                name: file.name || `file_${index}`,
                size: file.size ? formatFileSize(file.size) : (file.type === 'dir' ? '' : '0 B'),
                rawSize: file.size || 0,
                type: file.type || 'file',
                isDir: file.type === 'dir'
            }));
            console.log(`加载了 ${allData.length} 个项目，当前路径: ${currentPath}`);
        } else {
            allData = [];
            console.log('文件列表为空');
        }
    } catch (error) {
        console.error('加载数据失败:', error);
        allData = [];
    }
    
    renderPage(1);
    updateUI();
}

// 刷新文件列表
window.refreshFileList = function() {
    const btns = document.querySelectorAll('#refresh, #refreshBtn');
    btns.forEach(btn => {
        if (btn) {
            btn.textContent = '⏳ 加载中...';
            btn.disabled = true;
        }
    });
    
    if (typeof get !== 'undefined' && get.fileList) {
        get.fileList().then(result => {
            if (result && result.files) {
                currentPath = result.path || '';
                allData = result.files.map((file, index) => ({
                    id: index + 1,
                    name: file.name || `file_${index}`,
                    size: file.size ? formatFileSize(file.size) : (file.type === 'dir' ? '' : '0 B'),
                    rawSize: file.size || 0,
                    type: file.type || 'file',
                    isDir: file.type === 'dir'
                }));
                renderPage(1);
                updateUI();
                console.log(`刷新成功，共 ${allData.length} 个项目`);
            } else {
                allData = [];
                renderPage(1);
                updateUI();
                console.log('文件列表为空');
            }
            btns.forEach(btn => {
                if (btn) {
                    btn.textContent = '🔄 刷新';
                    btn.disabled = false;
                }
            });
        }).catch(error => {
            console.error('刷新失败:', error);
            btns.forEach(btn => {
                if (btn) {
                    btn.textContent = '🔄 刷新';
                    btn.disabled = false;
                }
            });
            alert('刷新失败: ' + error.message);
        });
    } else {
        alert('get.js 未加载');
        btns.forEach(btn => {
            if (btn) {
                btn.textContent = '🔄 刷新';
                btn.disabled = false;
            }
        });
    }
};

// ============ 目录操作 ============

// 切换目录
window.changeDirectory = function(dirname) {
    if (typeof get !== 'undefined' && get.changeDirectory) {
        get.changeDirectory(dirname);
    } else {
        alert('目录切换功能不可用');
    }
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
    
    // 使用 uiUtil 渲染表格
    if (typeof uiUtil !== 'undefined') {
        uiUtil.renderTable(pageData, currentPage, itemsPerPage);
    }
    updateUI();
}

// 更新所有 UI
function updateUI() {
    const totalFiles = allData.length;
    const totalPages = Math.ceil(totalFiles / itemsPerPage) || 1;
    
    if (typeof uiUtil !== 'undefined') {
        uiUtil.updatePathDisplay(currentPath);
        uiUtil.updateStats(totalFiles, totalPages, currentPage);
        
        // 检查是否在欢迎页面
        const showDiv = document.getElementById('showBar');
        if (showDiv && showDiv.innerHTML.includes('文件管理器')) {
            uiUtil.updateWelcomeMessage(totalFiles, totalPages, currentPath);
        }
    }
}

// 更新欢迎信息（供外部调用）
function updateWelcomeMessage() {
    const totalFiles = allData.length;
    const totalPages = Math.ceil(totalFiles / itemsPerPage) || 1;
    if (typeof uiUtil !== 'undefined') {
        uiUtil.updateWelcomeMessage(totalFiles, totalPages, currentPath);
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
    
    if (typeof get !== 'undefined' && get.deleteFile) {
        get.deleteFile(item.name);
    } else {
        alert('删除功能不可用');
    }
}

// ============ 页面初始化 ============

// 页面加载完成后执行
document.addEventListener('DOMContentLoaded', function() {
    if (typeof uiUtil !== 'undefined') {
        uiUtil.init();
    }
    loadData();
});