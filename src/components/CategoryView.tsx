/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useRestaurantStore } from '../data/store';
import { Category } from '../types';
import { Plus, Edit2, Trash2, X, ListOrdered, Tag, ShieldAlert } from 'lucide-react';

export default function CategoryView() {
  const { categories, dishes, addCategory, updateCategory, deleteCategory } = useRestaurantStore();
  
  // Modal configurations
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCat, setEditingCat] = useState<Category | null>(null);

  // Form Fields
  const [name, setName] = useState('');
  const [order, setOrder] = useState<number>(1);
  const [status, setStatus] = useState<'Hiển thị' | 'Ẩn'>('Hiển thị');

  const openAddModal = () => {
    setEditingCat(null);
    setName('');
    setOrder(categories.length + 1);
    setStatus('Hiển thị');
    setIsModalOpen(true);
  };

  const openEditModal = (cat: Category) => {
    setEditingCat(cat);
    setName(cat.Ten_danh_muc);
    setOrder(cat.Thu_tu_hien_thi);
    setStatus(cat.Trang_thai);
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) {
      alert('Tên danh mục không được bỏ trống.');
      return;
    }

    if (editingCat) {
      updateCategory({
        ...editingCat,
        Ten_danh_muc: name,
        Thu_tu_hien_thi: Number(order),
        Trang_thai: status,
      });
    } else {
      const id = `dm0${categories.length + 1}`;
      addCategory({
        Ma_danh_muc: id,
        Ten_danh_muc: name,
        Thu_tu_hien_thi: Number(order),
        Trang_thai: status,
      });
    }
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6 text-sm" id="category-view-root">
      {/* Title Header */}
      <div className="flex justify-between items-center bg-white p-5 rounded-xl border border-gray-100 shadow-sm" id="category-header">
        <div>
          <h2 className="text-xl font-display font-bold text-gray-800 tracking-wide">Danh Mục Thực Đơn</h2>
          <p className="text-xs text-gray-400 mt-1 uppercase tracking-widest font-mono">Menu Categories Configurator (UC21)</p>
        </div>
        <button
          id="btn-add-category"
          onClick={openAddModal}
          className="bg-brand-red hover:bg-brand-red-dark text-white px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center space-x-2 shadow-md cursor-pointer"
        >
          <Plus size={16} />
          <span>NHÓM DANH MỤC MỚI</span>
        </button>
      </div>

      {/* Categories table layout */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden" id="category-list-wrapper">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse" id="categories-table">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-150 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                <th className="py-4 px-6 text-center w-12">STT</th>
                <th className="py-4 px-4">Tên danh mục</th>
                <th className="py-4 px-4 text-center w-28">Số lượng món</th>
                <th className="py-4 px-4 text-center w-36">Thứ tự hiển thị</th>
                <th className="py-4 px-4 text-center w-28">Trạng Thái</th>
                <th className="py-4 px-6 text-center w-28">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-xs text-gray-600">
              {categories
                .sort((a, b) => a.Thu_tu_hien_thi - b.Thu_tu_hien_thi)
                .map((cat, index) => {
                  const dishCount = dishes.filter(d => d.Ma_danh_muc === cat.Ma_danh_muc).length;
                  return (
                    <tr key={cat.Ma_danh_muc} className="hover:bg-gray-50/50 transition">
                      <td className="py-4 px-6 text-center font-semibold font-mono text-gray-400">{index + 1}</td>
                      <td className="py-4 px-4 font-bold text-gray-800 text-sm">
                        <div className="flex items-center space-x-2">
                          <Tag size={14} className="text-brand-red" />
                          <span>{cat.Ten_danh_muc}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-center font-mono font-bold text-gray-600">{dishCount} món</td>
                      <td className="py-4 px-4 text-center font-mono font-bold text-gray-600">
                        <span className="bg-gray-100 px-2 py-0.5 rounded border border-gray-200">
                          {cat.Thu_tu_hien_thi}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-center">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-semibold ${
                          cat.Trang_thai === 'Hiển thị'
                            ? 'bg-green-50 text-green-700'
                            : 'bg-red-50 text-red-700'
                        }`}>
                          {cat.Trang_thai}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-center">
                        <div className="flex items-center justify-center space-x-2.5">
                          <button
                            onClick={() => openEditModal(cat)}
                            className="p-1 px-1.5 rounded bg-gray-50 hover:bg-gray-200 text-gray-600 transition"
                            title="Sửa danh mục"
                          >
                            <Edit2 size={12} />
                          </button>
                          
                          <button
                            onClick={() => {
                              if (confirm('Xác nhận xóa danh mục này? Hướng này không làm mất món trong danh mục.')) {
                                deleteCategory(cat.Ma_danh_muc);
                              }
                            }}
                            className="p-1 px-1.5 rounded text-red-700 hover:bg-red-50 border border-red-100 transition"
                            title="Xóa danh mục"
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
      </div>

      {/* Pop-up Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 text-sm font-sans" id="category-modal">
          <div className="bg-white w-full max-w-sm rounded-2xl shadow-2xl relative overflow-hidden flex flex-col">
            <div className="absolute top-0 inset-x-0 h-1 bg-brand-red"></div>
            
            {/* Header */}
            <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h3 className="font-display font-bold text-base text-gray-800">
                {editingCat ? 'Cập Nhật Danh Mục' : 'Tạo Danh Mục Mới'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X size={18} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Tên danh mục *</label>
                <input
                  type="text"
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200"
                  placeholder="Vd: Topping nhúng lẩu"
                  value={name}
                  onChange={e => setName(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Thứ tự hiển thị *</label>
                <input
                  type="number"
                  required
                  min="1"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 font-mono font-bold"
                  value={order}
                  onChange={e => setOrder(Number(e.target.value))}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Trạng thái trưng bày</label>
                <select
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 bg-white"
                  value={status}
                  onChange={e => setStatus(e.target.value as any)}
                >
                  <option value="Hiển thị">Hiển thị lên thực đơn</option>
                  <option value="Ẩn">Tạm ẩn</option>
                </select>
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
                  LƯU DANH MỤC
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
