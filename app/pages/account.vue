<script setup lang="ts">
import { computed, ref } from 'vue'
import { useApi } from '~/composables/useApi'
import { useResource } from '~/composables/useResource'
import type { Order, Reservation } from '~/types'
import { date, money, number } from '~/utils/format'
const { request, user, ready, session } = useApi()
const tab = ref('reservations')
const selected = ref<Reservation | null>(null)
const busy = ref(false)
const actionError = ref('')
const success = ref('')
const { data, loading, error, refresh } = useResource(async () => {
  if (!ready.value) await session()
  if (!user.value || user.value.role !== 'buyer') return null
  const [reservations, orders] = await Promise.all([
    request<Reservation[]>('/reservations/'),
    request<Order[]>('/orders/'),
  ])
  return { reservations, orders }
})
const activeCount = computed(
  () => data.value?.reservations.filter((r) => r.status === 'active').length || 0,
)
async function cancel() {
  if (!selected.value) return
  busy.value = true
  actionError.value = ''
  success.value = ''
  try {
    await request(`/reservations/${selected.value.id}/cancel/`, 'POST')
    selected.value = null
    success.value = 'رزرو لغو شد و ظرفیت آزاد شد.'
    await refresh()
  } catch (e) {
    actionError.value = (e as Error).message
    selected.value = null
  } finally {
    busy.value = false
  }
}
</script>
<template>
  <div class="container page">
    <div class="section-heading">
      <div>
        <div class="section-kicker">حساب خریدار</div>
        <h1 style="font-size: 2rem">خریدهای من</h1>
        <p v-if="user">{{ user.display_name }}، همراهی‌ات ارزشمند است.</p>
      </div>
      <NuxtLink to="/" class="button secondary compact"
        >کشف خریدها <AppIcon name="arrow" :size="17"
      /></NuxtLink>
    </div>
    <div v-if="ready && (!user || user.role !== 'buyer')" class="empty-state">
      <AppIcon name="bag" :size="36" />
      <h2>خریدها در حساب خریدار شما هستند</h2>
      <p>برای دیدن رزروها و سفارش‌ها با حساب خریدار وارد شوید.</p>
      <NuxtLink to="/auth?redirect=/account" class="button">ورود به حساب</NuxtLink>
    </div>
    <template v-else>
      <div class="summary-grid">
        <div class="summary-card">
          <span><AppIcon name="bag" /></span>
          <div>
            <strong>{{ number(activeCount) }}</strong
            ><small>رزرو فعال</small>
          </div>
        </div>
        <div class="summary-card">
          <span><AppIcon name="package" /></span>
          <div>
            <strong>{{ number(data?.orders.length || 0) }}</strong
            ><small>سفارش ثبت‌شده</small>
          </div>
        </div>
        <div class="summary-card">
          <span><AppIcon name="users" /></span>
          <div>
            <strong>{{ number(data?.reservations.length || 0) }}</strong
            ><small>همراهی در کمپین‌ها</small>
          </div>
        </div>
      </div>
      <div class="tabs" role="group" aria-label="بخش‌های خریدهای من">
        <button
          :class="{ selected: tab === 'reservations' }"
          :aria-pressed="tab === 'reservations'"
          @click="tab = 'reservations'"
        >
          رزروهای من</button
        ><button
          :class="{ selected: tab === 'orders' }"
          :aria-pressed="tab === 'orders'"
          @click="tab = 'orders'"
        >
          سفارش‌های من
        </button>
      </div>
      <p v-if="success" class="alert success" role="status">{{ success }}</p>
      <p v-if="actionError" class="alert error" role="alert">{{ actionError }}</p>
      <LoadState
        :loading="loading"
        :error="error"
        :empty="
          !loading &&
          !error &&
          (tab === 'reservations' ? !data?.reservations.length : !data?.orders.length)
        "
        :title="tab === 'reservations' ? 'هنوز رزروی ثبت نکرده‌ای' : 'هنوز سفارشی ثبت نشده'"
        @retry="refresh"
      >
        <NuxtLink to="/" class="button secondary">پیدا کردن یک خرید خوب</NuxtLink> </LoadState
      ><template v-if="data && !loading && !error">
        <div v-if="tab === 'reservations'">
          <article
            v-for="reservation in data.reservations"
            :key="reservation.id"
            class="account-item"
          >
            <ProductArt :visual="reservation.campaign.product.visual" />
            <div class="account-item-content">
              <h2>
                <NuxtLink :to="`/campaigns/${reservation.campaign.id}`">{{
                  reservation.campaign.title
                }}</NuxtLink>
              </h2>
              <StatusBadge :status="reservation.status" />
              <p>
                {{ number(reservation.quantity) }} {{ reservation.campaign.product.unit }} ·
                {{ money(reservation.quantity * reservation.campaign.group_price) }} تومان
              </p>
              <p>مهلت: {{ date(reservation.campaign.deadline) }}</p>
            </div>
            <button
              v-if="
                reservation.status === 'active' &&
                new Date(reservation.campaign.deadline).getTime() > Date.now()
              "
              class="button secondary compact"
              @click="selected = reservation"
            >
              لغو رزرو
            </button>
          </article>
        </div>
        <div v-else>
          <article v-for="order in data.orders" :key="order.id" class="account-order">
            <div>
              <h3>
                <NuxtLink :to="`/campaigns/${order.campaign_id}`">{{
                  order.campaign_title
                }}</NuxtLink>
              </h3>
              <small
                >سفارش {{ number(order.id) }} · {{ number(order.quantity) }} واحد ·
                {{ date(order.created_at) }}</small
              >
            </div>
            <strong>{{ money(order.total) }} <small>تومان</small></strong
            ><StatusBadge :status="order.status" />
          </article>
          <p v-if="data.orders.length" class="alert info">
            پرداخت و هماهنگی ارسال در این نسخه خارج از سامانه انجام می‌شود.
          </p>
        </div>
      </template> </template
    ><ConfirmDialog
      v-if="selected"
      title="رزرو شما لغو شود؟"
      :busy="busy"
      @close="selected = null"
      @confirm="cancel"
    />
  </div>
</template>
