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

# Let's create an installation file on local web server so the cloud server can download it directly from us or via curl
with open('frontend/update_bundle.b64', 'w') as f:
    f.write(b64)

print("update_bundle.b64 written to frontend static folder, size:", len(b64))
