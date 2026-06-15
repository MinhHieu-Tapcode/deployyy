/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { useRestaurantStore } from '../data/store';
import { RawMaterial } from '../types';
import {
  Calendar,
  Users,
  Calculator,
  CheckCircle,
  AlertTriangle,
  Search,
  Copy,
  Printer,
  ChevronDown,
  ChevronUp,
  PackageCheck,
  AlertCircle,
  Filter,
  Check,
  TrendingUp
} from 'lucide-react';

export default function MaterialCalcView() {
  const { materials, recipes, dishes } = useRestaurantStore();
  const [guestCount, setGuestCount] = useState<number>(100);
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [calculated, setCalculated] = useState(false);
  const [calculatedResults, setCalculatedResults] = useState<any[]>([]);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'ready' | 'low' | 'deficient'>('all');
  const [showInfo, setShowInfo] = useState(true);
  const [copied, setCopied] = useState(false);

  const handleCalculate = (e: React.FormEvent) => {
    e.preventDefault();
    const todayStr = new Date().toISOString().split('T')[0];
    if (date < todayStr) {
      alert('Ngày tính toán dự báo nhu cầu không được ở quá khứ.');
      return;
    }
    if (guestCount <= 0) {
      alert('Số khách dự kiến phải là số lớn hơn 0.');
      return;
    }

    // Historical probability/demand weights per guest:
    const weights: Record<string, number> = {
      m01: 0.30, // 30% order Lẩu Thập Cẩm
      m02: 0.25, // 25% order Lẩu Gà Đen
      m03: 0.20, // 20% order Lẩu Hải Sản
      m04: 0.60, // 60% order Ba chỉ bò Mỹ
      m05: 0.50, // 50% order Nấm Kim Châm
      m06: 0.40, // 40% order Nấm bào ngư
      m07: 0.35, // 35% order Tàu hũ kỵ
      m08: 0.80, // 80% order Nước Lavie
    };

    // Calculate forecasted dish counts
    const forecastedDishesObj: Record<string, number> = {};
    dishes.forEach(d => {
      const weight = weights[d.Ma_mon] || 0.1;
      forecastedDishesObj[d.Ma_mon] = Math.ceil(guestCount * weight);
    });

    // Sum up ingredient needs
    const neededMaterialsObj: Record<string, number> = {};
    recipes.forEach(recipe => {
      const forecastedQuantity = forecastedDishesObj[recipe.Ma_mon] || 0;
      const neededForThisLine = recipe.So_luong_dinh_luong * forecastedQuantity;
      
      neededMaterialsObj[recipe.Ma_nvl] = (neededMaterialsObj[recipe.Ma_nvl] || 0) + neededForThisLine;
    });

    // Match with current store inventory
    const results = materials.map(mat => {
      const needed = neededMaterialsObj[mat.Ma_nvl] || 0;
      const current = mat.Ton_kho_hien_tai;
      const diff = current - needed;
      const isDeficient = diff < 0;

      let statusLabel = 'Đủ';
      if (isDeficient) {
        statusLabel = 'Thiếu';
      } else if (current - needed < mat.Ton_kho_toi_thieu) {
        statusLabel = 'Sắp thiếu';
      }

      return {
        ...mat,
        needed,
        diff,
        isDeficient,
        statusLabel,
      };
    });

    setCalculatedResults(results);
    setCalculated(true);
  };

  // Helper to remove accents from Vietnamese string
  const removeAccents = (str: string) => {
    return str
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/đ/g, 'd')
      .replace(/Đ/g, 'D');
  };

  // Filtered results based on search query & status filter
  const filteredResults = useMemo(() => {
    return calculatedResults.filter(item => {
      // 1. Search Query match
      const cleanQuery = removeAccents(searchQuery.trim().toLowerCase());
      const nameMatch = removeAccents(item.Ten_nvl.toLowerCase()).includes(cleanQuery);
      const codeMatch = removeAccents(item.Ma_nvl.toLowerCase()).includes(cleanQuery);
      if (searchQuery && !nameMatch && !codeMatch) return false;

      // 2. Status Filter match
      if (statusFilter === 'ready' && item.statusLabel !== 'Đủ') return false;
      if (statusFilter === 'low' && item.statusLabel !== 'Sắp thiếu') return false;
      if (statusFilter === 'deficient' && item.statusLabel !== 'Thiếu') return false;

      return true;
    });
  }, [calculatedResults, searchQuery, statusFilter]);

  // Summary counts
  const stats = useMemo(() => {
    let total = calculatedResults.length;
    let deficient = 0;
    let low = 0;
    let ok = 0;

    calculatedResults.forEach(r => {
      if (r.statusLabel === 'Thiếu') deficient++;
      else if (r.statusLabel === 'Sắp thiếu') low++;
      else ok++;
    });

    return { total, deficient, low, ok };
  }, [calculatedResults]);

  // Copy Zalo order helper
  const handleCopyZalo = () => {
    const deficientItems = calculatedResults.filter(r => r.isDeficient);
    if (deficientItems.length === 0) {
      alert("Không có nguyên vật liệu nào bị thiếu hụt để lập danh sách đặt hàng!");
      return;
    }

    const dateFormatted = new Date(date).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });

    let text = `🍄 DANH SÁCH ĐẶT HÀNG NGUYÊN LIỆU - LẨU NẤM GIA KHÁNH 🍄\n`;
    text += `📅 Dự kiến phục vụ ngày: ${dateFormatted} (Quy mô: ${guestCount} khách)\n`;
    text += `-------------------------------------------\n`;
    deficientItems.forEach((row, index) => {
      const neededQty = Math.abs(row.diff);
      const qtyStr = Number(neededQty.toFixed(2)).toLocaleString('vi-VN');
      text += `${index + 1}. ${row.Ten_nvl}: Đặt thêm ${qtyStr} ${row.Don_vi_tinh}\n`;
    });
    text += `-------------------------------------------\n`;
    text += `✍️ Kính gửi Nhà cung cấp chuẩn bị hàng và giao trước 08:00 sáng. Trân trọng cảm ơn!`;

    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handlePrint = () => {
    window.print();
  };

  const formattedDateString = new Date(date).toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });

  return (
    <div className="space-y-6 text-sm relative" id="calc-view-root">
      {/* Styles for printing only the proposal area */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #print-area, #print-area * {
            visibility: visible;
          }
          #print-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            background: white !important;
            color: black !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      {/* Header Panel */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-6 rounded-2xl border border-gray-200 shadow-sm gap-4 no-print">
        <div>
          <h2 className="text-xl font-extrabold text-[#EE3124] tracking-tight uppercase flex items-center gap-2">
            <TrendingUp size={22} className="text-[#EE3124]" />
            <span>Dự Báo & Đặt Hàng Nguyên Liệu Sớm</span>
          </h2>
          <p className="text-xs text-gray-500 font-medium mt-1">Dự trù nguyên liệu đặt trước nhà cung cấp cho các ngày cao điểm đông khách</p>
        </div>
      </div>

      {/* Input Parameters Box */}
      <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm no-print">
        <form onSubmit={handleCalculate} className="grid grid-cols-1 md:grid-cols-12 gap-5 items-end">
          <div className="md:col-span-4">
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 flex items-center space-x-1.5">
              <Calendar size={14} className="text-[#EE3124]" />
              <span>Ngày phục vụ dự kiến *</span>
            </label>
            <input
              type="date"
              required
              min={new Date().toISOString().split('T')[0]}
              className="w-full px-4 py-2.5 bg-[#FAF9F6] border border-gray-200 focus:border-[#EE3124] focus:ring-1 focus:ring-[#EE3124] rounded-xl font-bold text-gray-800 outline-none transition-all cursor-pointer"
              value={date}
              onChange={e => {
                const todayStr = new Date().toISOString().split('T')[0];
                if (e.target.value < todayStr) {
                  alert('Ngày tính toán dự báo nhu cầu không được ở quá khứ.');
                  return;
                }
                setDate(e.target.value);
              }}
            />
          </div>

          <div className="md:col-span-4">
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 flex items-center space-x-1.5">
              <Users size={14} className="text-[#EE3124]" />
              <span>Tổng số khách dự kiến *</span>
            </label>
            <input
              type="number"
              required
              min="1"
              max="2000"
              className="w-full px-4 py-2.5 bg-[#FAF9F6] border border-gray-200 focus:border-[#EE3124] focus:ring-1 focus:ring-[#EE3124] rounded-xl font-mono font-bold text-gray-800 outline-none transition-all"
              placeholder="Nhập số khách (Ví dụ: 150)"
              value={guestCount}
              onChange={e => setGuestCount(Number(e.target.value))}
            />
          </div>

          <div className="md:col-span-4">
            <button
              id="btn-calculate"
              type="submit"
              className="w-full py-3 bg-[#EE3124] hover:bg-[#D42A1E] text-white rounded-xl font-black text-xs tracking-wider uppercase transition shadow-md flex items-center justify-center space-x-2 cursor-pointer"
            >
              <Calculator size={16} />
              <span>TÍNH TOÁN DỰ TRÙ MUA HÀNG</span>
            </button>
          </div>
        </form>
      </div>

      {/* Results Content Area */}
      {calculated && (
        <div className="space-y-6" id="print-area">
          
          {/* Executive KPI Summary Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 no-print">
            {/* Card 1: Guest Scale */}
            <div className="bg-gradient-to-br from-[#EE3124] to-[#f25e54] text-white p-5 rounded-2xl shadow-sm relative overflow-hidden">
              <div className="absolute right-[-10px] bottom-[-10px] opacity-15">
                <Users size={96} />
              </div>
              <span className="text-[10px] font-black tracking-widest uppercase text-white/80 block">QUY MÔ CA PHỤC VỤ</span>
              <span className="text-2xl font-black font-mono block mt-1">{guestCount.toLocaleString()} khách</span>
              <span className="text-[11px] text-white/90 font-medium block mt-1.5">Áp dụng ngày: {formattedDateString}</span>
            </div>

            {/* Card 2: Ready Items */}
            <div className="bg-white border border-gray-200 p-5 rounded-2xl shadow-sm flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-[10px] font-black tracking-widest uppercase text-gray-400 block">VẬT TƯ ĐÃ ĐỦ HÀNG</span>
                <span className="text-2xl font-black font-mono text-emerald-600 block mt-1">{stats.ok} / {stats.total}</span>
                <span className="text-[11px] text-gray-400 font-medium block">Sẵn sàng phục vụ không cần mua thêm</span>
              </div>
              <div className="bg-emerald-50 text-emerald-600 p-3 rounded-2xl shrink-0">
                <PackageCheck size={28} />
              </div>
            </div>

            {/* Card 3: Deficient Items */}
            <div className={`border p-5 rounded-2xl shadow-sm flex items-center justify-between transition-all ${
              stats.deficient > 0 
                ? 'bg-red-50/50 border-red-200 text-red-950' 
                : 'bg-white border-gray-200'
            }`}>
              <div className="space-y-1">
                <span className="text-[10px] font-black tracking-widest uppercase text-gray-400 block">VẬT TƯ THIẾU HỤT CẦN ĐẶT</span>
                <span className={`text-2xl font-black font-mono block mt-1 ${stats.deficient > 0 ? 'text-[#EE3124]' : 'text-gray-800'}`}>
                  {stats.deficient} mặt hàng
                </span>
                <span className="text-[11px] text-gray-400 font-medium block">Yêu cầu lên đơn đặt trước nhà cung cấp</span>
              </div>
              <div className={`p-3 rounded-2xl shrink-0 ${
                stats.deficient > 0 ? 'bg-red-100 text-red-700 animate-pulse' : 'bg-gray-50 text-gray-500'
              }`}>
                <AlertCircle size={28} />
              </div>
            </div>
          </div>

          {/* Print specific header information */}
          <div className="hidden print:block border-b-2 border-black pb-4 mb-6">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-black uppercase">Đơn Đề Xuất Đặt Hàng Nguyên Vật Liệu</h1>
                <p className="text-sm text-gray-650 mt-1">Dự báo nhu cầu nguyên liệu cho ngày phục vụ: <strong>{formattedDateString}</strong></p>
                <p className="text-xs text-gray-500">Quy mô ca phục vụ: {guestCount} khách dự kiến</p>
              </div>
              <div className="text-right">
                <h2 className="text-lg font-bold">Lẩu Nấm Gia Khánh</h2>
                <p className="text-xs text-gray-500">Hệ thống quản lý tồn kho trực tuyến</p>
              </div>
            </div>
          </div>

          {/* Forecasting basis information (Collapsible Accordion) */}
          <div className="bg-amber-55/70 border border-amber-150 rounded-2xl p-4 space-y-2.5 no-print transition-all">
            <button 
              onClick={() => setShowInfo(!showInfo)}
              className="w-full flex justify-between items-center text-amber-900 font-bold text-xs uppercase tracking-wider focus:outline-none cursor-pointer"
            >
              <span className="flex items-center space-x-2">
                <span>💡 Cơ sở tính toán nhu cầu nguyên liệu của ca dự kiến</span>
              </span>
              {showInfo ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>

            {showInfo && (
              <p className="text-[11px] text-amber-950/80 leading-relaxed font-sans font-semibold pt-1 border-t border-amber-200/50">
                Hệ thống tự động dự báo nhu cầu dựa trên tỷ lệ đặt món tiêu chuẩn: 30% khách ăn Lẩu Thập Cẩm, 25% Lẩu Gà Đen, 20% Lẩu Hải Sản, và 60% lượng Ba Chỉ Bò Mỹ gọi thêm, v.v. Tổng số lượng nguyên liệu cần thiết được nhân chéo trực tiếp với định mức công thức nấu ăn của quán trong cơ sở dữ liệu và đối chiếu trực tiếp với lượng tồn thực phẩm thực tế trong kho để tính thừa/thiếu.
              </p>
            )}
          </div>

          {/* Main Table & Controls container */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
            
            {/* Table Control Header Bar */}
            <div className="p-4 bg-gray-50/50 border-b border-gray-200 flex flex-col md:flex-row md:items-center justify-between gap-4 no-print">
              <div className="flex flex-wrap items-center gap-3">
                {/* Search query input */}
                <div className="relative w-full sm:w-64">
                  <Search className="absolute left-3 top-2.5 text-gray-400" size={14} />
                  <input
                    type="text"
                    placeholder="Tìm nguyên liệu..."
                    className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-xs bg-white focus:border-[#EE3124] focus:ring-1 focus:ring-[#EE3124] outline-none transition-all"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>

                {/* Status Quick Filter pills */}
                <div className="flex bg-gray-100 p-1 rounded-xl items-center text-xs font-semibold text-gray-500">
                  <button
                    onClick={() => setStatusFilter('all')}
                    className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${statusFilter === 'all' ? 'bg-white text-gray-800 shadow-xs font-bold' : 'hover:text-gray-800'}`}
                  >
                    Tất cả ({stats.total})
                  </button>
                  <button
                    onClick={() => setStatusFilter('deficient')}
                    className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center space-x-1 ${statusFilter === 'deficient' ? 'bg-[#EE3124] text-white shadow-xs font-bold' : 'hover:text-[#EE3124]'}`}
                  >
                    <span>Cần đặt hàng</span>
                    {stats.deficient > 0 && <span className="bg-white text-[#EE3124] text-[9px] font-black px-1.5 py-0.5 rounded-full">{stats.deficient}</span>}
                  </button>
                  <button
                    onClick={() => setStatusFilter('ready')}
                    className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${statusFilter === 'ready' ? 'bg-white text-gray-800 shadow-xs font-bold' : 'hover:text-gray-800'}`}
                  >
                    Sẵn sàng ({stats.ok})
                  </button>
                </div>
              </div>

              {/* Action buttons to copy and print */}
              <div className="flex items-center gap-3">
                <button
                  onClick={handleCopyZalo}
                  className={`flex items-center justify-center space-x-1.5 border px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-xs shrink-0 cursor-pointer ${
                    copied 
                      ? 'bg-emerald-50 border-emerald-300 text-emerald-700' 
                      : 'bg-white border-gray-300 hover:border-gray-400 text-gray-700'
                  }`}
                  title="Sao chép tin nhắn định dạng đặt hàng gửi nhà cung cấp qua Zalo/SMS"
                >
                  {copied ? <Check size={14} /> : <Copy size={14} />}
                  <span>{copied ? 'Đã sao chép!' : 'Sao chép Zalo đặt hàng'}</span>
                </button>

                <button
                  onClick={handlePrint}
                  className="flex items-center justify-center space-x-1.5 bg-gray-800 hover:bg-gray-950 text-white px-4 py-2 rounded-xl text-xs font-bold transition-colors shadow-md shrink-0 cursor-pointer"
                  title="In hoặc lưu file PDF danh sách nguyên vật liệu dự báo"
                >
                  <Printer size={14} />
                  <span>In danh sách đặt hàng</span>
                </button>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto flex-1">
              {filteredResults.length > 0 ? (
                <table className="w-full text-left border-collapse min-w-[750px]">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr className="text-[10px] font-extrabold text-gray-500 uppercase tracking-wider">
                      <th className="py-4 px-6 text-center w-12">STT</th>
                      <th className="py-4 px-4 w-1/3">Nguyên vật liệu</th>
                      <th className="py-4 px-4 text-center">Đơn vị</th>
                      <th className="py-4 px-4 text-right">Nhu cầu dự kiến</th>
                      <th className="py-4 px-4 text-right">Tồn kho hiện tại</th>
                      <th className="py-4 px-4 text-right">Đặt mua thêm</th>
                      <th className="py-4 px-6 text-center w-36 no-print">Trạng Thái</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-xs text-gray-600">
                    {filteredResults.map((row, index) => {
                      let badgeClass = '';
                      let badgeText = '';

                      if (row.statusLabel === 'Thiếu') {
                        badgeClass = 'bg-red-50 text-[#B91C1C] border border-red-100';
                        badgeText = 'Cần mua thêm';
                      } else if (row.statusLabel === 'Sắp thiếu') {
                        badgeClass = 'bg-amber-50 text-amber-700 border border-amber-100';
                        badgeText = 'Sắp thiếu hụt';
                      } else {
                        badgeClass = 'bg-emerald-50 text-emerald-700 border border-emerald-100';
                        badgeText = 'Đủ hàng';
                      }

                      return (
                        <tr key={row.Ma_nvl} className="hover:bg-gray-50/50 transition duration-150">
                          <td className="py-4 px-6 text-center font-bold font-mono text-gray-400">{index + 1}</td>
                          <td className="py-4 px-4 font-bold text-gray-800 text-sm">
                            {row.Ten_nvl}
                          </td>
                          <td className="py-4 px-4 text-center font-bold text-gray-400">{row.Don_vi_tinh}</td>
                          <td className="py-4 px-4 text-right font-mono font-bold text-blue-600 text-sm">
                            {row.needed.toLocaleString()}&nbsp;{row.Don_vi_tinh}
                          </td>
                          <td className="py-4 px-4 text-right font-mono font-bold text-gray-500 text-sm">
                            {row.Ton_kho_hien_tai.toLocaleString()}&nbsp;{row.Don_vi_tinh}
                          </td>
                          <td className={`py-4 px-4 text-right font-mono font-black text-sm ${
                            row.isDeficient ? 'text-[#EE3124]' : 'text-emerald-600'
                          }`}>
                            {row.isDeficient ? (
                              <span className="flex items-center justify-end space-x-1">
                                <AlertTriangle size={12} className="text-[#EE3124] shrink-0" />
                                <span>{Math.abs(row.diff).toLocaleString()}&nbsp;{row.Don_vi_tinh}</span>
                              </span>
                            ) : (
                              <span>0 {row.Don_vi_tinh}</span>
                            )}
                          </td>
                          <td className="py-4 px-6 text-center no-print">
                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wide ${badgeClass}`}>
                              {row.statusLabel === 'Thiếu' && <AlertTriangle size={10} className="mr-1 animate-pulse" />}
                              <span>{badgeText}</span>
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              ) : (
                <div className="p-10 text-center text-gray-400 italic">
                  <AlertCircle size={36} className="mx-auto text-gray-300 mb-2.5" />
                  <p className="text-sm font-semibold">Không tìm thấy kết quả nào tương thích với bộ lọc tìm kiếm!</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
