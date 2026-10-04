from flask import Flask, send_file, request
from lib.util import *
import os

def setApi(app):
    fApp = app.fApp

    @fApp.route('/')
    def index():
        f = open('index.html', 'r', encoding='utf-8')
        content = f.read()
        f.close()
        return content

    @fApp.route('/src/<path:filename>')
    def src(filename):
        try:
            f = open(os.path.join('src', filename), 'r', encoding='utf-8')
            content = f.read()
            f.close()
            return content
        except FileNotFoundError:
            return 'File not found', 404

    @fApp.route('/res/<path:filename>')
    def res(filename):
        try:
            f = open(os.path.join('res', filename), 'rb')
            content = f.read()
        except FileNotFoundError:
            return 'File not found', 404
        f.close()
        return content

    @fApp.route('/api/list')
    def data():
        list_of_files = os.listdir(app.path)
        row = []
        for i in list_of_files:
            f = os.path.join(app.path, i)
            if os.path.isfile(f):
                row.append({"type":"file","name":i,"size":os.path.getsize(f)})
            elif os.path.isdir(f):
                row.append({"type":"dir","name":i})
        return {'path': app.path, 'files': row}

    @fApp.route('/api/file/',methods=['GET','POST'])
    def file():
        filename = request.args.get("fn",request.args.get("filename"))
        if filename is None:
            return 'Invalid filename',403
        filepath = os.path.join(app.path, filename)
        if ".." in filename or filename.startswith("/"):
            return 'Invalid filename',403
        if os.path.isfile(filepath):
            if os.path.splitext(filename)[1] in fe:
                f = open(filepath, 'r', encoding='utf-8')
                content = f.read()
                f.close()
                return content
            elif os.path.splitext(filename)[1] in fme:
                return send_file(filepath)
            else:
                return 'File type not allowed',403
        else:
            return 'File not found',404

    @fApp.route('/api/delete/<filename>', methods=['DELETE'])
    def delete_file(filename):
        filepath = os.path.join(app.path, filename)
        if ".." in filename or filename.startswith("/"):
            return 'Invalid filename'
        if os.path.isfile(filepath):
            os.remove(filepath)
            return 'File deleted'
        else:
            return 'File not found'
    
    @fApp.route('/api/cd/', methods=['GET','POST'])
    def change_directory():
        dirname = request.args.get('path')
        if dirname is None:
            return
        if "/" in dirname or "\\" in dirname:
            return 'Invalid directory name',403
        if dirname == "..":
            new_path = os.path.dirname(app.path)
        else:
            new_path = os.path.join(app.path, dirname)
        a = os.path.abspath(app.config['path'])
        if os.path.isdir(new_path) and (a in os.path.abspath(new_path) or os.path.abspath(new_path) in a):
            app.path = new_path
            return f'Changed directory to {app.path}'
        else:
            return 'Directory not found',404
    
    @fApp.route('/api/mkdir/<dirname>', methods=['POST'])
    def make_directory(dirname):
        if "/" in dirname or "\\" in dirname:
            return 'Invalid directory name',403
        new_dir_path = os.path.join(app.path, dirname)
        if not os.path.exists(new_dir_path):
            os.makedirs(new_dir_path)
            return f'Directory {dirname} created'
        else:
            return 'Directory already exists', 400
    
    @fApp.route('/api/exit', methods=['POST'])
    def exit_server():
    #os.kill(os.getpid(), signal.SIGTERM)
        return 'Server shutting down...'
