import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { v4 as uuidv4 } from 'uuid';

const r2 = new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
});

export const uploadFile = async (buffer: Buffer, mimeType: string, folder: string): Promise<string> => {
  const ext = mimeType.split('/')[1] || 'bin';
  const key = `${folder}/${uuidv4()}.${ext}`;

  await r2.send(new PutObjectCommand({
    Bucket: process.env.R2_BUCKET_NAME!,
    Key: key,
    Body: buffer,
    ContentType: mimeType,
  }));

  return `${process.env.R2_PUBLIC_URL}/${key}`;
};

export const deleteFile = async (url: string): Promise<void> => {
  const key = url.replace(`${process.env.R2_PUBLIC_URL}/`, '');
  await r2.send(new DeleteObjectCommand({ Bucket: process.env.R2_BUCKET_NAME!, Key: key }));
};
