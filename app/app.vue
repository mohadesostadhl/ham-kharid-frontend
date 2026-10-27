<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute } from '#imports'
import { useApi } from '~/composables/useApi'
const { user, session } = useApi()
const menu = ref(false)
const authError = ref('')
const route = useRoute()
onMounted(async () => {
  try {
    await session()
  } catch {
    authError.value = 'ارتباط با سرور برقرار نشد. برای تلاش دوباره صفحه را تازه کنید.'
  }
})
</script>
<template>
  <div class="site-shell">
    <a class="skip-link" href="#main">رفتن به محتوای اصلی</a>
    <div class="announcement">
      <span class="announcement-dot"></span> انتخاب‌های خوب، وقتی با هم باشیم
      <span class="announcement-separator">/</span> مستقیم از تولیدکننده
    </div>
    <header class="site-header">
      <div class="container header-inner">
        <NuxtLink to="/" class="brand" aria-label="هم‌خرید، صفحهٔ اصلی"
          ><span class="brand-mark"><AppIcon name="sprout" :size="27" /></span
          ><span>هم‌خرید<small>با هم، به‌صرفه‌تر</small></span></NuxtLink
        >
        <nav class="desktop-nav" aria-label="ناوبری اصلی">
          <NuxtLink to="/" :class="{ active: route.path === '/' }">کشف خریدها</NuxtLink
          ><NuxtLink to="/how-it-works">چطور کار می‌کند؟</NuxtLink
          ><NuxtLink v-if="user?.role === 'seller'" to="/seller">پنل فروشنده</NuxtLink>
        </nav>
        <div class="header-actions">
          <template v-if="user">
            <NuxtLink
              :to="user.role === 'seller' ? '/seller' : '/account'"
              class="button secondary compact"
              ><AppIcon :name="user.role === 'seller' ? 'dashboard' : 'bag'" /><span>{{
                user.role === 'seller' ? 'پنل فروشنده' : 'خریدهای من'
              }}</span></NuxtLink
            ><ProfileMenu
              :key="user.id"
              :navigation-open="menu"
              @opened="menu = false"
            /> </template
          ><NuxtLink v-else to="/auth" class="button secondary compact"
            ><AppIcon name="users" :size="18" /> ورود / عضویت</NuxtLink
          ><button
            class="icon-button mobile-menu"
            :aria-expanded="menu"
            aria-controls="mobile-nav"
            aria-label="باز کردن فهرست"
            @click="menu = !menu"
          >
            <AppIcon :name="menu ? 'close' : 'menu'" />
          </button>
        </div>
      </div>
      <nav
        v-if="menu"
        id="mobile-nav"
        class="mobile-nav"
        aria-label="فهرست موبایل"
        @click="menu = false"
      >
        <NuxtLink to="/">کشف خریدها</NuxtLink
        ><NuxtLink to="/how-it-works">چطور کار می‌کند؟</NuxtLink
        ><NuxtLink v-if="user" :to="user.role === 'seller' ? '/seller' : '/account'"
          >حساب من</NuxtLink
        ><NuxtLink v-if="user" to="/profile">پروفایل من</NuxtLink>
      </nav>
    </header>
    <div v-if="authError" class="container">
      <p class="alert error" role="alert">{{ authError }}</p>
    </div>
    <main id="main" tabindex="-1"><NuxtPage /></main>
    <footer class="site-footer">
      <div class="container footer-grid">
        <div>
          <NuxtLink class="brand footer-brand" to="/"
            ><span class="brand-mark"><AppIcon name="sprout" :size="25" /></span>هم‌خرید</NuxtLink
          >
          <p>
            خریدهای کوچک ما، کنار هم قدرت می‌گیرند.<br />انتخاب آگاهانه، خرید مستقیم، قیمت منصفانه.
          </p>
        </div>
        <div>
          <strong>با هم خرید کنیم</strong><NuxtLink to="/">کشف کمپین‌ها</NuxtLink
          ><NuxtLink to="/how-it-works">راهنمای خرید گروهی</NuxtLink>
        </div>
        <div>
          <strong>برای تولیدکننده‌ها</strong><NuxtLink to="/seller">مدیریت فروشگاه</NuxtLink
          ><NuxtLink to="/auth?mode=signup">پیوستن به هم‌خرید</NuxtLink>
        </div>
        <div class="footer-note">
          <AppIcon name="leaf" :size="26" /><strong>یک انتخاب بهتر، برای همه.</strong
          ><span>نسخهٔ نمایشی دانشگاهی<br />محصولات و فروشندگان ساختگی‌اند.</span>
        </div>
      </div>
      <div class="container footer-bottom">
        <span>هم‌خرید © {{ new Date().getFullYear() }} · ساخته‌شده برای خریدهای بهتر</span
        ><span>با هم، یک قدم جلوتر <AppIcon name="sprout" :size="16" /></span>
      </div>
    </footer>
  </div>
</template>
