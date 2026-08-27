import subprocess, os

def check_ffmpeg():
    try:
        subprocess.run(["ffmpeg", "-version"], check=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
        return True
    except (subprocess.CalledProcessError, FileNotFoundError):
        return False

def read_todo():
    os.makedirs("did", exist_ok=True)
    try:
        list = os.listdir("todo")
        return list
    except FileNotFoundError:
        os.makedirs("todo", exist_ok=True)
        return []

def read_config():
    try:
        with open("config.txt", "r") as f:
            config = {}
            for i in f.read().split("\n"):
                if i[0] == "#":
                    continue
                key, value = i.split("=", 1)
                config[key] = value
            return config
    except FileNotFoundError:
        with open("config.txt", "w") as f:
            f.write("")
        return ""

if __name__ == "__main__":
    print(check_ffmpeg())
    print(read_todo())
    print(read_config())