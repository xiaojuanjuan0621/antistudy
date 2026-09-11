with open('frontend/index.html', 'r', encoding='utf-8') as f:
    index_html = f.read()
with open('frontend/admin.html', 'r', encoding='utf-8') as f:
    admin_html = f.read()
with open('server_pure.js', 'r', encoding='utf-8') as f:
    server_pure = f.read()

import base64
b_index = base64.b64encode(index_html.encode('utf-8')).decode('utf-8')
b_admin = base64.b64encode(admin_html.encode('utf-8')).decode('utf-8')
b_server = base64.b64encode(server_pure.encode('utf-8')).decode('utf-8')

with open('update_server_cmd.sh', 'w', encoding='utf-8') as f:
    f.write(f'''cd ~/antistudy || mkdir -p ~/antistudy && cd ~/antistudy
mkdir -p frontend uploads/assets data

cat << 'EOF_SERVER' | base64 -d > server_pure.js
{b_server}
EOF_SERVER

cat << 'EOF_INDEX' | base64 -d > frontend/index.html
{b_index}
EOF_INDEX

cat << 'EOF_ADMIN' | base64 -d > frontend/admin.html
{b_admin}
EOF_ADMIN

pm2 delete antistudy 2>/dev/null || true
pm2 start server_pure.js --name antistudy
pm2 save
echo "🎉 恭喜！服务器已成功完成一键更新并重启！"
''')

print("update_server_cmd.sh written, size:", len(open('update_server_cmd.sh').read()))
