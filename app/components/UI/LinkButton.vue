<template>
	<a
		class="inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none group"
		:class="[
			'h-10 px-4 text-sm',
			'bg-background text-secondary-foreground hover:bg-spotify/90 border border-secondary/30 focus-visible:ring-secondary/50',
			hasIconOnly && 'p-2 h-10 w-10',
			disabled && 'opacity-50 pointer-events-none',
		]"
		:href="href"
		target="_blank"
		rel="noopener noreferrer"
		:aria-disabled="disabled"
		:aria-label="ariaLabel || undefined"
		:tabindex="disabled ? -1 : 0"
	>
		<slot name="icon" />
		<slot />
	</a>
</template>

<script lang="ts" setup>
defineProps<{
	href: string
	disabled?: boolean
	ariaLabel?: string
	hasIconOnly?: boolean
}>()
</script>

<style>

</style>
