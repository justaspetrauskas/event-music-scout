<template>
	<div class="flex items-center justify-center h-[100vh]">
		<h4>
			Processing Spotify authentication...
		</h4>
	</div>
</template>

<script setup lang="ts">
import { onMounted } from "vue"

definePageMeta({
	layout: false,
})

const checkUserSession = async () => {
	const { code, state } = useRoute().query
	const { success } = await $fetch<{ success: boolean }>("/api/spotify/auth/callback", { query: { code, state } })

	if (success) {
		window.close()
	}
	else {
		console.error("Authentication failed. Should try to login again???")
	}
}

onMounted(() => {
	checkUserSession()
})
</script>
