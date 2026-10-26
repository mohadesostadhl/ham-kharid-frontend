<script setup lang="ts">
defineProps<{ loading?: boolean; error?: string; empty?: boolean; title?: string }>()
defineEmits<{ retry: [] }>()
</script>
<template>
  <div v-if="loading" class="skeleton-grid" aria-label="در حال بارگذاری" role="status">
    <div v-for="i in 3" :key="i" class="skeleton-card">
      <div class="skeleton-image"></div>
      <div class="skeleton-line"></div>
      <div class="skeleton-line short"></div>
    </div>
  </div>
  <div v-else-if="error" class="empty-state" role="alert">
    <AppIcon name="alert" :size="32" />
    <h2>ارتباط برقرار نشد</h2>
    <p>{{ error }}</p>
    <button class="button secondary" @click="$emit('retry')">تلاش دوباره</button>
  </div>
  <div v-else-if="empty" class="empty-state">
    <AppIcon name="bag" :size="36" />
    <h2>{{ title || 'هنوز چیزی اینجا نیست' }}</h2>
    <p>یک انتخاب تازه، شروع یک خرید بهتر است.</p>
    <slot />
  </div>
</template>
