<template>
	<div>
		<h1>Processing Spotify authentication...</h1>
	</div>
</template>

<script setup lang="ts">
import { onMounted } from "vue"

const { getAccessToken } = useSpotifyOAuthMethods()

const code = ref<string | null>(null)
const verifier = ref<string | null>(null)

const onAuthWindowInit = async () => {
	const params = new URLSearchParams(window.location.search)
	code.value = params.get("code")
	// if (window.location.hostname === "[::1]") {
	// 	const newUrl = window.location.href.replace("[::1]", "localhost")
	// 	window.location.replace(newUrl)
	// }

	if (code.value && window.opener) {
		// Send the authorization code immediately back to the main window
		verifier.value = window.opener.localStorage.getItem("verifier")
		const accessToken = await getAccessToken(code.value, verifier.value)
		window.opener.localStorage.setItem("accessToken", accessToken)
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
