const https = require('https');
const fs = require('fs');

const serverCode = fs.readFileSync('server_clean_fixed.js', 'utf8');

const req = https.request('https://dpaste.com/api/v2/', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded',
    'User-Agent': 'Node'
  }
}, (res) => {
  let body = '';
  res.on('data', d => body += d);
  res.on('end', () => console.log('SERVER_RAW_URL:', body.trim()));
});

req.write('content=' + encodeURIComponent(serverCode) + '&expiry_days=1');
req.end();
