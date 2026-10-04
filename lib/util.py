fe = ['.txt', '.md', '.py', '.json', '.csv', '.log', '.xml', '.html', '.js', '.css', '.ini', '.cfg', '.conf', '.bat', '.sh', '.yml', '.yaml']
fbe = ['.exe', '.dll', '.so', '.bin', '.dat', '.img', '.iso', '.zip', '.tar', '.gz', '.7z', '.rar']
fme = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.tiff', '.ico', '.svg', '.mp3', '.wav', '.ogg', '.flac', '.mp4', '.avi', '.mkv', '.mov']

def loadConfig():
    config = {}
    try:
        with open('config.ini', 'r', encoding='utf-8') as f:
            content = f.read()
            for line in content.split("\n"):
                # 跳过空行和注释行
                line = line.strip()
                if not line or line.startswith('#'):
                    continue
                if "=" in line:
                    key, value = line.split("=", 1)
                    config[key.strip()] = value.strip()
    except FileNotFoundError:
        print("Warning: config.ini not found, using empty config")
    except Exception as e:
        print(f"Error reading config: {e}")
    return config