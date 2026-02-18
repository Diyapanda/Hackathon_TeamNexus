import urllib.request
import sys
import json

try:
    with urllib.request.urlopen("http://127.0.0.1:8000/") as response:
        print(f"Status Code: {response.getcode()}")
        data = json.loads(response.read().decode())
        print(f"Response: {data}")
    sys.exit(0)
except Exception as e:
    print(f"Connection failed: {e}")
    sys.exit(1)
