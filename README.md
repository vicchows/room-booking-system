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

## 🌙 Dark Mode / Night Mode

The system supports three theme modes accessible via the **💻 Theme** button in the top navigation bar:

| Mode | Description |
|------|-------------|
| ☀️ Light | Always light theme |
| 🌙 Dark | Always dark theme |
| 💻 System | Follows your OS/browser preference |

- **How to use:** Click the theme icon (☀️/🌙/💻) in the top-right of the navbar, then select your preferred mode.
- **Persistence:** Your choice is saved in `localStorage` and survives page refresh and navigation.
- **Coverage:** Dark mode covers all UI components: navbar, cards, tables, forms, modals, badges, calendar cells, status indicators, toasts, and dropdowns.

---

## 🔐 Microsoft Entra ID (Azure AD) Configuration

Settings are now managed via the **Admin Panel → ⚙️ Settings tab** (no code editing needed):

1. Go to **Admin Panel** (`admin.html`) → **⚙️ Settings** tab
2. Under **Microsoft Entra ID** section, fill in:
   - **Tenant ID**: Your Azure AD Directory (tenant) ID
   - **Client ID**: Your App Registration Application (client) ID
   - **Redirect URI**: Pre-filled with current page origin (edit if needed)
   - **Scopes**: Default `User.Read openid profile email` (edit if needed)
   - **Demo Mode**: Toggle on/off — when ON, uses simulated login instead of real Azure AD
3. Click **💾 Save Settings** — values are stored in `localStorage` and read by `msal-auth.js` at runtime.
4. Use **🔐 Test Login** to verify the configuration immediately.
5. Use **🔄 Reset to Defaults** to clear custom settings.

> ⚠️ **Security Note:** These settings are stored in browser `localStorage`. This is a demo architecture — do **not** use this approach in a production system. The Tenant ID and Client ID are not sensitive secrets, but they should still be handled carefully.

**Demo Mode (default):** Without real Azure AD credentials, the system runs in demo mode where you can simulate login by selecting any employee from a dropdown.

---

## 📧 SMTP Settings (Admin Panel)

Configure email sender details in **Admin Panel → ⚙️ Settings tab → SMTP Email Settings**:

| Field | Description |
|-------|-------------|
| SMTP Host | Mail server hostname (e.g. `smtp.gmail.com`) |
| SMTP Port | Server port (e.g. `587` for STARTTLS, `465` for SSL) |
| Encryption | None / SSL / TLS / STARTTLS |
| Username | Login username for the mail server |
| Password | Login password (masked display) |
| From Name | Display name shown as email sender |
| From Email | Sender email address shown in email previews |

- **Send Test Email:** Enter a recipient email and click **📤 Send Test** to send a simulated test email.
- When `From Name` / `From Email` are configured, all email previews will show these as the sender.
- The email delivery is **simulated** (no real SMTP connection is made — emails open via `mailto:` or display in a modal). This field sets the display name/address in the preview.

> ⚠️ **Security Warning:** Storing SMTP credentials (username/password) in `localStorage` is **NOT secure**. This is intended for demo/testing purposes only. In a real system, email sending must be handled server-side.

---

## 🌍 Language Switching / 語言切換

All text across all pages now switches when you change the language:

- **Static text** (navbar, buttons, labels, table headers, page titles) — uses `data-i18n` attributes
- **Dynamic text** (calendar cells, booking listings, toast messages, email previews, modals, error messages) — uses `I18N.t('key')` lookups
- **Placeholders** — use `data-i18n-placeholder` attributes
- **Language change event** — dispatches `languagechange` CustomEvent; all dynamic components re-render automatically
- **Fallback** — missing translations fall back to English, with a console warning

**Supported languages:**

| Code | Language |
|------|----------|
| `en` | English (default) |
| `zh-TW` | 繁體中文 Traditional Chinese |
| `zh-CN` | 简体中文 Simplified Chinese |
| `th` | ภาษาไทย Thai |
| `km` | ភាសាខ្មែរ Khmer |
| `fr` | Français French |
| `es` | Español Spanish |

Language preference is stored in `localStorage` and persists across sessions and page navigations.

---

## 📊 Features / 功能

- **Home Page:** Browse by country → company → room cards with equipment icons
- **Monthly Calendar:** Color-coded day availability (🟢 Available, 🟡 Partial, 🔴 Full)
- **Booking System:** Add/Edit/Cancel with OTP email verification
- **Microsoft 365 SSO:** Auto-fill employee details from M365 account
- **Email Simulation:** mailto links + modal preview + localStorage audit log (with configurable From address)
- **Admin Panel:** Full CRUD for all master data (companies, rooms, departments, employees, equipment) + Settings (Entra ID + SMTP)
- **Reports:**
  - My Bookings (filterable, printable, CSV export)
  - Room Booking History with stats
  - Utilization bar chart (Chart.js)
- **Dark / Light / System Theme:** Toggle in navbar, saved to localStorage
- **Full Multilingual:** 7 languages, all dynamic + static text covered, persists across sessions
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
