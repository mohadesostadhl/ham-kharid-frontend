<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute } from '#imports'
import { useApi } from '~/composables/useApi'
import { useResource } from '~/composables/useResource'
import type { Campaign, Reservation, Wallet } from '~/types'
import { date, money, number, remaining } from '~/utils/format'
const route = useRoute()
const { request, user, ready, session } = useApi()
const {
  data: campaign,
  loading,
  error,
  refresh,
} = useResource(() => request<Campaign>(`/campaigns/${route.params.id}/`))
const quantity = ref(1)
const {
  data: buyerData,
  error: buyerError,
  loading: buyerLoading,
  refresh: refreshBuyer,
} = useResource(async () => {
  if (!ready.value) await session()
  if (user.value?.role !== 'buyer') return null
  const [wallet, reservations] = await Promise.all([
    request<Wallet>('/wallet/'),
    request<Reservation[]>('/reservations/'),
  ])
  return { wallet, reservations }
})
watch(() => user.value?.id, refreshBuyer)
const existing = computed(() =>
  buyerData.value?.reservations.find(
    (item) => item.campaign.id === campaign.value?.id && item.status === 'active',
  ),
)
const maxQuantity = computed(() =>
  campaign.value
    ? Math.max(
        0,
        Math.min(
          campaign.value.buyer_limit - (existing.value?.quantity || 0),
          campaign.value.capacity - campaign.value.reserved_quantity,
        ),
      )
    : 0,
)
const unitPrice = computed(() => existing.value?.unit_price || campaign.value?.group_price || 0)
const total = computed(() => unitPrice.value * quantity.value)
const insufficient = computed(() => buyerData.value && buyerData.value.wallet.balance < total.value)
watch(maxQuantity, (maximum) => {
  quantity.value = Math.max(1, Math.min(quantity.value, maximum))
})
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
  if (!campaign.value || busy.value) return
  busy.value = true
  formError.value = ''
  success.value = ''
  try {
    await request<Reservation>(`/campaigns/${campaign.value.id}/reserve/`, 'POST', {
      quantity: quantity.value,
    })
    success.value = 'رزرو شما ثبت شد و مبلغ از کیف پول کسر شد. نتیجه را در «خریدهای من» دنبال کنید.'
    await Promise.all([refresh(), refreshBuyer()])
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
            <template v-if="user?.role === 'buyer'">
              <LoadState
                v-if="buyerLoading || buyerError"
                :loading="buyerLoading"
                :error="buyerError"
                @retry="refreshBuyer"
              />
              <div v-if="buyerData" class="purchase-wallet">
                <span
                  ><AppIcon name="wallet" :size="18" /> موجودی:
                  {{ money(buyerData.wallet.balance) }} تومان</span
                >
                <NuxtLink to="/profile#wallet" class="text-link">شارژ کیف پول</NuxtLink>
              </div>
              <p v-if="existing" class="purchase-note">
                {{ number(existing.quantity) }} واحد قبلاً رزرو کرده‌اید. قیمت هر واحد:
                {{ money(unitPrice) }} تومان
              </p>
              <p v-if="maxQuantity === 0" class="alert info">
                به سقف رزرو خود در این کمپین رسیده‌اید.
              </p>
              <div v-else class="reserve-controls">
                <div class="quantity-control">
                  <button
                    aria-label="افزایش تعداد"
                    :disabled="quantity >= maxQuantity || busy"
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
                <button
                  class="button"
                  :disabled="busy || !buyerData || !!insufficient"
                  @click="reserve"
                >
                  {{ busy ? 'در حال ثبت…' : `رزرو با ${money(total)} تومان`
                  }}<AppIcon name="bag" :size="18" />
                </button>
              </div>
              <p v-if="insufficient && maxQuantity > 0" class="alert info">
                موجودی کافی نیست؛ ابتدا
                <NuxtLink to="/profile#wallet" class="text-link">کیف پول را شارژ کنید</NuxtLink>.
              </p>
            </template>
            <NuxtLink
              v-else-if="!user"
              :to="`/auth?redirect=/campaigns/${campaign.id}`"
              class="button full"
              style="margin-top: 14px"
              >ورود و رزرو محصول <AppIcon name="arrow" :size="18"
            /></NuxtLink>
            <p v-else class="alert info">برای رزرو، با حساب خریدار وارد شوید.</p>
            <small
              >سقف هر خریدار {{ number(campaign.buyer_limit) }} {{ campaign.product.unit }} · پرداخت
              از کیف پول نمایشی</small
            >
          </div>
          <div v-else class="alert info" role="status">
            {{
              campaign.status === 'successful'
                ? 'این خرید گروهی با موفقیت پایان یافت. سفارش‌ها در حساب خریداران ثبت شده‌اند.'
                : campaign.status === 'failed'
                  ? 'حدنصاب تکمیل نشد؛ مبلغ پرداخت‌شده به کیف پول خریداران برگشت.'
                  : 'رزرو جدید برای این کمپین امکان‌پذیر نیست.'
            }}
          </div>
        </div>
      </div>
      <section class="info-panel">
        <h2>قبل از رزرو بدانیم</h2>
        <ul>
          <li>
            قیمت‌ها به تومان هستند. شارژ و پرداخت کیف پول کاملاً نمایشی است؛ پول واقعی جابه‌جا
            نمی‌شود.
          </li>
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
            صورت رزروها آزاد می‌شوند و مبلغ پرداخت‌شده به کیف پول برمی‌گردد.
          </li>
          <li>
            مبلغ هنگام رزرو کسر می‌شود و در موفقیت کمپین دوباره پرداخت نمی‌کنید. هماهنگی ارسال خارج
            از این نسخه انجام می‌شود.
          </li>
        </ul>
      </section>
    </template>
  </div>
</template>
