from flask import Flask, send_file, request, send_from_directory, Request
from .util import *
import os
from .s import session
from typing import TYPE_CHECKING
if TYPE_CHECKING:
    import core

def RU(app:"core.App",req:Request) -> session|None:
    uid = req.cookies.get("uid")
    passport = req.cookies.get("passport")
    if uid is None or passport is None:
        return None
    u = app.sessions.get(uid)
    if u is None:
        return None
    if u.passport != passport:
        return None
    return u

def RP(s:session,p:str) -> str:
    if p[0] == "/":
        absP = os.path.join()


def setApi(app:"core.App"):
    fApp = app.fApp

    @fApp.route('/')
    def home():
        page = request.args.get("p","")
        if page == "":
            f = open('src\\app.html', 'r', encoding='utf-8')
            content = f.read()
            f.close()
        elif page == "login":
            f = open('src\\login.html', 'r', encoding='utf-8')
            content = f.read()
            f.close()
        elif page == "app":
            f = open('src\\app.html', 'r', encoding='utf-8')
            content = f.read()
            f.close()
        else:
            content = "Page Not Found",404
        return content

    @fApp.route('/src/<path:filename>')
    def src(filename):
        return send_from_directory('src', filename)

    @fApp.route('/res/<path:filename>')
    def res(filename):
        return send_from_directory('res', filename)

    @fApp.route('/api/u/register',methods=['POST'])
    def register():
        try:
            uid = request.json["id"]
            password = request.json["pwd"]
        except KeyError:
            return {"code":0,"msg":"ApiArgs"}
        if uid == "" or password == "":
            return {"code":0,"msg":"ApiArgs"}
        if uid in app.sessions:
            return {"code":0,"msg":"UserExists"}
        app.sessions[uid] = session(uid,password,app)
        return {"code":0}

    @fApp.route('/api/u/login',methods=['POST'])
    def login():
        try:
            uid = request.json["id"]
            password = request.json["pwd"]
        except KeyError:
            return {"code":0,"msg":"ApiArgs"}
        if uid == "" or password == "":
            return {"code":0,"msg":"ApiArgs"}
        u = app.sessions.get(uid)
        if u is None:
            return {"code":0,"msg":"UserNotExists"}
        passport = u.login(password)
        if passport is False:
            return {"code":0,"msg":"PasswordError"}
        resp = app.fApp.make_response({"code":0})
        resp.set_cookie("uid",uid)
        resp.set_cookie("passport",passport)
        return resp

    @fApp.route('/api/f/item')#,mothods=['GET','POST'])
    def f():
        u = RU(app,request)
        if u is None:
            return {"code":0,"msg":"NotLogin"}
        try:
            action = request.args["action"]
            name = request.args["name"]
            
        except KeyError:
            return {"code":0,"msg":"ApiArgs"}
        if action == "info":
            return {"code":""}
        elif action == "rename":
            return {"code":""}
        elif action == "remove":
            return {"code":""}
        elif action == "copy":
            return {"code":""}
        else:
            return {"code":0,"msg":"ApiArgs"}


        #没错我不会写了你先别管这里
        #os.kill(os.getpid(), signal.SIGTERM)
