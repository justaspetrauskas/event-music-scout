<template>
	<footer class="music-player">
		<div class="music-player-content-wrapper container">
			<div class="track-info">
				test
			</div>
			<div class="controls">
				<div class="control-buttons">
					<button
						id="footer-prev-button"
						class="control-button"
					>
						<svg viewBox="0 0 24 24"><path d="M6 6h2v12H6zm3.5 6l8.5 6V6z" /></svg>
					</button>
					<button
						id="footer-play-pause-button"
						class="control-button play-pause-button"
					>
						<svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
					</button>
					<button
						id="footer-next-button"
						class="control-button"
					>
						<svg viewBox="0 0 24 24"><path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z" /></svg>
					</button>
				</div>
			</div>
			<div class="extra">
				extra
			</div>
		</div>
	</footer>
</template>

<script lang="ts" setup>
const { getAccessToken } = useSpotifyOAuthMethods()
const musicPlayerStore = useMusicPlayerStore()
const { connect } = musicPlayerStore
const { player } = storeToRefs(musicPlayerStore)

const innitPlayer = async () => {
	const token = await getAccessToken()
	if (token) {
		await connect(token)
	}
}

onMounted(() => {
	innitPlayer()
})
</script>

<style scoped>
.music-player {
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f0f23 100%);
  box-shadow: 0 -4px 20px rgba(138, 43, 226, 0.3), inset 0 2px 10px rgba(255,255,255,0.1);
  border-top: 2px solid #8a2be2;
  backdrop-filter: blur(10px);
  position: fixed;
  width: 100vw;
  left: 0;
  bottom: 0;
  padding: 12px 0;
}

.music-player-content-wrapper {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
}
.controls {
  display: inline-flex;
  align-items: center;
  column-gap: 12px;
  justify-content: space-between;
  flex: 1 1 100%;
  flex-direction: column;
}
.control-buttons {
  display: inline-flex;
  align-items: center;
  column-gap: 12px;
  justify-content: space-between;
  flex: 1 1 100%;
  flex-wrap: nowrap;
}
.control-button {
    background: white;
    border: none;
    cursor: pointer;
    border-radius: 50%;
    padding: 5px;
    width: 50px;
    height: auto;
    aspect-ratio: 1 / 1;
    margin: auto auto;

}

.control-button svg {
  font-size: 0.8rem;
  fill: #775AB0;
}

.track-info {
  display: inline-flex;
  flex-direction: row;
  flex: 1 1 100%;
}
</style>
