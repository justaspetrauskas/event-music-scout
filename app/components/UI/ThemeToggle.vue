<template>
	<button
		type="button"
		role="switch"
		aria-label="Toggle light or dark mode"
		class="w-10 h-10 flex items-center justify-center rounded-full p-3
  backdrop-blur-sm bg-white/80 border border-white/30 hover:border-white/50
  dark:backdrop-blur-sm dark:bg-black/20 dark:border-white/20 dark:hover:border-white/40
  shadow-lg dark:shadow-[0_0_20px_rgba(59,130,246,0.3)] hover:dark:shadow-[0_0_30px_rgba(59,130,246,0.5)]
  dark:ring-2 dark:ring-blue-500/30 hover:dark:ring-blue-500/50 dark:ring-offset-1 dark:ring-offset-transparent
  transition-all duration-300"
		@click="toggleTheme"
	>
		<Sun
			v-if="theme === 'dark'"
			class="w-6 h-6 text-gray-200"
		/>
		<Moon
			v-else
			class="w-6 h-6 text-gray-800"
		/>
	</button>
</template>

<script setup lang="ts">
import { Sun, Moon } from "lucide-vue-next"

const { theme, toggleTheme } = useTheme()
</script>
