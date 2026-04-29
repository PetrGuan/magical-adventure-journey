@echo off
REM ============================================================
REM   Magical Adventure Journey - Windows launcher
REM   Double-click this file to start the local HTTP server.
REM   See the Chinese usage notes file for instructions.
REM ============================================================

cd /d "%~dp0"

set PORT=8000
set URL=http://localhost:%PORT%/index.html

echo =================================================
echo   Magical Adventure Journey - Local Server
echo =================================================
echo.
echo   URL: %URL%
echo   Press Ctrl+C to stop the server.
echo.
echo =================================================
echo.

REM Open the browser after a 2-second delay so the server is ready.
REM Use PowerShell for the delay so we avoid nested-quote issues in cmd.
start "" /B powershell -NoProfile -Command "Start-Sleep -Seconds 2; Start-Process '%URL%'" >nul 2>&1

echo [1/2] Detecting Python...
where python >nul 2>nul
if %errorlevel% equ 0 (
  echo       Found python.exe
  echo [2/2] Starting HTTP server on port %PORT% ...
  echo.
  python -m http.server %PORT%
  goto :end
)

where python3 >nul 2>nul
if %errorlevel% equ 0 (
  echo       Found python3.exe
  echo [2/2] Starting HTTP server on port %PORT% ...
  echo.
  python3 -m http.server %PORT%
  goto :end
)

echo       Python not found. Falling back to PowerShell built-in server.
echo [2/2] Starting PowerShell HTTP server on port %PORT% ...
echo.
powershell -NoProfile -ExecutionPolicy Bypass -Command "$port=%PORT%; $root=(Get-Location).Path; $listener=[System.Net.HttpListener]::new(); $listener.Prefixes.Add(('http://localhost:{0}/' -f $port)); try { $listener.Start() } catch { Write-Host ('[ERROR] Cannot start server on port ' + $port + ': ' + $_.Exception.Message); Write-Host 'Hint: port may be in use, or antivirus blocked PowerShell. Close this window and try again.'; exit 1 }; Write-Host ('Serving ' + $root + ' at http://localhost:' + $port); while($listener.IsListening){ $ctx=$listener.GetContext(); $rel=[Uri]::UnescapeDataString($ctx.Request.Url.AbsolutePath.TrimStart('/')); if([string]::IsNullOrWhiteSpace($rel)){ $rel='index.html' }; $file=Join-Path $root $rel; if((Test-Path $file) -and -not (Get-Item $file).PSIsContainer){ $bytes=[System.IO.File]::ReadAllBytes($file); $ext=[System.IO.Path]::GetExtension($file).ToLowerInvariant(); $mime=switch($ext){ '.html'{'text/html; charset=utf-8'} '.js'{'application/javascript; charset=utf-8'} '.css'{'text/css; charset=utf-8'} '.json'{'application/json; charset=utf-8'} '.jpg'{'image/jpeg'} '.jpeg'{'image/jpeg'} '.png'{'image/png'} '.webp'{'image/webp'} '.svg'{'image/svg+xml'} '.mp4'{'video/mp4'} '.ogg'{'audio/ogg'} '.oga'{'audio/ogg'} '.mp3'{'audio/mpeg'} '.m4a'{'audio/mp4'} default{'application/octet-stream'} }; $ctx.Response.ContentType=$mime; $ctx.Response.ContentLength64=$bytes.Length; $ctx.Response.OutputStream.Write($bytes,0,$bytes.Length) } else { $ctx.Response.StatusCode=404 }; $ctx.Response.OutputStream.Close() }"

:end
echo.
echo =================================================
echo   Server stopped.
echo =================================================
echo.
echo To start again, double-click start.bat.
echo.
pause
