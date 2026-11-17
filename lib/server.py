import os, sys
from flask import Flask
from lib.util import *
from lib.api import setApi

#config = loadConfig()
#app = Flask(__name__)
#app.path = os.path.abspath(config.get("path", os.getcwd()))

class session:
    def __init__(self,name,password) -> None:
        self.name = name
        self.password = password
        self.passport = ""
    def login(self,password:str):
        if password == self.password:
            self.passport = genPassport()
            return True
        else:
            return False

class App:
    def __init__(self) -> None:
        self.config = loadConfig()
        self.path:str = os.path.abspath(self.config.get("path", os.getcwd()))
        self.rootPath:str = self.path
        self.fApp = Flask(__name__)
        self.port = int(self.config.get("port", 5000))
        self.host = self.config.get("host", "0.0.0.0")
        setApi(self)

    def run(self):
        self.fApp.run(debug=True, port=self.port, host=self.host)

if __name__ == '__main__':
    app = App()
    app.run()