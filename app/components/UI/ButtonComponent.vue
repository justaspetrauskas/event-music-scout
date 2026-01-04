<template>
	<button
		class="inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none"
		:class="[
			'h-10 px-4 text-sm',
			variant === 'primary' && 'bg-spotify/100 text-white hover:bg-spotify/90 focus-visible:ring-primary/50',
			variant === 'secondary' && 'bg-background text-secondary-foreground hover:bg-spotify/90 border border-secondary/30 focus-visible:ring-secondary/50',
			variant === 'tertiary' && 'bg-transparent text-muted-foreground hover:bg-muted/50 focus-visible:ring-muted/50',
			hasIconOnly && 'p-2 h-10 w-10',
		]"
		:disabled="disabled"
		@click.stop="handleClick($event)"
	>
		<slot name="icon" />
		<slot />
	</button>
</template>

<script setup lang="ts">
interface ButtonProps {
	variant?: "primary" | "secondary" | "tertiary"
	disabled?: boolean
}

const props = withDefaults(defineProps<ButtonProps>(), {
	variant: "primary",
	disabled: false,
})

const emit = defineEmits<{
	(e: "click", event: MouseEvent): void
}>()

const hasIconOnly = computed(() => !!useSlots().icon && !useSlots().default)

const handleClick = (event: MouseEvent) => {
	if (props.disabled) return

	emit("click", event)
}
</script>
