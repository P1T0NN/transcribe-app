import type { ElevenLabsClient } from '@elevenlabs/elevenlabs-js';
import type {
	MultichannelSpeechToTextResponseModel,
	SpeechToTextChunkResponseModel,
	SpeechToTextWebhookResponseModel
} from '@elevenlabs/elevenlabs-js/api/types';
import {
	MAX_WORDS_PER_SUBTITLE,
	STT_LANGUAGE_CODE
} from '@/features/transcription/constants';
import {
	buildSrtFromTimedWords,
	textFromTimedWords,
	type TimedWord
} from '@/features/transcription/server/buildSrtFromTimedWords';

type SpeechToTextConvertResponse =
	| SpeechToTextChunkResponseModel
	| MultichannelSpeechToTextResponseModel
	| SpeechToTextWebhookResponseModel;

function isMultichannelResponse(
	response: SpeechToTextConvertResponse
): response is MultichannelSpeechToTextResponseModel {
	return 'transcripts' in response;
}

function isChunkResponse(response: SpeechToTextConvertResponse): response is SpeechToTextChunkResponseModel {
	return 'words' in response;
}

function transcriptionChunkFromResponse(response: SpeechToTextConvertResponse): SpeechToTextChunkResponseModel {
	if (isMultichannelResponse(response)) {
		const [first] = response.transcripts;
		if (!first) throw new Error('No speech was detected in the upload.');
		return first;
	}

	if (isChunkResponse(response)) {
		return response;
	}

	throw new Error('Unexpected transcription response from ElevenLabs.');
}

function timedWordsFromTranscription(transcription: SpeechToTextChunkResponseModel): TimedWord[] {
	return transcription.words
		.filter((word) => word.type === 'word' && word.text.trim().length > 0)
		.map((word) => ({
			text: word.text.trim(),
			startSeconds: word.start ?? 0,
			endSeconds: word.end ?? word.start ?? 0
		}));
}

/** Cheap path: Scribe word timestamps → short Spanish SRT cues for manual translation. */
export async function scribeFileToTimedSubtitles(
	client: ElevenLabsClient,
	sourceUrl: string
): Promise<{ text: string; srt: string }> {
	const response = await client.speechToText.convert({
		sourceUrl,
		modelId: 'scribe_v2',
		languageCode: STT_LANGUAGE_CODE,
		timestampsGranularity: 'word'
	});

	const transcription = transcriptionChunkFromResponse(response);
	const words = timedWordsFromTranscription(transcription);
	const text = transcription.text.trim() || textFromTimedWords(words);
	const srt = buildSrtFromTimedWords(words, MAX_WORDS_PER_SUBTITLE);

	return { text, srt };
}
