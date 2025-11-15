<template>
	<div
		ref="container"
		class="stripes-bg"
	>
		<svg
			viewBox="0 0 1000 800"
			width="100%"
			height="100%"
		>
			<defs>
				<!-- Gradients -->
				<linearGradient
					id="fade-green"
					x1="0"
					y1="1"
					x2="0"
					y2="0"
				>
					<stop
						offset="0%"
						stop-color="#7bd442"
						stop-opacity="1"
					/>
					<stop
						offset="0%"
						stop-color="#7bd442"
						stop-opacity="0.8"
					/>
					<stop
						offset="100%"
						stop-color="#7bd442"
						stop-opacity="0"
					/>
				</linearGradient>
				<linearGradient
					id="fade-yellow"
					x1="0"
					y1="1"
					x2="0"
					y2="0"
				>
					<stop
						offset="0%"
						stop-color="#ffe03c"
						stop-opacity="1"
					/>
					<stop
						offset="0%"
						stop-color="#ffe03c"
						stop-opacity="0.8"
					/>
					<stop
						offset="100%"
						stop-color="#ffe03c"
						stop-opacity="0"
					/>
				</linearGradient>
				<linearGradient
					id="fade-blue"
					x1="0"
					y1="1"
					x2="0"
					y2="0"
				>
					<stop
						offset="0%"
						stop-color="#42a5f5"
						stop-opacity="1"
					/>
					<stop
						offset="0%"
						stop-color="#42a5f5"
						stop-opacity="0.8"
					/>
					<stop
						offset="100%"
						stop-color="#42a5f5"
						stop-opacity="0"
					/>
				</linearGradient>
				<!-- Glows -->
				<filter
					id="glow-green"
					x="-40%"
					y="-40%"
					width="180%"
					height="180%"
				>
					<feDropShadow
						dx="0"
						dy="0"
						stdDeviation="12"
						flood-color="#7bd442"
						flood-opacity="0.7"
					/>
				</filter>
				<filter
					id="glow-yellow"
					x="-40%"
					y="-40%"
					width="180%"
					height="180%"
				>
					<feDropShadow
						dx="0"
						dy="0"
						stdDeviation="15"
						flood-color="#ffe03c"
						flood-opacity="0.6"
					/>
				</filter>
				<filter
					id="glow-blue"
					x="-40%"
					y="-40%"
					width="180%"
					height="180%"
				>
					<feDropShadow
						dx="0"
						dy="0"
						stdDeviation="14"
						flood-color="#42a5f5"
						flood-opacity="0.6"
					/>
				</filter>
				<!-- Clip Paths -->
				<clipPath id="clip-green">
					<rect
						:y="clipYGreen"
						x="0"
						width="1000"
						height="800"
					/>
				</clipPath>
				<clipPath id="clip-yellow">
					<rect
						:y="clipYYellow"
						x="0"
						width="1000"
						height="800"
					/>
				</clipPath>
				<clipPath id="clip-blue">
					<rect
						:y="clipYBlue"
						x="0"
						width="1000"
						height="800"
					/>
				</clipPath>
			</defs>

			<path
				d="M100,800 420,500 420,80 460,80 460,500 250,800 Z"
				fill="url(#fade-green)"
				filter="url(#glow-green)"
				:clip-path="'url(#clip-green)'"
			/>
			<path
				d="M270,800 470,500 470,5 510,5 510,500 710,800 Z"
				fill="url(#fade-yellow)"
				filter="url(#glow-yellow)"
				:clip-path="'url(#clip-yellow)'"
			/>
			<path
				d="M880,800 560,500 560,100 520,100 520,500 730,800 Z"
				fill="url(#fade-blue)"
				filter="url(#glow-blue)"
				:clip-path="'url(#clip-blue)'"
			/>
		</svg>
	</div>
</template>

<script setup>
import { ref, onMounted } from "vue"

const clipYGreen = ref(800)
const clipYYellow = ref(800)
const clipYBlue = ref(800)
const container = ref(null)

const animate = (clipRef, delay = 0) => {
	setTimeout(() => {
		let frame = 0
		const totalFrames = 60
		function step() {
			frame++
			const progress = frame / totalFrames
			clipRef.value = 800 - 800 * Math.min(progress, 1)
			if (frame < totalFrames) requestAnimationFrame(step)
		}
		step()
	}, delay)
}

onMounted(() => {
	animate(clipYGreen, 0)
	animate(clipYYellow, 130)
	animate(clipYBlue, 260)
})
</script>

<style>
.stripes-bg {
    position: fixed;
    inset: 0; /* full-bleed */
    width: 100vw;
    height: 100vh;
    z-index: -1;
    overflow: hidden;
  }
</style>
