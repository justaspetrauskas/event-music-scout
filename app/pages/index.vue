<template>
	<div class="min-h-screen flex items-center flex-col justify-center px-4 sm:px-6 lg:px-8">
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
			class="max-w-4xl w-full mb-16 mx-auto px-2 sm:px-0"
		>
			<EventSummary
				:event="eventData"
			/>

			<TracksSelectionControl
				@toggle-select-all="handleToggleSelectAll"
				@clear-selection="handleClearSelection"
				@create-playlist="handleCreatePlaylist"
				@add-to-existing-playlist="handleAddToExistingPlaylist"
				@play-selected="handlePlaySelected"
			/>

			<!-- Loader / results count -->
			<Loader
				:loading="loading"
				:count="artistsFound"
			/>

			<section class="overflow-hidden">
				<ArtistCard
					v-for="artist in eventData.artists"
					:key="artist.id"
					:artist="artist"
					:selected="selectedArtists.has(artist.id)"
				/>
			</section>

			<MusicPlayer v-if="isPlayerVisible" />
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
import EventSummary from "@/components/Event/EventSummary.vue"
import PlaylistFormModal from "@/components/UI/PlaylistFormModal.vue"
import MusicPlayer from "@/components/MusicPlayer/musicPlayerMain.vue"
import Loader from "@/components/UI/Loader.vue"
import type { EventData } from "~~/types"

import { usePlaylistStore } from "~/stores/playlistStore"
import { useMusicPlayerStore } from "~/stores/useMusicPlayerStore"
import { useUserStore } from "~/stores/userStore"
import ExistingPlaylistForm from "~/components/UI/ExistingPlaylistForm.vue"

const playlistStore = usePlaylistStore()
const { toggleSelectAll } = usePlaylistStore()
const userStore = useUserStore()
const { fetchUserProfile } = userStore
const { selectedArtists, selectedTracks } = storeToRefs(playlistStore)

const { analyzeEvent, loading } = useEventAnalyzer()
const { handleOpenSpotifyOAuthWindow, getAccessToken } = useSpotifyOAuthMethods()
const { addTracksToQueue, playTrack } = useTrackPlaybackMethods()

const musicPlayerStore = useMusicPlayerStore()
const { isPlayerVisible } = storeToRefs(musicPlayerStore)
const { showPlayer } = musicPlayerStore

const route = useRoute()
const router = useRouter()

const eventData = ref<EventData | null>(null)
const urlToAnalyze = ref<string | null>(route?.query?.q as string || null)
const isPlaylistFormModalVisible = ref(false)
const isAddToExistinPlaylistModalVisible = ref(false)

const isUserLoading = ref(false)

const artistsFound = computed(() => eventData.value?.artists?.length ?? 0)

const updateRouteSearchQuery = (query: string) => {
	router.replace({
		path: route.path,
		query: { ...route.query, q: query },
	})
}

const handleAnalyzeEvent = async (url: string) => {
	updateRouteSearchQuery(url)

	eventData.value = await analyzeEvent(url)
}

const handlePlaySelected = async () => {
	if (selectedTracks.value.size === 0) return

	await showPlayer()
	await playTrack(Array.from(selectedTracks.value))
	showPlayer.value = true
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

const checkUser = async () => {
	isUserLoading.value = true
	await fetchUserProfile()
	isUserLoading.value = false
}

onMounted(() => {
	checkUser()

	window.addEventListener("message", async (event) => {
		if (event.origin !== window.location.origin) return
		if (event.data.authenticated === true) {
			await fetchUserProfile()
		}
	})
})
onUnmounted(() => {
	window.removeEventListener("message")
})
</script>

<style scoped>
.artist-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
/* loader is now a separate component */
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
