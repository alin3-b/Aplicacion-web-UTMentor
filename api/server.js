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
import favoritosRoutes from "./routes/favoritosRoutes.js";
import asesoriasRoutes from "./routes/asesoriasRoutes.js";
import iaRoutes from "./routes/ia.js";

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

app.use("/api/favoritos", favoritosRoutes);

app.use("/api/asesorias", asesoriasRoutes);

app.use("/api/ia", iaRoutes);
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
await testMySQLConnection();

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
        timestamp: new Date().toISOString(),
    });
});

// === INICIAR SERVIDOR ===
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Servidor escuchando en puerto ${PORT}`);
    console.log(`http://localhost:${PORT}/`);
    console.log(`Documentación: http://localhost:${PORT}/api-docs`);
});
