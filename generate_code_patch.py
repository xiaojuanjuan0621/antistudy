import tarfile
import base64
import os

with tarfile.open('code_patch.tar.gz', 'w:gz') as tar:
    tar.add('frontend', arcname='frontend')
    tar.add('server_pure.js', arcname='server_pure.js')

with open('code_patch.tar.gz', 'rb') as f:
    b64_str = base64.b64encode(f.read()).decode('utf-8')

print(f"Code only base64 length: {len(b64_str)}")
with open('code_b64.txt', 'w') as f:
    f.write(b64_str)
