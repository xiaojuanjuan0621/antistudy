with open('fast_update.sh') as f:
    full = f.read()

# Let's see how many lines and split into 2 smaller friendly blocks
lines = full.split('\n')
b64_line = lines[2] # the long base64 string

# We can write step 1 and step 2
part1_b64 = b64_line[:17000]
part2_b64 = b64_line[17000:]

with open('cmd_step1.txt', 'w') as f:
    f.write("cd ~/antistudy || (mkdir -p ~/antistudy && cd ~/antistudy)\n")
    f.write("cat << 'EOF_P1' > bundle.b64\n")
    f.write(part1_b64 + "\n")
    f.write("EOF_P1\n")
    f.write('echo "✓ 第一部分上传成功，请粘贴第二部分"\n')

with open('cmd_step2.txt', 'w') as f:
    f.write("cat << 'EOF_P2' >> bundle.b64\n")
    f.write(part2_b64 + "\n")
    f.write("EOF_P2\n")
    f.write("base64 -d bundle.b64 | tar -xz\n")
    f.write("rm -f bundle.b64\n")
    f.write("pm2 delete antistudy 2>/dev/null || true\n")
    f.write("pm2 start server_pure.js --name antistudy\n")
    f.write("pm2 save\n")
    f.write('echo "🎉 恭喜！服务器已秒级成功更新最新版！"\n')

print("Step 1 size:", len(open('cmd_step1.txt').read()))
print("Step 2 size:", len(open('cmd_step2.txt').read()))
