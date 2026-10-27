<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref, useTemplateRef, watch } from 'vue'
import { navigateTo, useRoute } from '#imports'
import { useApi } from '~/composables/useApi'
import type { Wallet } from '~/types'
import { money } from '~/utils/format'

const props = defineProps<{ navigationOpen: boolean }>()
const emit = defineEmits<{ opened: [] }>()
const { user, request, logout } = useApi()
const route = useRoute()
const root = useTemplateRef<HTMLElement>('root')
const trigger = useTemplateRef<HTMLButtonElement>('trigger')
const open = ref(false)
const balance = ref<number | null>(null)
const loading = ref(false)
const error = ref('')
const busy = ref(false)

async function loadBalance() {
  if (user.value?.role !== 'buyer') return
  loading.value = true
  error.value = ''
  try {
    balance.value = (await request<Wallet>('/wallet/')).balance
  } catch (e) {
    error.value = (e as Error).message
  } finally {
    loading.value = false
  }
}
function toggle() {
  open.value = !open.value
  if (open.value) {
    emit('opened')
    loadBalance()
  }
}
function outside(event: Event) {
  if (event.target instanceof Node && !root.value?.contains(event.target)) open.value = false
}
function escape(event: KeyboardEvent) {
  if (event.key === 'Escape' && open.value) {
    open.value = false
    trigger.value?.focus()
  }
}
async function signout() {
  if (busy.value) return
  busy.value = true
  error.value = ''
  try {
    await logout()
    open.value = false
    await navigateTo('/')
  } catch (e) {
    error.value = (e as Error).message
  } finally {
    busy.value = false
  }
}
watch(
  () => route.fullPath,
  () => {
    open.value = false
  },
)
watch(
  () => props.navigationOpen,
  (navigationOpen) => {
    if (navigationOpen) open.value = false
  },
)
onMounted(() => {
  document.addEventListener('pointerdown', outside)
  document.addEventListener('focusin', outside)
  document.addEventListener('keydown', escape)
})
onBeforeUnmount(() => {
  document.removeEventListener('pointerdown', outside)
  document.removeEventListener('focusin', outside)
  document.removeEventListener('keydown', escape)
})
</script>

<template>
  <div ref="root" class="profile-menu">
    <button
      ref="trigger"
      class="icon-button profile-trigger"
      aria-label="حساب کاربری"
      :aria-expanded="open"
      aria-controls="profile-popup"
      @click="toggle"
    >
      <AppIcon name="profile" :size="24" />
    </button>
    <section
      v-if="open && user"
      id="profile-popup"
      class="profile-popup"
      aria-label="منوی حساب کاربری"
    >
      <div class="profile-popup-user">
        <span class="profile-avatar"><AppIcon name="profile" :size="28" /></span>
        <div>
          <strong>{{ user.display_name || user.username }}</strong
          ><small
            ><bdi>{{ user.username }}</bdi> ·
            {{ user.role === 'buyer' ? 'خریدار' : 'فروشنده' }}</small
          >
        </div>
      </div>
      <NuxtLink
        v-if="user.role === 'buyer'"
        to="/profile#wallet"
        class="profile-wallet-link"
        @click="open = false"
      >
        <span><AppIcon name="wallet" :size="18" />کیف پول</span>
        <strong v-if="loading">در حال دریافت…</strong>
        <strong v-else-if="balance !== null">{{ money(balance) }} تومان</strong>
        <span v-else>مشاهده و شارژ</span>
      </NuxtLink>
      <NuxtLink to="/profile" class="profile-menu-link" @click="open = false"
        ><AppIcon name="profile" :size="18" />پروفایل من</NuxtLink
      >
      <NuxtLink
        :to="user.role === 'seller' ? '/seller' : '/account'"
        class="profile-menu-link"
        @click="open = false"
        ><AppIcon :name="user.role === 'seller' ? 'dashboard' : 'bag'" :size="18" />{{
          user.role === 'seller' ? 'پنل فروشنده' : 'خریدهای من'
        }}</NuxtLink
      >
      <p v-if="error" class="alert error" role="alert">{{ error }}</p>
      <button class="profile-menu-link profile-signout" :disabled="busy" @click="signout">
        <AppIcon name="logout" :size="18" />{{ busy ? 'در حال خروج…' : 'خروج از حساب' }}
      </button>
    </section>
  </div>
</template>
