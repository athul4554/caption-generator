import { GetObjectCommand, S3Client } from '@aws-sdk/client-s3';
import {
  GetTranscriptionJobCommand,
  StartTranscriptionJobCommand,
  TranscribeClient,
} from '@aws-sdk/client-transcribe';

function getClient() {
  return new TranscribeClient({
    region: 'eu-north-1',
    credentials: {
      accessKeyId: 'AKIATJPIZXBHNZIJWL4B',
      secretAccessKey: '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',
    },
  });
}
function createTranscriptionCommand(filename) {
  return new StartTranscriptionJobCommand({
    TranscriptionJobName: filename,
    OutputBucketName: 'athul-epic-captions',
    OutputKey: filename + '.transcription',
    IdentifyLanguage: true,
    Media: {
      MediaFileUri: 's3://' + 'athul-epic-captions' + '/' + filename,
    },
  });
}
async function createTranscriptionJob(filename) {
  const transcribeClient = getClient();
  const transcriptionCommand = createTranscriptionCommand(filename);
  return transcribeClient?.send(transcriptionCommand);
}
async function getJob(filename) {
  const transcribeClient = getClient();
  let jobStatusResult = null;
  try {
    const transcriptionJobStatusCommand = new GetTranscriptionJobCommand({
      TranscriptionJobName: filename,
    });
    jobStatusResult = await transcribeClient.send(transcriptionJobStatusCommand);
  } catch (e) {}
  return jobStatusResult;
}

async function streamToString(stream) {
  const chunks = [];
  return new Promise((resolve, reject) => {
    stream.on('data', (chunk) => chunks.push(Buffer.from(chunk)));
    stream.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
    stream.on('error', reject);
  });
}

async function getTranscriptionFile(filename) {
  const transcriptionFile = filename + '.transcription';
  const s3client = new S3Client({
    region: 'eu-north-1',
    credentials: {
      accessKeyId: 'AKIATJPIZXBHNZIJWL4B',
      secretAccessKey: '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',
    },
  });
  const getObjectCommand = new GetObjectCommand({
    Bucket: 'athul-epic-captions',
    Key: transcriptionFile,
  });
  let transcriptionFileResponse = null;
  try {
    transcriptionFileResponse = await s3client.send(getObjectCommand);
  } catch (e) {}
  if (transcriptionFileResponse) {
    return JSON.parse(await streamToString(transcriptionFileResponse.Body));
  }
  return null;
}

export async function GET(req) {
  const url = new URL(req.url);
  const searchParams = new URLSearchParams(url.searchParams);
  const filename = searchParams.get('filename');

  // find ready transcription
  const transcription = await getTranscriptionFile(filename);
  if (transcription) {
    return Response.json({
      status: 'COMPLETED',
      transcription,
    });
  }

  // check if already transcribing
  const existingJob = await getJob(filename);

  if (existingJob) {
    return Response.json({
      status: existingJob.TranscriptionJob.TranscriptionJobStatus,
    });
  }

  // creating new transcription job
  if (!existingJob) {
    const newJob = await createTranscriptionJob(filename);
    return Response.json({
      status: newJob.TranscriptionJob.TranscriptionJobStatus,
    });
  }

  return Response.json(null);
}
