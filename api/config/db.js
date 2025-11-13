import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

// conexiones MySQL
export const mysqlPool = mysql.createPool({
  host: process.env.MYSQL_HOST || "localhost",
  user: process.env.MYSQL_USER || "root",
  password: process.env.MYSQL_PASSWORD || "root",
  database: process.env.MYSQL_DATABASE || "opiniones",
  waitForConnections: true,
  charset: "utf8mb4",
  connectionLimit: 10,
  queueLimit: 0,
});

// Verificación de conexión MySQL
export async function testMySQLConnection() {
  const maxRetries = 10;
  const delayMs = 1000;
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const conn = await mysqlPool.getConnection();
      await conn.ping();
      conn.release();
      console.log("Conectado a MySQL");
      return;
    } catch (error) {
      console.error(
        `Intento ${attempt}/${maxRetries} - Error conectando a MySQL:`,
        error.message
      );
      if (attempt === maxRetries) {
        console.error(
          "No se pudo conectar a MySQL después de varios intentos."
        );
        process.exit(1);
      }
      await new Promise((res) => setTimeout(res, delayMs));
    }
  }
}
