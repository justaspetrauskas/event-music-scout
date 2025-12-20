<template>
	<div class="flex items-center justify-center">
		<div
			class="relative"
		>
			<div
				class="w-full h-11 rounded-full bg-none border-border/50 border-2 shadow-lg hover:shadow-xl inset-0 z-0 overflow-hidden gap-4
        dark:shadow-[0_0_20px_rgba(59,130,246,0.4)] hover:dark:shadow-[0_0_30px_rgba(59,130,246,0.6)]
        transition-all duration-300"
			>
				<button
					v-if="isLoggedIn"
					class="flex items-center justify-center relative z-10 bg-card hover:bg-accent/20 gap-4 pr-4
        cursor-pointer p-0"
					@click="showDropdown = !showDropdown"
				>
					<img
						:src="user!.images[1]?.url"
						alt="Spotify Avatar"
						class="w-10 h-auto rounded-full object-cover"
					>
					<ChevronDown
						class="w-4 h-4 transition-all"
						:class="{ 'rotate-180': showDropdown }"
					/>
				</button>

				<button
					v-else
					class="flex items-center justify-center relative z-10 bg-card hover:bg-accent/20 gap-4 pr-4
        cursor-pointer p-0"
					@click="login()"
				>
					<img
						:src="spotifyIcon"
						alt="Spotify"
						class="w-10 h-auto rounded-full object-cover"
					>
					<span>Login with Spotify</span>
				</button>
			</div>

			<!-- Dropdown -->
			<div
				v-if="showDropdown"
				class="absolute top-full right-0 mt-2 w-full bg-card border border-border rounded-xl shadow-xl py-2 z-50"
				@click.outside="showDropdown = false"
			>
				<button
					class="w-full text-left px-4 py-2 text-sm hover:bg-accent rounded-lg transition-colors"
					@click="logout"
				>
					Logout
				</button>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { ChevronDown } from "lucide-vue-next"
import { ref } from "vue"

const { getAccessToken, handleOpenSpotifyOAuthWindow } = useSpotifyOAuthMethods()
const { fetchProfile } = useSpotifyProfile()
const userStore = useUserStore()
const { user } = storeToRefs(userStore)
const { setUser } = useUserStore()

const isLoggedIn = ref(false)
const showDropdown = ref(false)
const spotifyIcon = "https://upload.wikimedia.org/wikipedia/commons/8/84/Spotify_icon.svg"

const login = async () => {
	const hasExistingToken = await checkExistingToken()
	if (!hasExistingToken) {
		await handleOpenSpotifyOAuthWindow()
	}
}

const logout = () => {
	// Clear user session
	// isLoggedIn.value = false
}

const checkExistingToken = async () => {
	const existingToken = await getAccessToken()
	if (existingToken) {
		console.log("Using cached access token")
		const profile = await fetchProfile(existingToken)
		if (profile.id) {
			setUser(profile)
			isLoggedIn.value = true
		}
	}
	return existingToken
}

onMounted(() => {
	checkExistingToken()
})
</script>

<style>

</style>
