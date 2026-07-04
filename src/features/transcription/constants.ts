/** Max size the browser may upload (large edited videos). */
export const MAX_UPLOAD_BYTES = 512 * 1024 * 1024;

export const MAX_UPLOAD_MB = MAX_UPLOAD_BYTES / (1024 * 1024);

/** Extensions accepted when the browser omits a MIME type. */
export const TRANSCRIBE_EXTENSIONS = [
	'mp3',
	'mp4',
	'mpeg',
	'mpga',
	'm4a',
	'wav',
	'webm',
	'ogg',
	'mov',
	'avi',
	'mkv'
] as const;

export const TRANSCRIBE_ACCEPT = 'video/*,audio/*,.mp3,.mp4,.m4a,.wav,.webm,.ogg,.mov,.avi,.mkv';

/** ISO-639-3 language hint for ElevenLabs Scribe (Spanish). */
export const STT_LANGUAGE_CODE = 'spa';

/** Max words per subtitle cue. */
export const MAX_WORDS_PER_SUBTITLE = 3;

/** Start a new cue after this much silence between spoken words (seconds). */
export const SUBTITLE_PAUSE_BREAK_SECONDS = 0.5;
