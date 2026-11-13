#!/bin/bash
# Figma 密钥填写助手：双击运行，弹窗里粘贴 Token，自动写进 WorkBuddy 配置
set -u

CONFIG="$HOME/.workbuddy/mcp.json"
PY="/Users/zhangweifeng/.workbuddy/binaries/python/versions/3.13.12/bin/python3"

if [ ! -f "$CONFIG" ]; then
  osascript -e 'display dialog "找不到 WorkBuddy 的配置文件。请先叫小百把配置准备好，再来双击这个文件。" buttons {"好"} default button "好" with title "Figma 密钥助手"' >/dev/null 2>&1
  exit 1
fi

TOKEN=$(osascript -e 'text returned of (display dialog ("第 1 步：把 Figma Token 粘贴到下面的框里。" & return & return & "Token 是一长串，以 figd_ 开头。" & return & "复制好之后，点一下这个框，按 Cmd + V 粘贴。" & return & return & "粘贴完点「好」。") default answer "" buttons {"取消", "好"} default button "好" with title "填 Figma 密钥")' 2>/dev/null)

if [ -z "${TOKEN:-}" ]; then
  osascript -e 'display dialog "你点了取消，什么都没改。想填的时候再双击一次这个文件就行。" buttons {"好"} default button "好" with title "Figma 密钥助手"' >/dev/null 2>&1
  exit 0
fi

TOKEN=$(printf '%s' "$TOKEN" | tr -d '[:space:]')

if [ "${TOKEN#figd_}" = "$TOKEN" ]; then
  osascript -e 'display dialog "这个不像 Figma Token。正确的应该以 figd_ 开头，后面跟一长串字母和数字。请重新双击再试一次。" buttons {"好"} default button "好" with title "Figma 密钥助手"' >/dev/null 2>&1
  exit 1
fi

cp "$CONFIG" "$CONFIG.bak"

TOKEN="$TOKEN" CONFIG="$CONFIG" "$PY" - <<'PY'
import json, os
cfg = os.environ["CONFIG"]
tok = os.environ["TOKEN"]
with open(cfg, encoding="utf-8") as f:
    d = json.load(f)
servers = d.get("mcpServers", {})
if "figma" not in servers:
    raise SystemExit("no figma entry")
servers["figma"].setdefault("env", {})["FIGMA_API_KEY"] = tok
with open(cfg, "w", encoding="utf-8") as f:
    json.dump(d, f, ensure_ascii=False, indent=2)
    f.write("\n")
PY

if [ $? -ne 0 ]; then
  cp "$CONFIG.bak" "$CONFIG"
  osascript -e 'display dialog "写入失败了，已经帮你还原成原来的样子。再试一次，或者叫小百看看。" buttons {"好"} default button "好" with title "Figma 密钥助手"' >/dev/null 2>&1
  exit 1
fi

osascript -e 'display dialog ("密钥填好了。" & return & return & "最后一步：去 WorkBuddy 左边「连接器」→ 右上角「自定义连接」→ 找到 figma → 点「信任」。" & return & return & "点完回来跟小百说一声，我来测试能不能真的读到你的设计稿。") buttons {"知道了"} default button "知道了" with title "Figma 密钥助手"' >/dev/null 2>&1

exit 0
