import random
import string
from typing import TYPE_CHECKING
if TYPE_CHECKING:
    import core

class session:
    def __init__(self,name,password,app:"core.App") -> None:
        self.name = name
        self.password = password
        self.passport = ""
        self.path = app.rootPath
    def login(self,password:str):
        if password == self.password:
            self.passport = ''.join(random.choices(string.ascii_letters + string.digits, k=16))
            return self.passport
        else:
            return False

        
