import base64

with open('frontend/index.html', 'r', encoding='utf-8') as f:
    index_html = f.read()
with open('frontend/admin.html', 'r', encoding='utf-8') as f:
    admin_html = f.read()
with open('server_pure.js', 'r', encoding='utf-8') as f:
    server_pure = f.read()

# Make sure assets directory exists and write server_pure, index.html, admin.html
# We encode the 3 files cleanly

