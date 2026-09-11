with open('code_b64.txt') as f:
    b64 = f.read().strip()

chunk_size = 7000
chunks = [b64[i:i+chunk_size] for i in range(0, len(b64), chunk_size)]

print(f"Total chunks: {len(chunks)}")
for idx, c in enumerate(chunks):
    with open(f'deploy_part_{idx+1}.sh', 'w') as f:
        if idx == 0:
            f.write(f"cd ~/antistudy && cat << 'EOF' > patch.b64\n{c}\nEOF\necho '✓ 第 1/5 部分写入成功'\n")
        elif idx == len(chunks) - 1:
            f.write(f"cat << 'EOF' >> patch.b64\n{c}\nEOF\nbase64 -d patch.b64 | tar -xz && rm -f patch.b64 && pm2 restart antistudy && pm2 save\necho '🎉 恭喜！服务器已秒级成功更新全部代码与页面！'\n")
        else:
            f.write(f"cat << 'EOF' >> patch.b64\n{c}\nEOF\necho '✓ 第 {idx+1}/5 部分写入成功'\n")
