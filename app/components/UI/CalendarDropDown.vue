<template>
	<div class="relative inline-block text-left">
		<!-- Using your Button component with secondary variant -->
		<ButtonComponent
			ref="triggerRef"
			variant="secondary"
			@click="toggleDropdown"
		>
			<template #icon>
				<Calendar class="w-4 h-4" />
			</template>
			<span class="truncate max-w-[150px]">Save to calendar</span>
		</ButtonComponent>

		<div
			v-if="isOpen"
			ref="dropdownRef"
			class="absolute right-0 mt-2 w-64 bg-white border border-gray-200 rounded-xl shadow-2xl z-50 animate-in fade-in zoom-in duration-200"
		>
			<div class="py-2">
				<div
					v-for="service in services"
					:key="service.id"
					class="group flex items-center gap-3 px-4 py-3 mx-1 rounded-xl cursor-pointer transition-all duration-200 hover:bg-gradient-to-r hover:from-green-50 hover:to-blue-50 hover:shadow-md border border-transparent hover:border-green-200"
					@click="selectCalendar(service)"
				>
					<div :class="`w-10 h-10 rounded-xl bg-gradient-to-br flex items-center justify-center shrink-0 ${service.bgClass}`">
						<!-- Icon placeholder -->
						<!-- <span class="text-white text-xs font-bold">{{ service.id.toUpperCase() }}</span> -->
					</div>
					<div class="flex-1 min-w-0">
						<p class="font-medium text-gray-900 group-hover:text-green-700">
							{{ service.label }}
						</p>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script
		lang="ts"
		setup
	>
import { ref, useTemplateRef } from "vue"
import { google, outlook, yahoo, ics } from "calendar-link"
import { Calendar } from "lucide-vue-next"
import type { EventData } from "~~/types"
import ButtonComponent from "../UI/ButtonComponent.vue"
import { onClickOutside } from "@vueuse/core"

const props = defineProps<{
	event: EventData
}>()

const isOpen = ref(false)
const triggerRef = useTemplateRef("triggerRef")
const dropdownRef = useTemplateRef("dropdownRef")

const services = [
	{
		id: "google",
		label: "Google Calendar",
		icon: "GoogleIcon",
		bgClass: "from-red-500 to-pink-500",
	},
	{
		id: "outlook",
		label: "Outlook",
		icon: "OutlookIcon",
		bgClass: "from-blue-500 to-blue-600",
	},
	{
		id: "yahoo",
		label: "Yahoo",
		icon: "YahooIcon",
		bgClass: "from-gray-500 to-gray-600",
	},
	{
		id: "ics",
		label: "Download .ics",
		icon: "DownloadIcon",
		bgClass: "from-gray-500 to-gray-600",
	},
]

const toggleDropdown = () => {
	isOpen.value = !isOpen.value
}

const selectCalendar = (service: Record<string, string>) => {
	saveToCalendar(service.id)
	isOpen.value = false
}

onClickOutside(triggerRef, () => {
	isOpen.value = false
})
onClickOutside(dropdownRef, () => {
	isOpen.value = false
})

const saveToCalendar = (platform: string) => {
	const event = {
		title: props.event.name,
		start: new Date(props.event.date).toISOString(),
		location: props.event.location,
		description: "Be there",
		duration: [3, "hour"],
	}

	let url = ""
	switch (platform) {
		case "google":
			url = google(event)
			break
		case "outlook":
			url = outlook(event)
			break
		case "yahoo":
			url = yahoo(event)
			break
		case "ics":
			url = ics(event)
			break
		default:
			break
	}

	window.open(url, "_blank")
}
</script>

<style scoped>
</style>
