with open('frontend/index.html') as f: idx = f.read()
with open('frontend/admin.html') as f: adm = f.read()
with open('server_pure.js') as f: srv = f.read()
import gzip, base64, io, tarfile

buf = io.BytesIO()
with tarfile.open(fileobj=buf, mode='w:gz') as tar:
    for name, content in [('frontend/index.html', idx), ('frontend/admin.html', adm), ('server_pure.js', srv)]:
        b = content.encode('utf-8')
        ti = tarfile.TarInfo(name=name)
        ti.size = len(b)
        tar.addfile(ti, io.BytesIO(b))

b64 = base64.b64encode(buf.getvalue()).decode('utf-8')

cmd = "cd ~/antistudy || (mkdir -p ~/antistudy && cd ~/antistudy)\n"
cmd += "cat << 'EOF_BUNDLE' | base64 -d | tar -xz\n"
cmd += b64 + "\n"
cmd += "EOF_BUNDLE\n"
cmd += "pm2 delete antistudy 2>/dev/null || true\n"
cmd += "pm2 start server_pure.js --name antistudy\n"
cmd += "pm2 save\n"
cmd += 'echo "🎉 恭喜！服务器已秒级成功更新最新版！"\n'

with open('fast_update.sh', 'w') as f:
    f.write(cmd)

print("fast_update.sh generated successfully! Size:", len(cmd))
