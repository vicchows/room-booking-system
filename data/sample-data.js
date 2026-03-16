/**
 * sample-data.js - Pre-loaded Sample Master Data
 * This file contains sample data that is loaded into localStorage on first run
 */

const SAMPLE_DATA = {
  companies: [
    { id: 'c1', name: 'ABC Company Ltd', country: 'HK', address: '88 Queensway, Admiralty, Hong Kong', adminEmail: 'admin@abc.com.hk' },
    { id: 'c2', name: 'XYZ Corporation', country: 'HK', address: '1 Harbour Road, Wan Chai, Hong Kong', adminEmail: 'admin@xyz.com.hk' },
    { id: 'c3', name: 'Thai Business Co.', country: 'TH', address: '99 Sukhumvit Road, Bangkok 10110', adminEmail: 'admin@thaibiz.co.th' },
    { id: 'c4', name: 'Bangkok Office', country: 'TH', address: '200 Silom Road, Bangkok 10500', adminEmail: 'admin@bangkokoffice.co.th' },
    { id: 'c5', name: 'Phnom Penh Office', country: 'KH', address: '45 Norodom Blvd, Phnom Penh', adminEmail: 'admin@phnompenh.com.kh' },
    { id: 'c6', name: 'Paris Branch', country: 'FR', address: '15 Rue de la Paix, 75001 Paris', adminEmail: 'admin@paris.fr' },
    { id: 'c7', name: 'Madrid Office', country: 'ES', address: 'Gran Via 28, 28013 Madrid', adminEmail: 'admin@madrid.es' },
  ],

  rooms: [
    // ABC Company Ltd (HK)
    { id: 'r1', companyId: 'c1', name: 'Conference Room A', location: '3F', capacity: 10, description: 'Main conference room with projector', equipment: ['eq1', 'eq2', 'eq3', 'eq7', 'eq8'], country: 'HK' },
    { id: 'r2', companyId: 'c1', name: 'Meeting Room B', location: '3F', capacity: 6, description: 'Small meeting room', equipment: ['eq2', 'eq6', 'eq7', 'eq8'], country: 'HK' },
    { id: 'r3', companyId: 'c1', name: 'Board Room', location: '25F', capacity: 20, description: 'Executive boardroom with video conferencing', equipment: ['eq1', 'eq2', 'eq4', 'eq5', 'eq6', 'eq7', 'eq8'], country: 'HK' },
    // XYZ Corporation (HK)
    { id: 'r4', companyId: 'c2', name: 'Innovation Hub', location: '10F', capacity: 12, description: 'Creative workspace', equipment: ['eq1', 'eq2', 'eq6', 'eq7', 'eq8'], country: 'HK' },
    { id: 'r5', companyId: 'c2', name: 'Training Room', location: '2F', capacity: 30, description: 'Large training room', equipment: ['eq1', 'eq2', 'eq3', 'eq6', 'eq7', 'eq8'], country: 'HK' },
    // Thai Business Co.
    { id: 'r6', companyId: 'c3', name: 'ห้องประชุมใหญ่', location: 'ชั้น 5', capacity: 15, description: 'Main conference room', equipment: ['eq1', 'eq2', 'eq4', 'eq7', 'eq8'], country: 'TH' },
    { id: 'r7', companyId: 'c3', name: 'ห้องประชุมเล็ก', location: 'ชั้น 5', capacity: 8, description: 'Small meeting room', equipment: ['eq2', 'eq6', 'eq7', 'eq8'], country: 'TH' },
    // Bangkok Office
    { id: 'r8', companyId: 'c4', name: 'Silom Conference Room', location: '7F', capacity: 10, description: 'Modern conference room', equipment: ['eq1', 'eq2', 'eq3', 'eq7', 'eq8'], country: 'TH' },
    // Phnom Penh Office
    { id: 'r9', companyId: 'c5', name: 'បន្ទប់ប្រជុំ A', location: 'ជាន់ 2', capacity: 8, description: 'Conference room A', equipment: ['eq1', 'eq2', 'eq6', 'eq7', 'eq8'], country: 'KH' },
    { id: 'r10', companyId: 'c5', name: 'បន្ទប់ប្រជុំ B', location: 'ជាន់ 3', capacity: 15, description: 'Large conference room', equipment: ['eq1', 'eq2', 'eq4', 'eq7', 'eq8'], country: 'KH' },
    // Paris Branch
    { id: 'r11', companyId: 'c6', name: 'Salle de Conférence', location: '2ème étage', capacity: 12, description: 'Salle de conférence principale', equipment: ['eq1', 'eq2', 'eq3', 'eq5', 'eq7', 'eq8'], country: 'FR' },
    { id: 'r12', companyId: 'c6', name: 'Salle de Réunion', location: '1er étage', capacity: 6, description: 'Petite salle de réunion', equipment: ['eq2', 'eq6', 'eq7', 'eq8'], country: 'FR' },
    // Madrid Office
    { id: 'r13', companyId: 'c7', name: 'Sala de Conferencias', location: 'Planta 3', capacity: 14, description: 'Sala de conferencias principal', equipment: ['eq1', 'eq2', 'eq4', 'eq7', 'eq8'], country: 'ES' },
    { id: 'r14', companyId: 'c7', name: 'Sala de Reuniones', location: 'Planta 2', capacity: 8, description: 'Sala de reuniones pequeña', equipment: ['eq2', 'eq5', 'eq7', 'eq8'], country: 'ES' },
  ],

  departments: [
    { id: 'd1', companyId: 'c1', name: 'Human Resources' },
    { id: 'd2', companyId: 'c1', name: 'Finance' },
    { id: 'd3', companyId: 'c1', name: 'Information Technology' },
    { id: 'd4', companyId: 'c1', name: 'Operations' },
    { id: 'd5', companyId: 'c1', name: 'Sales' },
    { id: 'd6', companyId: 'c1', name: 'Management' },
    { id: 'd7', companyId: 'c2', name: 'Human Resources' },
    { id: 'd8', companyId: 'c2', name: 'Finance' },
    { id: 'd9', companyId: 'c2', name: 'IT' },
    { id: 'd10', companyId: 'c2', name: 'Marketing' },
    { id: 'd11', companyId: 'c3', name: 'ฝ่ายบุคคล' },
    { id: 'd12', companyId: 'c3', name: 'ฝ่ายการเงิน' },
    { id: 'd13', companyId: 'c3', name: 'ฝ่ายไอที' },
    { id: 'd14', companyId: 'c4', name: 'Operations' },
    { id: 'd15', companyId: 'c4', name: 'Sales' },
    { id: 'd16', companyId: 'c5', name: 'នាយកដ្ឋានបុគ្គលិក' },
    { id: 'd17', companyId: 'c5', name: 'នាយកដ្ឋានហិរញ្ញវត្ថុ' },
    { id: 'd18', companyId: 'c6', name: 'Ressources Humaines' },
    { id: 'd19', companyId: 'c6', name: 'Finances' },
    { id: 'd20', companyId: 'c7', name: 'Recursos Humanos' },
    { id: 'd21', companyId: 'c7', name: 'Finanzas' },
  ],

  equipment: [
    { id: 'eq1', name: { en: 'Projector', 'zh-TW': '投影機', 'zh-CN': '投影仪', th: 'โปรเจกเตอร์', km: 'គ្រឿងបញ្ចាំង', fr: 'Projecteur', es: 'Proyector' }, icon: '📽️' },
    { id: 'eq2', name: { en: 'TV Screen', 'zh-TW': '電視屏幕', 'zh-CN': '电视屏幕', th: 'จอทีวี', km: 'អេក្រង់ TV', fr: 'Écran TV', es: 'Pantalla TV' }, icon: '📺' },
    { id: 'eq3', name: { en: 'Conference Phone', 'zh-TW': '電話會議', 'zh-CN': '电话会议', th: 'โทรศัพท์ประชุม', km: 'ទូរស័ព្ទប្រជុំ', fr: 'Téléphone de Conférence', es: 'Teléfono de Conferencia' }, icon: '📞' },
    { id: 'eq4', name: { en: 'Video Conferencing', 'zh-TW': '視訊會議', 'zh-CN': '视频会议', th: 'ประชุมวิดีโอ', km: 'ប្រជុំវីដេអូ', fr: 'Vidéoconférence', es: 'Videoconferencia' }, icon: '🖥️' },
    { id: 'eq5', name: { en: 'Coffee Machine', 'zh-TW': '咖啡機', 'zh-CN': '咖啡机', th: 'เครื่องกาแฟ', km: 'ម៉ាស៊ីនកាហ្វេ', fr: 'Machine à Café', es: 'Cafetera' }, icon: '☕' },
    { id: 'eq6', name: { en: 'Whiteboard', 'zh-TW': '白板', 'zh-CN': '白板', th: 'กระดานขาว', km: 'ក្តារផ្ទាំង', fr: 'Tableau Blanc', es: 'Pizarra' }, icon: '🖨️' },
    { id: 'eq7', name: { en: 'WiFi', 'zh-TW': 'WiFi', 'zh-CN': 'WiFi', th: 'WiFi', km: 'WiFi', fr: 'WiFi', es: 'WiFi' }, icon: '📶' },
    { id: 'eq8', name: { en: 'Air Conditioning', 'zh-TW': '冷氣', 'zh-CN': '空调', th: 'เครื่องปรับอากาศ', km: 'ម៉ាស៊ីនត្រជាក់', fr: 'Climatisation', es: 'Aire Acondicionado' }, icon: '❄️' },
  ],

  employees: [
    // ABC Company Ltd employees
    { id: 'e1', companyId: 'c1', departmentId: 'd6', name: 'Alice Wong', email: 'alice.wong@abc.com.hk', isAdmin: true, defaultRoomId: 'r3', microsoft365Account: 'alice.wong@abc.com.hk', phone: '+852 9123 4567' },
    { id: 'e2', companyId: 'c1', departmentId: 'd3', name: 'Bob Chan', email: 'bob.chan@abc.com.hk', isAdmin: false, defaultRoomId: 'r1', microsoft365Account: 'bob.chan@abc.com.hk', phone: '+852 9234 5678' },
    { id: 'e3', companyId: 'c1', departmentId: 'd1', name: 'Carol Lee', email: 'carol.lee@abc.com.hk', isAdmin: false, defaultRoomId: 'r2', microsoft365Account: 'carol.lee@abc.com.hk', phone: '+852 9345 6789' },
    { id: 'e4', companyId: 'c1', departmentId: 'd2', name: 'David Lau', email: 'david.lau@abc.com.hk', isAdmin: false, defaultRoomId: 'r1', microsoft365Account: 'david.lau@abc.com.hk', phone: '+852 9456 7890' },
    { id: 'e5', companyId: 'c1', departmentId: 'd5', name: 'Emma Ng', email: 'emma.ng@abc.com.hk', isAdmin: false, defaultRoomId: 'r2', microsoft365Account: 'emma.ng@abc.com.hk', phone: '+852 9567 8901' },
    // XYZ Corporation employees
    { id: 'e6', companyId: 'c2', departmentId: 'd7', name: 'Frank Ho', email: 'frank.ho@xyz.com.hk', isAdmin: true, defaultRoomId: 'r4', microsoft365Account: 'frank.ho@xyz.com.hk', phone: '+852 9678 9012' },
    { id: 'e7', companyId: 'c2', departmentId: 'd9', name: 'Grace Tam', email: 'grace.tam@xyz.com.hk', isAdmin: false, defaultRoomId: 'r5', microsoft365Account: 'grace.tam@xyz.com.hk', phone: '+852 9789 0123' },
    { id: 'e8', companyId: 'c2', departmentId: 'd10', name: 'Henry Yip', email: 'henry.yip@xyz.com.hk', isAdmin: false, defaultRoomId: 'r4', microsoft365Account: 'henry.yip@xyz.com.hk', phone: '+852 9890 1234' },
    // Thai Business Co. employees
    { id: 'e9', companyId: 'c3', departmentId: 'd11', name: 'Somchai Srisuwan', email: 'somchai@thaibiz.co.th', isAdmin: true, defaultRoomId: 'r6', microsoft365Account: 'somchai@thaibiz.co.th', phone: '+66 81 234 5678' },
    { id: 'e10', companyId: 'c3', departmentId: 'd12', name: 'Nattaya Pongpan', email: 'nattaya@thaibiz.co.th', isAdmin: false, defaultRoomId: 'r7', microsoft365Account: 'nattaya@thaibiz.co.th', phone: '+66 82 345 6789' },
    // Bangkok Office
    { id: 'e11', companyId: 'c4', departmentId: 'd14', name: 'Akara Siripong', email: 'akara@bangkokoffice.co.th', isAdmin: true, defaultRoomId: 'r8', microsoft365Account: 'akara@bangkokoffice.co.th', phone: '+66 83 456 7890' },
    // Phnom Penh Office
    { id: 'e12', companyId: 'c5', departmentId: 'd16', name: 'Dara Sok', email: 'dara@phnompenh.com.kh', isAdmin: true, defaultRoomId: 'r9', microsoft365Account: 'dara@phnompenh.com.kh', phone: '+855 12 345 678' },
    { id: 'e13', companyId: 'c5', departmentId: 'd17', name: 'Sreymom Chan', email: 'sreymom@phnompenh.com.kh', isAdmin: false, defaultRoomId: 'r10', microsoft365Account: 'sreymom@phnompenh.com.kh', phone: '+855 12 456 789' },
    // Paris Branch
    { id: 'e14', companyId: 'c6', departmentId: 'd18', name: 'Jean-Pierre Dupont', email: 'jp.dupont@paris.fr', isAdmin: true, defaultRoomId: 'r11', microsoft365Account: 'jp.dupont@paris.fr', phone: '+33 6 12 34 56 78' },
    { id: 'e15', companyId: 'c6', departmentId: 'd19', name: 'Marie Laurent', email: 'marie.laurent@paris.fr', isAdmin: false, defaultRoomId: 'r12', microsoft365Account: 'marie.laurent@paris.fr', phone: '+33 6 23 45 67 89' },
    // Madrid Office
    { id: 'e16', companyId: 'c7', departmentId: 'd20', name: 'Carlos García', email: 'c.garcia@madrid.es', isAdmin: true, defaultRoomId: 'r13', microsoft365Account: 'c.garcia@madrid.es', phone: '+34 612 345 678' },
    { id: 'e17', companyId: 'c7', departmentId: 'd21', name: 'Ana Martínez', email: 'a.martinez@madrid.es', isAdmin: false, defaultRoomId: 'r14', microsoft365Account: 'a.martinez@madrid.es', phone: '+34 623 456 789' },
  ],

  admins: [
    { employeeId: 'e1', companyId: 'c1', rooms: ['r1', 'r2', 'r3'] },
    { employeeId: 'e6', companyId: 'c2', rooms: ['r4', 'r5'] },
    { employeeId: 'e9', companyId: 'c3', rooms: ['r6', 'r7'] },
    { employeeId: 'e11', companyId: 'c4', rooms: ['r8'] },
    { employeeId: 'e12', companyId: 'c5', rooms: ['r9', 'r10'] },
    { employeeId: 'e14', companyId: 'c6', rooms: ['r11', 'r12'] },
    { employeeId: 'e16', companyId: 'c7', rooms: ['r13', 'r14'] },
  ],

  /**
   * Generate sample bookings for the current month
   */
  generateSampleBookings() {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const bookings = [];

    const sampleData = [
      { roomId: 'r1', companyId: 'c1', employeeId: 'e2', departmentId: 'd3', day: 2, start: '09:00', end: '10:30', purpose: 'IT Planning Meeting', attendees: 6 },
      { roomId: 'r1', companyId: 'c1', employeeId: 'e5', departmentId: 'd5', day: 2, start: '14:00', end: '15:30', purpose: 'Sales Review', attendees: 4 },
      { roomId: 'r2', companyId: 'c1', employeeId: 'e3', departmentId: 'd1', day: 3, start: '10:00', end: '11:00', purpose: 'HR Interview', attendees: 3 },
      { roomId: 'r3', companyId: 'c1', employeeId: 'e1', departmentId: 'd6', day: 4, start: '09:00', end: '12:00', purpose: 'Board Meeting', attendees: 15 },
      { roomId: 'r1', companyId: 'c1', employeeId: 'e4', departmentId: 'd2', day: 5, start: '13:00', end: '14:30', purpose: 'Financial Review Q4', attendees: 8 },
      { roomId: 'r4', companyId: 'c2', employeeId: 'e7', departmentId: 'd9', day: 3, start: '09:30', end: '11:00', purpose: 'Tech Sprint Planning', attendees: 8 },
      { roomId: 'r5', companyId: 'c2', employeeId: 'e8', departmentId: 'd10', day: 5, start: '14:00', end: '16:00', purpose: 'Marketing Campaign Review', attendees: 20 },
      { roomId: 'r6', companyId: 'c3', employeeId: 'e10', departmentId: 'd12', day: 6, start: '09:00', end: '10:30', purpose: 'ประชุมทีมการเงิน', attendees: 5 },
      { roomId: 'r9', companyId: 'c5', employeeId: 'e13', departmentId: 'd17', day: 7, start: '10:00', end: '11:30', purpose: 'ការប្រជុំហិរញ្ញវត្ថុ', attendees: 6 },
      { roomId: 'r11', companyId: 'c6', employeeId: 'e15', departmentId: 'd19', day: 8, start: '11:00', end: '12:30', purpose: 'Réunion budgétaire', attendees: 7 },
      { roomId: 'r13', companyId: 'c7', employeeId: 'e17', departmentId: 'd21', day: 9, start: '09:00', end: '10:00', purpose: 'Reunión de finanzas', attendees: 5 },
      { roomId: 'r1', companyId: 'c1', employeeId: 'e2', departmentId: 'd3', day: 10, start: '10:00', end: '11:00', purpose: 'System Maintenance Discussion', attendees: 4 },
      { roomId: 'r3', companyId: 'c1', employeeId: 'e1', departmentId: 'd6', day: 12, start: '14:00', end: '16:00', purpose: 'Management Strategy Session', attendees: 12 },
      { roomId: 'r2', companyId: 'c1', employeeId: 'e5', departmentId: 'd5', day: 14, start: '09:00', end: '10:00', purpose: 'Client Call', attendees: 3 },
      { roomId: 'r4', companyId: 'c2', employeeId: 'e6', departmentId: 'd7', day: 15, start: '13:00', end: '15:00', purpose: 'Annual Review', attendees: 10 },
    ];

    sampleData.forEach((s, index) => {
      const dateObj = new Date(year, month, s.day);
      // Skip if day doesn't exist in month
      if (dateObj.getMonth() !== month) return;
      const dateStr = dateObj.toISOString().split('T')[0];
      const status = index < 12 ? 'confirmed' : (index < 14 ? 'pending' : 'cancelled');
      bookings.push({
        id: `b${index + 1}`,
        roomId: s.roomId,
        companyId: s.companyId,
        employeeId: s.employeeId,
        departmentId: s.departmentId,
        date: dateStr,
        startTime: s.start,
        endTime: s.end,
        purpose: s.purpose,
        attendees: s.attendees,
        notes: '',
        status: status,
        confirmationCode: String(100000 + Math.floor(Math.random() * 900000)),
        createdAt: new Date(year, month, s.day - 2).toISOString(),
        updatedAt: new Date(year, month, s.day - 1).toISOString(),
      });
    });

    return bookings;
  }
};
