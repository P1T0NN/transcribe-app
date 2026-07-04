<script lang="ts">
	import { toast } from 'svelte-sonner';

	import UploadFileSingle from '@/features/uploadFile/components/upload-file-single/upload-file-single.svelte';
	import {
		MAX_UPLOAD_MB,
		TRANSCRIBE_ACCEPT
	} from '@/features/transcription/constants';
	import { Button } from '@/shared/components/ui/button/index.js';
	import CopyButton from '@/shared/components/ui/copy-button/copy-button.svelte';
	import Section from '@/shared/components/ui/section/section.svelte';
	import Spinner from '@/shared/components/ui/spinner/spinner.svelte';
	import { Textarea } from '@/shared/components/ui/textarea/index.js';

	let file = $state<File | null>(null);
	let transcript = $state('');
	let subtitles = $state('');
	let transcribing = $state(false);

	const canTranscribe = $derived(Boolean(file) && !transcribing);
	const baseName = $derived(file ? file.name.replace(/\.[^.]+$/, '') || 'transcript' : 'transcript');
	const textDownloadName = $derived(`${baseName}.txt`);
	const srtDownloadName = $derived(`${baseName}.srt`);

	async function transcribe() {
		if (!file || transcribing) return;

		transcribing = true;
		transcript = '';
		subtitles = '';

		try {
			const formData = new FormData();
			formData.set('file', file);

			const response = await fetch('/api/transcribe', {
				method: 'POST',
				body: formData
			});

			const payload = (await response.json().catch(() => null)) as
				| { text?: string; srt?: string; message?: string }
				| null;

			if (!response.ok) {
				throw new Error(payload?.message ?? 'Transcription failed.');
			}

			transcript = payload?.text?.trim() ?? '';
			subtitles = payload?.srt?.trim() ?? '';

			if (!transcript && !subtitles) {
				toast.info('Transcription finished, but no speech was detected.');
				return;
			}

			toast.success('Spanish transcript and timed SRT are ready.');
		} catch (err) {
			const message = err instanceof Error ? err.message : 'Transcription failed.';
			toast.error(message);
		} finally {
			transcribing = false;
		}
	}

	function downloadFile(content: string, filename: string, type: string) {
		const blob = new Blob([content], { type });
		const url = URL.createObjectURL(blob);
		const anchor = document.createElement('a');
		anchor.href = url;
		anchor.download = filename;
		anchor.click();
		URL.revokeObjectURL(url);
	}
</script>

<Section yPadding="lg" containerClass="mx-auto flex w-full max-w-3xl flex-col gap-8">
	<div class="space-y-2 text-center">
		<h1 class="text-foreground text-3xl font-semibold tracking-tight sm:text-4xl">
			Transcribe your videos
		</h1>
		<p class="text-muted-foreground mx-auto max-w-prose text-base sm:text-lg">
			Upload Spanish video or audio (up to {MAX_UPLOAD_MB} MB). ElevenLabs Scribe returns a Spanish
			transcript and a timed SRT with short synced cues. Paste the SRT into ChatGPT to translate the
			cue text to English and keep the timestamps.
		</p>
	</div>

	<div class="flex flex-col gap-4">
		<UploadFileSingle bind:file accept={TRANSCRIBE_ACCEPT} disabled={transcribing} />

		<Button type="button" class="w-full" disabled={!canTranscribe} onclick={transcribe}>
			{#if transcribing}
				<Spinner class="size-4" />
				Transcribing… this may take a few minutes for long videos.
			{:else}
				Transcribe
			{/if}
		</Button>
	</div>

	{#if transcript || subtitles}
		<div class="space-y-6">
			{#if transcript}
				<div class="space-y-3">
					<div class="flex items-center justify-between gap-3">
						<h2 class="text-foreground text-lg font-medium">Spanish transcript</h2>
						<div class="flex items-center gap-1">
							<CopyButton value={transcript} label="Copy transcript" />
							<Button
								type="button"
								variant="outline"
								size="sm"
								onclick={() =>
									downloadFile(transcript, textDownloadName, 'text/plain;charset=utf-8')}
							>
								Download .txt
							</Button>
						</div>
					</div>

					<Textarea
						value={transcript}
						readonly
						rows={10}
						class="min-h-40 resize-y font-mono text-sm leading-relaxed"
					/>
				</div>
			{/if}

			{#if subtitles}
				<div class="space-y-3">
					<div class="flex items-center justify-between gap-3">
						<h2 class="text-foreground text-lg font-medium">Timed subtitles (SRT)</h2>
						<div class="flex items-center gap-1">
							<CopyButton value={subtitles} label="Copy subtitles" />
							<Button
								type="button"
								variant="outline"
								size="sm"
								onclick={() => downloadFile(subtitles, srtDownloadName, 'application/x-subrip')}
							>
								Download .srt
							</Button>
						</div>
					</div>

					<p class="text-muted-foreground text-sm">
						Spanish cue text with sync timing. Copy or download, then ask ChatGPT to translate only
						the subtitle lines to English without changing numbers or timestamps.
					</p>

					<Textarea
						value={subtitles}
						readonly
						rows={10}
						class="min-h-40 resize-y font-mono text-sm leading-relaxed"
					/>
				</div>
			{/if}
		</div>
	{/if}
</Section>
