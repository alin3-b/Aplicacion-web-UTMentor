// test-connection.js - Script para probar conexiones antes de iniciar el servidor
import dotenv from 'dotenv';
import mysql from 'mysql2/promise';

dotenv.config();

console.log("=".repeat(60));
console.log("🔧 DIAGNÓSTICO DE CONEXIONES");
console.log("=".repeat(60));

// 1. Verificar variables de entorno
console.log("\n📋 VARIABLES DE ENTORNO:");
const envVars = {
    'NODE_ENV': process.env.NODE_ENV || 'no configurado',
    'PORT': process.env.PORT || 'no configurado',
    'MYSQL_HOST': process.env.MYSQL_HOST || 'no configurado',
    'MYSQL_PORT': process.env.MYSQL_PORT || 'no configurado',
    'MYSQL_USER': process.env.MYSQL_USER || 'no configurado',
    'MYSQL_PASSWORD': process.env.MYSQL_PASSWORD ? '***configurado***' : 'no configurado',
    'MYSQL_DATABASE': process.env.MYSQL_DATABASE || 'no configurado',
    'JWT_SECRET': process.env.JWT_SECRET ? '***configurado***' : 'no configurado',
    'STRIPE_SECRET_KEY': process.env.STRIPE_SECRET_KEY ? '***configurado***' : 'no configurado',
    'MINIO_ENDPOINT': process.env.MINIO_ENDPOINT || 'no configurado',
};

Object.entries(envVars).forEach(([key, value]) => {
    const icon = value.includes('no configurado') ? '❌' : '✅';
    console.log(`${icon} ${key}: ${value}`);
});

// 2. Probar conexión MySQL
console.log("\n🔍 PROBANDO CONEXIÓN A MYSQL:");
const mysqlConfig = {
    host: process.env.MYSQL_HOST || "mysql",
    user: process.env.MYSQL_USER || "root",
    password: process.env.MYSQL_PASSWORD || "root",
    port: process.env.MYSQL_PORT ? parseInt(process.env.MYSQL_PORT) : 3306,
    database: process.env.MYSQL_DATABASE || "utmentor",
    connectTimeout: 10000,
};

console.log("   Config:", {
    host: mysqlConfig.host,
    port: mysqlConfig.port,
    user: mysqlConfig.user,
    database: mysqlConfig.database,
});

try {
    const connection = await mysql.createConnection(mysqlConfig);
    console.log("✅ Conexión MySQL exitosa");
    await connection.ping();
    console.log("✅ Ping MySQL exitoso");
    
    const [rows] = await connection.query("SELECT VERSION() as version");
    console.log("✅ MySQL version:", rows[0].version);
    
    await connection.end();
} catch (error) {
    console.error("❌ Error de conexión MySQL:");
    console.error("   Mensaje:", error.message);
    console.error("   Código:", error.code);
    console.error("   errno:", error.errno);
    console.error("   syscall:", error.syscall);
    process.exit(1);
}

console.log("\n" + "=".repeat(60));
console.log("✅ DIAGNÓSTICO COMPLETADO - TODO OK");
console.log("=".repeat(60));
