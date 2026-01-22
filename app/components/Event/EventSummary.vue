<template>
	<section class="p-6 sm:p-8 shadow-lg rounded-lg">
		<div>
			<h4 class="font-semibold">
				{{ event.name }}
			</h4>
			<div class="space-y-6 mb-6 mt-6">
				<div class="flex flex-wrap gap-1.5 mt-auto">
					<Calendar class="text-spotify" />{{ formattedDate }}
				</div>
				<div class="flex flex-wrap gap-1.5 mt-auto">
					<MapPin class="text-spotify" />{{ event.location }}
				</div>
				<div class="flex gap-1.5 mt-auto">
					<Dna class="text-spotify" />
					<div class="flex flex-wrap gap-1.5 mt-auto">
						<Pill
							v-for="genre in event.genres"
							:key="genre"
							:genre="genre"
						/>
					</div>
				</div>
			</div>
			<div class="flex flex-col sm:flex-row gap-3 pt-4">
				<CalendarDropDown :event="event" />
				<LinkButton :href="event.url">
					See original
				</LinkButton>
			</div>
		</div>
	</section>
</template>

<script setup lang="ts">
import { MapPin, Calendar, Dna } from "lucide-vue-next"
import type { EventData } from "~~/types"
import Pill from "../UI/Pill.vue"
import LinkButton from "../UI/LinkButton.vue"
import CalendarDropDown from "../UI/CalendarDropDown.vue"

const props = defineProps<{
	event: EventData
}>()

const emit = defineEmits<{
	"toggle-select-all": []
	"play-all": []
	"create-playlist": []
}>()

const formattedDate = computed(() => {
	const eventDate = new Date(props.event.date)
	return eventDate.toLocaleDateString(undefined, {
		year: "numeric",
		month: "long",
		day: "numeric",
	})
})

onMounted(() => {
	console.log("EventSummary mounted:", props.event)
})
</script>

<style scoped>

</style>
