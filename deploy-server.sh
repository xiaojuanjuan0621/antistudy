#!/usr/bin/env bash
# 知识冒险岛 · iPad 版服务器部署脚本
# 用法（在服务器上，root 执行）：
#   bash /tmp/antistudy-ipad/deploy-server.sh
# 可选环境变量：
#   PARENT_PORT=80  PARENT_PIN=1234
set -euo pipefail

APP_DIR=/opt/antistudy
PKG="${PKG:-/tmp/antistudy-ipad.tar.gz}"
PIN="${PARENT_PIN:-1234}"
NODE_VER=v20.18.1
MIRROR=https://cdn.npmmirror.com/binaries/node

say() { echo -e "\n==> $*"; }

# ---------- 1. Node.js ----------
say "1/5 检查 Node.js"
NODE_BIN="$(command -v node || true)"
if [ -n "$NODE_BIN" ] && [ "$(node -v | sed 's/^v\([0-9]*\).*/\1/')" -ge 18 ]; then
  echo "    已有 $(node -v)"
else
  case "$(uname -m)" in
    x86_64|amd64) NARCH=x64 ;;
    aarch64|arm64) NARCH=arm64 ;;
    *) echo "    不支持的架构 $(uname -m)"; exit 1 ;;
  esac
  echo "    安装 Node.js ${NODE_VER} (${NARCH}) ..."
  cd /tmp
  curl -fsSL "${MIRROR}/${NODE_VER}/node-${NODE_VER}-linux-${NARCH}.tar.gz" -o node.tar.gz
  tar -xzf node.tar.gz
  cp -rf "node-${NODE_VER}-linux-${NARCH}"/bin "node-${NODE_VER}-linux-${NARCH}"/lib \
         "node-${NODE_VER}-linux-${NARCH}"/include "node-${NODE_VER}-linux-${NARCH}"/share /usr/local/
  rm -rf node.tar.gz "node-${NODE_VER}-linux-${NARCH}"
  hash -r
  echo "    已安装 $(node -v)"
fi
NODE_BIN="$(command -v node)"

# ---------- 2. 选端口 ----------
say "2/5 选择监听端口"
if [ -n "${PARENT_PORT:-}" ]; then
  PORT="$PARENT_PORT"
elif ss -ltn 2>/dev/null | grep -q ':80 '; then
  PORT=8780
  echo "    80 已被占用，改用 8780（需要在云控制台安全组放行 8780）"
else
  PORT=80
fi
echo "    端口 $PORT"

# ---------- 3. 解压项目 ----------
say "3/5 部署文件到 $APP_DIR"
if [ ! -f "$PKG" ]; then echo "    找不到部署包 $PKG"; exit 1; fi
mkdir -p "$APP_DIR"
tar -xzf "$PKG" -C "$APP_DIR"
mkdir -p "$APP_DIR/ipad-design/uploads"
echo "    已解压 $(du -sh "$APP_DIR" | cut -f1)"

# ---------- 4. systemd ----------
say "4/5 配置开机自启"
cat > /etc/systemd/system/antistudy.service <<EOF
[Unit]
Description=Antistudy iPad + Parent Center
After=network.target

[Service]
Type=simple
WorkingDirectory=$APP_DIR
Environment=PARENT_PORT=$PORT
Environment=PARENT_HOST=0.0.0.0
Environment=PARENT_PIN=$PIN
ExecStart=$NODE_BIN $APP_DIR/parent-server.js
Restart=always
RestartSec=3
StandardOutput=append:/var/log/antistudy.log
StandardError=append:/var/log/antistudy.log

[Install]
WantedBy=multi-user.target
EOF

systemctl daemon-reload
systemctl enable antistudy >/dev/null 2>&1 || true
systemctl restart antistudy
echo "    已启动 antistudy.service"

# ---------- 5. 防火墙 + 自检 ----------
say "5/5 防火墙与自检"
if command -v ufw >/dev/null 2>&1 && ufw status 2>/dev/null | grep -q "Status: active"; then
  ufw allow "$PORT"/tcp >/dev/null 2>&1 || true
  echo "    ufw 已放行 $PORT"
fi
if command -v firewall-cmd >/dev/null 2>&1 && systemctl is-active firewalld >/dev/null 2>&1; then
  firewall-cmd --permanent --add-port="$PORT"/tcp >/dev/null 2>&1 || true
  firewall-cmd --reload >/dev/null 2>&1 || true
  echo "    firewalld 已放行 $PORT"
fi

sleep 2
if curl -fsS "http://127.0.0.1:$PORT/api/health" >/dev/null 2>&1; then
  IP="$(curl -s --max-time 4 ifconfig.me 2>/dev/null || echo '服务器公网IP')"
  echo ""
  echo "======================================================"
  echo " 部署成功"
  echo "   孩子端   http://$IP:$PORT/home.html"
  echo "   家长中心 http://$IP:$PORT/parent.html  （密码 $PIN）"
  echo "   日志     tail -f /var/log/antistudy.log"
  echo "======================================================"
  [ "$PORT" != "80" ] && echo " 注意：请到云控制台安全组放行 TCP $PORT"
else
  echo " 启动失败，最近日志："
  journalctl -u antistudy -n 30 --no-pager || tail -n 30 /var/log/antistudy.log
  exit 1
fi
