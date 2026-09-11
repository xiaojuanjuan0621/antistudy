import base64

with open('code_b64.txt') as f:
    b64 = f.read().strip()

# We can split code_patch.tar.gz (34KB) into 2 parts of ~17KB
part1 = b64[:18000]
part2 = b64[18000:]

with open('server_cmd_part1.txt', 'w') as f:
    f.write(f'''cd ~/antistudy
cat << 'EOF_P1' > patch.b64
{part1}
EOF_P1
''')

with open('server_cmd_part2.txt', 'w') as f:
    f.write(f'''cat << 'EOF_P2' >> patch.b64
{part2}
EOF_P2
base64 -d patch.b64 > patch.tar.gz
tar -xzf patch.tar.gz
rm -f patch.b64 patch.tar.gz
pm2 delete antistudy 2>/dev/null || true
pm2 start server_pure.js --name antistudy
pm2 save
echo "🎉 恭喜！服务器代码已极速更新并成功重启！"
''')

print("Part 1 len:", len(open('server_cmd_part1.txt').read()))
print("Part 2 len:", len(open('server_cmd_part2.txt').read()))
