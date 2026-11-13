with open('frontend/update_bundle.b64') as f:
    b64 = f.read().strip()

mid = len(b64) // 2
part1 = b64[:mid]
part2 = b64[mid:]

with open('cloud_step1.txt', 'w') as f:
    f.write(f"mkdir -p ~/antistudy && cd ~/antistudy && cat << 'EOF' > b.txt\n{part1}\nEOF\necho '第一步完成，请粘贴第二步'\n")

with open('cloud_step2.txt', 'w') as f:
    f.write(f"cat << 'EOF' >> b.txt\n{part2}\nEOF\nbase64 -d b.txt | tar -xz && rm -f b.txt && pm2 restart antistudy && pm2 save\necho '🎉 恭喜！服务器已全功能更新上线！'\n")

print("cloud_step1 size:", len(open('cloud_step1.txt').read()))
print("cloud_step2 size:", len(open('cloud_step2.txt').read()))
