import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import uniqid from 'uniqid';

export async function POST(req) {
  const formData = await req.formData();
  const file = formData.get('file');
  const { name, type } = file;
  const data = await file.arrayBuffer();
  const s3client = new S3Client({
    region: 'eu-north-1',
    credentials: {
      accessKeyId: 'AKIATJPIZXBHNZIJWL4B',
      secretAccessKey: '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',
    },
  });
  const id = uniqid();
  const ext = name.split('.').slice(-1)[0];
  const newName = id + '.' + ext;

  const uploadCommand = new PutObjectCommand({
    Bucket: 'athul-epic-captions',
    Body: data,
    ACL: 'public-read',
    ContentType: type,
    Key: newName,
  });

  await s3client.send(uploadCommand);

  return Response.json({ name, ext, newName, id });
}
