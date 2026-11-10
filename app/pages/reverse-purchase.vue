<script setup lang="ts">
import { ref } from 'vue'
import { useApi } from '~/composables/useApi'
import { useResource } from '~/composables/useResource'
import type { Paginated, PurchaseRequest } from '~/types'
import { number } from '~/utils/format'
const { user, request } = useApi()
const showForm = ref(false)
const page = ref(1)
const success = ref('')
const { data, loading, error, refresh } = useResource(() =>
  request<Paginated<PurchaseRequest>>(`/purchase-requests/?page=${page.value}`),
)
async function saved() {
  showForm.value = false
  page.value = 1
  success.value = 'درخواست خرید ثبت شد؛ فروشنده‌ها می‌توانند پیشنهاد بدهند.'
  await refresh()
}
async function changePage(delta: number) {
  page.value += delta
  await refresh()
}
</script>
<template>
  <div class="container page">
    <div class="section-heading">
      <div>
        <h1>خرید معکوس</h1>
        <p>نیازت را ثبت کن، پیشنهاد فروشنده‌ها را مقایسه کن و یکی را انتخاب کن.</p>
        <p>
          قیمت‌ها برای تأمین تمام تعداد درخواستی هستند. انتخاب پیشنهاد، پرداخت یا سفارش خودکار ایجاد
          نمی‌کند.
        </p>
      </div>
      <button v-if="user?.role === 'buyer'" class="button compact" @click="showForm = !showForm">
        {{ showForm ? 'بستن فرم' : 'درخواست جدید' }}
      </button>
      <NuxtLink
        v-else-if="!user"
        to="/auth?redirect=/reverse-purchase"
        class="button secondary compact"
        >ورود برای ثبت درخواست یا پیشنهاد</NuxtLink
      >
    </div>
    <p v-if="success" class="alert success" role="status">{{ success }}</p>
    <PurchaseRequestForm v-if="showForm && user?.role === 'buyer'" @saved="saved" />
    <LoadState
      :loading="loading"
      :error="error"
      :empty="!data?.results.length"
      title="هنوز درخواست خریدی ثبت نشده است"
      @retry="refresh"
    />
    <template v-if="!loading && !error">
      <PurchaseRequestCard
        v-for="item in data?.results"
        :key="item.id"
        :item="item"
        @changed="refresh"
      />
    </template>
    <div v-if="data && (data.next || data.previous)" class="pagination">
      <button
        class="button secondary compact"
        :disabled="!data.previous || loading"
        @click="changePage(-1)"
      >
        صفحهٔ قبل
      </button>
      <span>{{ number(page) }}</span>
      <button
        class="button secondary compact"
        :disabled="!data.next || loading"
        @click="changePage(1)"
      >
        صفحهٔ بعد
      </button>
    </div>
  </div>
</template>
