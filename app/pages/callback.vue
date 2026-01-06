<template>
	<div class="flex items-center justify-center h-[100vh]">
		<h4>
			Processing Spotify authentication...
		</h4>
	</div>
</template>

<script setup lang="ts">
import { onMounted } from "vue"

const { getAuthorizationToken } = useSpotifyOAuthMethods()

const code = ref<string | null>(null)
const verifier = ref<string | null>(null)

definePageMeta({
	layout: false,
})

const onAuthWindowInit = async () => {
	const params = new URLSearchParams(window.location.search)
	code.value = params.get("code")

	if (code.value && window.opener) {
		verifier.value = window.opener.localStorage.getItem("verifier")
		await getAuthorizationToken(code.value, verifier.value)
		window.opener.postMessage({ success: true }, window.location.origin)
		window.close()
	}
	else {
		console.error("Authorization code missing or no opener window.")
	}
}

onMounted(() => {
	onAuthWindowInit()
})
</script>
