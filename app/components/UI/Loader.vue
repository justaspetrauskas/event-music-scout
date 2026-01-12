<template>
  <div class="loader-wrap" role="status">
    <div v-if="loading" class="flex items-center gap-2 text-sm text-gray-400">
      <span class="spinner" aria-hidden="true"></span>
      <span>{{ text }}</span>
    </div>

    <div v-else class="flex items-center gap-2 text-sm text-gray-400">
      <span class="font-medium text-gray-200">Found</span>
      <span class="ml-1 font-semibold text-white">{{ count }}</span>
      <span class="ml-1 text-gray-400">artists</span>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { defineProps } from 'vue'

const props = defineProps<{
  loading: boolean
  count: number
  text?: string
}>()

const text = props.text ?? 'Searching artists…'
</script>

<style scoped>
.spinner {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  border: 2px solid rgba(255,255,255,0.15);
  border-top-color: rgba(255,255,255,0.7);
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>
