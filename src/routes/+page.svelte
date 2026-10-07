<script lang="ts">
	import { APP_NAME, APP_SUBTITLE } from '#lib/config.js';
	import { t } from '#lib/i18n/index.js';
</script>

<h1>{APP_NAME} <span class="subtitle">{APP_SUBTITLE}</span></h1>
<p>{t('home.lead')}</p>
<p>{t('home.promise')}</p>
<p class="status">{t('home.status')}</p>

<style>
	h1 {
		margin: 0 0 var(--space-3);
		font-size: 2rem;
		line-height: 1.2;
	}

	.subtitle {
		display: block;
		font-size: 1.125rem;
		font-weight: 400;
		color: var(--color-text-muted);
	}

	.status {
		color: var(--color-text-muted);
	}
</style>
