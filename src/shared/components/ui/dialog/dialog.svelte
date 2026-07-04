<script lang="ts">
	// TYPES
	import type { Snippet } from 'svelte';

	// UTILS
	import { cn } from '@/shared/utils/utils.js';

	// LUCIDE ICONS
	import XIcon from '@lucide/svelte/icons/x';

	type Props = {
		/** Two-way bound open state. */
		open?: boolean;
		/** Optional heading rendered in the dialog header. */
		title?: string;
		/** Extra classes applied to the title heading. */
		titleClass?: string;
		class?: string;
		children: Snippet;
	};

	let { open = $bindable(false), title, titleClass, class: className, children }: Props = $props();

	let dialog = $state<HTMLDialogElement>();

	// Native <dialog> gives us focus-trap, Esc-to-close and the top layer for free.
	$effect(() => {
		if (!dialog) return;
		if (open) dialog.showModal();
		else if (dialog.open) dialog.close();
	});
</script>

<dialog
	bind:this={dialog}
	onclose={() => (open = false)}
	onclick={(e) => {
		// A click whose target is the dialog itself is a backdrop click.
		if (e.target === dialog) open = false;
	}}
	class={cn(
		'm-auto w-[calc(100%-2.5rem)] max-w-lg bg-background p-0 text-foreground shadow-2xl backdrop:bg-foreground/60 backdrop:backdrop-blur-sm',
		className
	)}
>
	{#if open}
		<div class="max-h-[85vh] overflow-y-auto p-6 sm:p-8">
			<div class="flex items-start justify-between gap-4">
				{#if title}
					<h2 class={cn('font-serif text-2xl leading-tight text-foreground', titleClass)}>{title}</h2>
				{/if}

				<button
					type="button"
					onclick={() => (open = false)}
					aria-label="Cerrar"
					class="-mt-2 -mr-2 ml-auto inline-flex size-9 shrink-0 items-center justify-center rounded-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
				>
					<XIcon class="size-5" strokeWidth={1.6} />
				</button>
			</div>

			<div class="mt-4">
				{@render children()}
			</div>
		</div>
	{/if}
</dialog>
