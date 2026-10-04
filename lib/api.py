from flask import Flask, send_file, request, send_from_directory
from lib.util import *
import os
from typing import TYPE_CHECKING
if TYPE_CHECKING:
    from .. import server

def setApi(app:"server.App"):
    fApp = app.fApp

    @fApp.route('/')
    def index():
        f = open('index.html', 'r', encoding='utf-8')
        content = f.read()
        f.close()
        return content

    @fApp.route('/src/<path:filename>')
    def src(filename):
        return send_from_directory('src', filename)

    @fApp.route('/res/<path:filename>')
    def res(filename):
        return send_from_directory('res', filename)

    @fApp.route('/api/list')
    def listDir():
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
            return {"status":"e","code":1,"msg":"Invalid filename"}
        filepath = safe_join(app.path, filename)
        if filepath is None:
            return {"status":"e","code":1,"msg":"Invalid filename"}
        if os.path.isfile(filepath):
            ext = os.path.splitext(filename)[1].lower()
            if ext in fe:
                return send_file(filepath)
            elif ext in fme:
                return send_file(filepath)
            else:
                return {"status":"e","code":2,"msg":"File type not allowed"}
        else:
            return {"status":"e","code":3,"msg":"File not found"}

    @fApp.route('/api/delete/<filename>', methods=['DELETE'])
    def delete_file(filename):
        filepath = safe_join(app.path, filename)
        if filepath is None:
            return {"status":"e","code":1,"msg":"Invalid filename"}
        if os.path.isfile(filepath):
            os.remove(filepath)
            return {"status":"s","code":0,"msg":"File deleted"}
        else:
            return {"status":"e","code":3,"msg":"File not found"}
    
    @fApp.route('/api/cd/', methods=['GET','POST'])
    def change_directory():
        dirname = request.args.get('path')
        if dirname is None:
            return {"status":"e","code":1,"msg":"Invalid directory name"}
        new_path = safe_join(app.rootPath, os.path.join(os.path.relpath(app.path, app.rootPath), dirname))
        if new_path is None or not os.path.isdir(new_path):
            return {"status":"e","code":3,"msg": "Directory not found"}, 404
        app.path = new_path
        return {"status":"s","code":0,"msg":f"Changed directory to {app.path}"}
        
    
    @fApp.route('/api/mkdir/<dirname>', methods=['POST'])
    def make_directory(dirname):
        new_dir_path = safe_join(app.path, dirname)
        if new_dir_path is None:
            return {"status":"e","code":1,"msg":"Invalid directory name"}
        if os.path.exists(new_dir_path):
            return {"status":"e","code":4,"msg":"Directory already exists"}
        os.makedirs(new_dir_path)
        return {"status":"s","code":0,"msg":f"Directory {dirname} created"}
    
    @fApp.route('/api/exit', methods=['POST'])
    def exit_server():
        #没错我不会写了你先别管这里
        #os.kill(os.getpid(), signal.SIGTERM)
        return 'Server shutting down...'
