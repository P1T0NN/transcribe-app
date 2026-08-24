import { json } from '@sveltejs/kit';
import {
	transcribeFromUrl,
	validateTranscribeFile
} from '@/features/transcription/server/transcribeFile';
import { createDownloadUrl, deleteObject, headObject } from '@/shared/storage/object-storage';
import type { RequestHandler } from './$types';

export const config = { maxDuration: 300 };

export const POST: RequestHandler = async ({ request }) => {
	let body: unknown;

	try {
		body = await request.json();
	} catch {
		return json({ message: 'Invalid request body.' }, { status: 400 });
	}

	const { key, filename } = (body ?? {}) as { key?: unknown; filename?: unknown };

	if (typeof key !== 'string' || key.length === 0) {
		return json({ message: 'Missing upload reference.' }, { status: 400 });
	}

	if (typeof filename !== 'string' || filename.length === 0) {
		return json({ message: 'A file name is required.' }, { status: 400 });
	}

	let meta;
	try {
		meta = await headObject(key);
	} catch {
		return json({ message: 'Upload not found or expired.' }, { status: 404 });
	}

	const validationError = validateTranscribeFile({
		name: filename,
		type: meta.contentType,
		size: meta.contentLength
	});

	if (validationError) {
		await deleteObject(key).catch(() => {});
		return json({ message: validationError }, { status: 400 });
	}

	try {
		const sourceUrl = await createDownloadUrl(key);
		const { text, srt } = await transcribeFromUrl(sourceUrl);
		return json({ text, srt });
	} catch (err) {
		console.error('[api/transcribe]', err);
		const message = err instanceof Error ? err.message : 'Transcription failed.';
		return json({ message }, { status: 502 });
	} finally {
		await deleteObject(key).catch(() => {});
	}
};
