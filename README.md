# 🏢 Company Room Booking System / 公司房間預訂系統

A complete, fully functional HTML-based company room booking system. Works as static HTML/CSS/JavaScript files with no backend server required. All data is stored in browser `localStorage`.

---

## 🌐 System Overview

**English:** A multi-language room booking system supporting Microsoft 365 login, OTP email verification, admin CRUD panel, and utilization reports.

**繁體中文：** 一套多語言公司房間預訂系統，支援 Microsoft 365 登入、OTP 電郵驗證、管理員後台及使用率報表。

---

## 📁 File Structure

```
index.html              # Home page - country/company/room selection
calendar.html           # Calendar view for room bookings
booking.html            # Add/Edit/Cancel booking form
admin.html              # Admin master data management
reports.html            # Reports page
css/
  style.css             # Main stylesheet (responsive, modern UI)
js/
  i18n.js               # Multilingual support module
  data.js               # Master data & localStorage management
  app.js                # Main app logic & navigation
  calendar.js           # Calendar rendering & interaction
  booking.js            # Booking form logic
  email.js              # Email simulation (mailto + log)
  msal-auth.js          # Microsoft 365 login integration (MSAL.js)
  reports.js            # Reports generation
data/
  sample-data.js        # Sample master data (preloaded)
```

---

## 🚀 Setup Instructions / 設定說明

1. Clone or download this repository
2. Open `index.html` in any modern web browser
3. Sample data is automatically loaded on first run
4. No server, database, or build step required

**注意：** 直接在瀏覽器開啟 `index.html` 即可使用。首次開啟時會自動載入示範數據。

---

## 🔐 Microsoft 365 Configuration / Microsoft 365 設定

To enable real Microsoft 365 authentication:

1. Register your app at [Azure Portal](https://portal.azure.com/#blade/Microsoft_AAD_RegisteredApps)
2. Open `js/msal-auth.js`
3. Replace the placeholder values:
   ```javascript
   const MSAL_CLIENT_ID = 'YOUR_CLIENT_ID_HERE';   // Your Application (client) ID
   const MSAL_TENANT_ID = 'YOUR_TENANT_ID_HERE';   // Your Directory (tenant) ID
   const DEMO_MODE = false;                          // Set to false for real auth
   ```
4. Uncomment the MSAL.js CDN script in the HTML files
5. Add your redirect URI in Azure AD app registration

**Demo Mode:** Without real Azure AD credentials, the system runs in demo mode where you can simulate login by selecting any employee from a dropdown.

---

## 🌍 Supported Languages / 支援語言

| Code | Language |
|------|----------|
| `en` | English (default) |
| `zh-TW` | 繁體中文 Traditional Chinese |
| `zh-CN` | 简体中文 Simplified Chinese |
| `th` | ภาษาไทย Thai |
| `km` | ភាសាខ្មែរ Khmer |
| `fr` | Français French |
| `es` | Español Spanish |

---

## 📊 Features / 功能

- **Home Page:** Browse by country → company → room cards with equipment icons
- **Monthly Calendar:** Color-coded day availability (🟢 Available, 🟡 Partial, 🔴 Full)
- **Booking System:** Add/Edit/Cancel with OTP email verification
- **Microsoft 365 SSO:** Auto-fill employee details from M365 account
- **Email Simulation:** mailto links + modal preview + localStorage audit log
- **Admin Panel:** Full CRUD for all master data (companies, rooms, departments, employees, equipment)
- **Reports:**
  - My Bookings (filterable, printable, CSV export)
  - Room Booking History with stats
  - Utilization bar chart (Chart.js)
- **Multilingual:** 7 languages with language switcher
- **Responsive:** Works on desktop, tablet, and mobile

---

## 📦 Sample Data

Pre-loaded countries & companies:
- 🇭🇰 **Hong Kong**: ABC Company Ltd, XYZ Corporation
- 🇹🇭 **Thailand**: Thai Business Co., Bangkok Office
- 🇰🇭 **Cambodia**: Phnom Penh Office
- 🇫🇷 **France**: Paris Branch
- 🇪🇸 **Spain**: Madrid Office

Sample employees, departments, rooms, and 15 sample bookings are included.

---

## ⚙️ Technical Stack

- Pure HTML5, CSS3, Vanilla JavaScript (ES6+)
- No backend or build tools required
- `localStorage` for data persistence
- `sessionStorage` for OTP codes (10-minute expiry)
- [Chart.js](https://www.chartjs.org/) for utilization charts
- [MSAL.js](https://github.com/AzureAD/microsoft-authentication-library-for-js) for M365 auth
- Google Fonts (Noto Sans family for CJK/Thai/Khmer support)

---

## 📸 Screenshots

> Open `index.html` in your browser to see the live system.
