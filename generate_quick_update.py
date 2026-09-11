import tarfile
import base64
import os

with tarfile.open('quick_patch.tar.gz', 'w:gz') as tar:
    tar.add('frontend', arcname='frontend')
    tar.add('server_pure.js', arcname='server_pure.js')
    tar.add('uploads/assets', arcname='uploads/assets')

with open('quick_patch.tar.gz', 'rb') as f:
    b64_str = base64.b64encode(f.read()).decode('utf-8')

# Split into chunks of 3000 chars for terminal pasting
chunk_size = 3000
chunks = [b64_str[i:i+chunk_size] for i in range(0, len(b64_str), chunk_size)]
print(f"Total base64 length: {len(b64_str)}, chunks count: {len(chunks)}")
