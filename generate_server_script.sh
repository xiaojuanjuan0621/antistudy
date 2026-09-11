#!/bin/bash
set -e

echo "🚀 开始在云服务器自动构建知识冒险岛 (ANti Study)..."
mkdir -p ~/antistudy/backend/services ~/antistudy/ai-pipeline ~/antistudy/frontend ~/antistudy/data ~/antistudy/uploads
cd ~/antistudy

# 1. 写入 tsconfig.json
cat << 'EOF' > tsconfig.json
{
  "compilerOptions": {
    "target": "es2022",
    "module": "commonjs",
    "moduleResolution": "node",
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "strict": false,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "outDir": "./dist"
  },
  "include": ["backend/**/*", "ai-pipeline/**/*"]
}
EOF

echo "✓ tsconfig.json 就绪"
