export const useEventAnalyzer = () => {
	const loading = ref(false)
	const error = ref<string | null>(null)

	const analyzeEvent = async (url: string) => {
		loading.value = true
		try {
			const data = await $fetch("/api/analyze", { method: "POST", body: { url } })
			sessionStorage.setItem("eventData", JSON.stringify(data))
			return data
		}
		catch (e) {
			error.value = e instanceof Error ? e.message : "Failed to analyze event"
			console.error("Event analysis error:", e)
			return null
		}
		finally {
			loading.value = false
		}
	}

	return {
		loading: readonly(loading),
		error: readonly(error),
		analyzeEvent,
	}
}
