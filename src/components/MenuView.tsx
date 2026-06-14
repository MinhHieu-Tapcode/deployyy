/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useRestaurantStore } from '../data/store';
import { DishStatus, Dish } from '../types';
import { Search, Plus, Edit2, ShieldAlert, BookOpen, Trash2, X } from 'lucide-react';

export default function MenuView({ onSelectRecipe }: { onSelectRecipe: (dishId: string) => void }) {
  const { dishes, categories, addDish, updateDish, deleteDish } = useRestaurantStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [catFilter, setCatFilter] = useState('All');

  // Modal configuration
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDish, setEditingDish] = useState<Dish | null>(null);

  // Form Fields
  const [name, setName] = useState('');
  const [catId, setCatId] = useState('');
  const [price, setPrice] = useState<number>(0);
  const [desc, setDesc] = useState('');
  const [image, setImage] = useState('');
  const [status, setStatus] = useState<DishStatus>(DishStatus.CON_PHUC_VU);

  const openAddModal = () => {
    setEditingDish(null);
    setName('');
    setCatId(categories[0]?.Ma_danh_muc || '');
    setPrice(10000);
    setDesc('');
    setImage('https://images.unsplash.com/photo-1547928500-4722f55cc829?w=600&auto=format&fit=crop&q=60');
    setStatus(DishStatus.CON_PHUC_VU);
    setIsModalOpen(true);
  };

  const openEditModal = (dish: Dish) => {
    setEditingDish(dish);
    setName(dish.Ten_mon);
    setCatId(dish.Ma_danh_muc);
    setPrice(dish.Don_gia);
    setDesc(dish.Mo_ta);
    setImage(dish.Anh_mon);
    setStatus(dish.Trang_thai);
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !price || !catId) {
      alert('Vui lòng nhập đầy đủ tên món, giá cả và danh mục.');
      return;
    }

    if (price < 0) {
      alert('Giá món ăn không được phép âm (BR09).');
      return;
    }

    const saved = editingDish
      ? updateDish({
          ...editingDish,
          Ten_mon: name,
          Ma_danh_muc: catId,
          Don_gia: Number(price),
          Mo_ta: desc,
          Anh_mon: image,
          Trang_thai: status,
        })
      : addDish({
          Ten_mon: name,
          Ma_danh_muc: catId,
          Don_gia: Number(price),
          Mo_ta: desc,
          Anh_mon: image,
          Trang_thai: status,
        });

    if (saved) {
      setIsModalOpen(false);
    }
  };

  const filteredDishes = dishes.filter(dish => {
    const matchesSearch =
      dish.Ten_mon.toLowerCase().includes(searchTerm.toLowerCase()) ||
      dish.Mo_ta.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCat = catFilter === 'All' || dish.Ma_danh_muc === catFilter;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="space-y-6" id="menu-view-root">
      {/* Title Header */}
      <div className="flex justify-between items-center bg-white p-5 rounded-xl border border-gray-100 shadow-sm" id="menu-header">
        <div>
          <h2 className="text-xl font-display font-bold text-gray-800 tracking-wide">Danh Mục Thực Đơn</h2>
          <p className="text-xs text-gray-400 mt-1 uppercase tracking-widest font-mono">Restaurant Menu & Dishes (UC16, UC18)</p>
        </div>
        <button
          id="btn-add-dish"
          onClick={openAddModal}
          className="bg-brand-red hover:bg-brand-red-dark text-white px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center space-x-2 shadow-md cursor-pointer"
        >
          <Plus size={16} />
          <span>THÊM MÓN</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex flex-col sm:flex-row gap-3 items-center justify-between" id="menu-filter-bar">
        <div className="relative w-full sm:w-80">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-400 pointer-events-none">
            <Search size={16} />
          </span>
          <input
            id="search-dish-input"
            type="text"
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm bg-gray-50/50"
            placeholder="Tìm kiếm kiếm tên món ăn..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto justify-end">
          <span className="text-xs text-gray-400 font-medium whitespace-nowrap">Danh mục:</span>
          <select
            id="filter-category"
            className="px-3.5 py-2 rounded-xl border border-gray-200 bg-white text-xs font-medium text-gray-700 min-w-40"
            value={catFilter}
            onChange={e => setCatFilter(e.target.value)}
          >
            <option value="All">Tất cả danh mục</option>
            {categories.map(c => (
              <option key={c.Ma_danh_muc} value={c.Ma_danh_muc}>{c.Ten_danh_muc}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Dishes Layout Table exactly like Screen 04 */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden" id="menu-list-wrapper">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse" id="menu-dishes-table">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-150 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                <th className="py-4 px-6 text-center w-12">STT</th>
                <th className="py-4 px-4 w-28">Hình ảnh</th>
                <th className="py-4 px-4">Tên món ăn</th>
                <th className="py-4 px-4">Danh mục</th>
                <th className="py-4 px-4 text-right">Giá bán</th>
                <th className="py-4 px-4 text-center">Trạng Thái</th>
                <th className="py-4 px-6 text-center w-36">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-xs text-gray-600">
              {filteredDishes.map((dish, index) => {
                const categoryName = categories.find(c => c.Ma_danh_muc === dish.Ma_danh_muc)?.Ten_danh_muc || 'Khác';
                return (
                  <tr key={dish.Ma_mon} className="hover:bg-gray-50/50 transition">
                    <td className="py-4 px-6 text-center font-semibold font-mono text-gray-400">{index + 1}</td>
                    <td className="py-4 px-4">
                      <div className="w-14 h-14 rounded-xl border border-gray-100 shadow-inner overflow-hidden bg-gray-100">
                        <img
                          src={dish.Anh_mon}
                          alt={dish.Ten_mon}
                          className="w-full h-full object-cover group-hover:scale-110 transition"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div>
                        <div className="flex items-center space-x-2">
                          <p className="font-bold text-gray-800 text-sm">{dish.Ten_mon}</p>
                        </div>
                        <p className="text-[10px] text-gray-400 italic font-light truncate max-w-sm mt-0.5">{dish.Mo_ta || 'Chưa cập nhật mô tả.'}</p>
                      </div>
                    </td>
                    <td className="py-4 px-4 font-semibold text-gray-500">
                      <span>{categoryName}</span>
                    </td>
                    <td className="py-4 px-4 text-right font-mono font-bold text-gray-800 text-sm">
                      {dish.Don_gia.toLocaleString()}đ
                    </td>
                    <td className="py-4 px-4 text-center">
                      <span className={`inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[10px] font-semibold ${
                        dish.Trang_thai === DishStatus.CON_PHUC_VU ? 'bg-green-50 text-green-700' :
                        dish.Trang_thai === DishStatus.HET_MON ? 'bg-yellow-50 text-yellow-700 border border-yellow-100' :
                        'bg-red-50 text-red-700'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          dish.Trang_thai === DishStatus.CON_PHUC_VU ? 'bg-green-500' :
                          dish.Trang_thai === DishStatus.HET_MON ? 'bg-yellow-500' : 'bg-red-500'
                        }`}></span>
                        <span>{dish.Trang_thai}</span>
                      </span>
                    </td>
                    <td className="py-4 px-6 text-center">
                      <div className="flex items-center justify-center space-x-2">
                        {/* Define recipe books icon */}
                        <button
                          onClick={() => onSelectRecipe(dish.Ma_mon)}
                          className="p-1.5 rounded bg-amber-50 hover:bg-amber-200 text-amber-800 transition flex items-center space-x-1 border border-amber-200 text-[10px] font-bold"
                          title="Định lượng nguyên liệu"
                        >
                          <BookOpen size={11} />
                          <span>Định lượng</span>
                        </button>
                        
                        <button
                          onClick={() => openEditModal(dish)}
                          className="p-1 px-1.5 rounded bg-gray-50 hover:bg-gray-200 text-gray-600 transition"
                          title="Sửa thông tin món"
                        >
                          <Edit2 size={12} />
                        </button>

                        <button
                          onClick={() => deleteDish(dish.Ma_mon)}
                          disabled={dish.Trang_thai === DishStatus.NGUNG_PHUC_VU}
                          className={`p-1 px-1.5 rounded transition ${
                            dish.Trang_thai === DishStatus.NGUNG_PHUC_VU
                              ? 'text-gray-300 bg-gray-50 cursor-not-allowed'
                              : 'text-red-700 hover:bg-red-50 hover:text-red-900 border border-red-100'
                          }`}
                          title="Ngừng phục vụ (BR09)"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {filteredDishes.length === 0 && (
          <div className="p-12 text-center text-gray-400">
            <ShieldAlert size={36} className="mx-auto mb-2 text-gray-300" />
            Không tìm thấy món ăn nào khớp với điều kiện tìm kiếm.
          </div>
        )}
      </div>

      {/* Simple Pop-up modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 text-sm font-sans" id="dish-modal">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl relative overflow-hidden flex flex-col">
            <div className="absolute top-0 inset-x-0 h-1 bg-brand-red"></div>
            
            {/* Header */}
            <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h3 className="font-display font-bold text-base text-gray-800">
                {editingDish ? 'Cập Nhật Món Ăn' : 'Thêm Món Ăn Mới'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X size={18} />
              </button>
            </div>

            {/* Form layout */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Tên món ăn *</label>
                <input
                  type="text"
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200"
                  placeholder="Ví dụ: Lẩu Nấm Thập Cẩm"
                  value={name}
                  onChange={e => setName(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Đơn giá (VNĐ) *</label>
                  <input
                    type="number"
                    required
                    min="0"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-right font-mono font-bold"
                    value={price}
                    onChange={e => setPrice(Number(e.target.value))}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Danh mục *</label>
                  <select
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-200 bg-white"
                    value={catId}
                    onChange={e => setCatId(e.target.value)}
                  >
                    {categories.map(c => (
                      <option key={c.Ma_danh_muc} value={c.Ma_danh_muc}>{c.Ten_danh_muc}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Giao diện tải ảnh món ăn thật (Nghiệp vụ bổ sung upload ảnh trực quan) */}
              <div className="space-y-1.5 animate-in fade-in">
                <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider">
                  Tải Ảnh Món Ăn Thực Tế *
                </label>
                
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    e.currentTarget.classList.add('border-brand-red', 'bg-red-50/10');
                  }}
                  onDragLeave={(e) => {
                    e.preventDefault();
                    e.currentTarget.classList.remove('border-brand-red', 'bg-red-50/10');
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    e.currentTarget.classList.remove('border-brand-red', 'bg-red-50/10');
                    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                      const file = e.dataTransfer.files[0];
                      const reader = new FileReader();
                      reader.onloadend = () => {
                        setImage(reader.result as string);
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                  onClick={() => {
                    const el = document.getElementById('dish-file-uploader');
                    if (el) el.click();
                  }}
                  className="border-2 border-dashed border-gray-300 hover:border-brand-red rounded-xl p-4 text-center cursor-pointer transition-all bg-gray-50/50 flex flex-col items-center justify-center space-y-2 min-h-[110px]"
                >
                  <input
                    id="dish-file-uploader"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        const file = e.target.files[0];
                        const reader = new FileReader();
                        reader.onloadend = () => {
                          setImage(reader.result as string);
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                  />

                  {image ? (
                    <div className="flex items-center space-x-3 w-full justify-center">
                      <img 
                        src={image} 
                        alt="Preview" 
                        className="w-16 h-16 rounded-lg object-cover border border-gray-200" 
                        referrerPolicy="no-referrer"
                      />
                      <div className="text-left">
                        <span className="text-[10px] text-green-700 font-bold block">✓ Đã tải ảnh lên</span>
                        <span className="text-[9px] text-gray-400 block underline hover:text-[#EE3124]">Click để thay đổi</span>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center">
                      <span className="text-[#EE3124] text-xs font-bold block mb-0.5">📂 Click hoặc Kéo thả ảnh món tại đây</span>
                      <span className="text-[9px] text-gray-400">Hỗ trợ định dạng JPG, PNG từ bếp nấu</span>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Mô tả tóm tắt</label>
                <textarea
                  className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-xs h-16 resize-none"
                  placeholder="Nhập ghi chú chi tiết thành phần..."
                  value={desc}
                  onChange={e => setDesc(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Trạng thái bán</label>
                <select
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-255 bg-white font-semibold text-xs text-gray-700"
                  value={status}
                  onChange={e => setStatus(e.target.value as DishStatus)}
                >
                  <option value={DishStatus.CON_PHUC_VU}>{DishStatus.CON_PHUC_VU}</option>
                  <option value={DishStatus.HET_MON}>{DishStatus.HET_MON}</option>
                  <option value={DishStatus.NGUNG_PHUC_VU}>{DishStatus.NGUNG_PHUC_VU}</option>
                </select>
              </div>

              {/* Warning note */}
              <div className="bg-amber-50 rounded-xl p-3 text-[10px] text-amber-800 flex items-start space-x-1.5 border border-amber-150">
                <ShieldAlert size={14} className="shrink-0 mt-0.5" />
                <span>
                  <strong>Lưu ý hệ thống:</strong> Món ăn bắt buộc phải định mức ít nhất một nguyên liệu trong bảng định lượng (Công thức món) trước khi hiển thị trạng thái "Còn phục vụ".
                </span>
              </div>

              <div className="pt-4 flex items-center space-x-2.5">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-2.5 border border-gray-200 hover:bg-gray-100 text-gray-500 rounded-xl font-semibold text-xs cursor-pointer"
                >
                  HỦY BỎ
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-brand-red hover:bg-brand-red-dark text-white rounded-xl font-semibold text-xs shadow-md cursor-pointer"
                >
                  LƯU THÔNG TIN
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
