/**
 * reports.js - Reports Generation
 */

const REPORTS = {
  activeTab: 'my-bookings',
  chartInstance: null,

  init() {
    APP.init();
    document.title = `${I18N.t('reportsPage')} - ${I18N.t('appName')}`;
    this.showTab('my-bookings');
  },

  showTab(tab) {
    this.activeTab = tab;
    document.querySelectorAll('.report-tab').forEach(t => {
      t.classList.toggle('active', t.getAttribute('data-tab') === tab);
    });
    document.querySelectorAll('.report-panel').forEach(p => {
      p.style.display = p.id === `panel-${tab}` ? 'block' : 'none';
    });

    if (tab === 'my-bookings') this.renderMyBookings();
    else if (tab === 'room-history') this.renderRoomHistory();
    else if (tab === 'utilization') this.renderUtilization();
  },

  // ─── My Bookings ──────────────────────────────────────────────────────────

  renderMyBookings() {
    const session = DB.getSession();
    const container = document.getElementById('my-bookings-table');
    if (!container) return;

    if (!session) {
      container.innerHTML = `<p class="no-data">${I18N.t('loginRequired')}</p>`;
      return;
    }

    const from = document.getElementById('my-from')?.value || '';
    const to = document.getElementById('my-to')?.value || '';
    const status = document.getElementById('my-status')?.value || '';

    let bookings = DB.getBookingsByEmployee(session.employeeId);
    if (from) bookings = bookings.filter(b => b.date >= from);
    if (to) bookings = bookings.filter(b => b.date <= to);
    if (status) bookings = bookings.filter(b => b.status === status);
    bookings.sort((a, b) => b.date.localeCompare(a.date));

    if (bookings.length === 0) {
      container.innerHTML = `<p class="no-data">${I18N.t('noData')}</p>`;
      return;
    }

    container.innerHTML = `
      <table class="data-table" id="my-bookings-tbl">
        <thead>
          <tr>
            <th>${I18N.t('date')}</th>
            <th>${I18N.t('roomInfo')}</th>
            <th>${I18N.t('bookingTime')}</th>
            <th>${I18N.t('purposeLabel')}</th>
            <th>${I18N.t('status')}</th>
            <th>${I18N.t('actions')}</th>
          </tr>
        </thead>
        <tbody>
          ${bookings.map(b => {
            const room = DB.getById('rooms', b.roomId);
            return `
              <tr>
                <td>${APP.formatDate(b.date)}</td>
                <td>${room ? room.name : b.roomId}</td>
                <td>${b.startTime}–${b.endTime}</td>
                <td>${b.purpose}</td>
                <td><span class="status-badge status-${b.status}">${I18N.t(b.status)}</span></td>
                <td class="actions-cell">
                  ${b.status !== 'cancelled' ? `
                    <button class="btn btn-sm btn-outline" title="Edit"
                            onclick="APP.navigate('booking.html', {bookingId:'${b.id}',action:'edit'})">✏️</button>
                    <button class="btn btn-sm btn-danger" title="Cancel"
                            onclick="APP.navigate('booking.html', {bookingId:'${b.id}',action:'cancel'})">🗑️</button>
                  ` : '–'}
                </td>
              </tr>
            `;
          }).join('')}
        </tbody>
      </table>
    `;
  },

  // ─── Room History (Admin) ─────────────────────────────────────────────────

  renderRoomHistory() {
    const container = document.getElementById('room-history-table');
    if (!container) return;

    const session = DB.getSession();
    const isAdmin = session && DB.isAdmin();

    // Populate room filter
    const roomFilter = document.getElementById('hist-room');
    if (roomFilter && roomFilter.options.length <= 1) {
      let rooms = DB.getAll('rooms');
      if (isAdmin && session) {
        // Show only rooms the admin manages
        const adminRecord = DB.getAdminByEmployee(session.employeeId);
        if (adminRecord) rooms = rooms.filter(r => adminRecord.rooms.includes(r.id));
      }
      roomFilter.innerHTML = `<option value="">${I18N.t('all')}</option>` +
        rooms.map(r => `<option value="${r.id}">${r.name}</option>`).join('');
    }

    // Populate dept filter
    const deptFilter = document.getElementById('hist-dept');
    if (deptFilter && deptFilter.options.length <= 1 && session) {
      const depts = DB.getDepartmentsByCompany(session.companyId);
      deptFilter.innerHTML = `<option value="">${I18N.t('all')}</option>` +
        depts.map(d => `<option value="${d.id}">${d.name}</option>`).join('');
    }

    const from = document.getElementById('hist-from')?.value || '';
    const to = document.getElementById('hist-to')?.value || '';
    const roomId = document.getElementById('hist-room')?.value || '';
    const deptId = document.getElementById('hist-dept')?.value || '';
    const status = document.getElementById('hist-status')?.value || '';

    const filters = {};
    if (roomId) filters.roomId = roomId;
    if (deptId) filters.departmentId = deptId;
    if (status) filters.status = status;
    if (session && !isAdmin) filters.companyId = session.companyId;

    let bookings = DB.getBookingsInRange(from || null, to || null, filters);

    // Admin: filter to their rooms only
    if (isAdmin && session) {
      const adminRecord = DB.getAdminByEmployee(session.employeeId);
      if (adminRecord) {
        bookings = bookings.filter(b => adminRecord.rooms.includes(b.roomId));
      }
    }

    bookings.sort((a, b) => b.date.localeCompare(a.date));

    const total = bookings.length;
    const active = bookings.filter(b => b.status !== 'cancelled').length;
    const cancelled = bookings.filter(b => b.status === 'cancelled').length;

    // Update stats
    const statsDiv = document.getElementById('hist-stats');
    if (statsDiv) {
      statsDiv.innerHTML = `
        <div class="stat-card"><span class="stat-num">${total}</span><span>${I18N.t('totalBookings')}</span></div>
        <div class="stat-card"><span class="stat-num">${active}</span><span>${I18N.t('activeBookings')}</span></div>
        <div class="stat-card stat-cancelled"><span class="stat-num">${cancelled}</span><span>${I18N.t('cancelledBookings')}</span></div>
      `;
    }

    if (bookings.length === 0) {
      container.innerHTML = `<p class="no-data">${I18N.t('noData')}</p>`;
      return;
    }

    container.innerHTML = `
      <table class="data-table" id="hist-tbl">
        <thead>
          <tr>
            <th>${I18N.t('date')}</th>
            <th>${I18N.t('roomInfo')}</th>
            <th>${I18N.t('bookingTime')}</th>
            <th>${I18N.t('bookedBy')}</th>
            <th>${I18N.t('department')}</th>
            <th>${I18N.t('purposeLabel')}</th>
            <th>${I18N.t('status')}</th>
          </tr>
        </thead>
        <tbody>
          ${bookings.map(b => {
            const room = DB.getById('rooms', b.roomId);
            const emp = DB.getById('employees', b.employeeId);
            const dept = DB.getById('departments', b.departmentId);
            return `
              <tr>
                <td>${APP.formatDate(b.date)}</td>
                <td>${room ? room.name : b.roomId}</td>
                <td>${b.startTime}–${b.endTime}</td>
                <td>${emp ? emp.name : ''}</td>
                <td>${dept ? dept.name : ''}</td>
                <td>${b.purpose}</td>
                <td><span class="status-badge status-${b.status}">${I18N.t(b.status)}</span></td>
              </tr>
            `;
          }).join('')}
        </tbody>
      </table>
    `;
  },

  // ─── Utilization Report ───────────────────────────────────────────────────

  renderUtilization() {
    const container = document.getElementById('utilization-chart-area');
    if (!container) return;

    const session = DB.getSession();
    let rooms = DB.getAll('rooms');

    if (session && DB.isAdmin()) {
      const adminRecord = DB.getAdminByEmployee(session.employeeId);
      if (adminRecord) rooms = rooms.filter(r => adminRecord.rooms.includes(r.id));
    } else if (session) {
      rooms = rooms.filter(r => r.companyId === session.companyId);
    }

    const now = new Date();
    const months = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push({ year: d.getFullYear(), month: d.getMonth() });
    }

    const monthLabels = months.map(m => {
      const names = I18N.t('months');
      return `${names[m.month]} ${m.year}`;
    });

    // Generate dataset per room
    const datasets = rooms.slice(0, 5).map((room, idx) => {
      const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];
      const data = months.map(m => DB.getUtilizationByMonth(room.id, m.year, m.month));
      return {
        label: room.name,
        data,
        backgroundColor: colors[idx % colors.length] + '99',
        borderColor: colors[idx % colors.length],
        borderWidth: 2,
      };
    });

    container.innerHTML = '<canvas id="util-chart"></canvas>';

    if (typeof Chart === 'undefined') {
      container.innerHTML = '<p class="no-data">Chart.js not loaded.</p>';
      return;
    }

    if (this.chartInstance) this.chartInstance.destroy();

    const ctx = document.getElementById('util-chart').getContext('2d');
    this.chartInstance = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: monthLabels,
        datasets,
      },
      options: {
        responsive: true,
        plugins: {
          legend: { position: 'top' },
          title: {
            display: true,
            text: I18N.t('utilization'),
          },
          tooltip: {
            callbacks: {
              label: (ctx) => `${ctx.dataset.label}: ${ctx.parsed.y}%`
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            max: 100,
            ticks: {
              callback: (val) => `${val}%`
            }
          }
        }
      }
    });
  },

  // ─── Export ───────────────────────────────────────────────────────────────

  exportCSV(tableId) {
    const table = document.getElementById(tableId);
    if (!table) { APP.showToast(I18N.t('noData'), 'warning'); return; }

    const rows = [];
    table.querySelectorAll('tr').forEach(row => {
      const cols = [...row.querySelectorAll('th, td')].map(cell => {
        // Get text content, remove inner HTML badges
        return `"${cell.textContent.trim().replace(/"/g, '""')}"`;
      });
      rows.push(cols.join(','));
    });

    const csv = rows.join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `report_${this.activeTab}_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  },

  printReport() {
    window.print();
  },

  onLangChange() {
    // Re-apply translations to static elements
    I18N.applyToPage();
    // Re-render current active tab content
    const activeTab = document.querySelector('.report-tab.active');
    if (activeTab) {
      const tabName = activeTab.getAttribute('data-tab');
      this.showTab(tabName);
    }
  },
};
