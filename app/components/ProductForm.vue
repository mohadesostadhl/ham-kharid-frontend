<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useApi } from '~/composables/useApi'
import type { Category } from '~/types'
defineProps<{ categories: Category[] }>()
const emit = defineEmits<{ saved: []; close: [] }>()
const { request } = useApi()
const form = reactive({
  name: '',
  description: '',
  category: '',
  retail_price: 0,
  unit: 'بسته',
  visual: 'coffee',
})
const busy = ref(false)
const error = ref('')
async function submit() {
  busy.value = true
  error.value = ''
  try {
    await request('/products/', 'POST', { ...form, category: Number(form.category) })
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
      <h2>افزودن محصول</h2>
      <button
        class="icon-button"
        aria-label="بستن فرم محصول"
        :disabled="busy"
        @click="emit('close')"
      >
        <AppIcon name="close" />
      </button>
    </div>
    <p v-if="error" class="alert error" role="alert">{{ error }}</p>
    <form class="form-grid" @submit.prevent="submit">
      <label class="field"
        >نام محصول<input
          v-model="form.name"
          required
          maxlength="150"
          placeholder="مثلاً قهوهٔ ترکیبی روزانه" /></label
      ><label class="field"
        >دسته‌بندی<select v-model="form.category" required>
          <option disabled value="">انتخاب دسته‌بندی</option>
          <option v-for="category in categories" :key="category.id" :value="category.id">
            {{ category.name }}
          </option>
        </select></label
      ><label class="field"
        >قیمت تکی (تومان)<input
          v-model.number="form.retail_price"
          dir="ltr"
          type="number"
          min="1"
          max="10000000000"
          step="1"
          required /></label
      ><label class="field"
        >واحد فروش<input
          v-model="form.unit"
          required
          maxlength="30"
          placeholder="بسته، کیلوگرم، عدد…" /></label
      ><label class="field"
        >تصویرسازی محصول<select v-model="form.visual">
          <option value="coffee">قهوه</option>
          <option value="olive">روغن زیتون</option>
          <option value="honey">عسل</option>
          <option value="tea">چای</option>
          <option value="saffron">زعفران</option>
          <option value="ceramic">ماگ و سفال</option>
        </select></label
      ><label class="field span-2"
        >دربارهٔ محصول<textarea
          v-model="form.description"
          required
          maxlength="3000"
          placeholder="کیفیت، وزن، بسته‌بندی و شرایط محصول را توضیح دهید."
        ></textarea>
      </label>
      <div class="button-row span-2">
        <button class="button" :disabled="busy">
          {{ busy ? 'در حال ذخیره…' : 'ذخیرهٔ محصول' }}<AppIcon name="check" :size="18" />
        </button>
      </div>
    </form>
  </section>
</template>
