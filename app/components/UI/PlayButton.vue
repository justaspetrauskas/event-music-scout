<template>
	<div
		class="wrapper"
		:class="{ playing: isPlaying }"
	>
		<div class="circle pulse" />
		<div class="circle">
			<svg
				:viewBox="`0 0 100 100`"
				xmlns="http://www.w3.org/2000/svg"
			>
				<g v-if="!isPlaying">
					<polygon
						points="40,30 74,50 40,70"
					/>
				</g>
				<g v-else>
					<rect
						x="35"
						y="30"
						width="12"
						height="40"
						rx="2"
					/>
					<rect
						x="53"
						y="30"
						width="12"
						height="40"
						rx="2"
					/>
				</g>
			</svg>
		</div>
	</div>
</template>

<script lang="ts" setup>
defineProps<{
	isPlaying: boolean
}>()
</script>

<style>
.wrapper {
  position: relative;
  width: 32px;
  height: 32px;
}
.wrapper .circle {
  position: absolute;
  width: 32px;
  height: 32px;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  border-radius: 50%;
  display: flex;
  border: 1px solid #33cc33;
  background-color: var(--pico-background-color);
  margin: auto;
  transform: scale(1, 1);
}
.wrapper .circle.pulse {
  background: radial-gradient(circle, rgba(153, 230, 153, 1) 0%, rgba(153, 230, 153, 0.6) 90%);
  border: none;
  animation: none;
  -webkit-animation: none;
}

.wrapper:hover .circle.pulse {
  -webkit-animation-timing-function: ease;
  animation-timing-function: ease;
  -webkit-animation: pulse 2s infinite;
  animation: pulse 2s infinite;
}
.wrapper svg {
  fill: #279b27;
  stroke: #279b27;
  stroke-linejoin: round;
  stroke-width: 1;
  transition: all 0.3s;
  stroke-linejoin: round;
}
.wrapper svg:hover {
  cursor: pointer;
  fill: #99e699;
  stroke: #99e699;
  transform: scale(1.2, 1.2);
  animation: pulse 2s infinite;
}

/* Activate existing pulse animation when playing */
.wrapper.playing .circle.pulse {
  animation: pulse 2s infinite ease-in-out;
}

@-webkit-keyframes pulse {
  0% {
    transform: scale(1, 1);
  }
  25% {
    transform: scale(1, 1);
  }
  50% {
    transform: scale(1.2, 1.2);
  }
  100% {
    transform: scale(1, 1);
  }
}

@keyframes pulse {
  0% {
    transform: scale(1, 1);
  }
  25% {
    transform: scale(1, 1);
  }
  50% {
    transform: scale(1.2, 1.2);
  }
  100% {
    transform: scale(1, 1);
  }
}
</style>
