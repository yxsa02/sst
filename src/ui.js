// src/ui.js - UI 操作模块

const uiUtil = {
    // 显示文件详情（右侧面板）
    showFileDetail: function(item) {
        if (item.isDir) {
            // 如果是文件夹，调用切换目录
            if (typeof changeDirectory !== 'undefined') {
                changeDirectory(item.name);
            }
            return;
        }
        
        const showDiv = document.getElementById('showBar');
        const fileType = this.getFileType(item.name);
        
        // 如果是图片、视频或音频，直接预览
        if (fileType === 'image' || fileType === 'video' || fileType === 'audio') {
            this.displayMediaPreview(item);
            return;
        }
        
        // 文本文件显示内容
        showDiv.innerHTML = `
            <div style="padding: 15px; color: white; height: 100%; display: flex; flex-direction: column; justify-content: center; align-items: center;">
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
    displayMediaPreview: function(item) {
        const showDiv = document.getElementById('showBar');
        const fileType = this.getFileType(item.name);
        const fileUrl = `/api/file/?fn=${encodeURIComponent(item.name)}`;
        
        let mediaElement = '';
        let mediaStyle = 'max-width: 100%; max-height: 60vh; border-radius: 8px;';
        
        if (fileType === 'image') {
            mediaElement = `
                <img src="${fileUrl}" alt="${item.name}" style="${mediaStyle} object-fit: contain;">
            `;
        } else if (fileType === 'video') {
            mediaElement = `
                <video controls style="${mediaStyle} max-height: 60vh;">
                    <source src="${fileUrl}">
                    您的浏览器不支持视频播放
                </video>
            `;
        } else if (fileType === 'audio') {
            mediaElement = `
                <audio controls style="width: 100%; max-width: 400px;">
                    <source src="${fileUrl}">
                    您的浏览器不支持音频播放
                </audio>
            `;
        }
        
        showDiv.innerHTML = `
            <div style="padding: 15px; color: white; height: 100%; overflow: auto; display: flex; flex-direction: column;">
                <h3 style="margin-top: 0; flex-shrink: 0; font-size: 16px; word-break: break-all;">${this.getFileIcon(item.name)} ${item.name}</h3>
                <div style="display: flex; gap: 10px; margin-bottom: 10px; flex-wrap: wrap; flex-shrink: 0;">
                    <span style="background: rgba(255,255,255,0.2); padding: 4px 10px; border-radius: 4px; font-size: 13px;">
                        📊 ${item.size || '0 B'}
                    </span>
                    <span style="background: rgba(255,255,255,0.2); padding: 4px 10px; border-radius: 4px; font-size: 13px;">
                        🏷️ ${fileType}
                    </span>
                </div>
                <div style="background: rgba(0,0,0,0.3); padding: 20px; border-radius: 8px; flex: 1; display: flex; align-items: center; justify-content: center; min-height: 150px; overflow: hidden;">
                    ${mediaElement}
                </div>
                <div style="margin-top: 10px; display: flex; gap: 10px; flex-shrink: 0; flex-wrap: wrap;">
                    <button onclick="uiUtil.downloadFileFromAPI('${item.name}')" style="padding: 6px 16px; cursor: pointer; background: #4CAF50; color: white; border: none; border-radius: 4px; font-size: 13px;">
                        ⬇️ 下载
                    </button>
                    <button onclick="uiUtil.closeFileDetail()" style="padding: 6px 16px; cursor: pointer; background: #f44336; color: white; border: none; border-radius: 4px; font-size: 13px;">
                        ✕ 关闭
                    </button>
                </div>
            </div>
        `;
    },

    // 显示文件内容（文本文件）
    displayFileContent: function(item, content) {
        const showDiv = document.getElementById('showBar');
        
        // 截断过长内容
        let displayContent = content;
        if (content && content.length > 50000) {
            displayContent = content.substring(0, 50000) + '\n\n... (内容过长，已截断)';
        }
        
        showDiv.innerHTML = `
            <div style="padding: 15px; color: white; height: 100%; overflow: auto; display: flex; flex-direction: column;">
                <h3 style="margin-top: 0; flex-shrink: 0; font-size: 16px; word-break: break-all;">${this.getFileIcon(item.name)} ${item.name}</h3>
                <div style="display: flex; gap: 10px; margin-bottom: 10px; flex-wrap: wrap; flex-shrink: 0;">
                    <span style="background: rgba(255,255,255,0.2); padding: 4px 10px; border-radius: 4px; font-size: 13px;">
                        📊 ${item.size || '0 B'}
                    </span>
                    <span style="background: rgba(255,255,255,0.2); padding: 4px 10px; border-radius: 4px; font-size: 13px;">
                        📄 文本文件
                    </span>
                </div>
                <div style="background: rgba(0,0,0,0.3); padding: 10px; border-radius: 4px; flex: 1; overflow: auto; min-height: 0;">
                    <pre style="margin: 0; white-space: pre-wrap; word-wrap: break-word; font-size: 13px; color: #e0e0e0; font-family: 'Courier New', monospace;">${this.escapeHtml(displayContent)}</pre>
                </div>
                <div style="margin-top: 10px; display: flex; gap: 10px; flex-shrink: 0; flex-wrap: wrap;">
                    <button onclick="uiUtil.downloadFileFromAPI('${item.name}')" style="padding: 6px 16px; cursor: pointer; background: #4CAF50; color: white; border: none; border-radius: 4px; font-size: 13px;">
                        ⬇️ 下载
                    </button>
                    <button onclick="uiUtil.closeFileDetail()" style="padding: 6px 16px; cursor: pointer; background: #f44336; color: white; border: none; border-radius: 4px; font-size: 13px;">
                        ✕ 关闭
                    </button>
                </div>
            </div>
        `;
    },

    // 显示文件信息（无法预览的文件）
    displayFileInfo: function(item) {
        const showDiv = document.getElementById('showBar');
        const fileType = this.getFileType(item.name);
        
        showDiv.innerHTML = `
            <div style="padding: 20px; color: white; height: 100%; overflow: auto; display: flex; flex-direction: column;">
                <h3 style="margin-top: 0; font-size: 16px; word-break: break-all;">${this.getFileIcon(item.name)} 文件信息</h3>
                <div style="background: rgba(255,255,255,0.1); padding: 15px; border-radius: 8px; margin-top: 10px; flex: 1;">
                    <p style="margin: 8px 0;"><strong>文件名：</strong> ${item.name}</p>
                    <p style="margin: 8px 0;"><strong>大小：</strong> ${item.size || '0 B'}</p>
                    <p style="margin: 8px 0;"><strong>类型：</strong> ${fileType}</p>
                    <p style="margin: 8px 0;"><strong>路径：</strong> ${typeof currentPath !== 'undefined' ? currentPath : '/'}</p>
                </div>
                <div style="margin-top: 15px; display: flex; gap: 10px; flex-shrink: 0; flex-wrap: wrap;">
                    <button onclick="uiUtil.downloadFileFromAPI('${item.name}')" style="padding: 6px 16px; cursor: pointer; background: #4CAF50; color: white; border: none; border-radius: 4px; font-size: 13px;">
                        ⬇️ 下载
                    </button>
                    <button onclick="uiUtil.closeFileDetail()" style="padding: 6px 16px; cursor: pointer; background: #f44336; color: white; border: none; border-radius: 4px; font-size: 13px;">
                        ✕ 关闭
                    </button>
                </div>
            </div>
        `;
    },

    // 关闭文件详情
    closeFileDetail: function() {
        if (typeof updateWelcomeMessage !== 'undefined') {
            updateWelcomeMessage();
        } else {
            const showDiv = document.getElementById('showBar');
            showDiv.innerHTML = `
                <div style="padding: 30px; color: white; text-align: center; height: 100%; display: flex; flex-direction: column; justify-content: center;">
                    <h2 style="font-size: 24px;">📂 文件管理器</h2>
                    <p style="margin-top: 15px; font-size: 14px; opacity: 0.8;">点击文件的「查看」按钮查看详情</p>
                </div>
            `;
        }
    },

    // 下载文件
    downloadFileFromAPI: function(filename) {
        const fileUrl = `/api/file/?fn=${encodeURIComponent(filename)}`;
        const a = document.createElement('a');
        a.href = fileUrl;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    },

    // ============ 文件类型判断 ============

    // 判断文件类型
    getFileType: function(filename) {
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

    // 获取文件图标
    getFileIcon: function(filename) {
        if (!filename) return '📄';
        const type = this.getFileType(filename);
        const icons = {
            'image': '🖼️',
            'video': '🎬',
            'audio': '🎵',
            'text': '💻',
            'document': '📋',
            'archive': '📦',
            'other': '📄'
        };
        return icons[type] || '📄';
    },

    // HTML 转义
    escapeHtml: function(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    },

    // ============ 表格渲染 ============

    // 生成操作按钮
    createActionButtons: function(item) {
        const container = document.createElement('div');
        container.style.display = 'flex';
        container.style.gap = '4px';
        container.style.justifyContent = 'center';
        container.style.flexWrap = 'wrap';

        if (item.isDir) {
            // 文件夹：只有"打开"按钮
            const openBtn = document.createElement('button');
            openBtn.textContent = '📂 打开';
            openBtn.style.padding = '3px 10px';
            openBtn.style.cursor = 'pointer';
            openBtn.style.backgroundColor = '#FF9800';
            openBtn.style.color = 'white';
            openBtn.style.border = 'none';
            openBtn.style.borderRadius = '3px';
            openBtn.style.fontSize = '12px';
            openBtn.onclick = function(e) {
                e.stopPropagation();
                if (typeof changeDirectory !== 'undefined') {
                    changeDirectory(item.name);
                }
            };
            container.appendChild(openBtn);
            return container;
        }

        // 文件：查看、下载、删除
        const viewBtn = document.createElement('button');
        viewBtn.textContent = '查看';
        viewBtn.style.padding = '3px 10px';
        viewBtn.style.cursor = 'pointer';
        viewBtn.style.backgroundColor = '#2196F3';
        viewBtn.style.color = 'white';
        viewBtn.style.border = 'none';
        viewBtn.style.borderRadius = '3px';
        viewBtn.style.fontSize = '12px';
        viewBtn.onclick = function(e) {
            e.stopPropagation();
            uiUtil.showFileDetail(item);
        };

        const downloadBtn = document.createElement('button');
        downloadBtn.textContent = '下载';
        downloadBtn.style.padding = '3px 10px';
        downloadBtn.style.cursor = 'pointer';
        downloadBtn.style.backgroundColor = '#4CAF50';
        downloadBtn.style.color = 'white';
        downloadBtn.style.border = 'none';
        downloadBtn.style.borderRadius = '3px';
        downloadBtn.style.fontSize = '12px';
        downloadBtn.onclick = function(e) {
            e.stopPropagation();
            uiUtil.downloadFileFromAPI(item.name);
        };

        const deleteBtn = document.createElement('button');
        deleteBtn.textContent = '删除';
        deleteBtn.style.padding = '3px 10px';
        deleteBtn.style.cursor = 'pointer';
        deleteBtn.style.color = '#d32f2f';
        deleteBtn.style.border = '1px solid #d32f2f';
        deleteBtn.style.borderRadius = '3px';
        deleteBtn.style.backgroundColor = 'white';
        deleteBtn.style.fontSize = '12px';
        deleteBtn.onclick = function(e) {
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
    renderTable: function(data, currentPage, itemsPerPage) {
        const tbody = document.querySelector('table tbody');
        if (!tbody) return;

        tbody.innerHTML = '';

        if (!data || data.length === 0) {
            const tr = document.createElement('tr');
            const td = document.createElement('td');
            td.colSpan = 4;
            td.textContent = '📭 暂无文件或文件夹';
            td.style.textAlign = 'center';
            td.style.padding = '40px';
            td.style.color = '#999';
            td.style.fontSize = '16px';
            tr.appendChild(td);
            tbody.appendChild(tr);
            return;
        }

        data.forEach((item, index) => {
            const tr = document.createElement('tr');
            tr.dataset.id = item.id;
            tr.style.transition = 'background-color 0.2s';
            tr.style.cursor = item.isDir ? 'pointer' : 'default';
            
            // 文件夹特殊样式
            if (item.isDir) {
                tr.style.backgroundColor = '#e3f2fd';
            }
            
            // 序号
            const indexTd = document.createElement('td');
            indexTd.textContent = (currentPage - 1) * itemsPerPage + index + 1;
            indexTd.style.textAlign = 'center';
            indexTd.style.padding = '6px 4px';
            indexTd.style.border = '1px solid #ddd';
            indexTd.style.fontSize = '13px';
            
            // 文件名
            const nameTd = document.createElement('td');
            if (item.isDir) {
                nameTd.textContent = `📁 ${item.name}`;
                nameTd.style.fontWeight = 'bold';
                nameTd.style.color = '#1565C0';
            } else {
                nameTd.textContent = `${uiUtil.getFileIcon(item.name)} ${item.name}`;
            }
            nameTd.style.padding = '6px 4px';
            nameTd.style.border = '1px solid #ddd';
            nameTd.style.fontSize = '13px';
            nameTd.style.wordBreak = 'break-all';
            
            // 大小
            const sizeTd = document.createElement('td');
            if (item.isDir) {
                sizeTd.textContent = '📁 文件夹';
                sizeTd.style.color = '#666';
            } else {
                sizeTd.textContent = item.size || '0 B';
            }
            sizeTd.style.textAlign = 'center';
            sizeTd.style.padding = '6px 4px';
            sizeTd.style.border = '1px solid #ddd';
            sizeTd.style.fontSize = '13px';
            
            // 操作按钮
            const actionTd = document.createElement('td');
            actionTd.style.textAlign = 'center';
            actionTd.style.padding = '6px 4px';
            actionTd.style.border = '1px solid #ddd';
            actionTd.appendChild(uiUtil.createActionButtons(item));

            tr.appendChild(indexTd);
            tr.appendChild(nameTd);
            tr.appendChild(sizeTd);
            tr.appendChild(actionTd);

            // 鼠标悬停效果
            tr.onmouseover = function() {
                if (item.isDir) {
                    this.style.backgroundColor = '#bbdefb';
                } else {
                    this.style.backgroundColor = '#e8e8e8';
                }
            };
            tr.onmouseout = function() {
                if (item.isDir) {
                    this.style.backgroundColor = '#e3f2fd';
                } else {
                    this.style.backgroundColor = '';
                }
            };

            // 单击进入文件夹
            if (item.isDir) {
                tr.onclick = function(e) {
                    if (e.target.tagName === 'BUTTON') return;
                    if (typeof changeDirectory !== 'undefined') {
                        changeDirectory(item.name);
                    }
                };
            }

            // 双击打开文件
            tr.ondblclick = function() {
                if (!item.isDir) {
                    uiUtil.showFileDetail(item);
                }
            };

            tbody.appendChild(tr);
        });
    },

    // ============ 页面更新 ============

    // 更新路径显示
    updatePathDisplay: function(path) {
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

    // 更新统计信息
    updateStats: function(totalFiles, totalPages, currentPage) {
        const pageCountEl = document.getElementById('pageCount');
        const fileCountEl = document.getElementById('fileCount');
        const pageSelect = document.getElementById('pageSelect');
        
        if (pageCountEl) {
            pageCountEl.textContent = totalPages || 1;
        }
        if (fileCountEl) {
            fileCountEl.textContent = totalFiles || 0;
        }
        
        // 更新页码选择器
        if (pageSelect) {
            pageSelect.innerHTML = '';
            for (let i = 1; i <= (totalPages || 1); i++) {
                const option = document.createElement('option');
                option.value = i;
                option.textContent = `${i}`;
                if (i === currentPage) {
                    option.selected = true;
                }
                pageSelect.appendChild(option);
            }
        }
    },

    // 更新欢迎信息
    updateWelcomeMessage: function(totalFiles, totalPages, currentPath) {
        const showDiv = document.getElementById('showBar');
        const pathDisplay = currentPath || '/';
        
        showDiv.innerHTML = `
            <div style="padding: 20px; color: white; text-align: center; height: 100%; display: flex; flex-direction: column; justify-content: center; align-items: center;">
                <h2 style="font-size: 24px; margin: 0;">📂 文件管理器</h2>
                <p style="margin-top: 15px; font-size: 14px; opacity: 0.9;">点击文件的「查看」按钮查看详情</p>
                <p style="margin-top: 5px; font-size: 13px; opacity: 0.7;">支持图片、视频、音频预览</p>
                <div style="margin-top: 20px; background: rgba(255,255,255,0.1); padding: 12px 20px; border-radius: 8px; max-width: 280px; width: 100%;">
                    <p style="margin: 4px 0; font-size: 13px;">📁 共 ${totalFiles || 0} 个项目</p>
                    <p style="margin: 4px 0; font-size: 13px;">📑 共 ${totalPages || 1} 页</p>
                    <p style="margin: 4px 0; font-size: 12px; opacity: 0.7; word-break: break-all;">📌 ${pathDisplay}</p>
                </div>
                <p style="margin-top: 20px; font-size: 11px; opacity: 0.5;">
                    💡 提示：← → 翻页 | 单击文件夹进入 | 双击文件预览
                </p>
            </div>
        `;
    },

    // 表头样式
    styleTableHeader: function() {
        const thead = document.querySelector('table thead');
        if (thead) {
            thead.style.backgroundColor = '#4CAF50';
            thead.style.color = 'white';
            const cells = thead.querySelectorAll('td');
            cells.forEach(td => {
                td.style.padding = '8px 6px';
                td.style.fontWeight = 'bold';
                td.style.border = '1px solid #388E3C';
                td.style.textAlign = 'center';
                td.style.fontSize = '14px';
            });
        }
    },

    // ============ 事件初始化 ============

    // 初始化事件监听
    initEvents: function() {
        // 上一页
        const pageLastBtn = document.getElementById('pageLast');
        if (pageLastBtn) {
            pageLastBtn.addEventListener('click', function() {
                if (typeof goToPage !== 'undefined') {
                    goToPage('prev');
                }
            });
        }

        // 下一页
        const pageNextBtn = document.getElementById('pageNext');
        if (pageNextBtn) {
            pageNextBtn.addEventListener('click', function() {
                if (typeof goToPage !== 'undefined') {
                    goToPage('next');
                }
            });
        }

        // 页码选择器
        const pageSelect = document.getElementById('pageSelect');
        if (pageSelect) {
            pageSelect.addEventListener('change', function() {
                if (typeof renderPage !== 'undefined') {
                    renderPage(parseInt(this.value));
                }
            });
        }

        // 刷新按钮
        const refreshBtn = document.getElementById('refresh');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', function() {
                if (typeof refreshFileList !== 'undefined') {
                    refreshFileList();
                }
            });
        }

        // 上一级按钮
        const pathLastBtn = document.getElementById('pathLast');
        if (pathLastBtn) {
            pathLastBtn.addEventListener('click', function() {
                if (typeof goUp !== 'undefined') {
                    goUp();
                }
            });
        }

        // 退出按钮
        const exitBtn = document.getElementById('exitBtn');
        if (exitBtn) {
            exitBtn.addEventListener('click', function() {
                if (typeof get !== 'undefined' && get.exitServer) {
                    get.exitServer();
                } else {
                    alert('退出功能不可用');
                }
            });
        }

        // 键盘快捷键
        document.addEventListener('keydown', function(e) {
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT' || e.target.tagName === 'TEXTAREA') return;
            
            if (e.key === 'ArrowLeft') {
                const btn = document.getElementById('pageLast');
                if (btn) btn.click();
            } else if (e.key === 'ArrowRight') {
                const btn = document.getElementById('pageNext');
                if (btn) btn.click();
            } else if (e.key === 'Backspace') {
                e.preventDefault();
                const upBtn = document.getElementById('pathLast');
                if (upBtn) upBtn.click();
            } else if (e.key === 'Home') {
                e.preventDefault();
                if (typeof changeDirectory !== 'undefined') {
                    changeDirectory('/');
                }
            } else if (e.key === 'r' || e.key === 'R') {
                if (!e.ctrlKey && !e.metaKey) {
                    const refreshBtn = document.getElementById('refresh');
                    if (refreshBtn) refreshBtn.click();
                }
            }
        });
    },

    // 页面初始化
    init: function() {
        const table = document.querySelector('table');
        if (table) {
            table.style.width = '100%';
            table.style.borderCollapse = 'collapse';
            table.style.marginTop = '5px';
        }

        const leftBar = document.getElementById('leftBar');
        if (leftBar) {
            leftBar.style.padding = '8px';
            leftBar.style.boxSizing = 'border-box';
            leftBar.style.display = 'flex';
            leftBar.style.flexDirection = 'column';
        }

        const fileList = document.getElementById('fileList');
        if (fileList) {
            fileList.style.flex = '1';
            fileList.style.overflow = 'auto';
        }

        this.styleTableHeader();
        this.initEvents();
    }
};