cd ~/antistudy
git pull origin main
pm2 delete all || true
pm2 start app.js --name antistudy
pm2 save
curl -I http://127.0.0.1:3300/index.html
