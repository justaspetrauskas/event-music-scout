export const useScraper = () => {
	const config = useRuntimeConfig()

	const scrape = async (url: string) => {
		return $fetch("/api/scrape", {
			baseURL: config.public.scraperUrl,
			method: "POST",
			headers: {
				Authorization: `Bearer ${config.scraperApiKey}`,
			},
			body: { url },
		})
	}

	return { scrape }
}
