<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute } from '#imports'
import { useApi } from '~/composables/useApi'
import { useResource } from '~/composables/useResource'
import type { Campaign, Reservation } from '~/types'
import { date, money, number, remaining } from '~/utils/format'
const route = useRoute()
const { request, user } = useApi()
const {
  data: campaign,
  loading,
  error,
  refresh,
} = useResource(() => request<Campaign>(`/campaigns/${route.params.id}/`))
const quantity = ref(1)
const busy = ref(false)
const formError = ref('')
const success = ref('')
const open = computed(
  () =>
    campaign.value &&
    ['active', 'funded'].includes(campaign.value.status) &&
    new Date(campaign.value.deadline).getTime() > Date.now() &&
    campaign.value.reserved_quantity < campaign.value.capacity,
)
async function reserve() {
  if (!campaign.value) return
  busy.value = true
  formError.value = ''
  success.value = ''
  try {
    await request<Reservation>(`/campaigns/${campaign.value.id}/reserve/`, 'POST', {
      quantity: quantity.value,
    })
    success.value = 'رزرو شما ثبت شد. وضعیت آن را در «خریدهای من» دنبال کنید.'
    await refresh()
  } catch (e) {
    formError.value = (e as Error).message
  } finally {
    busy.value = false
  }
}
</script>
<template>
  <div class="container page">
    <div class="breadcrumb">
      <NuxtLink to="/">کشف خریدها</NuxtLink><AppIcon name="chevron" :size="14" /><span>{{
        campaign?.title || 'جزئیات کمپین'
      }}</span>
    </div>
    <LoadState :loading="loading" :error="error" @retry="refresh" /><template
      v-if="campaign && !loading && !error"
    >
      <div class="detail-grid">
        <div>
          <div class="detail-art"><ProductArt :visual="campaign.product.visual" large /></div>
          <div class="detail-notes">
            <span><AppIcon name="sprout" :size="18" /> مستقیم از تولیدکننده</span
            ><span><AppIcon name="shield" :size="18" /> قیمت و شرایط شفاف</span
            ><span><AppIcon name="users" :size="18" /> قدرت خرید جمعی</span>
          </div>
        </div>
        <div class="detail-copy">
          <div class="card-meta">
            <span>{{ campaign.product.category_name }}</span
            ><StatusBadge :status="campaign.status" />
          </div>
          <h1>{{ campaign.title }}</h1>
          <div class="seller-caption">
            <AppIcon name="sprout" :size="17" /> {{ campaign.product.seller_name }}
          </div>
          <p>{{ campaign.product.description }}</p>
          <div class="detail-prices">
            <div class="price-row">
              <div>
                <strong>{{ money(campaign.group_price) }}</strong
                ><small> تومان / {{ campaign.product.unit }}</small>
              </div>
              <del>{{ money(campaign.product.retail_price) }} تومان</del>
            </div>
            <small
              >{{
                number(
                  Math.round((1 - campaign.group_price / campaign.product.retail_price) * 100),
                )
              }}٪ صرفه‌جویی با خرید گروهی</small
            >
          </div>
          <CampaignProgress :campaign="campaign" />
          <div class="detail-stats">
            <span><AppIcon name="clock" :size="17" />{{ remaining(campaign.deadline) }}</span
            ><span
              ><AppIcon name="package" :size="17" />{{
                number(campaign.capacity - campaign.reserved_quantity)
              }}
              واحد ظرفیت باقی‌مانده</span
            >
          </div>
          <p v-if="success" class="alert success" role="status">
            {{ success }} <NuxtLink to="/account" class="text-link">خریدهای من</NuxtLink>
          </p>
          <p v-if="formError" class="alert error" role="alert">{{ formError }}</p>
          <div v-if="open" class="reserve-box">
            <strong>سهم تو از این خرید گروهی</strong>
            <div v-if="user?.role === 'buyer'" class="reserve-controls">
              <div class="quantity-control">
                <button
                  aria-label="افزایش تعداد"
                  :disabled="quantity >= campaign.buyer_limit || busy"
                  @click="quantity++"
                >
                  <AppIcon name="plus" :size="16" /></button
                ><output aria-label="تعداد رزرو">{{ number(quantity) }}</output
                ><button
                  aria-label="کاهش تعداد"
                  :disabled="quantity <= 1 || busy"
                  @click="quantity--"
                >
                  <AppIcon name="minus" :size="16" />
                </button>
              </div>
              <button class="button" :disabled="busy" @click="reserve">
                {{ busy ? 'در حال ثبت…' : `رزرو با ${money(campaign.group_price * quantity)} تومان`
                }}<AppIcon name="bag" :size="18" />
              </button>
            </div>
            <NuxtLink
              v-else-if="!user"
              :to="`/auth?redirect=/campaigns/${campaign.id}`"
              class="button full"
              style="margin-top: 14px"
              >ورود و رزرو محصول <AppIcon name="arrow" :size="18"
            /></NuxtLink>
            <p v-else class="alert info">برای رزرو، با حساب خریدار وارد شوید.</p>
            <small
              >سقف هر خریدار {{ number(campaign.buyer_limit) }} {{ campaign.product.unit }} · بدون
              پرداخت آنلاین</small
            >
          </div>
          <div v-else class="alert info" role="status">
            {{
              campaign.status === 'successful'
                ? 'این خرید گروهی با موفقیت پایان یافت. سفارش‌ها در حساب خریداران ثبت شده‌اند.'
                : campaign.status === 'failed'
                  ? 'حدنصاب این کمپین تکمیل نشد؛ رزروها آزاد شده‌اند.'
                  : 'رزرو جدید برای این کمپین امکان‌پذیر نیست.'
            }}
          </div>
        </div>
      </div>
      <section class="info-panel">
        <h2>قبل از رزرو بدانیم</h2>
        <ul>
          <li>قیمت‌ها به تومان هستند. این نسخهٔ نمایشی پرداخت آنلاین ندارد.</li>
          <li>
            مهلت کمپین: {{ date(campaign.deadline) }}. حدنصاب: {{ number(campaign.min_quantity) }}
            {{ campaign.product.unit }}؛ ظرفیت نهایی: {{ number(campaign.capacity) }}
            {{ campaign.product.unit }}.
          </li>
          <li>
            تا پیش از پایان مهلت می‌توانید رزرو فعال خود را در «خریدهای من» لغو کنید. رسیدن به
            حدنصاب به‌تنهایی سفارش ایجاد نمی‌کند.
          </li>
          <li>
            پس از پایان مهلت و پردازش کمپین، در صورت تکمیل حدنصاب سفارش ایجاد می‌شود؛ در غیر این
            صورت رزروها آزاد می‌شوند.
          </li>
          <li>
            هماهنگی پرداخت و ارسال خارج از این نسخه انجام می‌شود. تصاویر، تصویرسازی محصول هستند.
          </li>
        </ul>
      </section>
    </template>
  </div>
</template>
