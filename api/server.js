// api/server.js
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import swaggerJSDoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";

import { mysqlPool, testMySQLConnection } from "./config/db.js";
import usuarioRoutes from "./routes/usuarioRoutes.js";

dotenv.config();

const app = express();

// === MIDDLEWARES ===
app.use(cors());
app.use(express.json());

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

// === RUTAS API ===
app.use("/api/usuarios", usuarioRoutes);

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

// === INICIAR SERVIDOR ===
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Servidor escuchando en puerto ${PORT}`);
    console.log(`http://localhost:${PORT}/`);
    console.log(`Documentación: http://localhost:${PORT}/api-docs`);
});