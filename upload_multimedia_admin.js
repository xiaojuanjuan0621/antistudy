const https = require('https');
const fs = require('fs');

const adminHtml = fs.readFileSync('frontend/admin.html', 'utf8');

const req = https.request('https://dpaste.com/api/v2/', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded',
    'User-Agent': 'Node'
  }
}, (res) => {
  let body = '';
  res.on('data', d => body += d);
  res.on('end', () => console.log('NEW_ADMIN_URL:', body.trim()));
});

req.write('content=' + encodeURIComponent(adminHtml) + '&expiry_days=7');
req.end();
