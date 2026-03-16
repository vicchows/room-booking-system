/**
 * data.js - Master Data & localStorage Management
 * Handles all CRUD operations for the room booking system
 */

const DB = {
  // Storage keys
  KEYS: {
    COMPANIES: 'rbs_companies',
    ROOMS: 'rbs_rooms',
    DEPARTMENTS: 'rbs_departments',
    EMPLOYEES: 'rbs_employees',
    EQUIPMENT: 'rbs_equipment',
    ADMINS: 'rbs_admins',
    BOOKINGS: 'rbs_bookings',
    INITIALIZED: 'rbs_initialized',
    EMAIL_LOG: 'rbs_email_log',
    SESSION: 'rbs_session',
  },

  /**
   * Initialize sample data on first run
   */
  init() {
    if (!localStorage.getItem(this.KEYS.INITIALIZED)) {
      this.saveAll('companies', SAMPLE_DATA.companies);
      this.saveAll('rooms', SAMPLE_DATA.rooms);
      this.saveAll('departments', SAMPLE_DATA.departments);
      this.saveAll('employees', SAMPLE_DATA.employees);
      this.saveAll('equipment', SAMPLE_DATA.equipment);
      this.saveAll('admins', SAMPLE_DATA.admins);
      const bookings = SAMPLE_DATA.generateSampleBookings();
      this.saveAll('bookings', bookings);
      localStorage.setItem(this.KEYS.INITIALIZED, '1');
    }
  },

  /**
   * Reset all data to sample data
   */
  reset() {
    Object.values(this.KEYS).forEach(key => localStorage.removeItem(key));
    this.init();
  },

  // ─── Generic CRUD ───────────────────────────────────────────────────────────

  getAll(entity) {
    const key = this.KEYS[entity.toUpperCase()];
    try {
      return JSON.parse(localStorage.getItem(key) || '[]');
    } catch (e) {
      return [];
    }
  },

  saveAll(entity, data) {
    const key = this.KEYS[entity.toUpperCase()];
    localStorage.setItem(key, JSON.stringify(data));
  },

  getById(entity, id) {
    return this.getAll(entity).find(item => item.id === id) || null;
  },

  add(entity, item) {
    const items = this.getAll(entity);
    if (!item.id) {
      item.id = this.generateId(entity);
    }
    items.push(item);
    this.saveAll(entity, items);
    return item;
  },

  update(entity, id, updates) {
    const items = this.getAll(entity);
    const idx = items.findIndex(item => item.id === id);
    if (idx === -1) return null;
    items[idx] = { ...items[idx], ...updates };
    this.saveAll(entity, items);
    return items[idx];
  },

  remove(entity, id) {
    const items = this.getAll(entity).filter(item => item.id !== id);
    this.saveAll(entity, items);
  },

  generateId(entity) {
    const prefix = entity.charAt(0).toLowerCase();
    return `${prefix}${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
  },

  // ─── Company queries ─────────────────────────────────────────────────────────

  getCompaniesByCountry(countryCode) {
    return this.getAll('companies').filter(c => c.country === countryCode);
  },

  getCountries() {
    const companies = this.getAll('companies');
    const countryMap = {
      HK: { code: 'HK', name: 'Hong Kong', flag: '🇭🇰' },
      TH: { code: 'TH', name: 'Thailand', flag: '🇹🇭' },
      KH: { code: 'KH', name: 'Cambodia', flag: '🇰🇭' },
      FR: { code: 'FR', name: 'France', flag: '🇫🇷' },
      ES: { code: 'ES', name: 'Spain', flag: '🇪🇸' },
    };
    const codes = [...new Set(companies.map(c => c.country))];
    return codes.map(code => countryMap[code] || { code, name: code, flag: '🌐' });
  },

  // ─── Room queries ─────────────────────────────────────────────────────────

  getRoomsByCompany(companyId) {
    return this.getAll('rooms').filter(r => r.companyId === companyId);
  },

  // ─── Department queries ───────────────────────────────────────────────────

  getDepartmentsByCompany(companyId) {
    return this.getAll('departments').filter(d => d.companyId === companyId);
  },

  // ─── Employee queries ─────────────────────────────────────────────────────

  getEmployeesByCompany(companyId) {
    return this.getAll('employees').filter(e => e.companyId === companyId);
  },

  getEmployeesByDepartment(departmentId) {
    return this.getAll('employees').filter(e => e.departmentId === departmentId);
  },

  getEmployeeByM365(m365Account) {
    return this.getAll('employees').find(e =>
      e.microsoft365Account && e.microsoft365Account.toLowerCase() === m365Account.toLowerCase()
    ) || null;
  },

  // ─── Booking queries ──────────────────────────────────────────────────────

  getBookingsByRoom(roomId) {
    return this.getAll('bookings').filter(b => b.roomId === roomId);
  },

  getBookingsByRoomAndDate(roomId, date) {
    return this.getAll('bookings').filter(b =>
      b.roomId === roomId && b.date === date && b.status !== 'cancelled'
    );
  },

  getBookingsByEmployee(employeeId) {
    return this.getAll('bookings').filter(b => b.employeeId === employeeId);
  },

  getBookingsByCompany(companyId) {
    return this.getAll('bookings').filter(b => b.companyId === companyId);
  },

  /**
   * Check for time conflicts in a room on a date
   * Returns conflicting bookings (excludes the given bookingId if editing)
   */
  checkConflicts(roomId, date, startTime, endTime, excludeBookingId = null) {
    const bookings = this.getBookingsByRoomAndDate(roomId, date);
    return bookings.filter(b => {
      if (excludeBookingId && b.id === excludeBookingId) return false;
      // Check overlap: b.start < endTime && b.end > startTime
      return b.startTime < endTime && b.endTime > startTime;
    });
  },

  /**
   * Get day status for a room: 'available', 'partial', 'full'
   * Uses 07:00-22:00 as operating hours (30-min slots = 30 slots)
   */
  getDayStatus(roomId, date) {
    const bookings = this.getBookingsByRoomAndDate(roomId, date);
    if (bookings.length === 0) return 'available';

    // Calculate total booked minutes
    let bookedMinutes = 0;
    bookings.forEach(b => {
      const [sh, sm] = b.startTime.split(':').map(Number);
      const [eh, em] = b.endTime.split(':').map(Number);
      bookedMinutes += (eh * 60 + em) - (sh * 60 + sm);
    });

    const totalMinutes = (22 - 7) * 60; // 900 minutes
    if (bookedMinutes >= totalMinutes) return 'full';
    if (bookedMinutes > 0) return 'partial';
    return 'available';
  },

  /**
   * Add a new booking
   */
  addBooking(bookingData) {
    const booking = {
      ...bookingData,
      id: this.generateId('bookings'),
      status: 'confirmed',
      confirmationCode: String(100000 + Math.floor(Math.random() * 900000)),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    return this.add('bookings', booking);
  },

  /**
   * Update booking
   */
  updateBooking(id, updates) {
    return this.update('bookings', id, {
      ...updates,
      updatedAt: new Date().toISOString(),
    });
  },

  /**
   * Cancel booking
   */
  cancelBooking(id) {
    return this.update('bookings', id, {
      status: 'cancelled',
      updatedAt: new Date().toISOString(),
    });
  },

  // ─── Admin queries ────────────────────────────────────────────────────────

  getAdminByEmployee(employeeId) {
    return this.getAll('admins').find(a => a.employeeId === employeeId) || null;
  },

  getAdminsByCompany(companyId) {
    const admins = this.getAll('admins').filter(a => a.companyId === companyId);
    return admins.map(a => {
      const emp = this.getById('employees', a.employeeId);
      return { ...a, employee: emp };
    });
  },

  getRoomAdmins(roomId) {
    const admins = this.getAll('admins').filter(a =>
      a.rooms && a.rooms.includes(roomId)
    );
    return admins.map(a => {
      const emp = this.getById('employees', a.employeeId);
      return { ...a, employee: emp };
    });
  },

  // ─── Session management ───────────────────────────────────────────────────

  getSession() {
    try {
      return JSON.parse(localStorage.getItem(this.KEYS.SESSION) || 'null');
    } catch (e) {
      return null;
    }
  },

  setSession(data) {
    localStorage.setItem(this.KEYS.SESSION, JSON.stringify(data));
  },

  clearSession() {
    localStorage.removeItem(this.KEYS.SESSION);
  },

  isAdmin() {
    const session = this.getSession();
    if (!session) return false;
    const employee = this.getById('employees', session.employeeId);
    return employee && employee.isAdmin;
  },

  // ─── Email log ────────────────────────────────────────────────────────────

  logEmail(emailData) {
    const logs = JSON.parse(localStorage.getItem(this.KEYS.EMAIL_LOG) || '[]');
    logs.push({
      ...emailData,
      timestamp: new Date().toISOString(),
    });
    // Keep last 100 emails
    if (logs.length > 100) logs.shift();
    localStorage.setItem(this.KEYS.EMAIL_LOG, JSON.stringify(logs));
  },

  getEmailLog() {
    return JSON.parse(localStorage.getItem(this.KEYS.EMAIL_LOG) || '[]');
  },

  // ─── Equipment helpers ────────────────────────────────────────────────────

  getEquipmentName(eq, lang) {
    if (!eq || !eq.name) return '';
    return eq.name[lang] || eq.name['en'] || '';
  },

  getEquipmentByIds(ids, lang) {
    const allEquip = this.getAll('equipment');
    return ids.map(id => allEquip.find(e => e.id === id)).filter(Boolean);
  },

  // ─── Reports helpers ──────────────────────────────────────────────────────

  getBookingsInRange(startDate, endDate, filters = {}) {
    let bookings = this.getAll('bookings');
    if (startDate) bookings = bookings.filter(b => b.date >= startDate);
    if (endDate) bookings = bookings.filter(b => b.date <= endDate);
    if (filters.roomId) bookings = bookings.filter(b => b.roomId === filters.roomId);
    if (filters.companyId) bookings = bookings.filter(b => b.companyId === filters.companyId);
    if (filters.departmentId) bookings = bookings.filter(b => b.departmentId === filters.departmentId);
    if (filters.employeeId) bookings = bookings.filter(b => b.employeeId === filters.employeeId);
    if (filters.status) bookings = bookings.filter(b => b.status === filters.status);
    return bookings;
  },

  getUtilizationByMonth(roomId, year, month) {
    const monthStr = `${year}-${String(month + 1).padStart(2, '0')}`;
    const bookings = this.getAll('bookings').filter(b =>
      b.roomId === roomId && b.date.startsWith(monthStr) && b.status !== 'cancelled'
    );

    let totalBookedMinutes = 0;
    bookings.forEach(b => {
      const [sh, sm] = b.startTime.split(':').map(Number);
      const [eh, em] = b.endTime.split(':').map(Number);
      totalBookedMinutes += (eh * 60 + em) - (sh * 60 + sm);
    });

    // Working days in month (approx 22)
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const workingDays = Math.floor(daysInMonth * 5 / 7);
    const totalAvailableMinutes = workingDays * (22 - 7) * 60;

    return totalAvailableMinutes > 0
      ? Math.min(100, Math.round((totalBookedMinutes / totalAvailableMinutes) * 100))
      : 0;
  }
};
