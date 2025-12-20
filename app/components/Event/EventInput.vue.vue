<template>
	<section class="max-w-2xl mx-auto min-h-screen flex items-center flex-col justify-center -translate-y-12">
		<div class="py-8">
			<h2 class="">
				Event Music Scout
			</h2>
			<p class="">
				Discover the music vibe before you commit to the party
			</p>
		</div>

		<div class="relative w-full">
			<div class="flex items-center gap-3 bg-card border border-border overflow-hidden rounded-xl shadow-md w-full bg-slate-50 dark:bg-gray-900 duration-300 dark:shadow-green-500/50">
				<Link
					class="w-5 h-5 m-4 flex-shrink-0 text-muted-foreground text-green-500 dark:text-green-400"
				/>

				<input
					v-model="eventUrl"
					type="text"
					placeholder="Paste event URL (Facebook, Resident Advisor, Eventbrite...)"
					class="flex-1 bg-transparent outline-none placeholder:text-muted-foreground text-foreground text-lg border-none dark:text-slate-50"
					@keyup.enter="handleAnalyze"
				>

				<button
					class="px-6 py-4 border-l border-green-500 bg-accent text-green-500
  hover:bg-green-500 hover:text-white hover:shadow-lg hover:shadow-green-500/30
  hover:border-green-400 rounded-r-lg font-medium transition-all duration-300
  ease-[cubic-bezier(0.4,0,0.2,1.2)] whitespace-nowrap group
  disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
					:aria-busy="loading"
					:disabled="loading"
					@click="handleAnalyze"
				>
					<span class="group-hover:scale-105 transition-transform duration-200">
						{{ loading ? 'Analyzing...' : 'Analyze Event' }}
					</span>
				</button>
			</div>
			<!-- Error message -->
			<span
				v-if="showError"
				class="absolute left-1/2 -translate-x-1/2 mt-3 text-destructive text-sm text-center opacity-0 translate-y-2
  transition-all duration-300 ease-out w-max dark:text-slate-50"
				:class="{ 'opacity-100 translate-y-0': showError }"
			>
				<p
					class=""
					:class="{ 'opacity-100 translate-y-0': showError }"
				>
					Please enter a valid URL (e.g., https://example.com/event)
				</p>
			</span>
		</div>
	</section>
</template>

<script setup lang="ts">
import { Link } from "lucide-vue-next"

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

</style>
