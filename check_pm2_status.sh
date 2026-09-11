cd ~/antistudy
git pull origin main
pm2 delete all 2>/dev/null || true
pm2 start app.js --name antistudy
pm2 save
pm2 logs antistudy --lines 20 --nostream
