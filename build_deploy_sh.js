const fs = require('fs');
const path = require('path');

const tarBase64 = fs.readFileSync(path.join(__dirname, 'deploy_base64.txt'), 'utf8');

const scriptContent = `#!/bin/bash
set -e

echo "🚀 正在服务器自动生成完整项目代码并启动..."
cd ~/antistudy

# 解码完整工程压缩包
cat << 'EOF_B64' | base64 -d > antistudy-deploy.tar.gz
${tarBase64}
EOF_B64

tar -xzf antistudy-deploy.tar.gz

echo "✓ 项目解压完成，正在启动后台服务..."
npx pm2 delete antistudy 2>/dev/null || true
npx pm2 start backend/server.ts --name "antistudy" --interpreter npx --interpreter-args "ts-node"
npx pm2 save

echo "🎉 服务已成功在后台启动！"
npx pm2 list
`;

fs.writeFileSync(path.join(__dirname, 'server_full_deploy.sh'), scriptContent);
console.log('Generated server_full_deploy.sh successfully, size:', scriptContent.length);
