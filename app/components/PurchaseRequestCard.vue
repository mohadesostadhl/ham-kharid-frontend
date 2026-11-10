<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { useApi } from '~/composables/useApi'
import type { PurchaseRequest } from '~/types'
import { date, money, number } from '~/utils/format'
const props = defineProps<{ item: PurchaseRequest }>()
const emit = defineEmits<{ changed: [] }>()
const { user, request } = useApi()
const form = reactive({ unit_price: 1, description: '' })
const busy = ref(false)
const error = ref('')
const open = computed(
  () => props.item.status === 'open' && new Date(props.item.deadline).getTime() > Date.now(),
)
const canOffer = computed(
  () =>
    open.value &&
    user.value?.role === 'seller' &&
    !props.item.offers.some((offer) => offer.seller === user.value?.id),
)
async function act(action: 'offer' | 'accept', offerId?: number) {
  busy.value = true
  error.value = ''
  try {
    await request(
      `/purchase-requests/${props.item.id}/${action}/`,
      'POST',
      action === 'offer' ? { ...form } : { offer_id: offerId },
    )
    emit('changed')
  } catch (e) {
    error.value = (e as Error).message
  } finally {
    busy.value = false
  }
}
</script>
<template>
  <article class="panel">
    <div class="section-heading">
      <h2>{{ item.title }}</h2>
      <span>{{
        item.status === 'closed'
          ? 'پیشنهاد انتخاب شد'
          : open
            ? 'در انتظار پیشنهاد'
            : 'مهلت پایان یافته'
      }}</span>
    </div>
    <p>{{ item.description }}</p>
    <p>
      {{ item.buyer_name }} · {{ number(item.quantity) }} {{ item.unit }} · مهلت:
      {{ date(item.deadline) }}
    </p>
    <p>سقف قیمت هر واحد: {{ money(item.max_unit_price) }} تومان</p>
    <p v-if="error" class="alert error" role="alert">{{ error }}</p>
    <h3>پیشنهادهای فروشندگان</h3>
    <p v-if="!item.offers.length">هنوز پیشنهادی ثبت نشده است.</p>
    <div v-for="offer in item.offers" :key="offer.id" class="panel">
      <strong>{{ offer.seller_name }} · {{ money(offer.unit_price) }} تومان برای هر واحد</strong>
      <p>{{ offer.description }}</p>
      <p>مبلغ کل: {{ money(offer.unit_price * item.quantity) }} تومان</p>
      <p v-if="offer.is_accepted" class="alert success">پیشنهاد انتخاب‌شده</p>
      <button
        v-if="open && user?.id === item.buyer"
        class="button secondary compact"
        :disabled="busy"
        @click="act('accept', offer.id)"
      >
        انتخاب این پیشنهاد
      </button>
    </div>
    <form v-if="canOffer" class="form-grid" @submit.prevent="act('offer')">
      <label class="field"
        >قیمت پیشنهادی هر واحد (تومان)<input
          v-model.number="form.unit_price"
          type="number"
          min="1"
          :max="item.max_unit_price"
          step="1"
          required
      /></label>
      <label class="field span-2"
        >توضیحات پیشنهاد<textarea v-model="form.description" required maxlength="1500"></textarea>
      </label>
      <div class="button-row span-2">
        <button class="button" :disabled="busy">{{ busy ? 'در حال ثبت…' : 'ثبت پیشنهاد' }}</button>
      </div>
    </form>
  </article>
</template>
