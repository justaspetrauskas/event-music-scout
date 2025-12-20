export const useSpotifyProfile = () => {
	const fetchProfile = async (accessToken: string) => {
		const profile = await $fetch("/api/spotify/me", {
			method: "GET",
			headers: {
				Authorization: `Bearer ${accessToken}`,
			} })

		return profile
	}

	return { fetchProfile }
}
