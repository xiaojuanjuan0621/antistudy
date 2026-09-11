with open('code_b64.txt') as f:
    b64 = f.read().strip()

# Split into 2 chunks of 17.5KB
p1 = b64[:17500]
p2 = b64[17500:]

with open('step1.sh', 'w') as f:
    f.write(f"cd ~/antistudy && cat << 'EOF' > patch.b64\n{p1}\nEOF\necho '第一步完成，请粘贴第二步'\n")

with open('step2.sh', 'w') as f:
    f.write(f"cat << 'EOF' >> patch.b64\n{p2}\nEOF\nbase64 -d patch.b64 | tar -xz && rm -f patch.b64 && pm2 restart antistudy\necho '🎉 恭喜！服务器已秒级成功更新！'\n")

print("step1 lines:", len(open('step1.sh').readlines()), "step2 lines:", len(open('step2.sh').readlines()))
