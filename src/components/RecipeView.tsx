/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { useRestaurantStore } from '../data/store';
import { RecipeItem, RawMaterial } from '../types';
import { ChevronLeft, Plus, Trash2, Save, ShoppingBag, Eye, HelpCircle, Upload } from 'lucide-react';

export default function RecipeView({ dishId, onBack }: { dishId: string; onBack: () => void }) {
  const { dishes, categories, recipes, materials, updateRecipe, updateDish, logSystemAction } = useRestaurantStore();

  const dish = dishes.find(d => d.Ma_mon === dishId);
  const categoryName = categories.find(c => c.Ma_danh_muc === dish?.Ma_danh_muc)?.Ten_danh_muc || 'Khác';

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Recipe rows representation state
  interface LocalRecipe {
    materialId: string;
    amount: number;
    unit: string;
  }

  const [localRows, setLocalRows] = useState<LocalRecipe[]>([]);
  const [isEditing, setIsEditing] = useState(false);

  // Initialize
  useEffect(() => {
    if (isEditing) return; // Prevent overwriting while user is editing
    const existing = recipes.filter(r => r.Ma_mon === dishId);
    if (existing.length > 0) {
      setLocalRows(
        existing.map(r => ({
          materialId: r.Ma_nvl,
          amount: r.So_luong_dinh_luong,
          unit: r.Don_vi_tinh,
        }))
      );
    } else {
      setLocalRows([]);
    }
  }, [dishId, recipes, isEditing]);

  if (!dish) {
    return (
      <div className="p-8 text-center text-gray-500">
        Không tìm thấy sản phẩm yêu cầu.
        <button onClick={onBack} className="mt-4 px-4 py-2 bg-brand-red text-white rounded-lg block mx-auto">Quay lại</button>
      </div>
    );
  }

  const addIngredientRow = () => {
    // Pick first material that is not already in the recipe list, or fallback
    const unusedMaterial = materials.find(m => !localRows.some(row => row.materialId === m.Ma_nvl)) || materials[0];
    if (!unusedMaterial) return;

    setLocalRows(prev => [
      ...prev,
      {
        materialId: unusedMaterial.Ma_nvl,
        amount: 100,
        unit: unusedMaterial.Don_vi_tinh,
      },
    ]);
  };

  const removeRow = (index: number) => {
    setLocalRows(prev => prev.filter((_, i) => i !== index));
  };

  const updateRow = (index: number, fields: Partial<LocalRecipe>) => {
    setLocalRows(prev =>
      prev.map((row, i) => {
        if (i === index) {
          const updated = { ...row, ...fields };
          // If material changed, pick the correct default unit is convenient
          if (fields.materialId) {
            const raw = materials.find(m => m.Ma_nvl === fields.materialId);
            if (raw) {
              updated.unit = raw.Don_vi_tinh;
            }
          }
          return updated;
        }
        return row;
      })
    );
  };

  const handleSaveRecipe = () => {
    // Validate uniqueness of materials
    const materialIds = localRows.map(r => r.materialId);
    const hasDuplicate = materialIds.some((id, index) => materialIds.indexOf(id) !== index);
    if (hasDuplicate) {
      alert('Lỗi: Công thức món không thể chứa trùng lặp một nguyên liệu nhiều lần.');
      return;
    }

    const hasInvalid = localRows.some(r => r.amount <= 0);
    if (hasInvalid) {
      alert('Lỗi: Số lượng định mức phải lớn hơn 0.');
      return;
    }

    const finalRecipeItems: RecipeItem[] = localRows.map(row => ({
      Ma_mon: dishId,
      Ma_nvl: row.materialId,
      So_luong_dinh_luong: row.amount,
      Don_vi_tinh: row.unit,
    }));

    updateRecipe(dishId, finalRecipeItems);
    setIsEditing(false);
    alert('Lưu bảng định lượng thành công!');
  };

  return (
    <div className="space-y-6 font-sans text-sm text-gray-700" id="recipe-view-root">
      {/* Title block with back arrow */}
      <div className="flex justify-between items-center bg-white p-5 rounded-xl border border-gray-150 shadow-sm" id="recipe-header">
        <div className="flex items-center space-x-3">
          <button
            onClick={onBack}
            className="p-2 hover:bg-gray-100 rounded-lg text-brand-red border border-gray-150 transition cursor-pointer"
            title="Quay lại danh sách thực đơn"
          >
            <ChevronLeft size={16} />
          </button>
          <div>
            <div className="flex items-center space-x-1.5">
              <span className="text-xs text-gray-400 capitalize">{categoryName}</span>
              <span className="text-xs text-gray-400">/</span>
              <span className="text-xs text-gray-400 font-bold text-brand-red">{dish.Ten_mon}</span>
            </div>
            <h2 className="text-lg font-display font-bold text-gray-800 tracking-wide mt-0.5">Chi tiết & Định Lượng</h2>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {!isEditing ? (
            <button
              id="btn-edit-recipe"
              onClick={() => setIsEditing(true)}
              className="px-4 py-2 border border-gray-250 hover:bg-red-50 hover:text-red-800 rounded-xl text-xs font-bold transition cursor-pointer"
            >
              CHỈNH SỬA
            </button>
          ) : (
            <button
              id="btn-save-recipe"
              onClick={handleSaveRecipe}
              className="px-4 py-2 bg-brand-red hover:bg-brand-red-dark text-white rounded-xl text-xs font-bold transition flex items-center space-x-1.5 shadow-md cursor-pointer"
            >
              <Save size={13} />
              <span>LƯU CÔNG THỨC</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Split Layout exactly like Screen 05 */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5" id="recipe-split-design">
        {/* Left Side: Dish Presentation Profile */}
        <div className="lg:col-span-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between" id="dish-profile-card">
          <div className="space-y-4">
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="relative group w-full aspect-video rounded-xl overflow-hidden border border-gray-100 bg-gray-50 shadow-inner cursor-pointer"
            >
              <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    const file = e.target.files[0];
                    const reader = new FileReader();
                    reader.onloadend = () => {
                      const base64 = reader.result as string;
                      updateDish({
                        ...dish,
                        Anh_mon: base64
                      });
                      logSystemAction('Cập nhật thực đơn', `Cập nhật ảnh món ăn "${dish.Ten_mon}" trực tiếp từ công thức định lượng (ổ cứng)`);
                    };
                    reader.readAsDataURL(file);
                  }
                }}
              />
              <img
                src={dish.Anh_mon}
                alt={dish.Ten_mon}
                className="w-full h-full object-cover group-hover:scale-105 transition-all duration-300"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                <div className="bg-white/90 backdrop-blur-xs px-3 py-1.5 rounded-lg text-xs font-bold text-gray-800 flex items-center space-x-1.5 shadow-md">
                  <Upload size={12} className="text-brand-red animate-bounce" />
                  <span>Chọn ảnh từ ổ cứng</span>
                </div>
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-bold text-brand-red tracking-wider uppercase px-2 py-0.5 bg-red-50 border border-red-100/50 rounded">{categoryName}</span>
                <span className="text-[10px] text-gray-400 font-mono">Bản ghi: {dish.Ma_mon}</span>
              </div>
              <h3 className="font-display font-extrabold text-gray-800 text-lg mt-2">{dish.Ten_mon}</h3>
              <p className="text-xl font-mono font-bold text-gray-900 mt-1">{dish.Don_gia.toLocaleString()}đ</p>
            </div>

            <div className="border-t border-gray-100 pt-3">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">MÔ TẢ MÓN ĂN</span>
              <p className="text-xs text-gray-500 font-light leading-relaxed bg-gray-50 p-2.5 rounded-lg border border-dashed border-gray-200">
                {dish.Mo_ta || 'Chưa có mô tả tóm tắt cho món ăn này. Điền mô tả chi tiết tại bảng chỉnh sửa thực đơn chính.'}
              </p>
            </div>
          </div>

          <div className="mt-6 space-y-4">
            <div className="p-3.5 rounded-xl border border-teal-100 bg-teal-50/60 text-[11px] leading-relaxed text-teal-950">
              <div className="flex items-start space-x-2">
                <HelpCircle size={15} className="shrink-0 mt-0.5 text-teal-600" />
                <div>
                  <p className="font-extrabold uppercase text-[10px] tracking-wide mb-1">
                    💡 CƠ CHẾ ĐỊNH LƯỢNG NGUYÊN LIỆU
                  </p>
                  <p className="font-light text-gray-600">
                    Khai báo chi tiết các nguyên vật liệu (chất lượng, khối lượng/thể tích) cấu thành nên một suất ăn tiêu chuẩn. Khi nhà bếp hoàn thành chế biến, phần mềm sẽ <strong>tự động bóc tách và khấu trừ tương ứng</strong> trong kho hàng.
                  </p>
                </div>
              </div>
            </div>

            <div className="p-3 bg-red-50/50 rounded-xl border border-red-100 text-[11px] text-red-900 flex items-start space-x-2">
              <ShoppingBag size={15} className="shrink-0 mt-0.5 text-brand-red" />
              <div>
                <p className="font-bold text-brand-red">Tự Động Trừ Tồn Kho</p>
                <p className="font-light mt-0.5">Khi bếp phê duyệt chế biến món ăn này, hệ thống sẽ tự động trừ các nguyên liệu định nghĩa ở bảng bên phải khỏi kho hàng chính.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Recipe Breakdown Table */}
        <div className="lg:col-span-8 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col" id="dish-recipe-breakdown">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wide">Định lượng nguyên liệu (cho 1 phần)</h3>
              <p className="text-xs text-gray-400 mt-0.5">Xác định tỉ lệ tiêu thụ vật tư</p>
            </div>

            {isEditing && (
              <button
                onClick={addIngredientRow}
                className="px-2.5 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 rounded-lg text-xs font-semibold border border-amber-100 flex items-center space-x-1 cursor-pointer"
                id="btn-add-recipe-row"
              >
                <Plus size={13} />
                <span>Thêm nguyên liệu</span>
              </button>
            )}
          </div>

          <div className="flex-1 overflow-x-auto min-h-[250px]" id="recipe-table-inner">
            <table className="w-full text-left border-collapse" id="recipe-edit-table">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-150 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                  <th className="py-3 px-4 text-center w-12">STT</th>
                  <th className="py-3 px-4">Nguyên vật liệu</th>
                  <th className="py-3 px-4 text-center w-24">Số lượng</th>
                  <th className="py-3 px-4 text-center w-24">Đơn vị</th>
                  {isEditing && <th className="py-3 px-4 text-center w-16">Thao tác</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-xs text-gray-600">
                {localRows.map((row, index) => {
                  const mInfo = materials.find(m => m.Ma_nvl === row.materialId);
                  
                  return (
                    <tr key={index} className="hover:bg-gray-50/20">
                      <td className="py-3 px-4 text-center font-semibold font-mono text-gray-400">{index + 1}</td>
                      <td className="py-3 px-4">
                        {!isEditing ? (
                          <span className="font-semibold text-gray-800">{mInfo?.Ten_nvl || 'Nguyên liệu không xác định'}</span>
                        ) : (
                          <select
                            className="px-2 py-1.5 border border-gray-200 rounded-lg w-full bg-white max-w-xs text-xs font-medium"
                            value={row.materialId}
                            onChange={e => updateRow(index, { materialId: e.target.value })}
                          >
                            {materials.map(mat => (
                              <option key={mat.Ma_nvl} value={mat.Ma_nvl}>
                                {mat.Ten_nvl} ({mat.Don_vi_tinh})
                              </option>
                            ))}
                          </select>
                        )}
                      </td>
                      <td className="py-3 px-4 text-center">
                        {!isEditing ? (
                          <span className="font-mono font-bold text-gray-800">{row.amount.toLocaleString()}</span>
                        ) : (
                          <input
                            type="number"
                            min="1"
                            className="px-2 py-1 border border-gray-200 rounded-lg w-20 text-center font-mono font-bold bg-gray-50 focus:bg-white"
                            value={row.amount}
                            onChange={e => updateRow(index, { amount: Number(e.target.value) })}
                          />
                        )}
                      </td>
                      <td className="py-3 px-4 text-center text-gray-400 font-mono font-bold">
                        <span>{row.unit}</span>
                      </td>
                      {isEditing && (
                        <td className="py-3 px-4 text-center">
                          <button
                            onClick={() => removeRow(index)}
                            className="p-1 rounded text-red-600 hover:bg-red-50 hover:text-red-800 transition"
                            title="Xóa nguyên liệu"
                          >
                            <Trash2 size={13} />
                          </button>
                        </td>
                      )}
                    </tr>
                  );
                })}

                {localRows.length === 0 && (
                  <tr>
                    <td colSpan={isEditing ? 5 : 4} className="py-12 text-center text-gray-400">
                      <div className="flex flex-col items-center justify-center space-y-4 max-w-sm mx-auto">
                        <p className="text-xs italic leading-relaxed">
                          Món ăn mới tạo chưa có dữ liệu cấu tạo định lượng nguyên liệu.
                        </p>
                        {!isEditing ? (
                          <button
                            onClick={() => {
                              setIsEditing(true);
                              addIngredientRow();
                            }}
                            className="px-4 py-2.5 bg-brand-red hover:bg-brand-red-dark text-white rounded-xl text-xs font-bold transition flex items-center space-x-2 shadow-md cursor-pointer"
                          >
                            <Plus size={14} />
                            <span>Khai báo nguyên vật liệu</span>
                          </button>
                        ) : (
                          <button
                            onClick={addIngredientRow}
                            className="px-3 py-2 bg-amber-50 hover:bg-amber-100 text-amber-800 rounded-xl text-xs font-bold border border-amber-200 transition flex items-center space-x-1.5 cursor-pointer"
                          >
                            <Plus size={14} />
                            <span>Thêm một dòng nữa</span>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
