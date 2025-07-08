#!/bin/bash

# Script de instalación automática para NFT Marketplace Frontend
echo "🚀 Configurando NFT Marketplace Frontend..."

# Verificar si Node.js está instalado
if ! command -v node &> /dev/null; then
    echo "❌ Node.js no está instalado. Por favor instala Node.js 16+ antes de continuar."
    exit 1
fi

# Verificar versión de Node.js
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 16 ]; then
    echo "❌ Se requiere Node.js 16 o superior. Versión actual: $(node -v)"
    exit 1
fi

echo "✅ Node.js $(node -v) detectado"

# Instalar dependencias
echo "📦 Instalando dependencias..."
npm install

# Verificar si se instalaron correctamente
if [ $? -eq 0 ]; then
    echo "✅ Dependencias instaladas correctamente"
else
    echo "❌ Error al instalar dependencias"
    exit 1
fi

# Copiar archivo de configuración
if [ ! -f ".env" ]; then
    cp .env.example .env
    echo "📋 Archivo .env creado desde .env.example"
    echo "⚠️  IMPORTANTE: Edita el archivo .env con tus claves antes de ejecutar la aplicación"
else
    echo "📋 Archivo .env ya existe"
fi

# Configurar TailwindCSS si no existe
if [ ! -f "tailwind.config.js" ]; then
    echo "🎨 Configurando TailwindCSS..."
    npx tailwindcss init -p
fi

echo "🎉 ¡Instalación completada!"
echo ""
echo "📝 Próximos pasos:"
echo "1. Edita el archivo .env con tus claves de Pinata y WalletConnect"
echo "2. Deploya los contratos y actualiza las direcciones en .env"
echo "3. Ejecuta 'npm start' para iniciar la aplicación"
echo ""
echo "📚 Para más información, consulta el README.md"
