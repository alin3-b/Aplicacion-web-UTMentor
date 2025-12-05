# UTMentor - Plataforma de Mentorías Académicas

UTMentor es una plataforma web diseñada para conectar a estudiantes que buscan asesoría académica ("Asesorados") con estudiantes capacitados para brindarla ("Asesores"). El sistema facilita la gestión de horarios, pagos y seguimiento de sesiones de mentoría.

## 🚀 Características Principales

- **Gestión de Usuarios:** Registro e inicio de sesión con roles diferenciados (Asesor y Asesorado).
- **Agenda de Sesiones:** Publicación de disponibilidad por parte de asesores y reserva por parte de alumnos.
- **Modalidades Flexibles:** Soporte para sesiones presenciales, virtuales o híbridas.
- **Pagos en Línea:** Integración con Stripe para el pago de asesorías.
- **Notificaciones:** Envío de correos electrónicos para recuperación de contraseñas y confirmaciones.
- **Almacenamiento de Archivos:** Gestión de fotos de perfil utilizando MinIO (compatible con S3).
- **Panel de Administración de Datos:** phpMyAdmin integrado para gestión de base de datos.

## 🛠 Tecnologías Utilizadas

### Frontend
- **HTML5 / CSS3 / JavaScript (Vanilla):** Interfaz de usuario responsiva y ligera.
- **Nginx:** Servidor web y proxy inverso.

### Backend
- **Node.js & Express:** API RESTful.
- **JWT:** Autenticación segura basada en tokens.
- **Nodemailer:** Servicio de envío de correos.
- **Stripe SDK:** Procesamiento de pagos.
- **Swagger:** Documentación de la API.

### Infraestructura y Datos
- **MySQL 8.4:** Base de datos relacional.
- **MinIO:** Almacenamiento de objetos (Object Storage).
- **Docker & Docker Compose:** Orquestación de contenedores para un despliegue sencillo.

## 📋 Prerrequisitos

Para ejecutar este proyecto localmente, necesitas tener instalado:

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (incluye Docker Compose).
- Git.

## 🔧 Instalación y Despliegue Local

Sigue estos pasos para levantar el proyecto en tu máquina local:

1.  **Clonar el repositorio:**
    ```bash
    git clone <url-del-repositorio>
    cd mvc
    ```

2.  **Configurar variables de entorno:**
    Crea un archivo `.env` en la raíz del proyecto basándote en el siguiente ejemplo:

    ```env
    # Base de Datos
    MYSQL_ROOT_PASSWORD=tu_password_root
    MYSQL_DATABASE=utmentor_db

    # MinIO (Almacenamiento)
    MINIO_ROOT_USER=minioadmin
    MINIO_ROOT_PASSWORD=minioadmin

    # API
    PORT=3000
    JWT_SECRET=tu_secreto_jwt
    STRIPE_SECRET_KEY=tu_clave_stripe
    
    # Configuración de Correo (Gmail App Password)
    EMAIL_USER=tu_email@gmail.com
    EMAIL_PASS=tu_app_password
    
    # Frontend
    FRONTEND_URL=http://localhost:8180
    ```

3.  **Levantar los servicios:**
    Ejecuta el siguiente comando en la terminal:
    ```bash
    docker compose up -d --build
    ```

4.  **Acceder a la aplicación:**
    Una vez que los contenedores estén corriendo, puedes acceder a los diferentes servicios:

    | Servicio | URL | Descripción |
    |----------|-----|-------------|
    | **Frontend (App)** | `http://localhost:8180` | Aplicación web principal |
    | **API REST** | `http://localhost:3000` | Backend del sistema |
    | **Swagger UI** | `http://localhost:3000/api-docs` | Documentación interactiva de la API |
    | **phpMyAdmin** | `http://localhost:8080` | Gestión visual de la base de datos |
    | **MinIO Console** | `http://localhost:9001` | Gestión de archivos (Buckets) |

## 📂 Estructura del Proyecto

```
mvc/
├── api/                 # Código fuente del Backend (Node.js)
│   ├── config/          # Configuraciones (DB, MinIO)
│   ├── controllers/     # Lógica de negocio
│   ├── models/          # Modelos de datos
│   ├── routes/          # Definición de endpoints
│   └── server.js        # Punto de entrada de la API
├── UTMentor/            # Código fuente del Frontend
│   ├── css/             # Estilos
│   ├── html/            # Vistas
│   └── js/              # Lógica del cliente
├── mysql/               # Scripts de inicialización de BD
├── nginx.conf           # Configuración del servidor web
├── docker-compose.yml   # Orquestación de servicios
└── package.json         # Dependencias raíz
```

## 🐛 Solución de Problemas Comunes

-   **Error de conexión a Docker:** Asegúrate de que Docker Desktop esté ejecutándose antes de lanzar el comando `docker compose`.
-   **Puertos ocupados:** Si algún puerto (3316, 8080, 3000, 8180) está en uso, puedes modificar el mapeo en el archivo `docker-compose.yml`.
-   **Base de datos no inicializada:** Si es la primera vez que ejecutas el proyecto, el script `mysql/init.sql` se ejecutará automáticamente. Si tienes problemas, puedes borrar la carpeta `mysql_data` (generada automáticamente) y reiniciar los contenedores.

## 📄 Licencia

Este proyecto está bajo la Licencia MIT.
