<template>
	<div
		class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
		@click.self="closePlaylistModal"
	>
		<div
			class="w-full max-w-md bg-card border border-border/50 rounded-2xl shadow-2xl backdrop-blur-xl bg-white/80 dark:bg-black/80
      dark:border-white/20 animate-in fade-in zoom-in duration-300"
		>
			<!-- Header -->
			<div class="flex items-center justify-between p-6 border-b border-border/50">
				<div>
					<h3 class="text-xl font-bold text-foreground">
						Create Spotify Playlist
					</h3>
					<p class="text-muted-foreground mt-1">
						Enter a name for your playlist
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
				<div class="space-y-4">
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
							class="w-full px-4 py-3 border border-border/50 rounded-xl text-foreground placeholder:text-muted-foreground
              focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-all duration-200"
							required
							maxlength="100"
						>
					</div>

					<!-- Buttons -->
					<div class="flex gap-3 pt-2">
						<button
							type="button"
							class="flex-1 px-6 py-3 border border-border/50 rounded-xl text-foreground hover:bg-accent/10
              hover:border-accent/30 font-medium transition-all duration-200"
							@click="closePlaylistModal"
						>
							Cancel
						</button>
						<button
							type="submit"
							class="flex-1 px-6 py-3 bg-accent hover:bg-accent/90 text-accent-foreground rounded-xl font-semibold shadow-lg
              hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-md"
							:disabled="!playlistName.trim()"
						>
							Create Playlist
						</button>
					</div>
				</div>
			</form>
		</div>
	</div>
</template>

<script lang="ts" setup>
import { usePlaylistStore } from "~/stores/playlistStore"

const playlistStore = usePlaylistStore()
const { getAllTrackUris } = storeToRefs(playlistStore)

const { createPlaylistWithTracks } = usePlaylist()
const emit = defineEmits(["close-modal"])

const playlistName = ref<string>("")

const closePlaylistModal = () => {
	emit("close-modal")
}

const handleSubmitPlaylist = () => {
	if (!playlistName.value.trim()) {
		console.warn("Playlist name is required")
		return
	}
	// limit to 100

	console.log("Playlist with tracks", getAllTrackUris.value, playlistName.value)
	createPlaylistWithTracks(playlistName.value, getAllTrackUris.value)
	// emit("close-modal")
}
</script>

<style>
.modal-dialog {
  max-width: 28rem;
  width: 90%;
  max-height: 90vh;
  margin: 0;
  border: none;
  border-radius: var(--radius-2);
  box-shadow: var(--shadow-2);
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
  border-bottom: 1px solid var(--divider);
}

.close {
  font-size: 1.5rem;
  font-weight: bold;
  line-height: 1;
  padding: 0.25rem;
  margin: -0.25rem;
  background: none;
  border: none;
  cursor: pointer;
  color: var(--muted-foreground);
  border-radius: var(--radius-1);
}

.close:hover {
  background: var(--hover);
  color: var(--foreground);
}

fieldset {
  border: none;
  padding: 0;
  margin: var(--spacing-2) 0;
}

.grid {
  gap: var(--spacing-2);
}

/* Artist list - pure Pico spacing */
.artist-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-4);
}

header {
  display: flex;
  align-items: flex-start;
  width: 100%;
  justify-content: space-between;
  gap: var(--spacing-4);
}

.header-container {
  flex: 1;
}
</style>
