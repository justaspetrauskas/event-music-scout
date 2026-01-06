export const useSpotifyOAuthMethods = () => {
	const token = ref<string | null>(null)
	const config = useRuntimeConfig()
	const { fetchUserProfile } = useUserStore()
	const { spotifyClientId, spotifyRedirectUri } = config.public

	const getRedirectToAuthCodeFlow = async (): Promise<string> => {
		const verifier = generateCodeVerifier(128)
		const challenge = await generateCodeChallenge(verifier)
		localStorage.setItem("verifier", verifier)

		const scope = "user-read-private user-read-email playlist-modify-public playlist-modify-private playlist-read-private streaming user-read-playback-state user-modify-playback-state"

		const params = new URLSearchParams({
			client_id: spotifyClientId as string,
			response_type: "code",
			redirect_uri: `${spotifyRedirectUri}`,
			scope,
			code_challenge_method: "S256",
			code_challenge: challenge,
		})

		return `https://accounts.spotify.com/authorize?${params.toString()}`
	}

	const generateCodeVerifier = (length: number): string => {
		const possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
		let text = ""
		for (let i = 0; i < length; i++) {
			text += possible.charAt(Math.floor(Math.random() * possible.length))
		}
		return text
	}

	const generateCodeChallenge = async (codeVerifier: string): Promise<string> => {
		const data = new TextEncoder().encode(codeVerifier)
		const digest = await window.crypto.subtle.digest("SHA-256", data)
		return btoa(String.fromCharCode(...new Uint8Array(digest)))
			.replace(/\+/g, "-")
			.replace(/\//g, "_")
			.replace(/=+$/, "")
	}

	const handleOpenSpotifyOAuthWindow = async () => {
		const url = await getRedirectToAuthCodeFlow()

		const windowFeatures = "width=800,height=600,left=100,top=100"

		const authWindow = window.open(url, "_blank", windowFeatures)
		if (authWindow) {
			const handleMessage = async (event: MessageEvent) => {
				if (event.origin === window.location.origin) {
					if (event.data.success) {
						window.removeEventListener("message", handleMessage)
						authWindow.close()
						const token = await getAccessToken()
						if (token) {
							await fetchUserProfile(token)
						}
					}
				}
			}

			window.addEventListener("message", handleMessage)
		}
	}

	const getAuthorizationToken = async (code: string, verifier: string | null): Promise<string | null> => {
		if (!verifier || !code) return null

		const params = {
			grant_type: "authorization_code",
			code,
			code_verifier: verifier!,
		}

		const { access_token } = await $fetch("/api/spotify/auth/token", { method: "POST", body: params })
		return access_token
	}

	const getAccessToken = async (): Promise<string | null> => {
		if (token.value) return token.value

		const res = await $fetch<{ access_token: string | null }>("/api/spotify/auth/refresh-token")

		if (res.access_token) {
			token.value = res.access_token
			return token.value
		}

		return null
	}

	const clearToken = () => {
		token.value = null
	}

	return { getRedirectToAuthCodeFlow, getAuthorizationToken, getAccessToken, clearToken, handleOpenSpotifyOAuthWindow }
}
