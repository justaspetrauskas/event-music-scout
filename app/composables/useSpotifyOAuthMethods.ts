export const useSpotifyOAuthMethods = () => {
	const config = useRuntimeConfig()
	const { spotifyClientId, spotifyRedirectUri } = config.public

	const getRedirectToAuthCodeFlow = async (): Promise<string> => {
		const verifier = generateCodeVerifier(128)
		const challenge = await generateCodeChallenge(verifier)
		localStorage.setItem("verifier", verifier)

		const scope = "user-read-private user-read-email playlist-modify-public playlist-modify-private playlist-read-private"

		const params = new URLSearchParams({
			client_id: spotifyClientId,
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

	const getAccessToken = async (code: string, verifier: string | null): Promise<string | null> => {
		if (!verifier || !code) return null

		const params = new URLSearchParams({
			client_id: spotifyClientId,
			grant_type: "authorization_code",
			redirect_uri: `${spotifyRedirectUri}`,
			code,
			code_verifier: verifier!,
		})

		const result = await fetch("https://accounts.spotify.com/api/token", {
			method: "POST",
			headers: { "Content-Type": "application/x-www-form-urlencoded" },
			body: params,
		})

		const { access_token } = await result.json()
		return access_token
	}

	return { getRedirectToAuthCodeFlow, getAccessToken }
}
