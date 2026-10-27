<script setup lang="ts">
import { ref } from 'vue'
import { useApi } from '~/composables/useApi'
import type { Wallet } from '~/types'
import { date, money } from '~/utils/format'

defineProps<{ wallet: Wallet }>()
const emit = defineEmits<{ updated: [] }>()
const { request } = useApi()
const amount = ref(500000)
const busy = ref(false)
const error = ref('')
const success = ref('')
// Retain the key on a network failure: retrying must not credit the wallet twice.
let pending: { amount: number; reference: string } | null = null
const labels = { top_up: 'شارژ نمایشی', payment: 'پرداخت رزرو', refund: 'بازگشت وجه' }

async function topUp() {
  if (busy.value) return
  busy.value = true
  error.value = ''
  success.value = ''
  if (!pending || pending.amount !== amount.value) {
    pending = { amount: amount.value, reference: crypto.randomUUID() }
  }
  try {
    await request<Wallet>('/wallet/', 'POST', pending)
    pending = null
    success.value = 'کیف پول با موفقیت شارژ شد. این اعتبار فقط نمایشی است.'
    emit('updated')
  } catch (e) {
    error.value = (e as Error).message
  } finally {
    busy.value = false
  }
}
</script>

<template>
  <section id="wallet" class="wallet-panel" aria-labelledby="wallet-title">
    <div class="wallet-overview">
      <div class="wallet-heading">
        <AppIcon name="wallet" :size="24" />
        <h2 id="wallet-title">کیف پول من</h2>
      </div>
      <span class="wallet-demo-label">اعتبار نمایشی · بدون پول واقعی</span>
      <p class="wallet-balance">
        <strong>{{ money(wallet.balance) }}</strong> <span>تومان</span>
      </p>
      <p>موجودی قابل استفاده برای رزرو خریدها</p>
      <small>با لغو رزرو یا ناموفق شدن کمپین، مبلغ پرداخت‌شده به همین کیف پول برمی‌گردد.</small>
    </div>
    <div class="wallet-topup">
      <form v-if="wallet.fake_top_up_enabled" class="form-stack" @submit.prevent="topUp">
        <label class="field" for="topup-amount"
          >مبلغ شارژ (تومان)
          <input
            id="topup-amount"
            v-model.number="amount"
            type="number"
            min="10000"
            max="10000000"
            step="1"
            required
            :disabled="busy"
            aria-describedby="topup-help"
          />
        </label>
        <div class="topup-presets" role="group" aria-label="مبلغ‌های پیشنهادی شارژ">
          <button
            v-for="preset in [100000, 500000, 1000000]"
            :key="preset"
            type="button"
            :class="{ selected: amount === preset }"
            :aria-pressed="amount === preset"
            :disabled="busy"
            @click="amount = preset"
          >
            {{ money(preset) }}
          </button>
        </div>
        <button class="button" type="submit" :disabled="busy">
          <AppIcon name="plus" :size="18" />{{ busy ? 'در حال شارژ…' : 'شارژ نمایشی کیف پول' }}
        </button>
        <small id="topup-help"
          >بین ۱۰٬۰۰۰ تا ۱۰٬۰۰۰٬۰۰۰ تومان؛ بدون درگاه بانکی و اطلاعات کارت.</small
        >
      </form>
      <p v-else class="alert info">شارژ نمایشی در این محیط غیرفعال است.</p>
      <p v-if="error" class="alert error" role="alert">{{ error }}</p>
      <p v-if="success" class="alert success" role="status">{{ success }}</p>
    </div>
  </section>
  <details class="wallet-history">
    <summary>سابقهٔ تراکنش‌های کیف پول</summary>
    <p v-if="!wallet.transactions.length" class="wallet-history-empty">
      هنوز تراکنشی ندارید؛ از شارژ نمایشی شروع کنید.
    </p>
    <ol v-else class="transaction-list">
      <li v-for="entry in wallet.transactions" :key="entry.id" class="transaction-row">
        <div>
          <strong>{{ labels[entry.kind] }}</strong>
          <p v-if="entry.campaign_title">{{ entry.campaign_title }}</p>
          <small>{{ date(entry.created_at) }}</small>
        </div>
        <div class="transaction-amount" :class="entry.amount > 0 ? 'credit' : 'debit'">
          <strong
            ><bdi dir="ltr"
              >{{ entry.amount > 0 ? '+' : '−' }}{{ money(Math.abs(entry.amount)) }}</bdi
            >
            تومان</strong
          >
          <small>مانده: {{ money(entry.balance_after) }} تومان</small>
        </div>
      </li>
    </ol>
    <small v-if="wallet.transactions.length">۵۰ تراکنش آخر نمایش داده می‌شود.</small>
  </details>
</template>
