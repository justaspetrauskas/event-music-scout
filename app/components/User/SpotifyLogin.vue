<template>
	<div class="flex items-center justify-center">
		<!-- Logged In: Dual circles avatar -->
		<div
			v-if="isLoggedIn"
			class="relative"
		>
			<!-- Outer glow circle -->
			<div
				class="w-full h-11 rounded-full bg-none border-border/50 border-2 shadow-lg hover:shadow-xl inset-0 z-0 overflow-hidden gap-4
        dark:shadow-[0_0_20px_rgba(59,130,246,0.4)] hover:dark:shadow-[0_0_30px_rgba(59,130,246,0.6)]
        transition-all duration-300"
			>
				<!-- Inner avatar button -->
				<button
					class="flex items-center justify-center relative z-10 bg-card hover:bg-accent/20 gap-4 dark:text-gray-200
        cursor-pointer p-0"
					@click="showDropdown = !showDropdown"
				>
					<img
						:src="user!.images[1]?.url || '/default-avatar.png'"
						alt="Spotify Avatar"
						class="w-10 h-auto rounded-full object-cover"
					>
					<span>{{ user!.display_name }}</span>
					<ChevronDown
						class="w-4 h-4 transition-all text-gray-800 dark:text-gray-200 "
						:class="{ 'rotate-180': showDropdown }"
					/>
				</button>
			</div>

			<!-- Dropdown -->
			<div
				v-show="showDropdown"
				class="absolute top-full right-0 mt-2 w-48 bg-card border border-border rounded-xl shadow-2xl py-2 z-50 dark:text-gray-200"
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

		<!-- Logged Out: Dual circles Spotify -->
		<div
			v-else
			class="relative"
		>
			<!-- Outer Spotify glow -->
			<div
				class="w-11 h-11 rounded-full bg-green-500/20 border-2 border-green-400/50 shadow-lg hover:shadow-xl absolute inset-0 z-0
        dark:shadow-[0_0_25px_rgba(34,197,94,0.5)] hover:dark:shadow-[0_0_35px_rgba(34,197,94,0.7)]
        transition-all duration-300"
			>
				<!-- Inner Spotify button -->
				<button
					class="w-10 h-10 flex items-center justify-center rounded-full bg-green-500 hover:bg-green-600 border border-green-400/30 relative z-10 p-0"
					@click="login()"
				>
					<img
						:src="spotifyIcon"
						alt="Spotify"
						class="w-6 h-6"
					>
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
