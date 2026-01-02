
import { S3Client } from '@aws-sdk/client-s3';

const region = process.env.STORAGE_REGION || 'us-east-1'; // Default or from env
const endpoint = process.env.STORAGE_PUBLIC_URL
// Try to extract endpoint from public URL, or let it be undefined if user provides full endpoint endpoint var. 
// Actually for Supabase S3, the endpoint is usually `https://<project-ref>.supabase.co/storage/v1/s3`
// But user provided STORAGE_PUBLIC_URL which is like `https://<project-ref>.supabase.co/storage/v1/object/public/<bucket>`
// Let's assume for now we might need to derive it or hardcode.
// A common pattern is: https://<project_id>.supabase.co/storage/v1/s3
// Let's just use the region and credentials for now, and see if we can infer endpoint or if default AWS endpoint is wrong (it will be).
// Wait, if they are using Supabase, they MUST provide the endpoint.
// Let's look at the keys again:
// STORAGE_REGION, STORAGE_ACCESS_KEY, STORAGE_SECRET_KEY, STORAGE_BUCKET_NAME, STORAGE_PUBLIC_URL

// If I don't have a specific endpoint, S3Client defaults to AWS. This won't work for Supabase.
// Supabase S3 endpoint format: https://[project-ref].supabase.co/storage/v1/s3
// I can try to extract project-ref from STORAGE_PUBLIC_URL?
// STORAGE_PUBLIC_URL usually: https://[project-ref].supabase.co/storage/v1/object/public/[bucket]
// So endpoint = https://[project-ref].supabase.co/storage/v1/s3

function getEndpoint(publicUrl: string | undefined): string | undefined {
  if (!publicUrl) return undefined;
  try {
    const url = new URL(publicUrl);
    // Remove the object/public/... part
    return `${url.protocol}//${url.host}/storage/v1/s3`;
  } catch (e) {
    return undefined;
  }
}

export const s3Client = new S3Client({
  forcePathStyle: true, // Required for Supabase S3
  region: process.env.STORAGE_REGION || 'eu-central-1',
  endpoint: getEndpoint(process.env.STORAGE_PUBLIC_URL),
  credentials: {
    accessKeyId: process.env.STORAGE_ACCESS_KEY!,
    secretAccessKey: process.env.STORAGE_SECRET_KEY!,
  },
});

export const bucketName = process.env.STORAGE_BUCKET_NAME || 'uploads';
export const publicUrlPrefix = process.env.STORAGE_PUBLIC_URL;
