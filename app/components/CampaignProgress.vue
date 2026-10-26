<script setup lang="ts">
import type { Campaign } from '~/types'
import { number } from '~/utils/format'
defineProps<{ campaign: Campaign }>()
</script>
<template>
  <div class="campaign-progress">
    <div class="progress-label">
      <span
        ><strong>{{ number(campaign.reserved_quantity) }}</strong> از
        {{ number(campaign.min_quantity) }} {{ campaign.product.unit }}</span
      ><strong>{{ number(campaign.progress) }}٪</strong>
    </div>
    <div
      class="progress-track"
      role="progressbar"
      :aria-valuenow="campaign.progress"
      aria-valuemin="0"
      aria-valuemax="100"
      aria-label="پیشرفت تا حدنصاب"
    >
      <span :style="{ width: `${campaign.progress}%` }"></span>
    </div>
  </div>
</template>
