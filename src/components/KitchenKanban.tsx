/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useRestaurantStore } from '../data/store';
import { OrderItemStatus, DishStatus } from '../types';
import { ChefHat, FileText, Check, Play, CheckCircle, ShieldAlert, AlertTriangle, Search, BookOpen, Layers, Info, List, Tag, Filter } from 'lucide-react';
import { OrderItemRow } from './SharedUI';

export default function KitchenKanban() {
  const {
    orderDetails,
    dishes,
    sessions,
    categories,
    recipes,
    materials,
    tables,
    updateOrderItemStatus,
    updateDish,
    logSystemAction,
  } = useRestaurantStore();

  const [activeSubTab, setActiveTab] = useState<'kanban' | 'lookup'>('kanban');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('all');
  const [selectedDishId, setSelectedDishId] = useState<string | null>(null);
  const [kitchenError, setKitchenError] = useState<string | null>(null);

  // Kanban view filters
  const [selectedTableFilter, setSelectedTableFilter] = useState<string>('all');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('all');

  const uniqueTables = Array.from(new Set(tables.map(t => t.Ma_ban))).sort();

  // Filter items based on dropdowns
  const filteredOrderDetails = orderDetails.filter(item => {
    const dish = dishes.find(d => d.Ma_mon === item.Ma_mon);
    const tableCode = item.Ma_hd_dat_mon.split('_')[1] || '';
    
    const matchesTable = selectedTableFilter === 'all' || tableCode === selectedTableFilter;
    const matchesCategory = selectedCategoryFilter === 'all' || dish?.Ma_danh_muc === selectedCategoryFilter;
    
    return matchesTable && matchesCategory;
  });

  // Group Details by Status for Kanban Column Columns (Screen 14)
  const pendingItems = filteredOrderDetails.filter(od => od.Trang_thai_mon === OrderItemStatus.DANG_CHO);
  const cookingItems = filteredOrderDetails.filter(od => od.Trang_thai_mon === OrderItemStatus.DANG_CHE_BIEN);
  const completedItems = filteredOrderDetails.filter(od => od.Trang_thai_mon === OrderItemStatus.DA_HOAN_THANH);
  const servedItems = filteredOrderDetails.filter(od => od.Trang_thai_mon === OrderItemStatus.DA_PHUC_VU);

  const handleUpdateStatus = (detailId: string, nextStatus: OrderItemStatus) => {
    setKitchenError(null);
    updateOrderItemStatus(detailId, nextStatus).then(res => {
      if (!res.success) {
        setKitchenError(res.error || 'Cập nhật trạng thái chế biến lỗi.');
      }
    });
  };

  const handleToggleDishStatus = (dishId: string, current: DishStatus) => {
    // Toggles between Còn phục vụ / Hết món
    const nextStatus = current === DishStatus.CON_PHUC_VU ? DishStatus.HET_MON : DishStatus.CON_PHUC_VU;
    const dish = dishes.find(d => d.Ma_mon === dishId);
    if (dish && updateDish) {
      updateDish({ ...dish, Trang_thai: nextStatus });
    }
  };

  return (
    <div className="space-y-6 text-sm font-sans" id="kitchen-view-root">
      {/* Title Header with tab switchers */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white p-5 rounded-xl border border-gray-100 gap-3 shadow-sm" id="kitchen-header">
        <div>
          <h2 className="text-xl font-display font-bold text-gray-800 tracking-wide flex items-center space-x-2">
            <ChefHat className="text-[#EE3124]" />
            <span>Khu Vực Bếp Chế Biến</span>
          </h2>
          <p className="text-xs text-gray-400 mt-1 uppercase tracking-widest font-mono">Kitchen Order Queue & Stock Locks (UC13, UC15)</p>
        </div>

        {/* Kanban vs Menu Lookup Toggles */}
        <div className="flex border border-gray-250 rounded-lg p-0.5 text-xs bg-gray-50">
          <button
            onClick={() => { setKitchenError(null); setActiveTab('kanban'); }}
            className={`px-3 py-1.5 rounded-md font-bold transition flex items-center space-x-1 cursor-pointer ${
              activeSubTab === 'kanban' ? 'bg-[#EE3124] text-white shadow-sm' : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            <Layers size={13} />
            <span>KANBAN CHẾ BIẾN</span>
          </button>
          <button
            onClick={() => { setKitchenError(null); setActiveTab('lookup'); }}
            className={`px-3 py-1.5 rounded-md font-bold transition flex items-center space-x-1 cursor-pointer ${
              activeSubTab === 'lookup' ? 'bg-[#EE3124] text-white shadow-sm' : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            <BookOpen size={13} />
            <span>TRA CỨU THỰC ĐƠN & ĐỊNH LƯỢNG</span>
          </button>
        </div>
      </div>

      {kitchenError && (
        <div className="p-4 bg-red-50 border-l-4 border-red-600 text-red-800 text-xs flex justify-between items-center rounded-xl" id="kitchen-error-msg">
          <div className="flex items-start space-x-2">
            <ShieldAlert size={18} className="shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Cập nhật chế biến bị từ chối!</p>
              <p className="font-light mt-0.5">{kitchenError}</p>
            </div>
          </div>
          <button
            onClick={() => {
              logSystemAction('YÊU CẦU CẢNH BÁO KHẨN CẤP', `Thiếu tồn kho nguyên liệu nấu ăn: ${kitchenError}`);
              alert('Đã gửi thông báo cảnh báo đến bộ phận Kho và Quản lý!');
            }}
            className="px-4 py-2 bg-[#EE3124] hover:bg-[#C0271E] text-white font-extrabold text-[10px] rounded-xl tracking-wider cursor-pointer uppercase shrink-0 transition ml-4 shadow-xs"
          >
            Gửi cảnh báo
          </button>
        </div>
      )}

      {/* KANBAN BOARD SCREEN STATE */}
      {activeSubTab === 'kanban' && (
        <div className="space-y-4">
          {/* Filters Bar */}
          <div className="flex flex-col sm:flex-row gap-4 p-4 bg-white rounded-xl border border-gray-150 shadow-xs" id="kitchen-kanban-filters">
            <div className="flex items-center space-x-2 text-xs font-bold text-gray-500 uppercase tracking-wide">
              <Filter size={14} className="text-[#EE3124]" />
              <span>Bộ lọc đơn bếp:</span>
            </div>
            
            <div className="flex flex-1 flex-col sm:flex-row gap-3">
              {/* Table Filter */}
              <div className="flex-1 flex items-center space-x-2">
                <span className="text-[11px] font-semibold text-gray-400 shrink-0">Bàn ăn:</span>
                <select
                  value={selectedTableFilter}
                  onChange={(e) => setSelectedTableFilter(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-gray-200 text-xs font-semibold focus:outline-none focus:border-[#EE3124] focus:ring-1 focus:ring-[#EE3124] bg-white cursor-pointer"
                >
                  <option value="all">Tất cả bàn ăn</option>
                  {uniqueTables.map(tCode => (
                    <option key={tCode} value={tCode}>Bàn {tCode}</option>
                  ))}
                </select>
              </div>

              {/* Category Filter */}
              <div className="flex-1 flex items-center space-x-2">
                <span className="text-[11px] font-semibold text-gray-400 shrink-0">Danh mục:</span>
                <select
                  value={selectedCategoryFilter}
                  onChange={(e) => setSelectedCategoryFilter(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-gray-200 text-xs font-semibold focus:outline-none focus:border-[#EE3124] focus:ring-1 focus:ring-[#EE3124] bg-white cursor-pointer"
                >
                  <option value="all">Tất cả danh mục</option>
                  {categories.map(cat => (
                    <option key={cat.Ma_danh_muc} value={cat.Ma_danh_muc}>{cat.Ten_danh_muc}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Columns grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5" id="kitchen-kanban-board">
            
            {/* Column 1: Chờ chế biến */}
            <div className="bg-gray-50/50 p-4 rounded-2xl border border-gray-200 flex flex-col h-[525px]" id="col-pending">
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-display font-extrabold text-orange-700 uppercase tracking-widest text-[11px] flex items-center space-x-1.5">
                  <span className="w-2 h-2 rounded-full bg-orange-500"></span>
                  <span>Chờ chế biến</span>
                </h3>
                <span className="px-2 py-0.5 rounded-md bg-orange-100 text-orange-800 font-mono font-bold text-[10px]">{pendingItems.length}</span>
              </div>

              {/* Content items pending */}
              <div className="flex-1 overflow-y-auto space-y-3 pr-1" id="pending-items-overflow">
                {pendingItems.map((item) => {
                  const dish = dishes.find(d => d.Ma_mon === item.Ma_mon);
                  return (
                    <OrderItemRow
                      key={item.Ma_detail_id}
                      item={item}
                      dishName={dish?.Ten_mon || 'Không rõ món'}
                      onStatusChange={(nextStatus) => handleUpdateStatus(item.Ma_detail_id, nextStatus)}
                    />
                  );
                })}

                {pendingItems.length === 0 && (
                  <div className="h-full flex items-center justify-center text-center text-gray-400 text-xs italic py-16">
                    Đang trống hàng nấu.
                  </div>
                )}
              </div>
            </div>

            {/* Column 2: Đang nấu */}
            <div className="bg-gray-50/50 p-4 rounded-2xl border border-gray-200 flex flex-col h-[525px]" id="col-cooking">
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-display font-extrabold text-blue-700 uppercase tracking-widest text-[11px] flex items-center space-x-1.5">
                  <span className="w-2 h-2 rounded-full bg-blue-500 animate-ping"></span>
                  <span>Đang nấu</span>
                </h3>
                <span className="px-2 py-0.5 rounded-md bg-blue-100 text-blue-800 font-mono font-bold text-[10px]">{cookingItems.length}</span>
              </div>

              <div className="flex-1 overflow-y-auto space-y-3 pr-1" id="cooking-items-overflow">
                {cookingItems.map((item) => {
                  const dish = dishes.find(d => d.Ma_mon === item.Ma_mon);
                  return (
                    <OrderItemRow
                      key={item.Ma_detail_id}
                      item={item}
                      dishName={dish?.Ten_mon || 'Không rõ món'}
                      onStatusChange={(nextStatus) => handleUpdateStatus(item.Ma_detail_id, nextStatus)}
                    />
                  );
                })}

                {cookingItems.length === 0 && (
                  <div className="h-full flex items-center justify-center text-center text-gray-400 text-xs italic py-16">
                    Không có món nào đang nấu.
                  </div>
                )}
              </div>
            </div>

            {/* Column 3: Chờ bưng lên */}
            <div className="bg-gray-50/50 p-4 rounded-2xl border border-gray-200 flex flex-col h-[525px]" id="col-completed">
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-display font-extrabold text-cyan-700 uppercase tracking-widest text-[11px] flex items-center space-x-1.5">
                  <span className="w-2 h-2 rounded-full bg-cyan-500"></span>
                  <span>Chờ bưng lên</span>
                </h3>
                <span className="px-2 py-0.5 rounded-md bg-cyan-100 text-cyan-800 font-mono font-bold text-[10px]">{completedItems.length}</span>
              </div>

              <div className="flex-1 overflow-y-auto space-y-3 pr-1" id="completed-items-overflow">
                {completedItems.map((item) => {
                  const dish = dishes.find(d => d.Ma_mon === item.Ma_mon);
                  return (
                    <OrderItemRow
                      key={item.Ma_detail_id}
                      item={item}
                      dishName={dish?.Ten_mon || 'Không rõ món'}
                      showActions={false}
                    />
                  );
                })}

                {completedItems.length === 0 && (
                  <div className="h-full flex items-center justify-center text-center text-gray-400 text-xs italic py-16">
                    Chờ món từ bếp.
                  </div>
                )}
              </div>
            </div>

            {/* Column 4: Đã phục vụ */}
            <div className="bg-gray-50/50 p-4 rounded-2xl border border-gray-200 flex flex-col h-[525px]" id="col-served">
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-display font-extrabold text-green-700 uppercase tracking-widest text-[11px] flex items-center space-x-1.5">
                  <span className="w-2 h-2 rounded-full bg-green-500"></span>
                  <span>Đã phục vụ</span>
                </h3>
                <span className="px-2 py-0.5 rounded-md bg-green-100 text-green-800 font-mono font-bold text-[10px]">{servedItems.length}</span>
              </div>

              <div className="flex-1 overflow-y-auto space-y-3 pr-1" id="served-items-overflow">
                {servedItems.map((item) => {
                  const dish = dishes.find(d => d.Ma_mon === item.Ma_mon);
                  return (
                    <OrderItemRow
                      key={item.Ma_detail_id}
                      item={item}
                      dishName={dish?.Ten_mon || 'Không rõ món'}
                      showActions={false}
                    />
                  );
                })}

                {servedItems.length === 0 && (
                  <div className="h-full flex items-center justify-center text-center text-gray-400 text-xs italic py-16">
                    Chưa phục vụ món nào.
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* LOOKUP MENU & RECIPE SCREEN STATE */}
      {activeSubTab === 'lookup' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="kitchen-menu-lookup">
          
          {/* LEFT COLUMN: Dish list and Search (width 5/12) */}
          <div className="lg:col-span-5 bg-white p-5 rounded-2xl border border-gray-150 shadow-sm flex flex-col space-y-4" id="lookup-left-pane">
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wide flex items-center space-x-1.5">
                <List size={16} className="text-[#EE3124]" />
                <span>Danh Sách Thực Đơn</span>
              </h3>
              <p className="text-[11px] text-gray-400">Tìm kiếm món ăn và lọc theo danh mục chuẩn của nhà hàng</p>
            </div>

            {/* Live Search Input */}
            <div className="relative">
              <Search size={14} className="absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm tên món ăn, hương vị, mô tả..."
                className="w-full pl-9 pr-4 py-2 rounded-xl border border-gray-250 font-medium text-xs text-gray-750 focus:outline-none focus:border-[#EE3124] focus:ring-1 focus:ring-[#EE3124] transition-all bg-gray-50/50"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-3 text-gray-405 hover:text-gray-700 text-xs font-bold"
                >
                  Xoá
                </button>
              )}
            </div>

            {/* Category Filter Pills */}
            <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto pb-1 border-b border-gray-100" id="lookup-categories">
              <button
                type="button"
                onClick={() => setSelectedCategoryId('all')}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider transition ${
                  selectedCategoryId === 'all'
                    ? 'bg-red-50 text-[#EE3124] border border-[#EE3124]/40'
                    : 'bg-gray-50 text-gray-500 border border-transparent hover:bg-gray-100 hover:text-gray-700'
                }`}
              >
                Tất cả
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.Ma_danh_muc}
                  type="button"
                  onClick={() => setSelectedCategoryId(cat.Ma_danh_muc)}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider transition ${
                    selectedCategoryId === cat.Ma_danh_muc
                      ? 'bg-red-50 text-[#EE3124] border border-[#EE3124]/40'
                      : 'bg-gray-50 text-gray-500 border border-transparent hover:bg-gray-100 hover:text-gray-700'
                  }`}
                >
                  {cat.Ten_danh_muc}
                </button>
              ))}
            </div>

            {/* Dishes Result Scroll area */}
            <div className="space-y-2 overflow-y-auto max-h-[380px] pr-1" id="lookup-dishes-result">
              {dishes
                .filter((dish) => {
                  const matchesSearch =
                    dish.Ten_mon.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    (dish.Mo_ta || '').toLowerCase().includes(searchQuery.toLowerCase());
                  const matchesCategory =
                    selectedCategoryId === 'all' || dish.Ma_danh_muc === selectedCategoryId;
                  return matchesSearch && matchesCategory;
                })
                .map((dish) => {
                  const isSelected = selectedDishId === dish.Ma_mon;
                  const dishCat = categories.find((c) => c.Ma_danh_muc === dish.Ma_danh_muc)?.Ten_danh_muc || 'Khác';
                  const recipeCount = recipes.filter((r) => r.Ma_mon === dish.Ma_mon).length;

                  return (
                    <div
                      key={dish.Ma_mon}
                      onClick={() => setSelectedDishId(dish.Ma_mon)}
                      className={`p-3 rounded-xl border transition-all duration-150 cursor-pointer flex items-center justify-between ${
                        isSelected
                          ? 'border-[#EE3124] bg-red-50/40 shadow-sm'
                          : 'border-gray-150 hover:bg-gray-50/60'
                      }`}
                    >
                      <div className="flex items-center space-x-3 truncate">
                        <div className="w-11 h-11 rounded-lg overflow-hidden shrink-0 border border-gray-150 bg-gray-50">
                          <img
                            src={dish.Anh_mon}
                            alt={dish.Ten_mon}
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                        </div>
                        <div className="truncate">
                          <h4 className={`text-xs font-bold leading-tight truncate ${isSelected ? 'text-[#EE3124]' : 'text-gray-800'}`}>
                            {dish.Ten_mon}
                          </h4>
                          <div className="flex items-center space-x-1.5 mt-1">
                            <span className="text-[9px] font-semibold text-gray-400 capitalize">{dishCat}</span>
                            <span className="text-gray-300 text-[9px]">•</span>
                            <span className="text-[9px] font-mono font-bold text-gray-500 bg-gray-100 px-1 py-0.5 rounded">
                              {recipeCount} nguyên liệu
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="shrink-0 text-right pl-2">
                        <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider block text-center ${
                          dish.Trang_thai === DishStatus.CON_PHUC_VU
                            ? 'bg-green-50 text-green-700 border border-green-100'
                            : dish.Trang_thai === DishStatus.HET_MON
                            ? 'bg-amber-50 text-amber-700 border border-amber-100'
                            : 'bg-gray-50 text-gray-500 border border-gray-100'
                        }`}>
                          {dish.Trang_thai}
                        </span>
                      </div>
                    </div>
                  );
                })}

              {dishes.filter((dish) => {
                const matchesSearch =
                  dish.Ten_mon.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  (dish.Mo_ta || '').toLowerCase().includes(searchQuery.toLowerCase());
                const matchesCategory =
                  selectedCategoryId === 'all' || dish.Ma_danh_muc === selectedCategoryId;
                return matchesSearch && matchesCategory;
              }).length === 0 && (
                <div className="py-12 text-center text-gray-400 italic text-xs">
                  Không tìm thấy món ăn nào phù hợp với điều kiện lọc.
                </div>
              )}
            </div>
          </div>

          {/* RIGHT COLUMN: Recipe detail representation (width 7/12) */}
          <div className="lg:col-span-7 bg-white p-5 rounded-2xl border border-gray-150 shadow-sm flex flex-col" id="lookup-right-pane">
            {selectedDishId ? (
              (() => {
                const selectedDish = dishes.find((d) => d.Ma_mon === selectedDishId);
                if (!selectedDish) return null;

                const dishCat = categories.find((c) => c.Ma_danh_muc === selectedDish.Ma_danh_muc)?.Ten_danh_muc || 'Khác';
                const dishRecipes = recipes.filter((r) => r.Ma_mon === selectedDishId);

                return (
                  <div className="space-y-5 animate-in fade-in duration-200" id="lookup-recipe-detail">
                    {/* Header Info */}
                    <div className="flex items-start space-x-4 pb-4 border-b border-gray-100">
                      <div className="w-20 h-20 rounded-xl overflow-hidden border border-gray-150 shrink-0 bg-gray-50 shadow-sm">
                        <img
                          src={selectedDish.Anh_mon}
                          alt={selectedDish.Ten_mon}
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                      <div className="space-y-1 py-0.5">
                        <div className="flex items-center space-x-1.5 flex-wrap gap-y-1">
                          <span className="px-2 py-0.5 bg-gray-50 border border-gray-200 text-gray-500 rounded-md text-[9px] font-bold uppercase tracking-wider">
                            {dishCat}
                          </span>
                          <span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider ${
                            selectedDish.Trang_thai === DishStatus.CON_PHUC_VU
                              ? 'bg-green-50 text-green-700 border border-green-100'
                              : 'bg-amber-50 text-amber-700 border border-amber-100'
                          }`}>
                            {selectedDish.Trang_thai}
                          </span>
                        </div>
                        <h3 className="text-base font-bold text-gray-850 leading-snug">
                          {selectedDish.Ten_mon}
                        </h3>
                        <p className="text-[11px] text-gray-400 italic font-light line-clamp-2">
                          {selectedDish.Mo_ta || 'Không tìm thấy mô tả chi tiết cho món ăn này.'}
                        </p>
                      </div>
                    </div>

                    {/* Formula ingredients detail */}
                    <div className="space-y-3">
                      <div className="flex justify-between items-center bg-gray-50 p-2.5 rounded-xl border border-gray-150">
                        <span className="text-[11px] font-extrabold uppercase text-gray-700 tracking-wider flex items-center space-x-1">
                          <Tag size={12} className="text-[#EE3124]" />
                          <span>BẢNG ĐỊNH LƯỢNG NGUYÊN VẬT LIỆU CHUẨN</span>
                        </span>
                        <span className="font-mono text-[10px] font-bold text-gray-400">
                          {dishRecipes.length} loại
                        </span>
                      </div>

                      <div className="rounded-xl border border-gray-150 overflow-hidden bg-white">
                        <table className="w-full text-left text-xs">
                          <thead>
                            <tr className="bg-gray-50 text-[10px] font-bold text-gray-400 uppercase tracking-widest border-b border-gray-200">
                              <th className="py-2.5 px-3">Nguyên Vật Liệu</th>
                              <th className="py-2.5 px-3 text-center">Định Lượng Chuẩn</th>
                              <th className="py-2.5 px-3 text-center">Đơn Vị</th>
                              <th className="py-2.5 px-3 text-right">Tồn Kho Hiện Tại</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100 font-medium">
                            {dishRecipes.map((rp, i) => {
                              const rawM = materials.find((m) => m.Ma_nvl === rp.Ma_nvl);
                              const isLow = rawM ? rawM.Ton_kho_hien_tai <= rawM.Ton_kho_toi_thieu : false;

                              return (
                                <tr key={i} className="hover:bg-gray-50/50">
                                  <td className="py-3 px-3 font-semibold text-gray-800">
                                    {rawM?.Ten_nvl || 'N/A'}
                                  </td>
                                  <td className="py-3 px-3 text-center font-mono font-bold text-brand-red">
                                    {rp.So_luong_dinh_luong.toLocaleString()}
                                  </td>
                                  <td className="py-3 px-3 text-center text-gray-500">
                                    {rp.Don_vi_tinh}
                                  </td>
                                  <td className="py-3 px-3 text-right font-mono">
                                    {rawM ? (
                                      <div className="flex items-center justify-end space-x-1">
                                        <span className={`font-bold ${isLow ? 'text-red-600' : 'text-gray-700'}`}>
                                          {rawM.Ton_kho_hien_tai.toLocaleString()}
                                        </span>
                                        <span className="text-[10px] text-gray-400">/ {rawM.Don_vi_tinh}</span>
                                        {isLow && (
                                          <span className="text-[8px] bg-red-100 text-red-800 font-bold uppercase py-0.5 px-1 rounded ml-1 animate-pulse" title="Dưới ngưỡng tối thiểu!">
                                            Cạn
                                          </span>
                                        )}
                                      </div>
                                    ) : (
                                      <span className="text-gray-400 italic">N/A</span>
                                    )}
                                  </td>
                                </tr>
                              );
                            })}

                            {dishRecipes.length === 0 && (
                              <tr>
                                <td colSpan={4} className="py-16 text-center text-gray-400 italic">
                                  <div className="flex flex-col items-center justify-center space-y-2 max-w-xs mx-auto">
                                    <AlertTriangle size={18} className="text-amber-500" />
                                    <p className="text-xs">
                                      Món ăn này chưa được khai báo bất cứ thông tin định lượng hay nguyên vật liệu cấu thành nào khác.
                                    </p>
                                  </div>
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Quick guidelines banner */}
                    <div className="p-3.5 rounded-xl border border-blue-100 bg-blue-50/60 text-[11px] leading-relaxed text-blue-950">
                      <div className="flex items-start space-x-2">
                        <Info size={14} className="shrink-0 mt-0.5 text-blue-600" />
                        <div>
                          <p className="font-extrabold uppercase text-[10px] tracking-wide mb-0.5 text-blue-800">
                            💡 Khấu hao tự động
                          </p>
                          <p className="font-light">
                            Khi bạn nhấn nút <strong>"DUYỆT NẤU / TRỪ KHO"</strong> bên màn hình Kanban, hệ thống sẽ thực hiện bóc tách tự động định mức này để khấu trừ số lượng vật tư thực tế tương ứng trong kho hàng.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })()
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center py-20 text-gray-400 space-y-3" id="lookup-empty-state">
                <BookOpen size={30} className="text-gray-300 animate-pulse" />
                <div className="max-w-xs space-y-1">
                  <p className="font-bold text-gray-700 text-xs">CHƯA CHỌN MÓN ĂN</p>
                  <p className="text-[11px] leading-relaxed text-gray-400">
                    Vui lòng chọn bất kỳ món ăn nào ở danh sách bên trái để tra cứu công thức định lượng nguyên vật liệu tương ứng.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
