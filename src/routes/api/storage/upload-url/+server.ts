import { json } from '@sveltejs/kit';
import { MAX_UPLOAD_BYTES, MAX_UPLOAD_MB } from '@/features/transcription/constants';
import { validateTranscribeFile } from '@/features/transcription/server/transcribeFile';
import { createObjectKey, createUploadUrl } from '@/shared/storage/object-storage';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request }) => {
	let body: unknown;

	try {
		body = await request.json();
	} catch {
		return json({ message: 'Invalid request body.' }, { status: 400 });
	}

	const { filename, contentType, size } = (body ?? {}) as {
		filename?: unknown;
		contentType?: unknown;
		size?: unknown;
	};

	if (typeof filename !== 'string' || filename.length === 0) {
		return json({ message: 'A file name is required.' }, { status: 400 });
	}

	if (typeof contentType !== 'string' || contentType.length === 0) {
		return json({ message: 'A content type is required.' }, { status: 400 });
	}

	if (typeof size !== 'number' || !Number.isFinite(size) || size <= 0) {
		return json({ message: 'A valid file size is required.' }, { status: 400 });
	}

	if (size > MAX_UPLOAD_BYTES) {
		return json({ message: `File must be ${MAX_UPLOAD_MB} MB or smaller.` }, { status: 413 });
	}

	const validationError = validateTranscribeFile({ name: filename, type: contentType, size });
	if (validationError) {
		return json({ message: validationError }, { status: 400 });
	}

	try {
		const key = createObjectKey(filename);
		const uploadUrl = await createUploadUrl(key, contentType);
		return json({ key, uploadUrl });
	} catch (err) {
		console.error('[api/storage/upload-url]', err);
		const message = err instanceof Error ? err.message : 'Could not prepare the upload.';
		return json({ message }, { status: 500 });
	}
};
