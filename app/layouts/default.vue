<template>
	<div>
		<header class="flex justify-end items-center gap-4 p-4 fixed top-0">
			<SpotifyLogin />
			<ThemeToggle />
		</header>
		<main class="min-h-screen bg-gradient-to-br bg-white dark:bg-gray-900">
			<!-- Background blobs z-0 -->
			<div class="fixed inset-0 pointer-events-none z-0">
				<div class="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-accent/5 rounded-[50%] blur-3xl" />
				<div class="absolute bottom-0 right-0 w-[600px] h-[600px] bg-accent/20 rounded-[50%] blur-3xl" />
			</div>

			<div class="max-w-2xl mx-auto">
				<slot />
			</div>
		</main>
	</div>
</template>

<script lang="ts" setup>
import ThemeToggle from "@/components/UI/ThemeToggle.vue"
import SpotifyLogin from "@/components/User/SpotifyLogin.vue"
</script>

<style>

</style>
