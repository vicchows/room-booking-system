/**
 * app.js - Main Application Logic & Navigation
 */

const APP = {
  /**
   * Initialize the application
   */
  init() {
    // Initialize data
    DB.init();
    // Initialize i18n
    I18N.init();
    // Initialize MSAL
    MSALAuth.init();
    // Initialize theme
    this.initTheme();
    // Render language switcher
    this.renderLangSwitcher();
    // Apply translations
    I18N.applyToPage();
  },

  /**
   * Initialize theme from localStorage or system preference
   */
  initTheme() {
    const saved = localStorage.getItem('rbs_theme') || 'system';
    this.applyTheme(saved);
    // Watch for system preference changes
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
      if ((localStorage.getItem('rbs_theme') || 'system') === 'system') {
        this.applyTheme('system');
      }
    });
  },

  /**
   * Apply theme: 'light' | 'dark' | 'system'
   */
  applyTheme(mode) {
    localStorage.setItem('rbs_theme', mode);
    let isDark = false;
    if (mode === 'dark') isDark = true;
    else if (mode === 'system') isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
    // Update toggle buttons
    document.querySelectorAll('.theme-option').forEach(el => {
      el.classList.toggle('active', el.getAttribute('data-theme-mode') === mode);
    });
    document.querySelectorAll('#current-theme-icon').forEach(el => {
      el.textContent = mode === 'dark' ? '🌙' : mode === 'light' ? '☀️' : '💻';
    });
  },

  /**
   * Render theme toggle in nav
   */
  renderThemeToggle() {
    const container = document.getElementById('theme-switcher');
    if (!container) return;
    const saved = localStorage.getItem('rbs_theme') || 'system';
    const icons = { light: '☀️', dark: '🌙', system: '💻' };
    container.innerHTML = `
      <div class="theme-dropdown">
        <button class="theme-toggle btn btn-ghost" aria-label="Theme">
          <span id="current-theme-icon">${icons[saved] || '💻'}</span>
        </button>
        <div class="theme-menu">
          <button class="theme-option${saved === 'light' ? ' active' : ''}" data-theme-mode="light" onclick="APP.applyTheme('light')">☀️ <span data-i18n="themeLight">Light</span></button>
          <button class="theme-option${saved === 'dark' ? ' active' : ''}" data-theme-mode="dark" onclick="APP.applyTheme('dark')">🌙 <span data-i18n="themeDark">Dark</span></button>
          <button class="theme-option${saved === 'system' ? ' active' : ''}" data-theme-mode="system" onclick="APP.applyTheme('system')">💻 <span data-i18n="themeSystem">System</span></button>
        </div>
      </div>
    `;
  },

  /**
   * Render language switcher in nav
   */
  renderLangSwitcher() {
    const container = document.getElementById('lang-switcher');
    if (!container) return;

    const langs = I18N.getLanguages();
    let html = `
      <div class="lang-dropdown">
        <button class="lang-toggle btn btn-ghost" aria-label="Language">
          🌐 <span id="current-lang-name">${langs.find(l => l.code === I18N.currentLang)?.name || 'English'}</span> ▾
        </button>
        <div class="lang-menu">
          ${langs.map(l => `
            <button class="lang-option${l.code === I18N.currentLang ? ' active' : ''}"
                    data-lang="${l.code}"
                    onclick="APP.switchLanguage('${l.code}')">
              ${l.flag} ${l.name}
            </button>
          `).join('')}
        </div>
      </div>
    `;
    container.innerHTML = html;
    this.renderThemeToggle();
  },

  /**
   * Switch language
   */
  switchLanguage(lang) {
    I18N.setLanguage(lang);
    this.renderLangSwitcher();
    // (languagechange event already fired by I18N.setLanguage)
    // Re-render dynamic content if needed
    if (window.CALENDAR && typeof CALENDAR.render === 'function') CALENDAR.render();
    if (window.BOOKING && typeof BOOKING.onLangChange === 'function') BOOKING.onLangChange();
    if (window.REPORTS && typeof REPORTS.onLangChange === 'function') REPORTS.onLangChange();
    if (window.HOME && typeof HOME.renderRooms === 'function' && HOME.selectedCompany) HOME.renderRooms(HOME.selectedCompany);
    // Update page title
    document.title = I18N.t('appName');
  },

  /**
   * Show toast notification
   */
  showToast(message, type = 'info') {
    const container = document.getElementById('toast-container') || this._createToastContainer();
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    const icons = { success: '✅', error: '❌', info: 'ℹ️', warning: '⚠️' };
    toast.innerHTML = `<span class="toast-icon">${icons[type] || ''}</span><span>${message}</span>`;
    container.appendChild(toast);

    // Animate in
    setTimeout(() => toast.classList.add('show'), 10);
    // Remove after 4s
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 300);
    }, 4000);
  },

  _createToastContainer() {
    const div = document.createElement('div');
    div.id = 'toast-container';
    document.body.appendChild(div);
    return div;
  },

  /**
   * Show loading spinner
   */
  showLoading(containerId) {
    const el = document.getElementById(containerId);
    if (el) el.innerHTML = '<div class="loading-spinner"><div class="spinner"></div></div>';
  },

  /**
   * Navigate to page with params
   */
  navigate(page, params = {}) {
    const queryStr = Object.entries(params)
      .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
      .join('&');
    window.location.href = queryStr ? `${page}?${queryStr}` : page;
  },

  /**
   * Get URL parameters
   */
  getParams() {
    const params = {};
    new URLSearchParams(window.location.search).forEach((v, k) => {
      params[k] = v;
    });
    return params;
  },

  /**
   * Format date for display
   */
  formatDate(dateStr) {
    if (!dateStr) return '';
    const [y, m, d] = dateStr.split('-').map(Number);
    const months = I18N.t('months');
    return `${months[m - 1]} ${d}, ${y}`;
  },

  /**
   * Confirm dialog
   */
  confirm(message) {
    return window.confirm(message);
  }
};

// ─── Home Page Logic ──────────────────────────────────────────────────────────

const HOME = {
  selectedCountry: null,
  selectedCompany: null,

  init() {
    APP.init();
    this.renderCountries();
    document.title = I18N.t('appName');
  },

  renderCountries() {
    const container = document.getElementById('countries-grid');
    if (!container) return;

    const countries = DB.getCountries();
    container.innerHTML = countries.map(c => `
      <div class="country-card${this.selectedCountry === c.code ? ' active' : ''}"
           onclick="HOME.selectCountry('${c.code}')">
        <span class="country-flag">${c.flag}</span>
        <span class="country-name">${c.name}</span>
      </div>
    `).join('');
  },

  selectCountry(code) {
    this.selectedCountry = code;
    this.selectedCompany = null;
    this.renderCountries();
    this.renderCompanies(code);
    document.getElementById('companies-section').style.display = 'block';
    document.getElementById('rooms-section').style.display = 'none';
    // Smooth scroll
    document.getElementById('companies-section').scrollIntoView({ behavior: 'smooth' });
  },

  renderCompanies(countryCode) {
    const container = document.getElementById('companies-grid');
    if (!container) return;

    const companies = DB.getCompaniesByCountry(countryCode);
    container.innerHTML = companies.map(c => `
      <div class="company-card${this.selectedCompany === c.id ? ' active' : ''}"
           onclick="HOME.selectCompany('${c.id}')">
        <div class="company-name">${c.name}</div>
        <div class="company-address">${c.address}</div>
      </div>
    `).join('');
  },

  selectCompany(companyId) {
    this.selectedCompany = companyId;
    this.renderCompanies(this.selectedCountry);
    this.renderRooms(companyId);
    document.getElementById('rooms-section').style.display = 'block';
    document.getElementById('rooms-section').scrollIntoView({ behavior: 'smooth' });
  },

  renderRooms(companyId) {
    const container = document.getElementById('rooms-grid');
    if (!container) return;

    const rooms = DB.getRoomsByCompany(companyId);
    const allEquip = DB.getAll('equipment');
    const lang = I18N.currentLang;

    if (rooms.length === 0) {
      container.innerHTML = `<p class="no-data">${I18N.t('noData')}</p>`;
      return;
    }

    container.innerHTML = rooms.map(r => {
      const equipHtml = (r.equipment || []).map(eqId => {
        const eq = allEquip.find(e => e.id === eqId);
        if (!eq) return '';
        const name = DB.getEquipmentName(eq, lang);
        return `<span class="equipment-badge" title="${name}">${eq.icon} ${name}</span>`;
      }).join('');

      return `
        <div class="room-card">
          <div class="room-card-header">
            <h3>${r.name}</h3>
            <span class="capacity-badge">👥 ${r.capacity} ${I18N.t('persons')}</span>
          </div>
          <div class="room-meta">
            <span>📍 ${r.location}</span>
          </div>
          ${r.description ? `<p class="room-description">${r.description}</p>` : ''}
          <div class="equipment-list">${equipHtml}</div>
          <div class="room-actions">
            <button class="btn btn-primary" onclick="APP.navigate('calendar.html', {roomId: '${r.id}'})">
              📅 ${I18N.t('viewCalendar')}
            </button>
          </div>
        </div>
      `;
    }).join('');
  }
};
