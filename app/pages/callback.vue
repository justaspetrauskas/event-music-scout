<template>
	<div>
		<h1>Processing Spotify authentication...</h1>
	</div>
</template>

<script setup lang="ts">
import { onMounted } from "vue"

const { getAuthorizationToken } = useSpotifyOAuthMethods()

const code = ref<string | null>(null)
const verifier = ref<string | null>(null)

const onAuthWindowInit = async () => {
	const params = new URLSearchParams(window.location.search)
	code.value = params.get("code")

	if (code.value && window.opener) {
		verifier.value = window.opener.localStorage.getItem("verifier")
		await getAuthorizationToken(code.value, verifier.value)
		// window.opener.localStorage.setItem("accessToken", accessToken)
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
