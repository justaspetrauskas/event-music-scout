<template>
	<div>
		<!-- <BackgroundEffect /> -->

		<!-- <div class="container header-container">
				<h1>Event Music Scout</h1>
				<p class="subtle">
					Discover the music vibe before you commit to the party
				</p>
			</div> -->

		<event-input-vue
			v-model="urlToAnalyze"
			:loading="loading"
			@analyze="handleAnalyzeEvent"
		/>
		<!-- loading -->
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
				/>
			</section>
			<MusicPlayer />
		</template>
		<PlaylistFormModal
			v-if="isPlaylistFormModalVisible"
			@close-modal="onCloseModal()"
		/>
	</div>
</template>

<script lang="ts" setup>
import BackgroundEffect from "@/components/UI/BackgroundEffect.vue"
import PlaylistFormModal from "@/components/UI/PlaylistFormModal.vue"
import MusicPlayer from "@/components/MusicPlayer/musicPlayerMain.vue"
import type { EventData } from "~~/types"

import { usePlaylistStore } from "~/stores/playlistStore"

const playlistStore = usePlaylistStore()
const { toggleSelectAll } = usePlaylistStore()
const { selectedArtists } = storeToRefs(playlistStore)

const { analyzeEvent, loading } = useEventAnalyzer()
const { handleOpenSpotifyOAuthWindow, getAccessToken } = useSpotifyOAuthMethods()

const route = useRoute()
const router = useRouter()

const eventData = ref<EventData | null>(null)
const urlToAnalyze = ref<string | null>(route?.query?.q as string || null)
const isPlaylistFormModalVisible = ref(false)

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

const handleCreatePlaylist = async () => {
	if (!eventData.value || selectedArtists.value.size === 0) return

	const existingToken = await getAccessToken()
	if (existingToken) {
		console.log("Using cached access token")
		// await createPlaylist(eventData.value, selectedArtists.value)
		isPlaylistFormModalVisible.value = true
		return existingToken
	}

	handleOpenSpotifyOAuthWindow()
}

const onCloseModal = () => {
	isPlaylistFormModalVisible.value = false
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
header {
	display: flex;
	align-items: flex-start;
	width: 100%;
	justify-content: space-between;
}

.header-container {
	flex: 1 1 auto;
}
</style>
