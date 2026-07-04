<script lang="ts">
	// COMPONENTS
	import Dialog from '@/shared/components/ui/dialog/dialog.svelte';
	import { Button, buttonVariants, type ButtonSize, type ButtonVariant } from '@/shared/components/ui/button/index.js';
	import Spinner from '@/shared/components/ui/spinner/spinner.svelte';

	// UTILS
	import { cn } from '@/shared/utils/utils.js';
	import { m } from '@/shared/lib/paraglide/messages';

	type Props = {
		/** Confirmed-action handler. Invoked after the user clicks the dialog's confirm button. */
		function: () => Promise<void> | void;
		/** Trigger content (icon, label, count, etc.). */
		children: import('svelte').Snippet;
		/** Button variant applied to the trigger button. */
		variant?: ButtonVariant;
		/** Trigger button size. */
		size?: ButtonSize;
		class?: string;
		/** Shows a spinner on the confirm action and disables it while the action is running. */
		isPending?: boolean;
		/** When true, renders the confirm action as disabled. Use for form-validity / typed-confirm gates. */
		actionDisabled?: boolean;
		/** When true, the dialog gets destructive styling (red-tinted title, destructive action button). */
		isDestructive?: boolean;
		/** When true, the proceed/action button is hidden — only the cancel button remains. */
		hideProceed?: boolean;
		/** Dialog copy overrides; fall back to default confirmation copy. */
		title?: string;
		description?: string;
		/** Optional form fields or context rendered between the description and the footer. */
		body?: import('svelte').Snippet;
	};

	let {
		function: actionFunction,
		children,
		variant = 'default',
		size = 'sm',
		class: className,
		isPending = false,
		actionDisabled = false,
		isDestructive = false,
		hideProceed = false,
		title,
		description,
		body
	}: Props = $props();

	let open = $state(false);
	let running = $state(false);

	const triggerClass = $derived(cn(buttonVariants({ variant, size }), className));
	const actionClass = $derived(
		buttonVariants({ variant: isDestructive ? 'destructive' : 'default' })
	);
	const resolvedTitle = $derived(title ?? m['AlertDialogButton.title']());
	const resolvedDescription = $derived(description ?? m['AlertDialogButton.description']());
	const showSpinner = $derived(running || isPending);
	const proceedDisabled = $derived(actionDisabled || showSpinner);

	async function handleProceed() {
		if (proceedDisabled) return;

		running = true;
		try {
			await actionFunction();
			open = false;
		} finally {
			running = false;
		}
	}
</script>

<button type="button" class={triggerClass} onclick={() => (open = true)}>
	{@render children()}
</button>

<Dialog
	bind:open
	title={resolvedTitle}
	titleClass={isDestructive ? 'text-destructive' : undefined}
>
	<p class="text-sm text-muted-foreground">{resolvedDescription}</p>

	{#if body}
		<div class="mt-4">
			{@render body()}
		</div>
	{/if}

	<div class="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
		<Button variant="outline" onclick={() => (open = false)}>
			{m['AlertDialogButton.cancel']()}
		</Button>

		{#if !hideProceed}
			<Button class={actionClass} disabled={proceedDisabled} onclick={handleProceed}>
				{#if showSpinner}
					<Spinner class="size-4" />
				{/if}
				{m['AlertDialogButton.proceed']()}
			</Button>
		{/if}
	</div>
</Dialog>
