<template>
	<section class="input-section">
		<div class="input-group">
			<input
				v-model="eventUrl"
				type="text"
				placeholder="Paste event URL (Facebook, Resident Advisor, Eventbrite...)"
				@keyup.enter="handleAnalyze"
			>
			<button
				class="outline"
				:aria-busy="loading"
				@click="handleAnalyze"
			>
				Analyze Event
			</button>
		</div>
		<small
			v-if="showError"
			class="error-message"
		>
			Please enter a valid URL (e.g., https://example.com/event)
		</small>
	</section>
</template>

<script setup lang="ts">
defineProps({
	loading: {
		type: Boolean,
		default: false,
	},
})
const emit = defineEmits<{
	analyze: [url: string]
}>()

const eventUrl = defineModel<string | null>()
const showError = ref(false)

const isValidUrl = (urlString: string): boolean => {
	if (!urlString.trim()) {
		return false
	}

	try {
		const url = new URL(urlString)
		if (!["http:", "https:"].includes(url.protocol)) {
			return false
		}
		if (!url.hostname || !url.hostname.includes(".")) {
			return false
		}
		return true
	}
	catch {
		return false
	}
}

const handleAnalyze = () => {
	const trimmedUrl = eventUrl.value?.trim() || ""

	if (!isValidUrl(trimmedUrl)) {
		showError.value = true
		return
	}

	showError.value = false
	emit("analyze", trimmedUrl)
}

onMounted(() => {
	if (eventUrl.value) {
		handleAnalyze()
	}
})
</script>

<style scoped>
.input-section {
  margin-bottom: 1.5rem;
  margin: 0 auto;
}

.input-group {
 display: grid;
 grid-template-columns: 1fr auto;
 gap: 0;
}

.input-group input {
  border-top-right-radius: 0;
  border-bottom-right-radius: 0;
  margin-bottom: 0;
}

.input-group button {
  border-top-left-radius: 0;
  border-bottom-left-radius: 0;
  margin-bottom: 0;
  white-space: nowrap;
}

@media (min-width: 768px) {
  .input-group {
    grid-template-columns: 1fr auto;
  }
}
</style>
