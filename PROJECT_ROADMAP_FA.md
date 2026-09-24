# نقشه راه جامع توسعه Crypto Dashboard

## 1. هدف این سند

این سند نقشه راه اجرایی پروژه‌ی `crypto-dashboard` است. هدف آن این است که هر توسعه‌دهنده یا AI بتواند بدون حدس‌زدن درباره‌ی اولویت‌ها، معماری، رفتار محصول و کیفیت خروجی، پروژه را از وضعیت فعلی تا یک داشبورد حرفه‌ای، سریع، ریسپانسیو و قابل استفاده در موبایل و دسکتاپ پیش ببرد.

این سند فقط فهرست ایده‌ها نیست. برای هر فاز مشخص می‌کند:

- چه مسئله‌ای باید حل شود.
- چه فایل‌ها و لایه‌هایی احتمالاً درگیر می‌شوند.
- چه قابلیت‌هایی باید ساخته شوند.
- چه رفتارها و حالت‌های خطایی باید پوشش داده شوند.
- چه چیزهایی نباید انجام شوند.
- خروجی قابل تحویل فاز چیست.
- چگونه باید موفقیت فاز بررسی شود.

ترتیب فازها مهم است. هر فاز باید قبل از ورود به فاز بعدی با معیارهای پذیرش همان فاز بررسی شود. در طول توسعه نباید چند فاز را بدون تثبیت فاز قبلی به‌صورت هم‌زمان و بی‌قاعده مخلوط کرد.

---

## 2. خلاصه‌ی وضعیت فعلی پروژه

### 2.1 فناوری‌ها و زیرساخت موجود

- Next.js `16.3.5` با App Router.
- React `19.2.8`.
- TypeScript برای لایه‌ی API، مدل‌ها و store.
- JavaScript/JSX برای بخشی از صفحات و کامپوننت‌ها.
- Tailwind CSS نسخه‌ی ۴ در کنار CSS variables.
- TanStack Query برای دریافت و cache داده‌های بازار.
- Zustand برای theme، watchlist و portfolio.
- Recharts برای نمودارها.
- `react-simple-maps` برای قابلیت‌های جغرافیایی آینده.
- Vitest و Testing Library برای تست.
- ESLint و TypeScript برای کنترل کیفیت.
- API proxy سمت سرور برای جلوگیری از ارسال کلید CoinGecko به مرورگر.

### 2.2 بخش‌هایی که اکنون وجود دارند

- layout مشترک شامل Header، Nav، ThemeSwitcher و وضعیت منبع داده.
- صفحه‌ی اصلی Dashboard با metric card، جدول خلاصه‌ی بازار، top movers، watchlist context و market note.
- مدل‌های اولیه‌ی market coin، chart point، coin detail و portfolio asset.
- route proxy در `src/app/api/coingecko/[...path]/route.ts`.
- API helper در `src/lib/api.ts`.
- store پایدارشونده در localStorage در `src/lib/store/useAppStore.ts`.
- کامپوننت‌های پایه مانند Card، Button، Input، Select، Table، Tabs، Badge، Skeleton، EmptyState و ErrorState.
- هوک‌های دریافت بازار، جزئیات کوین و نمودار.
- routeهای `/market`، `/watchlist`، `/portfolio` و `/compare`، اما این routeها هنوز عمدتاً placeholder هستند.
- تست‌های واحد برای API، store، layout و UI.

### 2.3 وضعیت کیفی فعلی

- تست فعلی: ۲۲ تست در ۴ فایل با موفقیت پاس شد.
- lint فعلی: بدون خطا اجرا شد.
- مشکل اصلی فعلی، خطای زیرساختی نیست؛ کمبود قابلیت و فاصله‌ی تجربه‌ی کاربری با هدف نهایی است.
- صفحه‌ی اصلی فعلی فضای یک داشبورد تحلیلی تیره و مینیمال دارد، اما هنوز به تراکم اطلاعاتی، جدول کامل بازار، تب‌های دسته‌بندی، نمودارهای متعدد و معماری widget-based تصاویر مرجع نرسیده است.

### 2.4 شکاف‌های مهم فعلی

1. صفحه‌ی Markets هنوز جدول کامل بازار، فیلتر، جست‌وجو، pagination یا sorting قابل استفاده ندارد.
2. صفحه‌ی Watchlist هنوز به داده‌ی ذخیره‌شده و جدول قابل مدیریت متصل نشده است.
3. صفحه‌ی Portfolio هنوز محاسبه‌ی ارزش، سود و زیان، allocation و فرم واقعی ندارد.
4. صفحه‌ی Compare هنوز انتخاب کوین، نمودار نرمال‌شده و جدول مقایسه ندارد.
5. Dashboard به داده‌ی محدود کوین‌های tracked وابسته است و market overview آن معادل global market data واقعی نیست.
6. sparkline و chart components در ساختار پروژه موجودند، اما در خروجی فعلی تجربه‌ی کامل نموداری شکل نگرفته است.
7. حالت‌های loading، error، empty و stale data باید در همه‌ی routeها یکدست شوند.
8. تجربه‌ی موبایل باید از ابتدا طراحی شود؛ صرفاً کوچک‌کردن جدول دسکتاپ کافی نیست.
9. تطبیق با تصاویر مرجع هنوز در سطح ساختاری انجام نشده است.
10. سیستم طراحی نیاز به تثبیت typography، density، spacing، رنگ‌های وضعیت و widget layout دارد.

---

## 3. تحلیل دو تصویر مرجع

### 3.1 تصویر اول: صفحه‌ی بازار شبیه CoinGecko

تصویر اول یک صفحه‌ی بازار روشن، بسیار متراکم و داده‌محور را نشان می‌دهد. اجزای اصلی آن عبارت‌اند از:

- عنوان واضح در بالای صفحه: قیمت‌ها بر اساس market cap.
- توضیح کوتاه درباره‌ی ارزش کل بازار و تغییر ۲۴ ساعته.
- کنترل کوچک Highlights در هدر.
- دو کارت آماری برای market cap و 24h trading volume، همراه با خط روند قرمز.
- کارت Trending با چند asset، آیکون، قیمت و تغییرات.
- کارت Top Gainers با درصد رشد سبز.
- نوار تب یا فیلتر شامل All، Highlights، Base Ecosystem، Categories، Data Availability و پروتکل‌ها.
- دکمه‌های Customize و Filter.
- جدول متراکم با ستون‌های rank، coin، price، 1h، 24h، 7d، 24h volume، market cap و Last 7 Days.
- ستاره‌ی watchlist در ابتدای هر ردیف.
- لوگوی واقعی یا asset icon برای هر کوین.
- رنگ سبز برای رشد و قرمز برای افت.
- sparkline هفت‌روزه در آخر هر ردیف.
- چیدمان روشن، borderهای کم‌رنگ، radius کم و اطلاعات قابل scan.

درس اصلی این تصویر: صفحه‌ی بازار باید برای مقایسه‌ی سریع تعداد زیادی دارایی ساخته شود. تزئین نباید جای اطلاعات، sort، فیلتر و خوانایی عددی را بگیرد.

### 3.2 تصویر دوم: داشبورد تحلیلی تیره شبیه Google Analytics

تصویر دوم یک داشبورد مدیریتی تیره و widget-based است. ویژگی‌های قابل استخراج آن:

- پس‌زمینه‌ی تیره‌ی یکپارچه و contrast مناسب.
- شبکه‌ای از widgetهای مستقل با header کوچک و ابزارهای گوشه‌ای.
- کارت‌های بزرگ و کوچک که کنار هم یک canvas تحلیلی می‌سازند.
- نمودار area و line برای trend زمانی.
- نمودار pie برای توزیع کاربران یا allocation.
- جدول ranking با میله‌های افقی.
- نمودار چندخطی برای مقایسه‌ی conversion یا metricها.
- map برای نمایش توزیع جغرافیایی.
- اعداد بزرگ و labelهای کوچک با hierarchy واضح.
- استفاده‌ی کنترل‌شده از آبی، سبز، بنفش، قرمز و زرد روی زمینه‌ی تیره.
- ابزارهای widget مانند collapse، settings، maximize و close.
- تراکم اطلاعات بیشتر از یک landing page و تمرکز بر پایش مداوم.

درس اصلی این تصویر: داشبورد نهایی باید فقط مجموعه‌ای از کارت‌های معمولی نباشد؛ باید یک فضای کاری تحلیلی قابل شخصی‌سازی با widgetهای نموداری و خلاصه‌های عملیاتی باشد.

### 3.3 نتیجه‌ی تطبیق پروژه با تصاویر

پروژه‌ی فعلی از نظر dark theme، card primitives، chart dependency، status colors و ساختار route ظرفیت رسیدن به هر دو زبان بصری را دارد. با این حال، هنوز باید دو تجربه در آن ترکیب شود:

- **Market workspace:** متراکم، روشن یا قابل تغییر به روشن، table-first، مناسب مقایسه و کشف دارایی.
- **Analytics workspace:** تیره، widget-based، نموداری، مناسب پایش روند، portfolio و insight.

این دو تجربه نباید به‌صورت دو طراحی بی‌ارتباط پیاده شوند. header، spacing، typography، status colors، card primitive، loading state و رفتار responsive باید مشترک بمانند.

---

# 4. اصول غیرقابل مذاکره در همه‌ی فازها

## 4.1 Mobile-first و ریسپانسیو

- ابتدا layout برای عرض حدود ۳۲۰ تا ۳۹۰ پیکسل طراحی و تست شود.
- سپس breakpointهای tablet و desktop اضافه شوند.
- هیچ جدول یا widget مهمی نباید باعث overflow افقی ناخواسته در body شود.
- برای جدول‌های ذاتاً عریض، از scroll container کنترل‌شده با نشانه‌ی قابل فهم استفاده شود؛ کل صفحه نباید افقی اسکرول شود.
- در موبایل، ستون‌های کم‌اهمیت پنهان یا به detail view منتقل شوند؛ اطلاعات حیاتی نباید با font بسیار ریز فشرده شود.
- hit target کنترل‌ها حداقل حدود ۴۴ پیکسل باشد.
- دکمه‌ها، tabها، dropdownها و ستاره‌ی watchlist باید با touch قابل استفاده باشند.
- نمودارها باید حداقل ارتفاع ثابت و tooltip قابل استفاده روی touch داشته باشند.
- header و navigation باید در موبایل بدون شکستن layout یا پوشاندن محتوا کار کنند.
- هیچ متن، عدد، badge یا عنوانی نباید از container بیرون بزند.
- تغییر layout باید با CSS responsive انجام شود، نه با تشخیص شکننده‌ی user-agent.

## 4.2 داده و صحت مالی

- اعداد مالی با formatter مشترک نمایش داده شوند.
- برای قیمت‌های بسیار کوچک، precision باید adaptive باشد و صفرهای مهم حذف نشوند.
- درصدهای مثبت و منفی باید علامت و رنگ درست داشته باشند.
- نبودن داده با صفر اشتباه نشود.
- داده‌ی stale باید با وضعیت قابل مشاهده نمایش داده شود.
- timestamp آخرین به‌روزرسانی در بخش مناسب نشان داده شود.
- market cap، volume، dominance و P/L باید از داده‌ی واقعی یا mock شفاف بیایند.
- از قرار دادن عددهای ساختگی که شبیه داده‌ی زنده هستند خودداری شود.
- کلید CoinGecko فقط در server route بماند و هرگز با `NEXT_PUBLIC_` تعریف نشود.

## 4.3 معماری و کیفیت

- از primitiveهای موجود UI استفاده شود و برای هر صفحه component مشابه جدید ساخته نشود.
- منطق fetch در hook یا lib بماند، نه داخل JSXهای بزرگ.
- منطق محاسبه‌ی portfolio و normalize chart قابل تست و مستقل از UI باشد.
- از `any` غیرضروری استفاده نشود.
- در کنار هر قابلیت مهم، تست رفتار و حالت خطا اضافه شود.
- تغییرات هر فاز کوچک، قابل review و قابل rollback باشد.
- قبل از اضافه‌کردن dependency جدید بررسی شود که dependency فعلی پاسخ‌گو نیست.
- دسترسی‌پذیری شامل keyboard، focus، aria-label، table caption، فرم label و contrast رعایت شود.

## 4.4 اصول بصری

- typography باید hierarchy واضح برای label، number، heading و metadata داشته باشد.
- از رنگ سبز و قرمز فقط برای وضعیت بازار استفاده شود، نه تزئین عمومی.
- dark theme و light theme باید هر دو خوانا و مستقل از hardcode رنگ باشند.
- cardها باید برای grouping واقعی استفاده شوند، نه اینکه همه‌ی صفحه داخل کارت‌های تو در تو قرار گیرد.
- radius و shadow باید محدود و یکدست باشند.
- برای نمودارها grid، tooltip، legend و رنگ‌های قابل تشخیص در هر دو theme تعریف شود.
- فضای خالی باید آگاهانه باشد؛ نه تراکم کور تصویر اول و نه خلوت بیش از حد صفحه‌ی فعلی.

---

# 5. فازبندی اجرایی از ۱ تا ۸

## فاز ۱: تثبیت پایه، قرارداد داده و سیستم طراحی

### هدف

تبدیل وضعیت فعلی به یک پایه‌ی قابل اتکا برای توسعه‌ی سریع فازهای بعدی، بدون اینکه هر صفحه قرارداد، formatter یا style متفاوت خود را بسازد.

### کارهایی که AI باید انجام دهد

1. کل routeها، componentها، hookها، store و API proxy فعلی را بررسی کند و قبل از تغییر، قراردادهای موجود را حفظ کند.
2. typeهای `MarketCoin`، `CoinDetail`، `ChartPoint` و `PortfolioAsset` را کامل کند.
3. برای فیلدهای optional، null، مقدار ناموجود و response ناقص CoinGecko رفتار صریح تعریف کند.
4. formatterهای مشترک بسازد یا formatterهای موجود را به یک ماژول مشترک منتقل کند:
   - قیمت دقیق.
   - قیمت compact.
   - درصد تغییر.
   - market cap و volume.
   - تاریخ و زمان آخرین update.
5. وضعیت‌های استاندارد query را تعریف کند:
   - loading اولیه.
   - refreshing.
   - success.
   - empty.
   - error قابل retry.
   - stale data.
6. design tokenهای spacing، typography، border، surface، chart و semantic status را کامل کند.
7. CSS را برای mobile-first پایه تنظیم کند و از overflow ناخواسته جلوگیری کند.
8. primitiveهای Button، Card، Table، Tabs، Select، Input، Badge، Skeleton و ErrorState را از نظر keyboard و screen reader بررسی کند.
9. layout مشترک را طوری تنظیم کند که در عرض موبایل navigation، theme switcher و data status روی هم نیفتند.
10. تست‌های پایه برای formatter، type guards، API URL builder، theme و storage اضافه کند.

### بایدها

- منطق محاسبه از component جدا باشد.
- همه‌ی رنگ‌ها از token بیایند.
- API error شامل status و پیام قابل استفاده باشد.
- loading state شکل layout نهایی را تقلید کند تا layout shift کم شود.
- فونت tabular برای اعداد مالی استفاده شود.

### نبایدها

- API key در client یا فایل public قرار نگیرد.
- formatterهای تکراری در چند JSX ایجاد نشود.
- برای حل مشکل responsive از `transform: scale` استفاده نشود.
- داده‌ی mock به‌عنوان live data نمایش داده نشود.
- در این فاز وارد طراحی نهایی portfolio یا compare نشوید.

### خروجی فاز

- قرارداد داده‌ی مستند و type-safe.
- tokenهای کامل و یکدست.
- primitiveهای قابل استفاده در تمام صفحات.
- تست‌های پایه‌ی سبز.
- layout مشترک سالم در موبایل، تبلت و دسکتاپ.

### معیار پذیرش

- `npm test` پاس شود.
- `npm run lint` پاس شود.
- `npm run typecheck` پاس شود.
- هیچ route اصلی در عرض موبایل overflow ناخواسته نداشته باشد.
- خطا، empty و loading در UI قابل تشخیص باشند.

---

## فاز ۲: Shell محصول و ناوبری حرفه‌ای

### هدف

ساخت چارچوبی که تمام صفحات را به یک محصول منسجم تبدیل کند و به الگوی workspace مرجع نزدیک شود.

### کارهایی که AI باید انجام دهد

1. Header را برای دو حالت desktop و mobile بازطراحی کند.
2. desktop navigation و mobile navigation را از نظر ترتیب، active state و keyboard تکمیل کند.
3. در موبایل منوی ناوبری را به یکی از الگوهای قابل استفاده مانند horizontal scroll کنترل‌شده یا menu drawer تبدیل کند.
4. DataSourceStatus را به status واقعی queryها وصل کند؛ وضعیت «API unavailable» نباید صرفاً نمایشی باشد.
5. theme switcher را با حفظ theme در localStorage و جلوگیری از flash نامناسب تکمیل کند.
6. breadcrumb یا page context مناسب برای `/coin/[id]` و صفحات فرعی اضافه کند.
7. page container، max width، section gap و sticky behavior را یکدست کند.
8. یک command area قابل توسعه برای refresh، time range، export و filter آماده کند.
9. title، description و metadata هر route را واقعی و منطبق با محتوای صفحه کند.
10. focus management برای drawer، modal و menu را پیاده‌سازی کند.

### بایدها

- active route برای nested routeها دقیق بماند.
- هدر در موبایل محتوای اصلی را نپوشاند.
- کنترل‌هایی که فقط icon دارند tooltip یا aria-label داشته باشند.
- حالت disabled، pending و error کنترل‌ها مشخص باشد.

### نبایدها

- هدر را با تعداد زیاد دکمه و badge شلوغ نکنید.
- navigation را فقط با رنگ active مشخص نکنید؛ underline، background یا aria-current نیز بررسی شود.
- برای mobile drawer از modal بدون focus trap استفاده نشود.

### خروجی فاز

- shell منسجم و قابل استفاده در همه‌ی routeها.
- navigation موبایل و دسکتاپ.
- theme پایدار.
- وضعیت داده‌ی واقعی در هدر.

### معیار پذیرش

- تمام routeها با shell یکسان render شوند.
- با keyboard بتوان از header، nav و theme switcher استفاده کرد.
- در viewportهای کوچک هیچ overlap مهمی رخ ندهد.

---

## فاز ۳: Dashboard اصلی با ساختار Market Overview

### هدف

بازطراحی صفحه‌ی اصلی برای ترکیب خلاصه‌ی بازار تصویر اول با فضای تحلیلی تصویر دوم.

### ساختار پیشنهادی صفحه

1. page heading شامل عنوان، توضیح کوتاه، زمان آخرین update و کنترل refresh.
2. metric strip شامل:
   - Total market cap.
   - 24h volume.
   - BTC dominance.
   - تعداد دارایی tracked یا market breadth.
3. ردیف widgetهای Trending و Top Gainers.
4. Market pulse chart با بازه‌ی 24h، 7d و 30d.
5. جدول خلاصه‌ی دارایی‌ها با sparkline.
6. widgetهای watchlist signal و market note.
7. در desktop، grid چندستونه؛ در mobile، ترتیب اولویت‌دار و تک‌ستونه.

### کارهایی که AI باید انجام دهد

1. داده‌ی global market را از endpoint مناسب دریافت کند یا تا آماده‌شدن endpoint، adapter مشخص و قابل جایگزینی بسازد.
2. metricهای فعلی را از مقدارهای hardcode مانند `+2.84%` و `+6.18%` جدا کند و به داده‌ی واقعی یا حالت unavailable وصل کند.
3. trending و top gainers را بر اساس معیار تعریف‌شده sort کند.
4. trend chart را با Recharts بسازد و برای نبودن داده، skeleton و empty state بدهد.
5. widgetها را با header استاندارد، title، subtitle، time range و action slot بسازد.
6. market pulse را به جای یک جدول ساده، به یک widget قابل خواندن برای trend تبدیل کند.
7. sparkline هر دارایی را از داده‌ی واقعی `sparkline_in_7d` نمایش دهد.
8. کارت‌ها را از نظر ارتفاع، padding، typography و alignment یکدست کند.
9. quick actionهای اصلی مانند refresh، open markets، add to watchlist و view detail را اضافه کند.
10. برای error یک widget مستقل و retry action ارائه دهد؛ شکست یک widget نباید کل dashboard را خالی کند.

### بایدها

- هر metric باید منبع داده و زمان update داشته باشد.
- نمودار در mobile حداقل ارتفاع و tooltip قابل لمس داشته باشد.
- در desktop تراکم اطلاعات به تصویر دوم نزدیک شود، اما خوانایی از بین نرود.
- در light theme، جدول و chart از نظر contrast شبیه تصویر اول و در dark theme از نظر عمق بصری شبیه تصویر دوم باشد.

### نبایدها

- از متن‌های بازاریابی مانند «Institutional-grade» بدون قابلیت واقعی استفاده نشود.
- برای پرکردن dashboard widget جعلی اضافه نشود.
- همه‌ی widgetها یک اندازه و یک شکل اجباری نداشته باشند؛ اما header و spacing مشترک بماند.

### خروجی فاز

- Dashboard واقعی با metric، chart، mover widget، sparkline و action.
- برخورد مستقل با خطای هر widget.
- طراحی قابل استفاده در موبایل و دسکتاپ.

### معیار پذیرش

- dashboard با داده‌ی موفق، loading، خطا و empty قابل بررسی باشد.
- در موبایل ترتیب محتوا منطقی باشد: heading، metrics، alert/movers، chart، table، secondary widgets.
- هیچ مقدار تغییر روزانه‌ی ساختگی بدون برچسب mock باقی نماند.

---

## فاز ۴: Markets Workspace بر اساس تصویر اول

### هدف

ساخت صفحه‌ی اصلی بازار با table-first UX، فیلتر، جست‌وجو، sort و نمای دقیق شبیه تصویر CoinGecko.

### کارهایی که AI باید انجام دهد

1. placeholder صفحه‌ی `/market` را با market workspace کامل جایگزین کند.
2. داده‌ی paginated بازار را از API دریافت کند.
3. SearchBar را به filter محلی یا query server متصل کند و debounce داشته باشد.
4. TabsBar را برای All، Highlights، Categories، Data Availability و پروتکل‌های پروژه پیاده کند؛ تب‌ها باید منبع داده و رفتار مشخص داشته باشند.
5. filter panel بسازد برای:
   - market cap range.
   - price change range.
   - volume range.
   - فقط watchlisted.
   - فقط داده‌ی دارای sparkline.
6. sorting واقعی برای rank، price، 1h، 24h، 7d، volume و market cap بسازد.
7. MarketTable و MarketRow را با ستون‌های زیر کامل کند:
   - watchlist star.
   - rank.
   - coin icon، name و symbol.
   - price.
   - 1h.
   - 24h.
   - 7d.
   - 24h volume.
   - market cap.
   - 7d sparkline.
   - action برای مشاهده‌ی جزئیات.
8. از `@tanstack/react-table` برای sorting و state table استفاده کند، اگر با ساختار فعلی سازگار است.
9. pagination یا infinite loading را انتخاب و رفتار آن را مستند کند.
10. برای موبایل ستون‌ها را اولویت‌بندی کند و detail row یا bottom sheet برای اطلاعات ثانویه بسازد.
11. کنترل Customize را برای انتخاب ستون‌های قابل نمایش به کاربر پیاده کند.
12. جدول را با caption، header semantics و keyboard navigation کامل کند.

### بایدها

- جدول desktop باید متراکم ولی خوانا باشد.
- اعداد در ستون‌ها راست‌چین و tabular باشند.
- sort direction با icon و aria-sort مشخص شود.
- watchlist star optimistic update داشته باشد و در صورت خطا rollback کند.
- row click و action button با هم تداخل نداشته باشند.
- در زمان search یا filter، result count و empty state نمایش داده شود.

### نبایدها

- کل جدول را به کارت‌های بسیار بزرگ و کم‌اطلاعات در desktop تبدیل نکنید.
- موبایل را با کاهش font به اندازه‌ی غیرقابل خواندن حل نکنید.
- sort فقط ظاهری نباشد.
- برای هر ردیف درخواست جداگانه‌ی غیرضروری ارسال نشود.

### خروجی فاز

- Markets workspace کامل و قابل استفاده.
- table sorting، filtering، search، watchlist و sparkline.
- نمای responsive با تجربه‌ی مخصوص mobile.

### معیار پذیرش

- کاربر بتواند یک asset را جست‌وجو، sort، filter و به watchlist اضافه کند.
- stateهای loading، error، empty و retry کار کنند.
- ستون‌های کلیدی در desktop و موبایل قابل دسترسی باشند.

---

## فاز ۵: Coin Detail و تحلیل نموداری

### هدف

ساخت صفحه‌ی جزئیات هر کوین به‌عنوان نقطه‌ی ورود از جدول، watchlist و compare.

### کارهایی که AI باید انجام دهد

1. route `/coin/[id]` را با header واقعی کوین تکمیل کند.
2. لوگو، نام، symbol، rank، قیمت، درصدهای 1h/24h/7d و market cap را نشان دهد.
3. دکمه‌ی watchlist و actionهای copy link، refresh و share را اضافه کند.
4. CoinChart را با بازه‌های 1D، 7D، 30D، 90D و 1Y تکمیل کند.
5. tooltip نمودار شامل timestamp، price و تغییر نسبت به نقطه‌ی شروع باشد.
6. داده‌ی chart را normalize و cache کند و هنگام تغییر range، وضعیت pending مشخص داشته باشد.
7. CoinStats را برای volume، circulating supply، total supply، ATH، ATL، dominance و آخرین update تکمیل کند.
8. sectionهای overview، market stats و درباره‌ی asset را جدا و responsive کند.
9. خطای asset نامعتبر، coin حذف‌شده و chart unavailable را مدیریت کند.
10. از URL قابل share برای coin و range استفاده کند، در صورت سازگاری با معماری فعلی.

### بایدها

- قیمت و درصدها از همان formatterهای فاز ۱ استفاده کنند.
- chart در موبایل خوانا و با touch قابل استفاده باشد.
- loading chart باعث پرش ارتفاع صفحه نشود.
- اطلاعات مالی به‌وضوح زمان آخرین update داشته باشد.

### نبایدها

- داده‌ی chart را با interpolation گمراه‌کننده پر نکنید.
- همه‌ی statها را با متن ریز داخل یک کارت فشرده نکنید.
- دکمه‌ی watchlist در چند بخش state ناسازگار نداشته باشد.

### خروجی فاز

- صفحه‌ی detail کامل و قابل دسترسی از همه‌ی مسیرها.
- chart چندبازه‌ای و statهای معتبر.
- deep link و stateهای خطا.

### معیار پذیرش

- بازکردن هر coin معتبر صفحه‌ی کامل نشان دهد.
- تعویض range بدون reload کامل کار کند.
- coin نامعتبر empty/error مناسب داشته باشد.

---

## فاز ۶: Watchlist و Portfolio واقعی

### هدف

تبدیل store فعلی به دو workflow کاربردی برای پیگیری دارایی‌ها و محاسبه‌ی وضعیت سرمایه.

### Watchlist

#### کارهای لازم

1. صفحه‌ی `/watchlist` را به watchlistIds موجود در Zustand متصل کند.
2. اطلاعات فعلی کوین‌های ذخیره‌شده را از API دریافت کند.
3. جدول یا list responsive برای قیمت، 24h، volume، market cap و sparkline نمایش دهد.
4. امکان حذف تکی، حذف چندتایی و مرتب‌سازی فراهم کند.
5. در watchlist خالی، EmptyState کاربردی با لینک به Markets نمایش دهد.
6. برای coin حذف‌شده یا API unavailable پیام دقیق نمایش دهد.
7. آخرین update و refresh را نشان دهد.

### Portfolio

#### کارهای لازم

1. فرم add asset برای coin، amount، buy price و purchasedAt بسازد.
2. اعتبارسنجی فرم را برای مقدار مثبت، قیمت معتبر و تاریخ درست اضافه کند.
3. داده‌ها را با store موجود در localStorage ذخیره کند.
4. ارزش فعلی هر دارایی را از قیمت بازار محاسبه کند.
5. total invested، current value، absolute P/L و percentage P/L را محاسبه کند.
6. allocation chart و breakdown جدول بسازد.
7. امکان edit و delete امن با confirmation فراهم کند.
8. حالت no portfolio، partial market data، stale price و error را پوشش دهد.
9. محاسبات را در توابع pure قرار دهد و تست واحد بنویسد.
10. فرمت نمایش اعداد را برای سود مثبت، منفی و صفر یکدست کند.

### بایدها

- اطلاعات portfolio محلی و شفاف باشد و ادعای sync ابری نداشته باشد.
- قبل از حذف، confirmation برای جلوگیری از از دست رفتن داده وجود داشته باشد.
- همه‌ی فرم‌ها label، error text و keyboard support داشته باشند.
- P/L با داده‌ی قیمت زمان فعلی برچسب‌گذاری شود.

### نبایدها

- private key، seed phrase یا اطلاعات حساس از کاربر درخواست نشود.
- سود و زیان بدون مشخص‌کردن فرض قیمت خرید و کارمزد محاسبه نشود.
- موجودی خالی به‌عنوان portfolio با ارزش صفر و بدون توضیح نمایش داده نشود.

### خروجی فاز

- Watchlist قابل استفاده و پایدار.
- Portfolio با CRUD، محاسبه‌ی P/L، allocation و local persistence.

### معیار پذیرش

- refresh صفحه داده‌های ذخیره‌شده را از بین نبرد.
- افزودن، ویرایش و حذف asset تست‌شده باشد.
- محاسبات با موارد مثبت، صفر، اعشاری و داده‌ی ناقص تست شوند.

---

## فاز ۷: Compare، فیلترهای پیشرفته و شخصی‌سازی workspace

### هدف

ایجاد تجربه‌ی مقایسه و شخصی‌سازی که پروژه را از یک جدول ساده به ابزار تحلیل تبدیل کند.

### Compare

1. صفحه‌ی `/compare` را از placeholder خارج کند.
2. انتخاب ۲ تا ۳ کوین را با autocomplete و جلوگیری از duplicate بسازد.
3. chart نرمال‌شده طراحی کند که نقطه‌ی شروع هر asset برابر ۱۰۰ یا ۰٪ باشد.
4. legend قابل کلیک برای hide/show هر asset اضافه کند.
5. time range مشترک و وضعیت loading مستقل برای هر سری داشته باشد.
6. جدول مقایسه شامل price، market cap، volume، supply، 24h، 7d و dominance باشد.
7. در موبایل، کارت‌های مقایسه و chart به‌صورت stacked نمایش داده شوند.
8. URL یا query state را برای share کردن ترکیب کوین‌ها در نظر بگیرد.

### فیلترها و شخصی‌سازی

1. Customize columns در Markets را به state قابل ذخیره تبدیل کند.
2. فیلترها در query string یا state قابل بازگردانی باشند.
3. ترتیب widgetهای dashboard قابل تنظیم شود، اگر هزینه‌ی نگهداری آن قابل قبول است.
4. کاربر بتواند widgetهای کم‌اهمیت را hide/show کند.
5. reset filters و reset layout داشته باشد.
6. برای هر تنظیم، default قابل بازگشت وجود داشته باشد.

### بایدها

- compare chart فقط زمانی render شود که حداقل دو asset معتبر انتخاب شده باشد.
- رنگ سری‌های chart هم در dark و هم light قابل تشخیص باشند.
- filter state هنگام navigation ناخواسته از بین نرود.
- state شخصی‌سازی‌شده با نسخه‌ی schema قابل migration باشد.

### نبایدها

- بیش از ۳ asset را در یک نمودار شلوغ نکنید.
- کاربر را مجبور به پرکردن فرم طولانی برای یک مقایسه‌ی ساده نکنید.
- تنظیمات را بدون امکان reset در localStorage قفل نکنید.

### خروجی فاز

- Compare workspace واقعی.
- فیلترها و ستون‌های قابل شخصی‌سازی.
- state قابل share و قابل بازیابی.

### معیار پذیرش

- دو یا سه coin بدون duplicate انتخاب و مقایسه شوند.
- chart normalized و جدول مقایسه با داده‌ی واقعی کار کنند.
- reset همه‌ی فیلترها و تنظیمات را به حالت پیش‌فرض برگرداند.

---

## فاز ۸: نهایی‌سازی بصری، analytics workspace و کیفیت تولید

### هدف

رساندن پروژه به تجربه‌ای که از نظر تراکم، hierarchy، نمودارها و قابلیت شخصی‌سازی به دو تصویر مرجع نزدیک باشد؛ با حفظ هویت مستقل پروژه و بدون کپی‌کردن مستقیم رابط یک محصول دیگر.

### ساختار بصری نهایی

#### بخش Market Overview

- صفحه‌ی روشن یا dark قابل انتخاب با عنوان market cap.
- توضیح کوتاه و timestamp.
- دو تا چهار metric card با sparkline یا trend indicator.
- widgetهای Trending و Top Gainers در کنار هم در desktop.
- tabs و filter toolbar با scroll کنترل‌شده در موبایل.
- MarketTable کامل و متراکم در desktop.
- mobile list/detail pattern در موبایل.

#### بخش Analytics Canvas

- grid چند widgetی با اندازه‌های متفاوت.
- widget line chart برای market trend.
- widget area chart برای حجم یا ارزش بازار.
- widget pie/donut برای portfolio allocation یا market distribution.
- widget ranking برای top movers.
- widget compare chart برای چند دارایی.
- widget status و data availability.
- در صورت آماده‌بودن داده، widget جغرافیایی؛ در غیر این صورت از نقشه‌ی جعلی استفاده نشود.

### کارهایی که AI باید انجام دهد

1. یک widget shell مشترک بسازد که title، subtitle، timestamp، action menu، loading، error و resize-friendly content را مدیریت کند.
2. grid را با CSS Grid و minmax پیاده کند؛ از position absolute برای layout اصلی استفاده نکند.
3. در desktop چندستونه، در tablet دو یا سه ستون و در mobile تک‌ستونه با ترتیب اولویت‌دار نمایش دهد.
4. widgetهای تصویر دوم را فقط با داده‌ی معتبر از API، portfolio یا محاسبه‌ی واقعی پر کند.
5. اگر داده‌ی لازم برای map یا metric خاص وجود ندارد، widget را حذف یا با empty state توضیح‌دار جایگزین کند.
6. کنترل‌های widget مانند refresh، collapse، maximize و hide را با icon button و tooltip بسازد.
7. drag-and-drop را فقط در صورتی اضافه کند که با keyboard و touch نیز قابل استفاده باشد؛ در غیر این صورت reorder ساده با کنترل‌های قابل دسترس بسازد.
8. typography را برای عدد بزرگ، label، table metadata و chart axis هماهنگ کند.
9. light theme را به کیفیت تصویر اول و dark theme را به کیفیت تصویر دوم نزدیک کند، بدون آنکه contrast یا accessibility قربانی شود.
10. transitions و animationهای محدود برای ورود widgetها، تغییر chart range و refresh اضافه کند.
11. `prefers-reduced-motion` را رعایت کند.
12. responsive screenshot در viewportهای desktop، tablet و mobile تهیه و بررسی کند.
13. تمام routeها را با داده‌ی واقعی، API failure، slow network، empty state و localStorage تازه بررسی کند.
14. metadata، favicon، title، error boundary و not-found page را برای انتشار آماده کند.
15. performance را بررسی کند:
    - درخواست تکراری کم شود.
    - chartهای خارج از viewport در صورت نیاز lazy شوند.
    - تصویر coinها بهینه باشد.
    - layout shift کم شود.
    - bundle غیرضروری اضافه نشود.
16. تست‌های regression برای navigation، market table، watchlist، portfolio، compare و theme اضافه کند.
17. یک checklist دستی QA برای تمام breakpointها و حالت‌ها اجرا کند.

### بایدها

- ظاهر نهایی باید از تصاویر الهام بگیرد، اما برند و معماری مستقل پروژه حفظ شود.
- تصویر اول به‌عنوان الگوی market table و تصویر دوم به‌عنوان الگوی analytics canvas استفاده شود.
- در تمام breakpointها hierarchy محتوا حفظ شود.
- هر widget باید value واقعی برای کاربر داشته باشد.
- chartها legend، tooltip، axis label یا context کافی داشته باشند.
- رنگ‌ها در dark و light contrast قابل قبول داشته باشند.
- همه‌ی کنترل‌های icon-only نام دسترسی‌پذیر داشته باشند.
- در موبایل مهم‌ترین اطلاعات قبل از widgetهای ثانویه قرار بگیرند.
- قبل از اعلام پایان، build production اجرا شود.

### نبایدها

- صفحه را با widgetهای نمایشی و داده‌های ساختگی شبیه عکس پر نکنید.
- طراحی را به کپی پیکسلی CoinGecko یا Google Analytics تبدیل نکنید.
- gradientهای سنگین، glow زیاد، glassmorphism افراطی یا کارت‌های تو در تو اضافه نکنید.
- برای شبیه‌شدن به تصویر دوم، تمام صفحه را تاریک و کم‌کنتراست نکنید.
- برای شبیه‌شدن به تصویر اول، همه‌ی قابلیت‌های تحلیلی را به جدول تبدیل نکنید.
- mobile را با hide کردن بی‌منطق داده‌ها ناقص نکنید.
- قبل از تکمیل error و loading، animation و polish ظاهری را اولویت اول نکنید.

### خروجی فاز

- محصولی قابل ارائه با دو حالت تجربه‌ی market و analytics.
- UI منسجم، responsive و mobile-first.
- dashboard چند widgetی، بازار کامل، portfolio، watchlist و compare.
- تست، build و QA قابل تکرار.

### معیار پذیرش نهایی

- کاربر در موبایل بدون zoom و overflow ناخواسته بتواند بازار را جست‌وجو، فیلتر و بررسی کند.
- کاربر بتواند coin را به watchlist اضافه کند، جزئیات آن را ببیند، به portfolio اضافه کند و با coin دیگر مقایسه کند.
- dashboard در dark و light قابل استفاده و خوانا باشد.
- تمام routeهای اصلی به‌جای placeholder محتوای واقعی داشته باشند.
- خطای API، empty state، slow response و داده‌ی ناقص تجربه‌ی کنترل‌شده داشته باشند.
- `npm test`، `npm run lint`، `npm run typecheck` و `npm run build` موفق باشند.
- در desktop، تراکم و ساختار کلی به تصاویر مرجع نزدیک باشد.
- در mobile، ترتیب محتوا، touch target و خوانایی از اولویت‌های desktop کم نکنند.

---

# 6. فهرست بایدها و نبایدهای عمومی برای AI

## بایدها

- قبل از هر تغییر، فایل و abstraction صاحب رفتار را پیدا کن.
- اول از component و token موجود استفاده کن.
- تغییر کوچک و قابل تست انجام بده.
- بعد از هر تغییر مهم تست مرتبط را اجرا کن.
- رفتار loading، error، empty و success را هم‌زمان طراحی کن.
- داده‌ی زنده، داده‌ی cache و داده‌ی mock را از هم متمایز نگه دار.
- برای کارهای مالی، precision، null و rounding را صریح مدیریت کن.
- به keyboard و screen reader همان اندازه‌ی ظاهر اهمیت بده.
- در هر فاز responsive را در همان فاز تست کن؛ آن را به پایان پروژه موکول نکن.
- قبل از افزودن dependency، نیاز واقعی و هزینه‌ی bundle را بررسی کن.
- تغییرات قبلی کاربر را برنگردان و فایل‌های unrelated را دست‌کاری نکن.

## نبایدها

- بدون بررسی کد موجود، architecture جدید نساز.
- routeهای placeholder را با متن تبلیغاتی پنهان نکن.
- عدد hardcode را live جلوه نده.
- کلید API یا داده‌ی حساس را به client منتقل نکن.
- در JSXهای بزرگ، fetch، محاسبه و render را درهم نریز.
- table را با font غیرقابل خواندن برای موبایل حل نکن.
- خطای یک widget را باعث شکست کل dashboard نکن.
- برای هر تغییر کوچک فایل‌های unrelated را format نکن.
- تست‌های موجود را حذف یا ضعیف نکن.
- بدون اجرای lint، test و در پایان build، فاز را تمام‌شده اعلام نکن.

---

# 7. چک‌لیست تحویل هر فاز

- [ ] هدف فاز در کد قابل مشاهده است.
- [ ] قابلیت‌های اصلی فاز پیاده‌سازی شده‌اند.
- [ ] loading، error، empty و success بررسی شده‌اند.
- [ ] desktop، tablet و mobile بررسی شده‌اند.
- [ ] keyboard navigation و aria semantics بررسی شده‌اند.
- [ ] formatterها و status colors یکدست هستند.
- [ ] تست‌های لازم اضافه یا به‌روزرسانی شده‌اند.
- [ ] `npm test` موفق است.
- [ ] `npm run lint` موفق است.
- [ ] `npm run typecheck` موفق است.
- [ ] برای فازهای قابل build، `npm run build` موفق است.
- [ ] هیچ داده‌ی ساختگی بدون برچسب باقی نمانده است.
- [ ] فایل‌های خارج از scope تغییر نکرده‌اند.
- [ ] تغییرات با معیار پذیرش فاز تطبیق داده شده‌اند.

---

# 8. ترتیب پیشنهادی اجرای واقعی

1. فاز ۱ را کامل و تثبیت کن.
2. فاز ۲ را تکمیل کن تا همه‌ی routeها shell یکسان داشته باشند.
3. فاز ۳ را اجرا کن و Dashboard اصلی را از نظر داده و responsive تثبیت کن.
4. فاز ۴ را اجرا کن؛ Markets مهم‌ترین فاصله با تصویر اول است.
5. فاز ۵ را اجرا کن تا rowها به detail واقعی متصل شوند.
6. فاز ۶ را اجرا کن تا watchlist و portfolio ارزش عملیاتی ایجاد کنند.
7. فاز ۷ را اجرا کن تا مقایسه و شخصی‌سازی اضافه شود.
8. فقط پس از پایدارشدن قابلیت‌ها، فاز ۸ را برای polish، widget canvas، QA و آماده‌سازی production انجام بده.

اولویت واقعی پروژه باید «داده‌ی درست و workflow کامل» باشد و سپس «شباهت بصری». UI زیبا بدون sort، filter، persistence، error handling و محاسبه‌ی دقیق portfolio محصول قابل اتکایی نیست.
