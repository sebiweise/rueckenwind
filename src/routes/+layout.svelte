<script lang="ts">
	import '../app.css';
	import favicon from '#lib/assets/favicon.svg';
	import { APP_NAME, APP_TITLE } from '#lib/config.js';
	import { t } from '#lib/i18n/index.js';
	import type { LayoutProps } from './$types';

	let { children }: LayoutProps = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<title>{APP_TITLE}</title>
</svelte:head>

<div class="shell">
	<header>
		<span class="brand">{APP_NAME}</span>
	</header>

	<main>
		{@render children()}
	</main>

	<footer>
		<p>{t('footer.disclaimer')}</p>
	</footer>
</div>

<style>
	.shell {
		display: flex;
		flex-direction: column;
		min-height: 100vh;
		max-width: var(--content-width);
		margin: 0 auto;
		padding: 0 var(--space-3);
	}

	header {
		display: flex;
		align-items: center;
		min-height: calc(var(--touch-target) + var(--space-3));
		border-bottom: 1px solid var(--color-border);
	}

	.brand {
		font-weight: 600;
	}

	main {
		flex: 1;
		padding: var(--space-4) 0;
	}

	footer {
		border-top: 1px solid var(--color-border);
		color: var(--color-text-muted);
		font-size: 0.9375rem;
	}
</style>
