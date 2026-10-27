<script setup lang="ts">
import { watch } from 'vue'
import { useApi } from '~/composables/useApi'
import { useResource } from '~/composables/useResource'
import type { Wallet } from '~/types'

const { user, ready, session, request } = useApi()
const {
  data: wallet,
  loading,
  error,
  refresh,
} = useResource(async () => {
  if (!ready.value) await session()
  return user.value?.role === 'buyer' ? request<Wallet>('/wallet/') : null
})
watch(() => user.value?.id, refresh)
</script>

<template>
  <div class="container page profile-page">
    <div class="section-heading">
      <div>
        <div class="section-kicker">حساب کاربری</div>
        <h1>پروفایل من</h1>
        <p>اطلاعات حساب و کیف پول، در یک جای مشخص.</p>
      </div>
      <NuxtLink
        v-if="user"
        :to="user.role === 'seller' ? '/seller' : '/account'"
        class="button secondary compact"
        >{{ user.role === 'seller' ? 'پنل فروشنده' : 'خریدهای من'
        }}<AppIcon name="arrow" :size="17"
      /></NuxtLink>
    </div>
    <div v-if="ready && !user" class="empty-state">
      <AppIcon name="profile" :size="36" />
      <h2>برای دیدن پروفایل وارد شوید</h2>
      <p>اطلاعات حساب و کیف پول شما پس از ورود نمایش داده می‌شود.</p>
      <NuxtLink to="/auth?redirect=/profile" class="button">ورود به حساب</NuxtLink>
    </div>
    <template v-else-if="user">
      <section class="profile-details" aria-labelledby="profile-details-title">
        <div class="profile-details-heading">
          <span class="profile-avatar"><AppIcon name="profile" :size="32" /></span>
          <div>
            <h2 id="profile-details-title">اطلاعات کاربری</h2>
            <p>{{ user.role === 'buyer' ? 'حساب خریدار' : 'حساب فروشنده' }}</p>
          </div>
        </div>
        <dl class="profile-fields">
          <div>
            <dt>نام نمایشی</dt>
            <dd>{{ user.display_name || 'ثبت نشده' }}</dd>
          </div>
          <div>
            <dt>نام کاربری</dt>
            <dd>
              <bdi>{{ user.username }}</bdi>
            </dd>
          </div>
          <div>
            <dt>نوع حساب</dt>
            <dd>{{ user.role === 'buyer' ? 'خریدار' : 'فروشنده' }}</dd>
          </div>
        </dl>
      </section>
      <template v-if="user.role === 'buyer'">
        <LoadState :loading="loading" :error="error" @retry="refresh" />
        <WalletPanel v-if="wallet && !error" :wallet="wallet" @updated="refresh" />
      </template>
      <p v-else class="alert info">
        کیف پول برای خرید و مخصوص حساب خریدار است. مدیریت محصولات و سفارش‌ها در پنل فروشنده انجام
        می‌شود.
      </p>
    </template>
    <LoadState v-else :loading="loading" :error="error" @retry="refresh" />
  </div>
</template>
