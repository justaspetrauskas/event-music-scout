declare module "#auth-utils" {
	interface User {
		spotifyId: string
		displayName?: string
		email?: string
		images?: Array<{ url: string }>
	}
	interface UserSession {
		loggedInAt: Date
		spotifyAccessToken: string
		spotifyRefreshToken: string
		spotifyTokenExpiresAt?: number // Unix timestamp for expiry
	}
}
