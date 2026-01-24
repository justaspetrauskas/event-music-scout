import { getSpotifyState, clearSpotifyState, setSpotifyTokens } from "../../../utils/session"

export default defineEventHandler(async (event) => {
	const query = getQuery(event)
	const code = query.code as string || null
	const incomingState = query.state as string || null

	const config = useRuntimeConfig()
	const clientId = config.spotifyClientId!
	const clientSecret = config.spotifyClientSecret!
	const redirectUri = config.public.spotifyRedirectUri!

	const storedState = await getSpotifyState(event)

	if (storedState === null || incomingState !== storedState || code === null) {
		console.error("State mismatch or missing code. Stored state:", storedState, "Incoming state:", incomingState, "Code:", code)
		await clearSpotifyState(event)
		return { success: false }
	}

	const urlEncodedParams = new URLSearchParams({
		code: code as string,
		redirect_uri: redirectUri as string,
		grant_type: "authorization_code",
	})

	const tokenResponse = await $fetch("https://accounts.spotify.com/api/token", {
		method: "POST",
		headers: {
			"Content-Type": "application/x-www-form-urlencoded",
			"Authorization": `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`,
		},
		body: urlEncodedParams.toString(),
	})

	await setSpotifyTokens(event, tokenResponse)
	await clearSpotifyState(event)

	return { success: true }
})
