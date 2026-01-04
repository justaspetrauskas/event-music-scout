<template>
	<Backdrop @background-click="closeModal">
		<div
			class="bg-card rounded-lg shadow-2xl w-full max-w-md overflow-hidden max-h-[80vh]"
			@click.stop
		>
			<!-- Header -->
			<div class="flex items-center justify-between p-6 border-b border-border/50">
				<div>
					<h3 class="text-xl font-semibold text-foreground">
						Add to existing playlist
					</h3>
					<p class="text-sm text-muted mt-1">
						{{ selectedTracks.size }} {{ selectedTracks.size > 1 ? 'tracks': 'track' }} selected
					</p>
				</div>
				<button
					class="p-2 rounded-full hover:bg-accent/20 transition-all duration-200 text-foreground/70 hover:text-foreground"
					aria-label="Close"
					@click="closeModal"
				>
					<svg
						class="w-5 h-5"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M6 18L18 6M6 6l12 12"
						/>
					</svg>
				</button>
			</div>

			<!-- User playlists -->
			<form
				class="p-6 flex flex-col"
				@submit.prevent="handleSubmitPlaylist"
			>
				<!-- Search input stays fixed -->
				<div class="space-y-4 mb-4">
					<div>
						<label
							for="searchPlaylist"
							class="block text-sm font-medium text-foreground mb-2"
						>
							Search playlist
						</label>
						<input
							id="searchPlaylist"
							v-model="searchQuery"
							type="text"
							placeholder="Search playlist.."
							class="w-full px-4 py-2 border rounded-xl text-foreground placeholder:text-muted-foreground
          focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-all duration-200"
						>
					</div>
				</div>

				<!-- Scrollable playlists area -->
				<div class="flex-1 min-h-0 max-h-80 overflow-y-auto mb-4">
					<div v-if="userPlaylists">
						<button
							v-for="playlist in filteredPlaylists"
							:key="playlist.id"
							type="button"
							:class="[
								'w-full flex items-center gap-3 p-3 rounded-lg transition-all duration-200',
								selectedPlaylistId === playlist.id
									? 'bg-spotify/10'
									: 'hover:bg-muted border border-transparent',
							]"
							@click="selectPlaylist(playlist.id)"
						>
							<div class="relative flex-shrink-0 w-12 h-12 rounded bg-muted overflow-hidden">
								<img
									v-if="playlist.images.length"
									:src="playlist.images[2]?.url"
									:alt="playlist.name"
									class="w-full h-full object-cover"
								>
							</div>
							<div class="flex-1 text-left min-w-0">
								<div class="font-medium text-white truncate">
									{{ playlist.name }}
								</div>
								<div class="text-xs">
									{{ playlist.totalTracks }} tracks
								</div>
							</div>
						</button>
					</div>
				</div>

				<!-- Fixed buttons -->
				<div class="flex gap-3 pt-2 items-end w-full">
					<ButtonComponent
						variant="secondary"
						type="button"
						:disabled="!selectedPlaylistId"
						@click="closeModal"
					>
						Cancel
					</ButtonComponent>
					<ButtonComponent
						type="submit"
					>
						Add to playlist
					</ButtonComponent>
				</div>
			</form>
		</div>
	</Backdrop>
</template>

<script lang="ts" setup>
import ButtonComponent from "../UI/ButtonComponent.vue"
import type { Playlist } from "@@/types"
import Backdrop from "./Backdrop.vue"

const playlistStore = usePlaylistStore()
const { selectedTracks } = storeToRefs(playlistStore)

const { getUserPlaylists, addTracksToPlaylist } = usePlaylist()

const emit = defineEmits(["close-modal"])
const searchQuery = ref("")
const userPlaylists = ref<Playlist[] | null>(null)
const isPlaylistLoading = ref(false)
const selectedPlaylistId = ref<string | null>(null)

const filteredPlaylists = computed(() => {
	if (!userPlaylists.value || !searchQuery.value.trim()) {
		return userPlaylists.value || []
	}

	const query = searchQuery.value.toLowerCase().trim()
	return userPlaylists.value.filter(playlist =>
		playlist.name.toLowerCase().includes(query),
	)
})

const closeModal = () => {
	emit("close-modal")
}

const selectPlaylist = (playlistId: string) => {
	selectedPlaylistId.value = playlistId
}

const handleSubmitPlaylist = async () => {
	if (selectedPlaylistId.value) {
		console.log("submit to existing playlist", selectedPlaylistId.value, selectedTracks.value)
		await addTracksToPlaylist(selectedPlaylistId.value, selectedTracks.value)
		emit("close-modal")
		// TODO should it clear
	}
}

onMounted(async () => {
	isPlaylistLoading.value = true
	userPlaylists.value = await getUserPlaylists()
	isPlaylistLoading.value = false
})
</script>

<style>

</style>
