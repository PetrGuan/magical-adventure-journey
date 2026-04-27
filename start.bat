@echo off
REM Windows 一键启动脚本
REM 双击这个文件即可：启动本地 HTTP server + 自动打开浏览器

cd /d "%~dp0"

set PORT=8000
set URL=http://localhost:%PORT%/index.html

echo =================================================
echo   神奇的探险之旅 · 本地服务器
echo =================================================
echo.
echo   正在启动 -^> %URL%
echo   按 Ctrl+C 停止
echo.
echo =================================================

REM 自动打开浏览器
start "" "%URL%"

REM 启动 Python 自带的 HTTP server
where python >nul 2>nul
if %errorlevel%==0 (
  python -m http.server %PORT%
) else (
  where python3 >nul 2>nul
  if %errorlevel%==0 (
    python3 -m http.server %PORT%
  ) else (
    echo.
    echo [错误] 未找到 Python。请先安装 Python 3：
    echo        https://www.python.org/downloads/
    pause
  )
)
