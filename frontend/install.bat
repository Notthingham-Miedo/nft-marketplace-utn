@echo off
echo 🚀 Configurando NFT Marketplace Frontend...

REM Verificar si Node.js está instalado
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Node.js no está instalado. Por favor instala Node.js 16+ antes de continuar.
    pause
    exit /b 1
)

echo ✅ Node.js detectado
node -v

REM Instalar dependencias
echo 📦 Instalando dependencias...
call npm install

if %ERRORLEVEL% NEQ 0 (
    echo ❌ Error al instalar dependencias
    pause
    exit /b 1
)

echo ✅ Dependencias instaladas correctamente

REM Copiar archivo de configuración
if not exist ".env" (
    copy .env.example .env
    echo 📋 Archivo .env creado desde .env.example
    echo ⚠️  IMPORTANTE: Edita el archivo .env con tus claves antes de ejecutar la aplicación
) else (
    echo 📋 Archivo .env ya existe
)

echo 🎉 ¡Instalación completada!
echo.
echo 📝 Próximos pasos:
echo 1. Edita el archivo .env con tus claves de Pinata y WalletConnect
echo 2. Deploya los contratos y actualiza las direcciones en .env
echo 3. Ejecuta 'npm start' para iniciar la aplicación
echo.
echo 📚 Para más información, consulta el README.md
pause
