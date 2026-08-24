import { ElevenLabsClient } from '@elevenlabs/elevenlabs-js';
import { env } from '$env/dynamic/private';
import {
	MAX_UPLOAD_BYTES,
	MAX_UPLOAD_MB,
	TRANSCRIBE_EXTENSIONS
} from '@/features/transcription/constants';
import { scribeFileToTimedSubtitles } from '@/features/transcription/server/scribeToTimedSubtitles';

const MIME_PREFIXES = ['audio/', 'video/'] as const;

export type TranscribeFileMeta = {
	name: string;
	type: string;
	size: number;
};

export type TranscriptionResult = {
	text: string;
	srt: string;
};

function hasAllowedExtension(name: string): boolean {
	const ext = name.split('.').pop()?.toLowerCase();
	return ext ? TRANSCRIBE_EXTENSIONS.includes(ext as (typeof TRANSCRIBE_EXTENSIONS)[number]) : false;
}

export function isTranscribableFile(meta: TranscribeFileMeta): boolean {
	if (meta.type && MIME_PREFIXES.some((prefix) => meta.type.startsWith(prefix))) {
		return true;
	}
	return hasAllowedExtension(meta.name);
}

export function validateTranscribeFile(meta: TranscribeFileMeta): string | null {
	if (meta.size === 0) return 'The file is empty.';
	if (meta.size > MAX_UPLOAD_BYTES) {
		return `File must be ${MAX_UPLOAD_MB} MB or smaller.`;
	}
	if (!isTranscribableFile(meta)) {
		return 'Upload a supported audio or video file (MP3, MP4, WAV, WebM, etc.).';
	}
	return null;
}

/**
 * Transcribe a file that has already been uploaded to object storage, by
 * handing ElevenLabs a presigned URL it can fetch directly (no server-side
 * download, so serverless memory stays flat).
 */
export async function transcribeFromUrl(sourceUrl: string): Promise<TranscriptionResult> {
	const apiKey = env.ELEVENLABS_API_KEY;
	if (!apiKey) {
		throw new Error('ElevenLabs API key is not configured.');
	}

	const client = new ElevenLabsClient({ apiKey });

	return scribeFileToTimedSubtitles(client, sourceUrl);
}
