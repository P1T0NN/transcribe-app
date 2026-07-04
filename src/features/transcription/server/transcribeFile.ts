import { ElevenLabsClient } from '@elevenlabs/elevenlabs-js';
import { env } from '$env/dynamic/private';
import {
	MAX_UPLOAD_BYTES,
	MAX_UPLOAD_MB,
	TRANSCRIBE_EXTENSIONS
} from '@/features/transcription/constants';
import { scribeFileToTimedSubtitles } from '@/features/transcription/server/scribeToTimedSubtitles';

const MIME_PREFIXES = ['audio/', 'video/'] as const;

export type TranscriptionResult = {
	text: string;
	srt: string;
};

function hasAllowedExtension(name: string): boolean {
	const ext = name.split('.').pop()?.toLowerCase();
	return ext ? TRANSCRIBE_EXTENSIONS.includes(ext as (typeof TRANSCRIBE_EXTENSIONS)[number]) : false;
}

export function isTranscribableFile(file: File): boolean {
	if (file.type && MIME_PREFIXES.some((prefix) => file.type.startsWith(prefix))) {
		return true;
	}
	return hasAllowedExtension(file.name);
}

export function validateTranscribeFile(file: File): string | null {
	if (file.size === 0) return 'The file is empty.';
	if (file.size > MAX_UPLOAD_BYTES) {
		return `File must be ${MAX_UPLOAD_MB} MB or smaller.`;
	}
	if (!isTranscribableFile(file)) {
		return 'Upload a supported audio or video file (MP3, MP4, WAV, WebM, etc.).';
	}
	return null;
}

export async function transcribeUploadedFile(file: File): Promise<TranscriptionResult> {
	const apiKey = env.ELEVENLABS_API_KEY;
	if (!apiKey) {
		throw new Error('ElevenLabs API key is not configured.');
	}

	const client = new ElevenLabsClient({ apiKey });

	return scribeFileToTimedSubtitles(client, file);
}
