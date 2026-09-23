# Crypto Analytics Dashboard — Project Specification

## 1. هدف پروژه

یک داشبورد حرفه‌ای و دسکتاپ‌محور برای تحلیل بازار ارزهای دیجیتال که داده‌های عمومی CoinGecko را مصرف می‌کند و بدون دیتابیس اختصاصی، تجربه‌ای سریع، قابل‌استفاده و مناسب پورتفولیو ارائه می‌دهد.

این پروژه فقط Frontend است. داده‌های شخصی و تنظیمات کاربر در `localStorage` ذخیره می‌شوند و استقرار هدف روی Vercel، همراه با repository عمومی GitHub و لینک live برای رزومه است.

## 2. اصول محصول

- رابط کاربری فقط انگلیسی و کاملاً LTR است.
- واحد پایه‌ی نمایش قیمت USD است. پشتیبانی EUR در لایه‌ی حرفه‌ای اختیاری است.
- هیچ دیتابیس یا احراز هویت سمت سرور وجود ندارد.
- داشبورد باید برای مرور سریع KPIها، مقایسه‌ی کوین‌ها و بررسی جزئیات بازار بهینه باشد.
- تصاویر `img/finished1.webp` و `img/finished2.png` فقط Reference بصری هستند و نباید مستقیماً کپی شوند.
- نسخه‌ی اولیه باید سریع قابل‌نمایش باشد؛ عمق و امکانات پیشرفته در لایه‌های بعدی اضافه می‌شوند.

## 3. معماری و Tech Stack قطعی

| حوزه | انتخاب | کاربرد |
|---|---|---|
| Framework | Next.js App Router | routing، rendering و استقرار روی Vercel |
| Language | TypeScript | type safety در API، state و component props |
| UI | React + Tailwind CSS | کامپوننت‌های قابل‌استفاده‌مجدد و responsive styling |
| Design System | Design Tokens + shadcn/ui primitives | کنترل یکپارچه‌ی رنگ، spacing، radius، typography و states |
| Server State | TanStack Query | cache، retry، stale time، refetch و loading/error state |
| Client State | Zustand | theme، watchlist، portfolio و ترجیحات کاربر |
| Charts | Recharts | line، area، pie و sparkline با tooltip سفارشی |
| Tables | TanStack Table | sort، filter، pagination و آماده‌سازی virtualization |
| Data Source | CoinGecko Public/Demo REST API | market، detail و historical chart data |
| Persistence | `localStorage` | watchlist، portfolio و تنظیمات محلی بدون دیتابیس |
| PWA | `next-pwa` یا راهکار سازگار با Next.js | نصب‌پذیری و offline محدود در لایه‌ی حرفه‌ای |
| Unit Tests | Vitest + React Testing Library | تست hook، utility و component |
| E2E Tests | Playwright | تست flowهای اصلی در مرورگر |
| Deployment | GitHub + Vercel | build و deployment خودکار |

### تصمیم‌های معماری

- کد جدید باید TypeScript باشد؛ مهاجرت فایل‌های JavaScript موجود به‌صورت تدریجی و بر اساس فاز انجام می‌شود.
- TanStack Query جایگزین رسمی SWR است. تا زمان مهاجرت هر بخش، از دو سیستم برای یک query یکسان به‌صورت هم‌زمان استفاده نمی‌شود.
- Zustand فقط برای state کلاینت است؛ داده‌ی API در TanStack Query باقی می‌ماند.
- API client باید قابل‌تعویض باشد تا در صورت نیاز، CoinGecko از طریق Next.js Route Handler proxy شود.
- از abstraction جدید فقط وقتی استفاده شود که مرز مسئولیت یا reuse واقعی ایجاد کند.

## 4. Design Direction

- ظاهر اصلی حرفه‌ای، تمیز و مناسب ابزارهای تحلیل داده است؛ تراکم اطلاعات باید بالا اما خوانا باشد.
- Dark mode حالت پیش‌فرض است و Light mode باید از ابتدا در tokenها و componentها در نظر گرفته شود.
- رنگ رشد سبز، افت قرمز و حالت خنثی خاکستری/آبی است؛ این رنگ‌ها فقط از Design Tokens خوانده می‌شوند.
- layout دسکتاپ‌محور است: grid چندستونه برای dashboard و جدول کامل برای markets.
- در موبایل، grid به یک ستون تبدیل می‌شود و جدول با horizontal scroll یا ستون‌های اولویت‌بندی‌شده نمایش داده می‌شود.
- typography باید خوانا باشد؛ اعداد و قیمت‌ها با فونت tabular/monospace نمایش داده شوند.
- کارت‌ها، جدول‌ها، نمودارها و کنترل‌ها باید stateهای hover، focus، loading، empty و error داشته باشند.
- animation محدود و هدفمند است و نباید خوانایی یا performance را کاهش دهد.
- دسترسی‌پذیری پایه شامل keyboard navigation، focus واضح، contrast مناسب، label و aria attributes الزامی است.

## 5. صفحات و قابلیت‌ها

### 5.1 Dashboard (`/`)

- KPIها: Total Market Cap، 24h Volume، BTC Dominance و تغییرات آن‌ها
- نمودار روند کلی بازار
- سهم ارزهای برتر با Pie Chart
- Top Gainers و Top Losers
- Watchlist summary و portfolio summary در صورت وجود داده
- نقشه فقط در صورت وجود داده‌ی معتبر یا به‌عنوان widget تزئینی محدود استفاده شود

### 5.2 Markets (`/market`)

- جدول ارزها با rank، coin، price، تغییرات 1h/24h/7d، volume، market cap و sparkline
- sort، filter، search، pagination یا infinite scroll
- تب‌های All، Top Gainers، Top Losers و Trending
- کلیک روی ردیف برای ورود به Coin Detail
- کنترل Watchlist کنار هر ردیف
- آماده‌سازی برای virtualization در لیست‌های بلند

### 5.3 Coin Detail (`/coin/[id]`)

- لوگو، نام، نماد، قیمت فعلی و تغییرات
- نمودار تعاملی با بازه‌های 24h، 7d، 30d و 1y
- tooltip سفارشی و در صورت امکان zoom
- market cap، rank، volume، supply و ATH/ATL
- توضیح ارز از API
- افزودن به Watchlist و ثبت دارایی در Portfolio

### 5.4 Watchlist (`/watchlist`)

- نمایش ارزهای ذخیره‌شده در `localStorage`
- reuse جدول Markets با stateهای loading و empty
- حذف و افزودن بدون refresh کامل صفحه

### 5.5 Portfolio (`/portfolio`)

- افزودن دارایی با مقدار، قیمت خرید و تاریخ اختیاری
- محاسبه‌ی ارزش فعلی، cost basis و سود/زیان
- allocation با Pie Chart
- ذخیره‌ی داده فقط در `localStorage`
- نمایش واضح empty state و هشدار درباره‌ی local-only بودن اطلاعات

### 5.6 Compare (`/compare`)

- انتخاب ۲ تا ۳ ارز با search
- نمودار نرمال‌شده بر اساس درصد تغییر
- جدول مقایسه‌ی آمار کلیدی

### 5.7 Layout مشترک

- Header، navigation، theme switcher و وضعیت منبع داده
- navigation به Dashboard، Markets، Watchlist، Portfolio و Compare
- Footer با attribution به CoinGecko
- metadata، favicon و عنوان اختصاصی برای routeها

## 6. فازهای اجرایی جدید

هر فاز باید جداگانه اجرا شود، با lint/build و تست دستی بررسی شود و تا دریافت تأیید کاربر، فاز بعدی آغاز نشود.

### فاز ۰ — Architecture and Design Foundation

- تثبیت TypeScript، naming convention و aliasها
- تثبیت Tailwind و Design Tokens
- تعریف semantic colors برای light/dark، spacing، typography، radius و elevation
- ثبت قراردادهای data model و state model

### فاز ۱ — MVP Foundation

- آماده‌سازی Next.js App Router با TypeScript
- نصب و تنظیم TanStack Query، Zustand، Recharts، TanStack Table و تست‌ها
- تنظیم root layout، فونت، theme provider و Query provider
- ساخت API client تایپ‌شده و error model

### فاز ۲ — Core Data and Persistence

- queryهای market، coin detail و historical chart با TanStack Query
- stale time، retry، refresh و cache policy مناسب CoinGecko
- storeهای Zustand برای theme، watchlist و portfolio
- adapter مقاوم برای `localStorage`

### فاز ۳ — Shared UI System

- Button، Card، Badge، Tabs، Table، Input، Select، Skeleton، Empty و Error states
- keyboard/focus behavior و aria attributes
- ساخت primitiveها با tokenها، بدون hardcode رنگ و spacing

### فاز ۴ — Shared Layout

- Header، navigation، Footer و responsive shell
- theme switcher و layout breakpointها
- metadata پایه و route navigation

### فاز ۵ — Dashboard MVP

- KPI cards، market trend، top movers و market share chart
- اتصال به queryهای واقعی
- loading، error، empty و stale-data states

### فاز ۶ — Markets Experience

- جدول TanStack Table با sort، filter، search و pagination
- sparkline، watchlist control و responsive table behavior
- بررسی performance و آماده‌سازی virtualization

### فاز ۷ — Coin Detail and Compare

- chart تعاملی، timeframe selector و آمار کامل
- مقایسه‌ی چند ارز با داده‌ی نرمال‌شده

### فاز ۸ — Watchlist and Portfolio

- flow کامل Watchlist
- ثبت دارایی، محاسبه‌ی P/L و allocation
- persistence و recovery برای داده‌ی local-only

### فاز ۹ — Professional UX

- PWA و offline محدود
- فیلترهای پیشرفته، infinite scroll یا virtualization در صورت نیاز
- EUR converter به‌عنوان قابلیت اختیاری
- animation محدود با رعایت prefers-reduced-motion
- accessibility audit و اصلاح contrast/keyboard flow

### فاز ۱۰ — Quality and Performance

- تست unit با Vitest و React Testing Library
- تست E2E با Playwright برای flowهای اصلی
- Lighthouse، bundle analysis و اصلاح re-renderهای غیرضروری
- استفاده‌ی هدفمند از lazy loading، dynamic import و Next/Image

### فاز ۱۱ — Release

- بررسی کامل `npm run lint` و `npm run build`
- تست API و proxy از محیط‌های هدف، از جمله ایران
- تکمیل README، environment documentation و attribution
- استقرار روی Vercel و ثبت live URL و repository URL

## 7. قوانین ثابت پروژه

- تمام UI textها انگلیسی هستند؛ خود این سند می‌تواند فارسی باشد.
- هیچ داده‌ای در دیتابیس اختصاصی ذخیره نمی‌شود.
- اطلاعات Watchlist، Portfolio و تنظیمات کاربر فقط در `localStorage` هستند.
- هیچ secret یا API key در client bundle قرار نمی‌گیرد.
- رنگ، typography، spacing و radius از Design Tokens می‌آیند.
- قیمت‌ها در MVP با USD نمایش داده می‌شوند.
- داده‌ی API باید loading، error، empty و stale state داشته باشد.
- componentها باید مستقل، typed و قابل‌استفاده‌مجدد باشند.
- تغییرات هر فاز محدود به Scope همان فاز است؛ طراحی نهایی زودتر از فاز مربوطه پیاده‌سازی نمی‌شود.
- پس از هر فاز، تغییرات، فایل‌های درگیر، تست‌ها و ریسک‌های باقی‌مانده گزارش می‌شوند و برای ادامه تأیید گرفته می‌شود.
