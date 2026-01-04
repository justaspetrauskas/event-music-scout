<template>
	<Backdrop @background-click="closePlaylistModal">
		<div
			class="bg-card rounded-lg shadow-2xl w-full max-w-md overflow-hidden"
			@click.stop
		>
			<!-- Header -->
			<div class="flex items-center justify-between p-6 border-b border-border/50">
				<div>
					<h3 class="text-xl font-semibold text-foreground">
						Create Spotify Playlist
					</h3>
					<p class="text-sm text-muted mt-1">
						{{ selectedTracks.size }} {{ selectedTracks.size > 1 ? 'tracks': 'track' }} selected
					</p>
				</div>
				<button
					class="p-2 rounded-full hover:bg-accent/20 transition-all duration-200 text-foreground/70 hover:text-foreground"
					aria-label="Close"
					@click="closePlaylistModal"
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

			<!-- Form -->
			<form
				class="p-6"
				@submit.prevent="handleSubmitPlaylist"
			>
				<div class="p-6 space-y-4">
					<div>
						<label
							for="playlist-name"
							class="block text-sm font-medium text-foreground mb-2"
						>
							Playlist Name
						</label>
						<input
							id="playlist-name"
							v-model="playlistName"
							type="text"
							placeholder="e.g., Event Vibes 2025"
							class="w-full px-4 py-3 border rounded-xl text-foreground placeholder:text-muted-foreground
              focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-all duration-200"
							required
							maxlength="100"
						>
						<p class="text-xs text-muted-foreground mt-2">
							{{ playlistName.length }}/100 characters
						</p>
					</div>
					<!-- <div class="p-3 bg-muted/50 rounded-lg border border-border">
							<p class="text-sm text-muted-foreground">
								This will create a new playlist in your Spotify account with the selected tracks.
							</p>
						</div> -->
				</div>

				<!-- Buttons -->
				<div class="flex gap-3 pt-2">
					<ButtonComponent
						variant="secondary"
						@click="closePlaylistModal"
					>
						Cancel
					</ButtonComponent>
					<ButtonComponent
						type="submit"
						:disabled="!playlistName.trim()"
					>
						Create Playlist
					</ButtonComponent>
				</div>
			</form>
		</div>
	</Backdrop>
</template>

<script lang="ts" setup>
import { usePlaylistStore } from "~/stores/playlistStore"
import ButtonComponent from "../UI/ButtonComponent.vue"
import Backdrop from "./Backdrop.vue"

const playlistStore = usePlaylistStore()
const { selectedTracks } = storeToRefs(playlistStore)

const { createPlaylistWithTracks } = usePlaylist()
const emit = defineEmits(["close-modal"])

const playlistName = ref<string>("")

const closePlaylistModal = () => {
	emit("close-modal")
}

const handleSubmitPlaylist = async () => {
	if (!playlistName.value.trim()) {
		console.warn("Playlist name is required")
		return
	}
	// limit to 100

	await createPlaylistWithTracks(playlistName.value, selectedTracks.value)
	emit("close-modal")
}
</script>

<style>

</style>
