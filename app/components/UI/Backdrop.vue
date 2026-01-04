<template>
	<Teleport to="body">
		<div
			class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-lg"
			@click="emit('background-click')"
		>
			<slot />
		</div>
	</Teleport>
</template>

<script lang="ts" setup>
const emit = defineEmits(["background-click"])
</script>

<style>

</style>
