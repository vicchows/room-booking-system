/**
 * email.js - Email Simulation Module
 * Since this is a static HTML system, emails are simulated by:
 * 1. Opening a mailto: link
 * 2. Showing a modal with email content
 * 3. Logging to localStorage
 */

const EMAIL = {

  /**
   * Get email template based on type and language
   */
  getTemplate(type, data, lang) {
    lang = lang || I18N.currentLang || 'en';
    const t = (key) => I18N.t(key);

    const templates = {
      'otp': {
        subject: `[${t('appName')}] ${t('otpTitle')} - Verification Code`,
        body: (d) => `
${t('appName')}
${'='.repeat(50)}

${t('otpMessage')} ${d.email}

${t('otpTitle')}:

    ┌─────────────────┐
    │   ${d.otp}   │
    └─────────────────┘

This code is valid for 10 minutes.

If you did not request this code, please ignore this email.

---
${t('appName')}
        `.trim()
      },

      'confirmation': {
        subject: `[${t('appName')}] ${t('bookingConfirmed')} - ${data.confirmationCode || ''}`,
        body: (d) => `
${t('appName')}
${'='.repeat(50)}

${t('bookingConfirmed')}

${t('confirmationCode')}: ${d.confirmationCode}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  ${t('roomInfo')}: ${d.roomName}
  ${t('date')}: ${d.date}
  ${t('startTime')}: ${d.startTime}
  ${t('endTime')}: ${d.endTime}
  ${t('purposeLabel')}: ${d.purpose}
  ${t('attendees')}: ${d.attendees}
  ${t('bookedBy')}: ${d.employeeName}
  ${t('department')}: ${d.departmentName}
  ${t('company')}: ${d.companyName}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

${d.notes ? `${t('notes')}: ${d.notes}\n` : ''}

---
${t('appName')}
        `.trim()
      },

      'update': {
        subject: `[${t('appName')}] ${t('bookingUpdated')} - ${data.confirmationCode || ''}`,
        body: (d) => `
${t('appName')}
${'='.repeat(50)}

${t('bookingUpdated')}

${t('confirmationCode')}: ${d.confirmationCode}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  ${t('roomInfo')}: ${d.roomName}
  ${t('date')}: ${d.date}
  ${t('startTime')}: ${d.startTime}
  ${t('endTime')}: ${d.endTime}
  ${t('purposeLabel')}: ${d.purpose}
  ${t('attendees')}: ${d.attendees}
  ${t('bookedBy')}: ${d.employeeName}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

---
${t('appName')}
        `.trim()
      },

      'cancellation': {
        subject: `[${t('appName')}] ${t('bookingCancelled')} - ${data.confirmationCode || ''}`,
        body: (d) => `
${t('appName')}
${'='.repeat(50)}

${t('bookingCancelled')}

${t('confirmationCode')}: ${d.confirmationCode}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  ${t('roomInfo')}: ${d.roomName}
  ${t('date')}: ${d.date}
  ${t('startTime')}: ${d.startTime}
  ${t('endTime')}: ${d.endTime}
  ${t('purposeLabel')}: ${d.purpose}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

---
${t('appName')}
        `.trim()
      }
    };

    const template = templates[type];
    if (!template) return null;
    return {
      subject: template.subject,
      body: template.body(data)
    };
  },

  /**
   * Send OTP email
   */
  sendOTP(email, otp) {
    const data = { email, otp };
    const tpl = this.getTemplate('otp', data);
    this._send([email], tpl.subject, tpl.body);
  },

  /**
   * Send booking confirmation email
   */
  sendConfirmation(booking) {
    const emailData = this._buildEmailData(booking);
    const tpl = this.getTemplate('confirmation', emailData);
    const recipients = this._getRecipients(booking);
    this._send(recipients, tpl.subject, tpl.body);
  },

  /**
   * Send booking update email
   */
  sendUpdate(booking) {
    const emailData = this._buildEmailData(booking);
    const tpl = this.getTemplate('update', emailData);
    const recipients = this._getRecipients(booking);
    this._send(recipients, tpl.subject, tpl.body);
  },

  /**
   * Send cancellation email
   */
  sendCancellation(booking) {
    const emailData = this._buildEmailData(booking);
    const tpl = this.getTemplate('cancellation', emailData);
    const recipients = this._getRecipients(booking);
    this._send(recipients, tpl.subject, tpl.body);
  },

  /**
   * Build email data from booking
   */
  _buildEmailData(booking) {
    const room = DB.getById('rooms', booking.roomId);
    const employee = DB.getById('employees', booking.employeeId);
    const department = DB.getById('departments', booking.departmentId);
    const company = DB.getById('companies', booking.companyId);

    return {
      confirmationCode: booking.confirmationCode,
      roomName: room ? room.name : booking.roomId,
      date: booking.date,
      startTime: booking.startTime,
      endTime: booking.endTime,
      purpose: booking.purpose,
      attendees: booking.attendees,
      notes: booking.notes,
      employeeName: employee ? employee.name : '',
      employeeEmail: employee ? employee.email : '',
      departmentName: department ? department.name : '',
      companyName: company ? company.name : '',
    };
  },

  /**
   * Get recipients (booker + room admins)
   */
  _getRecipients(booking) {
    const employee = DB.getById('employees', booking.employeeId);
    const emails = [];
    if (employee && employee.email) emails.push(employee.email);

    const roomAdmins = DB.getRoomAdmins(booking.roomId);
    roomAdmins.forEach(admin => {
      if (admin.employee && admin.employee.email && !emails.includes(admin.employee.email)) {
        emails.push(admin.employee.email);
      }
    });

    return emails;
  },

  /**
   * Actually "send" the email - open mailto and show modal
   */
  _send(recipients, subject, body) {
    // Log to localStorage
    DB.logEmail({ to: recipients, subject, body });

    // Show email modal
    this._showEmailModal(recipients, subject, body);
  },

  /**
   * Show email preview modal
   */
  _showEmailModal(recipients, subject, body) {
    // Remove existing modal if any
    const existing = document.getElementById('email-modal');
    if (existing) existing.remove();

    const modal = document.createElement('div');
    modal.id = 'email-modal';
    modal.className = 'modal-overlay';
    modal.innerHTML = `
      <div class="modal-content email-modal-content">
        <div class="modal-header">
          <h3>📧 ${I18N.t('viewEmail')}</h3>
          <button class="modal-close" onclick="document.getElementById('email-modal').remove()">×</button>
        </div>
        <div class="modal-body">
          <div class="email-field"><strong>To:</strong> ${recipients.join(', ')}</div>
          <div class="email-field"><strong>Subject:</strong> ${subject}</div>
          <hr>
          <pre class="email-body">${this._escapeHtml(body)}</pre>
        </div>
        <div class="modal-footer">
          <a href="mailto:${recipients.join(',')}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}"
             class="btn btn-primary" target="_blank">
            📤 ${I18N.t('loginM365') ? 'Open in Email Client' : 'Open'}
          </a>
          <button class="btn btn-secondary" onclick="document.getElementById('email-modal').remove()">
            ${I18N.t('closeModal')}
          </button>
        </div>
      </div>
    `;
    document.body.appendChild(modal);

    // Close on overlay click
    modal.addEventListener('click', (e) => {
      if (e.target === modal) modal.remove();
    });
  },

  _escapeHtml(text) {
    const div = document.createElement('div');
    div.appendChild(document.createTextNode(text));
    return div.innerHTML;
  }
};

// ─── OTP Management ───────────────────────────────────────────────────────────

const OTP = {
  EXPIRY_MS: 10 * 60 * 1000, // 10 minutes

  generate() {
    return String(100000 + Math.floor(Math.random() * 900000));
  },

  store(key, otp) {
    sessionStorage.setItem(`otp_${key}`, JSON.stringify({
      code: otp,
      expires: Date.now() + this.EXPIRY_MS
    }));
  },

  verify(key, inputCode) {
    const raw = sessionStorage.getItem(`otp_${key}`);
    if (!raw) return { valid: false, expired: false };
    try {
      const { code, expires } = JSON.parse(raw);
      if (Date.now() > expires) {
        sessionStorage.removeItem(`otp_${key}`);
        return { valid: false, expired: true };
      }
      return { valid: code === inputCode, expired: false };
    } catch (e) {
      return { valid: false, expired: false };
    }
  },

  clear(key) {
    sessionStorage.removeItem(`otp_${key}`);
  }
};
