import React, { useState, useMemo, useEffect } from 'react';
import { useRestaurantStore } from '../data/store';
import { Search, Plus, Trash2, PackageOpen, X, CheckCircle2, Ban, RotateCcw } from 'lucide-react';
import { RawMaterial } from '../types';

type ImportRow = {
  id: string;
  materialId: string;
  isNew?: boolean;
  newMaterialName?: string;
  newMaterialUnit?: string;
  quantity: number | '';
  newMinStock: number | '';
  notes: string;
  searchQuery: string;
  isDropdownOpen?: boolean;
  error?: {
    materialId?: string;
    newMaterialName?: string;
    newMaterialUnit?: string;
    quantity?: string;
    newMinStock?: string;
  };
};

export default function WarehouseView() {
  const { materials, adjustInventory, updateMaterial, addNewMaterial } = useRestaurantStore();

  // Helper to remove accents from Vietnamese string
  const removeAccents = (str: string) => {
    return str
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/đ/g, 'd')
      .replace(/Đ/g, 'D');
  };

  // Advanced search matcher (matches by Name, Code, or Unit, accent-insensitive)
  const isMatch = (item: RawMaterial, query: string) => {
    if (!query) return true;
    const cleanQuery = removeAccents(query.trim().toLowerCase());
    
    const nameMatch = removeAccents(item.Ten_nvl.toLowerCase()).includes(cleanQuery);
    const codeMatch = removeAccents(item.Ma_nvl.toLowerCase()).includes(cleanQuery);
    const unitMatch = removeAccents(item.Don_vi_tinh.toLowerCase()).includes(cleanQuery);
    
    return nameMatch || codeMatch || unitMatch;
  };

  // Tab 1 States
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'ok' | 'low' | 'out' | 'inactive'>('all');

  // Tab 2 (Modal) States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [importRows, setImportRows] = useState<ImportRow[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Auto-hide toast
  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => setToastMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  // Derived Data for Table
  const processedMaterials = useMemo(() => {
    let filtered = materials.filter(m => isMatch(m, searchQuery));

    filtered = filtered.map(m => {
      let status: 'ok' | 'low' | 'out' | 'inactive' = 'ok';
      if (m.Trang_thai === 'Ngừng hoạt động') status = 'inactive';
      else if (m.Ton_kho_hien_tai === 0) status = 'out';
      else if (m.Ton_kho_hien_tai <= m.Ton_kho_toi_thieu) status = 'low';
      
      return { ...m, _status: status };
    });

    if (statusFilter !== 'all') {
      filtered = filtered.filter(m => m._status === statusFilter);
    }

    // Sort: 'out' -> 'low' -> 'ok' -> 'inactive'
    filtered.sort((a, b) => {
      const order = { 'out': 0, 'low': 1, 'ok': 2, 'inactive': 3 };
      return order[a._status] - order[b._status];
    });

    return filtered;
  }, [materials, searchQuery, statusFilter]);

  // Modal Actions
  const openModal = () => {
    setImportRows([{
      id: Date.now().toString(),
      materialId: '',
      isNew: false,
      newMaterialName: '',
      newMaterialUnit: '',
      quantity: '',
      newMinStock: '',
      notes: '',
      searchQuery: '',
      isDropdownOpen: false
    }]);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const handleAddRow = () => {
    setImportRows(prev => [...prev, {
      id: Date.now().toString() + Math.random(),
      materialId: '',
      isNew: false,
      newMaterialName: '',
      newMaterialUnit: '',
      quantity: '',
      newMinStock: '',
      notes: '',
      searchQuery: '',
      isDropdownOpen: false
    }]);
  };

  const handleRemoveRow = (id: string) => {
    if (importRows.length > 1) {
      setImportRows(prev => prev.filter(r => r.id !== id));
    }
  };

  const handleRowChange = (id: string, field: keyof ImportRow, value: any) => {
    setImportRows(prev => prev.map(row => {
      if (row.id === id) {
        const updatedRow = { ...row, [field]: value };
        
        // Auto-fill newMinStock when material is selected (only for existing materials)
        if (field === 'materialId' && value && !updatedRow.isNew) {
          const mat = materials.find(m => m.Ma_nvl === value);
          if (mat) {
            updatedRow.newMinStock = mat.Ton_kho_toi_thieu;
            updatedRow.searchQuery = mat.Ten_nvl;
          }
        }
        
        // Clear specific errors on change
        if (updatedRow.error && updatedRow.error[field as keyof typeof updatedRow.error]) {
          updatedRow.error = { ...updatedRow.error, [field]: undefined };
        }
        
        return updatedRow;
      }
      return row;
    }));
  };

  const handleSelectMaterial = (rowId: string, mat: RawMaterial) => {
    setImportRows(prev => prev.map(row => {
      if (row.id === rowId) {
        return {
          ...row,
          materialId: mat.Ma_nvl,
          isNew: false,
          searchQuery: mat.Ten_nvl,
          newMinStock: mat.Ton_kho_toi_thieu,
          isDropdownOpen: false,
          error: { ...row.error, materialId: undefined }
        };
      }
      return row;
    }));
  };

  const handleSelectNewMaterial = (rowId: string, name: string) => {
    setImportRows(prev => prev.map(row => {
      if (row.id === rowId) {
        return {
          ...row,
          materialId: '',
          isNew: true,
          newMaterialName: name,
          newMaterialUnit: '',
          newMinStock: '',
          searchQuery: name,
          isDropdownOpen: false,
          error: { ...row.error, materialId: undefined, newMaterialName: undefined }
        };
      }
      return row;
    }));
  };

  const handleInputBlur = (rowId: string) => {
    setTimeout(() => {
      setImportRows(prev => prev.map(row => 
        row.id === rowId ? { ...row, isDropdownOpen: false } : row
      ));
    }, 200);
  };

  const getFilteredMaterials = (query: string) => {
    const activeMaterials = materials.filter(m => m.Trang_thai !== 'Ngừng hoạt động');
    if (!query) return activeMaterials;
    return activeMaterials.filter(m => isMatch(m, query));
  };

  const handleToggleStatus = async (mat: RawMaterial) => {
    const newStatus = mat.Trang_thai === 'Ngừng hoạt động' ? 'Hoạt động' : 'Ngừng hoạt động';
    await updateMaterial({
      ...mat,
      Trang_thai: newStatus
    });
  };

  const handleSubmitImport = async () => {
    let isValid = true;
    const validatedRows = importRows.map(row => {
      const error: ImportRow['error'] = {};
      
      if (!row.isNew && !row.materialId) {
        error.materialId = 'Vui lòng chọn nguyên liệu';
        isValid = false;
      }

      if (row.isNew && (!row.newMaterialName || !row.newMaterialName.trim())) {
        error.newMaterialName = 'Vui lòng điền tên nguyên liệu';
        isValid = false;
      }

      if (row.isNew && (!row.newMaterialUnit || !row.newMaterialUnit.trim())) {
        error.newMaterialUnit = 'Vui lòng điền ĐVT';
        isValid = false;
      }
      
      if (row.quantity === '' || row.quantity <= 0) {
        error.quantity = 'Số lượng phải lớn hơn 0';
        isValid = false;
      }

      if (row.newMinStock !== '' && row.newMinStock < 0) {
        error.newMinStock = 'Giá trị không được âm';
        isValid = false;
      }

      return { ...row, error };
    });

    setImportRows(validatedRows);

    if (isValid) {
      // Process imports sequentially to avoid race conditions
      for (const row of validatedRows) {
        let finalMaterialId = row.materialId;

        // If it's a new material, register it in the store first
        if (row.isNew && row.newMaterialName && row.newMaterialUnit) {
          const minStock = row.newMinStock !== '' ? Number(row.newMinStock) : 0;
          
          // Max stock must be larger than min stock for BR05
          const maxStock = minStock > 0 ? minStock * 10 : 1000;

          const createdMat = await addNewMaterial({
            Ma_nvl: '', // backend will generate anyway
            Ten_nvl: row.newMaterialName.trim(),
            Don_vi_tinh: row.newMaterialUnit.trim(),
            Ton_kho_hien_tai: 0,
            Ton_kho_toi_thieu: minStock,
            Ton_kho_toi_da: maxStock
          });

          if (createdMat) {
            finalMaterialId = createdMat.id; // Use backend-generated id
          }
        }

        if (finalMaterialId) {
          // Adjust inventory (add new stock)
          await adjustInventory(finalMaterialId, Number(row.quantity), row.notes || 'Nhập kho trực tiếp');
          
          // Update min stock if changed for existing material
          if (!row.isNew) {
            const mat = materials.find(m => m.Ma_nvl === finalMaterialId);
            if (mat) {
              const newMin = Number(row.newMinStock);
              if (newMin >= 0 && newMin !== mat.Ton_kho_toi_thieu) {
                await updateMaterial({ ...mat, Ton_kho_toi_thieu: newMin });
              }
            }
          }
        }
      }

      setToastMessage('Nhập kho thành công');
      closeModal();
    }
  };

  // Get current datetime string
  const currentDateTime = new Date().toLocaleString('vi-VN', { 
    hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric' 
  });

  return (
    <div className="p-4 md:p-6 h-full flex flex-col bg-[#FDFBF7] text-gray-800">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 bg-green-100 border border-green-400 text-green-800 px-4 py-3 rounded-xl shadow-lg flex items-center space-x-2 animate-bounce">
          <CheckCircle2 size={18} />
          <span className="font-bold text-sm tracking-wide">{toastMessage}</span>
        </div>
      )}

      {/* HEADER & CONTROLS */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
        <div>
          <h2 className="text-2xl font-black text-[#EE3124] tracking-wider uppercase">Tồn Kho Nguyên Liệu</h2>
          <p className="text-sm text-gray-500 font-medium mt-1">Kiểm soát tình trạng vật tư trong kho</p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
            <input
              type="text"
              placeholder="Tìm kiếm nguyên liệu..."
              className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm bg-white focus:border-[#EE3124] focus:ring-1 focus:ring-[#EE3124] outline-none transition-all"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <select
            className="w-full sm:w-auto px-4 py-2 border border-gray-200 rounded-xl text-sm font-semibold bg-white outline-none cursor-pointer hover:border-gray-300 transition-all"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="ok">Đủ hàng</option>
            <option value="low">Sắp hết</option>
            <option value="out">Hết hàng</option>
            <option value="inactive">Ngừng sử dụng</option>
          </select>

          <button
            onClick={openModal}
            className="w-full sm:w-auto flex items-center justify-center space-x-2 bg-[#EE3124] hover:bg-[#D42A1E] text-white px-5 py-2 rounded-xl font-bold text-sm transition-colors shadow-md whitespace-nowrap"
          >
            <Plus size={18} />
            <span>Nhập kho</span>
          </button>
        </div>
      </div>

      {/* TABLE SECTION */}
      <div className="flex-1 bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
        <div className="overflow-x-auto flex-1">
          {processedMaterials.length > 0 ? (
            <table className="w-full text-left border-collapse min-w-[750px]">
              <thead className="bg-gray-50 sticky top-0 z-10">
                <tr className="border-b border-gray-200 text-gray-500 text-xs uppercase font-extrabold tracking-wider">
                  <th className="py-4 px-6 w-1/3">Tên nguyên liệu</th>
                  <th className="py-4 px-6 w-1/12">Đơn vị tính</th>
                  <th className="py-4 px-6 w-1/6 text-right">Tồn hiện tại</th>
                  <th className="py-4 px-6 w-1/6 text-right">Mức tối thiểu</th>
                  <th className="py-4 px-6 w-1/6 text-center">Trạng thái</th>
                  <th className="py-4 px-6 w-1/6 text-center">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {processedMaterials.map(mat => {
                  let badgeClass = '';
                  let badgeText = '';

                  if (mat._status === 'inactive') {
                    badgeClass = 'bg-gray-100 text-gray-500 border border-gray-200';
                    badgeText = 'Ngừng SD';
                  } else if (mat._status === 'ok') {
                    badgeClass = 'bg-green-100 text-green-700';
                    badgeText = 'Đủ';
                  } else if (mat._status === 'low') {
                    badgeClass = 'bg-orange-100 text-orange-700';
                    badgeText = 'Sắp hết';
                  } else {
                    badgeClass = 'bg-red-100 text-red-700';
                    badgeText = 'Hết';
                  }

                  const isInactive = mat.Trang_thai === 'Ngừng hoạt động';

                  return (
                    <tr
                      key={mat.Ma_nvl}
                      className={`transition-colors ${
                        isInactive
                          ? 'bg-gray-50/40 text-gray-400 opacity-70 hover:bg-gray-100/40'
                          : 'hover:bg-gray-50'
                      }`}
                    >
                      <td className={`py-4 px-6 font-bold text-sm ${isInactive ? 'text-gray-400 italic font-semibold' : 'text-gray-800'}`}>
                        {mat.Ten_nvl}
                      </td>
                      <td className="py-4 px-6 text-gray-500 text-sm font-medium">
                        {mat.Don_vi_tinh}
                      </td>
                      <td className={`py-4 px-6 text-right font-bold text-base tabular-nums ${isInactive ? 'text-gray-400' : 'text-gray-800'}`}>
                        {mat.Ton_kho_hien_tai.toLocaleString()}
                      </td>
                      <td className="py-4 px-6 text-right text-gray-500 text-sm tabular-nums font-semibold">
                        {mat.Ton_kho_toi_thieu.toLocaleString()}
                      </td>
                      <td className="py-4 px-6 text-center">
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold tracking-wide ${badgeClass}`}>
                          {badgeText}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-center">
                        {isInactive ? (
                          <button
                            onClick={() => handleToggleStatus(mat)}
                            className="inline-flex items-center space-x-1 text-xs font-bold text-emerald-600 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-2.5 py-1.5 rounded-xl cursor-pointer transition-all active:scale-95 shadow-sm"
                          >
                            <RotateCcw size={12} />
                            <span>Kích hoạt lại</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => handleToggleStatus(mat)}
                            className="inline-flex items-center space-x-1 text-xs font-bold text-rose-600 hover:text-rose-800 bg-rose-50 hover:bg-rose-100 border border-rose-200 px-2.5 py-1.5 rounded-xl cursor-pointer transition-all active:scale-95 shadow-sm"
                          >
                            <Ban size={12} />
                            <span>Ngừng sử dụng</span>
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          ) : (
            <div className="h-full flex flex-col items-center justify-center p-10 text-gray-400">
              <PackageOpen size={48} className="mb-4 opacity-50" />
              <p className="text-base font-medium">Không tìm thấy nguyên liệu phù hợp</p>
            </div>
          )}
        </div>
      </div>

      {/* IMPORT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-[92vw] max-h-[90vh] flex flex-col overflow-hidden">
            
            {/* Modal Header */}
            <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <div>
                <h3 className="text-xl font-black text-gray-800 uppercase tracking-wider">Ghi Nhận Nhập Kho Thực Tế</h3>
                <p className="text-xs text-gray-500 mt-1 font-medium">{currentDateTime}</p>
              </div>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-700 p-2 rounded-full hover:bg-gray-200 transition-colors">
                <X size={24} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto flex-1 bg-[#FDFBF7] min-h-[320px]">
              <div className="space-y-4 pb-36">
                {importRows.map((row, index) => {
                  const selectedMat = materials.find(m => m.Ma_nvl === row.materialId);
                  const unit = row.isNew ? (row.newMaterialUnit || '') : (selectedMat ? selectedMat.Don_vi_tinh : '-');

                  return (
                    <div key={row.id} className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm flex flex-col gap-4 relative">
                      {/* Row index indicator */}
                      <div className="absolute -left-2 -top-2 bg-gray-800 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shadow-md">
                        {index + 1}
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start">
                        
                        <div className="md:col-span-4 relative">
                          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Nguyên liệu *</label>
                          {row.isNew ? (
                            <div className="relative">
                              <input
                                type="text"
                                placeholder="Tên nguyên liệu mới..."
                                className={`w-full px-3 py-2 bg-amber-50/50 border rounded-xl text-sm font-semibold outline-none ${row.error?.newMaterialName ? 'border-red-500 focus:ring-1 focus:ring-red-500' : 'border-amber-200 focus:border-amber-500'}`}
                                value={row.newMaterialName || ''}
                                onChange={(e) => handleRowChange(row.id, 'newMaterialName', e.target.value)}
                              />
                              <button
                                type="button"
                                onClick={() => {
                                  setImportRows(prev => prev.map(r => 
                                    r.id === row.id ? { 
                                      ...r, 
                                      isNew: false, 
                                      newMaterialName: '', 
                                      newMaterialUnit: '',
                                      searchQuery: '',
                                      error: { ...r.error, newMaterialName: undefined, newMaterialUnit: undefined }
                                    } : r
                                  ));
                                }}
                                className="absolute right-3 top-2.5 text-xs text-red-500 hover:text-red-700 font-bold transition-colors"
                              >
                                Chọn lại
                              </button>
                              {row.error?.newMaterialName && <p className="text-xs text-red-500 mt-1.5 font-medium">{row.error.newMaterialName}</p>}
                            </div>
                          ) : (
                            <div className="relative">
                              <input
                                type="text"
                                placeholder="Tìm kiếm hoặc chọn nguyên liệu..."
                                className={`w-full px-3 py-2 bg-white border rounded-xl text-sm font-semibold outline-none ${row.error?.materialId ? 'border-red-500 focus:ring-1 focus:ring-red-500' : 'border-gray-200 focus:border-[#EE3124]'}`}
                                value={row.searchQuery}
                                onFocus={() => {
                                  setImportRows(prev => prev.map(r => 
                                    r.id === row.id ? { ...r, isDropdownOpen: true } : { ...r, isDropdownOpen: false }
                                  ));
                                }}
                                onBlur={() => handleInputBlur(row.id)}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setImportRows(prev => prev.map(r => {
                                    if (r.id === row.id) {
                                      return { 
                                        ...r, 
                                        searchQuery: val, 
                                        materialId: val === '' ? '' : r.materialId,
                                        error: { ...r.error, materialId: undefined } 
                                      };
                                    }
                                    return r;
                                  }));
                                }}
                              />
                              {row.error?.materialId && <p className="text-xs text-red-500 mt-1.5 font-medium">{row.error.materialId}</p>}

                              {row.isDropdownOpen && (
                                <div className="absolute left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-xl max-h-52 overflow-y-auto z-30 divide-y divide-gray-50">
                                  {getFilteredMaterials(row.searchQuery).length > 0 ? (
                                    getFilteredMaterials(row.searchQuery).map(m => (
                                      <div
                                        key={m.Ma_nvl}
                                        onMouseDown={() => handleSelectMaterial(row.id, m)}
                                        className="px-4 py-2.5 text-sm hover:bg-[#FDFBF7] cursor-pointer transition-colors flex justify-between items-center"
                                      >
                                        <span className="font-bold text-gray-700">{m.Ten_nvl}</span>
                                        <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full font-semibold">{m.Don_vi_tinh}</span>
                                      </div>
                                    ))
                                  ) : (
                                    <div className="px-4 py-2.5 text-xs text-gray-400 italic">
                                      Không tìm thấy nguyên liệu nào
                                    </div>
                                  )}
                                  
                                  <div
                                    onMouseDown={() => handleSelectNewMaterial(row.id, row.searchQuery)}
                                    className="px-4 py-2.5 text-xs font-bold text-[#EE3124] hover:bg-red-50 cursor-pointer flex items-center gap-1.5 transition-colors border-t border-gray-100"
                                  >
                                    <Plus size={14} />
                                    <span>Tạo nguyên liệu mới "{row.searchQuery || '...'}"</span>
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                        </div>

                        <div className="md:col-span-1">
                          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">ĐVT</label>
                          {row.isNew ? (
                            <div>
                              <input
                                type="text"
                                placeholder="g, kg..."
                                className={`w-full px-2 py-2 bg-amber-50/50 border rounded-xl text-sm font-bold text-center outline-none ${row.error?.newMaterialUnit ? 'border-red-500 focus:ring-1 focus:ring-red-500' : 'border-amber-200 focus:border-amber-500'}`}
                                value={row.newMaterialUnit || ''}
                                onChange={(e) => handleRowChange(row.id, 'newMaterialUnit', e.target.value)}
                              />
                              {row.error?.newMaterialUnit && <p className="text-xs text-red-500 mt-1 font-medium">{row.error.newMaterialUnit}</p>}
                            </div>
                          ) : (
                            <div className="w-full px-3 py-2 bg-gray-100 border border-gray-200 rounded-xl text-sm text-center text-gray-500 font-semibold select-none">
                              {unit}
                            </div>
                          )}
                        </div>

                        <div className="md:col-span-2">
                          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">SL nhập *</label>
                          <input
                            type="number"
                            min="1"
                            placeholder="0"
                            className={`w-full px-3 py-2 bg-white border rounded-xl text-sm font-bold tabular-nums text-center outline-none ${row.error?.quantity ? 'border-red-500 focus:ring-1 focus:ring-red-500' : 'border-gray-200 focus:border-[#EE3124]'}`}
                            value={row.quantity}
                            onChange={(e) => handleRowChange(row.id, 'quantity', e.target.value === '' ? '' : Number(e.target.value))}
                            onKeyDown={(e) => {
                              if (['e', 'E', '+', '-'].includes(e.key)) e.preventDefault();
                            }}
                          />
                          {row.error?.quantity && <p className="text-xs text-red-500 mt-1.5 font-medium">{row.error.quantity}</p>}
                        </div>

                        <div className="md:col-span-2">
                          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5" title="Mức tối thiểu">Mức Tối Thiểu</label>
                          <input
                            type="number"
                            min="0"
                            placeholder="0"
                            className={`w-full px-3 py-2 bg-white border rounded-xl text-sm font-bold tabular-nums text-center outline-none ${row.error?.newMinStock ? 'border-red-500 focus:ring-1 focus:ring-red-500' : 'border-gray-200 focus:border-[#EE3124]'}`}
                            value={row.newMinStock}
                            onChange={(e) => handleRowChange(row.id, 'newMinStock', e.target.value === '' ? '' : Number(e.target.value))}
                            onKeyDown={(e) => {
                              if (['e', 'E', '-', '+'].includes(e.key)) e.preventDefault();
                            }}
                          />
                          {row.error?.newMinStock && <p className="text-xs text-red-500 mt-1.5 font-medium">{row.error.newMinStock}</p>}
                        </div>

                        <div className="md:col-span-2">
                          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Ghi chú</label>
                          <input
                            type="text"
                            placeholder="..."
                            className="w-full px-3 py-2 bg-white border border-gray-200 focus:border-[#EE3124] rounded-xl text-sm outline-none"
                            value={row.notes}
                            onChange={(e) => handleRowChange(row.id, 'notes', e.target.value)}
                          />
                        </div>

                        <div className="md:col-span-1 flex items-end justify-center pb-1 h-full">
                          <button 
                            onClick={() => handleRemoveRow(row.id)}
                            disabled={importRows.length === 1}
                            className="p-2.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                            title="Xóa dòng"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>

                      </div>
                    </div>
                  );
                })}

                <button
                  onClick={handleAddRow}
                  className="flex items-center space-x-2 text-[#EE3124] hover:bg-red-50 px-4 py-2.5 rounded-xl font-bold text-sm transition-colors border border-dashed border-[#EE3124]/30 w-full sm:w-auto"
                >
                  <Plus size={16} />
                  <span>Thêm nguyên liệu</span>
                </button>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-gray-100 bg-white flex justify-end gap-3 rounded-b-3xl">
              <button
                onClick={closeModal}
                className="px-6 py-2.5 border border-gray-300 text-gray-600 rounded-xl font-bold text-sm hover:bg-gray-50 transition-colors"
              >
                Hủy
              </button>
              <button
                onClick={handleSubmitImport}
                className="px-8 py-2.5 bg-[#EE3124] hover:bg-[#D42A1E] text-white rounded-xl font-bold text-sm shadow-md transition-colors"
              >
                Xác nhận
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
