// test.js

// 数据存储
let allData = [];
let currentPage = 1;
const itemsPerPage = 8;
let currentFileContent = '';

// 生成随机文件名的辅助函数（作为备用）
function generateRandomName() {
    const prefixes = ['文档', '图片', '视频', '音乐', '项目', '报告', '数据', '备份', '源码', '配置', '学习', '工作'];
    const suffixes = ['txt', 'jpg', 'mp4', 'mp3', 'pdf', 'docx', 'xlsx', 'pptx', 'zip', 'rar', 'json', 'xml'];
    const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    const suffix = suffixes[Math.floor(Math.random() * suffixes.length)];
    return `${prefix}_${Date.now().toString().slice(-6)}_${Math.floor(Math.random() * 1000)}.${suffix}`;
}

// 生成随机文件大小（作为备用）
function generateRandomSize() {
    const sizes = [
        '1.2 KB', '3.5 KB', '8.7 KB', '12.3 KB', '25.6 KB',
        '45.8 KB', '67.2 KB', '89.4 KB', '102.5 KB', '156.7 KB',
        '234.8 KB', '312.9 KB', '456.2 KB', '567.3 KB', '678.4 KB',
        '789.5 KB', '890.6 KB', '1.2 MB', '2.3 MB', '3.4 MB',
        '4.5 MB', '5.6 MB', '6.7 MB', '7.8 MB', '8.9 MB'
    ];
    return sizes[Math.floor(Math.random() * sizes.length)];
}

// 从 API 获取文件列表
function loadFileListFromAPI() {
    if (typeof get !== 'undefined' && get.fileList) {
        return get.fileList();
    } else {
        console.warn('get.js 未加载，使用模拟数据');
        return Promise.resolve(null);
    }
}

// 加载数据
async function loadData() {
    // 先尝试从 API 获取
    const apiFiles = await loadFileListFromAPI();
    
    if (apiFiles && apiFiles.length > 0) {
        // 使用 API 数据
        allData = apiFiles.map((file, index) => ({
            id: index + 1,
            name: file.name || file.filename || `file_${index}`,
            size: file.size ? formatFileSize(file.size) : generateRandomSize(),
            rawSize: file.size || 0,
            path: file.path || file.name || '',
            type: file.type || 'file'
        }));
        console.log(`从 API 加载了 ${allData.length} 个文件`);
    } else {
        // 使用模拟数据
        allData = generateMockData(20);
        console.log('使用模拟数据');
    }
    
    // 渲染页面
    renderPage(1);
    updateStats();
    updateWelcomeMessage();
}

// 格式化文件大小
function formatFileSize(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// 生成模拟数据
function generateMockData(count = 20) {
    const data = [];
    for (let i = 0; i < count; i++) {
        data.push({
            id: i + 1,
            name: generateRandomName(),
            size: generateRandomSize(),
            rawSize: Math.floor(Math.random() * 1024 * 1024),
            path: `/files/${generateRandomName()}`,
            type: 'file'
        });
    }
    return data;
}

// 生成操作按钮
function createActionButtons(item) {
    const container = document.createElement('div');
    container.style.display = 'flex';
    container.style.gap = '5px';
    container.style.justifyContent = 'center';

    // 查看按钮
    const viewBtn = document.createElement('button');
    viewBtn.textContent = '查看';
    viewBtn.style.padding = '4px 10px';
    viewBtn.style.cursor = 'pointer';
    viewBtn.onclick = function(e) {
        e.stopPropagation();
        showFileDetail(item);
    };

    // 下载按钮
    const downloadBtn = document.createElement('button');
    downloadBtn.textContent = '下载';
    downloadBtn.style.padding = '4px 10px';
    downloadBtn.style.cursor = 'pointer';
    downloadBtn.style.backgroundColor = '#4CAF50';
    downloadBtn.style.color = 'white';
    downloadBtn.style.border = 'none';
    downloadBtn.style.borderRadius = '3px';
    downloadBtn.onclick = function(e) {
        e.stopPropagation();
        downloadFile(item);
    };

    // 删除按钮
    const deleteBtn = document.createElement('button');
    deleteBtn.textContent = '删除';
    deleteBtn.style.padding = '4px 10px';
    deleteBtn.style.cursor = 'pointer';
    deleteBtn.style.color = 'red';
    deleteBtn.style.border = '1px solid red';
    deleteBtn.style.borderRadius = '3px';
    deleteBtn.style.backgroundColor = 'white';
    deleteBtn.onclick = function(e) {
        e.stopPropagation();
        deleteFile(item);
    };

    container.appendChild(viewBtn);
    container.appendChild(downloadBtn);
    container.appendChild(deleteBtn);
    return container;
}

// 显示文件详情
function showFileDetail(item) {
    const showDiv = document.getElementById('show');
    
    // 先显示加载状态
    showDiv.innerHTML = `
        <div style="padding: 30px; color: white; text-align: center;">
            <p>⏳ 正在加载文件内容...</p>
        </div>
    `;

    // 尝试获取文件内容
    if (typeof get !== 'undefined' && get.fileContent) {
        get.fileContent(item.name).then(content => {
            if (content !== null) {
                displayFileContent(item, content);
            } else {
                displayFileInfo(item);
            }
        });
    } else {
        displayFileInfo(item);
    }
}

// 显示文件内容
function displayFileContent(item, content) {
    const showDiv = document.getElementById('show');
    const isText = item.name.match(/\.(txt|js|html|css|json|xml|md|py|java|c|cpp|h|sh|bat|conf|cfg|ini|log)$/i);
    
    showDiv.innerHTML = `
        <div style="padding: 15px; color: white; height: 100%; overflow: auto;">
            <h3 style="margin-top: 0;">📄 ${item.name}</h3>
            <div style="display: flex; gap: 10px; margin-bottom: 10px; flex-wrap: wrap;">
                <span style="background: rgba(255,255,255,0.2); padding: 4px 10px; border-radius: 4px;">
                    📊 ${item.size}
                </span>
                <span style="background: rgba(255,255,255,0.2); padding: 4px 10px; border-radius: 4px;">
                    📁 ${item.path || '/'}
                </span>
            </div>
            <div style="background: rgba(0,0,0,0.3); padding: 10px; border-radius: 4px; max-height: calc(100% - 80px); overflow: auto;">
                ${isText ? `<pre style="margin: 0; white-space: pre-wrap; word-wrap: break-word; font-size: 13px;">${escapeHtml(content)}</pre>` 
                          : `<p style="color: #aaa;">📎 二进制文件，无法显示预览</p>`}
            </div>
            <div style="margin-top: 10px; display: flex; gap: 10px;">
                <button onclick="downloadFileFromAPI('${item.name}')" style="padding: 8px 20px; cursor: pointer; background: #4CAF50; color: white; border: none; border-radius: 4px;">
                    ⬇️ 下载文件
                </button>
                <button onclick="closeFileDetail()" style="padding: 8px 20px; cursor: pointer; background: #f44336; color: white; border: none; border-radius: 4px;">
                    ✕ 关闭
                </button>
            </div>
        </div>
    `;
}

// 显示文件信息（无内容预览）
function displayFileInfo(item) {
    const showDiv = document.getElementById('show');
    showDiv.innerHTML = `
        <div style="padding: 30px; color: white; height: 100%; overflow: auto;">
            <h3 style="margin-top: 0;">📄 文件信息</h3>
            <div style="background: rgba(255,255,255,0.1); padding: 20px; border-radius: 8px; margin-top: 15px;">
                <p><strong>文件名：</strong> ${item.name}</p>
                <p><strong>大小：</strong> ${item.size}</p>
                <p><strong>路径：</strong> ${item.path || '/'}</p>
                <p><strong>ID：</strong> ${item.id}</p>
                <p><strong>类型：</strong> ${item.type || '文件'}</p>
            </div>
            <div style="margin-top: 20px; display: flex; gap: 10px;">
                <button onclick="downloadFileFromAPI('${item.name}')" style="padding: 8px 20px; cursor: pointer; background: #4CAF50; color: white; border: none; border-radius: 4px;">
                    ⬇️ 下载文件
                </button>
                <button onclick="closeFileDetail()" style="padding: 8px 20px; cursor: pointer; background: #f44336; color: white; border: none; border-radius: 4px;">
                    ✕ 关闭
                </button>
            </div>
        </div>
    `;
}

// 关闭文件详情
function closeFileDetail() {
    updateWelcomeMessage();
}

// 下载文件
function downloadFile(item) {
    if (typeof get !== 'undefined' && get.fileContent) {
        get.fileContent(item.name).then(content => {
            if (content !== null) {
                const blob = new Blob([content], { type: 'text/plain' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = item.name;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
            }
        });
    } else {
        alert(`下载文件: ${item.name}`);
    }
}

// 从 API 下载文件
window.downloadFileFromAPI = function(filename) {
    if (typeof get !== 'undefined' && get.fileContent) {
        get.fileContent(filename).then(content => {
            if (content !== null) {
                const blob = new Blob([content], { type: 'text/plain' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = filename;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
            }
        });
    } else {
        alert(`下载文件: ${filename}`);
    }
};

// 删除文件
function deleteFile(item) {
    if (confirm(`确定要删除文件 "${item.name}" 吗？`)) {
        if (typeof get !== 'undefined' && get.deleteFile) {
            get.deleteFile(item.name).then(result => {
                if (result !== null) {
                    // 从本地数据中删除
                    allData = allData.filter(f => f.id !== item.id);
                    renderPage(currentPage);
                    updateStats();
                    updateWelcomeMessage();
                    alert(`文件 "${item.name}" 已删除`);
                }
            });
        } else {
            // 模拟删除
            allData = allData.filter(f => f.id !== item.id);
            renderPage(currentPage);
            updateStats();
            updateWelcomeMessage();
            alert(`文件 "${item.name}" 已删除（模拟）`);
        }
    }
}

// HTML 转义
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// 渲染表格
function renderTable(data) {
    const tbody = document.querySelector('table tbody');
    if (!tbody) return;

    tbody.innerHTML = '';

    if (data.length === 0) {
        const tr = document.createElement('tr');
        const td = document.createElement('td');
        td.colSpan = 4;
        td.textContent = '📭 暂无文件';
        td.style.textAlign = 'center';
        td.style.padding = '40px';
        td.style.color = '#999';
        tr.appendChild(td);
        tbody.appendChild(tr);
        return;
    }

    data.forEach((item, index) => {
        const tr = document.createElement('tr');
        tr.dataset.id = item.id;
        tr.style.transition = 'background-color 0.3s';
        
        // 序号
        const indexTd = document.createElement('td');
        indexTd.textContent = (currentPage - 1) * itemsPerPage + index + 1;
        indexTd.style.textAlign = 'center';
        indexTd.style.padding = '8px';
        indexTd.style.border = '1px solid #ddd';
        
        // 文件名
        const nameTd = document.createElement('td');
        const fileIcon = item.name.match(/\.(jpg|png|gif|bmp|svg|ico)$/i) ? '🖼️' :
                        item.name.match(/\.(mp4|avi|mov|mkv|webm)$/i) ? '🎬' :
                        item.name.match(/\.(mp3|wav|flac|ogg|aac)$/i) ? '🎵' :
                        item.name.match(/\.(zip|rar|7z|tar|gz|bz2|xz)$/i) ? '📦' :
                        item.name.match(/\.(js|html|css|json|xml|py|java|cpp|c|h|php|rb|go|rs)$/i) ? '💻' :
                        item.name.match(/\.(pdf|doc|docx|xls|xlsx|ppt|pptx)$/i) ? '📋' : '📄';
        nameTd.textContent = `${fileIcon} ${item.name}`;
        nameTd.style.padding = '8px';
        nameTd.style.border = '1px solid #ddd';
        
        // 文件大小
        const sizeTd = document.createElement('td');
        sizeTd.textContent = item.size;
        sizeTd.style.textAlign = 'center';
        sizeTd.style.padding = '8px';
        sizeTd.style.border = '1px solid #ddd';
        
        // 操作按钮
        const actionTd = document.createElement('td');
        actionTd.style.textAlign = 'center';
        actionTd.style.padding = '8px';
        actionTd.style.border = '1px solid #ddd';
        actionTd.appendChild(createActionButtons(item));

        tr.appendChild(indexTd);
        tr.appendChild(nameTd);
        tr.appendChild(sizeTd);
        tr.appendChild(actionTd);

        // 鼠标悬停效果
        tr.onmouseover = function() {
            this.style.backgroundColor = '#e8e8e8';
        };
        tr.onmouseout = function() {
            this.style.backgroundColor = '';
        };

        // 双击打开文件
        tr.ondblclick = function() {
            const rowData = allData.find(f => f.id === parseInt(this.dataset.id));
            if (rowData) {
                showFileDetail(rowData);
            }
        };

        tbody.appendChild(tr);
    });
}

// 渲染分页
function renderPage(page) {
    const totalPages = Math.ceil(allData.length / itemsPerPage);
    if (page < 1) page = 1;
    if (page > totalPages && totalPages > 0) page = totalPages;
    
    currentPage = page;
    const start = (page - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    const pageData = allData.slice(start, end);
    renderTable(pageData);
    updatePageSelect();
}

// 更新分页选择器
function updatePageSelect() {
    const select = document.getElementById('pageSelect');
    if (!select) return;

    const totalPages = Math.ceil(allData.length / itemsPerPage);
    select.innerHTML = '';
    
    for (let i = 1; i <= totalPages; i++) {
        const option = document.createElement('option');
        option.value = i;
        option.textContent = `${i}`;
        if (i === currentPage) {
            option.selected = true;
        }
        select.appendChild(option);
    }
}

// 更新统计信息（使用 HTML 中已有的元素）
function updateStats() {
    const totalFiles = allData.length;
    const totalPages = Math.ceil(totalFiles / itemsPerPage);
    
    // 更新 HTML 中的统计元素
    const pageCountEl = document.getElementById('pageCount');
    const fileCountEl = document.getElementById('fileCount');
    
    if (pageCountEl) {
        pageCountEl.textContent = totalPages || 0;
    }
    if (fileCountEl) {
        fileCountEl.textContent = totalFiles;
    }
    
    // 更新页面选择器
    updatePageSelect();
}

// 更新欢迎信息
function updateWelcomeMessage() {
    const showDiv = document.getElementById('show');
    const totalFiles = allData.length;
    const totalPages = Math.ceil(totalFiles / itemsPerPage);
    
    showDiv.innerHTML = `
        <div style="padding: 30px; color: white; text-align: center; height: 100%; display: flex; flex-direction: column; justify-content: center;">
            <h2 style="font-size: 28px;">📂 文件管理器</h2>
            <p style="margin-top: 20px; font-size: 16px;">点击文件的「查看」按钮查看详情</p>
            <div style="margin-top: 20px; background: rgba(255,255,255,0.1); padding: 15px; border-radius: 8px; max-width: 300px; margin-left: auto; margin-right: auto;">
                <p style="margin: 5px 0;">📁 共 ${totalFiles} 个文件</p>
                <p style="margin: 5px 0;">📑 共 ${totalPages} 页</p>
            </div>
            <p style="margin-top: 30px; font-size: 12px; opacity: 0.6;">
                💡 提示：可以使用 ← → 方向键翻页，双击文件查看详情
            </p>
        </div>
    `;
}

// 刷新文件列表
window.refreshFileList = function() {
    // 显示加载状态
    const refreshBtn = document.getElementById('refresh');
    if (refreshBtn) {
        refreshBtn.textContent = '⏳ 加载中...';
        refreshBtn.disabled = true;
    }
    
    if (typeof get !== 'undefined' && get.refreshFileList) {
        get.refreshFileList().then(files => {
            if (files && files.length > 0) {
                allData = files.map((file, index) => ({
                    id: index + 1,
                    name: file.name || file.filename || `file_${index}`,
                    size: file.size ? formatFileSize(file.size) : generateRandomSize(),
                    rawSize: file.size || 0,
                    path: file.path || file.name || '',
                    type: file.type || 'file'
                }));
                renderPage(1);
                updateStats();
                updateWelcomeMessage();
                console.log(`刷新成功，共 ${allData.length} 个文件`);
            } else {
                // 如果没有文件，显示空状态
                allData = [];
                renderPage(1);
                updateStats();
                updateWelcomeMessage();
                console.log('文件列表为空');
            }
            // 恢复按钮状态
            if (refreshBtn) {
                refreshBtn.textContent = '🔄 刷新';
                refreshBtn.disabled = false;
            }
        }).catch(error => {
            console.error('刷新失败:', error);
            if (refreshBtn) {
                refreshBtn.textContent = '🔄 刷新';
                refreshBtn.disabled = false;
            }
            alert('刷新失败，请检查网络连接');
        });
    } else {
        // 如果没有 get.js，重新加载模拟数据
        loadData();
        if (refreshBtn) {
            refreshBtn.textContent = '🔄 刷新';
            refreshBtn.disabled = false;
        }
    }
};

// 添加测试数据（仅用于模拟模式）
window.addTestData = function() {
    // 检查是否使用 API 模式
    if (typeof get !== 'undefined' && get.fileList) {
        // 在 API 模式下，通过刷新来获取真实数据
        refreshFileList();
        return;
    }
    
    const newItem = {
        id: allData.length + 1,
        name: generateRandomName(),
        size: generateRandomSize(),
        rawSize: Math.floor(Math.random() * 1024 * 1024),
        path: `/files/${generateRandomName()}`,
        type: 'file'
    };
    allData.push(newItem);
    const totalPages = Math.ceil(allData.length / itemsPerPage);
    renderPage(totalPages);
    updateStats();
    updateWelcomeMessage();
};

// 表头样式
function styleTableHeader() {
    const thead = document.querySelector('table thead');
    if (thead) {
        thead.style.backgroundColor = '#4CAF50';
        thead.style.color = 'white';
        const cells = thead.querySelectorAll('td');
        cells.forEach(td => {
            td.style.padding = '10px 8px';
            td.style.fontWeight = 'bold';
            td.style.border = '1px solid #4CAF50';
            td.style.textAlign = 'center';
        });
    }
}

// 初始化事件监听
function initEvents() {
    // 上一页
    const pageLastBtn = document.getElementById('pageLast');
    if (pageLastBtn) {
        pageLastBtn.addEventListener('click', function() {
            if (currentPage > 1) {
                renderPage(currentPage - 1);
            } else {
                alert('已经是第一页了！');
            }
        });
    }

    // 下一页
    const pageNextBtn = document.getElementById('pageNext');
    if (pageNextBtn) {
        pageNextBtn.addEventListener('click', function() {
            const totalPages = Math.ceil(allData.length / itemsPerPage);
            if (currentPage < totalPages) {
                renderPage(currentPage + 1);
            } else {
                alert('已经是最后一页了！');
            }
        });
    }

    // 选择器切换
    const pageSelect = document.getElementById('pageSelect');
    if (pageSelect) {
        pageSelect.addEventListener('change', function() {
            renderPage(parseInt(this.value));
        });
    }

    // 刷新按钮
    const refreshBtn = document.getElementById('refresh');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', function() {
            refreshFileList();
        });
    }

    // 键盘快捷键（左右箭头翻页）
    document.addEventListener('keydown', function(e) {
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT' || e.target.tagName === 'TEXTAREA') return;
        if (e.key === 'ArrowLeft') {
            const btn = document.getElementById('pageLast');
            if (btn) btn.click();
        } else if (e.key === 'ArrowRight') {
            const btn = document.getElementById('pageNext');
            if (btn) btn.click();
        }
    });
}

// 页面加载完成后执行
document.addEventListener('DOMContentLoaded', function() {
    // 设置表格样式
    const table = document.querySelector('table');
    if (table) {
        table.style.width = '100%';
        table.style.borderCollapse = 'collapse';
        table.style.marginTop = '10px';
    }

    // 设置左侧面板样式
    const leftPanel = document.querySelector('.a[style*="background-color: gray"]');
    if (leftPanel) {
        leftPanel.style.padding = '10px';
        leftPanel.style.boxSizing = 'border-box';
    }

    styleTableHeader();
    initEvents();
    
    // 加载数据
    loadData();
});