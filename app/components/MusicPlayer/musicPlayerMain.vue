<template>
	<footer class="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-gray-200 shadow-2xl z-50 w-full">
		<!-- Collapsed Player -->
		<div class="px-4 py-3 flex items-center gap-3 md:max-w-4xl md:mx-auto">
			<!-- Album Cover -->
			<img
				v-if="parsedTrackInfo?.albumCover"
				:src="parsedTrackInfo?.albumCover"
				alt="Album cover"
				class="w-12 h-12 rounded-md shadow-md flex-shrink-0"
			>

			<!-- Track Info -->
			<div class="min-w-0 flex-1">
				<p class="text-sm font-semibold text-gray-900 truncate">
					{{ parsedTrackInfo?.name }}
				</p>
				<p
					v-for="(name, index) in parsedTrackInfo?.artists"
					:key="'artist-' + index"
					class="text-xs text-gray-500 inline-block"
				>
					{{ name }}
				</p>
			</div>

			<!-- Controls -->
			<div class="flex items-center gap-2 flex-shrink-0">
				<VTooltip
					:triggers="['hover']"
					open-delay="0"
					:shown="previousTrackInQueue"
					placement="top-end"
					:distance="10"
				>
					<button
						class="p-2 rounded-full transition-colors
         enabled:hover:bg-gray-100
         disabled:bg-transparent disabled:cursor-not-allowed"
						:disabled="!previousTrackInQueue"
						@click="handlePreviousTrack"
					>
						<SkipBack
							class="w-5 h-5"
							:class="!previousTrackInQueue ? 'text-gray-300' : 'text-gray-700'"
						/>
					</button>
					<template #popper>
						<div class="flex items-start gap-3">
							<img
								:src="previousTrackInQueue.album.images[0].url"
								:alt="`${previousTrackInQueue.name}`"
								class="w-8 h-8 rounded-md object-cover flex-shrink-0"
							>
							<div class="min-w-0 flex-1">
								<p class="font-medium text-sm text-white truncate">
									{{ previousTrackInQueue.name }}
								</p>
							</div>
						</div>
					</template>
				</VTooltip>
				<button
					class="w-12 h-12 bg-black text-white rounded-full flex items-center justify-center shadow-lg hover:scale-105 transition-all"
					@click="togglePlay"
				>
					<Play
						v-if="isPaused"
						class="w-5 h-5"
					/>
					<Pause
						v-else
						class="w-5 h-5"
					/>
				</button>
				<VTooltip
					:triggers="['hover']"
					open-delay="0"
					:shown="nextTrackInQueue"
					placement="top-start"
					:distance="10"
				>
					<button
						class="p-2 rounded-full transition-colors
         enabled:hover:bg-gray-100
         disabled:bg-transparent disabled:cursor-not-allowed"
						:disabled="!nextTrackInQueue"
						@click="handleNextTrack"
					>
						<SkipForward
							class="w-5 h-5"
							:class="!nextTrackInQueue ? 'text-gray-300' : 'text-gray-700'"
						/>
					</button>
					<template #popper>
						<div class="flex items-start gap-3">
							<img
								:src="nextTrackInQueue.album.images[0].url"
								:alt="`${nextTrackInQueue.name}`"
								class="w-8 h-8 rounded-md object-cover flex-shrink-0"
							>
							<div class="min-w-0 flex-1">
								<p class="font-medium text-sm text-white truncate">
									{{ nextTrackInQueue.name }}
								</p>
							</div>
						</div>
					</template>
				</VTooltip>
			</div>

			<!-- Volume Slider -->
			<div class="flex items-center gap-2 w-20">
				<Volume2 class="w-8 h-8 text-gray-600" />
				<input
					ref="volumeRef"
					v-model="volume"
					type="range"
					min="0"
					step="0.01"
					max="1"
					class="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-black hover:accent-black/80 transition-all"
					@input="updateVolume"
				>
			</div>

			<!-- Expand Queue -->
			<!-- <button
				class="p-2 hover:bg-gray-100 rounded-full transition-colors ml-2"
				@click="showQueue = !showQueue"
			>
				<List class="w-5 h-5 text-gray-700" />
			</button>
		</div> -->

			<!-- Expanded Queue View -->
			<!-- <div
			v-if="showQueue"
			class="px-4 py-4 border-t border-gray-100 bg-gray-50 max-h-96 overflow-y-auto"
		>
			<h3 class="font-semibold text-gray-900 mb-3">
				Up Next
			</h3>
			<div
				v-for="qTrack in queue"
				:key="qTrack.id"
				class="flex items-center gap-3 p-2 rounded-lg hover:bg-white transition-colors cursor-pointer"
				@click="playQueueTrack(qTrack)"
			>
				<img
					src=""
					alt="Cover"
					class="w-10 h-10 rounded"
				>
				<div class="min-w-0 flex-1">
					<p class="text-sm font-medium text-gray-900 truncate">
						{{ qTrack.name }}
					</p>
					<p class="text-xs text-gray-500 truncate">
						{{ qTrack.artist }}
					</p>
				</div>
			</div>
		</div> -->
		</div>
	</footer>
</template>

<script lang="ts" setup>
import { ref, onMounted } from "vue"
import { Play, Pause, SkipBack, SkipForward, Volume2, List } from "lucide-vue-next"

interface Track {
	id: string
	name: string
	artist: string
}

const { getAccessToken } = useSpotifyOAuthMethods()
const musicPlayerStore = useMusicPlayerStore()
const { nextTrack, previousTrack } = useTrackPlaybackMethods()
const { connect, togglePlayback, setVolume } = musicPlayerStore
const { currentTrack, state, isPaused, nextTrackInQueue, previousTrackInQueue } = storeToRefs(musicPlayerStore)

const parsedTrackInfo = computed(() => {
	if (!currentTrack.value) return null

	return { albumCover: currentTrack.value.album.images[0].url, name: currentTrack.value.name, artists: currentTrack.value.artists.map(artist => artist.name) }
})

const volume = ref(0.5)
const showQueue = ref(false)

const queue = ref<Track[]>([
	{ id: "1", name: "Track 1", artist: "Artist" },
	{ id: "2", name: "Track 2", artist: "Artist" },
])

const volumeRef = ref<HTMLInputElement>()

const togglePlay = () => {
	togglePlayback()
}

const updateVolume = () => {
	setVolume(volume.value)
}

const handleNextTrack = async () => {
	await nextTrack()
}

const handlePreviousTrack = async () => {
	await previousTrack()
}

const playQueueTrack = (qTrack: Track) => {
	track.value = qTrack
}

const innitPlayer = async () => {
	const token = await getAccessToken()
	if (token) {
		await connect(token)
	}
}

onMounted(() => {
	innitPlayer()

	if (volumeRef.value) volumeRef.value.value = volume.value.toString()
})
</script>

<style scoped>

</style>
