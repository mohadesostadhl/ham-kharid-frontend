<script setup lang="ts">
import { onMounted, onBeforeUnmount, useTemplateRef } from 'vue'
defineProps<{ title: string; busy?: boolean }>()
const emit = defineEmits<{ confirm: []; close: [] }>()
const dialog = useTemplateRef<HTMLDialogElement>('dialog')
let previous: Element | null = null
onMounted(() => {
  previous = document.activeElement
  dialog.value?.showModal()
})
onBeforeUnmount(() => {
  if (previous instanceof HTMLElement) previous.focus()
})
</script>
<template>
  <dialog
    ref="dialog"
    class="confirm-dialog"
    aria-labelledby="dialog-title"
    @cancel.prevent="!busy && emit('close')"
  >
    <div class="dialog-icon"><AppIcon name="alert" :size="28" /></div>
    <h2 id="dialog-title">{{ title }}</h2>
    <p>با لغو رزرو، مبلغ پرداخت‌شده به کیف پول برمی‌گردد و ظرفیت برای دیگران آزاد می‌شود.</p>
    <div class="button-row">
      <button class="button danger" :disabled="busy" @click="emit('confirm')">
        {{ busy ? 'در حال انجام…' : 'بله، لغو رزرو' }}</button
      ><button class="button secondary" :disabled="busy" @click="emit('close')">بازگشت</button>
    </div>
  </dialog>
</template>
