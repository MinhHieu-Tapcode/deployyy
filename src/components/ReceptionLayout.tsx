/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useRestaurantStore, playNotificationSound } from '../data/store';
import { TableStatus, TableStatusLabel, OrderItemStatus } from '../types';
import GiaKhanhLogo from './GiaKhanhLogo';
import { TableCard } from './SharedUI';
import {
  Search,
  Calendar,
  Clock,
  User,
  Phone,
  CheckCircle,
  AlertCircle,
  Plus,
  Compass,
  Play,
  BookmarkCheck,
  Printer,
  Layers,
  ArrowUpRight,
  ArrowDownLeft,
  Flame,
  Sparkles,
  MapPin,
  Check,
  X,
  PlusCircle,
  HelpCircle,
  BookOpen,
  FileText
} from 'lucide-react';

export default function ReceptionLayout() {
  const {
    tables,
    sessions,
    orders,
    orderDetails,
    dishes,
    reservations,
    customers,
    addReservation,
    updateReservationStatus,
    setTableStatusManual,
    startTableSession,
    closeSessionAndPay,
    selectedTableId,
    setSelectedTableId,
  } = useRestaurantStore();

  const [activeFloor, setActiveFloor] = useState<number>(1);
  const [searchQuery, setSearchQuery] = useState('');

  const BOOKING_OPEN_HOUR = 10;
  const LAST_BOOKING_HOUR = 21;
  const LAYOUT_VIEW_CLOSE_HOUR = 22;
  const CLOSING_TIME_LABEL = '22:00';
  const BOOKING_PREP_BUFFER_MINUTES = 30;
  const TEMP_SESSION_MINUTES = 60;
  const CHECKIN_EARLY_MINUTES = 15;
  const HOLD_GRACE_MINUTES = 30;
  const BOOKING_LEAD_TIME_MINUTES = 30;

  const clampTimeToBookingWindow = (hours: number, minutes: number) => {
    if (hours < BOOKING_OPEN_HOUR) {
      return { hours: BOOKING_OPEN_HOUR, minutes: 0 };
    }
    if (hours > LAYOUT_VIEW_CLOSE_HOUR) {
      return { hours: LAYOUT_VIEW_CLOSE_HOUR, minutes: 0 };
    }
    if (hours === LAYOUT_VIEW_CLOSE_HOUR && minutes > 0) {
      return { hours: LAYOUT_VIEW_CLOSE_HOUR, minutes: 0 };
    }
    return { hours, minutes };
  };

  const getLocalDateValue = (date = new Date()) => {
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };

  const getCurrentWorkingTimeValue = () => {
    const now = new Date();
    return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  };

  const [selectedCalendarDate, setSelectedCalendarDate] = useState<string>(() => {
    return getLocalDateValue();
  });
  const [selectedCalendarTime, setSelectedCalendarTime] = useState<string>(() => {
    return getCurrentWorkingTimeValue();
  });
  const [isViewingCurrent, setIsViewingCurrent] = useState(true);

  const bookingTimeOptions = React.useMemo(() => {
    const options: string[] = [];
    for (let hour = BOOKING_OPEN_HOUR; hour <= LAST_BOOKING_HOUR; hour += 1) {
      for (let minute of [0, 15, 30, 45]) {
        if (hour === LAST_BOOKING_HOUR && minute > 0) break;
        const hh = String(hour).padStart(2, '0');
        const mm = String(minute).padStart(2, '0');
        options.push(`${hh}:${mm}`);
      }
    }
    return options;
  }, []);

  const [showLateBookingConfirm, setShowLateBookingConfirm] = useState(false);
  const [pendingBookingTableId, setPendingBookingTableId] = useState<string | null>(null);

  const viewMode = React.useMemo(() => {
    try {
      if (isViewingCurrent) return 'REAL';
      const timePart = selectedCalendarTime && selectedCalendarTime.length >= 4 ? selectedCalendarTime : '00:00';
      const sel = new Date(`${selectedCalendarDate}T${timePart}:00`);
      const now = new Date();
      if (isNaN(sel.getTime())) return 'PAST';
      const diffMin = Math.round((sel.getTime() - now.getTime()) / 60000);
      return diffMin > 0 ? 'FUTURE' : 'PAST';
    } catch (e) {
      return 'PAST';
    }
  }, [isViewingCurrent, selectedCalendarDate, selectedCalendarTime]);

  // Center Modal states for booking & session setup
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showClosingConfirm, setShowClosingConfirm] = useState(false);
  const [bookName, setBookName] = useState('');
  const [bookPhone, setBookPhone] = useState('');
  const [bookingDateError, setBookingDateError] = useState('');
  const [bookingTimeError, setBookingTimeError] = useState('');
  const [manualPhoneInp, setManualPhoneInp] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [showManualBookingSuccess, setShowManualBookingSuccess] = useState(false);
  const [showFormSampleId, setShowFormSampleId] = useState<string | null>(null);

  const [instantPhone, setInstantPhone] = useState('');
  const [instantCustomerName, setInstantCustomerName] = useState('');
  const [instantGuests, setInstantGuests] = useState<number>(2);
  const [showCallConfirm, setShowCallConfirm] = useState(false);
  const [showFullPhone, setShowFullPhone] = useState(false);
  const [autoCancelInfo, setAutoCancelInfo] = useState<string | null>(null);
  const [tablesBeingCleaned, setTablesBeingCleaned] = useState<string[]>([]);
  const [selectedHistorySession, setSelectedHistorySession] = useState<string | null>(null);

  // Today string for live session fallback (local date)
  const todayString = (() => {
    const d = new Date();
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  })();

  // Active bookings on the currently viewed calendar date
  const bookingsOnDate = reservations.filter(
    r => r.Ngay_dat === selectedCalendarDate && r.Trang_thai === 'Chờ đến'
  );

  // Helper checking if a specific table is pre-booked on the viewed calendar date
  const findTableBookingAtSelectedTime = (tableId: string) => {
    return bookingsOnDate.find(r => {
      if (r.Ma_ban !== tableId) return false;
      
      // Parse booking time (e.g. "18:00")
      const [bookHour, bookMin] = r.Gio_dat.split(':').map(Number);
      if (Number.isNaN(bookHour) || Number.isNaN(bookMin)) return false;
      const bookTotalMin = bookHour * 60 + bookMin;
      
      // Parse currently viewed calendar time (e.g. "18:15")
      const [selHour, selMin] = selectedCalendarTime.split(':').map(Number);
      if (Number.isNaN(selHour) || Number.isNaN(selMin)) return false;
      const selTotalMin = selHour * 60 + selMin;
      
      // The booking is active/displayed if the selected calendar time falls within 30 minutes from Gio_dat
      return selTotalMin >= bookTotalMin && selTotalMin <= bookTotalMin + 30;
    });
  };

  // Search filter for tables or reservations matching name, phone, or table ID
  const isSearchMatchedTable = (tableId: string) => {
    if (!searchQuery.trim()) return true;

    // Check table name
    if (tableId.toLowerCase().includes(searchQuery.toLowerCase())) return true;

    // Check booked client name or phone
    const booking = findTableBookingAtSelectedTime(tableId);
    if (booking) {
      if (booking.Ten_khach_hang.toLowerCase().includes(searchQuery.toLowerCase())) return true;
      if (booking.So_dien_thoai.includes(searchQuery)) return true;
    }

    // Check active session phone code
    const sess = sessions.find(s => s.Ma_ban === tableId && s.Trang_thai === 'active');
    if (sess) {
      if (sess.Ma_phien_code && sess.Ma_phien_code.includes(searchQuery)) return true;
      if (sess.Ma_khach_hang) {
        const cust = customers?.find(c => c.Ma_khach_hang === sess.Ma_khach_hang);
        if (cust && cust.So_dien_thoai.includes(searchQuery)) return true;
      }
    }

    return false;
  };

  // Determine a table's temporary simulation status at the selected date & time
  const getTableSimulatedStatus = (tableId: string, baseStatus: TableStatus) => {
    const booking = findTableBookingAtSelectedTime(tableId);
    if (booking) {
      return 'BOOKED'; // Custom state indicating active pre-booked
    }

    if (isViewingCurrent) {
      return baseStatus;
    }

    // In calendar view mode (isViewingCurrent === false), check if the active session
    // is expected to have ended (assuming average dining duration of 2 hours / 120 minutes)
    try {
      const timePart = selectedCalendarTime && selectedCalendarTime.length >= 4 ? selectedCalendarTime : '00:00';
      const selectedDateTime = new Date(`${selectedCalendarDate}T${timePart}:00`);
      
      if (!isNaN(selectedDateTime.getTime())) {
        const activeSess = sessions.find(s => s.Ma_ban === tableId && s.Trang_thai === 'active');
        if (activeSess) {
          const startTime = new Date(activeSess.Thoi_gian_bat_dau);
          if (!isNaN(startTime.getTime())) {
            const diffMinutes = (selectedDateTime.getTime() - startTime.getTime()) / 60000;
            // The table is considered occupied if the viewed calendar time falls within 2 hours from startTime
            if (diffMinutes >= 0 && diffMinutes <= 120) {
              return TableStatus.CO_KHACH;
            }
          }
        }
      }
    } catch (e) {
      // fallback to TRONG
    }

    return TableStatus.TRONG;
  };

  const bookingTimeIsLate = (time: string) => {
    const [hour, minute = 0] = time.split(':').map(Number);
    const totalMinutes = hour * 60 + minute;
    return totalMinutes >= 20 * 60 && totalMinutes <= LAST_BOOKING_HOUR * 60;
  };

  const bookingTimeIsInAllowedWindow = (time: string) => {
    const [hour, minute = 0] = time.split(':').map(Number);
    if (Number.isNaN(hour) || Number.isNaN(minute)) return false;
    const totalMinutes = hour * 60 + minute;
    return totalMinutes >= BOOKING_OPEN_HOUR * 60 && totalMinutes <= LAST_BOOKING_HOUR * 60;
  };

  const bookingDateIsTodayOrAfter = (date: string) => {
    return date >= getLocalDateValue();
  };

  const bookingDateTimeHasLeadTime = (date: string, time: string) => {
    const selected = new Date(`${date}T${time}:00`);
    if (isNaN(selected.getTime())) return false;
    return selected.getTime() >= Date.now() + BOOKING_LEAD_TIME_MINUTES * 60000;
  };

  const createReservation = (tableId: string) => {
    addReservation({
      Ma_ban: tableId,
      Ten_khach_hang: bookName.trim(),
      So_dien_thoai: bookPhone.trim(),
      Ngay_dat: selectedCalendarDate,
      Gio_dat: selectedCalendarTime,
      Trang_thai: 'Chờ đến'
    });

    setBookName('');
    setBookPhone('');
    setShowManualBookingSuccess(true);
    playNotificationSound('new_order');

    setTimeout(() => {
      setShowManualBookingSuccess(false);
      setIsModalOpen(false);
    }, 2000);
  };

  // Handle direct booking registration for selected table
  const handleBookTableDirect = (e: React.FormEvent, tableId: string) => {
    e.preventDefault();
    if (!bookName.trim() || !bookPhone.trim()) {
      alert('Vui lòng nhập đầy đủ Họ tên và Số điện thoại khách!');
      return;
    }
    if (!/^\d{10}$/.test(bookPhone.trim())) {
      alert('Số điện thoại phải gồm đúng 10 chữ số.');
      return;
    }
    if (!bookingDateIsTodayOrAfter(selectedCalendarDate)) {
      setBookingDateError('Ngày đặt không được trước ngày hiện tại.');
      setBookingTimeError('');
      return;
    }
    setBookingDateError('');
    if (!bookingTimeIsInAllowedWindow(selectedCalendarTime)) {
      setBookingTimeError('');
      alert(`Thời gian đặt bàn chỉ được chọn trong khung ${String(BOOKING_OPEN_HOUR).padStart(2, '0')}:00 - ${String(LAST_BOOKING_HOUR).padStart(2,'0')}:00.`);
      return;
    }
    if (!bookingDateTimeHasLeadTime(selectedCalendarDate, selectedCalendarTime)) {
      setBookingTimeError(`Giờ đặt phải cách thời điểm hiện tại ít nhất ${BOOKING_LEAD_TIME_MINUTES} phút.`);
      return;
    }
    setBookingTimeError('');

    if (bookingTimeIsLate(selectedCalendarTime)) {
      setPendingBookingTableId(tableId);
      setShowLateBookingConfirm(true);
      return;
    }

    createReservation(tableId);
  };

  // Begin session for reservation with pre-filled guest information
  const handleStartBookingSession = async (bookingId: string, tableId: string, phone: string) => {
    // Validate phone number: must be exactly 10 digits
    const trimmed = phone.trim();
    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(trimmed)) {
      alert('Số điện thoại phải gồm 10 chữ số.');
      return;
    }
    try {
      const booking = reservations.find(r => r.Ma_dat_ban === bookingId);
      await startTableSession(tableId, trimmed, getReservationGuestCount(booking, 4), undefined, booking?.Ten_khach_hang || 'Khách đặt trước');
      updateReservationStatus(bookingId, 'Đã nhận phiên');
      playNotificationSound('ready_dish');
      setIsModalOpen(false);
      setSelectedTableId(null);
      alert(`Đã nhận khách đặt trước! Phiên bàn lẩu ${tableId} đã hoạt động.`);
    } catch (err: any) {
      alert(err.message || 'Hành động thất bại.');
    }
  };

  const handleStartManualSession = async (e: React.FormEvent, tableId: string) => {
    e.preventDefault();
    // Validate phone number: must be 10 digits
    const trimmed = manualPhoneInp.trim();
    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(trimmed)) {
      setPhoneError('Số điện thoại phải gồm 10 chữ số.');
      return;
    }
    setPhoneError('');
    try {
      await startTableSession(tableId, trimmed);
      playNotificationSound('ready_dish');
      setIsModalOpen(false);
      setSelectedTableId(null);
      setManualPhoneInp('');
      alert(`Kích hoạt thành công phiên phục vụ cho bàn ${tableId}!`);
    } catch (err: any) {
      alert(err.message || 'Mở bàn không thành công.');
    }
  };

  // Table click event opens the centered modal
  const handleTableClick = (tableId: string) => {
    setSelectedTableId(tableId);
    setShowClosingConfirm(false);
    setShowCallConfirm(false);
    setShowFullPhone(false);
    setAutoCancelInfo(null);
    setIsModalOpen(true);
  };

  // Filter current floor tables
  const currentFloorTables = tables.filter(t => t.Tang === activeFloor);

  // Dynamic dashboard counters at the current simulated time
  const getSimulatedStats = () => {
    let trong = 0, dat_truoc = 0, phục_vụ = 0;
    currentFloorTables.forEach(t => {
      const status = getTableSimulatedStatus(t.Ma_ban, t.Trang_thai);
      if (status === 'BOOKED') dat_truoc++;
      else if (status === TableStatus.TRONG) trong++;
      else if (status === TableStatus.CO_KHACH) phục_vụ++;
    });
    return { trong, dat_truoc, phục_vụ };
  };

  const simStats = getSimulatedStats();

  const getTableActiveSessionCost = (tableId: string) => {
    const session = sessions.find(s => s.Ma_ban === tableId && s.Trang_thai === 'active');
    if (!session) return 0;

    const sessionOrders = orders.filter(o => o.Ma_phien === session.Ma_phien);
    let cost = 0;
    sessionOrders.forEach(ord => {
      const details = orderDetails.filter(od => od.Ma_hd_dat_mon === ord.Ma_hd_dat_mon && od.Trang_thai_mon !== OrderItemStatus.DA_HUY);
      details.forEach(det => {
        cost += det.Don_gia_tai_thoi_diem * det.So_luong;
      });
    });
    return cost;
  };

  const getTableSessionData = (tableId: string) => {
    const session = sessions.find(s => s.Ma_ban === tableId && s.Trang_thai === 'active');
    if (!session) return undefined;
    return {
      ...session,
      orderTotal: getTableActiveSessionCost(tableId)
    };
  };

  const maskPhoneNumber = (phone: string) => {
    if (!phone) return '****';
    return phone.replace(/\d(?=\d{4})/g, '*');
  };

  const formatDisplayDate = (date: string) => {
    const parsed = new Date(`${date}T00:00:00`);
    if (isNaN(parsed.getTime())) return date;
    return parsed.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  const formatTime = (date: Date) => date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });

  const getReservationGuestCount = (booking: any, tableCapacity: number) => {
    return booking?.So_khach || booking?.So_luong_khach || booking?.guests_count || tableCapacity;
  };

  const getBookingTimeState = (booking: any) => {
    const bookingAt = new Date(`${booking.Ngay_dat}T${booking.Gio_dat}:00`);
    if (isNaN(bookingAt.getTime())) {
      return {
        key: 'waiting' as const,
        label: 'ĐẶT TRƯỚC - CHỜ KHÁCH',
        diffMin: 0,
        returnBy: booking.Gio_dat,
        tone: 'purple'
      };
    }

    const now = new Date();
    const diffMin = Math.round((bookingAt.getTime() - now.getTime()) / 60000);
    const returnByDate = new Date(bookingAt.getTime() - BOOKING_PREP_BUFFER_MINUTES * 60000);
    const returnBy = formatTime(returnByDate);
    const canTemp = diffMin > TEMP_SESSION_MINUTES + BOOKING_PREP_BUFFER_MINUTES;
    const canCheckIn = diffMin <= CHECKIN_EARLY_MINUTES && diffMin >= -HOLD_GRACE_MINUTES;
    const isExpired = diffMin < -HOLD_GRACE_MINUTES;
    const cancelled = booking.Trang_thai === 'Đã hủy do quá giờ giữ bàn' || booking.Trang_thai === 'Đã hủy do quá giờ' || booking.Trang_thai === 'Đã hủy';

    if (cancelled) {
      return { key: 'cancelled' as const, label: 'ĐÃ HỦY DO QUÁ GIỜ', diffMin, returnBy, tone: 'green' };
    }
    if (isExpired) {
      return { key: 'expired' as const, label: 'QUÁ GIỜ GIỮ BÀN', diffMin, returnBy, tone: 'red' };
    }
    if (canCheckIn) {
      return { key: 'checkin' as const, label: 'ĐẶT TRƯỚC - CHỜ KHÁCH', diffMin, returnBy, tone: 'purple' };
    }
    if (canTemp) {
      return { key: 'temporary' as const, label: 'CÒN CÓ THỂ TẠO PHIÊN TẠM', diffMin, returnBy, tone: 'green' };
    }
    return { key: 'near' as const, label: 'SẮP ĐẾN GIỜ GIỮ BÀN', diffMin, returnBy, tone: 'red' };
  };

  const getBookingStateClasses = (tone: string) => {
    if (tone === 'green') {
      return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    }
    if (tone === 'red') {
      return 'bg-red-50 text-[#B91C1C] border-red-200';
    }
    return 'bg-purple-50 text-purple-700 border-purple-200';
  };

  const formatSessionCode = (session: any) => {
    if (!session) return '---';
    const start = session.Thoi_gian_bat_dau
      ? new Date(session.Thoi_gian_bat_dau).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
      : '??:??';
    const suffix = session.Ma_phien_code ? session.Ma_phien_code.slice(-4).toUpperCase() : '----';
    return `${currentModalTable?.Ma_ban || 'B?'}-${start}-${suffix}`;
  };

  // Active table context data inside Modal
  const currentModalTable = tables.find(t => t.Ma_ban === selectedTableId);
  const simulatedStatusOfCurrentModal = currentModalTable ? getTableSimulatedStatus(currentModalTable.Ma_ban, currentModalTable.Trang_thai) : null;
  const activeSessionOfModalTable = sessions.find(s => s.Ma_ban === selectedTableId && s.Trang_thai === 'active');
  const bookedOfModalTable = currentModalTable ? findTableBookingAtSelectedTime(currentModalTable.Ma_ban) : null;

  React.useEffect(() => {
    if (!bookedOfModalTable || !currentModalTable) return;
    try {
      const bookingDT = new Date(`${bookedOfModalTable.Ngay_dat}T${bookedOfModalTable.Gio_dat}:00`);
      const diffMin = (bookingDT.getTime() - Date.now()) / 60000;
      if (diffMin < -HOLD_GRACE_MINUTES && bookedOfModalTable.Trang_thai !== 'Đã hủy do quá giờ giữ bàn') {
        // auto cancel booking and free the table
        updateReservationStatus(bookedOfModalTable.Ma_dat_ban, 'Đã hủy do quá giờ giữ bàn' as any);
        if (currentModalTable?.Ma_ban) setTableStatusManual(currentModalTable.Ma_ban, TableStatus.TRONG);
        setAutoCancelInfo('Lịch đặt đã quá thời gian giữ bàn 30 phút. Hệ thống đã tự động hủy lịch đặt và chuyển bàn về trạng thái trống.');
      }
    } catch (e) {
      // ignore
    }
  }, [bookedOfModalTable, currentModalTable, updateReservationStatus, setTableStatusManual]);

  const renderBookedActions = (booking: any) => {
    if (!currentModalTable) return null;
    const state = getBookingTimeState(booking);

    if (state.key === 'temporary') {
      return (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 space-y-4">
          <div className="flex items-start gap-3">
            <CheckCircle className="mt-0.5 text-emerald-600 shrink-0" size={20} />
            <p className="text-sm leading-relaxed text-emerald-950 font-semibold">
              Bàn này đã có lịch đặt lúc <strong>{booking.Gio_dat}</strong>. Bạn có thể tạo phiên tạm thời nhưng cần kết thúc trước <strong>{state.returnBy}</strong> để chuẩn bị bàn cho khách đặt trước.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              onClick={async () => {
                const phone = window.prompt('Nhập SĐT khách đại diện cho phiên tạm thời (10 chữ số):');
                const cleanPhone = phone?.replace(/\D/g, '') || '';
                if (cleanPhone.length !== 10) return alert('Số điện thoại không hợp lệ.');
                await startTableSession(currentModalTable.Ma_ban, cleanPhone, currentModalTable.Suc_chua, undefined, 'Khách vãng lai');
                setIsModalOpen(false);
                setSelectedTableId(null);
                alert(`Đã tạo phiên tạm thời. Vui lòng kết thúc trước ${state.returnBy} để chuẩn bị bàn.`);
              }}
              className="py-3 rounded-xl bg-emerald-600 text-white text-xs font-black uppercase tracking-wide hover:bg-emerald-700 shadow-sm"
            >
              TẠO PHIÊN TẠM THỜI
            </button>
            <button
              onClick={() => { setIsModalOpen(false); setSelectedTableId(null); }}
              className="py-3 rounded-xl border border-gray-300 bg-white text-gray-700 text-xs font-black uppercase tracking-wide hover:bg-gray-50"
            >
              CHỌN BÀN KHÁC
            </button>
          </div>
        </div>
      );
    }

    if (state.key === 'near') {
      return (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 space-y-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="mt-0.5 text-[#EE3124] shrink-0" size={20} />
            <p className="text-sm leading-relaxed text-red-950 font-semibold">
              Bàn này sắp đến giờ giữ bàn. Vui lòng không tạo phiên mới để đảm bảo phục vụ khách đã đặt trước.
            </p>
          </div>
          <button
            onClick={() => { setIsModalOpen(false); setSelectedTableId(null); }}
            className="w-full py-3 rounded-xl border border-gray-300 bg-white text-gray-700 text-xs font-black uppercase tracking-wide hover:bg-gray-50"
          >
            CHỌN BÀN KHÁC
          </button>
        </div>
      );
    }

    if (state.key === 'checkin') {
      return (
        <div className="space-y-3">
          <button
            onClick={() => handleStartBookingSession(booking.Ma_dat_ban, currentModalTable.Ma_ban, booking.So_dien_thoai)}
            className="w-full py-4 rounded-2xl bg-[#EE3124] text-white text-sm font-black uppercase tracking-wide hover:bg-[#D42A1E] shadow-lg"
          >
            BẮT ĐẦU PHIÊN PHỤC VỤ (CHECK-IN)
          </button>
          <p className="text-[11px] text-gray-500 text-center font-medium">
            Khi bấm, hệ thống kích hoạt bàn, tạo mã phiên tự động, gắn SĐT khách đại diện và chuyển bàn sang trạng thái “Có khách”.
          </p>
        </div>
      );
    }

    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-4 space-y-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="mt-0.5 text-[#EE3124] shrink-0" size={20} />
          <p className="text-sm leading-relaxed text-red-950 font-semibold">
            Lịch đặt đã quá thời gian giữ bàn 30 phút. Hệ thống đã tự động hủy lịch đặt và chuyển bàn về trạng thái trống.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            onClick={() => setIsModalOpen(false)}
            className="py-3 rounded-xl border border-gray-300 bg-white text-gray-700 text-xs font-black uppercase tracking-wide hover:bg-gray-50"
          >
            ĐÓNG
          </button>
          <button
            onClick={() => {
              setSelectedHistorySession(null);
              setIsModalOpen(false);
            }}
            className="py-3 rounded-xl bg-[#EE3124] text-white text-xs font-black uppercase tracking-wide hover:bg-[#D42A1E]"
          >
            XEM LỊCH SỬ ĐẶT BÀN
          </button>
        </div>
      </div>
    );
  };

  // Table capacity for validation (use when creating immediate session)
  const tableCapacity = currentModalTable?.Suc_chua ?? 12;

  // Compute receipt cost
  let sessionCost = 0;
  let dishesSpentList: { name: string; qty: number; total: number }[] = [];

  if (activeSessionOfModalTable) {
    const sessionOrders = orders.filter(o => o.Ma_phien === activeSessionOfModalTable.Ma_phien);
    sessionOrders.forEach(ord => {
      const details = orderDetails.filter(od => od.Ma_hd_dat_mon === ord.Ma_hd_dat_mon && od.Trang_thai_mon !== OrderItemStatus.DA_HUY);
      details.forEach(det => {
        const dName = dishes.find(d => d.Ma_mon === det.Ma_mon)?.Ten_mon || 'Đặc Sản Nấu Lẩu';
        const cost = det.Don_gia_tai_thoi_diem * det.So_luong;
        sessionCost += cost;

        const exist = dishesSpentList.find(dl => dl.name === dName);
        if (exist) {
          exist.qty += det.So_luong;
          exist.total += cost;
        } else {
          dishesSpentList.push({ name: dName, qty: det.So_luong, total: cost });
        }
      });
    });
  }

  // Generate dynamic active timer
  const getActiveTimer = (startTime: string) => {
    const elapsedMs = Date.now() - new Date(startTime).getTime();
    const elapsedMins = Math.floor(elapsedMs / 60000);
    const hrs = Math.floor(elapsedMins / 60);
    const mins = elapsedMins % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6 text-sm" id="receptionist-canvas">

      {/* 1. Header with custom visual identity logo & legends block */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm flex flex-col md:flex-row items-stretch overflow-hidden" id="reception-header-wrap">
        {/* Yellow-on-Red Traditional Brand Accent Box */}
        <div className="bg-[#EE3124] p-5 flex items-center justify-center shrink-0 w-full md:w-28 text-white">
          <GiaKhanhLogo size={70} className="shadow-none border-0" />
        </div>

        {/* Inside info content */}
        <div className="flex-1 p-6 flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6">
          <div className="space-y-1.5">
            <h2 className="text-xl font-sans font-extrabold text-gray-900 tracking-tight flex items-center space-x-2">
              <Compass size={22} className="text-[#EE3124] animate-spin-slow" />
              <span>Sơ Đồ Bàn - Chi Nhánh Gia Khánh</span>
            </h2>

            {/* Color Legends Legend Row */}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-gray-500 font-medium">
              <span className="flex items-center space-x-1.5">
                <span className="w-3 h-3 rounded-full bg-emerald-500 border border-emerald-600 block"></span>
                <span>Trống ({simStats.trong})</span>
              </span>
              <span className="flex items-center space-x-1.5">
                <span className="w-3 h-3 rounded-full bg-[#7B2CBF] border border-indigo-700 block animate-pulse"></span>
                <span>Đặt trước ({simStats.dat_truoc})</span>
              </span>
              <span className="flex items-center space-x-1.5">
                <span className="w-3 h-3 rounded-full bg-[#EE3124] border border-[#d6281e] block"></span>
                <span>Có khách ({simStats.phục_vụ})</span>
              </span>
            </div>
          </div>

          {/* Configuration and Date/Time selector: THỜI ĐIỂM XEM SƠ ĐỒ */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full xl:w-auto">
            <div className="w-full sm:w-auto">
              <div className="text-xs font-black uppercase text-gray-600 mb-1">THỜI ĐIỂM XEM SƠ ĐỒ</div>
              <div className="flex items-center gap-3">
                <div className="flex items-center space-x-2 bg-white border-2 border-[#EE3124] px-3 py-2 rounded-lg text-sm shadow-sm min-w-[220px]">
                  <Calendar size={16} className="text-[#EE3124] shrink-0" />
                  <input
                    type="date"
                    className="bg-transparent border-none font-extrabold text-[#EE3124] focus:outline-none cursor-pointer text-sm"
                    value={selectedCalendarDate}
                    min={getLocalDateValue()}
                    onChange={e => {
                      const val = e.target.value;
                      if (val < getLocalDateValue()) {
                        alert('Không được chọn ngày trong quá khứ để xem sơ đồ bàn.');
                        return;
                      }
                      setSelectedCalendarDate(val);
                      setIsViewingCurrent(false);
                      setSelectedTableId(null);
                    }}
                  />
                </div>

                <div className="flex items-center space-x-2 bg-white border-2 border-gray-300 px-3 py-2 rounded-lg text-sm shadow-sm min-w-[160px]">
                  <Clock size={16} className="text-gray-600 shrink-0" />
                  <input
                    type="time"
                    className="bg-transparent border-none font-bold text-gray-700 focus:outline-none text-sm"
                    value={selectedCalendarTime}
                    onChange={e => {
                      setSelectedCalendarTime(e.target.value);
                      setIsViewingCurrent(false);
                      setSelectedTableId(null);
                    }}
                  />
                </div>
                <button
                  onClick={() => {
                    const now = new Date();
                    setSelectedCalendarDate(getLocalDateValue(now));
                    setSelectedCalendarTime(getCurrentWorkingTimeValue());
                    setIsViewingCurrent(true);
                    setSelectedTableId(null);
                  }}
                  className="px-3 py-2 bg-[#EE3124] text-white rounded-lg text-xs font-black uppercase tracking-wider shadow-sm hover:bg-[#d6281e]"
                >
                  XEM HIỆN TẠI
                </button>
              </div>
              <div className="mt-2 text-sm text-gray-700">
                <span className="mr-2">Đang xem sơ đồ tại</span>
                <span className="font-mono font-bold">{selectedCalendarTime}</span>
                <span className="mx-2">ngày</span>
                <span className="font-mono font-bold">{selectedCalendarDate}</span>
              </div>
            </div>

            {/* Badges and search */}
            <div className="flex-1 flex items-center justify-between w-full gap-4">
              <div className="flex items-center gap-3">
                {/* mode badge */}
                {viewMode === 'REAL' ? (
                  <span className="px-3 py-1 rounded-full bg-red-600 text-white text-xs font-black uppercase">REAL-TIME</span>
                ) : viewMode === 'FUTURE' ? (
                  <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-black uppercase text-white bg-gradient-to-r from-[#7B2CBF] to-[#9B5CF0] shadow-sm ring-1 ring-[#7B2CBF]/20">
                    <BookmarkCheck size={12} className="opacity-95" />
                    XEM THEO LỊCH
                  </span>
                ) : (
                  <span className="px-3 py-1 rounded-full bg-gray-200 text-gray-700 text-xs font-black uppercase">CHẾ ĐỘ XEM LỊCH SỬ</span>
                )}
              </div>

              <div className="flex items-center gap-2 w-full md:w-auto">
                <div className="relative flex-1 md:w-96">
                  <Search className="absolute left-3.5 top-3.5 text-gray-400" size={16} />
                  <input
                    type="text"
                    placeholder="Tra cứu SĐT, Tên, Số bàn..."
                    className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 text-sm bg-white focus:bg-white font-semibold text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#EE3124] focus:ring-1 focus:ring-[#EE3124]/30 shadow-sm transition"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                  />
                </div>

                <button
                  onClick={() => {
                    alert(`Đã cập nhật góc nhìn sơ đồ: ${selectedCalendarDate} ${selectedCalendarTime}`);
                  }}
                  className="px-5 py-3 bg-[#EE3124] hover:bg-brand-red-dark text-white rounded-lg text-xs font-black uppercase tracking-widest transition shadow-md shrink-0 cursor-pointer flex items-center space-x-1"
                >
                  <Search size={14} />
                  <span>TÌM KIẾM</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Unified floor tabs selector on top of layout */}
      <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center bg-white p-2.5 rounded-xl border border-gray-200 gap-3 shadow-xs">
        {/* Floor level tabs matching image specs */}
        <div className="flex flex-wrap gap-1.5">
          {[1, 2, 3, 4].map(floor => (
            <button
              key={floor}
              onClick={() => {
                setActiveFloor(floor);
                setSelectedTableId(null);
              }}
              className={`py-2 px-6 rounded-xl hover:shadow-xs transition duration-150 text-xs font-black uppercase cursor-pointer ${activeFloor === floor
                  ? 'bg-gradient-to-r from-red-600 to-[#EE3124] text-white shadow-sm'
                  : 'bg-gray-50 text-gray-600 border border-gray-150 hover:bg-gray-100'
                }`}
            >
              TẦNG {floor}
            </button>
          ))}
        </div>
      </div>

      {/* 3. Blue-Architectural Map Grid (Full Width, No sidebar interference) */}
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm relative overflow-hidden" id="architectural-blueprint-desk">

        {/* Subtle background industrial grid pattern */}
        <div className="absolute inset-0 pointer-events-none opacity-5 bg-[linear-gradient(to_right,#808080_1px,transparent_1px),linear-gradient(to_bottom,#808080_1px,transparent_1px)] bg-[size:24px_24px]"></div>

        <div className="relative z-10 space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-gray-50 p-3 rounded-xl border border-gray-200 gap-2">
            <span className="font-sans font-extrabold text-gray-800 text-xs flex items-center space-x-1.5">
              <MapPin size={13} className="text-[#EE3124]" />
              <span className="uppercase text-gray-400 font-mono">Bản thiết kế mặt bằng:</span>
              <span className="text-[#EE3124]">CHỐT BÀN LẨU TỰ ĐỘNG - TẦNG {activeFloor}</span>
            </span>
            <span className="font-mono text-[9px] text-gray-400 font-black block tracking-widest uppercase bg-white border px-2 py-0.5 rounded">
              LẬP SƠ ĐỒ ĐỐI XỨNG CẦU THANG BẬC TRUNG TÂM
            </span>
          </div>

          {/* MAIN GRID WORKSPACE MAPPED PHYSICAL LAYOUT */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-6 gap-6 pt-2">

            {/* ROW 1: 6 Columns */}
            {currentFloorTables.slice(0, 6).map((table, idx) => {
              const matched = isSearchMatchedTable(table.Ma_ban);
              const simStatus = getTableSimulatedStatus(table.Ma_ban, table.Trang_thai);
              const booking = findTableBookingAtSelectedTime(table.Ma_ban);
              const session = sessions.find(s => s.Ma_ban === table.Ma_ban && s.Trang_thai === 'active');

              return (
                <div key={table.Ma_ban} className={!matched ? 'opacity-30' : ''}>
                  <TableCard
                    table={table}
                    simStatus={simStatus}
                    booking={booking}
                    session={session}
                    muted={viewMode === 'PAST'}
                    onClick={() => handleTableClick(table.Ma_ban)}
                  />
                </div>
              );
            })}

            {/* ROW 2: Slot 7, Slot 8, Slot 9, CẦU THANG (spans col 4 & 5), Slot 10 */}
            {currentFloorTables.slice(6, 9).map((table, idx) => {
              const matched = isSearchMatchedTable(table.Ma_ban);
              const simStatus = getTableSimulatedStatus(table.Ma_ban, table.Trang_thai);
              const booking = findTableBookingAtSelectedTime(table.Ma_ban);
              const session = sessions.find(s => s.Ma_ban === table.Ma_ban && s.Trang_thai === 'active');

              return (
                <div key={table.Ma_ban} className={!matched ? 'opacity-30' : ''}>
                  <TableCard
                    table={table}
                    simStatus={simStatus}
                    booking={booking}
                    session={session}
                    muted={viewMode === 'PAST'}
                    onClick={() => handleTableClick(table.Ma_ban)}
                  />
                </div>
              );
            })}

            {/* STAIRS WOODBLOCK: Covers Column 4 & 5 of Row 2 */}
            <div className="md:col-span-2 bg-white border-2 border-dashed border-gray-300 rounded-xl p-4 flex flex-col justify-between h-32 relative overflow-hidden group hover:shadow-xs transition">
              <div className="absolute top-0 right-0 w-12 h-12 bg-gray-50 rounded-full blur-lg"></div>
              <div className="flex justify-between items-center pb-1 border-b border-gray-200">
                <span className="font-sans font-black text-[10px] text-gray-800 uppercase tracking-widest flex items-center space-x-1">
                  <Layers size={11} className="text-[#EE3124]" />
                  <span>Cầu Thang Bộ</span>
                </span>
                <span className="font-mono text-[8px] font-bold text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">GIAO THÔNG ĐỨNG</span>
              </div>

              {/* Steps graphics */}
              <div className="space-y-1.5 py-2">
                <div className="h-1 bg-gray-150 rounded"></div>
                <div className="h-1 bg-gray-200 rounded w-11/12 mx-auto"></div>
                <div className="h-1 bg-gray-250 rounded w-10/12 mx-auto"></div>
                <div className="h-1 bg-gray-300 rounded w-9/12 mx-auto"></div>
              </div>

              <div className="flex justify-between items-center text-[9px] font-bold text-gray-600">
                <span className="flex items-center space-x-0.5">
                  <ArrowDownLeft size={10} className="text-[#EE3124]" />
                  <span>Lên Tầng {activeFloor === 4 ? 4 : activeFloor + 1}</span>
                </span>
                <span className="flex items-center space-x-0.5">
                  <span>Xuống sảnh</span>
                  <ArrowUpRight size={10} className="text-[#EE3124]" />
                </span>
              </div>
            </div>

            {/* Slot 10 (Last table of Row 2) */}
            {currentFloorTables.slice(9, 10).map((table) => {
              const matched = isSearchMatchedTable(table.Ma_ban);
              const simStatus = getTableSimulatedStatus(table.Ma_ban, table.Trang_thai);
              const booking = findTableBookingAtSelectedTime(table.Ma_ban);
              const session = sessions.find(s => s.Ma_ban === table.Ma_ban && s.Trang_thai === 'active');

              return (
                <div key={table.Ma_ban} className={!matched ? 'opacity-30' : ''}>
                  <TableCard
                    table={table}
                    simStatus={simStatus}
                    booking={booking}
                    session={session}
                    muted={viewMode === 'PAST'}
                    onClick={() => handleTableClick(table.Ma_ban)}
                  />
                </div>
              );
            })}

            {/* ROW 3: Slot 11, Slot 12, Slot 13, Slot 14, and BALCONY/GREEN GARDEN (spans last 2 columns) */}
            {currentFloorTables.slice(10, 14).map((table, idx) => {
              const matched = isSearchMatchedTable(table.Ma_ban);
              const simStatus = getTableSimulatedStatus(table.Ma_ban, table.Trang_thai);
              const booking = findTableBookingAtSelectedTime(table.Ma_ban);
              const session = sessions.find(s => s.Ma_ban === table.Ma_ban && s.Trang_thai === 'active');

              return (
                <div key={table.Ma_ban} className={!matched ? 'opacity-30' : ''}>
                  <TableCard
                    table={table}
                    simStatus={simStatus}
                    booking={booking}
                    session={session}
                    muted={viewMode === 'PAST'}
                    onClick={() => handleTableClick(table.Ma_ban)}
                  />
                </div>
              );
            })}

            {/* GARDEN/BALCONY BOX (CONDITIONAL): Covers Column 5 & 6 of Row 3 */}
            {activeFloor === 1 ? (
              <div className="md:col-span-2 bg-white border-2 border-dashed border-red-200 rounded-lg p-4 flex flex-col justify-between h-32 relative">
                <div className="flex justify-between items-center pb-1 border-b border-red-100">
                  <span className="font-sans font-black text-[10px] text-red-850 uppercase tracking-widest flex items-center space-x-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#EE3124] inline-block animate-ping"></span>
                    <span>Cổng Ra Vào sảnh chính</span>
                  </span>
                  <span className="font-mono text-[8px] font-bold text-white bg-[#EE3124] px-1.5 py-0.5 rounded">SẢNH ĐÓN TIẾP</span>
                </div>

                <p className="text-[10px] text-gray-600 leading-relaxed font-sans font-semibold py-1">
                  Khu vực cổng sảnh chính của nhà hàng. Vui lòng để thông thoáng lối đi để Lễ Tân tiếp đón.
                </p>

                <div className="text-[8px] text-gray-400 font-mono tracking-wider flex justify-between uppercase">
                  <span>Lối vào chính</span>
                  <span>Sơ đồ tầng 1</span>
                </div>
              </div>
            ) : (
              <div className="md:col-span-2 bg-white border-2 border-dashed border-gray-300 rounded-lg p-4 flex flex-col justify-between h-32 relative">
                <div className="flex justify-between items-center pb-1 border-b border-gray-200">
                  <span className="font-sans font-black text-[10px] text-gray-700 uppercase tracking-widest flex items-center space-x-1">
                    <Sparkles size={11} className="text-emerald-600" />
                    <span>Ban Công Scenic</span>
                  </span>
                  <span className="font-mono text-[8px] font-bold text-emerald-600 bg-emerald-55 px-1.5 py-0.5 rounded">KHU Ô CÂY XANH</span>
                </div>

                <p className="text-[10px] text-gray-400 italic py-1.5 font-sans">
                  Không gian thoáng mát tự nhiên, phối cảnh ô xanh trang trí hài hòa.
                </p>

                <div className="text-[8px] text-gray-400 font-mono tracking-wider flex justify-between uppercase">
                  <span>Ban công thoáng</span>
                  <span>Không gian mở</span>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>

      {/* 4. RECEPTIONIST SESSIONS & DISH ORDER LOGS HISTORIC PANEL */}
      <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm relative overflow-hidden mt-6" id="receptionist-history-panel">
        <div className="absolute inset-0 pointer-events-none opacity-5 bg-[linear-gradient(to_right,#808080_1px,transparent_1px),linear-gradient(to_bottom,#808080_1px,transparent_1px)] bg-[size:24px_24px]"></div>

        <div className="relative z-10 space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-gray-50 p-4 border border-gray-200 gap-2 rounded-lg">
            <div>
              <span className="font-sans font-black text-xs text-[#EE3124] uppercase tracking-widest flex items-center space-x-1.5">
                <BookOpen size={14} />
                <span>📚 Lịch Sử Phiên Phục Vụ & Hồ Sơ Đặt Món Lễ Tân</span>
              </span>
              <p className="text-[10px] text-gray-500 mt-0.5">Sổ theo dõi trực tiếp các đơn gọi món lẩu nấm, giờ giấc và đối chiếu bill thanh toán tại quầy.</p>
            </div>

            <div className="text-[9px] text-[#EE3124] bg-red-50 border border-red-150 font-mono tracking-wider px-2 py-1 rounded font-black max-w-fit shrink-0">
              {sessions.length} PHIÊN GHI NHẬN HÔM NAY
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* Left list: Logs stream */}
            <div className="lg:col-span-7 space-y-3">
              <div className="flex justify-between items-center pb-2 border-b border-gray-150">
                <span className="text-[10px] text-gray-400 font-extrabold uppercase tracking-wider block">Danh sách Phiên liên hệ</span>
                <span className="text-[9px] text-gray-400 font-mono">Tự động cập nhật</span>
              </div>

              <div className="space-y-2.5 max-h-96 overflow-y-auto pr-1">
                {sessions.map((sess) => {
                  const bill = (() => {
                    let cost = 0;
                    const sessionOrders = orders.filter(o => o.Ma_phien === sess.Ma_phien);
                    sessionOrders.forEach(ord => {
                      const details = orderDetails.filter(od => od.Ma_hd_dat_mon === ord.Ma_hd_dat_mon && od.Trang_thai_mon !== OrderItemStatus.DA_HUY);
                      details.forEach(det => {
                        cost += det.Don_gia_tai_thoi_diem * det.So_luong;
                      });
                    });
                    return cost;
                  })();

                  const isSessActive = sess.Trang_thai === 'active';
                  const isSelected = selectedHistorySession === sess.Ma_phien;

                  // Format dates nicely
                  const enterTime = new Date(sess.Thoi_gian_bat_dau).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
                  const leaveTime = sess.Thoi_gian_ket_thuc
                    ? new Date(sess.Thoi_gian_ket_thuc).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
                    : '--:--';

                  return (
                    <div
                      key={sess.Ma_phien}
                      onClick={() => setSelectedHistorySession(sess.Ma_phien)}
                      className={`p-3.5 rounded-lg border-2 text-left cursor-pointer transition flex items-center justify-between ${isSelected
                          ? 'bg-[#EE3124]/5 border-[#EE3124] shadow-sm'
                          : 'bg-white border-gray-200 hover:border-gray-300'
                        }`}
                    >
                      <div className="space-y-1 sm:space-y-1.5 flex-1 min-w-0 pr-3">
                        <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                          <span className={`text-[10px] font-black uppercase font-mono px-2 py-0.5 rounded ${isSessActive
                              ? 'bg-rose-100 text-rose-700 border border-rose-200 animate-pulse'
                              : 'bg-gray-100 text-gray-600 border border-gray-200'
                            }`}>
                            BÀN {sess.Ma_ban}
                          </span>

                          <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded text-gray-500 bg-gray-50 border`}>
                            {isSessActive ? '🔴 ONLINE' : '⚪ HỒ SƠ LƯU'}
                          </span>
                        </div>

                        <div className="text-xs text-gray-700 leading-none">
                          Khách hàng: <strong className="font-mono text-gray-900">{sess.Ma_phien_code || 'Khách vãng vãng'}</strong>
                        </div>

                        <div className="text-[10px] text-gray-400 font-mono flex items-center space-x-2">
                          <span>Vào: {enterTime}</span>
                          <span>•</span>
                          <span>Ra: {leaveTime}</span>
                        </div>
                      </div>

                      <div className="text-right space-y-1 shrink-0">
                        <div className="text-[9px] text-gray-400 font-bold font-mono tracking-widest uppercase">Trị giá bill</div>
                        <div className="text-sm font-mono font-black text-[#EE3124]">{bill.toLocaleString()}đ</div>
                        <div className="text-[9px] text-indigo-600 font-extrabold hover:underline">Chi tiết ➔</div>
                      </div>
                    </div>
                  );
                })}

                {sessions.length === 0 && (
                  <p className="text-center text-gray-400 italic py-10 text-xs">Chưa có phiên phục vụ nào được ghi nhận thực tế.</p>
                )}
              </div>
            </div>

            {/* Right component detail: Selected details */}
            <div className="lg:col-span-5">
              <div className="bg-gray-50/50 p-4 border border-gray-200 rounded-lg h-full min-h-[300px] flex flex-col justify-between">
                {selectedHistorySession ? (() => {
                  const currentSess = sessions.find(s => s.Ma_phien === selectedHistorySession);
                  if (!currentSess) return null;

                  // Calculation
                  let cost = 0;
                  let list: { name: string; qty: number; total: number }[] = [];
                  const sessionOrders = orders.filter(o => o.Ma_phien === selectedHistorySession);
                  sessionOrders.forEach(ord => {
                    const details = orderDetails.filter(od => od.Ma_hd_dat_mon === ord.Ma_hd_dat_mon && od.Trang_thai_mon !== OrderItemStatus.DA_HUY);
                    details.forEach(det => {
                      const dName = dishes.find(d => d.Ma_mon === det.Ma_mon)?.Ten_mon || 'Đặc Sản Nấu Lẩu';
                      const itemCost = det.Don_gia_tai_thoi_diem * det.So_luong;
                      cost += itemCost;

                      const exist = list.find(dl => dl.name === dName);
                      if (exist) {
                        exist.qty += det.So_luong;
                        exist.total += itemCost;
                      } else {
                        list.push({ name: dName, qty: det.So_luong, total: itemCost });
                      }
                    });
                  });

                  return (
                    <div className="space-y-4 flex-1 flex flex-col justify-between">
                      <div className="space-y-3">
                        {/* Header metadata */}
                        <div className="border-b pb-3 border-gray-200">
                          <span className="text-[8px] bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded font-black uppercase tracking-wider block max-w-fit">
                            CHI TIẾT MÓN ĂN GỌI TRONG PHIÊN
                          </span>
                          <h4 className="font-extrabold text-[#EE3124] text-sm mt-1.5 font-mono">
                            BÀN {currentSess.Ma_ban} • SĐT: {currentSess.Ma_phien_code}
                          </h4>
                          <p className="text-[9px] text-gray-400 mt-0.5 font-mono leading-relaxed">
                            Mã phiên ID: <span className="font-bold">{currentSess.Ma_phien.slice(0, 12)}...</span>
                          </p>
                        </div>

                        {/* List items */}
                        <div className="space-y-2">
                          <span className="text-[10px] text-gray-400 font-extrabold block uppercase tracking-wider">Danh sách món ăn:</span>
                          <div className="bg-white p-3 rounded border border-gray-200 space-y-2 max-h-60 overflow-y-auto font-mono text-xs">
                            {list.map((dl, idx) => (
                              <div key={idx} className="flex justify-between items-center border-b border-gray-100 pb-1.5 last:border-b-0">
                                <span className="text-gray-400 font-bold">x{dl.qty}</span>
                                <span className="flex-1 font-bold truncate ml-2 text-gray-700 font-sans">{dl.name}</span>
                                <span className="font-bold text-gray-950">{dl.total.toLocaleString()}đ</span>
                              </div>
                            ))}

                            {list.length === 0 && (
                              <p className="text-center text-gray-400 italic py-8">Chưa ghi nhận món ăn nào phát sinh.</p>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Totals */}
                      <div className="pt-4 border-t border-gray-250 mt-4 space-y-3">
                        <div className="flex justify-between items-center text-xs">
                          <span className="font-bold text-gray-400 uppercase tracking-widest font-sans">TỔNG TOÀN TIỀN</span>
                          <span className="text-lg font-mono font-black text-[#EE3124]">{cost.toLocaleString()}đ</span>
                        </div>
                      </div>
                    </div>
                  );
                })() : (
                  <div className="flex flex-col items-center justify-center text-center p-6 h-full flex-1 my-auto">
                    <FileText size={28} className="text-gray-300 animate-pulse mb-2.5" />
                    <span className="font-bold text-xs text-gray-650 block uppercase">Hồ Sơ Hóa Đơn Lĩnh Vực</span>
                    <p className="text-[10px] text-gray-405 mt-1 leading-relaxed px-4">
                      Vui lòng chọn một phiên phục vụ ở danh sách bên cạnh để đối soát các món lẩu nấm đã đặt.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 5. MAIN INTERACTIVE OVERLAY CENTER MODAL (Booking & Session Management Panel) */}
      {isModalOpen && currentModalTable && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-[#FAF9F6] border-2 border-gray-400 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl relative animate-in fade-in zoom-in">

            {/* Modal Custom header bar */}
            <div className="bg-[#EE3124] text-white px-6 py-4 flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <GiaKhanhLogo size={42} className="shadow-none border border-white/20 rounded-lg p-0.5 bg-white shrink-0" />
                <div>
                  <h3 className="font-black text-sm tracking-wide uppercase">CỬA SỔ QUẢN LÝ BÀN {currentModalTable.Ma_ban}</h3>
                  <p className="text-[10px] text-white/80 font-mono">TẦNG {currentModalTable.Tang} • SỨC CHỨA CHUẨN {currentModalTable.Suc_chua} NGƯỜI</p>
                </div>
              </div>

              <button
                onClick={() => {
                  setIsModalOpen(false);
                  setSelectedTableId(null);
                }}
                className="text-white hover:bg-white/20 p-2 rounded-xl transition cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Internal Content Area */}
            <div className="p-5 space-y-5">

              {/* SUCCESS CHIME FEEDBACK BANNER */}
              {showManualBookingSuccess && (
                <div className="p-3 bg-emerald-50 border border-emerald-150 rounded-lg text-xs text-emerald-800 flex items-start space-x-2 animate-bounce">
                  <CheckCircle size={16} className="text-emerald-600 mt-0.5 shrink-0" />
                  <div>
                    <span className="font-bold block">Ghi nhận đặt lịch thành công!</span>
                    <span className="text-[10px]">Đã cập nhật sơ đồ bàn ăn cho thời gian đã chọn.</span>
                  </div>
                </div>
              )}

              {/* Case 1: FREE / TRONG -> Show quick booking or immediate checkout */}
              {simulatedStatusOfCurrentModal === TableStatus.TRONG && (
                <div className="space-y-4">
                  <div className="bg-emerald-55/70 p-4 border border-emerald-200 rounded-lg flex items-center space-x-3">
                    <CheckCircle size={24} className="text-emerald-600 shrink-0" />
                    <div>
                      <span className="font-bold text-emerald-950 text-xs uppercase block">Bàn đang trống sẵn sàng</span>
                      <p className="text-[10px] text-gray-500 mt-0.5">Trạng thái: Khả dụng lúc {selectedCalendarTime} ngày {selectedCalendarDate}</p>
                    </div>
                  </div>

                  {/* Immediate activation layout (Bắt đầu phiên) */}
                  <div className="bg-amber-50/40 border border-amber-200 p-4 rounded-lg space-y-3">
                    <div className="flex items-center space-x-1">
                      <Play size={13} className="text-amber-600 fill-current" />
                      <span className="font-black text-xs text-amber-900 uppercase">TẠO PHIÊN SỬ DỤNG BÀN</span>
                    </div>

                    <form onSubmit={async (e) => {
                      e.preventDefault();
                      if (instantPhone.trim().length !== 10) {
                        alert("Số điện thoại phải gồm 10 chữ số.");
                        return;
                      }
                      try {
                        if (instantGuests < 1 || instantGuests > tableCapacity) {
                          return;
                        }
                        await startTableSession(currentModalTable.Ma_ban, instantPhone.trim(), instantGuests, undefined, instantCustomerName);
                        setInstantPhone('');
                        setInstantCustomerName('');
                        setInstantGuests(currentModalTable?.Suc_chua ?? 4);
                        setIsModalOpen(false);
                        setSelectedTableId(null);
                        alert(`Đã BẮT ĐẦU PHIÊN và kích hoạt phục vụ cho bàn ${currentModalTable.Ma_ban}!`);
                      } catch (err: any) {
                        alert(err.message || 'Mở bàn không thành công.');
                      }
                    }} className="space-y-3">
                      <div className="space-y-3">
                        <div className="space-y-1">
                          <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                            TÊN KHÁCH ĐẠI DIỆN <span className="font-medium normal-case text-gray-400">Không bắt buộc</span>
                          </label>
                          <div className="relative">
                            <User className="absolute left-2.5 top-2.5 text-gray-400" size={12} />
                            <input
                              type="text"
                              placeholder="Nhập tên khách nếu có"
                              className="w-full pl-7 pr-2 py-2 border border-gray-250 bg-white rounded-lg text-xs font-bold focus:border-[#EE3124] focus:outline-none"
                              value={instantCustomerName}
                              onChange={e => setInstantCustomerName(e.target.value)}
                            />
                          </div>
                        </div>

                        <div className="space-y-1">
                          <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                            SĐT KHÁCH ĐẠI DIỆN <span className="text-red-500 font-bold">*</span>
                          </label>
                          <div className="relative">
                            <Phone className="absolute left-2.5 top-2.5 text-gray-400" size={12} />
                            <input
                              type="tel"
                              required
                              placeholder="Nhập SĐT 10 chữ số"
                              className="w-full pl-7 pr-2 py-2 border border-gray-250 bg-white rounded-lg text-xs font-bold focus:border-[#EE3124] focus:outline-none"
                              value={instantPhone}
                              onChange={e => {
                                const val = e.target.value.replace(/\D/g, '').slice(0, 10);
                                setInstantPhone(val);
                              }}
                            />
                          </div>
                          {instantPhone.length > 0 && instantPhone.length < 10 && (
                            <p className="text-[10px] text-[#EE3124] font-bold mt-0.5">Số điện thoại phải gồm 10 chữ số.</p>
                          )}
                        </div>

                        <div className="space-y-1">
                          <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                            SỐ LƯỢNG KHÁCH <span className="text-red-500 font-bold">*</span>
                          </label>
                          <div className="relative flex items-center border border-gray-250 rounded-lg bg-white px-2.5 py-1.5">
                            <User size={12} className="text-gray-400 shrink-0 mr-1.5" />
                            <input
                              type="number"
                              min={1}
                              required
                              placeholder="Nhập số lượng khách"
                              className="w-full py-0.5 text-xs font-bold text-gray-800 focus:outline-none"
                              value={instantGuests}
                              onChange={e => {
                                const raw = Number(e.target.value) || 1;
                                setInstantGuests(Math.max(1, raw));
                              }}
                            />
                          </div>
                          {instantGuests > tableCapacity ? (
                            <p className="text-[10px] text-[#EE3124] font-bold">Số khách vượt quá sức chứa bàn.</p>
                          ) : (
                            <p className="text-[10px] text-gray-500 font-medium">Tối đa {tableCapacity} khách.</p>
                          )}
                        </div>
                      </div>

                      <button
                        type="submit"
                        disabled={instantPhone.length !== 10 || instantGuests < 1 || instantGuests > tableCapacity || viewMode === 'PAST'}
                        className={`w-full py-2.5 font-extrabold text-xs rounded-lg uppercase transition cursor-pointer text-center ${(instantPhone.length === 10 && instantGuests >= 1 && instantGuests <= tableCapacity)
                            ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-md'
                            : 'bg-gray-200 text-gray-400 cursor-not-allowed border border-gray-300 shadow-none'
                          }`}
                      >
                        BẮT ĐẦU PHIÊN PHỤC VỤ
                      </button>
                    </form>
                  </div>

                  {/* Custom book reservation */}
                  <div className="bg-indigo-50/50 border border-indigo-150 p-4 rounded-lg space-y-3">
                    <div className="border-b pb-2 mb-1 border-indigo-100 flex items-center space-x-1.5">
                      <BookmarkCheck size={14} className="text-purple-600" />
                      <span className="font-extrabold text-xs text-purple-900 uppercase">ĐẶT BÀN TRƯỚC (CHỌN LỊCH CHO KHÁCH)</span>
                    </div>

                    {/* Booking form: HỌ TÊN, SỐ ĐT, NGÀY ĐẶT, GIỜ ĐẶT */}
                    <form onSubmit={e => handleBookTableDirect(e, currentModalTable.Ma_ban)} className="space-y-3">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[9px] font-bold text-gray-600 uppercase tracking-wider mb-1">HỌ TÊN KHÁCH *</label>
                          <div className="relative">
                            <User className="absolute left-2.5 top-3 text-gray-400" size={14} />
                            <input
                              type="text"
                              placeholder="Nhập họ tên khách đặt bàn"
                              className="w-full pl-10 pr-2 py-2 border border-gray-200 bg-white rounded-lg text-sm font-semibold focus:border-purple-500 focus:outline-none"
                              value={bookName}
                              onChange={e => setBookName(e.target.value)}
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-[9px] font-bold text-gray-600 uppercase tracking-wider mb-1">SỐ ĐIỆN THOẠI *</label>
                          <div className="relative">
                            <Phone className="absolute left-2.5 top-3 text-gray-400" size={14} />
                            <input
                              type="tel"
                              placeholder="Nhập số điện thoại khách"
                              className="w-full pl-10 pr-2 py-2 border border-gray-200 bg-white rounded-lg text-sm font-mono font-semibold focus:border-purple-500 focus:outline-none"
                              value={bookPhone}
                              onChange={e => {
                                setBookPhone(e.target.value);
                                if (e.target.value && !/^\d{10}$/.test(e.target.value)) {
                                  setPhoneError("Số điện thoại phải gồm 10 chữ số");
                                } else {
                                  setPhoneError("");
                                }
                              }}
                            />
                            {phoneError && <p className="text-xs text-red-600 mt-1">{phoneError}</p>}
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[9px] font-bold text-gray-600 uppercase tracking-wider mb-1">NGÀY ĐẶT</label>
                          <div className="relative">
                            <Calendar className="absolute left-2.5 top-3 text-gray-400" size={14} />
                            <input
                              type="date"
                              title="Chọn ngày đặt"
                              min={getLocalDateValue()}
                              className="w-full pl-10 pr-2 py-2 border border-gray-200 bg-white rounded-lg text-sm font-semibold focus:border-purple-500 focus:outline-none"
                              value={selectedCalendarDate}
                              onChange={e => {
                                const val = e.target.value;
                                if (!bookingDateIsTodayOrAfter(val)) {
                                  setBookingDateError('Ngày đặt không được ở quá khứ');
                                  return;
                                }
                                setSelectedCalendarDate(val);
                                setBookingDateError('');
                                setBookingTimeError('');
                                setIsViewingCurrent(false);
                              }}
                            />
                          </div>
                          {bookingDateError && (
                            <p className="mt-1.5 text-[10px] font-bold text-[#EE3124]">{bookingDateError}</p>
                          )}
                        </div>

                        <div>
                          <label className="block text-[9px] font-bold text-gray-600 uppercase tracking-wider mb-1">GIỜ ĐẶT</label>
                          <div className="relative">
                            <Clock className="absolute left-2.5 top-3 text-gray-400" size={14} />
                            <select
                              title="Chọn giờ đặt"
                              className="w-full pl-10 pr-2 py-2 border border-gray-200 bg-white rounded-lg text-sm font-semibold focus:border-purple-500 focus:outline-none appearance-none"
                              value={bookingTimeIsInAllowedWindow(selectedCalendarTime) ? selectedCalendarTime : ''}
                              onChange={e => {
                                setSelectedCalendarTime(e.target.value);
                                setBookingTimeError('');
                                setIsViewingCurrent(false);
                              }}
                            >
                              <option value="" disabled>Chọn giờ đặt</option>
                              {bookingTimeOptions.map(option => (
                                <option key={option} value={option}>{option}</option>
                              ))}
                            </select>
                          </div>
                          {bookingTimeError && (
                            <p className="mt-1.5 text-[10px] font-bold text-[#EE3124]">{bookingTimeError}</p>
                          )}
                        </div>
                      </div>

                      {/* Time validation - must be future */}
                      <div>
                        {/* No inline warning shown while selecting giờ. Validation is handled on submit only. */}
                      </div>

                      <button
                        type="submit"
                        disabled={!(bookName.trim() && /^\d{10}$/.test(bookPhone) && bookingTimeIsInAllowedWindow(selectedCalendarTime))}
                        className={`w-full py-2 ${bookName.trim() && /^\d{10}$/.test(bookPhone) && bookingTimeIsInAllowedWindow(selectedCalendarTime) ? 'bg-purple-600 hover:bg-purple-700 text-white' : 'bg-gray-200 text-gray-500 cursor-not-allowed'} font-extrabold text-xs rounded-lg flex items-center justify-center space-x-1.5 transition`}
                      >
                        <PlusCircle size={13} />
                        <span>ĐẶT TRƯỚC</span>
                      </button>
                    </form>
                  </div>
                </div>
              )}

              {/* Case 2: BOOKED -> reservation management */}
              {simulatedStatusOfCurrentModal === 'BOOKED' && bookedOfModalTable && (() => {
                const bookingState = getBookingTimeState(bookedOfModalTable);
                const guestCount = getReservationGuestCount(bookedOfModalTable, currentModalTable.Suc_chua);
                const phoneText = showFullPhone ? bookedOfModalTable.So_dien_thoai : maskPhoneNumber(bookedOfModalTable.So_dien_thoai);
                const stateClasses = getBookingStateClasses(bookingState.tone);

                return (
                  <div className="space-y-5">
                    <div className="rounded-3xl border border-purple-200 bg-white shadow-sm overflow-hidden">
                      <div className="bg-purple-50/80 border-b border-purple-100 px-5 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <div className="space-y-2">
                          <span className="inline-flex w-fit items-center rounded-full bg-purple-600 px-3 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-white">
                            KHÁCH ĐÃ ĐẶT LỊCH
                          </span>
                          <div>
                            <h4 className="text-xl font-black text-gray-950 tracking-tight">{bookedOfModalTable.Ten_khach_hang}</h4>
                            <p className="text-xs font-semibold text-gray-500 mt-1">Trạng thái: Đang chờ khách đến</p>
                          </div>
                        </div>
                        <span className={`inline-flex items-center justify-center rounded-full border px-3 py-2 text-[10px] font-black uppercase tracking-wide ${stateClasses}`}>
                          {bookingState.label}
                        </span>
                      </div>

                      <div className="p-5 space-y-5">
                        {autoCancelInfo && (
                          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-900">
                            {autoCancelInfo}
                          </div>
                        )}

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
                            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-gray-500">Số điện thoại</p>
                            <div className="mt-2 flex items-center justify-between gap-3">
                              <span className="font-mono text-lg font-black text-gray-950">{phoneText}</span>
                              <button
                                type="button"
                                onClick={() => {
                                  if (showFullPhone) {
                                    window.open(`tel:${bookedOfModalTable.So_dien_thoai}`);
                                    return;
                                  }
                                  setShowCallConfirm(true);
                                }}
                                className="inline-flex items-center gap-1.5 rounded-xl border border-gray-300 bg-white px-3 py-2 text-[11px] font-black uppercase text-gray-700 hover:border-[#EE3124] hover:text-[#EE3124]"
                              >
                                <Phone size={14} />
                                GỌI KHÁCH
                              </button>
                            </div>
                          </div>

                          <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
                            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-gray-500">Số khách</p>
                            <p className="mt-2 text-lg font-black text-gray-950">{guestCount} người</p>
                          </div>

                          <div className="rounded-2xl border border-gray-200 bg-white p-4">
                            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-gray-500">Ngày giữ bàn</p>
                            <p className="mt-2 text-base font-black text-gray-950">{formatDisplayDate(bookedOfModalTable.Ngay_dat)}</p>
                          </div>

                          <div className="rounded-2xl border border-gray-200 bg-white p-4">
                            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-gray-500">Giờ giữ bàn</p>
                            <p className="mt-2 text-base font-black text-gray-950">{bookedOfModalTable.Gio_dat}</p>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                          {[
                            'ĐẶT TRƯỚC - CHỜ KHÁCH',
                            'CÒN CÓ THỂ TẠO PHIÊN TẠM',
                            'SẮP ĐẾN GIỜ GIỮ BÀN',
                            'QUÁ GIỜ GIỮ BÀN',
                            'ĐÃ HỦY DO QUÁ GIỜ'
                          ].map(label => {
                            const active = bookingState.label === label;
                            const isGreen = label === 'CÒN CÓ THỂ TẠO PHIÊN TẠM' || label === 'ĐÃ HỦY DO QUÁ GIỜ';
                            const isRed = label === 'SẮP ĐẾN GIỜ GIỮ BÀN' || label === 'QUÁ GIỜ GIỮ BÀN';
                            return (
                              <span
                                key={label}
                                className={`min-h-12 rounded-xl border px-2 py-2 text-center text-[9px] font-black uppercase leading-tight flex items-center justify-center ${
                                  active
                                    ? isGreen
                                      ? 'border-emerald-300 bg-emerald-100 text-emerald-800'
                                      : isRed
                                        ? 'border-red-300 bg-red-100 text-red-800'
                                        : 'border-purple-300 bg-purple-100 text-purple-800'
                                    : 'border-gray-200 bg-gray-50 text-gray-400'
                                }`}
                              >
                                {label}
                              </span>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                    {renderBookedActions(bookedOfModalTable)}
                  </div>
                );
              })()}

              {showCallConfirm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                  <div className="absolute inset-0 bg-black/40" onClick={() => setShowCallConfirm(false)} />
                  <div className="relative w-full max-w-sm bg-white rounded-3xl border border-gray-200 p-5 z-10 shadow-2xl">
                    <div className="flex items-start gap-3">
                      <div className="h-10 w-10 rounded-2xl bg-red-50 text-[#EE3124] flex items-center justify-center shrink-0">
                        <Phone size={18} />
                      </div>
                      <div>
                        <p className="font-black text-gray-950 leading-snug">Bạn muốn hiển thị số điện thoại đầy đủ để liên hệ khách?</p>
                        <p className="text-sm text-gray-500 mt-2">Số điện thoại sẽ được mở đầy đủ trong popup quản lý bàn sau khi xác nhận.</p>
                      </div>
                    </div>
                    <div className="flex gap-3 mt-5">
                      <button
                        onClick={() => setShowCallConfirm(false)}
                        className="flex-1 py-3 border border-gray-300 rounded-xl text-xs font-black uppercase text-gray-700 hover:bg-gray-50"
                      >
                        HỦY
                      </button>
                      <button
                        onClick={() => { setShowFullPhone(true); setShowCallConfirm(false); }}
                        className="flex-1 py-3 bg-[#EE3124] text-white rounded-xl text-xs font-black uppercase hover:bg-[#D42A1E]"
                      >
                        HIỂN THỊ
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {showLateBookingConfirm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                  <div className="absolute inset-0 bg-black/40" onClick={() => setShowLateBookingConfirm(false)} />
                  <div className="relative w-full max-w-md bg-white rounded-3xl border border-yellow-200 p-6 z-10 shadow-2xl">
                    <div className="flex items-center gap-3 mb-4">
                      <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-yellow-100 text-yellow-700 text-lg">⚠️</span>
                      <h3 className="text-base font-black text-gray-900">Lưu ý giờ đóng cửa</h3>
                    </div>
                    <p className="text-sm text-gray-700 leading-relaxed">⚠️ Lưu ý: Nhà hàng sẽ đóng cửa vào lúc {CLOSING_TIME_LABEL}. Bạn có chắc chắn vẫn muốn giữ khung giờ đặt bàn này không?</p>
                    <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                      <button
                        onClick={() => {
                          if (pendingBookingTableId) {
                            createReservation(pendingBookingTableId);
                          }
                          setShowLateBookingConfirm(false);
                          setPendingBookingTableId(null);
                        }}
                        className="flex-1 py-3 bg-[#EE3124] text-white rounded-lg font-black uppercase hover:bg-[#d6281e]"
                      >
                        Tiếp tục đặt
                      </button>
                      <button
                        onClick={() => setShowLateBookingConfirm(false)}
                        className="flex-1 py-3 border border-gray-300 bg-white text-gray-700 rounded-lg font-black uppercase hover:bg-gray-50"
                      >
                        Thay đổi giờ
                      </button>
                    </div>
                  </div>
                </div>
              )}


              {/* Case 4: ACTIVE / CO_KHACH -> Consumption session monitoring and billing */}
              {simulatedStatusOfCurrentModal === TableStatus.CO_KHACH && activeSessionOfModalTable && (
                <div className="space-y-6">
                  <div className="rounded-3xl border border-red-200 bg-red-50 p-5 shadow-sm">
                    <div className="flex items-center justify-between gap-4">
                      <div className="space-y-2">
                        <p className="text-[9px] uppercase tracking-[0.35em] text-[#B91C1C] font-black">PHIÊN PHỤC VỤ TRỰC TIẾP (LIVE)</p>
                        <h3 className="text-lg font-black uppercase tracking-[0.05em] text-gray-900">Mã phiên: {formatSessionCode(activeSessionOfModalTable)}</h3>
                      </div>
                      <span className="rounded-full border border-red-200 bg-white px-4 py-2 text-[10px] font-black uppercase text-[#991B1B]">LIVE</span>
                    </div>

                    <div className="grid grid-cols-1 gap-3 mt-5 sm:grid-cols-2">
                      <div className="rounded-2xl bg-white p-4 border border-gray-200 shadow-sm">
                        <p className="text-[10px] uppercase tracking-[0.2em] text-gray-500 font-black">Mã phiên</p>
                        <p className="mt-2 text-sm font-black text-gray-900">{formatSessionCode(activeSessionOfModalTable)}</p>
                      </div>
                      <div className="rounded-2xl bg-white p-4 border border-gray-200 shadow-sm">
                        <p className="text-[10px] uppercase tracking-[0.2em] text-gray-500 font-black">SĐT khách đại diện</p>
                        <p className="mt-2 text-sm font-black text-gray-900">{maskPhoneNumber(activeSessionOfModalTable.customer_phone || activeSessionOfModalTable.So_dien_thoai || '')}</p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div className="rounded-3xl bg-white p-4 border border-gray-200 shadow-sm">
                      <p className="text-[10px] uppercase tracking-[0.2em] text-gray-500 font-black">GIỜ VÀO BÀN</p>
                      <p className="mt-2 text-base font-black text-gray-900">{new Date(activeSessionOfModalTable.Thoi_gian_bat_dau).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}</p>
                    </div>
                    <div className="rounded-3xl bg-white p-4 border border-gray-200 shadow-sm">
                      <p className="text-[10px] uppercase tracking-[0.2em] text-gray-500 font-black">THỜI GIAN ĐANG SỬ DỤNG</p>
                      <p className="mt-2 flex items-center gap-2 text-base font-black text-[#B91C1C]"><Clock size={18} className="text-[#B91C1C]" />{getActiveTimer(activeSessionOfModalTable.Thoi_gian_bat_dau)}</p>
                    </div>
                  </div>

                  <div className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                      <p className="text-[10px] uppercase tracking-[0.2em] text-gray-500 font-black">DANH SÁCH MÓN ĐÃ GỌI</p>
                    </div>
                    <div className="space-y-3 max-h-48 overflow-y-auto">
                      {dishesSpentList.length > 0 ? dishesSpentList.map((dl, idx) => (
                        <div key={idx} className="flex items-center justify-between gap-3 rounded-2xl border border-gray-100 bg-gray-50 p-3 text-sm font-semibold text-gray-700">
                          <span className="text-gray-500">x{dl.qty}</span>
                          <span className="flex-1 text-left truncate">{dl.name}</span>
                          <span className="font-black text-gray-900">{dl.total.toLocaleString()}đ</span>
                        </div>
                      )) : (
                        <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50 p-5 text-center text-sm text-gray-500">
                          Chưa có món nào được gọi.
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="text-[10px] uppercase tracking-[0.2em] text-gray-500 font-black">TỔNG TẠM TÍNH</p>
                        <p className="mt-2 text-2xl font-black text-gray-900">{sessionCost.toLocaleString()}đ</p>
                      </div>
                      <button
                        onClick={() => setShowClosingConfirm(true)}
                        className="rounded-2xl bg-[#EE3124] px-6 py-3 text-sm font-black uppercase tracking-[0.14em] text-white shadow-xl hover:bg-[#d6281e] transition">
                        KẾT THÚC PHIÊN & TRẢ BÀN
                      </button>
                    </div>

                    {showClosingConfirm && (
                      <div className="fixed inset-0 z-50 flex items-center justify-center">
                        <div className="absolute inset-0 bg-black/40" onClick={() => setShowClosingConfirm(false)} />
                        <div className="relative w-full max-w-md bg-white rounded-2xl border border-red-200 p-6 z-10 shadow-lg">
                          <p className="text-center text-sm font-black uppercase tracking-[0.18em] text-red-900 mb-3">Xác nhận kết thúc phiên?</p>
                          <p className="text-center text-sm text-gray-700 mb-4">⚠️ KẾT THÚC PHIÊN PHỤC VỤ & chuyển bàn {currentModalTable?.Ma_ban} sang trống?</p>
                          <div className="flex gap-3">
                            <button
                              onClick={() => setShowClosingConfirm(false)}
                              className="flex-1 py-3 border border-gray-300 bg-white text-gray-700 rounded-lg font-bold uppercase hover:bg-gray-50">
                              Hủy bỏ
                            </button>
                            <button
                              onClick={() => {
                                closeSessionAndPay(activeSessionOfModalTable.Ma_phien);
                                setIsModalOpen(false);
                                setShowClosingConfirm(false);
                              }}
                              className="flex-1 py-3 bg-[#EE3124] text-white rounded-lg font-black uppercase hover:bg-[#d6281e]">
                              ĐỒNG Ý KẾT THÚC
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Mismatch exception case: Table is occupied but no active session is found in database */}
              {simulatedStatusOfCurrentModal === TableStatus.CO_KHACH && !activeSessionOfModalTable && (
                <div className="space-y-6">
                  <div className="rounded-3xl border border-amber-200 bg-amber-50 p-5 shadow-sm">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="text-amber-600 mt-0.5 shrink-0" size={20} />
                      <div className="space-y-1">
                        <p className="text-xs font-black uppercase text-amber-950">Không tìm thấy phiên hoạt động!</p>
                        <p className="text-xs text-amber-800 leading-relaxed">
                          Bàn này đang ghi nhận trạng thái <strong className="font-bold">Có khách</strong> nhưng hệ thống không tìm thấy phiên ăn uống nào đang hoạt động.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm space-y-4">
                    <p className="text-xs font-semibold text-gray-700">
                      Bạn có thể chọn một trong các hành động dưới đây để đồng bộ lại trạng thái bàn:
                    </p>
                    <div className="flex flex-col gap-3">
                      <button
                        onClick={() => {
                          setTableStatusManual(currentModalTable.Ma_ban, TableStatus.TRONG);
                          setIsModalOpen(false);
                          alert(`Đã chuyển trạng thái bàn ${currentModalTable.Ma_ban} về Trống thành công.`);
                        }}
                        className="w-full py-3 bg-[#EE3124] hover:bg-[#d6281e] text-white rounded-2xl text-xs font-black uppercase shadow-md transition"
                      >
                        Giải phóng bàn về Trống
                      </button>
                      <button
                        onClick={() => {
                          setTableStatusManual(currentModalTable.Ma_ban, TableStatus.CHUAN_BI);
                          setIsModalOpen(false);
                          alert(`Đã chuyển trạng thái bàn ${currentModalTable.Ma_ban} về Chuẩn bị đón khách.`);
                        }}
                        className="w-full py-3 border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-2xl text-xs font-black uppercase transition"
                      >
                        Chuyển về Chuẩn bị đón khách
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Case 5: CLEANUP / DANG_DON -> clearance */}
              {simulatedStatusOfCurrentModal === TableStatus.DANG_DON && (
                <div className="space-y-4 text-center py-4">
                  <AlertCircle size={32} className="mx-auto text-orange-500 animate-pulse animate-spin-slow" />
                  <div>
                    <h4 className="font-black text-orange-950 text-xs uppercase tracking-wider block">QUY TRÌNH DỌN DẸP BÀN {currentModalTable.Ma_ban}</h4>
                    <p className="text-[11px] text-gray-500 px-6 mt-1.5">Chọn trạng thái tương ứng để cập nhật thời gian làm sạch bàn lẩu nấm.</p>
                  </div>

                  {!tablesBeingCleaned.includes(currentModalTable.Ma_ban) ? (
                    <button
                      onClick={() => {
                        setTablesBeingCleaned(prev => [...prev, currentModalTable.Ma_ban]);
                        alert(`Đã bắt đầu quy trình dọn dẹp tại bàn ${currentModalTable.Ma_ban}! Nhân viên dọn dẹp đang dọn vệ sinh lò lẩu.`);
                      }}
                      className="w-full py-3 bg-orange-500 hover:bg-orange-600 text-white font-extrabold rounded-lg text-xs cursor-pointer shadow-xs transition uppercase flex items-center justify-center space-x-1.5"
                    >
                      <span>🧹 BẮT ĐẦU DỌN DẸP</span>
                    </button>
                  ) : (
                    <div className="space-y-3">
                      <div className="bg-orange-50 p-3 rounded-lg border border-orange-200 text-xs text-orange-850 flex items-center justify-center space-x-2 animate-pulse">
                        <span className="w-2 h-2 rounded-full bg-orange-600 block animate-ping"></span>
                        <span className="font-bold">ĐANG TIẾN HÀNH DỌN DẸP LAU RỬA...</span>
                      </div>

                      <button
                        onClick={() => {
                          setTableStatusManual(currentModalTable.Ma_ban, TableStatus.TRONG);
                          setTablesBeingCleaned(prev => prev.filter(id => id !== currentModalTable.Ma_ban));
                          setIsModalOpen(false);
                          alert(`Bàn ${currentModalTable.Ma_ban} đã dọn dẹp sạch sẽ. Sẵn sàng đón lượt khách tiếp theo!`);
                        }}
                        className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-lg text-xs cursor-pointer shadow-md transition uppercase"
                      >
                        ✅ HOÀN THÀNH DỌN DẸP (TRẢ BÀN TRỐNG)
                      </button>
                    </div>
                  )}
                </div>
              )}

            </div>
          </div>
        </div>
      )}

      {/* 5. POPUP MODAL: PRINT MACHINE PIECE PREVIEW (ERP DRAFT PRINT TEMPLATE) */}
      {showFormSampleId && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-[#FAF9F6] border-2 border-dashed border-gray-400 rounded-xl p-6 w-full max-w-sm space-y-4 animate-in fade-in zoom-in text-gray-800 shadow-2xl relative">
            <button
              onClick={() => setShowFormSampleId(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-650 cursor-pointer font-bold text-lg"
            >
              ✕
            </button>

            {/* Template Header block */}
            <div className="text-center font-sans space-y-1">
              <h1 className="text-sm font-black tracking-widest text-[#EE3124]">LẨU NẤM GIA KHÁNH</h1>
              <p className="text-[9px] text-gray-500 uppercase tracking-widest">--- MẪU IN PHIẾU BÀN ĐỒNG BỘ ---</p>
              <p className="text-[10px] text-gray-400 font-mono">Bản nháp trực quầy Lễ Tân</p>
            </div>

            <div className="border-t border-b border-dashed border-gray-300 py-3 space-y-2 text-xs">
              <div className="flex justify-between font-mono">
                <span>Số Bàn Ăn:</span>
                <span className="font-bold text-gray-900">Bàn {showFormSampleId}</span>
              </div>
              <div className="flex justify-between font-mono">
                <span>Mã Phiên Trình Bày:</span>
                <span className="font-bold text-blue-600">s_{showFormSampleId}_DEMO</span>
              </div>
              <div className="flex justify-between font-mono">
                <span>Code đối soát:</span>
                <span className="font-bold text-[#EE3124]">9X42A</span>
              </div>
              <div className="flex justify-between">
                <span>Đại diện đặt:</span>
                <span className="font-semibold text-gray-800">Hoàng Khánh Vy (Phòng VIP)</span>
              </div>
              <div className="flex justify-between">
                <span>Điện thoại:</span>
                <span className="font-mono font-bold text-gray-800">0938.888.999</span>
              </div>
            </div>

            <div className="bg-white p-3 rounded-xl border text-center space-y-1">
              <span className="text-[10px] text-indigo-700 font-bold block bg-indigo-50 py-0.5 rounded uppercase tracking-wider">
                PHIỀU BIÊN NHẬN GIỮ BÀN
              </span>
              <p className="text-[10px] text-gray-500 leading-relaxed pt-1">
                Lưu hành nội bộ bộ phận lễ tân & quản lý bàn lẩu. Đơn hàng tự động lưu trữ trên máy chủ an toàn.
              </p>
            </div>

            <button
              onClick={() => {
                alert('Phiếu đang được in thử ra máy quầy lễ tân chi nhánh...');
                setShowFormSampleId(null);
              }}
              className="w-full py-2 bg-[#EE3124] hover:bg-brand-red-dark text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer flex items-center justify-center space-x-1"
            >
              <Printer size={13} />
              <span>XÁC NHẬN IN THỬ TẠI QUẦY</span>
            </button>
          </div>
        </div>
      )}

    </div>
  );

  // Helper Sub-Component to render table cards inside blueprint map
  function renderTableCard(
    table: typeof tables[0], 
    simStatus: string | TableStatus, 
    booking: typeof reservations[0] | undefined, 
    session: typeof sessions[0] | undefined
  ) {
    let cardStyle = '';
    let textStyle = '';
    let badgeText = '';
    let indicatorBulb = '';

    if (simStatus === 'BOOKED' && booking) {
      cardStyle = 'bg-stone-50 border-2 border-indigo-600 hover:bg-indigo-50/55';
      textStyle = 'text-indigo-950';
      badgeText = `Lịch: ${booking.Gio_dat}`;
      indicatorBulb = 'bg-[#7B2CBF] scale-[1.1] animate-pulse';
    } else if (simStatus === TableStatus.CO_KHACH) {
      cardStyle = 'bg-[#EE3124] text-white hover:bg-[#d6281e] border-2 border-[#EE3124]';
      textStyle = 'text-white';
      // Dynamically calculate timer text
      const timerText = session ? getActiveTimer(session.Thoi_gian_bat_dau) : '';
      badgeText = timerText || 'Đang ăn';
      indicatorBulb = 'bg-white block animate-pulse';
    } else if (simStatus === TableStatus.DANG_DON) {
      cardStyle = 'bg-gray-100 text-gray-500 hover:bg-gray-200 border-2 border-gray-300';
      textStyle = 'text-gray-700';
      badgeText = 'Lau dọn';
      indicatorBulb = 'bg-orange-500';
    } else {
      // Normal Available state
      cardStyle = 'bg-[#E8F5E9] hover:bg-[#C8E6C9] border-2 border-emerald-300 text-emerald-900';
      textStyle = 'text-emerald-950';
      badgeText = 'Trống';
      indicatorBulb = 'bg-emerald-500';
    }

    return (
      <button
        onClick={() => handleTableClick(table.Ma_ban)}
        className={`w-full p-3.5 rounded-lg text-left h-32 flex flex-col justify-between transition-all duration-200 hover:shadow-md cursor-pointer select-none relative ${cardStyle}`}
        id={`table-trigger-${table.Ma_ban}`}
      >
        {/* Table information display */}
        <div className="flex justify-between items-start w-full">
          <div>
            <h4 className="font-sans font-black text-base tracking-tight leading-none block">{table.Ma_ban}</h4>
            <span className={`text-[8px] font-bold block mt-1 px-1 py-0.5 rounded uppercase font-mono tracking-wider border align-middle max-w-fit ${
              simStatus === TableStatus.CO_KHACH
                ? 'bg-white/20 border-white/40 text-white'
                : 'bg-black/5 border-black/10 text-gray-500'
            }`}>
              Bàn {table.Suc_chua} Ghế
            </span>
          </div>

          {/* Connected Bulb status element WITHOUT P_STATUS label */}
          <div className="flex items-center shrink-0">
            <span className={`w-2.5 h-2.5 rounded-full ring-2 ring-white/10 ${indicatorBulb}`}></span>
          </div>
        </div>

        {/* Dynamic description of booking or active phone detail */}
        <div className="my-1.5 truncate">
          {booking ? (
            <div className="truncate text-[10px] leading-relaxed">
              <p className="font-black truncate">Khách: {booking.Ten_khach_hang}</p>
              <p className="font-mono text-[9px] opacity-80">{maskPhoneNumber(booking.So_dien_thoai)}</p>
            </div>
          ) : session ? (
            <div className="text-[10px] leading-relaxed truncate">
              <p className="font-black block truncate">SĐT quầy:</p>
              <p className="font-mono text-[9px] opacity-80">{session.Ma_phien_code}</p>
            </div>
          ) : (
            <div className="min-h-5" aria-hidden="true"></div>
          )}
        </div>

        {/* Dynamic status labels at bottom */}
        <div className="border-t border-black/5 pt-1.5 flex justify-between items-center text-[9px] font-black uppercase font-mono tracking-wider">
          <span className="opacity-90">{badgeText}</span>
          <span className="opacity-60 text-[8px]">T.{table.Tang}</span>
        </div>
      </button>
    );
  }
}
