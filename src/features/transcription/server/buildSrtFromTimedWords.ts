import {
	MAX_WORDS_PER_SUBTITLE,
	SUBTITLE_PAUSE_BREAK_SECONDS
} from '@/features/transcription/constants';

export type TimedWord = {
	text: string;
	startSeconds: number;
	endSeconds: number;
};

type SrtCue = {
	startMs: number;
	endMs: number;
	text: string;
};

function formatSrtTimestamp(totalMs: number): string {
	const ms = Math.max(0, Math.round(totalMs));
	const hours = Math.floor(ms / 3_600_000);
	const minutes = Math.floor((ms % 3_600_000) / 60_000);
	const seconds = Math.floor((ms % 60_000) / 1000);
	const millis = ms % 1000;

	return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')},${String(millis).padStart(3, '0')}`;
}

function buildCues(
	words: TimedWord[],
	maxWordsPerCue: number,
	pauseBreakSeconds: number,
	offsetSeconds: number
): SrtCue[] {
	const cues: SrtCue[] = [];
	const offsetMs = offsetSeconds * 1000;

	for (let startIndex = 0; startIndex < words.length; ) {
		let endIndex = Math.min(startIndex + maxWordsPerCue - 1, words.length - 1);

		for (let index = startIndex; index < endIndex; index++) {
			const pauseSeconds = words[index + 1]!.startSeconds - words[index]!.endSeconds;
			if (pauseSeconds >= pauseBreakSeconds) {
				endIndex = index;
				break;
			}
		}

		const chunk = words.slice(startIndex, endIndex + 1);

		cues.push({
			startMs: chunk[0]!.startSeconds * 1000 + offsetMs,
			endMs: chunk[chunk.length - 1]!.endSeconds * 1000 + offsetMs,
			text: chunk.map((word) => word.text).join(' ')
		});

		startIndex = endIndex + 1;
	}

	return cues;
}

export function textFromTimedWords(words: TimedWord[]): string {
	return words
		.map((word) => word.text)
		.filter(Boolean)
		.join(' ');
}

/** Builds SRT from English words that already carry start/end seconds. */
export function buildSrtFromTimedWords(
	words: TimedWord[],
	maxWordsPerCue: number = MAX_WORDS_PER_SUBTITLE,
	pauseBreakSeconds: number = SUBTITLE_PAUSE_BREAK_SECONDS,
	offsetSeconds = 0
): string {
	if (words.length === 0) return '';

	const cues = buildCues(words, maxWordsPerCue, pauseBreakSeconds, offsetSeconds);

	return cues
		.map(
			(cue, index) =>
				`${index + 1}\n${formatSrtTimestamp(cue.startMs)} --> ${formatSrtTimestamp(cue.endMs)}\n${cue.text}`
		)
		.join('\n\n');
}

export const SRT_TIMESTAMP_LINE =
	/(\d{2}:\d{2}:\d{2},\d{3}) --> (\d{2}:\d{2}:\d{2},\d{3})/;

export function parseSrtTimestamp(timestamp: string): number {
	const [clock, ms] = timestamp.split(',');
	const [hours, minutes, seconds] = clock.split(':').map(Number);
	return hours * 3_600_000 + minutes * 60_000 + seconds * 1000 + Number(ms);
}

export function shiftSrtTimestamps(srt: string, offsetSeconds: number): string {
	const offsetMs = offsetSeconds * 1000;

	return srt.replace(SRT_TIMESTAMP_LINE, (_match, start, end) => {
		return `${formatSrtTimestamp(parseSrtTimestamp(start) + offsetMs)} --> ${formatSrtTimestamp(parseSrtTimestamp(end) + offsetMs)}`;
	});
}

export function renumberSrtBlocks(srt: string): string {
	const blocks = srt
		.trim()
		.split(/\n\n+/)
		.filter(Boolean);

	return blocks
		.map((block, index) => {
			const lines = block.split('\n');
			lines[0] = String(index + 1);
			return lines.join('\n');
		})
		.join('\n\n');
}

export function textFromNativeSrt(srt: string): string {
	return srt
		.trim()
		.split(/\n\n+/)
		.filter(Boolean)
		.map((block) => block.split('\n').slice(2).join('\n'))
		.filter(Boolean)
		.join('\n\n');
}
