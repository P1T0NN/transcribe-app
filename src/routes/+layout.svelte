<script lang="ts">
	import './layout.css';
	import favicon from '@/shared/lib/assets/favicon.svg';

	// SVELTEKIT IMPORTS
	import { dev } from '$app/environment';

	// LIBRARIES
	import { ModeWatcher } from "mode-watcher";

	// COMPONENTS
	import { Toaster } from '@/shared/components/ui/sonner';
	import NormalHeader from '@/shared/components/ui/header/normal-header/normal-header.svelte';
	import Footer from '@/shared/components/ui/footer/footer.svelte';

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<ModeWatcher disableHeadScriptInjection />
<div class="flex min-h-dvh flex-col">
	<NormalHeader changeBgOnScroll={true} />
	<div class="min-h-0 flex-1">
		{@render children()}
	</div>
	<Footer />
</div>
<Toaster richColors />
