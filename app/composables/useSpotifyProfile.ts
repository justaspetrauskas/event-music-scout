export const useSpotifyProfile = () => {
	const fetchProfile = async (accessToken: string) => {
		const profile = await $fetch("/api/spotify/me", {
			method: "GET",
			headers: {
				Authorization: `Bearer ${accessToken}`,
			} })

		return profile
	}

	const logout = async () => {
		try {
			await $fetch("/api/spotify/logout", { method: "POST" })
			clearNuxtData()
		}
		catch (error) {
			console.error("Logout failed", error)
		}
	}

	return { fetchProfile, logout }
}
