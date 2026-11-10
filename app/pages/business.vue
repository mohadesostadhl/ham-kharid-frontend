<script setup lang="ts">
const toc = [
  { id: 'idea', label: 'ایده' },
  { id: 'maturity', label: 'بلوغ ایده' },
  { id: 'canvas', label: 'بوم کسب‌وکار' },
  { id: 'market', label: 'بازار و مشتری' },
  { id: 'competition', label: 'رقبا' },
  { id: 'marketing', label: 'بازاریابی' },
  { id: 'economics', label: 'درآمد و هزینه' },
  { id: 'value-chain', label: 'زنجیره ارزش' },
  { id: 'demo', label: 'دموی محصول' },
  { id: 'roadmap', label: 'نقشه راه' },
]

const maturity = [
  { label: 'شکل‌گیری ایده', status: 'انجام شده', icon: 'sparkles' as const },
  { label: 'شناخت مسئله و نیاز بازار', status: 'انجام شده', icon: 'search' as const },
  { label: 'بررسی راه‌حل پیشنهادی', status: 'در حال تکمیل', icon: 'check' as const },
  { label: 'امکان‌سنجی اولیه', status: 'نیازمند آزمون', icon: 'shield' as const },
  { label: 'نمونه اولیه محصول (MVP)', status: 'نسخه نمایشی', icon: 'package' as const },
  { label: 'نسخه عملیاتی', status: 'گام بعدی', icon: 'arrow' as const },
]

const canvas = [
  ['بخش‌های مشتریان', 'فروشگاه‌های کوچک، خرده‌فروشان و کسب‌وکارهای نوپا'],
  ['ارزش پیشنهادی', 'دسترسی به قیمت عمده با سفارش کوچک‌تر و تقسیم هزینه ارسال'],
  ['کانال‌های ارتباطی', 'وب‌سایت، شبکه‌های اجتماعی، معرفی تأمین‌کنندگان و بازاریابی محلی'],
  ['ارتباط با مشتریان', 'راهنمایی شفاف، اعلان وضعیت سفارش و پشتیبانی انسانی'],
  ['جریان‌های درآمدی', 'کارمزد سفارش گروهی، خدمات تأمین‌کننده و امکانات ویژه آینده'],
  ['منابع کلیدی', 'پلتفرم، داده تقاضا، شبکه تأمین‌کنندگان و تیم عملیات'],
  ['فعالیت‌های کلیدی', 'تطبیق تقاضا، ساخت کمپین، کنترل پرداخت و هماهنگی ارسال'],
  ['شرکای کلیدی', 'تأمین‌کنندگان، شرکت‌های حمل‌ونقل و انجمن‌های صنفی محلی'],
  ['ساختار هزینه‌ها', 'توسعه و زیرساخت، بازاریابی، پشتیبانی و هماهنگی سفارش‌ها'],
]

const personas = [
  {
    type: 'پرسونا ۰۱',
    name: 'مریم، صاحب فروشگاه محلی',
    text: 'به‌طور ماهانه مواد بسته‌بندی می‌خرد؛ نقدینگی و فضای انبارش محدودی دارد و دنبال قیمت قابل پیش‌بینی است.',
    needs: ['حداقل سفارش منطقی', 'اطمینان از زمان تحویل', 'مقایسه ساده قیمت'],
    icon: 'bag' as const,
  },
  {
    type: 'پرسونا ۰۲',
    name: 'امیر، کسب‌وکار نوپا',
    text: 'هنوز حجم خرید بالایی ندارد، اما می‌خواهد از قیمت عمده استفاده کند و با کسب‌وکارهای مشابه هم‌مسیر شود.',
    needs: ['ورود کم‌ریسک', 'شفافیت حدنصاب', 'پرداخت و پیگیری آسان'],
    icon: 'users' as const,
  },
]

const roadmap = [
  ['۰۱', 'تکمیل نسخه اولیه', 'تثبیت جریان ثبت‌نام، کمپین، رزرو و تسویه در پلتفرم.'],
  [
    '۰۲',
    'جذب تأمین‌کنندگان و کاربران اولیه',
    'گفت‌وگو با چند تأمین‌کننده و کسب‌وکار کوچک برای شناخت بهتر رفتار واقعی.',
  ],
  [
    '۰۳',
    'اجرای آزمایشی سفارش‌های گروهی',
    'آزمون محدود یک یا چند دسته کالا و اندازه‌گیری تکمیل سفارش و تحویل.',
  ],
  [
    '۰۴',
    'بهبود پرداخت و ارسال',
    'کاهش اصطکاک پرداخت، تسویه و هماهنگی ارسال پس از یادگیری از پایلوت.',
  ],
  [
    '۰۵',
    'گسترش کالا و کاربران',
    'افزودن دسته‌های مناسب و توسعه شبکه کسب‌وکارها بر اساس تقاضای معتبر.',
  ],
  [
    '۰۶',
    'توسعه خدمات و بازارهای جدید',
    'ارائه خدمات ارزش‌افزوده و بررسی ورود مرحله‌ای به شهرها یا بازارهای دیگر.',
  ],
]
</script>

<template>
  <div class="business-page container">
    <section class="business-hero">
      <div class="business-hero-copy">
        <div class="eyebrow"><AppIcon name="sparkles" :size="16" /> روایت کسب‌وکار هم‌خرید</div>
        <h1>وقتی تقاضاها کنار هم قرار می‌گیرند، <em>خرید عمده در دسترس‌تر می‌شود.</em></h1>
        <p>
          هم‌خرید یک ایده برای تجمیع سفارش کسب‌وکارهای کوچک است؛ راهی برای خرید با قیمت عمده، بدون
          اینکه هر کسب‌وکار مجبور باشد به‌تنهایی حجم بزرگی سفارش دهد.
        </p>
        <div class="button-row">
          <a class="button" href="#idea">شروع مطالعه <AppIcon name="arrow" :size="18" /></a>
          <NuxtLink class="button secondary" to="/">مشاهده دموی واقعی</NuxtLink>
        </div>
        <div class="business-hero-note">
          <AppIcon name="shield" :size="16" /> وضعیت ایده: نمونه نمایشی دانشگاهی؛ بدون ادعای جذب
          مشتری واقعی
        </div>
      </div>
      <div class="business-hero-visual" aria-label="نمایش مفهومی تجمیع سفارش‌ها">
        <div class="orbit orbit-one"></div>
        <div class="orbit orbit-two"></div>
        <div class="business-hub">
          <AppIcon name="users" :size="35" /><strong>یک خرید، چند کسب‌وکار</strong
          ><span>تجمیع تقاضا و تقسیم هزینه</span>
        </div>
        <div class="business-node node-one"><AppIcon name="bag" :size="17" /> فروشگاه محلی</div>
        <div class="business-node node-two"><AppIcon name="package" :size="17" /> سفارش عمده</div>
        <div class="business-node node-three"><AppIcon name="truck" :size="17" /> ارسال مشترک</div>
      </div>
    </section>

    <nav class="business-toc" aria-label="فهرست بخش‌های درباره کسب‌وکار">
      <a v-for="item in toc" :key="item.id" :href="`#${item.id}`">{{ item.label }}</a>
    </nav>

    <section id="idea" class="business-section">
      <div class="business-section-heading">
        <div>
          <div class="section-kicker">۰۱ · مسئله و راه‌حل</div>
          <h2>ایده کسب‌وکار</h2>
        </div>
        <p>هم‌خرید پراکندگی سفارش‌ها را به قدرت خرید جمعی تبدیل می‌کند.</p>
      </div>
      <div class="idea-grid">
        <article class="business-card idea-main">
          <span class="card-icon"><AppIcon name="users" /></span>
          <h3>مسئله چیست؟</h3>
          <p>
            کسب‌وکار کوچک معمولاً به کالا، مواد اولیه یا بسته‌بندی نیاز دارد؛ اما حجم خریدش برای
            گرفتن قیمت عمده کافی نیست. از طرفی، سفارش‌های کوچک هزینه ارسال بیشتری به ازای هر واحد
            دارند.
          </p>
          <h3>راه‌حل پیشنهادی</h3>
          <p>
            پلتفرم، تقاضای چند کسب‌وکار را برای کالای مشابه کنار هم می‌گذارد، میزان تکمیل سفارش را
            شفاف نشان می‌دهد و پس از رسیدن به حدنصاب، سفارش عمده را هماهنگ می‌کند.
          </p>
        </article>
        <div class="idea-benefits">
          <article class="business-card">
            <span class="card-icon warm"><AppIcon name="sparkles" /></span>
            <h3>ارزش پیشنهادی</h3>
            <p>خرید عمده با تعهد و حجم قابل‌دسترس‌تر برای کسب‌وکارهای کوچک.</p>
          </article>
          <article class="business-card">
            <span class="card-icon"><AppIcon name="truck" /></span>
            <h3>مزیت عملیاتی</h3>
            <p>تقسیم هزینه ارسال و کاهش پراکندگی هماهنگی با تأمین‌کننده.</p>
          </article>
        </div>
      </div>
      <div class="example-callout">
        <div class="section-kicker">یک مثال قابل لمس</div>
        <p>
          <strong>پنج فروشگاه کوچک</strong> هرکدام به ۲۰ بسته جعبه نیاز دارند. به‌جای پنج خرید
          جداگانه، تقاضای ۱۰۰ بسته در یک کمپین جمع می‌شود؛ تأمین‌کننده سفارش عمده را آماده می‌کند و
          هزینه ارسال میان مشارکت‌کنندگان تقسیم می‌شود.
        </p>
      </div>
    </section>

    <section id="maturity" class="business-section soft-section">
      <div class="business-section-heading">
        <div>
          <div class="section-kicker">۰۲ · واقع‌بینی در اجرا</div>
          <h2>بلوغ ایده</h2>
        </div>
        <p>این صفحه یک تحلیل دانشگاهی است؛ اعتبارسنجی بازار هنوز باید با آزمون واقعی انجام شود.</p>
      </div>
      <div class="maturity-track">
        <article v-for="(item, index) in maturity" :key="item.label" class="maturity-item">
          <div class="maturity-line">
            <span>{{ index + 1 }}</span
            ><i></i>
          </div>
          <AppIcon :name="item.icon" :size="21" />
          <h3>{{ item.label }}</h3>
          <small>{{ item.status }}</small>
        </article>
      </div>
      <div class="maturity-summary">
        <strong>سطح فعلی: نمونه اولیه مفهومی / MVP نمایشی</strong
        ><span
          >گام حیاتی بعدی: مصاحبه با مشتریان و اجرای یک پایلوت محدود برای سنجش تمایل به
          مشارکت.</span
        >
      </div>
    </section>

    <section id="canvas" class="business-section">
      <div class="business-section-heading">
        <div>
          <div class="section-kicker">۰۳ · مدل کسب‌وکار</div>
          <h2>بوم کسب‌وکار</h2>
        </div>
        <p>نه قطعه اصلی مدل هم‌خرید در یک نگاه.</p>
      </div>
      <div class="canvas-grid">
        <article
          v-for="(item, index) in canvas"
          :key="item[0]"
          class="canvas-cell"
          :class="`canvas-cell-${index + 1}`"
        >
          <span>۰{{ index + 1 }}</span>
          <h3>{{ item[0] }}</h3>
          <p>{{ item[1] }}</p>
        </article>
      </div>
    </section>

    <section id="market" class="business-section soft-section">
      <div class="business-section-heading">
        <div>
          <div class="section-kicker">۰۴ · بازار هدف</div>
          <h2>بازار و مشتری</h2>
        </div>
        <p>تمرکز اولیه روی خریدارانی است که نیاز تکرارشونده و حجم محدود دارند.</p>
      </div>
      <div class="market-intro">
        <div class="market-stat">
          <strong>تمرکز اولیه</strong><span>فروشگاه‌های کوچک، خرده‌فروشان و کسب‌وکارهای نوپا</span>
        </div>
        <div class="market-stat">
          <strong>نیاز مشترک</strong><span>قیمت بهتر، حداقل سفارش منطقی و تحویل قابل پیش‌بینی</span>
        </div>
        <div class="market-stat">
          <strong>فرض قابل آزمون</strong
          ><span>هم‌مسیر شدن با چند کسب‌وکار، تصمیم خرید را آسان‌تر می‌کند</span>
        </div>
      </div>
      <div class="persona-grid">
        <article v-for="persona in personas" :key="persona.name" class="persona-card">
          <div class="persona-top">
            <span class="card-icon"><AppIcon :name="persona.icon" /></span>
            <div>
              <small>{{ persona.type }}</small>
              <h3>{{ persona.name }}</h3>
            </div>
          </div>
          <p>{{ persona.text }}</p>
          <ul>
            <li v-for="need in persona.needs" :key="need">
              <AppIcon name="check" :size="15" />{{ need }}
            </li>
          </ul>
        </article>
      </div>
    </section>

    <section id="competition" class="business-section">
      <div class="business-section-heading">
        <div>
          <div class="section-kicker">۰۵ · جایگاه پیشنهادی</div>
          <h2>رقبا و گزینه‌های جایگزین</h2>
        </div>
        <p>این مقایسه کیفی است و ادعای رتبه‌بندی یا داده بازار ندارد.</p>
      </div>
      <div class="comparison-wrap">
        <table class="comparison-table">
          <thead>
            <tr>
              <th>معیار</th>
              <th>عمده‌فروش سنتی</th>
              <th>فروشگاه عمده‌فروشی آنلاین</th>
              <th>پلتفرم هم‌خرید</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <th>قیمت عمده</th>
              <td>زیاد</td>
              <td>معمولاً زیاد</td>
              <td>هدف اصلی</td>
            </tr>
            <tr>
              <th>تجمیع سفارش</th>
              <td>خارج از پلتفرم</td>
              <td>اغلب شخصی</td>
              <td class="highlight">بله</td>
            </tr>
            <tr>
              <th>تقسیم هزینه ارسال</th>
              <td>محدود</td>
              <td>وابسته به فروشنده</td>
              <td class="highlight">قابل طراحی</td>
            </tr>
            <tr>
              <th>دسترسی کسب‌وکار کوچک</th>
              <td>گاهی دشوار</td>
              <td>متغیر</td>
              <td class="highlight">تمرکز اصلی</td>
            </tr>
            <tr>
              <th>سهولت پیگیری</th>
              <td>تماس و هماهنگی</td>
              <td>سفارش مستقیم</td>
              <td class="highlight">وضعیت مرحله‌ای</td>
            </tr>
          </tbody>
        </table>
      </div>
      <p class="source-note">
        رقبای این جدول «الگوهای جایگزین خرید» هستند، نه نام شرکت‌های مشخص؛ برای ادعای دقیق درباره
        شرکت‌ها باید بازار هدف و منابع معتبر جداگانه بررسی شود.
      </p>
    </section>

    <section id="marketing" class="business-section soft-section">
      <div class="business-section-heading">
        <div>
          <div class="section-kicker">۰۶ · رسیدن به مشتری</div>
          <h2>طراحی و بازاریابی</h2>
        </div>
        <p>اعتماد، شفافیت و شروع کوچک سه اصل ورود به بازار هستند.</p>
      </div>
      <div class="marketing-layout">
        <div class="marketing-list">
          <article>
            <span>۱</span>
            <div>
              <h3>جذب محلی و هدفمند</h3>
              <p>
                شروع از فروشگاه‌های یک محدوده یا صنف مشخص و استفاده از معرفی حضوری و شبکه‌های
                اجتماعی همان جامعه.
              </p>
            </div>
          </article>
          <article>
            <span>۲</span>
            <div>
              <h3>همکاری با تأمین‌کننده</h3>
              <p>
                تأمین‌کننده با ارائه کالا و حدنصاب روشن، به شکل‌گیری کمپین‌های قابل اعتماد کمک
                می‌کند.
              </p>
            </div>
          </article>
          <article>
            <span>۳</span>
            <div>
              <h3>اعتمادسازی و حفظ مشتری</h3>
              <p>
                نمایش قیمت، حدنصاب، زمان‌بندی، وضعیت پرداخت و نتیجه ناموفق یا موفق سفارش بدون ابهام.
              </p>
            </div>
          </article>
        </div>
        <div class="journey-card">
          <div class="section-kicker">مسیر آشنایی تا سفارش</div>
          <div class="journey-step"><b>۰۱</b><span>آشنایی از شبکه اجتماعی یا معرفی</span></div>
          <div class="journey-step"><b>۰۲</b><span>مشاهده کالا و پیشرفت کمپین</span></div>
          <div class="journey-step"><b>۰۳</b><span>ثبت تعداد موردنیاز و مشارکت</span></div>
          <div class="journey-step"><b>۰۴</b><span>دریافت نتیجه، پرداخت و پیگیری</span></div>
        </div>
      </div>
    </section>

    <section id="economics" class="business-section">
      <div class="business-section-heading">
        <div>
          <div class="section-kicker">۰۷ · منطق مالی</div>
          <h2>مدل درآمدی و هزینه</h2>
        </div>
        <p>اعداد این بخش صرفاً نمونه محاسباتی‌اند و پیش‌بینی مالی نیستند.</p>
      </div>
      <div class="economics-grid">
        <article class="business-card">
          <span class="card-icon warm"><AppIcon name="sparkles" /></span>
          <h3>منابع درآمد احتمالی</h3>
          <ul class="plain-list">
            <li>کارمزد شفاف از هر سفارش گروهی</li>
            <li>حق خدمات از تأمین‌کننده در ازای تقاضای تجمیع‌شده</li>
            <li>خدمات ویژه برای کسب‌وکارها در مراحل بعدی</li>
          </ul>
        </article>
        <article class="business-card">
          <span class="card-icon"><AppIcon name="package" /></span>
          <h3>هزینه‌های احتمالی</h3>
          <ul class="plain-list">
            <li>طراحی، توسعه و نگهداری پلتفرم</li>
            <li>زیرساخت فنی، بازاریابی و پشتیبانی</li>
            <li>هماهنگی سفارش‌ها، پرداخت و ارسال</li>
          </ul>
        </article>
      </div>
      <div class="number-example">
        <div>
          <span class="section-kicker">نمونه محاسباتی</span>
          <h3>یک سفارش مشترک برای ۵ فروشگاه</h3>
          <p>
            اگر هر فروشگاه به‌تنهایی ۲۰ واحد با قیمت ۱۲۰ هزار تومان بخرد، مجموع خرید ۱۲ میلیون تومان
            می‌شود. در سفارش ۱۰۰ واحدی، اگر قیمت فرضی هر واحد ۹۵ هزار تومان باشد، مجموع ۹.۵ میلیون
            تومان و صرفه‌جویی اسمی ۲.۵ میلیون تومان است؛ پیش از هزینه ارسال و کارمزد.
          </p>
        </div>
        <strong>۲٬۵۰۰٬۰۰۰<br /><small>تومان صرفه‌جویی فرضی</small></strong>
      </div>
    </section>

    <section id="value-chain" class="business-section soft-section">
      <div class="business-section-heading">
        <div>
          <div class="section-kicker">۰۸ · نقش پلتفرم</div>
          <h2>واسطه‌گری و زنجیره ارزش</h2>
        </div>
        <p>پلتفرم مالک کالا نیست؛ هماهنگ‌کننده تقاضا، اطلاعات و فرایند سفارش است.</p>
      </div>
      <div class="chain-flow">
        <div><AppIcon name="package" /><span>تأمین‌کننده</span></div>
        <i>←</i>
        <div class="chain-focus"><AppIcon name="sparkles" /><span>پلتفرم خرید گروهی</span></div>
        <i>←</i>
        <div><AppIcon name="users" /><span>تجمیع سفارش کسب‌وکارها</span></div>
        <i>←</i>
        <div><AppIcon name="truck" /><span>ثبت، دریافت و توزیع</span></div>
      </div>
      <div class="role-grid">
        <article>
          <h3>تأمین‌کننده</h3>
          <p>قیمت، ظرفیت و زمان‌بندی را اعلام می‌کند و سفارش عمده را آماده می‌سازد.</p>
        </article>
        <article>
          <h3>پلتفرم</h3>
          <p>تقاضاها را شفاف جمع می‌کند، کمپین را مدیریت و ارتباط میان طرفین را ساده می‌کند.</p>
        </article>
        <article>
          <h3>مشتری کسب‌وکاری</h3>
          <p>نیاز خود را ثبت می‌کند، وضعیت حدنصاب را می‌بیند و سهم خود را پیگیری می‌کند.</p>
        </article>
      </div>
    </section>

    <section id="demo" class="business-section">
      <div class="business-section-heading">
        <div>
          <div class="section-kicker">۰۹ · تجربه محصول</div>
          <h2>دموی محصول</h2>
        </div>
        <p>مسیر محصول از نگاه یک کسب‌وکار کوچک.</p>
      </div>
      <div class="demo-layout">
        <div class="demo-browser">
          <div class="browser-bar">
            <span></span><span></span><span></span><small>hamkharid / campaigns</small>
          </div>
          <div class="demo-screen">
            <div class="demo-screen-title">
              <div>
                <small>خرید گروهی امروز</small>
                <h3>محصولات را کنار هم انتخاب کن</h3>
              </div>
              <span>نسخه فعلی محصول</span>
            </div>
            <div class="demo-product">
              <ProductArt visual="coffee" />
              <div>
                <small>کمپین نمونه</small>
                <h3>قهوه تازه‌برشت</h3>
                <p>حدنصاب سفارش در حال تکمیل است.</p>
                <div class="demo-progress"><i></i></div>
                <small>۷۵٪ تکمیل شده</small>
              </div>
            </div>
          </div>
        </div>
        <div class="demo-steps">
          <article
            v-for="(step, index) in [
              'ثبت‌نام کسب‌وکار',
              'انتخاب کالا و تعداد',
              'مشاهده تکمیل سفارش',
              'مشارکت سایر کسب‌وکارها',
              'رسیدن به حدنصاب و پرداخت',
              'دریافت کالا و تقسیم هزینه',
            ]"
            :key="step"
          >
            <span>۰{{ index + 1 }}</span>
            <p>{{ step }}</p>
          </article>
          <NuxtLink to="/" class="button"
            >ورود به محصول <AppIcon name="arrow" :size="17"
          /></NuxtLink>
        </div>
      </div>
    </section>

    <section id="roadmap" class="business-section roadmap-section">
      <div class="business-section-heading">
        <div>
          <div class="section-kicker">۱۰ · مسیر پیش‌رو</div>
          <h2>نقشه راه توسعه</h2>
        </div>
        <p>هر مرحله باید با یادگیری مرحله قبل و شواهد واقعی بازار ادامه پیدا کند.</p>
      </div>
      <div class="roadmap">
        <article v-for="item in roadmap" :key="item[0]">
          <div class="roadmap-marker">{{ item[0] }}</div>
          <div>
            <h3>{{ item[1] }}</h3>
            <p>{{ item[2] }}</p>
          </div>
        </article>
      </div>
    </section>

    <section class="business-cta">
      <div>
        <div class="section-kicker">یک قدم برای بررسی بیشتر</div>
        <h2>حالا ایده را در محصول واقعی ببین.</h2>
        <p>کمپین‌ها را مرور کن یا برای آشنایی با فرایند، راهنمای خرید گروهی را بخوان.</p>
      </div>
      <div class="button-row">
        <NuxtLink to="/" class="button light">کشف خریدها <AppIcon name="arrow" /></NuxtLink
        ><NuxtLink to="/how-it-works" class="button secondary">راهنمای خرید</NuxtLink>
      </div>
    </section>
  </div>
</template>
