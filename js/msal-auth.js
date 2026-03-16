/**
 * msal-auth.js - Microsoft 365 Login Integration
 *
 * CONFIGURATION INSTRUCTIONS:
 * 1. Register your application at https://portal.azure.com/#blade/Microsoft_AAD_RegisteredApps
 * 2. Replace MSAL_CLIENT_ID with your Application (client) ID
 * 3. Replace MSAL_TENANT_ID with your Directory (tenant) ID
 * 4. Add your redirect URI in Azure AD app registration (e.g., http://localhost:8080/index.html)
 *
 * For demo mode (no Azure AD), the system uses DEMO_MODE = true which simulates login.
 */

// ─── Configuration ────────────────────────────────────────────────────────────
const MSAL_CLIENT_ID = 'YOUR_CLIENT_ID_HERE';     // Replace with your Azure AD App client ID
const MSAL_TENANT_ID = 'YOUR_TENANT_ID_HERE';     // Replace with your Azure AD tenant ID
const DEMO_MODE = true;                             // Set to false when using real Azure AD credentials

// ─── MSAL Auth Module ─────────────────────────────────────────────────────────
const MSALAuth = {
  msalInstance: null,
  isInitialized: false,

  /**
   * Initialize MSAL - called once on page load
   */
  async init() {
    if (DEMO_MODE) {
      this.isInitialized = true;
      this._restoreSession();
      return;
    }

    if (typeof msal === 'undefined') {
      console.warn('MSAL.js not loaded. Running in demo mode.');
      this.isInitialized = true;
      this._restoreSession();
      return;
    }

    const msalConfig = {
      auth: {
        clientId: MSAL_CLIENT_ID,
        authority: `https://login.microsoftonline.com/${MSAL_TENANT_ID}`,
        redirectUri: window.location.origin + window.location.pathname,
      },
      cache: {
        cacheLocation: 'localStorage',
        storeAuthStateInCookie: false,
      }
    };

    try {
      this.msalInstance = new msal.PublicClientApplication(msalConfig);
      await this.msalInstance.initialize();
      this.isInitialized = true;

      // Handle redirect response
      const response = await this.msalInstance.handleRedirectPromise();
      if (response && response.account) {
        await this._handleLoginSuccess(response.account.username);
      }

      this._restoreSession();
    } catch (e) {
      console.error('MSAL init error:', e);
    }
  },

  /**
   * Login with Microsoft 365
   */
  async login() {
    if (DEMO_MODE) {
      this._showDemoLoginDialog();
      return;
    }

    if (!this.msalInstance) {
      APP.showToast('MSAL not initialized', 'error');
      return;
    }

    const loginRequest = {
      scopes: ['User.Read', 'openid', 'profile', 'email'],
    };

    try {
      // Try popup first, fall back to redirect
      const response = await this.msalInstance.loginPopup(loginRequest);
      if (response && response.account) {
        await this._handleLoginSuccess(response.account.username);
      }
    } catch (e) {
      if (e.errorCode === 'popup_window_error') {
        // Fall back to redirect
        await this.msalInstance.loginRedirect(loginRequest);
      } else {
        APP.showToast('Login failed: ' + e.message, 'error');
      }
    }
  },

  /**
   * Logout
   */
  async logout() {
    DB.clearSession();
    this._updateNavBar();

    if (!DEMO_MODE && this.msalInstance) {
      const account = this.msalInstance.getAllAccounts()[0];
      if (account) {
        await this.msalInstance.logoutPopup({ account });
      }
    }

    APP.showToast(I18N.t('logout'), 'info');
  },

  /**
   * Match M365 account to employee record and create session
   */
  async _handleLoginSuccess(email) {
    const employee = DB.getEmployeeByM365(email);
    if (!employee) {
      APP.showToast(I18N.t('errorM365NotFound'), 'error');
      return false;
    }

    const session = {
      employeeId: employee.id,
      employeeName: employee.name,
      employeeEmail: employee.email,
      companyId: employee.companyId,
      departmentId: employee.departmentId,
      isAdmin: employee.isAdmin,
      loginMethod: 'microsoft365',
      loginTime: new Date().toISOString(),
    };

    DB.setSession(session);
    this._updateNavBar();
    APP.showToast(`Welcome, ${employee.name}!`, 'success');
    return true;
  },

  /**
   * Demo login dialog (for demo mode when no Azure AD)
   */
  _showDemoLoginDialog() {
    const employees = DB.getAll('employees');
    const options = employees.map(e =>
      `<option value="${e.microsoft365Account || e.email}">${e.name} (${e.email})</option>`
    ).join('');

    const existing = document.getElementById('demo-login-modal');
    if (existing) existing.remove();

    const modal = document.createElement('div');
    modal.id = 'demo-login-modal';
    modal.className = 'modal-overlay';
    modal.innerHTML = `
      <div class="modal-content" style="max-width:500px">
        <div class="modal-header">
          <h3>🔐 Demo Login (Microsoft 365 Simulation)</h3>
          <button class="modal-close" onclick="document.getElementById('demo-login-modal').remove()">×</button>
        </div>
        <div class="modal-body">
          <p style="color:#666;margin-bottom:1rem">Select an employee to simulate Microsoft 365 login:</p>
          <select id="demo-user-select" class="form-control" style="margin-bottom:1rem">
            <option value="">-- Select User --</option>
            ${options}
          </select>
          <p style="font-size:0.85rem;color:#999">
            In production, replace MSAL_CLIENT_ID and MSAL_TENANT_ID in msal-auth.js with your Azure AD credentials.
          </p>
        </div>
        <div class="modal-footer">
          <button class="btn btn-primary" onclick="MSALAuth._demoLogin()">Login</button>
          <button class="btn btn-secondary" onclick="document.getElementById('demo-login-modal').remove()">Cancel</button>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
    modal.addEventListener('click', (e) => {
      if (e.target === modal) modal.remove();
    });
  },

  async _demoLogin() {
    const select = document.getElementById('demo-user-select');
    if (!select || !select.value) return;
    const ok = await this._handleLoginSuccess(select.value);
    if (ok) {
      const modal = document.getElementById('demo-login-modal');
      if (modal) modal.remove();
      // Notify booking form if present
      if (typeof BOOKING !== 'undefined' && BOOKING.onLoginSuccess) {
        BOOKING.onLoginSuccess();
      }
    }
  },

  /**
   * Restore session and update nav bar
   */
  _restoreSession() {
    this._updateNavBar();
  },

  /**
   * Update nav bar with user info
   */
  _updateNavBar() {
    const session = DB.getSession();
    const loginBtn = document.getElementById('btn-login-m365');
    const logoutBtn = document.getElementById('btn-logout');
    const userInfo = document.getElementById('nav-user-info');

    if (session) {
      if (loginBtn) loginBtn.style.display = 'none';
      if (logoutBtn) logoutBtn.style.display = 'inline-flex';
      if (userInfo) {
        userInfo.style.display = 'inline-flex';
        userInfo.innerHTML = `<span class="user-avatar">👤</span><span>${session.employeeName}</span>`;
      }
    } else {
      if (loginBtn) loginBtn.style.display = 'inline-flex';
      if (logoutBtn) logoutBtn.style.display = 'none';
      if (userInfo) userInfo.style.display = 'none';
    }
  },

  /**
   * Get current session
   */
  getSession() {
    return DB.getSession();
  }
};
