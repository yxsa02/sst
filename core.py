import os, sys
from flask import Flask
from lib.util import *
from lib.Napi import setApi
from lib.s import session

#config = loadConfig()
#app = Flask(__name__)
#app.path = os.path.abspath(config.get("path", os.getcwd()))

class App:
    def __init__(self) -> None:
        self.config = loadConfig()
        self.sessions:dict[str,session] = {}
        #self.path:str = os.path.abspath(self.config.get("path", os.getcwd()))
        self.rootPath:str = os.path.abspath(self.config.get("path", os.getcwd()))
        self.fApp = Flask(__name__)
        self.port = int(self.config.get("port", 5000))
        self.host = self.config.get("host", "0.0.0.0")
        setApi(self)

    def run(self):
        self.fApp.run(debug=True, port=self.port, host=self.host)

def create_app() -> Flask:
    app = App()
    return app.fApp

if __name__ == '__main__':
    app = App()
    app.run()