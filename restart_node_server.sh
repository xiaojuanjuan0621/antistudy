cd ~/antistudy
git pull origin main
npm install
pm2 delete antistudy 2>/dev/null || true
pm2 start server_pure.js --name antistudy
pm2 save
echo "✓ 服务已切换为原生 Node 纯净引擎启动完毕！"
