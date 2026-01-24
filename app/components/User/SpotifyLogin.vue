<template>
	<div class="flex items-center justify-center">
		<div
			class="relative"
		>
			<div
				class="w-full rounded-full bg-none shadow-lg hover:shadow-xl z-0 overflow-hidden gap-4
        dark:shadow-[0_0_20px_rgba(59,130,246,0.4)] hover:dark:shadow-[0_0_30px_rgba(59,130,246,0.6)]
        transition-all duration-300 pointer-events-auto"
			>
				<button
					v-if="user"
					class="flex items-center justify-center relative z-10 bg-card hover:bg-accent/20 gap-4 pr-2
        cursor-pointer p-0 pointer-events-auto"
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
        cursor-pointer p-0 pointer-events-auto"
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
				@click="showDropdown = false"
			>
				<button
					class="w-full text-left px-4 py-2 text-sm hover:bg-accent rounded-lg transition-colors pointer-events-auto"
					@click="handleLogout()"
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

const { getAccessToken, clearToken, loginUser } = useSpotifyOAuthMethods()

const { user } = storeToRefs(userStore)

const showDropdown = ref(false)
const spotifyIcon = "https://upload.wikimedia.org/wikipedia/commons/8/84/Spotify_icon.svg"

const login = async () => {
	await loginUser()
}

const handleLogout = () => {
	logout()
	clearToken()
}

const checkExistingToken = async () => {
	const existingToken = await getAccessToken()
	if (existingToken) {
		await fetchUserProfile(existingToken)
	}
	return existingToken
}
</script>

<style>

</style>
