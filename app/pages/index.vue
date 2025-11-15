<template>
	<div>
		<BackgroundEffect />
		<header>
			<h1>Event Music Scout</h1>
			<p class="subtle">
				Discover the music vibe before you commit to the party
			</p>
		</header>
		<event-input-vue
			v-model="urlToAnalyze"
			:loading="loading"
			@analyze="handleAnalyzeEvent"
		/>
		<!-- loading -->
		<!-- Event data -->
		<!-- empty state -->
		<template v-if="eventData">
			<EventControls
				:selected-count="selectedArtists.size"
				:total-artists="eventData.artists.length"
				:all-selected="allArtistsSelected"
				@toggle-select-all="handleToggleSelectAll"
				@play-all="handlePlayAll"
				@create-playlist="handleCreatePlaylist"
			/>

			<section class="artist-list">
				<ArtistCard
					v-for="artist in eventData.artists"
					:key="artist.id"
					:artist="artist"
					:selected="selectedArtists.has(artist.id)"
					@toggle-select="toggleArtist"
				/>
			</section>
		</template>
	</div>
</template>

<script lang="ts" setup>
import BackgroundEffect from "@/components/UI/BackgroundEffect.vue"
import type { EventData } from "@@/types"

const { analyzeEvent, loading } = useEventAnalyzer()
const { selectedArtists, toggleArtist, toggleSelectAll } = usePlaylist()
const { getRedirectToAuthCodeFlow } = useSpotifyOAuthMethods()

const route = useRoute()
const router = useRouter()

const eventData = ref<EventData | null>(null)
const urlToAnalyze = ref<string | null>(route?.query?.q as string || null)

const allArtistsSelected = computed(() => {
	return eventData.value
		? selectedArtists.value.size === eventData.value.artists.length
		: false
})

const updateRouteSearchQuery = (query: string) => {
	router.replace({
		path: route.path,
		query: { ...route.query, q: query },
	})
}

const handleAnalyzeEvent = async (url: string) => {
	updateRouteSearchQuery(url)

	eventData.value = await analyzeEvent(url)
	console.log("data", eventData.value)
}

const handlePlayAll = () => {
	if (eventData.value) {
		// playAll(eventData.value.artists)
	}
}

const handleOpenSpotifyOAuthWindow = async () => {
	const url = await getRedirectToAuthCodeFlow()

	const windowFeatures = "width=800,height=600,left=100,top=100"

	const authWindow = window.open(url, "_blank", windowFeatures)
	if (authWindow) {
		const handleMessage = (event: MessageEvent) => {
			if (event.origin === "http://[::1]:3000") {
				console.log("receives a message from port", event)
			}
		}

		window.addEventListener("message", handleMessage)
	}
}

const handleCreatePlaylist = () => {
	if (!eventData.value || selectedArtists.value.size === 0) return

	handleOpenSpotifyOAuthWindow()
}

const handleToggleSelectAll = () => {
	if (eventData.value === null) return
	toggleSelectAll(eventData.value)
}

onMounted(() => {

})
</script>

<style scoped>
.artist-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
</style>
