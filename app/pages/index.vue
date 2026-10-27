<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useApi } from '~/composables/useApi'
import { useResource } from '~/composables/useResource'
import type { Campaign, Category, Paginated } from '~/types'
import { number } from '~/utils/format'
const { request } = useApi()
const category = ref('')
const search = ref('')
const query = ref('')
const page = ref(1)
let searchTimer: ReturnType<typeof setTimeout>
watch(search, () => {
  clearTimeout(searchTimer)
  searchTimer = setTimeout(() => {
    query.value = search.value
  }, 300)
})
const { data: categories } = useResource(() => request<Category[]>('/categories/'))
const { data, loading, error, refresh } = useResource(() =>
  request<Paginated<Campaign>>(
    `/campaigns/?category=${encodeURIComponent(category.value)}&search=${encodeURIComponent(query.value)}&page=${page.value}`,
  ),
)
watch([category, query], () => {
  page.value = 1
  refresh()
})
watch(page, refresh)
const campaigns = computed(() => data.value?.results || [])
</script>
<template>
  <div class="container">
    <section class="hero">
      <div class="hero-copy">
        <div class="eyebrow">قدرتِ با هم خریدن</div>
        <h1>انتخاب تو،<br />همراهی ما، <em>قیمت بهتر.</em></h1>
        <p>
          محصولات خوب را مستقیم از تولیدکننده کشف کن.<br />وقتی تعدادمان بیشتر شود، سهم هر کدام‌مان
          کمتر می‌شود.
        </p>
        <div class="button-row">
          <a class="button" href="#campaigns"
            >کشف خریدهای گروهی <AppIcon name="arrow" :size="19" /></a
          ><NuxtLink class="button secondary" to="/how-it-works">چطور کار می‌کند؟</NuxtLink>
        </div>
        <div class="hero-assurance">
          <span><AppIcon name="shield" :size="16" /> بازگشت وجه در خرید ناموفق</span
          ><span><AppIcon name="leaf" :size="16" /> مستقیم از تولیدکننده</span>
        </div>
      </div>
      <div class="hero-visual">
        <div class="hero-scene">
          <span class="scene-tag">GOOD THINGS. BETTER TOGETHER.</span><ProductArt visual="coffee" />
          <div class="hero-seal">
            <AppIcon name="sprout" :size="22" /><strong>خرید آگاهانه</strong
            ><span>انتخاب جمعی</span>
          </div>
        </div>
        <div class="floating-tag">
          <span><AppIcon name="users" :size="20" /></span>
          <div><strong>کنار هم، به‌صرفه‌تر</strong><small>خرید مستقیم، قیمت منصفانه</small></div>
        </div>
        <div class="hero-mini-card">
          <div class="mini-top">
            <strong>یک قدم تا خرید بهتر</strong><span>نمونهٔ خرید گروهی</span>
          </div>
          <div class="mini-progress"></div>
          <p>در پایان مهلت، با تکمیل حدنصاب خرید قطعی می‌شود.</p>
        </div>
      </div>
    </section>
    <div class="trust-strip">
      <div>
        <AppIcon name="sprout" :size="29" /><span
          ><strong>از دست تولیدکننده</strong><small>انتخاب‌های محلی، بدون واسطه</small></span
        >
      </div>
      <div>
        <AppIcon name="users" :size="29" /><span
          ><strong>قدرت خرید جمعی</strong><small>تعداد بیشتر، قیمت بهتر</small></span
        >
      </div>
      <div>
        <AppIcon name="shield" :size="29" /><span
          ><strong>همه‌چیز شفاف</strong><small>قیمت، حدنصاب و زمان مشخص</small></span
        >
      </div>
    </div>
    <section id="campaigns">
      <div class="section-heading">
        <div>
          <div class="section-kicker">انتخاب‌های این روزها</div>
          <h2>خرید خوب، با همراهی هم</h2>
          <p>به یک خرید گروهی بپیوند؛ از همین‌جا شروع کن.</p>
        </div>
        <span v-if="data" class="seller-caption">{{ number(data.count) }} کمپین</span>
      </div>
      <div class="catalog-toolbar">
        <div class="category-tabs" role="group" aria-label="دسته‌بندی محصولات">
          <button :class="{ selected: !category }" :aria-pressed="!category" @click="category = ''">
            همهٔ خریدها</button
          ><button
            v-for="item in categories"
            :key="item.id"
            :class="{ selected: category === item.slug }"
            :aria-pressed="category === item.slug"
            @click="category = item.slug"
          >
            {{ item.name }}
          </button>
        </div>
        <label class="search-box"
          ><AppIcon name="search" :size="18" /><input
            v-model="search"
            type="search"
            aria-label="جست‌وجوی کمپین"
            placeholder="دنبال چی می‌گردی؟"
        /></label>
      </div>
      <LoadState
        :loading="loading"
        :error="error"
        :empty="!campaigns.length"
        title="خریدی با این مشخصات پیدا نشد"
        @retry="refresh"
      />
      <div v-if="!loading && !error && campaigns.length" class="catalog-grid">
        <CampaignCard v-for="campaign in campaigns" :key="campaign.id" :campaign="campaign" />
      </div>
      <div v-if="data && (data.next || data.previous)" class="pagination">
        <button
          class="button secondary compact"
          :disabled="!data.previous || loading"
          @click="page--"
        >
          صفحهٔ قبل</button
        ><span>{{ number(page) }}</span
        ><button class="button secondary compact" :disabled="!data.next || loading" @click="page++">
          صفحهٔ بعد
        </button>
      </div>
    </section>
    <section class="seller-banner">
      <div>
        <div class="eyebrow">برای کسانی که با عشق تولید می‌کنند</div>
        <h2>محصول خوب تو، خریدارهای خوب ما.</h2>
        <p>
          کمپین خودت را بساز، حدنصاب فروش را تعیین کن و با یک جمع همراه، فروش مطمئن‌تری را تجربه کن.
        </p>
      </div>
      <NuxtLink to="/seller" class="button light"
        >شروع فروش در هم‌خرید <AppIcon name="arrow" :size="18"
      /></NuxtLink>
    </section>
    <section class="how-section">
      <div class="section-heading">
        <div>
          <div class="section-kicker">ساده‌تر از چیزی که فکر می‌کنی</div>
          <h2>از انتخاب تا یک خرید موفق</h2>
        </div>
        <NuxtLink to="/how-it-works">راهنمای خرید <AppIcon name="arrow" :size="16" /></NuxtLink>
      </div>
      <div class="step-grid">
        <div class="step">
          <div class="step-number"><span>۰۱</span><AppIcon name="search" :size="25" /></div>
          <h3>یک انتخاب خوب پیدا کن</h3>
          <p>محصول، قیمت گروهی و مهلت را ببین؛ انتخابی که دوست داری را پیدا کن.</p>
        </div>
        <div class="step">
          <div class="step-number"><span>۰۲</span><AppIcon name="users" :size="25" /></div>
          <h3>سهم خودت را رزرو کن</h3>
          <p>کیف پول نمایشی را شارژ کن، تعداد را انتخاب کن و سهمت را رزرو کن.</p>
        </div>
        <div class="step">
          <div class="step-number"><span>۰۳</span><AppIcon name="package" :size="25" /></div>
          <h3>با هم به حدنصاب برسیم</h3>
          <p>در پایان مهلت، با تکمیل حدنصاب، رزروها به سفارش تبدیل می‌شوند.</p>
        </div>
      </div>
    </section>
  </div>
</template>
