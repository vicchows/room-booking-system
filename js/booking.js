/**
 * booking.js - Booking Form Logic
 * Handles Add, Edit, and Cancel booking operations
 */

const BOOKING = {
  mode: 'add',       // 'add' | 'edit' | 'cancel'
  bookingId: null,
  roomId: null,
  room: null,
  existingBooking: null,
  otpKey: null,

  init() {
    APP.init();
    const params = APP.getParams();
    this.bookingId = params.bookingId || null;
    this.roomId = params.roomId || null;
    const action = params.action || 'add';
    this.mode = this.bookingId ? action : 'add';

    // Pre-fill date from calendar
    this.prefilledDate = params.date || null;

    document.title = I18N.t(this.mode === 'add' ? 'addBooking' :
                             this.mode === 'edit' ? 'editBooking' : 'cancelBooking') +
                     ` - ${I18N.t('appName')}`;

    if (this.bookingId) {
      this.existingBooking = DB.getById('bookings', this.bookingId);
      if (!this.existingBooking) {
        APP.showToast(I18N.t('bookingNotFound'), 'error');
        setTimeout(() => APP.navigate('index.html'), 1500);
        return;
      }
      this.roomId = this.existingBooking.roomId;
    }

    if (this.roomId) {
      this.room = DB.getById('rooms', this.roomId);
    }

    this.renderPage();
  },

  renderPage() {
    const container = document.getElementById('booking-container');
    if (!container) return;

    if (this.mode === 'cancel') {
      this.renderCancelPage(container);
    } else {
      this.renderForm(container);
    }

    // Auto-fill from session
    this.autoFillFromSession();
  },

  renderForm(container) {
    const allEquip = DB.getAll('equipment');
    const lang = I18N.currentLang;
    const equipHtml = this.room ? (this.room.equipment || []).map(eqId => {
      const eq = allEquip.find(e => e.id === eqId);
      if (!eq) return '';
      return `<span class="equipment-badge">${eq.icon} ${DB.getEquipmentName(eq, lang)}</span>`;
    }).join('') : '';

    const times = this._generateTimeSlots();
    const timeOptions = times.map(t => `<option value="${t}">${t}</option>`).join('');

    const companies = DB.getAll('companies');
    const companyOptions = companies.map(c =>
      `<option value="${c.id}">${c.name}</option>`
    ).join('');

    const isEdit = this.mode === 'edit';
    const b = this.existingBooking;

    container.innerHTML = `
      <div class="booking-form-wrapper">
        <div class="booking-form-header">
          <h2>${I18N.t(isEdit ? 'editBooking' : 'addBooking')}</h2>
          ${this.room ? `
            <div class="room-info-card">
              <h3>🏢 ${this.room.name}</h3>
              <div class="room-meta">
                <span>📍 ${this.room.location}</span>
                <span>👥 ${this.room.capacity} ${I18N.t('persons')}</span>
              </div>
              <div class="equipment-list">${equipHtml}</div>
            </div>
          ` : ''}
        </div>

        <form id="booking-form" onsubmit="BOOKING.handleSubmit(event)">
          <div class="form-grid">
            <div class="form-group">
              <label for="field-company" data-i18n="company"></label>
              <select id="field-company" class="form-control" required
                      onchange="BOOKING.onCompanyChange()">
                <option value="" data-i18n-placeholder="selectCompanyPlaceholder"></option>
                ${companyOptions}
              </select>
              <span class="field-error" id="err-company"></span>
            </div>

            <div class="form-group">
              <label for="field-department" data-i18n="department"></label>
              <select id="field-department" class="form-control" required
                      onchange="BOOKING.onDepartmentChange()">
                <option value="" data-i18n-placeholder="selectDepartment"></option>
              </select>
              <span class="field-error" id="err-department"></span>
            </div>

            <div class="form-group">
              <label for="field-employee" data-i18n="employees"></label>
              <select id="field-employee" class="form-control" required>
                <option value="" data-i18n-placeholder="selectEmployee"></option>
              </select>
              <span class="field-error" id="err-employee"></span>
            </div>

            <div class="form-group">
              <label for="field-date" data-i18n="date"></label>
              <input type="date" id="field-date" class="form-control" required
                     value="${isEdit ? b.date : (this.prefilledDate || '')}"
                     onchange="BOOKING.onDateChange()">
              <span class="field-error" id="err-date"></span>
            </div>

            <div class="form-group">
              <label for="field-start-time" data-i18n="startTime"></label>
              <select id="field-start-time" class="form-control" required
                      onchange="BOOKING.checkConflicts()">
                <option value=""></option>
                ${timeOptions}
              </select>
              <span class="field-error" id="err-start-time"></span>
            </div>

            <div class="form-group">
              <label for="field-end-time" data-i18n="endTime"></label>
              <select id="field-end-time" class="form-control" required
                      onchange="BOOKING.checkConflicts()">
                <option value=""></option>
                ${timeOptions}
              </select>
              <span class="field-error" id="err-end-time"></span>
            </div>

            <div class="form-group form-group-full">
              <label for="field-purpose" data-i18n="purposeLabel"></label>
              <input type="text" id="field-purpose" class="form-control" required
                     maxlength="200"
                     value="${isEdit ? this._esc(b.purpose) : ''}">
              <span class="field-error" id="err-purpose"></span>
            </div>

            <div class="form-group">
              <label for="field-attendees" data-i18n="attendees"></label>
              <input type="number" id="field-attendees" class="form-control" required
                     min="1" max="${this.room ? this.room.capacity : 9999}"
                     value="${isEdit ? b.attendees : ''}">
              <span class="field-error" id="err-attendees"></span>
            </div>

            <div class="form-group form-group-full">
              <label for="field-notes" data-i18n="notes"></label>
              <textarea id="field-notes" class="form-control" rows="3"
                        maxlength="500">${isEdit ? this._esc(b.notes || '') : ''}</textarea>
            </div>
          </div>

          <div id="conflict-warning" class="conflict-warning" style="display:none">
            <span data-i18n="conflictWarning"></span>
          </div>

          <div id="existing-bookings-section" style="display:none">
            <h4 data-i18n="existingBookings"></h4>
            <div id="existing-bookings-list"></div>
          </div>

          <div class="form-actions">
            <button type="submit" class="btn btn-primary">
              ${I18N.t(isEdit ? 'save' : 'submit')}
            </button>
            <button type="button" class="btn btn-secondary" onclick="history.back()">
              ${I18N.t('cancel')}
            </button>
          </div>
        </form>

        <!-- OTP Section (hidden initially) -->
        <div id="otp-section" class="otp-section" style="display:none">
          <div class="otp-card">
            <h3>🔐 <span data-i18n="otpTitle"></span></h3>
            <p id="otp-message"></p>
            <div class="otp-input-group">
              <input type="text" id="otp-input" class="otp-input" maxlength="6"
                     placeholder="000000" pattern="[0-9]{6}">
              <button class="btn btn-primary" onclick="BOOKING.verifyOTP()">
                <span data-i18n="otpVerify"></span>
              </button>
            </div>
            <button class="btn btn-link" onclick="BOOKING.resendOTP()">
              <span data-i18n="otpResend"></span>
            </button>
          </div>
        </div>

        <!-- Confirmation Section (hidden initially) -->
        <div id="confirmation-section" class="confirmation-section" style="display:none">
        </div>
      </div>
    `;

    // Apply translations
    I18N.applyToPage();

    // Pre-fill if editing
    if (isEdit) {
      this._prefillForm(b);
    }
  },

  renderCancelPage(container) {
    const b = this.existingBooking;
    const room = DB.getById('rooms', b.roomId);
    const emp = DB.getById('employees', b.employeeId);
    const dept = DB.getById('departments', b.departmentId);

    container.innerHTML = `
      <div class="booking-form-wrapper">
        <div class="booking-form-header">
          <h2>🗑️ <span data-i18n="cancelBooking"></span></h2>
        </div>
        <div class="cancel-booking-details">
          <div class="detail-row">
            <strong data-i18n="roomInfo"></strong>
            <span>${room ? room.name : ''}</span>
          </div>
          <div class="detail-row">
            <strong data-i18n="date"></strong>
            <span>${APP.formatDate(b.date)}</span>
          </div>
          <div class="detail-row">
            <strong data-i18n="bookingTime"></strong>
            <span>${b.startTime} – ${b.endTime}</span>
          </div>
          <div class="detail-row">
            <strong data-i18n="purposeLabel"></strong>
            <span>${b.purpose}</span>
          </div>
          <div class="detail-row">
            <strong data-i18n="bookedBy"></strong>
            <span>${emp ? emp.name : ''}</span>
          </div>
          <div class="detail-row">
            <strong data-i18n="department"></strong>
            <span>${dept ? dept.name : ''}</span>
          </div>
          <div class="detail-row">
            <strong data-i18n="status"></strong>
            <span class="status-badge status-${b.status}">${I18N.t(b.status)}</span>
          </div>
        </div>

        <div class="form-actions">
          <button class="btn btn-danger" onclick="BOOKING.initiateCancelOTP()">
            <span data-i18n="confirmCancel"></span>
          </button>
          <button class="btn btn-secondary" onclick="history.back()">
            <span data-i18n="cancel"></span>
          </button>
        </div>

        <!-- OTP Section -->
        <div id="otp-section" class="otp-section" style="display:none">
          <div class="otp-card">
            <h3>🔐 <span data-i18n="otpTitle"></span></h3>
            <p id="otp-message"></p>
            <div class="otp-input-group">
              <input type="text" id="otp-input" class="otp-input" maxlength="6"
                     placeholder="000000" pattern="[0-9]{6}">
              <button class="btn btn-primary" onclick="BOOKING.verifyOTP()">
                <span data-i18n="otpVerify"></span>
              </button>
            </div>
            <button class="btn btn-link" onclick="BOOKING.resendOTP()">
              <span data-i18n="otpResend"></span>
            </button>
          </div>
        </div>

        <div id="confirmation-section" class="confirmation-section" style="display:none"></div>
      </div>
    `;

    I18N.applyToPage();
  },

  _prefillForm(b) {
    // Set company first
    const compSel = document.getElementById('field-company');
    if (compSel) {
      compSel.value = b.companyId;
      this.onCompanyChange(b.departmentId, b.employeeId);
    }

    const dateFld = document.getElementById('field-date');
    if (dateFld) {
      dateFld.value = b.date;
      this.onDateChange();
    }

    const startFld = document.getElementById('field-start-time');
    if (startFld) startFld.value = b.startTime;

    const endFld = document.getElementById('field-end-time');
    if (endFld) endFld.value = b.endTime;

    this.checkConflicts();
  },

  onCompanyChange(preDept = null, preEmp = null) {
    const companyId = document.getElementById('field-company')?.value;
    const deptSel = document.getElementById('field-department');
    const empSel = document.getElementById('field-employee');

    if (!deptSel || !empSel) return;

    if (!companyId) {
      deptSel.innerHTML = `<option value="">${I18N.t('selectDepartment')}</option>`;
      empSel.innerHTML = `<option value="">${I18N.t('selectEmployee')}</option>`;
      return;
    }

    const depts = DB.getDepartmentsByCompany(companyId);
    deptSel.innerHTML = `<option value="">${I18N.t('selectDepartment')}</option>` +
      depts.map(d => `<option value="${d.id}"${d.id === preDept ? ' selected' : ''}>${d.name}</option>`).join('');

    if (preDept) {
      this.onDepartmentChange(preEmp);
    } else {
      empSel.innerHTML = `<option value="">${I18N.t('selectEmployee')}</option>`;
    }
  },

  onDepartmentChange(preEmp = null) {
    const deptId = document.getElementById('field-department')?.value;
    const empSel = document.getElementById('field-employee');
    if (!empSel) return;

    if (!deptId) {
      empSel.innerHTML = `<option value="">${I18N.t('selectEmployee')}</option>`;
      return;
    }

    const emps = DB.getEmployeesByDepartment(deptId);
    empSel.innerHTML = `<option value="">${I18N.t('selectEmployee')}</option>` +
      emps.map(e => `<option value="${e.id}"${e.id === preEmp ? ' selected' : ''}>${e.name}</option>`).join('');
  },

  onDateChange() {
    const date = document.getElementById('field-date')?.value;
    if (date && this.roomId) {
      this.checkConflicts();
    }
  },

  checkConflicts() {
    const roomId = this.roomId || document.getElementById('field-room')?.value;
    const date = document.getElementById('field-date')?.value;
    const start = document.getElementById('field-start-time')?.value;
    const end = document.getElementById('field-end-time')?.value;

    const warning = document.getElementById('conflict-warning');
    const section = document.getElementById('existing-bookings-section');
    const list = document.getElementById('existing-bookings-list');

    if (!roomId || !date) return;

    // Show existing bookings for that date
    const existing = DB.getAll('bookings').filter(b =>
      b.roomId === roomId && b.date === date && b.status !== 'cancelled'
    );

    if (existing.length > 0 && section && list) {
      section.style.display = 'block';
      list.innerHTML = existing.map(b => {
        const emp = DB.getById('employees', b.employeeId);
        return `
          <div class="existing-booking-item">
            <span class="time">${b.startTime}–${b.endTime}</span>
            <span class="purpose">${b.purpose}</span>
            <span class="booker">${emp ? emp.name : ''}</span>
          </div>
        `;
      }).join('');
    } else if (section) {
      section.style.display = 'none';
    }

    // Check conflict
    if (start && end && start >= end) {
      this.showFieldError('end-time', I18N.t('invalidTime'));
    } else {
      this.clearFieldError('end-time');
    }

    if (start && end && start < end && warning) {
      const conflicts = DB.checkConflicts(roomId, date, start, end, this.bookingId);
      if (conflicts.length > 0) {
        warning.style.display = 'block';
      } else {
        warning.style.display = 'none';
      }
    }
  },

  autoFillFromSession() {
    const session = DB.getSession();
    if (!session) return;

    const compSel = document.getElementById('field-company');
    if (compSel && session.companyId) {
      compSel.value = session.companyId;
      this.onCompanyChange(session.departmentId, session.employeeId);
    }
  },

  onLoginSuccess() {
    this.autoFillFromSession();
  },

  handleSubmit(event) {
    event.preventDefault();
    if (!this.validateForm()) return;

    // Initiate OTP flow
    this.initiateOTP();
  },

  validateForm() {
    let valid = true;

    const fields = [
      { id: 'field-company', key: 'company' },
      { id: 'field-department', key: 'department' },
      { id: 'field-employee', key: 'employees' },
      { id: 'field-date', key: 'date' },
      { id: 'field-start-time', key: 'startTime' },
      { id: 'field-end-time', key: 'endTime' },
      { id: 'field-purpose', key: 'purposeLabel' },
      { id: 'field-attendees', key: 'attendees' },
    ];

    fields.forEach(f => {
      const el = document.getElementById(f.id);
      if (el && !el.value) {
        this.showFieldError(f.id.replace('field-', ''), I18N.t('fieldRequired'));
        valid = false;
      } else if (el) {
        this.clearFieldError(f.id.replace('field-', ''));
      }
    });

    const start = document.getElementById('field-start-time')?.value;
    const end = document.getElementById('field-end-time')?.value;
    if (start && end && start >= end) {
      this.showFieldError('end-time', I18N.t('invalidTime'));
      valid = false;
    }

    const attendees = parseInt(document.getElementById('field-attendees')?.value);
    if (attendees <= 0 || isNaN(attendees)) {
      this.showFieldError('attendees', I18N.t('invalidAttendees'));
      valid = false;
    }

    return valid;
  },

  showFieldError(fieldId, message) {
    const el = document.getElementById(`err-${fieldId}`);
    if (el) { el.textContent = message; el.style.display = 'block'; }
  },

  clearFieldError(fieldId) {
    const el = document.getElementById(`err-${fieldId}`);
    if (el) { el.textContent = ''; el.style.display = 'none'; }
  },

  initiateOTP() {
    const empId = document.getElementById('field-employee')?.value;
    const emp = empId ? DB.getById('employees', empId) : null;

    if (!emp || !emp.email) {
      APP.showToast('Employee email not found', 'error');
      return;
    }

    const otp = OTP.generate();
    this.otpKey = `booking_${Date.now()}`;
    OTP.store(this.otpKey, otp);

    // Send OTP email
    EMAIL.sendOTP(emp.email, otp);

    // Show OTP section
    const section = document.getElementById('otp-section');
    const msg = document.getElementById('otp-message');
    if (section) section.style.display = 'block';
    if (msg) msg.textContent = `${I18N.t('otpMessage')} ${emp.email}`;

    // Hide form submit
    const form = document.getElementById('booking-form');
    if (form) form.querySelector('.form-actions').style.display = 'none';

    section.scrollIntoView({ behavior: 'smooth' });
    APP.showToast(`${I18N.t('emailSentTo')} ${emp.email}`, 'info');
  },

  initiateCancelOTP() {
    const b = this.existingBooking;
    const emp = DB.getById('employees', b.employeeId);

    if (!emp || !emp.email) {
      APP.showToast('Employee email not found', 'error');
      return;
    }

    const otp = OTP.generate();
    this.otpKey = `cancel_${b.id}`;
    OTP.store(this.otpKey, otp);

    EMAIL.sendOTP(emp.email, otp);

    const section = document.getElementById('otp-section');
    const msg = document.getElementById('otp-message');
    if (section) section.style.display = 'block';
    if (msg) msg.textContent = `${I18N.t('otpMessage')} ${emp.email}`;

    section.scrollIntoView({ behavior: 'smooth' });
    APP.showToast(`${I18N.t('emailSentTo')} ${emp.email}`, 'info');
  },

  verifyOTP() {
    const input = document.getElementById('otp-input')?.value?.trim();
    if (!input || input.length !== 6) {
      APP.showToast(I18N.t('errorOTP'), 'error');
      return;
    }

    const result = OTP.verify(this.otpKey, input);

    if (result.expired) {
      APP.showToast(I18N.t('errorOTPExpired'), 'error');
      return;
    }

    if (!result.valid) {
      APP.showToast(I18N.t('errorOTP'), 'error');
      // Flash input
      const otpInput = document.getElementById('otp-input');
      if (otpInput) {
        otpInput.classList.add('shake');
        setTimeout(() => otpInput.classList.remove('shake'), 500);
      }
      return;
    }

    OTP.clear(this.otpKey);

    // Execute the action
    if (this.mode === 'cancel') {
      this.executeCancellation();
    } else if (this.mode === 'edit') {
      this.executeUpdate();
    } else {
      this.executeBooking();
    }
  },

  resendOTP() {
    if (this.mode === 'cancel') {
      this.initiateCancelOTP();
    } else {
      this.initiateOTP();
    }
  },

  executeBooking() {
    const bookingData = this._collectFormData();
    const booking = DB.addBooking(bookingData);
    EMAIL.sendConfirmation(booking);
    this.showConfirmation(booking, 'confirmed');
    APP.showToast(I18N.t('bookingConfirmed'), 'success');
  },

  executeUpdate() {
    const updates = this._collectFormData();
    const booking = DB.updateBooking(this.bookingId, updates);
    EMAIL.sendUpdate(booking);
    this.showConfirmation(booking, 'updated');
    APP.showToast(I18N.t('bookingUpdated'), 'success');
  },

  executeCancellation() {
    const booking = DB.cancelBooking(this.bookingId);
    EMAIL.sendCancellation(booking);
    this.showConfirmation(booking, 'cancelled');
    APP.showToast(I18N.t('bookingCancelled'), 'success');
  },

  _collectFormData() {
    return {
      roomId: this.roomId,
      companyId: document.getElementById('field-company')?.value,
      departmentId: document.getElementById('field-department')?.value,
      employeeId: document.getElementById('field-employee')?.value,
      date: document.getElementById('field-date')?.value,
      startTime: document.getElementById('field-start-time')?.value,
      endTime: document.getElementById('field-end-time')?.value,
      purpose: document.getElementById('field-purpose')?.value,
      attendees: parseInt(document.getElementById('field-attendees')?.value) || 0,
      notes: document.getElementById('field-notes')?.value || '',
    };
  },

  showConfirmation(booking, type) {
    const section = document.getElementById('confirmation-section');
    if (!section) return;

    const otpSection = document.getElementById('otp-section');
    if (otpSection) otpSection.style.display = 'none';

    const room = DB.getById('rooms', booking.roomId);
    const emp = DB.getById('employees', booking.employeeId);
    const msgKey = type === 'confirmed' ? 'bookingConfirmed' :
                   type === 'updated' ? 'bookingUpdated' : 'bookingCancelled';
    const icon = type === 'confirmed' ? '✅' : type === 'updated' ? '✏️' : '🗑️';

    section.style.display = 'block';
    section.innerHTML = `
      <div class="confirmation-card">
        <div class="confirmation-icon">${icon}</div>
        <h2>${I18N.t(msgKey)}</h2>
        ${type !== 'cancelled' ? `
          <div class="confirmation-code">
            <label>${I18N.t('confirmationCode')}</label>
            <span class="code">${booking.confirmationCode}</span>
          </div>
        ` : ''}
        <div class="confirmation-details">
          <div class="detail-row"><strong>${I18N.t('roomInfo')}:</strong> <span>${room ? room.name : ''}</span></div>
          <div class="detail-row"><strong>${I18N.t('date')}:</strong> <span>${APP.formatDate(booking.date)}</span></div>
          <div class="detail-row"><strong>${I18N.t('bookingTime')}:</strong> <span>${booking.startTime} – ${booking.endTime}</span></div>
          <div class="detail-row"><strong>${I18N.t('purposeLabel')}:</strong> <span>${booking.purpose}</span></div>
          ${emp ? `<div class="detail-row"><strong>${I18N.t('bookedBy')}:</strong> <span>${emp.name}</span></div>` : ''}
        </div>
        <div class="confirmation-actions">
          <button class="btn btn-primary"
                  onclick="APP.navigate('calendar.html', {roomId: '${booking.roomId}'})">
            📅 ${I18N.t('viewCalendarBtn')}
          </button>
          <button class="btn btn-secondary" onclick="APP.navigate('index.html')">
            🏠 ${I18N.t('backToHome')}
          </button>
        </div>
      </div>
    `;
    section.scrollIntoView({ behavior: 'smooth' });
  },

  _generateTimeSlots() {
    const slots = [];
    for (let h = 7; h <= 22; h++) {
      slots.push(`${String(h).padStart(2, '0')}:00`);
      if (h < 22) slots.push(`${String(h).padStart(2, '0')}:30`);
    }
    return slots;
  },

  _esc(str) {
    return String(str).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  },

  onLangChange() {
    // Re-render to update translations
    this.renderPage();
  }
};
