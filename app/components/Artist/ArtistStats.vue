<template>
	<div class="flex items-start gap-1">
		<div class="flex items-center gap-2">
			<Users class="w-3.5 h-3.5" />
			<span class="font-medium">{{ followers }}</span>
			<span class="">followers</span>
		</div>
	</div>
</template>

<script lang="ts" setup>
import { Users, Heart } from "lucide-vue-next"

defineProps<{
	popularity: number
	followers: number
}>()
</script>

<style>

</style>
