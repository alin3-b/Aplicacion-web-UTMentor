//api/confi/db.js
import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

// conexiones MySQL
export const mysqlPool = mysql.createPool({
  host: process.env.MYSQL_HOST || "mysql",  // <-- usa el nombre del servicio Docker
  user: process.env.MYSQL_USER || "root",
  password: process.env.MYSQL_PASSWORD || "root",
  port: process.env.MYSQL_PORT ? parseInt(process.env.MYSQL_PORT) : 3306,  // <-- puerto interno
  database: process.env.MYSQL_DATABASE || "utmentor",
  waitForConnections: true,
  charset: "utf8mb4",
  connectionLimit: 10,
  queueLimit: 0,
});

// Verificación de conexión MySQL
export async function testMySQLConnection() {
  const maxRetries = 5;
  const delayMs = 2000;
  
  console.log("🔍 Verificando conexión a MySQL...");
  console.log("   Host:", process.env.MYSQL_HOST);
  console.log("   Port:", process.env.MYSQL_PORT || 3306);
  console.log("   Database:", process.env.MYSQL_DATABASE);
  console.log("   User:", process.env.MYSQL_USER);
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`   Intento ${attempt}/${maxRetries}...`);
      const conn = await mysqlPool.getConnection();
      await conn.ping();
      conn.release();
      console.log("✅ Conectado a MySQL exitosamente");
      return;
    } catch (error) {
      console.error(
        `❌ Intento ${attempt}/${maxRetries} falló:`,
        error.message
      );
      console.error("   Código:", error.code);
      console.error("   errno:", error.errno);
      
      if (attempt === maxRetries) {
        console.error("\n❌ ERROR CRÍTICO: No se pudo conectar a MySQL después de varios intentos.");
        console.error("\nPosibles causas:");
        console.error("1. El servidor MySQL no está disponible");
        console.error("2. Credenciales incorrectas");
        console.error("3. Firewall bloqueando la conexión");
        console.error("4. Variables de entorno no configuradas correctamente\n");
        throw error;
      }
      await new Promise((res) => setTimeout(res, delayMs));
    }
  }
}
