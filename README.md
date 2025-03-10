# Sistema de Gestión de Tickets

Este proyecto es un sistema de gestión de tickets desarrollado con **Express** en el backend y **Angular** en el frontend.

## 📁 Estructura del Proyecto

```
Tickets/
│── Backend/  # API en Express
│── Frontend/ # Interfaz en Angular
```

## 🚀 Configuración del Backend

### 1️⃣ Instalación de dependencias

```sh
cd Backend
npm run dev
```

### 2️⃣ Configurar Variables de Entorno
Crea un archivo `.env` en la carpeta `Backend` con el siguiente contenido:

```
DATABASE_URL="postgresql://postgres:1204@localhost:5432/TicketDB?schema=public"
JWT_ACCESS_SECRET="mysecretaccesskey"
SUPERUSER_TOKEN_SECRET="mysuperusertokensecret"
JWT_REFRESH_SECRET="myrefreshsecretkey"
JWT_PASSWORD_SECRET="mypasswordresetsecret"
SUPERUSER_EMAIL="admin@example.com"
PORT=3000
EMAIL_USER="support@example.com"
EMAIL_PASSWORD="tu_contraseña_de_aplicacion"
FRONTEND_URL="http://localhost:4200"
```
⚠️ Nota: EMAIL_PASSWORD debe ser una contraseña de aplicación de Google si utilizas Gmail para enviar correos.

### 3️⃣ Ejecutar Migraciones de Prisma

```sh
npx prisma migrate deploy
```

### 4️⃣ Iniciar el Servidor

```sh
npm start
```

## 🎨 Configuración del Frontend

### 1️⃣ Instalación de dependencias

```sh
cd Frontend
npm install
```

### 2️⃣ Iniciar el Servidor Angular

```sh
ng serve
```

## 📌 Funcionalidades

✅ Gestión de tickets
✅ Administración de usuarios
✅ Soporte para autenticación con JWT

## 🛠️ Tecnologías Usadas

- **Express** + **Prisma** para el backend
- **Angular** para el frontend
- **PostgreSQL** como base de datos

## 📄 Licencia

Este proyecto es de uso libre bajo la licencia MIT.

