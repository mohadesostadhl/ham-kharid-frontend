<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useApi } from '~/composables/useApi'
import type { Product } from '~/types'
defineProps<{ products: Product[] }>()
const emit = defineEmits<{ saved: []; close: [] }>()
const { request } = useApi()
const form = reactive({
  title: '',
  product_id: '',
  group_price: 0,
  min_quantity: 10,
  capacity: 30,
  buyer_limit: 5,
  deadline: '',
})
const busy = ref(false)
const error = ref('')
async function submit() {
  busy.value = true
  error.value = ''
  try {
    await request('/campaigns/', 'POST', {
      ...form,
      product_id: Number(form.product_id),
      deadline: new Date(form.deadline).toISOString(),
    })
    emit('saved')
  } catch (e) {
    error.value = (e as Error).message
  } finally {
    busy.value = false
  }
}
</script>
<template>
  <section class="panel">
    <div class="section-heading">
      <h2>ساخت کمپین جدید</h2>
      <button
        class="icon-button"
        aria-label="بستن فرم کمپین"
        :disabled="busy"
        @click="emit('close')"
      >
        <AppIcon name="close" />
      </button>
    </div>
    <p class="alert info">
      کمپین به‌صورت پیش‌نویس ذخیره می‌شود. پس از بررسی، آن را منتشر کنید. پس از انتشار، قیمت و شرایط
      ثابت می‌مانند.
    </p>
    <p v-if="!products.length" class="alert info">ابتدا یک محصول اضافه کنید.</p>
    <p v-if="error" class="alert error" role="alert">{{ error }}</p>
    <form class="form-grid" @submit.prevent="submit">
      <label class="field"
        >عنوان کمپین<input
          v-model="form.title"
          required
          maxlength="160"
          placeholder="عنوان روشن و کوتاه" /></label
      ><label class="field"
        >محصول<select v-model="form.product_id" required>
          <option disabled value="">انتخاب محصول</option>
          <option v-for="product in products" :key="product.id" :value="product.id">
            {{ product.name }}
          </option>
        </select></label
      ><label class="field"
        >قیمت گروهی (تومان)<input
          v-model.number="form.group_price"
          type="number"
          dir="ltr"
          min="1"
          max="10000000000"
          required
        /><small>کمتر از قیمت تکی محصول</small></label
      ><label class="field"
        >حدنصاب تعداد<input
          v-model.number="form.min_quantity"
          type="number"
          dir="ltr"
          min="1"
          max="100000"
          required /></label
      ><label class="field"
        >ظرفیت کل<input
          v-model.number="form.capacity"
          type="number"
          dir="ltr"
          :min="form.min_quantity"
          max="100000"
          required /></label
      ><label class="field"
        >سقف هر خریدار<input
          v-model.number="form.buyer_limit"
          type="number"
          dir="ltr"
          min="1"
          :max="form.capacity"
          required /></label
      ><label class="field"
        >پایان مهلت (زمان محلی دستگاه)<input
          v-model="form.deadline"
          dir="ltr"
          type="datetime-local"
          required
        /><small>تاریخ ورودی میلادی است؛ تاریخ‌های سامانه شمسی نمایش داده می‌شوند.</small></label
      >
      <div class="button-row span-2">
        <button class="button" :disabled="busy || !products.length">
          {{ busy ? 'در حال ذخیره…' : 'ذخیرهٔ پیش‌نویس' }}<AppIcon name="check" :size="18" />
        </button>
      </div>
    </form>
  </section>
</template>
