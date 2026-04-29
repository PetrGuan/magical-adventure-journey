#!/bin/bash
# macOS 一键启动脚本
# 双击这个文件即可：启动本地 HTTP server + 自动打开浏览器

cd "$(dirname "$0")"

PORT=8000
URL="http://localhost:$PORT/index.html"

echo "================================================="
echo "  神奇的探险之旅 · 本地服务器"
echo "================================================="
echo ""
echo "  正在启动 → $URL"
echo "  按 Ctrl+C 停止"
echo ""
echo "================================================="

# 1 秒后自动打开浏览器
( sleep 1 && open "$URL" ) &

# 启动 Python 自带的 HTTP server
if command -v python3 &> /dev/null; then
  python3 -m http.server $PORT
elif command -v python &> /dev/null; then
  python -m http.server $PORT
else
  echo ""
  echo "⚠️ 未找到 Python，自动切换到离线模式（无需安装）"
  open "run-offline.html"
  echo "已打开离线入口：run-offline.html"
  read -p "按回车键退出……"
fi
