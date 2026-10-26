<script setup lang="ts">
import type { Campaign } from '~/types'
import { money, number, remaining } from '~/utils/format'
defineProps<{ campaign: Campaign }>()
</script>
<template>
  <article class="campaign-card">
    <NuxtLink :to="`/campaigns/${campaign.id}`" class="art-link" :aria-label="campaign.title"
      ><ProductArt :visual="campaign.product.visual" /><span class="discount"
        >{{ number(Math.round((1 - campaign.group_price / campaign.product.retail_price) * 100)) }}٪
        به‌صرفه‌تر</span
      ></NuxtLink
    >
    <div class="card-body">
      <div class="card-meta">
        <span>{{ campaign.product.category_name }}</span
        ><StatusBadge v-if="campaign.status !== 'active'" :status="campaign.status" /><span
          v-else
          class="live-label"
          ><i></i> در حال خرید</span
        >
      </div>
      <h3>
        <NuxtLink :to="`/campaigns/${campaign.id}`">{{ campaign.title }}</NuxtLink>
      </h3>
      <p class="seller-caption">
        <AppIcon name="sprout" :size="14" />{{ campaign.product.seller_name }}
      </p>
      <div class="price-row">
        <div>
          <strong>{{ money(campaign.group_price) }}</strong
          ><small> تومان</small>
        </div>
        <del>{{ money(campaign.product.retail_price) }}</del>
      </div>
      <CampaignProgress :campaign="campaign" />
      <div class="card-bottom">
        <span><AppIcon name="clock" :size="15" />{{ remaining(campaign.deadline) }}</span
        ><NuxtLink :to="`/campaigns/${campaign.id}`" class="card-action"
          >مشاهده <AppIcon name="arrow" :size="17"
        /></NuxtLink>
      </div>
    </div>
  </article>
</template>
