<template>
	<div class="min-h-screen flex items-center flex-col justify-center">
		<!-- <BackgroundEffect /> -->

		<!-- <div class="container header-container">
				<h1>Event Music Scout</h1>
				<p class="subtle">
					Discover the music vibe before you commit to the party
				</p>
			</div> -->
		<div class="max-w-2xl w-full">
			<event-input-vue
				v-model="urlToAnalyze"
				:data-loaded="eventData !== null"
				:loading="loading"
				@analyze="handleAnalyzeEvent"
			/>
		</div>
		<!-- loading -->
		<!-- empty state -->
		<div
			v-if="eventData"
			class="max-w-4xl w-full mb-16"
		>
			<!-- <EventControls
					:selected-count="selectedArtists.size"
					:total-artists="eventData.artists.length"
					:all-selected="allArtistsSelected"
					@toggle-select-all="handleToggleSelectAll"
					@play-all="handlePlayAll"
					@create-playlist="handleCreatePlaylist"
				/> -->

			<TracksSelectionControl
				@toggle-select-all="handleToggleSelectAll"
				@clear-selection="handleClearSelection"
				@play-all="handlePlayAll"
				@create-playlist="handleCreatePlaylist"
				@add-to-existing-playlist="handleAddToExistingPlaylist"
				@play-selected="handlePlaySelected"
			/>

			<section class="overflow-hidden">
				<ArtistCard
					v-for="artist in eventData.artists"
					:key="artist.id"
					:artist="artist"
					:selected="selectedArtists.has(artist.id)"
				/>
			</section>

			<MusicPlayer />
		</div>
		<PlaylistFormModal
			v-if="isPlaylistFormModalVisible"
			@close-modal="onCloseModal()"
		/>
		<ExistingPlaylistForm
			v-if="isAddToExistinPlaylistModalVisible"
			@close-modal="isAddToExistinPlaylistModalVisible = false"
		/>
	</div>
</template>

<script lang="ts" setup>
import TracksSelectionControl from "@/components/Track/TracksSelectionControl.vue"
import PlaylistFormModal from "@/components/UI/PlaylistFormModal.vue"
import MusicPlayer from "@/components/MusicPlayer/musicPlayerMain.vue"
import type { EventData } from "~~/types"

import { usePlaylistStore } from "~/stores/playlistStore"
import ExistingPlaylistForm from "~/components/UI/ExistingPlaylistForm.vue"

const playlistStore = usePlaylistStore()
const { toggleSelectAll } = usePlaylistStore()
const { selectedArtists, selectedTracks } = storeToRefs(playlistStore)

const { analyzeEvent, loading } = useEventAnalyzer()
const { handleOpenSpotifyOAuthWindow, getAccessToken } = useSpotifyOAuthMethods()
const { addTracksToQueue, playTrack } = useTrackPlaybackMethods()

const route = useRoute()
const router = useRouter()

const eventData = ref<EventData | null>(null)
const urlToAnalyze = ref<string | null>(route?.query?.q as string || null)
const isPlaylistFormModalVisible = ref(false)
const isAddToExistinPlaylistModalVisible = ref(false)

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
	if (import.meta.env.DEV) console.log("data", eventData.value)
}

const handlePlayAll = () => {
	if (eventData.value) {
		// playAll(eventData.value.artists)
	}
}

const handleCreatePlaylist = async () => {
	if (!eventData.value || selectedTracks.value.size === 0) return

	const existingToken = await getAccessToken()
	if (existingToken) {
		isPlaylistFormModalVisible.value = true
		return existingToken
	}

	handleOpenSpotifyOAuthWindow()
}

const handleAddToExistingPlaylist = async () => {
	if (!eventData.value || selectedTracks.value.size === 0) return

	const existingToken = await getAccessToken()
	if (existingToken) {
		isAddToExistinPlaylistModalVisible.value = true
		return existingToken
	}

	// handleOpenSpotifyOAuthWindow()
}

const handlePlaySelected = async () => {
	if (!eventData.value || selectedTracks.value.size === 0) return

	const existingToken = await getAccessToken()
	if (existingToken) {
		// isAddToExistinPlaylistModalVisible.value = true
			if (import.meta.env.DEV) console.log("play selected tracks", selectedTracks.value)
		playTrack(Array.from(selectedTracks.value))
		return existingToken
	}

	// handleOpenSpotifyOAuthWindow()
}

const onCloseModal = () => {
	isPlaylistFormModalVisible.value = false
}

const handleToggleSelectAll = () => {
	if (eventData.value === null) return
	toggleSelectAll(eventData.value)
}

const handleClearSelection = () => {
	selectedTracks.value.clear()
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
