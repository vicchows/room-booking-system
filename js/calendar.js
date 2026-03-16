/**
 * calendar.js - Calendar Rendering & Interaction
 */

const CALENDAR = {
  roomId: null,
  room: null,
  currentYear: null,
  currentMonth: null,
  selectedDate: null,

  init() {
    APP.init();
    const params = APP.getParams();
    this.roomId = params.roomId;

    if (!this.roomId) {
      APP.showToast('No room selected', 'error');
      setTimeout(() => APP.navigate('index.html'), 1500);
      return;
    }

    this.room = DB.getById('rooms', this.roomId);
    if (!this.room) {
      APP.showToast('Room not found', 'error');
      setTimeout(() => APP.navigate('index.html'), 1500);
      return;
    }

    const now = new Date();
    this.currentYear = now.getFullYear();
    this.currentMonth = now.getMonth();

    this.renderRoomHeader();
    this.render();
    document.title = `${this.room.name} - ${I18N.t('appName')}`;
  },

  renderRoomHeader() {
    const header = document.getElementById('room-header');
    if (!header || !this.room) return;

    const allEquip = DB.getAll('equipment');
    const lang = I18N.currentLang;
    const equipHtml = (this.room.equipment || []).map(eqId => {
      const eq = allEquip.find(e => e.id === eqId);
      if (!eq) return '';
      return `<span class="equipment-badge" title="${DB.getEquipmentName(eq, lang)}">${eq.icon} ${DB.getEquipmentName(eq, lang)}</span>`;
    }).join('');

    header.innerHTML = `
      <div class="room-header-info">
        <h2>🏢 ${this.room.name}</h2>
        <div class="room-meta">
          <span>📍 ${this.room.location}</span>
          <span>👥 ${this.room.capacity} ${I18N.t('persons')}</span>
        </div>
        <div class="equipment-list">${equipHtml}</div>
      </div>
      <div class="room-header-legend">
        <span class="legend-item"><span class="dot dot-available"></span> ${I18N.t('available')}</span>
        <span class="legend-item"><span class="dot dot-partial"></span> ${I18N.t('partiallyBooked')}</span>
        <span class="legend-item"><span class="dot dot-full"></span> ${I18N.t('fullyBooked')}</span>
      </div>
    `;
  },

  render() {
    this.renderHeader();
    this.renderGrid();
    if (this.selectedDate) {
      this.renderDayPanel(this.selectedDate);
    } else {
      this.renderEmptyPanel();
    }
  },

  renderHeader() {
    const monthLabel = document.getElementById('calendar-month-label');
    if (!monthLabel) return;
    const months = I18N.t('months');
    monthLabel.textContent = `${months[this.currentMonth]} ${this.currentYear}`;
  },

  renderGrid() {
    const grid = document.getElementById('calendar-grid');
    if (!grid) return;

    const days = I18N.t('days');

    // Build day headers
    let html = `<div class="calendar-days-header">`;
    days.forEach(d => {
      html += `<div class="calendar-day-name">${d}</div>`;
    });
    html += `</div><div class="calendar-days-grid">`;

    // First day of month
    const firstDay = new Date(this.currentYear, this.currentMonth, 1).getDay();
    // Days in month
    const daysInMonth = new Date(this.currentYear, this.currentMonth + 1, 0).getDate();
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];

    // Empty cells before first day
    for (let i = 0; i < firstDay; i++) {
      html += `<div class="calendar-day empty"></div>`;
    }

    // Day cells
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${this.currentYear}-${String(this.currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const status = DB.getDayStatus(this.roomId, dateStr);
      const bookings = DB.getBookingsByRoomAndDate(this.roomId, dateStr);
      const isToday = dateStr === todayStr;
      const isSelected = dateStr === this.selectedDate;

      let cssClass = 'calendar-day';
      if (isToday) cssClass += ' today';
      if (isSelected) cssClass += ' selected';
      if (status === 'full') cssClass += ' full';
      else if (status === 'partial') cssClass += ' partial';
      else cssClass += ' available';

      html += `
        <div class="${cssClass}" onclick="CALENDAR.selectDay('${dateStr}')">
          <span class="day-number">${day}</span>
          ${bookings.length > 0 ? `<span class="booking-count">${bookings.length}</span>` : ''}
          <span class="status-dot status-dot-${status}"></span>
        </div>
      `;
    }

    html += `</div>`;
    grid.innerHTML = html;
  },

  selectDay(dateStr) {
    this.selectedDate = dateStr;
    this.renderGrid(); // Re-render to update selected state
    this.renderDayPanel(dateStr);
  },

  renderDayPanel(dateStr) {
    const panel = document.getElementById('day-panel');
    if (!panel) return;

    const bookings = DB.getBookingsByRoomAndDate(this.roomId, dateStr);
    const allBookings = DB.getAll('bookings').filter(b =>
      b.roomId === this.roomId && b.date === dateStr
    );
    const displayDate = APP.formatDate(dateStr);

    let bookingsHtml = '';
    if (allBookings.length === 0) {
      bookingsHtml = `<p class="no-bookings">${I18N.t('noBookings')}</p>`;
    } else {
      bookingsHtml = allBookings.map(b => {
        const emp = DB.getById('employees', b.employeeId);
        const dept = DB.getById('departments', b.departmentId);
        const statusClass = b.status === 'confirmed' ? 'status-confirmed' :
                           b.status === 'cancelled' ? 'status-cancelled' : 'status-pending';
        return `
          <div class="booking-item ${b.status === 'cancelled' ? 'cancelled' : ''}">
            <div class="booking-time">${b.startTime} – ${b.endTime}</div>
            <div class="booking-details">
              <div class="booking-purpose">${b.purpose}</div>
              <div class="booking-meta">
                <span>👤 ${emp ? emp.name : b.employeeId}</span>
                <span>🏢 ${dept ? dept.name : ''}</span>
              </div>
              <span class="status-badge ${statusClass}">${I18N.t(b.status)}</span>
            </div>
            <div class="booking-actions">
              ${b.status !== 'cancelled' ? `
                <button class="btn btn-sm btn-outline" onclick="APP.navigate('booking.html', {bookingId: '${b.id}', action: 'edit'})">✏️</button>
                <button class="btn btn-sm btn-danger" onclick="APP.navigate('booking.html', {bookingId: '${b.id}', action: 'cancel'})">🗑️</button>
              ` : ''}
            </div>
          </div>
        `;
      }).join('');
    }

    panel.innerHTML = `
      <div class="day-panel-header">
        <h3>${I18N.t('bookingsOnDay')} ${displayDate}</h3>
        <button class="btn btn-primary btn-new-booking"
                onclick="APP.navigate('booking.html', {roomId: '${this.roomId}', date: '${dateStr}'})">
          ${I18N.t('newBooking')}
        </button>
      </div>
      <div class="bookings-list">${bookingsHtml}</div>
    `;
  },

  renderEmptyPanel() {
    const panel = document.getElementById('day-panel');
    if (!panel) return;
    panel.innerHTML = `
      <div class="day-panel-placeholder">
        <span class="placeholder-icon">📅</span>
        <p>${I18N.t('selectDay')}</p>
      </div>
    `;
  },

  prevMonth() {
    this.currentMonth--;
    if (this.currentMonth < 0) {
      this.currentMonth = 11;
      this.currentYear--;
    }
    this.selectedDate = null;
    this.render();
  },

  nextMonth() {
    this.currentMonth++;
    if (this.currentMonth > 11) {
      this.currentMonth = 0;
      this.currentYear++;
    }
    this.selectedDate = null;
    this.render();
  },

  goToday() {
    const now = new Date();
    this.currentYear = now.getFullYear();
    this.currentMonth = now.getMonth();
    this.selectedDate = now.toISOString().split('T')[0];
    this.render();
  }
};
