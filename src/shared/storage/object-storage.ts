// S3-compatible object storage client (Cloudflare R2, AWS S3, MinIO, ...).
// Configured via environment variables so the rest of the app stays backend-agnostic.
import { env } from '$env/dynamic/private';
import {
	DeleteObjectCommand,
	GetObjectCommand,
	HeadObjectCommand,
	PutObjectCommand,
	S3Client
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

export type ObjectMetadata = {
	contentType: string;
	contentLength: number;
};

let client: S3Client | undefined;

function getClient(): S3Client {
	if (!client) {
		const endpoint = env.R2_ENDPOINT;
		const accessKeyId = env.R2_ACCESS_KEY_ID;
		const secretAccessKey = env.R2_SECRET_ACCESS_KEY;

		if (!endpoint || !accessKeyId || !secretAccessKey) {
			throw new Error(
				'Object storage is not configured (R2_ENDPOINT, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY).'
			);
		}

		client = new S3Client({
			region: 'auto',
			endpoint,
			credentials: { accessKeyId, secretAccessKey }
		});
	}

	return client;
}

function getBucket(): string {
	const bucket = env.R2_BUCKET_NAME;
	if (!bucket) {
		throw new Error('Object storage bucket is not configured (R2_BUCKET_NAME).');
	}
	return bucket;
}

/**
 * Presigned URL the browser uses to PUT an object directly to storage.
 * The `contentType` is baked into the signature, so the client must send the
 * exact same `Content-Type` header when uploading.
 */
export async function createUploadUrl(key: string, contentType: string): Promise<string> {
	return getSignedUrl(
		getClient(),
		new PutObjectCommand({ Bucket: getBucket(), Key: key, ContentType: contentType }),
		{ expiresIn: 600 }
	);
}

/**
 * Presigned URL for reading an object. Used to hand a private object to a
 * third party (e.g. ElevenLabs) without exposing bucket credentials.
 */
export async function createDownloadUrl(key: string): Promise<string> {
	return getSignedUrl(getClient(), new GetObjectCommand({ Bucket: getBucket(), Key: key }), {
		expiresIn: 1800
	});
}

/** Metadata (size + content type) without downloading the object. */
export async function headObject(key: string): Promise<ObjectMetadata> {
	const response = await getClient().send(
		new HeadObjectCommand({ Bucket: getBucket(), Key: key })
	);

	return {
		contentType: response.ContentType ?? 'application/octet-stream',
		contentLength: response.ContentLength ?? 0
	};
}

/** Best-effort cleanup of a previously uploaded object. */
export async function deleteObject(key: string): Promise<void> {
	await getClient().send(new DeleteObjectCommand({ Bucket: getBucket(), Key: key }));
}

/** Build a safe, namespaced storage key for an uploaded file. */
export function createObjectKey(filename: string): string {
	const ext = filename.split('.').pop()?.toLowerCase().replace(/[^a-z0-9]/g, '') ?? 'bin';
	const id = crypto.randomUUID();
	return `transcribe/${new Date().toISOString().slice(0, 10)}/${id}.${ext}`;
}
