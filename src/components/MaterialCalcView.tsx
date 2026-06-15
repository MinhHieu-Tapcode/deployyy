/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo, useState } from 'react';
import { useRestaurantStore } from '../data/store';
import {
  AlertCircle,
  BarChart3,
  Calendar,
  Calculator,
  Check,
  Copy,
  Network,
  Printer,
  Search,
  TrendingUp,
  Users,
} from 'lucide-react';

type ForecastMaterial = {
  Ma_nvl: string;
  Ten_nvl: string;
  Don_vi_tinh: string;
  needed: number;
  sourceDishes: string[];
};

type DishForecast = {
  dishId: string;
  name: string;
  historicalQty: number;
  basketAdjustedQty: number;
};

type BasketRule = {
  fromDishId: string;
  toDishId: string;
  fromName: string;
  toName: string;
  support: number;
  confidence: number;
  lift: number;
  pairCount: number;
};

type AnalysisResult = {
  materials: ForecastMaterial[];
  dishForecasts: DishForecast[];
  rules: BasketRule[];
  basketCount: number;
  orderCount: number;
  totalHistoricalGuests: number;
};

const normalizeText = (value: string) =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase();

const roundUp = (value: number) => Math.ceil(value);

export default function MaterialCalcView() {
  const { materials, recipes, dishes, orders, orderDetails, sessions } = useRestaurantStore();
  const [guestCount, setGuestCount] = useState<number>(100);
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [hasForecast, setHasForecast] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [copied, setCopied] = useState(false);

  const dishName = (dishId: string) =>
    dishes.find(dish => dish.Ma_mon === dishId)?.Ten_mon || dishId;

  const isComboDish = (dishId: string) =>
    dishName(dishId).trim().toLowerCase().startsWith('combo');

  const analysis = useMemo<AnalysisResult | null>(() => {
    const now = new Date();
    const sevenDaysAgo = new Date(now);
    sevenDaysAgo.setDate(now.getDate() - 7);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const recentOrders = orders.filter(order => {
      const orderedAt = new Date(order.Thoi_gian);
      return !Number.isNaN(orderedAt.getTime()) && orderedAt >= sevenDaysAgo && orderedAt <= now;
    });

    if (recentOrders.length === 0) return null;

    const orderToSession = new Map(recentOrders.map(order => [order.Ma_hd_dat_mon, order.Ma_phien]));
    const recentOrderIds = new Set(recentOrders.map(order => order.Ma_hd_dat_mon));
    const validDetails = orderDetails.filter(
      detail => recentOrderIds.has(detail.Ma_hd_dat_mon) && !String(detail.Trang_thai_mon).includes('hủy')
    );

    const basketsBySession = new Map<string, Map<string, number>>();
    validDetails.forEach(detail => {
      const sessionId = orderToSession.get(detail.Ma_hd_dat_mon) || detail.Ma_hd_dat_mon;
      const basket = basketsBySession.get(sessionId) || new Map<string, number>();
      basket.set(detail.Ma_mon, (basket.get(detail.Ma_mon) || 0) + Number(detail.So_luong || 0));
      basketsBySession.set(sessionId, basket);
    });

    const baskets = Array.from(basketsBySession.entries()).filter(([, basket]) => basket.size > 0);
    if (baskets.length === 0) return null;

    const sessionGuests = new Map<string, number>(
      sessions.map(session => [session.Ma_phien, Number((session as any).So_khach || (session as any).guests_count || 4)])
    );
    const totalHistoricalGuests = baskets.reduce((sum, [sessionId]) => sum + (sessionGuests.get(sessionId) || 4), 0);

    const dishQty = new Map<string, number>();
    const dishBasketCount = new Map<string, number>();
    const pairCount = new Map<string, number>();

    baskets.forEach(([, basket]) => {
      const dishIds = Array.from(basket.keys());
      dishIds.forEach(dishId => {
        dishQty.set(dishId, (dishQty.get(dishId) || 0) + (basket.get(dishId) || 0));
        dishBasketCount.set(dishId, (dishBasketCount.get(dishId) || 0) + 1);
      });

      dishIds.forEach(fromDishId => {
        dishIds.forEach(toDishId => {
          if (fromDishId === toDishId) return;
          pairCount.set(`${fromDishId}__${toDishId}`, (pairCount.get(`${fromDishId}__${toDishId}`) || 0) + 1);
        });
      });
    });

    const basketCount = baskets.length;
    const baseForecast = new Map<string, number>();
    dishes.forEach(dish => {
      const historicalQty = dishQty.get(dish.Ma_mon) || 0;
      const qtyPerGuest = totalHistoricalGuests > 0 ? historicalQty / totalHistoricalGuests : 0;
      baseForecast.set(dish.Ma_mon, guestCount * qtyPerGuest);
    });

    const rules: BasketRule[] = Array.from(pairCount.entries())
      .map(([key, count]) => {
        const [fromDishId, toDishId] = key.split('__');
        const fromCount = dishBasketCount.get(fromDishId) || 1;
        const toCount = dishBasketCount.get(toDishId) || 1;
        const support = count / basketCount;
        const confidence = count / fromCount;
        const lift = confidence / (toCount / basketCount);

        return {
          fromDishId,
          toDishId,
          fromName: dishName(fromDishId),
          toName: dishName(toDishId),
          support,
          confidence,
          lift,
          pairCount: count,
        };
      })
      .filter(
        rule =>
          isComboDish(rule.fromDishId) &&
          !isComboDish(rule.toDishId) &&
          rule.support >= 0.08 &&
          rule.confidence >= 0.35 &&
          rule.lift >= 1
      )
      .sort((a, b) => b.confidence * b.lift - a.confidence * a.lift)
      .slice(0, 8);

    const basketAdjustedForecast = new Map(baseForecast);
    rules.forEach(rule => {
      const fromQty = basketAdjustedForecast.get(rule.fromDishId) || 0;
      const suggestedQty = fromQty * rule.confidence;
      const currentQty = basketAdjustedForecast.get(rule.toDishId) || 0;
      if (suggestedQty > currentQty) {
        basketAdjustedForecast.set(rule.toDishId, suggestedQty);
      }
    });

    const materialNeeds = new Map<string, ForecastMaterial>();
    recipes.forEach(recipe => {
      const forecastQty = basketAdjustedForecast.get(recipe.Ma_mon) || 0;
      if (forecastQty <= 0) return;

      const material = materials.find(item => item.Ma_nvl === recipe.Ma_nvl);
      if (!material) return;

      const current = materialNeeds.get(recipe.Ma_nvl) || {
        Ma_nvl: recipe.Ma_nvl,
        Ten_nvl: material.Ten_nvl,
        Don_vi_tinh: material.Don_vi_tinh,
        needed: 0,
        sourceDishes: [],
      };

      current.needed += recipe.So_luong_dinh_luong * forecastQty;
      if (!current.sourceDishes.includes(dishName(recipe.Ma_mon))) {
        current.sourceDishes.push(dishName(recipe.Ma_mon));
      }
      materialNeeds.set(recipe.Ma_nvl, current);
    });

    return {
      materials: Array.from(materialNeeds.values())
        .map(item => ({ ...item, needed: roundUp(item.needed) }))
        .sort((a, b) => b.needed - a.needed),
      dishForecasts: Array.from(dishQty.entries())
        .map(([dishId, historicalQty]) => ({
          dishId,
          name: dishName(dishId),
          historicalQty,
          basketAdjustedQty: roundUp(basketAdjustedForecast.get(dishId) || 0),
        }))
        .sort((a, b) => b.historicalQty - a.historicalQty),
      rules,
      basketCount,
      orderCount: recentOrders.length,
      totalHistoricalGuests,
    };
  }, [dishes, guestCount, materials, orderDetails, orders, recipes, sessions]);

  const filteredResults = useMemo(() => {
    if (!analysis) return [];
    const query = normalizeText(searchQuery.trim());
    return analysis.materials.filter(item => {
      if (!query) return true;
      return (
        normalizeText(item.Ten_nvl).includes(query) ||
        normalizeText(item.Ma_nvl).includes(query) ||
        normalizeText(item.sourceDishes.join(' ')).includes(query)
      );
    });
  }, [analysis, searchQuery]);

  const formattedDateString = new Date(date).toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });

  const handleCalculate = (e: React.FormEvent) => {
    e.preventDefault();

    const todayStr = new Date().toISOString().split('T')[0];
    if (date < todayStr) {
      alert('Ngày phục vụ dự kiến không được ở quá khứ.');
      return;
    }
    if (guestCount <= 0) {
      alert('Số khách dự kiến phải lớn hơn 0.');
      return;
    }
    if (!analysis) {
      alert('Chưa có đủ đơn hàng trong 7 ngày gần nhất để phân tích quy luật đặt món.');
      return;
    }

    setHasForecast(true);
  };

  const handleCopyOrder = () => {
    if (!analysis || analysis.materials.length === 0) {
      alert('Chưa có dữ liệu dự báo nguyên vật liệu để sao chép.');
      return;
    }

    let text = `DANH SÁCH NGUYÊN VẬT LIỆU DỰ KIẾN - LẨU NẤM GIA KHÁNH\n`;
    text += `Ngày phục vụ: ${formattedDateString} | Số khách dự kiến: ${guestCount}\n`;
    text += `Cơ sở: phân tích giỏ hàng 7 ngày gần nhất (${analysis.basketCount} phiên, ${analysis.orderCount} đơn)\n`;
    text += `-------------------------------------------\n`;
    analysis.materials.forEach((row, index) => {
      text += `${index + 1}. ${row.Ten_nvl}: ${row.needed.toLocaleString('vi-VN')} ${row.Don_vi_tinh}\n`;
    });

    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const maxHistoricalQty = Math.max(1, ...(analysis?.dishForecasts.map(item => item.historicalQty) || [1]));
  const maxRuleConfidence = Math.max(0.01, ...(analysis?.rules.map(rule => rule.confidence) || [0.01]));
  const topDish = analysis?.dishForecasts[0]?.name || 'Chưa có dữ liệu';

  return (
    <div className="space-y-6 text-sm relative" id="calc-view-root">
      <style>{`
        @media print {
          body * { visibility: hidden; }
          #print-area, #print-area * { visibility: visible; }
          #print-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            background: white !important;
            color: black !important;
          }
          .no-print { display: none !important; }
        }
      `}</style>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-6 rounded-xl border border-gray-200 shadow-sm gap-4 no-print">
        <div>
          <h2 className="text-xl font-extrabold text-[#EE3124] tracking-tight uppercase flex items-center gap-2">
            <TrendingUp size={22} className="text-[#EE3124]" />
            <span>Dự báo nhu cầu nguyên vật liệu</span>
          </h2>
          <p className="text-xs text-gray-500 font-medium mt-1">
            Phân tích quy luật đặt món 7 ngày gần nhất bằng Market Basket Analysis để lập danh sách NVL cần chuẩn bị.
          </p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm no-print">
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
              className="w-full px-4 py-2.5 bg-[#FAF9F6] border border-gray-200 focus:border-[#EE3124] focus:ring-1 focus:ring-[#EE3124] rounded-lg font-bold text-gray-800 outline-none transition-all cursor-pointer"
              value={date}
              onChange={e => {
                setDate(e.target.value);
                setHasForecast(false);
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
              className="w-full px-4 py-2.5 bg-[#FAF9F6] border border-gray-200 focus:border-[#EE3124] focus:ring-1 focus:ring-[#EE3124] rounded-lg font-mono font-bold text-gray-800 outline-none transition-all"
              placeholder="Nhập số khách, ví dụ: 150"
              value={guestCount}
              onChange={e => {
                setGuestCount(Number(e.target.value));
                setHasForecast(false);
              }}
            />
          </div>

          <div className="md:col-span-4">
            <button
              id="btn-calculate"
              type="submit"
              className="w-full py-3 bg-[#EE3124] hover:bg-[#D42A1E] text-white rounded-lg font-black text-xs tracking-wider uppercase transition shadow-md flex items-center justify-center space-x-2 cursor-pointer"
            >
              <Calculator size={16} />
              <span>Phân tích & dự báo NVL</span>
            </button>
          </div>
        </form>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5 no-print">
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-black text-gray-900 uppercase flex items-center gap-2">
                <BarChart3 size={17} className="text-[#EE3124]" />
                Tần suất món 7 ngày
              </h3>
              <p className="text-[11px] text-gray-500 mt-1">Biểu đồ luôn hiển thị theo lịch sử hóa đơn 7 ngày gần nhất.</p>
            </div>
          </div>
          <div className="space-y-3">
            {analysis?.dishForecasts.length ? (
              analysis.dishForecasts.slice(0, 8).map(item => (
                <div key={item.dishId} className="space-y-1.5">
                  <div className="flex items-center justify-between gap-3 text-xs">
                    <span className="font-bold text-gray-800 truncate">{item.name}</span>
                    <span className="font-mono font-black text-gray-500 shrink-0">{item.historicalQty} phần</span>
                  </div>
                  <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full bg-[#EE3124]"
                      style={{ width: `${Math.max(6, (item.historicalQty / maxHistoricalQty) * 100)}%` }}
                    />
                  </div>
                </div>
              ))
            ) : (
              <EmptyChart message="Chưa có hóa đơn trong 7 ngày gần nhất để vẽ biểu đồ tần suất món." />
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-black text-gray-900 uppercase flex items-center gap-2">
                <Network size={17} className="text-[#EE3124]" />
                Luật món đi kèm
              </h3>
              <p className="text-[11px] text-gray-500 mt-1">Chỉ hiển thị luật combo chính → món phụ/topping.</p>
            </div>
          </div>
          <div className="space-y-3">
            {analysis?.rules.length ? (
              analysis.rules.slice(0, 6).map(rule => (
                <div key={`${rule.fromDishId}_${rule.toDishId}`} className="border border-gray-100 rounded-lg p-3">
                  <div className="flex items-start justify-between gap-3 text-xs">
                    <div className="font-bold text-gray-800 leading-snug">
                      {rule.fromName} <span className="text-[#EE3124]">→</span> {rule.toName}
                    </div>
                    <span className="font-mono font-black text-[#EE3124] shrink-0">
                      {(rule.confidence * 100).toFixed(0)}%
                    </span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden mt-2">
                    <div
                      className="h-full rounded-full bg-amber-500"
                      style={{ width: `${Math.max(8, (rule.confidence / maxRuleConfidence) * 100)}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[10px] text-gray-400 mt-2 font-medium">
                    <span>Support {(rule.support * 100).toFixed(0)}%</span>
                    <span>Lift {rule.lift.toFixed(2)}</span>
                    <span>{rule.pairCount} phiên</span>
                  </div>
                </div>
              ))
            ) : (
              <EmptyChart message="Chưa đủ dữ liệu để tạo luật món đi kèm đáng tin cậy." />
            )}
          </div>
        </div>
      </div>

      {hasForecast && analysis && (
        <div className="space-y-6" id="print-area">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 no-print">
            <div className="bg-gradient-to-br from-[#EE3124] to-[#f25e54] text-white p-5 rounded-xl shadow-sm relative overflow-hidden">
              <div className="absolute right-[-10px] bottom-[-10px] opacity-15">
                <Users size={96} />
              </div>
              <span className="text-[10px] font-black tracking-widest uppercase text-white/80 block">Quy mô ca phục vụ</span>
              <span className="text-2xl font-black font-mono block mt-1">{guestCount.toLocaleString('vi-VN')} khách</span>
              <span className="text-[11px] text-white/90 font-medium block mt-1.5">Áp dụng ngày: {formattedDateString}</span>
            </div>

            <div className="bg-white border border-gray-200 p-5 rounded-xl shadow-sm">
              <span className="text-[10px] font-black tracking-widest uppercase text-gray-400 block">Mẫu phân tích 7 ngày</span>
              <span className="text-2xl font-black font-mono text-gray-900 block mt-1">
                {analysis.basketCount} phiên
              </span>
              <span className="text-[11px] text-gray-500 font-medium block mt-1.5">
                {analysis.orderCount} đơn, khoảng {analysis.totalHistoricalGuests} khách lịch sử
              </span>
            </div>

            <div className="bg-white border border-gray-200 p-5 rounded-xl shadow-sm">
              <span className="text-[10px] font-black tracking-widest uppercase text-gray-400 block">NVL cần chuẩn bị</span>
              <span className="text-2xl font-black font-mono text-[#EE3124] block mt-1">
                {analysis.materials.length} loại
              </span>
              <span className="text-[11px] text-gray-500 font-medium block mt-1.5">Món nổi bật: {topDish}</span>
            </div>
          </div>

          <div className="hidden print:block border-b-2 border-black pb-4 mb-6">
            <h1 className="text-2xl font-black uppercase">Đề xuất chuẩn bị nguyên vật liệu</h1>
            <p className="text-sm text-gray-650 mt-1">
              Ngày phục vụ: <strong>{formattedDateString}</strong> | Số khách dự kiến: <strong>{guestCount}</strong>
            </p>
            <p className="text-xs text-gray-500">
              Cơ sở: phân tích giỏ hàng 7 ngày gần nhất, không đối chiếu tồn kho hiện tại.
            </p>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
            <div className="p-4 bg-gray-50/50 border-b border-gray-200 flex flex-col md:flex-row md:items-center justify-between gap-4 no-print">
              <div className="relative w-full sm:w-80">
                <Search className="absolute left-3 top-2.5 text-gray-400" size={14} />
                <input
                  type="text"
                  placeholder="Tìm nguyên vật liệu hoặc món liên quan..."
                  className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-xs bg-white focus:border-[#EE3124] focus:ring-1 focus:ring-[#EE3124] outline-none transition-all"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                />
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={handleCopyOrder}
                  className={`flex items-center justify-center space-x-1.5 border px-4 py-2 rounded-lg text-xs font-bold transition-all shadow-xs shrink-0 cursor-pointer ${
                    copied
                      ? 'bg-emerald-50 border-emerald-300 text-emerald-700'
                      : 'bg-white border-gray-300 hover:border-gray-400 text-gray-700'
                  }`}
                >
                  {copied ? <Check size={14} /> : <Copy size={14} />}
                  <span>{copied ? 'Đã sao chép' : 'Sao chép danh sách'}</span>
                </button>

                <button
                  onClick={() => window.print()}
                  className="flex items-center justify-center space-x-1.5 bg-gray-800 hover:bg-gray-950 text-white px-4 py-2 rounded-lg text-xs font-bold transition-colors shadow-md shrink-0 cursor-pointer"
                >
                  <Printer size={14} />
                  <span>In danh sách</span>
                </button>
              </div>
            </div>

            <div className="overflow-x-auto flex-1">
              {filteredResults.length > 0 ? (
                <table className="w-full text-left border-collapse min-w-[780px]">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr className="text-[10px] font-extrabold text-gray-500 uppercase tracking-wider">
                      <th className="py-4 px-6 text-center w-12">STT</th>
                      <th className="py-4 px-4 w-1/3">Nguyên vật liệu</th>
                      <th className="py-4 px-4 text-center">Đơn vị</th>
                      <th className="py-4 px-4 text-right">Nhu cầu dự kiến</th>
                      <th className="py-4 px-6">Phát sinh từ món</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-xs text-gray-600">
                    {filteredResults.map((row, index) => (
                      <tr key={row.Ma_nvl} className="hover:bg-gray-50/50 transition duration-150">
                        <td className="py-4 px-6 text-center font-bold font-mono text-gray-400">{index + 1}</td>
                        <td className="py-4 px-4 font-bold text-gray-800 text-sm">{row.Ten_nvl}</td>
                        <td className="py-4 px-4 text-center font-bold text-gray-400">{row.Don_vi_tinh}</td>
                        <td className="py-4 px-4 text-right font-mono font-black text-[#EE3124] text-sm">
                          {row.needed.toLocaleString('vi-VN')} {row.Don_vi_tinh}
                        </td>
                        <td className="py-4 px-6 text-gray-500">
                          {row.sourceDishes.slice(0, 4).join(', ')}
                          {row.sourceDishes.length > 4 ? ` +${row.sourceDishes.length - 4} món` : ''}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="p-10 text-center text-gray-400 italic">
                  <AlertCircle size={36} className="mx-auto text-gray-300 mb-2.5" />
                  <p className="text-sm font-semibold">Không tìm thấy nguyên vật liệu phù hợp với bộ lọc.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function EmptyChart({ message }: { message: string }) {
  return (
    <div className="p-8 text-center text-gray-400 border border-dashed border-gray-200 rounded-lg">
      <AlertCircle size={28} className="mx-auto mb-2 text-gray-300" />
      <p className="text-xs font-semibold">{message}</p>
    </div>
  );
}
