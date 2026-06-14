/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useRestaurantStore } from '../data/store';
import { TableStatus, OrderItemStatus } from '../types';
import GiaKhanhLogo from './GiaKhanhLogo';
import { 
  Bell, 
  Check, 
  MapPin, 
  Flame, 
  Clock, 
  CheckCircle2, 
  Layers, 
  Sparkles, 
  Lock, 
  Coffee,
  ArrowDownLeft,
  ArrowUpRight
} from 'lucide-react';

export default function WaiterDashboard() {
  const {
    tables,
    sessions,
    orderDetails,
    dishes,
    reservations,
    updateOrderItemStatus,
  } = useRestaurantStore();

  const [activeFloor, setActiveFloor] = useState<number>(1);
  const [activeTab, setActiveTab] = useState<'deliver_queue' | 'progress_check'>('deliver_queue');
  const [successMemo, setSuccessMemo] = useState<string | null>(null);

  // Group items
  const completedItems = orderDetails.filter(od => od.Trang_thai_mon === OrderItemStatus.DA_HOAN_THANH);
  const cookingItems = orderDetails.filter(od => od.Trang_thai_mon === OrderItemStatus.DANG_CHE_BIEN);
  
  // Handlers
  const handleMarkAsServed = (detailId: string, dishName: string, tableId: string) => {
    updateOrderItemStatus(detailId, OrderItemStatus.DA_PHUC_VU);
    setSuccessMemo(`Đã hoàn thành bưng món "${dishName}" ra bàn ${tableId}!`);
    setTimeout(() => {
      setSuccessMemo(null);
    }, 3800);
  };

  const getTableIdFromOrder = (orderDetail: typeof orderDetails[0]) => {
    const matchedSess = sessions.find(s => {
      const activeOrd = orderDetail.Ma_hd_dat_mon.split('_')[1];
      return s.Ma_ban === activeOrd || s.Ma_phien === orderDetail.Ma_hd_dat_mon.replace('o_', 's_').slice(0, -2);
    });
    return matchedSess?.Ma_ban || orderDetail.Ma_hd_dat_mon.split('_')[1] || 'Bàn Khách';
  };

  const todayStr = new Date().toISOString().split('T')[0];
  const bookingsOnDate = reservations.filter(
    r => r.Ngay_dat === todayStr && r.Trang_thai === 'Chờ đến'
  );

  // Helper checking if table is pre-booked
  const findTableBookingAtSelectedTime = (tableId: string) => {
    return bookingsOnDate.find(r => r.Ma_ban === tableId);
  };

  function getTableSimulatedStatus(tableId: string, baseStatus: TableStatus) {
    const booking = findTableBookingAtSelectedTime(tableId);
    if (booking) return 'BOOKED';
    return baseStatus;
  }

  // Generate dynamic active timer
  const getActiveTimer = (startTime: string) => {
    const elapsedMs = Date.now() - new Date(startTime).getTime();
    const elapsedMins = Math.floor(elapsedMs / 60000);
    const hrs = Math.floor(elapsedMins / 60);
    const mins = elapsedMins % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
  };

  // Mapped physical layout tables filtered by floor
  const currentFloorTables = tables.filter(t => t.Tang === activeFloor);

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
      const timerText = session ? getActiveTimer(session.Thoi_gian_bat_dau) : '';
      badgeText = timerText || 'Đang ăn';
      indicatorBulb = 'bg-white block animate-pulse';
    } else if (simStatus === TableStatus.DANG_DON) {
      cardStyle = 'bg-gray-100 text-gray-500 hover:bg-gray-200 border-2 border-gray-300';
      textStyle = 'text-gray-700';
      badgeText = 'Lau dọn';
      indicatorBulb = 'bg-orange-500';
    } else {
      cardStyle = 'bg-[#E8F5E9] hover:bg-[#C8E6C9] border-2 border-emerald-300 text-emerald-900';
      textStyle = 'text-emerald-950';
      badgeText = 'Trống';
      indicatorBulb = 'bg-emerald-500';
    }

    return (
      <div
        className={`w-full p-3.5 rounded-lg text-left h-32 flex flex-col justify-between transition-all duration-200 hover:shadow-xs relative select-none ${cardStyle}`}
        id={`table-view-only-${table.Ma_ban}`}
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
      </div>
    );
  }

  return (
    <div className="space-y-6 text-sm font-sans" id="waiter-dashboard">
      
      {/* 1. HEADER HERO PANEL */}
      <div className="flex flex-col md:flex-row justify-between items-stretch bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
        <div className="bg-[#EE3124] p-5 flex items-center shrink-0 w-full md:w-24 text-white justify-center">
          <GiaKhanhLogo size={60} />
        </div>
        <div className="p-5 flex-1 flex flex-col justify-center space-y-1">
          <h2 className="text-lg font-display font-black text-gray-800 tracking-wide flex items-center space-x-2">
            <span className="bg-amber-100 text-amber-800 text-[10px] uppercase font-mono px-2 py-0.5 rounded mr-1">Chế độ phục vụ viên</span>
            CỬA SỔ PHỤC VỤ • BƯNG MÓN LẨU NẤM
          </h2>
          <p className="text-xs text-gray-450 uppercase tracking-widest font-mono">
            Hệ thống nhận diện món hoàn thành tức thì từ quầy bếp & Trực quan hóa mặt bằng (Chỉ xem)
          </p>
        </div>
      </div>

      {successMemo && (
        <div className="p-4 bg-green-50 border-l-4 border-emerald-500 text-emerald-800 text-xs flex items-center space-x-2 rounded-xl animate-in fade-in duration-200" id="success-notification-bar">
          <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
          <span className="font-bold">{successMemo}</span>
        </div>
      )}

      {/* 2. LIVE ORDER TASKS QUEUE FOR DELIVERING */}
      <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
        <div className="flex border-b border-gray-150 pb-3 mb-4 text-xs font-bold font-sans">
          <button
            onClick={() => setActiveTab('deliver_queue')}
            className={`pb-2.5 px-4 uppercase tracking-wider relative flex items-center space-x-2 cursor-pointer ${
              activeTab === 'deliver_queue'
                ? 'text-[#EE3124] border-b-2 border-[#EE3124] font-black'
                : 'text-gray-400 hover:text-gray-700'
            }`}
          >
            <Bell size={14} className={completedItems.length > 0 ? "text-[#EE3124] animate-bounce" : ""} />
            <span>Món đã xong - cần bưng ({completedItems.length})</span>
          </button>
          
          <button
            onClick={() => setActiveTab('progress_check')}
            className={`pb-2.5 px-4 uppercase tracking-wider relative flex items-center space-x-2 cursor-pointer ${
              activeTab === 'progress_check'
                ? 'text-[#EE3124] border-b-2 border-[#EE3124] font-black'
                : 'text-gray-400 hover:text-gray-700'
            }`}
          >
            <Flame size={14} />
            <span>Món đang đun / chờ khác ({cookingItems.length})</span>
          </button>
        </div>

        {/* TAB CONTENT: DELIVER QUEUE */}
        {activeTab === 'deliver_queue' && (
          <div className="space-y-3.5">
            {completedItems.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {completedItems.map(item => {
                  const dish = dishes.find(d => d.Ma_mon === item.Ma_mon);
                  const tableId = getTableIdFromOrder(item);

                  return (
                    <div 
                      key={item.Ma_detail_id} 
                      className="bg-red-50/40 border border-red-150 rounded-xl p-4 flex flex-col justify-between hover:shadow-xs transition duration-150 animate-in zoom-in-95 duration-100"
                    >
                      <div>
                        <div className="flex justify-between items-center mb-2.5">
                          <span className="bg-[#EE3124] text-white px-2.5 py-1 text-[11px] font-black uppercase rounded-lg tracking-wider shadow-xs">
                            BÀN {tableId}
                          </span>
                          <span className="text-[9px] font-mono font-bold text-red-700 flex items-center space-x-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#EE3124] block animate-ping"></span>
                            <span>CHỜ LẤY NGAY</span>
                          </span>
                        </div>

                        <div className="space-y-1 py-1">
                          <h4 className="font-sans font-black text-xs text-gray-900">{dish?.Ten_mon || 'Đồ Lẩu'}</h4>
                          <p className="text-sm text-amber-700 font-mono font-black py-0.5">SỐ LƯỢNG: x{item.So_luong}</p>
                          {item.Ghi_chu && (
                            <p className="text-[10px] text-gray-500 bg-white p-1.5 border-l-2 border-amber-500 rounded-r italics">
                              Lưu ý: {item.Ghi_chu}
                            </p>
                          )}
                        </div>
                      </div>

                      <button
                        onClick={() => handleMarkAsServed(item.Ma_detail_id, dish?.Ten_mon || 'Sản phẩm', tableId)}
                        className="w-full mt-3.5 py-2.5 bg-[#EE3124] hover:bg-[#d6281e] text-white font-black text-xs rounded-lg uppercase tracking-wider flex items-center justify-center space-x-1.5 cursor-pointer shadow-md transition duration-100"
                      >
                        <Check size={14} />
                        <span>Đã bưng ra bàn</span>
                      </button>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-12 text-center text-gray-400 italic bg-gray-50 rounded-xl border border-dashed border-gray-200 flex flex-col items-center justify-center">
                <Coffee size={36} className="text-gray-300 mb-3 animate-spin duration-3000" />
                <span className="font-black text-xs uppercase tracking-wider text-gray-550 block">CHƯA CÓ MÓN ĂN HOÀN THÀNH</span>
                <p className="text-[10px] text-gray-400 mt-1">Khi quầy bếp thông báo một món ăn đã "Để lên mâm", món đó sẽ xuất hiện ở đây.</p>
              </div>
            )}
          </div>
        )}

        {/* TAB CONTENT: PROGRESS CHECK */}
        {activeTab === 'progress_check' && (
          <div className="space-y-3.5">
            {cookingItems.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {cookingItems.map(item => {
                  const dish = dishes.find(d => d.Ma_mon === item.Ma_mon);
                  const tableId = getTableIdFromOrder(item);

                  return (
                    <div 
                      key={item.Ma_detail_id} 
                      className="bg-amber-50/30 border border-amber-200 rounded-xl p-3.5 flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <span className="bg-amber-500 text-white px-2 py-0.5 text-[10px] font-black uppercase rounded-md">
                            BÀN {tableId}
                          </span>
                          <span className="text-[9px] font-mono font-bold text-amber-700 flex items-center space-x-1">
                            <Flame size={12} className="text-amber-500 animate-pulse" />
                            <span>ĐANG KHỞI CHẾ BIẾN</span>
                          </span>
                        </div>

                        <div className="space-y-1">
                          <h4 className="font-bold text-xs text-gray-800">{dish?.Ten_mon}</h4>
                          <p className="text-xs text-gray-500 font-bold font-mono">Định lượng: x{item.So_luong}</p>
                          {item.Ghi_chu && (
                            <p className="text-[9px] text-gray-400 border-l border-amber-300 pl-1.5 italic">
                              {item.Ghi_chu}
                            </p>
                          )}
                        </div>
                      </div>
                      
                      <div className="mt-3 text-[9px] text-gray-400 flex items-center space-x-1">
                        <Clock size={11} className="text-gray-300" />
                        <span>Vui lòng chờ bếp chuyển trạng thái hoàn thành...</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-8 text-center text-gray-400 italic bg-gray-50 rounded-xl">
                Chưa có món ăn nào đang trong lô chế biến dở dang.
              </div>
            )}
          </div>
        )}
      </div>

      {/* 3. SYMMETRICAL ARCHITECTURAL FLOOR PLAN LAYOUT (VIEW-ONLY) */}
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm relative overflow-hidden" id="architectural-blueprint-desk">
        
        {/* Subtle background industrial grid pattern */}
        <div className="absolute inset-0 pointer-events-none opacity-5 bg-[linear-gradient(to_right,#808080_1px,transparent_1px),linear-gradient(to_bottom,#808080_1px,transparent_1px)] bg-[size:24px_24px]"></div>
        
        <div className="relative z-10 space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-gray-50 p-3 rounded-xl border border-gray-200 gap-2">
            <span className="font-sans font-extrabold text-gray-800 text-xs flex items-center space-x-1.5">
              <MapPin size={13} className="text-[#EE3124]" />
              <span className="uppercase text-gray-400 font-mono">Bản thiết kế mặt bằng:</span>
              <span className="text-[#EE3124]">GIAO DIỆN BÀN LẨU TRỰC QUAN TẦNG {activeFloor} (CHỈ XEM)</span>
            </span>
            <span className="font-mono text-[9px] text-[#EE3124] bg-red-50 border border-red-150 font-black block tracking-widest uppercase px-22 py-0.5 rounded flex items-center space-x-1">
              <Lock size={10} />
              <span>CHẾ ĐỘ XEM SẮP ĐẶT NHÂN VIÊN</span>
            </span>
          </div>

          {/* Unified floor tabs selector matching image specs */}
          <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center bg-gray-100 p-1 rounded-xl border gap-3 max-w-md">
            <div className="flex gap-1 w-full">
              {[1, 2, 3, 4].map(floor => (
                <button
                  key={floor}
                  onClick={() => setActiveFloor(floor)}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-black uppercase transition duration-150 cursor-pointer ${
                    activeFloor === floor 
                      ? 'bg-[#EE3124] text-white shadow-sm font-extrabold' 
                      : 'text-gray-500 hover:bg-gray-200 hover:text-gray-800'
                  }`}
                >
                  TẦNG {floor}
                </button>
              ))}
            </div>
          </div>

          {/* PHYSICAL BLUEPRINT MAP GRID IN FULL-WIDTH */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-6 gap-6 pt-2">
            
            {/* ROW 1: 6 Columns */}
            {currentFloorTables.slice(0, 6).map((table, idx) => {
              const simStatus = getTableSimulatedStatus(table.Ma_ban, table.Trang_thai);
              const booking = findTableBookingAtSelectedTime(table.Ma_ban);
              const session = sessions.find(s => s.Ma_ban === table.Ma_ban && s.Trang_thai === 'active');

              return (
                <div key={table.Ma_ban}>
                  {renderTableCard(table, simStatus, booking, session)}
                </div>
              );
            })}

            {/* ROW 2: Slot 7, Slot 8, Slot 9, CẦU THANG (spans col 4 & 5), Slot 10 */}
            {currentFloorTables.slice(6, 9).map((table, idx) => {
              const simStatus = getTableSimulatedStatus(table.Ma_ban, table.Trang_thai);
              const booking = findTableBookingAtSelectedTime(table.Ma_ban);
              const session = sessions.find(s => s.Ma_ban === table.Ma_ban && s.Trang_thai === 'active');

              return (
                <div key={table.Ma_ban}>
                  {renderTableCard(table, simStatus, booking, session)}
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
              const simStatus = getTableSimulatedStatus(table.Ma_ban, table.Trang_thai);
              const booking = findTableBookingAtSelectedTime(table.Ma_ban);
              const session = sessions.find(s => s.Ma_ban === table.Ma_ban && s.Trang_thai === 'active');

              return (
                <div key={table.Ma_ban}>
                  {renderTableCard(table, simStatus, booking, session)}
                </div>
              );
            })}

            {/* ROW 3: Slot 11, Slot 12, Slot 13, Slot 14, and BALCONY/GREEN GARDEN (spans last 2 columns) */}
            {currentFloorTables.slice(10, 14).map((table, idx) => {
              const simStatus = getTableSimulatedStatus(table.Ma_ban, table.Trang_thai);
              const booking = findTableBookingAtSelectedTime(table.Ma_ban);
              const session = sessions.find(s => s.Ma_ban === table.Ma_ban && s.Trang_thai === 'active');

              return (
                <div key={table.Ma_ban}>
                  {renderTableCard(table, simStatus, booking, session)}
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
                  <span className="font-mono text-[8px] font-bold text-white bg-[#EE3124] px-1.5 py-0.5 rounded font-black">SẢNH ĐÓN TIẾP</span>
                </div>

                <p className="text-[10px] text-gray-500 leading-relaxed font-sans py-1">
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
                  <span className="font-mono text-[8px] font-bold text-emerald-605 bg-emerald-50 border border-emerald-150 px-1.5 py-0.5 rounded font-black">KHU Ô CÂY XANH</span>
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

    </div>
  );
}
