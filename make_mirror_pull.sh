cd ~/antistudy
# 切换为国内高速镜像源拉取，彻底解决 Empty reply from server
git config remote.origin.url "https://gh-proxy.com/https://github.com/xiaojuanjuan0621/antistudy.git"
git pull
pm2 restart antistudy || pm2 start server_pure.js --name antistudy
pm2 save
echo "🎉 恭喜！服务器已通过镜像源极速更新并成功重启！"
