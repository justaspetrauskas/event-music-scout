import { ref } from "vue"
import type { User } from "@@/types"

export const useUserStore = defineStore("userStore", () => {
	const { clearAllSelectedTracks } = usePlaylistStore()

	const user = ref<User | null>(null)
	const loading = ref(false)
	const error = ref<string | null>(null)

	const setUser = (profile: User | null) => {
		user.value = profile
	}

	const fetchUserProfile = async () => {
		const profile = await $fetch("/api/spotify/me")

		if (profile.id) {
			setUser(profile)
		}
	}

	const logout = async () => {
		try {
			await $fetch("/api/spotify/logout", { method: "POST" })
			setUser(null)
			clearAllSelectedTracks()
		}
		catch (error) {
			console.error("Logout failed", error)
		}
	}

	return {
		user,
		loading,
		error,
		setUser,
		fetchUserProfile,
		logout,
	}
})
