cd ~/antistudy
git pull origin main
pm2 delete all 2>/dev/null || true
node app.js
