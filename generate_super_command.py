with open('frontend/update_bundle.b64') as f:
    b64 = f.read().strip()

# Let's write a python one liner that unpacks directly without needing temp files
cmd = f"""python3 -c "import base64, io, tarfile, os, subprocess; data=base64.b64decode('{b64}'); tarfile.open(fileobj=io.BytesIO(data), mode='r:gz').extractall('/root/antistudy'); os.system('pm2 restart antistudy || pm2 start /root/antistudy/server_pure.js --name antistudy'); print('🎉 恭喜！服务器公网版秒级更新成功！')" """

with open('cloud_one_liner.sh', 'w') as f:
    f.write(cmd)

print("One liner written, length:", len(cmd))
