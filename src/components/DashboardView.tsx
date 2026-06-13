/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useRestaurantStore } from '../data/store';
import { 
  TrendingUp, 
  FileText, 
  Users, 
  AlertTriangle, 
  ChevronRight, 
  Calendar, 
  Download, 
  BarChart3, 
  PieChart, 
  Check, 
  ShieldAlert, 
  ArrowRightLeft, 
  Plus, 
  Eye,
  Upload
} from 'lucide-react';

export default function DashboardView({ onNavigate }: { onNavigate?: (tab: string) => void }) {
  const { orders, orderDetails, tables, materials, importReceipts, logs, currentRole, updateOrderInvoice } = useRestaurantStore();

  const [activeReportTab, setActiveReportTab] = useState<'revenue' | 'orders' | 'inventory' | 'materials'>('revenue');
  const [fromDate, setFromDate] = useState('2026-06-12');
  const [toDate, setToDate] = useState('2026-06-18');
  const [isExporting, setIsExporting] = useState(false);
  const [selectedInvoiceImage, setSelectedInvoiceImage] = useState<string | null>(null);
  const [selectedInvoiceNumber, setSelectedInvoiceNumber] = useState<string>('');

  // Stats calculate
  const totalRevenueToday = orders.reduce((sum, o) => sum + o.Tong_tien, 0);
  const activeTablesCount = tables.filter(t => t.Trang_thai === 'co_khach').length;
  const totalTables = tables.length;
  
  // Under minimum: current < minimum
  const depletedMaterials = materials.filter(m => m.Ton_kho_hien_tai < m.Ton_kho_toi_thieu);
  const depletedCount = depletedMaterials.length;

  const totalRevenue = totalRevenueToday;
  const totalOrdersCount = orders.length;
  const avgOrderVal = totalOrdersCount > 0 ? Math.round(totalRevenue / totalOrdersCount) : 0;
  const totalGuestsServed = 120 + (totalOrdersCount * 3);

  const handleExport = () => {
    setIsExporting(true);
    setTimeout(() => {
      setIsExporting(false);
      alert('Đã xuất báo cáo dữ liệu hoạt động chính xác sang định dạng Excel thành công!');
    }, 1200);
  };

  // SVG Line Chart Data (7 Days Revenue in Million VND)
  const chartData = [
    { day: '12/06', rev: 12.0 },
    { day: '13/06', rev: 18.5 },
    { day: '14/06', rev: 15.4 },
    { day: '15/06', rev: 22.0 },
    { day: '16/06', rev: 19.8 },
    { day: '17/06', rev: 26.5 },
    { day: 'Hôm nay', rev: totalRevenueToday > 0 ? (totalRevenueToday / 1000000) : 8.5 }, // Scaled live value
  ];

  const maxValY = 40;
  const height = 180;
  const width = 450;
  const points = chartData
    .map((d, i) => {
      const x = (i * (width - 60)) / (chartData.length - 1) + 30;
      const y = height - (d.rev * (height - 40)) / maxValY - 20;
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <div className="space-y-8 text-sm" id="dashboard-view-root">
      
      {/* 1. Header Row */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-6 rounded-2xl border border-gray-150 gap-4 shadow-sm" id="dashboard-header">
        <div>
          <h2 className="text-2xl font-sans font-bold text-gray-900 tracking-tight">Báo Cáo & Tổng Quan</h2>
          <p className="text-xs text-gray-400 mt-1 uppercase tracking-widest font-mono">Hệ thống Điều hành & Thống kê Gia Khánh</p>
        </div>
        
        <div className="flex items-center space-x-3 w-full md:w-auto">
          <div className="flex items-center space-x-2 bg-red-50 text-[#EE3124] px-4 py-2 rounded-xl text-xs font-bold border border-red-100">
            <Calendar size={14} className="animate-pulse" />
            <span>{new Date().toLocaleDateString('vi-VN')}</span>
          </div>

          <button
            id="btn-export-excel-dashboard"
            onClick={handleExport}
            className="flex-1 md:flex-initial bg-green-700 hover:bg-green-800 text-[#E5BA73] px-4 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center space-x-2 shadow-sm transition-all cursor-pointer"
          >
            {isExporting ? (
              <span className="w-4 h-4 border-2 border-white/30 border-t-[#E5BA73] rounded-full animate-spin"></span>
            ) : (
              <Download size={14} />
            )}
            <span>XUẤT EXCEL BÁO CÁO</span>
          </button>
        </div>
      </div>

      {/* 2. Grid of 4 Key KPI widgets */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5" id="dashboard-stats-grid">
        {/* Doanh thu hôm nay */}
        <div className="bg-white p-6 rounded-2xl border border-gray-150 shadow-xs flex items-start space-x-4 relative overflow-hidden group">
          <div className="p-3.5 bg-green-50 text-green-600 rounded-xl group-hover:scale-105 transition duration-300">
            <TrendingUp size={22} />
          </div>
          <div>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Doanh thu hôm nay</span>
            <span className="text-2xl font-mono font-bold text-gray-900 tracking-tight block">
              {totalRevenueToday.toLocaleString()}đ
            </span>
            <span className="text-[10px] text-green-600 font-semibold block mt-1">
              ↑ 12.5% so với hôm qua
            </span>
          </div>
        </div>

        {/* Số đơn hàng */}
        <div className="bg-white p-6 rounded-2xl border border-gray-150 shadow-xs flex items-start space-x-4 relative overflow-hidden group">
          <div className="p-3.5 bg-blue-50 text-blue-600 rounded-xl group-hover:scale-105 transition duration-300">
            <FileText size={22} />
          </div>
          <div>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Số lượng hóa đơn</span>
            <span className="text-2xl font-mono font-bold text-gray-900 tracking-tight block">
              {totalOrdersCount} đơn
            </span>
            <span className="text-[10px] text-blue-600 font-semibold block mt-1">
              Bình quân {(avgOrderVal > 0 ? avgOrderVal : 280000).toLocaleString()}đ/đơn
            </span>
          </div>
        </div>

        {/* Số bàn đang phục vụ */}
        <div className="bg-white p-6 rounded-2xl border border-gray-150 shadow-xs flex items-start space-x-4 relative overflow-hidden group">
          <div className="p-3.5 bg-orange-50 text-orange-600 rounded-xl group-hover:scale-105 transition duration-300">
            <Users size={22} />
          </div>
          <div>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Công suất bàn hiện tại</span>
            <span className="text-2xl font-mono font-bold text-gray-900 tracking-tight block">
              {activeTablesCount}/{totalTables} bàn
            </span>
            <span className="text-[10px] text-orange-600 font-semibold block mt-1">
              Hiệu suất sử dụng bàn {Math.round((activeTablesCount / totalTables) * 100)}%
            </span>
          </div>
        </div>

        {/* Nguyên liệu dưới mức tối thiểu */}
        <div className="bg-red-50 border border-red-200 p-6 rounded-2xl shadow-xs flex items-start space-x-4 relative overflow-hidden group">
          <div className="p-3.5 bg-red-100 text-[#EE3124] rounded-xl group-hover:scale-110 transition animate-bounce">
            <AlertTriangle size={22} />
          </div>
          <div className="flex-1">
            <span className="text-[10px] font-bold text-red-800/80 uppercase tracking-widest block mb-1">Nguyên Liệu Cảnh Báo</span>
            <span className="text-2xl font-mono font-bold text-[#EE3124] tracking-tight block">
              {depletedCount} vật tư
            </span>
            {onNavigate ? (
              <button 
                onClick={() => onNavigate('warehouse')}
                className="flex items-center text-xs text-[#EE3124] mt-1.5 font-bold hover:underline cursor-pointer"
              >
                <span>Xem định mức ưu tiên</span>
                <ChevronRight size={14} />
              </button>
            ) : (
              <span className="text-[10px] text-red-700 font-semibold block mt-1">Nguy cơ thiếu nấm tươi chế biến</span>
            )}
          </div>
        </div>
      </div>

      {/* 3. Graphical Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="dashboard-charts-layout">
        <div className="lg:col-span-8 bg-white p-6 rounded-2xl border border-gray-150 shadow-sm flex flex-col justify-between h-80" id="dash-line-chart">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xs font-bold text-gray-700 uppercase tracking-widest flex items-center space-x-1.5">
              <BarChart3 size={15} className="text-[#EE3124]" />
              <span>Biểu Đồ Doanh Thu 7 Ngày Qua (Triệu đồng)</span>
            </h3>
            <span className="text-[10px] text-gray-400 font-mono">Đơn vị: Triệu VNĐ</span>
          </div>
          
          <div className="flex-1 relative flex items-end">
            <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full max-h-[190px]">
              {/* Grid Lines */}
              <line x1="30" y1="20" x2={width - 30} y2="20" stroke="#f3f4f6" strokeWidth="1" />
              <line x1="30" y1="60" x2={width - 30} y2="60" stroke="#f3f4f6" strokeWidth="1" />
              <line x1="30" y1="100" x2={width - 30} y2="100" stroke="#f3f4f6" strokeWidth="1" />
              <line x1="30" y1="140" x2={width - 30} y2="140" stroke="#f3f4f6" strokeWidth="1" />

              {/* Area Gradient under plot */}
              <defs>
                <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#EE3124" stopOpacity="0.2"/>
                  <stop offset="100%" stopColor="#EE3124" stopOpacity="0"/>
                </linearGradient>
              </defs>
              <path
                d={`M30,${height - 40} L${points} L${width - 30},${height - 40} Z`}
                fill="url(#chartGrad)"
              />

              {/* Connected Line */}
              <polyline
                fill="none"
                stroke="#EE3124"
                strokeWidth="3.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                points={points}
              />

              {/* Points circles and labels */}
              {chartData.map((d, i) => {
                const x = (i * (width - 60)) / (chartData.length - 1) + 30;
                const y = height - (d.rev * (height - 40)) / maxValY - 20;
                return (
                  <g key={i}>
                    <circle
                      cx={x}
                      cy={y}
                      r="4.5"
                      fill="#FFFFFF"
                      stroke="#EE3124"
                      strokeWidth="2.5"
                    />
                    <text
                      x={x}
                      y={y - 10}
                      textAnchor="middle"
                      fontSize="9"
                      fontWeight="bold"
                      fontFamily="monospace"
                      fill="#9B111E"
                    >
                      {d.rev.toFixed(1)}M
                    </text>
                    <text
                      x={x}
                      y={height - 2}
                      textAnchor="middle"
                      fontSize="9"
                      fill="#9ca3af"
                      fontWeight="bold"
                    >
                      {d.day}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
        </div>

        {/* Segment percentages donut */}
        <div className="lg:col-span-4 bg-white p-6 rounded-2xl border border-gray-150 shadow-sm flex flex-col justify-between h-80" id="dash-donut-chart">
          <div className="mb-2">
            <h3 className="text-xs font-bold text-gray-700 uppercase tracking-widest flex items-center space-x-1.5">
              <PieChart size={15} className="text-[#EE3124]" />
              <span>Cơ Cấu Doanh Thu Lẩu Nấm</span>
            </h3>
            <p className="text-[10px] text-gray-400 mt-0.5">Tỷ lệ phân phối theo nhóm hôm nay</p>
          </div>

          <div className="flex-1 flex flex-col items-center justify-center">
            <div className="relative w-36 h-36 flex items-center justify-center">
              <svg viewBox="0 0 36 36" className="w-full h-full transform -rotate-90">
                <circle cx="18" cy="18" r="15.915" fill="none" stroke="#f3f4f6" strokeWidth="4.2" />
                {/* Lẩu: 52% (Red) */}
                <circle cx="18" cy="18" r="15.915" fill="none" stroke="#EE3124" strokeWidth="4.2" 
                        strokeDasharray="52 48" strokeDashoffset="0" />
                {/* Topping: 28% (Orange) */}
                <circle cx="18" cy="18" r="15.915" fill="none" stroke="#F97316" strokeWidth="4.2" 
                        strokeDasharray="28 72" strokeDashoffset="-52" />
                {/* Đồ uống: 14% (Blue) */}
                <circle cx="18" cy="18" r="15.915" fill="none" stroke="#0EA5E9" strokeWidth="4.2" 
                        strokeDasharray="14 86" strokeDashoffset="-80" />
                {/* Khác: 6% (Gray) */}
                <circle cx="18" cy="18" r="15.915" fill="none" stroke="#9CA3AF" strokeWidth="4.2" 
                        strokeDasharray="6 94" strokeDashoffset="-94" />
              </svg>
              <div className="absolute flex flex-col items-center justify-center text-center">
                <span className="text-[9px] text-gray-400 font-bold uppercase">ƯU THẾ</span>
                <span className="text-base font-bold text-[#EE3124]">Lẩu 52%</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 text-[10px] text-gray-600 border-t border-gray-100 pt-3" id="donut-legends">
            <div className="flex items-center space-x-1.5">
              <div className="w-2 h-2 bg-[#EE3124] rounded-full"></div>
              <span className="truncate font-semibold text-gray-700">Đặc sản Lẩu (52%)</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <div className="w-2 h-2 bg-[#F97316] rounded-full"></div>
              <span className="truncate font-semibold text-gray-700">Topping tươi (28%)</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <div className="w-2 h-2 bg-[#0EA5E9] rounded-full"></div>
              <span className="truncate font-semibold text-gray-700">Giải khát (14%)</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <div className="w-2 h-2 bg-[#9CA3AF] rounded-full"></div>
              <span className="truncate font-semibold text-gray-700">Món khô khác (6%)</span>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Live Detailed Reporting Tabs Section [MERGED VIEW] */}
      <div className="bg-white rounded-2xl border border-gray-150 shadow-sm overflow-hidden" id="dashboard-reporting-tabs-card">
        <div className="border-b border-gray-150 bg-gray-50/70 p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div className="flex items-center space-x-2">
            <div className="w-2.5 h-2.5 rounded-full bg-[#EE3124]"></div>
            <h3 className="font-bold text-gray-800 tracking-wide text-xs uppercase">BÁO CÁO HOẠT ĐỘNG PHÂN TÍCH CHUYÊN SÂU</h3>
          </div>
          
          <div className="flex bg-white border border-gray-200 p-0.5 rounded-xl text-xs shadow-xs w-full sm:w-auto">
            <button
              onClick={() => setActiveReportTab('revenue')}
              className={`flex-1 sm:flex-initial px-4 py-1.5 font-bold rounded-lg transition-all cursor-pointer ${
                activeReportTab === 'revenue' ? 'bg-[#EE3124] text-white shadow-xs' : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              Doanh thu bàn
            </button>
            <button
              onClick={() => setActiveReportTab('orders')}
              className={`flex-1 sm:flex-initial px-4 py-1.5 font-bold rounded-lg transition-all cursor-pointer ${
                activeReportTab === 'orders' ? 'bg-[#EE3124] text-white shadow-xs' : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              Hóa đơn biên lai
            </button>
            <button
              onClick={() => setActiveReportTab('inventory')}
              className={`flex-1 sm:flex-initial px-4 py-1.5 font-bold rounded-lg transition-all cursor-pointer ${
                activeReportTab === 'inventory' ? 'bg-[#EE3124] text-white shadow-xs' : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              Cảnh báo định mức
            </button>
            <button
              onClick={() => setActiveReportTab('materials')}
              className={`flex-1 sm:flex-initial px-4 py-1.5 font-bold rounded-lg transition-all cursor-pointer ${
                activeReportTab === 'materials' ? 'bg-[#EE3124] text-white shadow-xs' : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              Lịch sử nhập kho
            </button>
          </div>
        </div>

        <div className="p-6">
          {/* TAB 1: DOANH THU THEO PHIÊN BÀN */}
          {activeReportTab === 'revenue' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center text-xs text-gray-500 font-semibold mb-2">
                <span>Danh sách phiên doanh thu hôm nay</span>
                <span className="text-[#EE3124]">Cập nhật liên tục từ QR khách đặt</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-gray-150 text-gray-400 text-[10px] uppercase font-bold tracking-wider">
                      <th className="pb-3 pt-1">Mã Phiên</th>
                      <th className="pb-3 pt-1">Bàn Số</th>
                      <th className="pb-3 pt-1">Thời gian bắt đầu</th>
                      <th className="pb-3 pt-1">Trạng thái</th>
                      <th className="pb-3 pt-1 text-right">Tổng thanh toán</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((o, idx) => {
                      const matchedTable = tables.find(t => t.Ma_ban === o.Ma_hd_dat_mon.split('_')[1]);
                      return (
                        <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50/50 transition">
                          <td className="py-3.5 font-mono font-bold text-gray-700">{o.Ma_phien}</td>
                          <td className="py-3.5">
                            <span className="px-2.5 py-1 bg-red-50 text-[#EE3124] rounded-lg font-bold text-xs">
                              Bàn {o.Ma_hd_dat_mon.split('_')[1] || 'B03'}
                            </span>
                          </td>
                          <td className="py-3.5 text-gray-500 text-xs">
                            {new Date(o.Thoi_gian).toLocaleTimeString('vi-VN', {hour: '2-digit', minute:'2-digit'})}
                          </td>
                          <td className="py-3.5">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-green-50 text-green-700 border border-green-200">
                              Đã phục vụ xong
                            </span>
                          </td>
                          <td className="py-3.5 text-right font-mono font-bold text-gray-800">
                            {o.Tong_tien.toLocaleString()}đ
                          </td>
                        </tr>
                      );
                    })}
                    {orders.length === 0 && (
                      <tr>
                        <td colSpan={5} className="py-8 text-center text-gray-400 font-medium">
                          Chưa có ghi nhận giao dịch thanh toán trong ngày.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 2: HÓA ĐƠN CHI TIẾT */}
          {activeReportTab === 'orders' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center text-xs text-gray-400 mb-2 font-semibold">
                <span>Bao gồm tất cả món đã được chuyển xuống bếp chế biến</span>
                <span className="text-gray-600 font-bold">Tổng số hóa đơn: {orders.length}</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-gray-150 text-gray-400 text-[10px] uppercase font-bold tracking-wider">
                      <th className="pb-3 pt-1">Số Hóa Đơn</th>
                      <th className="pb-3 pt-1">Thời Gian</th>
                      <th className="pb-3 pt-1">Mã Phiên Hệ Thống</th>
                      <th className="pb-3 pt-1">Trạng thái bếp</th>
                      <th className="pb-3 pt-1">Biên lai thực tế</th>
                      <th className="pb-3 pt-1 text-right">Trị Giá Đơn</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((o, idx) => (
                      <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50/50 transition">
                        <td className="py-3.5 font-mono font-bold text-[#EE3124]">{o.Ma_hd_dat_mon}</td>
                        <td className="py-3.5 text-xs text-gray-500">
                          {new Date(o.Thoi_gian).toLocaleString('vi-VN')}
                        </td>
                        <td className="py-3.5 font-mono text-xs text-gray-500">{o.Ma_phien}</td>
                        <td className="py-3.5">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            o.Trang_thai_phuc_vu === 'Đã phục vụ'
                              ? 'bg-green-50 text-green-700 border border-green-200'
                              : 'bg-orange-50 text-orange-700 border border-orange-200'
                          }`}>
                            {o.Trang_thai_phuc_vu === 'Đã phục vụ' ? 'Hoàn thành' : 'Đang xử lý'}
                          </span>
                        </td>
                        <td className="py-3.5">
                          {o.Anh_hoa_don ? (
                            <div className="flex items-center space-x-2">
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedInvoiceImage(o.Anh_hoa_don || null);
                                  setSelectedInvoiceNumber(o.Ma_hd_dat_mon);
                                }}
                                className="text-blue-600 font-bold hover:underline text-xs flex items-center space-x-1 cursor-pointer"
                              >
                                <Eye size={12} />
                                <span>Xem hóa đơn ảnh</span>
                              </button>
                              <span className="text-gray-300">|</span>
                              <button
                                type="button"
                                onClick={() => {
                                  const input = document.getElementById(`invoice-uploader-${o.Ma_hd_dat_mon}`);
                                  if (input) (input as HTMLInputElement).click();
                                }}
                                className="text-gray-500 font-semibold hover:text-[#EE3124] text-[10px] underline cursor-pointer"
                              >
                                Thay ảnh
                              </button>
                              <input
                                id={`invoice-uploader-${o.Ma_hd_dat_mon}`}
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => {
                                  if (e.target.files && e.target.files[0]) {
                                    const file = e.target.files[0];
                                    const reader = new FileReader();
                                    reader.onloadend = () => {
                                      if (updateOrderInvoice) updateOrderInvoice(o.Ma_hd_dat_mon, reader.result as string);
                                    };
                                    reader.readAsDataURL(file);
                                  }
                                }}
                              />
                            </div>
                          ) : (
                            <div className="flex items-center">
                              <button
                                type="button"
                                onClick={() => {
                                  const input = document.getElementById(`invoice-uploader-${o.Ma_hd_dat_mon}`);
                                  if (input) (input as HTMLInputElement).click();
                                }}
                                className="px-2.5 py-1.5 bg-red-50 hover:bg-red-100 text-[#EE3124] border border-red-150 rounded-lg text-[10px] font-bold flex items-center space-x-1.5 transition-all cursor-pointer"
                              >
                                <Upload size={10} className="animate-bounce" />
                                <span>Tải lên (Ổ cứng)</span>
                              </button>
                              <input
                                id={`invoice-uploader-${o.Ma_hd_dat_mon}`}
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => {
                                  if (e.target.files && e.target.files[0]) {
                                    const file = e.target.files[0];
                                    const reader = new FileReader();
                                    reader.onloadend = () => {
                                      if (updateOrderInvoice) updateOrderInvoice(o.Ma_hd_dat_mon, reader.result as string);
                                    };
                                    reader.readAsDataURL(file);
                                  }
                                }}
                              />
                            </div>
                          )}
                        </td>
                        <td className="py-3.5 text-right font-mono font-bold text-gray-700">
                          {o.Tong_tien.toLocaleString()}đ
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: ĐỊNH MỨC TỒN TỐI THIỂU */}
          {activeReportTab === 'inventory' && (
            <div className="space-y-4">
              <div className="bg-red-50 text-red-800 p-4 rounded-xl border border-red-150 flex items-center space-x-3 text-xs mb-4">
                <ShieldAlert size={18} className="text-[#EE3124] shrink-0" />
                <p className="font-semibold leading-relaxed">
                  CẢNH BÁO KHO: Dưới đây là các nguyên liệu nhúng lẩu có mức tồn kho hiện tại rơi xuống dưới NGƯỠNG TỒN TỐI THIỂU được quy định nghiêm ngặt của nhà hàng. Bộ phận Kho cần nhập thêm gấp!
                </p>
              </div>
              <div className="overflow-x-auto font-sans">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-gray-150 text-gray-400 text-[10px] uppercase font-bold tracking-wider">
                      <th className="pb-3 pt-1">Tên Nguyên Liệu</th>
                      <th className="pb-3 pt-1">Đơn vị</th>
                      <th className="pb-3 pt-1 text-center">Tồn Hiện Tại</th>
                      <th className="pb-3 pt-1 text-center">Tồn Tối Thiểu</th>
                      <th className="pb-3 pt-1 text-center">Mức Tồn Tối Đa</th>
                      <th className="pb-3 pt-1 text-right">Trạng thái</th>
                    </tr>
                  </thead>
                  <tbody>
                    {materials.map((m, idx) => {
                      const isCrisis = m.Ton_kho_hien_tai < m.Ton_kho_toi_thieu;
                      return (
                        <tr key={idx} className={`border-b border-gray-100 hover:bg-gray-50/5 transition ${isCrisis ? 'bg-red-50/20' : ''}`}>
                          <td className="py-3.5 font-bold text-gray-800">{m.Ten_nvl}</td>
                          <td className="py-3.5 text-gray-500 font-semibold">{m.Don_vi_tinh}</td>
                          <td className="py-3.5 text-center font-mono font-bold text-gray-800">
                            <span className={isCrisis ? 'text-[#EE3124] bg-red-100 px-2 py-0.5 rounded-lg font-extrabold' : ''}>
                              {m.Ton_kho_hien_tai.toLocaleString()}
                            </span>
                          </td>
                          <td className="py-3.5 text-center font-mono text-gray-500 font-semibold">{m.Ton_kho_toi_thieu.toLocaleString()}</td>
                          <td className="py-3.5 text-center font-mono text-gray-500 font-semibold">{m.Ton_kho_toi_da.toLocaleString()}</td>
                          <td className="py-3.5 text-right">
                            {isCrisis ? (
                              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-red-100 text-[#EE3124] border border-red-200 uppercase tracking-wider animate-pulse">
                                Cần nhập ngay
                              </span>
                            ) : (
                              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-green-50 text-green-700 border border-green-200">
                                Đạt định mức
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 4: LỊCH SỬ BIÊN BẢN NHẬP KHO */}
          {activeReportTab === 'materials' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center text-xs text-gray-400 mb-2 font-semibold">
                <span>Danh sách biên nhận hóa đơn chứng chỉ từ nhà quản lý</span>
                <span className="text-[#EE3124] font-bold">Số phiếu nhập: {importReceipts.length}</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-gray-150 text-gray-400 text-[10px] uppercase font-bold tracking-wider">
                      <th className="pb-3 pt-1">Số Biên Bản</th>
                      <th className="pb-3 pt-1">Thời Gian Nhận</th>
                      <th className="pb-3 pt-1">Người Giao hàng</th>
                      <th className="pb-3 pt-1">Thủ Kho Nhận</th>
                      <th className="pb-3 pt-1">Ảnh chụp biên lai</th>
                      <th className="pb-3 pt-1 text-right">Tổng Giá Trị</th>
                    </tr>
                  </thead>
                  <tbody>
                    {importReceipts.map((r, idx) => (
                      <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50/50 transition">
                        <td className="py-3.5 font-mono font-bold text-gray-700">{r.Ma_bb}</td>
                        <td className="py-3.5 text-xs text-gray-500">
                          {new Date(r.Ngay_nhan).toLocaleString('vi-VN')}
                        </td>
                        <td className="py-3.5 font-bold text-gray-850 text-xs">{r.Ten_nguoi_giao}</td>
                        <td className="py-3.5 text-gray-600 text-xs">{r.Ho_ten_nhan_vien}</td>
                        <td className="py-3.5 text-xs">
                          {r.Anh_don_nhap ? (
                            <a
                              href={r.Anh_don_nhap}
                              target="_blank"
                              rel="noreferrer"
                              className="text-blue-600 font-bold hover:underline flex items-center space-x-1"
                            >
                              <Eye size={12} />
                              <span>Xem hóa đơn ảnh</span>
                            </a>
                          ) : (
                            <span className="text-gray-400 italic">Không tìm thấy ảnh</span>
                          )}
                        </td>
                        <td className="py-3.5 text-right font-mono font-bold text-gray-800">
                          {r.Tong_tien.toLocaleString()}đ
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Lightbox Modal for invoice image */}
      {selectedInvoiceImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-250">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full relative space-y-4 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center pb-2 border-b border-gray-100">
              <span className="font-extrabold text-gray-800 text-sm uppercase tracking-wide">
                Ảnh biên lai hóa đơn: <span className="font-mono text-[#EE3124] font-black">{selectedInvoiceNumber}</span>
              </span>
              <button
                onClick={() => {
                  setSelectedInvoiceImage(null);
                  setSelectedInvoiceNumber('');
                }}
                className="text-gray-400 hover:text-gray-600 font-bold text-lg select-none cursor-pointer p-1"
              >
                ✕
              </button>
            </div>
            <div className="relative aspect-[3/4] max-h-[50vh] overflow-hidden rounded-xl bg-gray-50 border border-gray-150 flex items-center justify-center">
              <img
                src={selectedInvoiceImage}
                alt={`Biên lai ${selectedInvoiceNumber}`}
                className="max-h-full max-w-full object-contain"
                referrerPolicy="no-referrer"
              />
            </div>
            <p className="text-[10px] text-gray-400 text-center italic">
              Nếu thông tin ảnh mờ hoặc không chính xác, vui lòng tải ảnh chụp thay thế khác từ máy tính.
            </p>
            <div className="text-center pt-2">
              <button
                onClick={() => {
                  setSelectedInvoiceImage(null);
                  setSelectedInvoiceNumber('');
                }}
                className="px-6 py-2 bg-[#EE3124] text-white hover:bg-[#EE3124]/90 font-extrabold text-xs rounded-xl shadow-md transition-all cursor-pointer uppercase"
              >
                Đóng ảnh xem
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
