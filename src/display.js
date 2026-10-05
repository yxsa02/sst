// src/display.js - UI 操作模块

const dpUtil = {
    // 显示文件详情（右侧面板）
    showFileDetail: function (item) {
        if (item.isDir) {
            if (typeof changeDirectory !== 'undefined') {
                changeDirectory(item.name);
            }
            return;
        }

        const showDiv = document.getElementById('showBar');
        const fileType = this.getFileType(item.name);

        if (fileType === 'image' || fileType === 'video' || fileType === 'audio') {
            this.displayMediaPreview(item);
            return;
        }

        // 加载中
        showDiv.innerHTML = `
            <div class="dp-loading">
                <p>⏳ 正在加载文件内容...</p>
            </div>
        `;

        if (typeof get !== 'undefined' && get.fileContent) {
            get.fileContent(item.name).then(content => {
                if (content !== null) {
                    this.displayFileContent(item, content);
                } else {
                    this.displayFileInfo(item);
                }
            });
        } else {
            this.displayFileInfo(item);
        }
    },

    // 显示媒体预览（图片/视频/音频）
    displayMediaPreview: function (item) {
        const showDiv = document.getElementById('showBar');
        const fileType = this.getFileType(item.name);
        const fileUrl = `/api/file/?fn=${encodeURIComponent(item.name)}`;

        let mediaElement = '';
        if (fileType === 'image') {
            mediaElement = `<img src="${fileUrl}" alt="${item.name}" class="dp-media dp-media-img">`;
        } else if (fileType === 'video') {
            mediaElement = `
                <video controls class="dp-media">
                    <source src="${fileUrl}">
                    您的浏览器不支持视频播放
                </video>`;
        } else if (fileType === 'audio') {
            mediaElement = `
                <audio controls class="dp-media-audio">
                    <source src="${fileUrl}">
                    您的浏览器不支持音频播放
                </audio>`;
        }

        showDiv.innerHTML = `
            <div class="dp-pane">
                <h3 class="dp-title">${this.getFileIcon(item.name)} ${item.name}</h3>
                <div class="dp-meta">
                    <span class="dp-badge">📊 ${item.size || '0 B'}</span>
                    <span class="dp-badge">🏷️ ${fileType}</span>
                </div>
                <div class="dp-content-media">
                    ${mediaElement}
                </div>
                <div class="dp-btn-row">
                    <button class="dp-btn dp-btn-download"
                            onclick="dpUtil.downloadFileFromAPI('${item.name}')">⬇️ 下载</button>
                    <button class="dp-btn dp-btn-close"
                            onclick="dpUtil.closeFileDetail()">✕ 关闭</button>
                </div>
            </div>
        `;
    },

    // 显示文件内容（文本文件）
    displayFileContent: function (item, content) {
        const showDiv = document.getElementById('showBar');

        let displayContent = content;
        if (content && content.length > 50000) {
            displayContent = content.substring(0, 50000) + '\n\n... (内容过长，已截断)';
        }

        showDiv.innerHTML = `
            <div class="dp-pane">
                <h3 class="dp-title">${this.getFileIcon(item.name)} ${item.name}</h3>
                <div class="dp-meta">
                    <span class="dp-badge">📊 ${item.size || '0 B'}</span>
                    <span class="dp-badge">📄 文本文件</span>
                </div>
                <div class="dp-content-text">
                    <pre class="dp-pre">${this.escapeHtml(displayContent)}</pre>
                </div>
                <div class="dp-btn-row">
                    <button class="dp-btn dp-btn-download"
                            onclick="dpUtil.downloadFileFromAPI('${item.name}')">⬇️ 下载</button>
                    <button class="dp-btn dp-btn-close"
                            onclick="dpUtil.closeFileDetail()">✕ 关闭</button>
                </div>
            </div>
        `;
    },

    // 显示文件信息（无法预览的文件）
    displayFileInfo: function (item) {
        const showDiv = document.getElementById('showBar');
        const fileType = this.getFileType(item.name);

        showDiv.innerHTML = `
            <div class="dp-pane dp-pane-info">
                <h3 class="dp-title">${this.getFileIcon(item.name)} 文件信息</h3>
                <div class="dp-info-panel">
                    <p><strong>文件名：</strong> ${item.name}</p>
                    <p><strong>大小：</strong> ${item.size || '0 B'}</p>
                    <p><strong>类型：</strong> ${fileType}</p>
                    <p><strong>路径：</strong> ${typeof currentPath !== 'undefined' ? currentPath : '/'}</p>
                </div>
                <div class="dp-btn-row">
                    <button class="dp-btn dp-btn-download"
                            onclick="dpUtil.downloadFileFromAPI('${item.name}')">⬇️ 下载</button>
                    <button class="dp-btn dp-btn-close"
                            onclick="dpUtil.closeFileDetail()">✕ 关闭</button>
                </div>
            </div>
        `;
    },

    // 关闭文件详情
    closeFileDetail: function () {
        if (typeof updateWelcomeMessage !== 'undefined') {
            updateWelcomeMessage();
        } else {
            const showDiv = document.getElementById('showBar');
            showDiv.innerHTML = `
                <div class="welcome">
                    <h2>📂 文件管理器</h2>
                    <p class="subtitle">点击文件的「查看」按钮查看详情</p>
                </div>
            `;
        }
    },

    // 下载文件
    downloadFileFromAPI: function (filename) {
        const fileUrl = `/api/file/?fn=${encodeURIComponent(filename)}`;
        const a = document.createElement('a');
        a.href = fileUrl;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    },

    // ============ 文件类型判断 ============
    getFileType: function (filename) {
        if (!filename) return 'other';
        const ext = filename.split('.').pop().toLowerCase();
        const imageExts = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'tiff', 'ico', 'svg', 'webp'];
        const videoExts = ['mp4', 'avi', 'mkv', 'mov', 'wmv', 'flv', 'webm', 'm4v', 'mpg', 'mpeg'];
        const audioExts = ['mp3', 'wav', 'ogg', 'flac', 'aac', 'wma', 'm4a'];
        const textExts = ['txt', 'md', 'py', 'json', 'csv', 'log', 'xml', 'html', 'htm', 'js', 'css', 'ini', 'cfg', 'conf', 'bat', 'sh', 'yml', 'yaml', 'java', 'cpp', 'c', 'h', 'go', 'rs', 'php', 'rb', 'pl'];
        const docExts = ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx'];
        const archiveExts = ['zip', 'rar', '7z', 'tar', 'gz', 'bz2', 'xz'];

        if (imageExts.includes(ext)) return 'image';
        if (videoExts.includes(ext)) return 'video';
        if (audioExts.includes(ext)) return 'audio';
        if (textExts.includes(ext)) return 'text';
        if (docExts.includes(ext)) return 'document';
        if (archiveExts.includes(ext)) return 'archive';
        return 'other';
    },

    getFileIcon: function (filename) {
        if (!filename) return '📄';
        const type = this.getFileType(filename);
        const icons = {
            'image': '🖼️', 'video': '🎬', 'audio': '🎵',
            'text': '💻', 'document': '📋', 'archive': '📦', 'other': '📄'
        };
        return icons[type] || '📄';
    },

    escapeHtml: function (text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    },

    // ============ 表格渲染 ============

    // 生成操作按钮
    createActionButtons: function (item) {
        const container = document.createElement('div');
        container.className = 'row-actions';

        if (item.isDir) {
            const openBtn = document.createElement('button');
            openBtn.textContent = '📂 打开';
            openBtn.className = 'row-btn row-btn-open';
            openBtn.onclick = function (e) {
                e.stopPropagation();
                if (typeof changeDirectory !== 'undefined') {
                    changeDirectory(item.name);
                }
            };
            container.appendChild(openBtn);
            return container;
        }

        const viewBtn = document.createElement('button');
        viewBtn.textContent = '查看';
        viewBtn.className = 'row-btn row-btn-view';
        viewBtn.onclick = function (e) {
            e.stopPropagation();
            dpUtil.showFileDetail(item);
        };

        const downloadBtn = document.createElement('button');
        downloadBtn.textContent = '下载';
        downloadBtn.className = 'row-btn row-btn-download';
        downloadBtn.onclick = function (e) {
            e.stopPropagation();
            dpUtil.downloadFileFromAPI(item.name);
        };

        const deleteBtn = document.createElement('button');
        deleteBtn.textContent = '删除';
        deleteBtn.className = 'row-btn row-btn-delete';
        deleteBtn.onclick = function (e) {
            e.stopPropagation();
            if (typeof deleteFile !== 'undefined') {
                deleteFile(item);
            }
        };

        container.appendChild(viewBtn);
        container.appendChild(downloadBtn);
        container.appendChild(deleteBtn);
        return container;
    },

    // 渲染表格
    renderTable: function (data, currentPage, itemsPerPage) {
        const tbody = document.querySelector('table tbody');
        if (!tbody) return;
        tbody.innerHTML = '';

        if (!data || data.length === 0) {
            const tr = document.createElement('tr');
            const td = document.createElement('td');
            td.colSpan = 4;
            td.className = 'td-empty';
            td.textContent = '📭 暂无文件或文件夹';
            tr.appendChild(td);
            tbody.appendChild(tr);
            return;
        }

        data.forEach((item, index) => {
            const tr = document.createElement('tr');
            tr.dataset.id = item.id;
            tr.className = item.isDir ? 'dir-row' : 'file-row';

            // 序号
            const indexTd = document.createElement('td');
            indexTd.className = 'td-index';
            indexTd.textContent = (currentPage - 1) * itemsPerPage + index + 1;

            // 文件名
            const nameTd = document.createElement('td');
            nameTd.className = 'td-name' + (item.isDir ? ' dir' : '');
            nameTd.textContent = item.isDir
                ? `📁 ${item.name}`
                : `${dpUtil.getFileIcon(item.name)} ${item.name}`;

            // 大小
            const sizeTd = document.createElement('td');
            sizeTd.className = 'td-size' + (item.isDir ? ' dir' : '');
            sizeTd.textContent = item.isDir ? '📁 文件夹' : (item.size || '0 B');

            // 操作
            const actionTd = document.createElement('td');
            actionTd.className = 'td-action';
            actionTd.appendChild(dpUtil.createActionButtons(item));

            tr.appendChild(indexTd);
            tr.appendChild(nameTd);
            tr.appendChild(sizeTd);
            tr.appendChild(actionTd);

            // 单击进入文件夹
            if (item.isDir) {
                tr.onclick = function (e) {
                    if (e.target.tagName === 'BUTTON') return;
                    if (typeof changeDirectory !== 'undefined') {
                        changeDirectory(item.name);
                    }
                };
            }

            // 双击打开文件
            tr.ondblclick = function () {
                if (!item.isDir) {
                    dpUtil.showFileDetail(item);
                }
            };

            tbody.appendChild(tr);
        });
    },

    // ============ 页面更新 ============

    updatePathDisplay: function (path) {
        const pathEls = document.querySelectorAll('#pathShow');
        let displayPath = path || '/';

        if (displayPath.includes('\\')) {
            displayPath = displayPath.replace(/\\/g, '/');
        }

        if (displayPath.length > 60) {
            const parts = displayPath.split('/');
            if (parts.length > 5) {
                displayPath = parts.slice(0, 2).join('/') + '/.../' + parts.slice(-3).join('/');
            }
        }

        pathEls.forEach(el => {
            el.textContent = displayPath;
            el.title = path || '/';
        });
    },

    updateStats: function (totalFiles, totalPages, currentPage) {
        const pageCountEl = document.getElementById('pageCount');
        const fileCountEl = document.getElementById('fileCount');
        const pageSelect = document.getElementById('pageSelect');

        if (pageCountEl) pageCountEl.textContent = totalPages || 1;
        if (fileCountEl) fileCountEl.textContent = totalFiles || 0;

        if (pageSelect) {
            pageSelect.innerHTML = '';
            for (let i = 1; i <= (totalPages || 1); i++) {
                const option = document.createElement('option');
                option.value = i;
                option.textContent = `${i}`;
                if (i === currentPage) option.selected = true;
                pageSelect.appendChild(option);
            }
        }
    },

    updateWelcomeMessage: function (totalFiles, totalPages, currentPath) {
        const showDiv = document.getElementById('showBar');
        const pathDisplay = currentPath || '/';

        showDiv.innerHTML = `
            <div class="welcome">
                <h2>📂 文件管理器</h2>
                <p class="subtitle">点击文件的「查看」按钮查看详情</p>
                <p class="subtitle-sm">支持图片、视频、音频预览</p>
                <div class="welcome-card">
                    <p>📁 共 ${totalFiles || 0} 个项目</p>
                    <p>📑 共 ${totalPages || 1} 页</p>
                    <p class="path">📌 ${pathDisplay}</p>
                </div>
                <p class="tip">💡 提示：← → 翻页 | 单击文件夹进入 | 双击文件预览</p>
            </div>
        `;
    },

    styleTableHeader: function () {
        const table = document.querySelector('table');
        if (table && !table.classList.contains('file-table')) {
            table.classList.add('file-table');
        }
    },

    // ============ 事件初始化 ============

    initEvents: function () {
        const bind = (id, fn) => {
            const el = document.getElementById(id);
            if (el) el.addEventListener('click', fn);
        };

        bind('pageLast', () => {
            if (typeof goToPage !== 'undefined') goToPage('prev');
        });
        bind('pageNext', () => {
            if (typeof goToPage !== 'undefined') goToPage('next');
        });
        bind('refresh', () => {
            if (typeof refreshFileList !== 'undefined') refreshFileList();
        });
        bind('pathLast', () => {
            if (typeof goUp !== 'undefined') goUp();
        });
        bind('exitBtn', () => {
            if (typeof get !== 'undefined' && get.exitServer) {
                get.exitServer();
            } else {
                alert('退出功能不可用');
            }
        });

        const pageSelect = document.getElementById('pageSelect');
        if (pageSelect) {
            pageSelect.addEventListener('change', function () {
                if (typeof renderPage !== 'undefined') {
                    renderPage(parseInt(this.value));
                }
            });
        }

        // 键盘快捷键
        document.addEventListener('keydown', function (e) {
            if (['INPUT', 'SELECT', 'TEXTAREA'].includes(e.target.tagName)) return;

            if (e.key === 'ArrowLeft') {
                document.getElementById('pageLast')?.click();
            } else if (e.key === 'ArrowRight') {
                document.getElementById('pageNext')?.click();
            } else if (e.key === 'Backspace') {
                e.preventDefault();
                document.getElementById('pathLast')?.click();
            } else if (e.key === 'Home') {
                e.preventDefault();
                if (typeof changeDirectory !== 'undefined') goUp();
            } else if ((e.key === 'r' || e.key === 'R') && !e.ctrlKey && !e.metaKey) {
                document.getElementById('refresh')?.click();
            }
        });
    },

    init: function () {
        this.styleTableHeader();
        this.initEvents();
    }
};