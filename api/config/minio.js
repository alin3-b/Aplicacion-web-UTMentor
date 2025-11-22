import * as Minio from 'minio';
import dotenv from 'dotenv';

dotenv.config();

// Parsear el endpoint si viene completo (ej: http://minio:9000)
let endPoint = 'localhost';
let port = 9000;

if (process.env.MINIO_ENDPOINT) {
  try {
    const url = new URL(process.env.MINIO_ENDPOINT);
    endPoint = url.hostname;
    port = parseInt(url.port) || 9000;
  } catch (e) {
    // Si no es URL válida, asumir que es solo el hostname
    endPoint = process.env.MINIO_ENDPOINT.replace('http://', '').replace('https://', '').split(':')[0];
  }
}

const minioClient = new Minio.Client({
  endPoint,
  port,
  useSSL: false,
  accessKey: process.env.MINIO_ROOT_USER || 'minioadmin',
  secretKey: process.env.MINIO_ROOT_PASSWORD || 'minioadmin',
});

export const bucketName = process.env.MINIO_BUCKET || 'utmentor-bucket';

export async function initMinio() {
  try {
    const exists = await minioClient.bucketExists(bucketName);
    if (!exists) {
      await minioClient.makeBucket(bucketName, 'us-east-1');
      console.log(`Bucket ${bucketName} creado.`);
      
      // Política pública para lectura
      const policy = {
        Version: "2012-10-17",
        Statement: [
          {
            Effect: "Allow",
            Principal: { AWS: ["*"] },
            Action: ["s3:GetObject"],
            Resource: [`arn:aws:s3:::${bucketName}/*`],
          },
        ],
      };
      await minioClient.setBucketPolicy(bucketName, JSON.stringify(policy));
      console.log(`Política pública aplicada a ${bucketName}.`);
    }
  } catch (err) {
    console.error('Error inicializando MinIO:', err);
  }
}

export default minioClient;
