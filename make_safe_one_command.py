import gzip, base64, io, tarfile

with open('frontend/index.html') as f: idx = f.read()
with open('frontend/admin.html') as f: adm = f.read()
with open('server_pure.js') as f: srv = f.read()

buf = io.BytesIO()
with tarfile.open(fileobj=buf, mode='w:gz') as tar:
    for name, content in [('frontend/index.html', idx), ('frontend/admin.html', adm), ('server_pure.js', srv)]:
        b = content.encode('utf-8')
        ti = tarfile.TarInfo(name=name)
        ti.size = len(b)
        tar.addfile(ti, io.BytesIO(b))

b64 = base64.b64encode(buf.getvalue()).decode('utf-8')

# Let's create an installation script that creates a file and directly extracts it
script_content = f"""#!/bin/bash
cd ~/antistudy || (mkdir -p ~/antistudy && cd ~/antistudy)
mkdir -p frontend uploads/assets data

python3 -c "import base64, gzip, tarfile, io; data = base64.b64decode('{b64}'); tarfile.open(fileobj=io.BytesIO(data), mode='r:gz').extractall('.')" 2>/dev/null || (echo '{b64}' | base64 -d | tar -xz)

pm2 delete antistudy 2>/dev/null || true
pm2 start server_pure.js --name antistudy
pm2 save
echo '🎉 恭喜！服务器已秒级更新完毕！'
"""

with open('one_shot_update.sh', 'w') as f:
    f.write(script_content)

print("Script size:", len(script_content))
