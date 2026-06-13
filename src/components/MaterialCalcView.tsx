/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useRestaurantStore } from '../data/store';
import { RawMaterial } from '../types';
import { Calendar, Users, Calculator, ShieldAlert, CheckCircle, AlertTriangle } from 'lucide-react';

export default function MaterialCalcView() {
  const { materials, recipes, dishes } = useRestaurantStore();
  const [guestCount, setGuestCount] = useState<number>(100);
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [calculated, setCalculated] = useState(false);
  const [calculatedResults, setCalculatedResults] = useState<any[]>([]);

  const handleCalculate = (e: React.FormEvent) => {
    e.preventDefault();
    if (guestCount <= 0) {
      alert('Số khách dự kiến phải là số lớn hơn 0.');
      return;
    }

    // Historical probability/demand weights per guest:
    const weights: Record<string, number> = {
      m01: 0.30, // 30% order Lẩu Thập Cẩm
      m02: 0.25, // 25% order Lẩu Gà Đen
      m03: 0.20, // 20% order Lẩu Hải Sản
      m04: 0.60, // 60% order Ba chỉ bò Mỹ (some tables order double)
      m05: 0.50, // 50% order Nấm Kim Châm topping
      m06: 0.40, // 40% order Nấm bào ngư topping
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

  return (
    <div className="space-y-6 text-sm" id="calc-view-root">
      {/* Title Header */}
      <div className="flex justify-between items-center bg-white p-5 rounded-xl border border-gray-100 shadow-sm" id="calc-header">
        <div>
          <h2 className="text-xl font-display font-bold text-gray-800 tracking-wide">Tra Cứu Nhu Cầu Vật Tư</h2>
          <p className="text-xs text-gray-400 mt-1 uppercase tracking-widest font-mono">Predictive Ingredient Calculator (UC19)</p>
        </div>
      </div>

      {/* Inputs Form */}
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm" id="calc-inputs-box">
        <form onSubmit={handleCalculate} className="grid grid-cols-1 sm:grid-cols-3 gap-5 items-end">
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 flex items-center space-x-1">
              <Calendar size={13} className="text-brand-red" />
              <span>Ngày ăn dự kiến *</span>
            </label>
            <input
              type="date"
              required
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 font-medium"
              value={date}
              onChange={e => setDate(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 flex items-center space-x-1">
              <Users size={13} className="text-brand-red" />
              <span>Số lượng khách phục vụ *</span>
            </label>
            <input
              type="number"
              required
              min="1"
              max="1000"
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 font-mono font-bold"
              placeholder="Nhập số lượng khách"
              value={guestCount}
              onChange={e => setGuestCount(Number(e.target.value))}
            />
          </div>

          <button
            id="btn-calculate"
            type="submit"
            className="w-full py-3 bg-brand-red hover:bg-brand-red-dark text-white rounded-xl font-semibold text-xs shadow-md transition flex items-center justify-center space-x-2 cursor-pointer"
          >
            <Calculator size={14} />
            <span>TÍNH TOÁN NHU CẦU</span>
          </button>
        </form>
      </div>

      {/* Results block */}
      {calculated && (
        <div className="space-y-4" id="calc-results-section">
          <div className="bg-amber-50 p-4 border border-amber-150 rounded-xl text-amber-900 font-light text-xs" id="calc-forecast-logic-notif">
            <span className="font-semibold block mb-0.5 text-amber-950">💡 Cơ sở tính toán nhu cầu nguyên liệu:</span>
            Dự báo dựa trên tỷ lệ gọi lẩu (30% Thập Cẩm, 25% Gà Đen, 20% Hải Sản), ước lượng Topping kèm (60% Ba Chỉ Bò, 50% Nấm Kim Châm) cho <strong>{guestCount} khách dự kiến</strong>, rồi đối chiếu tổng lượng tiêu thụ nguyên liệu theo bảng định lượng recipe thực tế của nhà hàng.
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden" id="calc-results-table-wrapper">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse" id="calc-results-table">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-150 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                    <th className="py-4 px-6 text-center w-12">STT</th>
                    <th className="py-4 px-4">Nguyên vật liệu</th>
                    <th className="py-4 px-4 text-center">Đơn vị</th>
                    <th className="py-4 px-4 text-right">Nhu cầu dự kiến</th>
                    <th className="py-4 px-4 text-right">Tồn kho hiện tại</th>
                    <th className="py-4 px-4 text-right">Thừa / Thiếu</th>
                    <th className="py-4 px-6 text-center w-36">Trạng Thái</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-xs text-gray-600">
                  {calculatedResults.map((row, index) => (
                    <tr key={row.Ma_nvl} className="hover:bg-gray-50/30 transition">
                      <td className="py-4 px-6 text-center font-semibold font-mono text-gray-400">{index + 1}</td>
                      <td className="py-4 px-4 font-bold text-gray-800">{row.Ten_nvl}</td>
                      <td className="py-4 px-4 text-center font-mono font-bold text-gray-400">{row.Don_vi_tinh}</td>
                      <td className="py-4 px-4 text-right font-mono font-bold text-blue-600">
                        {row.needed.toLocaleString()}&nbsp;{row.Don_vi_tinh}
                      </td>
                      <td className="py-4 px-4 text-right font-mono font-bold text-gray-650">
                        {row.Ton_kho_hien_tai.toLocaleString()}&nbsp;{row.Don_vi_tinh}
                      </td>
                      <td className={`py-4 px-4 text-right font-mono font-extrabold ${row.isDeficient ? 'text-red-600' : 'text-green-600'}`}>
                        {row.diff > 0 ? '+' : ''}{row.diff.toLocaleString()}&nbsp;{row.Don_vi_tinh}
                      </td>
                      <td className="py-4 px-6 text-center">
                        <span className={`inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[10px] font-semibold ${
                          row.statusLabel === 'Thiếu' ? 'bg-red-50 text-red-700 font-extrabold' :
                          row.statusLabel === 'Sắp thiếu' ? 'bg-yellow-50 text-yellow-700' :
                          'bg-green-50 text-green-700'
                        }`}>
                          {row.statusLabel === 'Thiếu' ? <AlertTriangle size={11} className="text-red-500 animate-pulse" /> : 
                           row.statusLabel === 'Sắp thiếu' ? <AlertTriangle size={11} className="text-yellow-500" /> :
                           <CheckCircle size={11} className="text-green-500" />}
                          <span>{row.statusLabel === 'Thiếu' ? 'Thiếu hàng' : row.statusLabel === 'Sắp thiếu' ? 'Sắp thiếu hụt' : 'Sẵn sàng'}</span>
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
