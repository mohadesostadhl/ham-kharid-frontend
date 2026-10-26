<script setup lang="ts">
import { statusLabels } from '~/utils/format'
defineProps<{ status: string }>()
</script>
<template>
  <span :class="['badge', status]"
    ><span class="status-dot"></span>{{ statusLabels[status] || status }}</span
  >
</template>
