/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useRestaurantStore, playNotificationSound } from '../data/store';
import { TableStatus, TableStatusLabel, OrderItemStatus } from '../types';
import GiaKhanhLogo from './GiaKhanhLogo';
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

  // Date and hour selector for temporal layout modeling
  const [selectedCalendarDate, setSelectedCalendarDate] = useState<string>(() => {
    return new Date().toISOString().split('T')[0];
  });
  const [selectedCalendarTime, setSelectedCalendarTime] = useState<string>('18:00');

  // Center Modal states for booking & session setup
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showClosingConfirm, setShowClosingConfirm] = useState(false);
  const [bookName, setBookName] = useState('');
  const [bookPhone, setBookPhone] = useState('');
  const [manualPhoneInp, setManualPhoneInp] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [showManualBookingSuccess, setShowManualBookingSuccess] = useState(false);
  const [showFormSampleId, setShowFormSampleId] = useState<string | null>(null);

  const [instantPhone, setInstantPhone] = useState('');
  const [tablesBeingCleaned, setTablesBeingCleaned] = useState<string[]>([]);
  const [selectedHistorySession, setSelectedHistorySession] = useState<string | null>(null);

  // Today string for live session fallback
  const todayString = new Date().toISOString().split('T')[0];

  // Active bookings on the currently viewed calendar date
  const bookingsOnDate = reservations.filter(
    r => r.Ngay_dat === selectedCalendarDate && r.Trang_thai === 'Chờ đến'
  );

  // Helper checking if a specific table is pre-booked on the viewed calendar date
  const findTableBookingAtSelectedTime = (tableId: string) => {
    return bookingsOnDate.find(r => r.Ma_ban === tableId);
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

    if (selectedCalendarDate === todayString) {
      return baseStatus;
    }

    return TableStatus.TRONG;
  };

  // Handle direct booking registration for selected table
  const handleBookTableDirect = (e: React.FormEvent, tableId: string) => {
    e.preventDefault();
    if (!bookName.trim() || !bookPhone.trim()) {
      alert('Vui lòng nhập đầy đủ Tên và Số điện thoại khách đặt bàn!');
      return;
    }

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
      await startTableSession(tableId, trimmed);
      updateReservationStatus(bookingId, 'Đã nhận phiên');
      playNotificationSound('ready_dish');
      setIsModalOpen(false);
      alert(`Đã nhận khách đặt trước! Phiên bàn lẩu ${tableId} đã hoạt động.`);
    } catch (err: any) {
      alert(err.message || 'Hành động thất bại.');
    }
  };

  const handleStartManualSession = (e: React.FormEvent, tableId: string) => {
    e.preventDefault();
    // Validate phone number: must be 10 digits
    const trimmed = manualPhoneInp.trim();
    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(trimmed)) {
      setPhoneError('Số điện thoại phải gồm 10 chữ số.');
      return;
    }
    setPhoneError('');
    startTableSession(tableId, trimmed);
    setManualPhoneInp('');
    playNotificationSound('ready_dish');
    setIsModalOpen(false);
    alert(`Kích hoạt thành công phiên phục vụ cho bàn ${tableId}!`);
  };

  // Table click event opens the centered modal
  const handleTableClick = (tableId: string) => {
    setSelectedTableId(tableId);
    setShowClosingConfirm(false);
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
      const details = orderDetails.filter(od => od.Ma_hd_dat_mon === ord.Ma_hd_dat_mon);
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

  // Active table context data inside Modal
  const currentModalTable = tables.find(t => t.Ma_ban === selectedTableId);
  const simulatedStatusOfCurrentModal = currentModalTable ? getTableSimulatedStatus(currentModalTable.Ma_ban, currentModalTable.Trang_thai) : null;
  const activeSessionOfModalTable = sessions.find(s => s.Ma_ban === selectedTableId && s.Trang_thai === 'active');
  const bookedOfModalTable = currentModalTable ? findTableBookingAtSelectedTime(currentModalTable.Ma_ban) : null;

  // Compute receipt cost
  let sessionCost = 0;
  let dishesSpentList: { name: string; qty: number; total: number }[] = [];

  if (activeSessionOfModalTable) {
    const sessionOrders = orders.filter(o => o.Ma_phien === activeSessionOfModalTable.Ma_phien);
    sessionOrders.forEach(ord => {
      const details = orderDetails.filter(od => od.Ma_hd_dat_mon === ord.Ma_hd_dat_mon);
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

          {/* Configuration and Dates Timeline */}
          <div className="flex flex-wrap items-center gap-4 w-full xl:w-auto">
            {/* Date Picker */}
            <div className="flex items-center space-x-2 bg-white border-2 border-[#EE3124] px-4 py-2.5 rounded-lg text-sm shadow-sm min-w-[240px] w-full md:w-64 focus-within:ring-2 focus-within:ring-[#EE3124]/20 transition">
              <Calendar size={16} className="text-[#EE3124] shrink-0" />
              <input
                type="date"
                className="bg-transparent border-none font-extrabold text-[#EE3124] focus:outline-none cursor-pointer w-full text-sm"
                value={selectedCalendarDate}
                onChange={e => {
                  setSelectedCalendarDate(e.target.value);
                  setSelectedTableId(null);
                }}
              />
            </div>

            {/* Time Selector with editable input and 30-min intervals datalist */}
            <div className="flex items-center space-x-2 bg-white border-2 border-amber-400 px-4 py-2.5 rounded-lg text-sm shadow-sm min-w-[200px] w-full md:w-56 focus-within:ring-2 focus-within:ring-amber-400/20 transition">
              <Clock size={16} className="text-amber-600 shrink-0" />
              <input
                type="text"
                list="time-intervals"
                placeholder="Giờ đặt"
                className="bg-transparent border-none font-bold text-amber-700 focus:outline-none w-full text-sm"
                value={selectedCalendarTime}
                onChange={e => {
                  setSelectedCalendarTime(e.target.value);
                  setSelectedTableId(null);
                }}
              />
              <datalist id="time-intervals">
                {Array.from({ length: 30 }).map((_, i) => {
                  const hour = Math.floor(9 + i / 2);
                  const min = i % 2 === 0 ? '00' : '30';
                  if (hour > 23) return null;
                  const timeStr = `${hour.toString().padStart(2, '0')}:${min}`;
                  return <option key={timeStr} value={timeStr} />;
                })}
              </datalist>
            </div>

            {/* Live Search and Submit Button */}
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
                  alert(`Đồ họa và thông tin bàn ăn đang được cập nhật thành công cho thời gian: ${selectedCalendarDate} lúc ${selectedCalendarTime}`);
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
                      const details = orderDetails.filter(od => od.Ma_hd_dat_mon === ord.Ma_hd_dat_mon);
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
                    const details = orderDetails.filter(od => od.Ma_hd_dat_mon === ord.Ma_hd_dat_mon);
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
          <div className="bg-[#FAF9F6] border-2 border-gray-400 rounded-xl w-full max-w-lg overflow-hidden shadow-2xl relative animate-in fade-in zoom-in">

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
                        await startTableSession(currentModalTable.Ma_ban, instantPhone.trim(), instantGuests);
                        setInstantPhone('');
                        setInstantGuests(4);
                        setIsModalOpen(false);
                        alert(`Đã BẮT ĐẦU PHIÊN và kích hoạt phục vụ cho bàn ${currentModalTable.Ma_ban}!`);
                      } catch (err: any) {
                        alert(err.message || 'Mở bàn không thành công.');
                      }
                    }} className="space-y-3">
                      <div className="space-y-3">
                        <div className="space-y-1">
                          <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                            Số điện thoại khách đại diện <span className="text-red-500 font-bold">*</span>
                          </label>
                          <div className="relative">
                            <Phone className="absolute left-2.5 top-2.5 text-gray-400" size={12} />
                            <input
                              type="tel"
                              required
                              placeholder="Nhập SĐT khách gồm 10 chữ số"
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
                            Số lượng khách ngồi bàn
                          </label>
                          <div className="relative flex items-center border border-gray-250 rounded-lg bg-white px-2.5 py-1.5">
                            <User size={12} className="text-gray-400 shrink-0 mr-1.5" />
                            <input
                              type="number"
                              min={1}
                              max={12}
                              required
                              className="w-full py-0.5 text-xs font-bold text-gray-800 focus:outline-none"
                              value={instantGuests}
                              onChange={e => setInstantGuests(Number(e.target.value))}
                            />
                          </div>
                        </div>
                      </div>

                      <button
                        type="submit"
                        disabled={instantPhone.length !== 10}
                        className={`w-full py-2.5 font-extrabold text-xs rounded-lg uppercase transition cursor-pointer text-center ${instantPhone.length === 10
                            ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-md'
                            : 'bg-gray-200 text-gray-400 cursor-not-allowed border border-gray-300 shadow-none'
                          }`}
                      >
                        Tạo phiên sử dụng
                      </button>
                    </form>
                  </div>

                  {/* Custom book reservation */}
                  <div className="bg-indigo-50/50 border border-indigo-150 p-4 rounded-lg space-y-3">
                    <div className="border-b pb-2 mb-1 border-indigo-100 flex items-center space-x-1.5">
                      <BookmarkCheck size={14} className="text-indigo-600" />
                      <span className="font-extrabold text-xs text-indigo-900 uppercase">ĐẶT TRƯỚC BÀNĂN (CHỌN LỊCH KHÁCH)</span>
                    </div>

                    <form onSubmit={e => handleBookTableDirect(e, currentModalTable.Ma_ban)} className="space-y-3">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-1">Họ tên khách *</label>
                          <div className="relative">
                            <User className="absolute left-2.5 top-2 text-gray-400" size={12} />
                            <input
                              type="text"
                              required
                              placeholder="Chị Vy, Anh Tuấn..."
                              className="w-full pl-7 pr-2 py-1.5 border border-gray-250 bg-white rounded-lg text-xs font-bold focus:border-[#EE3124] focus:outline-none"
                              value={bookName}
                              onChange={e => setBookName(e.target.value)}
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-1">Số điện thoại *</label>
                          <div className="relative">
                            <Phone className="absolute left-2.5 top-2 text-gray-400" size={12} />
                            <input
                              type="tel"
                              required
                              placeholder="091xxxxxxxx..."
                              className="w-full pl-7 pr-2 py-1.5 border border-gray-250 bg-white rounded-lg text-xs font-bold font-mono focus:border-[#EE3124] focus:outline-none"
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

                      <div className="bg-white px-3 py-1.5 rounded border text-[9px] text-gray-400 flex justify-between font-medium">
                        <span>Lịch Đặt: Ngày {selectedCalendarDate}</span>
                        <span>Giờ Đặt: {selectedCalendarTime}</span>
                      </div>

                      <button
                        type="submit"
                        className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs rounded-lg flex items-center justify-center space-x-1.5 cursor-pointer shadow-xs transition"
                      >
                        <PlusCircle size={13} />
                        <span>QUYẾT ĐỊNH ĐẶT TRƯỚC</span>
                      </button>
                    </form>
                  </div>
                </div>
              )}

              {/* Case 2: SIMULATED BOOKED -> Show booked info and fast check-in button (Because we have phone number!) */}
              {simulatedStatusOfCurrentModal === 'BOOKED' && bookedOfModalTable && (
                <div className="space-y-4">
                  <div className="bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-200 p-5 rounded-lg space-y-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-[8px] bg-indigo-600 text-white px-2 py-0.5 rounded font-extrabold uppercase tracking-wider">
                          KHÁCH ĐÃ ĐẶT LỊCH TRÙNG KHỚP
                        </span>
                        <h4 className="font-black text-gray-800 mt-2 text-sm">{bookedOfModalTable.Ten_khach_hang}</h4>
                      </div>
                      <span className="text-xs font-black text-indigo-750 bg-indigo-100 px-3 py-0.5 rounded border border-indigo-200 font-mono">
                        {bookedOfModalTable.Gio_dat}
                      </span>
                    </div>

                    <div className="text-xs text-gray-600 space-y-1 bg-white p-3 rounded order border-indigo-100 leading-relaxed font-sans">
                      <p>Số điện thoại: <strong className="font-mono text-indigo-950 font-black">{bookedOfModalTable.So_dien_thoai}</strong></p>
                      <p>Ngày giữ bàn: <strong className="text-gray-700">{bookedOfModalTable.Ngay_dat}</strong></p>
                    </div>

                    <div className="pt-2">
                      <button
                        onClick={() => handleStartBookingSession(
                          bookedOfModalTable.Ma_dat_ban,
                          currentModalTable.Ma_ban,
                          bookedOfModalTable.So_dien_thoai
                        )}
                        className="w-full py-3 bg-[#EE3124] hover:bg-brand-red-dark text-white font-extrabold text-xs rounded-lg flex items-center justify-center space-x-1.5 cursor-pointer shadow-md transition uppercase"
                      >
                        <Play size={14} className="fill-current" />
                        <span>🚀 BẮT ĐẦU PHIÊN PHỤC VỤ (CHECK-IN)</span>
                      </button>
                      <p className="text-[10px] text-gray-400 text-center mt-2 font-mono">
                        Hệ thống tự động kích hoạt bàn {currentModalTable.Ma_ban}, sinh QR ăn uống và gán SĐT.
                      </p>
                    </div>
                  </div>
                </div>
              )}


              {/* Case 4: ACTIVE / CO_KHACH -> Consumption session monitoring and billing */}
              {simulatedStatusOfCurrentModal === TableStatus.CO_KHACH && activeSessionOfModalTable && (
                <div className="space-y-4">
                  <div className="flex justify-between items-start border-b pb-3 border-gray-150">
                    <div>
                      <span className="text-[8px] bg-red-100 text-[#EE3124] px-2 py-0.5 rounded font-bold uppercase tracking-wider">
                        PHIÊN PHỤC VỤ TRỰC TIẾP (LIVE)
                      </span>
                      <h4 className="font-mono font-black text-gray-900 text-sm mt-1.5 flex items-center space-x-1">
                        <span>Liên kết SĐT:</span>
                        <span className="text-[#EE3124]">{activeSessionOfModalTable.Ma_phien_code || 'Khách Vãng Lai'}</span>
                      </h4>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs bg-gray-50 p-3 rounded-lg border border-gray-150 font-mono">
                    <div>
                      <span className="text-[9px] text-gray-400 block font-bold">GIỜ VÀO BÀN</span>
                      <span className="font-semibold text-gray-750">
                        {new Date(activeSessionOfModalTable.Thoi_gian_bat_dau).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-[9px] text-gray-400 block font-bold">LÂM THỜI GIAN TRÔI</span>
                      <span className="font-bold text-[#EE3124] flex items-center justify-end space-x-1">
                        <Clock size={11} className="animate-spin-slow" />
                        <span>{getActiveTimer(activeSessionOfModalTable.Thoi_gian_bat_dau)}</span>
                      </span>
                    </div>
                  </div>

                  {/* Bill detail lists */}
                  <div className="space-y-2">
                    <span className="text-[10px] text-gray-400 font-extrabold block uppercase tracking-wider">Danh mục nấm và Topping đã đặt:</span>
                    <div className="bg-white p-3 rounded-lg border border-gray-200 space-y-2 max-h-48 overflow-y-auto">
                      {dishesSpentList.map((dl, idx) => (
                        <div key={idx} className="flex justify-between items-center text-xs font-mono border-b border-gray-100 pb-1.5">
                          <span className="text-gray-400 font-bold">x{dl.qty}</span>
                          <span className="flex-1 font-bold truncate ml-2 text-gray-700 font-sans">{dl.name}</span>
                          <span className="font-bold text-gray-900">{dl.total.toLocaleString()}đ</span>
                        </div>
                      ))}

                      {dishesSpentList.length === 0 && (
                        <p className="text-center text-gray-400 italic py-6">Chưa phát sinh món ăn từ phòng bếp.</p>
                      )}
                    </div>
                  </div>

                  {/* Checkout summaries */}
                  <div className="flex justify-between items-center pt-2 text-xs border-t border-gray-250">
                    <span className="font-black text-gray-400 uppercase tracking-widest font-sans">HAO PHÍ PHIÊN PHỤC VỤ</span>
                    <span className="text-lg font-mono font-black text-[#EE3124]">{sessionCost.toLocaleString()}đ</span>
                  </div>

                  {/* Close Session trigger */}
                  {!showClosingConfirm ? (
                    <button
                      onClick={() => {
                        setShowClosingConfirm(true);
                      }}
                      className="w-full py-3 bg-[#EE3124] hover:bg-brand-red-dark text-white font-extrabold text-xs rounded-lg shadow-md cursor-pointer text-center transition uppercase"
                    >
                      KẾT THÚC PHIÊN PHỤC VỤ & TRẢ BÀN TRỐNG
                    </button>
                  ) : (
                    <div className="bg-red-50 border-2 border-red-200 rounded-lg p-3.5 space-y-3.5 animate-in fade-in duration-200">
                      <p className="text-center font-black text-xs text-red-900 leading-relaxed uppercase tracking-wider">
                        ⚠️ Xác nhận KẾT THÚC PHIÊN PHỤC VỤ & chuyển bàn {currentModalTable.Ma_ban} sang màu xanh (Trống)?
                      </p>

                      <div className="flex gap-2.5">
                        <button
                          onClick={() => {
                            setShowClosingConfirm(false);
                          }}
                          className="flex-1 py-2 border border-gray-300 bg-white hover:bg-gray-50 text-gray-600 font-bold text-xs rounded-lg cursor-pointer uppercase transition text-center"
                        >
                          Hủy bỏ
                        </button>

                        <button
                          onClick={() => {
                            closeSessionAndPay(activeSessionOfModalTable.Ma_phien);
                            setIsModalOpen(false);
                            setShowClosingConfirm(false);
                          }}
                          className="flex-1 py-2 bg-[#EE3124] hover:bg-[#d6281e] text-white font-black text-xs rounded-lg cursor-pointer uppercase transition shadow-sm text-center"
                        >
                          ĐỒNG Ý KẾT THÚC
                        </button>
                      </div>
                    </div>
                  )}
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
              <p className="font-mono text-[9px] opacity-80">{booking.So_dien_thoai}</p>
            </div>
          ) : session ? (
            <div className="text-[10px] leading-relaxed truncate">
              <p className="font-black block truncate">SĐT quầy:</p>
              <p className="font-mono text-[9px] opacity-80">{session.Ma_phien_code}</p>
            </div>
          ) : (
            <p className="text-[10px] font-sans italic opacity-75 font-semibold">Bàn lẩu khả dụng</p>
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
