import base64

with open('deploy_base64.txt', 'r') as f:
    b64_content = f.read().strip()

script = f"""#!/bin/bash
set -e
echo "🚀 正在部署知识冒险岛系统..."
cd ~/antistudy

cat << 'B64_EOF' | base64 -d > antistudy-deploy.tar.gz
{b64_content}
B64_EOF

tar -xzf antistudy-deploy.tar.gz
echo "✓ 代码已就绪，启动服务..."
npx pm2 delete antistudy 2>/dev/null || true
npx pm2 start backend/server.ts --name antistudy --interpreter npx --interpreter-args "ts-node"
npx pm2 save
npx pm2 startup

echo "🎉 知识冒险岛已成功启动！"
npx pm2 status
"""

with open('one_click_server.sh', 'w') as f:
    f.write(script)

print("Created one_click_server.sh successfully, size:", len(script))
