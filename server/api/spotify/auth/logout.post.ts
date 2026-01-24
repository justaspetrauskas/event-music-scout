export default defineEventHandler(async (event) => {
	clearAllTokens(event)

	return { success: true, message: "Logged out successfully" }
})
