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

REM 先在新窗口里等 1.5 秒再开浏览器，确保下面的 HTTP 服务已就绪
start "" cmd /c "timeout /t 2 /nobreak >nul && start """" """%URL%""""

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
    echo [提示] 未找到 Python，自动切换到 PowerShell 内置服务器（无需安装）
    powershell -NoProfile -ExecutionPolicy Bypass -Command "$port=%PORT%; $root=(Get-Location).Path; $listener=[System.Net.HttpListener]::new(); $listener.Prefixes.Add(('http://localhost:{0}/' -f $port)); $listener.Start(); Write-Host ('Serving ' + $root + ' at http://localhost:' + $port); while($listener.IsListening){ $ctx=$listener.GetContext(); $rel=[Uri]::UnescapeDataString($ctx.Request.Url.AbsolutePath.TrimStart('/')); if([string]::IsNullOrWhiteSpace($rel)){ $rel='index.html' }; $file=Join-Path $root $rel; if((Test-Path $file) -and -not (Get-Item $file).PSIsContainer){ $bytes=[System.IO.File]::ReadAllBytes($file); $ext=[System.IO.Path]::GetExtension($file).ToLowerInvariant(); $mime=switch($ext){ '.html'{'text/html; charset=utf-8'} '.js'{'application/javascript; charset=utf-8'} '.css'{'text/css; charset=utf-8'} '.json'{'application/json; charset=utf-8'} '.jpg'{'image/jpeg'} '.jpeg'{'image/jpeg'} '.png'{'image/png'} '.webp'{'image/webp'} '.svg'{'image/svg+xml'} '.mp4'{'video/mp4'} '.ogg'{'audio/ogg'} '.oga'{'audio/ogg'} '.mp3'{'audio/mpeg'} '.m4a'{'audio/mp4'} default{'application/octet-stream'} }; $ctx.Response.ContentType=$mime; $ctx.Response.ContentLength64=$bytes.Length; $ctx.Response.OutputStream.Write($bytes,0,$bytes.Length) } else { $ctx.Response.StatusCode=404 }; $ctx.Response.OutputStream.Close() }"
  )
)
