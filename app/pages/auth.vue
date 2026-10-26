<script setup lang="ts">
import { computed, ref } from 'vue'
import { navigateTo, useRoute } from '#imports'
import { useApi } from '~/composables/useApi'
const route = useRoute()
const { authenticate, user } = useApi()
const signup = ref(route.query.mode === 'signup')
const username = ref('')
const password = ref('')
const displayName = ref('')
const role = ref('buyer')
const busy = ref(false)
const error = ref('')
const destination = computed(() => {
  const value = route.query.redirect
  return typeof value === 'string' &&
    value.startsWith('/') &&
    !value.startsWith('//') &&
    !value.includes('\\')
    ? value
    : user.value?.role === 'seller'
      ? '/seller'
      : '/account'
})
async function submit() {
  error.value = ''
  busy.value = true
  try {
    await authenticate(signup.value ? 'signup' : 'login', {
      username: username.value,
      password: password.value,
      ...(signup.value ? { display_name: displayName.value, role: role.value } : {}),
    })
    await navigateTo(destination.value)
  } catch (e) {
    error.value = (e as Error).message
  } finally {
    busy.value = false
  }
}
function toggle() {
  signup.value = !signup.value
  error.value = ''
}
</script>
<template>
  <div class="container">
    <div class="auth-page">
      <section class="auth-story">
        <div class="eyebrow">به جمع هم‌خرید خوش آمدی</div>
        <h2>یک همراهی ساده،<br />یک خرید بهتر.</h2>
        <p>همراه کسانی شو که به کیفیت، تولیدکنندهٔ محلی و قیمت منصفانه اهمیت می‌دهند.</p>
        <ProductArt visual="olive" />
        <div class="hero-assurance">
          <span><AppIcon name="shield" :size="17" /> شفاف و ساده</span
          ><span><AppIcon name="users" :size="17" /> با قدرت جمع</span>
        </div>
      </section>
      <section class="auth-card">
        <div class="eyebrow">حساب هم‌خرید</div>
        <h1>{{ signup ? 'به جمع ما بپیوند' : 'خوش برگشتی' }}</h1>
        <p>
          {{
            signup
              ? 'برای شروع، یک حساب خریدار یا فروشنده بساز.'
              : 'وارد شو و خریدهای گروهی‌ات را دنبال کن.'
          }}
        </p>
        <p v-if="error" class="alert error" role="alert">{{ error }}</p>
        <form class="form-stack" @submit.prevent="submit">
          <label v-if="signup" class="field"
            >نام نمایشی<input
              v-model="displayName"
              autocomplete="name"
              required
              maxlength="100"
              placeholder="نام شما یا فروشگاه" /></label
          ><label class="field"
            >نام کاربری<input
              v-model="username"
              dir="ltr"
              autocomplete="username"
              required
              maxlength="150"
              pattern="[\w.@+\-]+"
              placeholder="your_username"
            /><small v-if="signup">حروف انگلیسی، عدد و نشانه‌های @ . + - _</small></label
          ><label class="field"
            >رمز عبور<input
              v-model="password"
              dir="ltr"
              type="password"
              :autocomplete="signup ? 'new-password' : 'current-password'"
              required
              :minlength="signup ? 8 : 1"
              maxlength="128"
              placeholder="••••••••"
            /><small v-if="signup">حداقل ۸ کاراکتر؛ از رمزهای رایج استفاده نکنید.</small></label
          ><label v-if="signup" class="field"
            >می‌خواهم…<select v-model="role">
              <option value="buyer">خرید گروهی انجام بدهم</option>
              <option value="seller">محصولاتم را بفروشم</option>
            </select></label
          ><button class="button full" :disabled="busy">
            {{ busy ? 'در حال انجام…' : signup ? 'ساخت حساب' : 'ورود به حساب'
            }}<AppIcon name="arrow" :size="18" />
          </button>
        </form>
        <div class="form-switch">
          {{ signup ? 'حساب کاربری داری؟' : 'تازه به هم‌خرید آمدی؟'
          }}<button @click="toggle">{{ signup ? 'وارد شو' : 'ثبت‌نام کن' }}</button>
        </div>
      </section>
    </div>
  </div>
</template>
