const get = {
    // 获取文件列表
    "fileList": function () {
        return fetch('/api/list')
            .then(response => {
                if (!response.ok) {
                    throw new Error('网络响应失败');
                }
                return response.json();
            })
            .then(data => {
                console.log('当前路径:', data.path);
                console.log('文件列表:', data.files);
                return data;
            })
            .catch(error => {
                console.error('获取文件列表失败:', error);
                return { path: '', files: [] };
            });
    },
    // 获取文件内容（文本）
    "fileContent": function (filename) {
        return fetch(`/api/file/?fn=${encodeURIComponent(filename)}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`文件 ${filename} 获取失败 (${response.status})`);
                }
                return response.text();
            })
            .then(content => {
                console.log(`文件 ${filename} 内容:`, content);
                return content;
            })
            .catch(error => {
                console.error('获取文件内容失败:', error);
                return null;
            });
    },
    // 获取文件URL（用于预览图片/音频/视频）
    "getFileUrl": function (filename) {
        return `/api/file/?fn=${encodeURIComponent(filename)}`;
    },
    // 删除文件
    "deleteFile": function (filename) {
        if (!confirm(`确定要删除文件 "${filename}" 吗？`)) {
            return Promise.resolve(null);   // 用户取消，不抛异常
        }

        return fetch(`/api/delete/${encodeURIComponent(filename)}`, {
            method: 'DELETE'
        })
            .then(response => response.json())
            .then(result => {
                console.log('删除结果:', result);
                if (result && result.status === 's') {
                    return result;
                }
                // 后端返回业务错误
                throw new Error((result && result.msg) || '删除失败');
            })
            .catch(error => {
                console.error('删除文件失败:', error);
                alert(`删除失败: ${error.message}`);
                return null;
            });
    },
    // 切换目录
    "changeDirectory": function (dirname) {
        return fetch(`/api/cd/?path=${encodeURIComponent(dirname)}`, {
            method: 'POST'
        })
            .then(response => response.json())
            .then(result => {
                console.log('切换目录结果:', result);
                if (result && result.status === 's') {
                    return result;
                }
                throw new Error((result && result.msg) || '切换目录失败');
            })
            .catch(error => {
                console.error('切换目录失败:', error);
                alert(`切换目录失败: ${error.message}`);
                return null;
            });
    },
    // 创建目录
    "makeDirectory": function (dirname) {
        if (!dirname || dirname.trim() === '') {
            alert('请输入目录名称');
            return Promise.resolve(null);   // 用户未输入，不抛异常
        }

        return fetch(`/api/mkdir/${encodeURIComponent(dirname.trim())}`, {
            method: 'POST'
        })
            .then(response => response.json())
            .then(result => {
                console.log('创建目录结果:', result);
                if (result && result.status === 's') {
                    alert(result.msg || '目录创建成功');
                    return result;
                }
                throw new Error((result && result.msg) || '创建目录失败');
            })
            .catch(error => {
                console.error('创建目录失败:', error);
                alert(`创建目录失败: ${error.message}`);
                return null;
            });
    },
    // 关闭服务器
    "exitServer": function () {
        if (!confirm('确定要关闭服务器吗？')) {
            return Promise.resolve(null);   // 用户取消，不抛异常
        }

        return fetch('/api/exit', {
            method: 'POST'
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error(`关闭服务器失败 (${response.status})`);
                }
                return response.text();
            })
            .then(result => {
                console.log('服务器关闭:', result);
                alert('服务器正在关闭...');
                return result;
            })
            .catch(error => {
                console.error('关闭服务器失败:', error);
                alert(`关闭服务器失败: ${error.message}`);
                return null;
            });
    }
};

// 导出模块（如果使用模块系统）
// export default get;