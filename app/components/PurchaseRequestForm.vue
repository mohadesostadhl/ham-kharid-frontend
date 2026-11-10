<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useApi } from '~/composables/useApi'
const emit = defineEmits<{ saved: [] }>()
const { request } = useApi()
const form = reactive({
  title: '',
  description: '',
  quantity: 1,
  unit: 'عدد',
  max_unit_price: 1,
  deadline: '',
})
const busy = ref(false)
const error = ref('')
async function submit() {
  busy.value = true
  error.value = ''
  try {
    await request('/purchase-requests/', 'POST', {
      ...form,
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
    <h2>درخواست خرید جدید</h2>
    <p v-if="error" class="alert error" role="alert">{{ error }}</p>
    <form class="form-grid" @submit.prevent="submit">
      <label class="field"
        >عنوان درخواست<input v-model="form.title" required maxlength="160"
      /></label>
      <label class="field"
        >تعداد موردنیاز<input
          v-model.number="form.quantity"
          type="number"
          min="1"
          max="100000"
          step="1"
          required
      /></label>
      <label class="field">واحد کالا<input v-model="form.unit" required maxlength="30" /></label>
      <label class="field"
        >سقف قیمت هر واحد (تومان)<input
          v-model.number="form.max_unit_price"
          type="number"
          min="1"
          max="10000000000"
          step="1"
          required
      /></label>
      <label class="field"
        >مهلت دریافت پیشنهاد<input v-model="form.deadline" type="datetime-local" required
      /></label>
      <label class="field span-2"
        >توضیحات درخواست<textarea v-model="form.description" required maxlength="3000"></textarea>
      </label>
      <div class="button-row span-2">
        <button class="button" :disabled="busy">
          {{ busy ? 'در حال ثبت…' : 'ثبت درخواست خرید' }}
        </button>
      </div>
    </form>
  </section>
</template>
