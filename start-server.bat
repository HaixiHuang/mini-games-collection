@echo off
chcp 65001 >nul
cd /d "%~dp0"

echo.
echo   🎮 迷你游戏集合
echo   ================
echo.

:: 获取本机 IP
for /f "tokens=2 delims=:" %%i in ('ipconfig ^| findstr /c:"IPv4"') do (
    set IP=%%i
    goto :found
)
:found
set IP=%IP: =%

echo   局域网地址: http://%IP%:8080
echo   iPad/手机 同 WiFi 下浏览器打开即可
echo.

:: 生成二维码 URL（用在线 API）
echo   二维码: https://api.qrserver.com/v1/create-qr-code/?size=200x200^&data=http://%IP%:8080
echo.

echo   按 Ctrl+C 停止服务器
echo   ================
echo.

python -m http.server 8080
pause
