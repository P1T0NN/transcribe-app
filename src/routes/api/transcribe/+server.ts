import { json } from '@sveltejs/kit';
import {
	transcribeUploadedFile,
	validateTranscribeFile
} from '@/features/transcription/server/transcribeFile';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request }) => {
	let formData: FormData;

	try {
		formData = await request.formData();
	} catch {
		return json({ message: 'Could not read the upload.' }, { status: 400 });
	}

	const file = formData.get('file');

	if (!(file instanceof File)) {
		return json({ message: 'A video or audio file is required.' }, { status: 400 });
	}

	const validationError = validateTranscribeFile(file);
	if (validationError) {
		return json({ message: validationError }, { status: 400 });
	}

	try {
		const { text, srt } = await transcribeUploadedFile(file);
		return json({ text, srt });
	} catch (err) {
		console.error('[api/transcribe]', err);
		const message = err instanceof Error ? err.message : 'Transcription failed.';
		return json({ message }, { status: 502 });
	}
};
