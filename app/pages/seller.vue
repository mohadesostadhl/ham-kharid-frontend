<script setup lang="ts">
import { computed, ref } from 'vue'
import { useApi } from '~/composables/useApi'
import { useResource } from '~/composables/useResource'
import type { Campaign, Category, Order, Paginated, Product } from '~/types'
import { date, money, number } from '~/utils/format'
const { request, user, ready, session } = useApi()
const tab = ref('campaigns')
const form = ref('')
const busy = ref<number | null>(null)
const actionError = ref('')
const success = ref('')
const page = ref(1)
const { data, loading, error, refresh } = useResource(async () => {
  if (!ready.value) await session()
  if (!user.value || user.value.role !== 'seller') return null
  const [campaigns, products, categories, orders] = await Promise.all([
    request<Paginated<Campaign>>(`/campaigns/?mine=1&page=${page.value}`),
    request<Product[]>('/products/'),
    request<Category[]>('/categories/'),
    request<Order[]>('/orders/'),
  ])
  return { campaigns, products, categories, orders }
})
const total = computed(() => data.value?.orders.reduce((sum, o) => sum + o.total, 0) || 0)
async function saved() {
  const type = form.value
  form.value = ''
  success.value =
    type === 'product'
      ? 'محصول جدید ذخیره شد.'
      : 'پیش‌نویس کمپین ذخیره شد؛ برای نمایش عمومی، آن را منتشر کنید.'
  await refresh()
}
async function publish(campaign: Campaign) {
  busy.value = campaign.id
  actionError.value = ''
  success.value = ''
  try {
    await request(`/campaigns/${campaign.id}/publish/`, 'POST')
    success.value = 'کمپین منتشر شد و خریداران می‌توانند رزرو کنند.'
    await refresh()
  } catch (e) {
    actionError.value = (e as Error).message
  } finally {
    busy.value = null
  }
}
async function advance(order: Order) {
  busy.value = order.id
  actionError.value = ''
  success.value = ''
  try {
    await request(`/orders/${order.id}/status/`, 'POST', {
      status: order.status === 'confirmed' ? 'shipped' : 'completed',
    })
    success.value = 'وضعیت سفارش به‌روز شد.'
    await refresh()
  } catch (e) {
    actionError.value = (e as Error).message
  } finally {
    busy.value = null
  }
}
async function changePage(delta: number) {
  page.value += delta
  await refresh()
}
</script>
<template>
  <div class="container page">
    <div class="section-heading">
      <div>
        <div class="section-kicker">فضای کار تولیدکننده</div>
        <h1 style="font-size: 2rem">پنل فروشنده</h1>
        <p v-if="user?.role === 'seller'">{{ user.display_name }}؛ از محصول خوب تا یک خرید جمعی.</p>
      </div>
      <div v-if="user?.role === 'seller'" class="button-row">
        <button
          class="button secondary compact"
          @click="form = form === 'product' ? '' : 'product'"
        >
          <AppIcon name="plus" :size="17" /> محصول جدید</button
        ><button class="button compact" @click="form = form === 'campaign' ? '' : 'campaign'">
          <AppIcon name="plus" :size="17" /> کمپین جدید
        </button>
      </div>
    </div>
    <div v-if="ready && (!user || user.role !== 'seller')" class="empty-state">
      <AppIcon name="sprout" :size="38" />
      <h2>محصول خوبت را به جمع ما بیاور</h2>
      <p>برای مدیریت محصولات و کمپین‌ها با حساب فروشنده وارد شوید.</p>
      <NuxtLink to="/auth?redirect=/seller" class="button">ورود به حساب فروشنده</NuxtLink
      ><NuxtLink to="/auth?mode=signup&amp;redirect=/seller" class="text-link"
        >ساخت حساب جدید</NuxtLink
      >
    </div>
    <template v-else>
      <p v-if="success" class="alert success" role="status">{{ success }}</p>
      <p v-if="actionError" class="alert error" role="alert">{{ actionError }}</p>
      <ProductForm
        v-if="form === 'product' && data"
        :categories="data.categories"
        @saved="saved"
        @close="form = ''"
      /><CampaignForm
        v-if="form === 'campaign' && data"
        :products="data.products"
        @saved="saved"
        @close="form = ''"
      />
      <div class="summary-grid">
        <div class="summary-card">
          <span><AppIcon name="users" /></span>
          <div>
            <strong>{{ number(data?.campaigns.count || 0) }}</strong
            ><small>کمپین شما</small>
          </div>
        </div>
        <div class="summary-card">
          <span><AppIcon name="package" /></span>
          <div>
            <strong>{{ number(data?.orders.length || 0) }}</strong
            ><small>سفارش ثبت‌شده</small>
          </div>
        </div>
        <div class="summary-card">
          <span><AppIcon name="checks" /></span>
          <div>
            <strong>{{ money(total) }}</strong
            ><small>ارزش سفارش‌ها (تومان)</small>
          </div>
        </div>
      </div>
      <div class="tabs" role="group" aria-label="بخش‌های پنل فروشنده">
        <button
          :class="{ selected: tab === 'campaigns' }"
          :aria-pressed="tab === 'campaigns'"
          @click="tab = 'campaigns'"
        >
          کمپین‌ها</button
        ><button
          :class="{ selected: tab === 'products' }"
          :aria-pressed="tab === 'products'"
          @click="tab = 'products'"
        >
          محصولات</button
        ><button
          :class="{ selected: tab === 'orders' }"
          :aria-pressed="tab === 'orders'"
          @click="tab = 'orders'"
        >
          سفارش‌ها
        </button>
      </div>
      <LoadState :loading="loading" :error="error" @retry="refresh" /><template
        v-if="data && !loading && !error"
      >
        <template v-if="tab === 'campaigns'">
          <LoadState :empty="!data.campaigns.results.length" title="اولین کمپینت را بساز" />
          <div
            v-if="data.campaigns.results.length"
            class="table-wrap"
            tabindex="0"
            role="region"
            aria-label="جدول کمپین‌های فروشنده"
          >
            <table>
              <thead>
                <tr>
                  <th>کمپین</th>
                  <th>وضعیت</th>
                  <th>پیشرفت حدنصاب</th>
                  <th>مهلت</th>
                  <th>عملیات</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="campaign in data.campaigns.results" :key="campaign.id">
                  <td>
                    <strong>{{ campaign.title }}</strong
                    ><small>{{ money(campaign.group_price) }} تومان</small>
                  </td>
                  <td><StatusBadge :status="campaign.status" /></td>
                  <td style="min-width: 160px"><CampaignProgress :campaign="campaign" /></td>
                  <td style="white-space: nowrap">{{ date(campaign.deadline) }}</td>
                  <td>
                    <button
                      v-if="campaign.status === 'draft'"
                      class="button compact"
                      :disabled="busy !== null"
                      @click="publish(campaign)"
                    >
                      {{ busy === campaign.id ? 'در حال انتشار…' : 'انتشار کمپین' }}</button
                    ><NuxtLink v-else :to="`/campaigns/${campaign.id}`" class="text-link"
                      >مشاهده</NuxtLink
                    >
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div v-if="data.campaigns.next || data.campaigns.previous" class="pagination">
            <button
              class="button secondary compact"
              :disabled="!data.campaigns.previous"
              @click="changePage(-1)"
            >
              صفحهٔ قبل</button
            ><span>{{ number(page) }}</span
            ><button
              class="button secondary compact"
              :disabled="!data.campaigns.next"
              @click="changePage(1)"
            >
              صفحهٔ بعد
            </button>
          </div> </template
        ><template v-else-if="tab === 'products'">
          <LoadState :empty="!data.products.length" title="هنوز محصولی اضافه نکرده‌ای" />
          <article v-for="product in data.products" :key="product.id" class="account-item">
            <ProductArt :visual="product.visual" />
            <div class="account-item-content">
              <h2>{{ product.name }}</h2>
              <p>{{ product.category_name }} · {{ product.unit }}</p>
              <p>{{ money(product.retail_price) }} تومان (قیمت تکی)</p>
            </div>
          </article> </template
        ><template v-else>
          <LoadState
            :empty="!data.orders.length"
            title="پس از موفقیت کمپین، سفارش‌ها اینجا نمایش داده می‌شوند"
          />
          <article v-for="order in data.orders" :key="order.id" class="account-order">
            <div>
              <h3>{{ order.campaign_title }}</h3>
              <small
                >{{ order.buyer_name }} · {{ number(order.quantity) }} واحد · سفارش
                {{ number(order.id) }}</small
              >
            </div>
            <strong>{{ money(order.total) }} <small>تومان</small></strong>
            <div>
              <StatusBadge :status="order.status" /><button
                v-if="order.status !== 'completed'"
                class="button secondary compact"
                style="display: block; margin-top: 10px"
                :disabled="busy !== null"
                @click="advance(order)"
              >
                {{
                  busy === order.id
                    ? 'در حال ثبت…'
                    : order.status === 'confirmed'
                      ? 'ثبت ارسال'
                      : 'ثبت تحویل'
                }}
              </button>
            </div>
          </article>
        </template>
      </template>
    </template>
  </div>
</template>
