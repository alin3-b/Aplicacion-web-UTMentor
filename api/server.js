// api/server.js
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import Stripe from "stripe";
import swaggerJSDoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";

import { mysqlPool, testMySQLConnection } from "./config/db.js";
import { initMinio } from "./config/minio.js";

// IMPORTAR RUTAS
import usuarioRoutes from "./routes/usuarioRoutes.js";
import paymentsRoutes from "./routes/paymentsRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import authTestRoutes from "./routes/authTestRoutes.js";
import emailRoutes from "./routes/emailRoutes.js";

dotenv.config();

const app = express();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// === MIDDLEWARES – deben ir antes de las rutas ===
// Configurar CORS para aceptar Authorization header en preflight y exponerlo en respuestas si es necesario.
app.use(cors({
  origin: true, // o especifica tu origen: ['https://mi-front.com']
  methods: ['GET','POST','PUT','DELETE','OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  exposedHeaders: ['Authorization']
}));

app.use(express.json()); // parsea JSON body

// === RUTAS DE AUTENTICACIÓN y TEST (ya con middlewares arriba) ===
app.use("/api/auth", authRoutes);
app.use("/api/test", authTestRoutes);

// === RUTAS REST ===
app.use("/api/usuarios", usuarioRoutes);
app.use("/api/pagos", paymentsRoutes);

// RUTAS DE EMAIL (RECUPERACIÓN DE CONTRASEÑA)  👇
app.use("/api/email", emailRoutes);

// === SWAGGER ===
const swaggerOptions = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "UTmentor API",
            version: "1.0.0",
            description: "API para sistema de mentorías UTmentor (MySQL)",
        },
        servers: [{ url: `http://localhost:${process.env.PORT || 3000}` }],
    },
    apis: ["./controllers/*.js", "./routes/*.js"],
};
const swaggerDocs = swaggerJSDoc(swaggerOptions);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// === CONEXIÓN A BASE DE DATOS ===
console.log("🔄 Iniciando conexión a MySQL...");
console.log("📋 Variables de entorno:");
console.log("   - MYSQL_HOST:", process.env.MYSQL_HOST || "mysql (default)");
console.log("   - MYSQL_PORT:", process.env.MYSQL_PORT || "3306 (default)");
console.log("   - MYSQL_DATABASE:", process.env.MYSQL_DATABASE || "utmentor (default)");
console.log("   - MYSQL_USER:", process.env.MYSQL_USER || "root (default)");

try {
    await testMySQLConnection();
} catch (error) {
    console.error("❌ Error crítico: No se pudo conectar a MySQL");
    console.error("   Detalles:", error.message);
    process.exit(1);
}

// === INICIALIZAR MINIO ===
console.log("🔄 Iniciando conexión a MinIO...");
console.log("   - MINIO_ENDPOINT:", process.env.MINIO_ENDPOINT || "localhost (default)");
try {
    await initMinio();
    console.log("✅ MinIO inicializado correctamente");
} catch (error) {
    console.warn("⚠️  Advertencia: MinIO no está disponible");
    console.warn("   Las funciones de almacenamiento de archivos no estarán disponibles");
    console.warn("   Detalles:", error.message);
}

// === RUTA RAÍZ ===
app.get("/", (req, res) => {
    res.send(`
    <h2>UTmentor API</h2>
    <p><strong>Estado:</strong> Activa</p>
    <p><strong>Entorno:</strong> ${process.env.NODE_ENV || "development"}</p>
    <p><strong>Puerto:</strong> ${process.env.PORT || 3000}</p>
    <p><a href="/api-docs">Documentación Swagger</a></p>
    `);
});

// === HEALTH CHECK ===
app.get("/health", async (req, res) => {
    const mysqlOk = await mysqlPool
        .query("SELECT 1")
        .then(() => true)
        .catch(() => false);

    res.json({
        status: mysqlOk ? "ok" : "error",
        services: {
            mysql: mysqlOk ? "connected" : "disconnected",
        },
        environment: {
            nodeEnv: process.env.NODE_ENV || "development",
            port: process.env.PORT || 3000,
            mysqlHost: process.env.MYSQL_HOST || "mysql",
        },
        timestamp: new Date().toISOString(),
    });
});

// === INICIAR SERVIDOR ===
const PORT = process.env.PORT || 3001;
app.listen(PORT, '0.0.0.0', () => {
    console.log("=".repeat(60));
    console.log("🚀 SERVIDOR INICIADO CORRECTAMENTE");
    console.log("=".repeat(60));
    console.log(`📍 Puerto: ${PORT}`);
    console.log(`🌐 URL: http://localhost:${PORT}/`);
    console.log(`📚 Documentación: http://localhost:${PORT}/api-docs`);
    console.log(`🏥 Health Check: http://localhost:${PORT}/health`);
    console.log("=".repeat(60));
});
