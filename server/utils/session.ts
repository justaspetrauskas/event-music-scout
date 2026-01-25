import type { H3Event } from "h3"

export async function getSpotifyState(event: H3Event): Promise<string | null> {
	const cookies = getCookie(event, "spotify_auth_state")
	return cookies || null
}

export async function setSpotifyState(event: H3Event, state: string): Promise<void> {
	setCookie(event, "spotify_auth_state", state, {
		httpOnly: true,
		secure: process.env.NODE_ENV === "production",
		sameSite: "strict",
		maxAge: 60 * 10, // 10 minutes
	})
}

export async function clearSpotifyState(event: H3Event): Promise<void> {
	deleteCookie(event, "spotify_auth_state")
}

export async function setSpotifyTokens(event: H3Event, tokens: any): Promise<void> {
	setCookie(event, "spotify_access_token", tokens.access_token, {
		httpOnly: false,
		secure: process.env.NODE_ENV === "production",
		sameSite: "strict",
		maxAge: tokens.expires_in,
	})

	setCookie(event, "spotify_refresh_token", tokens.refresh_token, {
		httpOnly: true,
		secure: process.env.NODE_ENV === "production",
		sameSite: "strict",
		maxAge: 60 * 60 * 24 * 365,
	})

	const expiresAt = Date.now() + (tokens.expires_in * 1000)
	setCookie(event, "spotify_token_expires_at", expiresAt.toString(), {
		httpOnly: true,
		secure: process.env.NODE_ENV === "production",
		sameSite: "strict",
		maxAge: tokens.expires_in,
	})
}

export function getSpotifyTokens(event: H3Event): { access_token: string | null, refresh_token: string | null, expires_at: number } {
	return {
		access_token: getCookie(event, "spotify_access_token") || null,
		refresh_token: getCookie(event, "spotify_refresh_token") || null,
		expires_at: parseInt(getCookie(event, "spotify_token_expires_at") as string) || 0,
	}
}

export function isTokenExpired(tokens: ReturnType<typeof getSpotifyTokens>): boolean {
	const BUFFER_MS = 2 * 60 * 1000
	return Date.now() >= tokens.expires_at - BUFFER_MS
}

export function clearAllTokens(event: H3Event): void {
	deleteCookie(event, "spotify_access_token")
	deleteCookie(event, "spotify_refresh_token")
	deleteCookie(event, "spotify_token_expires_at")
}
