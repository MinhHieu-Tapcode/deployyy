/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import { useRestaurantStore } from '../data/store';
import { RawMaterial } from '../types';
import { 
  Boxes, 
  Plus, 
  Upload, 
  AlertTriangle, 
  FileText, 
  CheckCircle, 
  Image as ImageIcon, 
  Trash2, 
  Percent, 
  Search, 
  Save, 
  ShieldAlert,
  ArrowRightLeft
} from 'lucide-react';

export default function WarehouseView() {
  const { 
    materials, 
    importReceipts, 
    addImportReceipt, 
    updateMaterial, 
    adjustInventory,
    inventoryTransactions
  } = useRestaurantStore();

  const [activeSubTab, setActiveSubTab] = useState<'import' | 'min_stock' | 'adjust' | 'history'>('import');
  
  // States of Sub-Tab 1: Nhập Kho
  const [shipper, setShipper] = useState('');
  const [receiptNote, setReceiptNote] = useState('');
  const [uploadedPhoto, setUploadedPhoto] = useState<string | null>(null);
  const [receiptItems, setReceiptItems] = useState<{ materialId: string; quantity: number; price: number }[]>([
    { materialId: materials[0]?.Ma_nvl || '', quantity: 10, price: 50000 }
  ]);
  const [receiptSuccess, setReceiptSuccess] = useState('');
  const [receiptError, setReceiptError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Drag & drop state
  const [isDragging, setIsDragging] = useState(false);

  // States of Sub-Tab 2: Định mức tồn tối thiểu
  const [searchQuery, setSearchQuery] = useState('');
  const [editingMatId, setEditingMatId] = useState<string | null>(null);
  const [editMinStock, setEditMinStock] = useState<number>(0);
  const [editMaxStock, setEditMaxStock] = useState<number>(0);
  const [stockSuccess, setStockSuccess] = useState('');

  // States of Sub-Tab 3: Cân đối thủ công
  const [adjustMatId, setAdjustMatId] = useState(materials[0]?.Ma_nvl || '');
  const [adjustAmount, setAdjustAmount] = useState<number>(0);
  const [adjustReason, setAdjustReason] = useState('');
  const [adjustNote, setAdjustNote] = useState('');
  const [adjustSuccessMsg, setAdjustSuccessMsg] = useState('');
  const [adjustErrorMsg, setAdjustErrorMsg] = useState('');

  // Helper to handle base64 image conversion
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        setUploadedPhoto(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = () => {
    setIsDragging(false);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        setUploadedPhoto(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Receipt submission
  const handleAddReceiptItem = () => {
    setReceiptItems(prev => [...prev, { materialId: materials[0]?.Ma_nvl || '', quantity: 10, price: 30000 }]);
  };

  const handleRemoveReceiptItem = (index: number) => {
    setReceiptItems(prev => prev.filter((_, i) => i !== index));
  };

  const handleReceiptItemChange = (index: number, field: 'materialId' | 'quantity' | 'price', value: string) => {
    setReceiptItems(prev => prev.map((item, i) => {
      if (i === index) {
        return {
          ...item,
          [field]: field === 'materialId' ? value : Number(value)
        };
      }
      return item;
    }));
  };

  const handleSubmitReceipt = (e: React.FormEvent) => {
    e.preventDefault();
    setReceiptSuccess('');
    setReceiptError('');

    if (!shipper.trim()) {
      setReceiptError('Vui lòng nhập tên người giao hàng!');
      return;
    }

    if (receiptItems.length === 0) {
      setReceiptError('Vui lòng thêm ít nhất một nguyên vật liệu nhận kho!');
      return;
    }

    if (!uploadedPhoto) {
      setReceiptError('QUY TRÌNH BẮT BUỘC: Bạn phải tải lên ảnh chụp Đơn nhập kho / Biên nhận trước khi thêm!');
      return;
    }

    const response = addImportReceipt({
      shipper,
      note: receiptNote,
      anhDonNhap: uploadedPhoto,
      items: receiptItems
    });

    if (response.success) {
      setReceiptSuccess('Đã lập đơn nhập kho và cộng số lượng tồn kho vật tư thành công!');
      // Reset form
      setShipper('');
      setReceiptNote('');
      setUploadedPhoto(null);
      setReceiptItems([{ materialId: materials[0]?.Ma_nvl || '', quantity: 10, price: 50000 }]);
    } else {
      setReceiptError(response.error || 'Nhập kho thất bại.');
    }
  };

  // Stock edit submission
  const startEditingMaterial = (mat: RawMaterial) => {
    setEditingMatId(mat.Ma_nvl);
    setEditMinStock(mat.Ton_kho_toi_thieu);
    setEditMaxStock(mat.Ton_kho_toi_da);
  };

  const handleSaveStockLimits = (mat: RawMaterial) => {
    setStockSuccess('');
    if (editMinStock >= editMaxStock) {
      alert('Ngưỡng tồn tối thiểu quy định phải luôn nhỏ hơn ngưỡng tồn tối đa!');
      return;
    }

    const updated: RawMaterial = {
      ...mat,
      Ton_kho_toi_thieu: editMinStock,
      Ton_kho_toi_da: editMaxStock
    };

    const isOk = updateMaterial(updated);
    if (isOk) {
      setStockSuccess(`Đã chỉnh định mức tồn kho cho "${mat.Ten_nvl}" thành công!`);
      setEditingMatId(null);
    }
  };

  // Manual adjust submission
  const selectedAdjustMaterial = materials.find(m => m.Ma_nvl === adjustMatId);
  const adjustCurrentStock = selectedAdjustMaterial ? selectedAdjustMaterial.Ton_kho_hien_tai : 0;
  const adjustComputedNew = adjustCurrentStock + adjustAmount;

  const handleManualAdjustSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAdjustSuccessMsg('');
    setAdjustErrorMsg('');

    if (!adjustMatId) {
      setAdjustErrorMsg('Hãy lựa chọn nguyên liệu.');
      return;
    }

    if (adjustAmount === 0) {
      setAdjustErrorMsg('Số lượng tăng giảm cân đối phải khác 0.');
      return;
    }

    if (!adjustReason.trim()) {
      setAdjustErrorMsg('Quy tắc kho bắt buộc: Vui lòng lựa chọn lý do cân đối!');
      return;
    }

    const res = adjustInventory(adjustMatId, adjustAmount, `${adjustReason}${adjustNote ? ' - Ghi chú: ' + adjustNote : ''}`);
    if (res.success) {
      setAdjustSuccessMsg(`Điều chỉnh thành công vật tư "${selectedAdjustMaterial?.Ten_nvl}". Lượng tồn mới khớp ca: ${adjustComputedNew.toLocaleString()} ${selectedAdjustMaterial?.Don_vi_tinh}`);
      setAdjustAmount(0);
      setAdjustReason('');
      setAdjustNote('');
    } else {
      setAdjustErrorMsg(res.error || 'Cân đối kho thất bại.');
    }
  };

  // Group transaction details or make a bar chart of top materials transacted
  const matTxCounts: { [key: string]: { nhap: number; xuat: number; name: string } } = {};
  
  (inventoryTransactions || []).forEach(tx => {
    const mat = materials.find(m => m.Ma_nvl === tx.materialId);
    const matName = mat ? mat.Ten_nvl : tx.materialId;
    if (!matTxCounts[tx.materialId]) {
      matTxCounts[tx.materialId] = { nhap: 0, xuat: 0, name: matName };
    }
    if (tx.transactionType === 'NHAP') {
      matTxCounts[tx.materialId].nhap += tx.quantity;
    } else {
      matTxCounts[tx.materialId].xuat += tx.quantity;
    }
  });

  const chartData = Object.values(matTxCounts)
    .map(d => ({
      name: d.name,
      nhap: d.nhap,
      xuat: d.xuat,
      total: d.nhap + d.xuat
    }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 5); // top 5 materials

  // SVG Chart Dimensions
  const chartWidth = 500;
  const chartHeight = 220;
  const padding = 40;
  const graphWidth = chartWidth - padding * 2;
  const graphHeight = chartHeight - padding * 2;

  // Find max value for scale
  const maxVal = Math.max(...chartData.map(d => Math.max(d.nhap, d.xuat)), 10);

  return (
    <div className="space-y-6 text-sm" id="warehouse-view-dashboard">
      
      {/* Upper Brand Card */}
      <div className="flex justify-between items-center bg-white p-5 rounded-2xl border border-gray-150 shadow-sm" id="warehouse-header">
        <div>
          <h2 className="text-xl font-display font-bold text-gray-800 tracking-wide">Quản Lý Kho & Nhập Hàng</h2>
          <p className="text-xs text-gray-400 mt-1 uppercase tracking-widest font-mono">Hệ thống Cân đối mật thiết Gia Khánh</p>
        </div>
        <div className="flex bg-gray-100 p-1 rounded-xl text-xs font-bold border border-gray-200">
          <button
            onClick={() => setActiveSubTab('import')}
            className={`px-4 py-2 rounded-lg transition-all cursor-pointer ${
              activeSubTab === 'import' ? 'bg-[#EE3124] text-white' : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            Nhập kho & Hoá đơn
          </button>
          <button
            onClick={() => setActiveSubTab('min_stock')}
            className={`px-4 py-2 rounded-lg transition-all cursor-pointer ${
              activeSubTab === 'min_stock' ? 'bg-[#EE3124] text-white' : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            Định mức Tồn tối thiểu
          </button>
          <button
            onClick={() => setActiveSubTab('adjust')}
            className={`px-4 py-2 rounded-lg transition-all cursor-pointer ${
              activeSubTab === 'adjust' ? 'bg-[#EE3124] text-white' : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            Cân đối thủ công
          </button>
          <button
            onClick={() => setActiveSubTab('history')}
            className={`px-4 py-2 rounded-lg transition-all cursor-pointer ${
              activeSubTab === 'history' ? 'bg-[#EE3124] text-white' : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            Lịch sử biến động
          </button>
        </div>
      </div>

      {/* SUB-TAB 1: NHẬP VẬT TƯ & LỊCH SỬ BIÊN LAI */}
      {activeSubTab === 'import' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="warehouse-import-workspace">
          
          {/* Lập phiếu biên lai mới */}
          <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-gray-150 shadow-sm space-y-5" id="receipt-form-card">
            <h3 className="font-bold text-gray-800 text-xs uppercase tracking-wider flex items-center space-x-2 border-b pb-3 border-gray-100">
              <FileText size={15} className="text-[#EE3124]" />
              <span>Lập Biên Bản Nhận Kho Mới</span>
            </h3>

            {receiptSuccess && (
              <div className="p-3 bg-green-50 border-l-4 border-green-600 text-green-800 text-xs rounded-r-lg" id="receipt-success-msg">
                {receiptSuccess}
              </div>
            )}

            {receiptError && (
              <div className="p-3 bg-red-50 border-l-4 border-red-600 text-red-800 text-xs rounded-r-lg" id="receipt-error-msg">
                {receiptError}
              </div>
            )}

            <form onSubmit={handleSubmitReceipt} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-widest mb-2">Người Giao hàng *</label>
                  <input
                    type="text"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:border-[#EE3124] font-medium"
                    placeholder="Vd: Nguyễn Văn Chiến (Hải Sản Sạch)"
                    value={shipper}
                    onChange={e => setShipper(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-widest mb-2">Ghi chú bổ sung</label>
                  <input
                    type="text"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:border-[#EE3124]"
                    placeholder="Vd: Nấm đùi gà còn nguyên hộp..."
                    value={receiptNote}
                    onChange={e => setReceiptNote(e.target.value)}
                  />
                </div>
              </div>

              {/* DYNAMIC MATERIALS CONTAINER */}
              <div className="space-y-3">
                <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider">Danh sách nguyên liệu tiếp nhận</label>
                {receiptItems.map((item, idx) => (
                  <div key={idx} className="flex flex-wrap sm:flex-nowrap items-center gap-3 bg-gray-50 p-3 rounded-xl border border-gray-200">
                    
                    <div className="flex-1 min-w-[150px]">
                      <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">Nguyên liệu</span>
                      <select
                        className="w-full px-2 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-semibold"
                        value={item.materialId}
                        onChange={e => handleReceiptItemChange(idx, 'materialId', e.target.value)}
                      >
                        {materials.map(m => (
                          <option key={m.Ma_nvl} value={m.Ma_nvl}>
                            {m.Ten_nvl} ({m.Don_vi_tinh})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="w-24 shrink-0">
                      <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">Số thực nhận</span>
                      <input
                        type="number"
                        className="w-full px-2 py-1 bg-white border border-gray-200 rounded-lg font-mono text-center text-xs font-bold"
                        value={item.quantity}
                        onChange={e => handleReceiptItemChange(idx, 'quantity', e.target.value)}
                      />
                    </div>

                    <div className="w-32 shrink-0">
                      <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">Đơn giá tham khảo (đ)</span>
                      <input
                        type="number"
                        className="w-full px-2 py-1 bg-white border border-gray-200 rounded-lg font-mono text-center text-xs"
                        value={item.price}
                        onChange={e => handleReceiptItemChange(idx, 'price', e.target.value)}
                      />
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRemoveReceiptItem(idx)}
                      disabled={receiptItems.length === 1}
                      className="mt-4 p-1.5 text-gray-400 hover:text-[#EE3124] border border-gray-250 rounded-lg bg-white disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}

                <button
                  type="button"
                  onClick={handleAddReceiptItem}
                  className="flex items-center space-x-1.5 px-3 py-1.5 border border-dashed border-gray-300 hover:border-[#EE3124] text-gray-500 hover:text-[#EE3124] rounded-lg transition-all text-xs font-bold cursor-pointer"
                >
                  <Plus size={13} />
                  <span>Thêm nguyên liệu vào danh sách</span>
                </button>
              </div>

              {/* IMAGE ENFORCED UPLOAD COMPONENT */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider">
                  Ảnh Chụp Đơn Nhập Kho Thực Tế * <span className="text-[#EE3124] font-semibold">(Bắt buộc để đối soát)</span>
                </label>
                
                {/* Drag zone Area */}
                <div
                  onDragOver={onDragOver}
                  onDragLeave={onDragLeave}
                  onDrop={onDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer flex flex-col items-center justify-center transition-all ${
                    uploadedPhoto 
                      ? 'border-green-500 bg-green-50/10' 
                      : isDragging 
                        ? 'border-[#EE3124] bg-red-50/10' 
                        : 'border-gray-300 hover:border-[#EE3124] hover:bg-gray-50/30'
                  }`}
                >
                  <input
                    type="file"
                    accept="image/*"
                    ref={fileInputRef}
                    className="hidden"
                    onChange={handleFileChange}
                  />

                  {uploadedPhoto ? (
                    <div className="space-y-3">
                      <div className="flex items-center justify-center space-x-2 text-green-700">
                        <CheckCircle size={18} />
                        <span className="font-bold text-xs">Đã ghi nhận ảnh hóa đơn thành công!</span>
                      </div>
                      <img 
                        src={uploadedPhoto} 
                        alt="Đơn nhập" 
                        className="max-h-36 rounded-lg border border-gray-250 mx-auto shadow-xs" 
                        referrerPolicy="no-referrer"
                      />
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setUploadedPhoto(null);
                        }}
                        className="text-[10px] text-red-600 font-bold underline hover:text-red-800"
                      >
                        Xóa ảnh và chụp lại ảnh khác
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="p-3 bg-red-50 text-[#EE3124] rounded-full inline-block">
                        <Upload size={22} />
                      </div>
                      <p className="text-xs font-bold text-gray-700">Kéo & thả ảnh chụp biên lai lẩu hoặc Nhấp để chọn file ảnh</p>
                      <p className="text-[10px] text-gray-400">Chấp nhận JPG, PNG từ máy POS hoặc camera điện thoại</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full bg-[#EE3124] hover:bg-brand-red-dark text-white font-bold py-3 px-4 rounded-xl shadow-md tracking-wider text-xs cursor-pointer transition-all uppercase"
                >
                  Xác Nhận Hóa Đơn - Lưu Biên Bản
                </button>
              </div>
            </form>
          </div>

          {/* Lịch sử biên bản hiện tại */}
          <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-gray-150 shadow-sm space-y-4" id="import-history-card">
            <h3 className="font-bold text-gray-800 text-xs uppercase tracking-wider flex items-center space-x-2 border-b pb-3 border-gray-100">
              <Boxes size={15} className="text-[#EE3124]" />
              <span>Biên Bản Nhận Gần Đây ({importReceipts.length})</span>
            </h3>

            <div className="space-y-3.5 max-h-[500px] overflow-y-auto pr-1">
              {importReceipts.map((receipt, idx) => (
                <div key={idx} className="bg-[#FAF9F6] p-4 rounded-xl border border-gray-200/60 shadow-xs relative">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[10px] bg-red-100 text-[#EE3124] font-mono px-2 py-0.5 rounded-md font-bold">
                        {receipt.Ma_bb}
                      </span>
                      <h4 className="font-bold text-xs mt-1.5 text-gray-800">
                        Giao: {receipt.Ten_nguoi_giao}
                      </h4>
                    </div>
                    <span className="font-mono text-xs font-bold text-gray-800">
                      {receipt.Tong_tien.toLocaleString()}đ
                    </span>
                  </div>

                  <p className="text-[11px] text-gray-450 mt-1 leading-relaxed">
                    Nhân viên nhận: {receipt.Ho_ten_nhan_vien} <br />
                    Lý do: <span className="italic">{receipt.Ghi_chu}</span>
                  </p>

                  <div className="mt-3 pt-2.5 border-t border-dashed border-gray-200 flex items-center justify-between">
                    <span className="text-[9px] text-gray-400 font-semibold uppercase font-mono">
                      {new Date(receipt.Ngay_nhan).toLocaleString('vi-VN')}
                    </span>

                    {receipt.Anh_don_nhap ? (
                      <a
                        href={receipt.Anh_don_nhap}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[10px] text-blue-600 font-bold hover:underline flex items-center space-x-1"
                      >
                        <ImageIcon size={10} />
                        <span>Xem ảnh hoá đơn</span>
                      </a>
                    ) : (
                      <span className="text-[9px] text-gray-400 italic">Không có ảnh đơn</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 2: QUẢN LÝ ĐỊNH MỨC TỒN TỐI THIỂU */}
      {activeSubTab === 'min_stock' && (
        <div className="bg-white p-6 rounded-2xl border border-gray-150 shadow-sm space-y-6" id="min-stock-management">
          
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b pb-4 border-gray-100">
            <div>
              <h3 className="font-bold text-gray-800 text-xs uppercase tracking-wider flex items-center space-x-2">
                <AlertTriangle size={15} className="text-[#EE3124]" />
                <span>Quy định mức tồn tối thiểu & cảnh báo tự động</span>
              </h3>
              <p className="text-[11px] text-gray-450 mt-1">Dành cho bộ phận Quản lý/Thủ kho thiết lập ngưỡng khẩn cấp để đảm bảo nguồn nguyên liệu nấu lẩu.</p>
            </div>

            {/* Simple search filter */}
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-2.5 text-gray-400" size={14} />
              <input
                type="text"
                placeholder="Tìm nguyên liệu..."
                className="w-full pl-9 pr-4 py-1.5 border border-gray-200 rounded-xl text-xs bg-gray-50 focus:bg-white"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {stockSuccess && (
            <div className="p-3 bg-green-50 border-1 border-green-200 text-green-800 text-xs rounded-xl flex items-center space-x-2 animate-bounce">
              <CheckCircle size={14} />
              <span>{stockSuccess}</span>
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-150 text-gray-400 text-[10px] uppercase font-bold tracking-wider">
                  <th className="pb-3 pt-1">Mã nguyên liệu</th>
                  <th className="pb-3 pt-1">Tên nguyên liệu</th>
                  <th className="pb-3 pt-1">Đơn vị đo</th>
                  <th className="pb-3 pt-1 text-center">Lượng tồn hiện tại</th>
                  <th className="pb-3 pt-1 text-center">Ngưỡng tối thiểu</th>
                  <th className="pb-3 pt-1 text-center">Ngưỡng tối đa</th>
                  <th className="pb-3 pt-1 text-right">Trạng thái định mức</th>
                  <th className="pb-3 pt-1 text-center">Hành động</th>
                </tr>
              </thead>
              <tbody>
                {materials
                  .filter(m => m.Ten_nvl.toLowerCase().includes(searchQuery.toLowerCase()))
                  .map((mat, idx) => {
                    const isEditing = editingMatId === mat.Ma_nvl;
                    const isUnderMinimum = mat.Ton_kho_hien_tai < mat.Ton_kho_toi_thieu;
                    
                    return (
                      <tr key={idx} className={`border-b border-gray-100 hover:bg-gray-50/50 transition ${isUnderMinimum ? 'bg-red-50/20' : ''}`}>
                        <td className="py-3 font-mono font-bold text-gray-600 text-xs">{mat.Ma_nvl}</td>
                        <td className="py-3 font-bold text-gray-800">{mat.Ten_nvl}</td>
                        <td className="py-3 text-gray-500 font-semibold text-xs">{mat.Don_vi_tinh}</td>
                        
                        <td className="py-3 text-center font-mono font-bold">
                          <span className={isUnderMinimum ? 'text-[#EE3124] px-2 py-0.5 rounded-md bg-red-100 font-extrabold animate-pulse' : 'text-gray-800'}>
                            {mat.Ton_kho_hien_tai.toLocaleString()}&nbsp;{mat.Don_vi_tinh}
                          </span>
                        </td>

                        {/* Minimum Stock Limit */}
                        <td className="py-3 text-center">
                          {isEditing ? (
                            <input
                              type="number"
                              className="w-20 px-1.5 py-0.5 bg-white border border-gray-300 rounded font-mono font-bold text-center text-xs"
                              value={editMinStock}
                              onChange={e => setEditMinStock(Number(e.target.value))}
                            />
                          ) : (
                            <span className="font-mono text-gray-600 font-bold">{mat.Ton_kho_toi_thieu.toLocaleString()}</span>
                          )}
                        </td>

                        {/* Maximum Stock Limit */}
                        <td className="py-3 text-center">
                          {isEditing ? (
                            <input
                              type="number"
                              className="w-20 px-1.5 py-0.5 bg-white border border-gray-300 rounded font-mono font-bold text-center text-xs"
                              value={editMaxStock}
                              onChange={e => setEditMaxStock(Number(e.target.value))}
                            />
                          ) : (
                            <span className="font-mono text-gray-600 font-semibold">{mat.Ton_kho_toi_da.toLocaleString()}</span>
                          )}
                        </td>

                        <td className="py-3 text-right">
                          {isUnderMinimum ? (
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-red-100 text-[#EE3124] border border-red-200 uppercase tracking-widest animate-pulse">
                              Thiếu hụt trầm trọng
                            </span>
                          ) : (
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-green-50 text-green-700 border border-green-200">
                              Đủ điều kiện phục vụ
                            </span>
                          )}
                        </td>

                        <td className="py-3 text-center">
                          {isEditing ? (
                            <button
                              onClick={() => handleSaveStockLimits(mat)}
                              className="bg-[#EE3124] hover:bg-brand-red-dark text-white p-1 rounded-md text-xs cursor-pointer flex items-center justify-center mx-auto"
                              title="Lưu ngưỡng định mức"
                            >
                              <Save size={13} />
                            </button>
                          ) : (
                            <button
                              onClick={() => startEditingMaterial(mat)}
                              className="border border-gray-250 hover:border-[#EE3124] text-xs text-gray-500 hover:text-[#EE3124] px-2.5 py-1 rounded-lg font-bold bg-white cursor-pointer"
                            >
                              Cấu hình
                            </button>
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

      {/* SUB-TAB 3: CÂN ĐỐI TỒN KHO THỦ CÔNG */}
      {activeSubTab === 'adjust' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="adjust-workspace-fields">
          <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-gray-150 shadow-sm space-y-6" id="adjust-form-card">
            <h3 className="font-bold text-gray-800 text-xs uppercase tracking-wider flex items-center space-x-2 border-b pb-3 border-gray-100">
              <ArrowRightLeft size={15} className="text-[#EE3124]" />
              <span>Biên ca cân đối kho thủ công</span>
            </h3>

            <form onSubmit={handleManualAdjustSubmit} className="space-y-4">
              {adjustErrorMsg && (
                <div className="p-3 bg-red-50 border-l-4 border-red-600 text-red-800 text-xs">
                  {adjustErrorMsg}
                </div>
              )}

              {adjustSuccessMsg && (
                <div className="p-3 bg-green-50 border-l-4 border-green-600 text-green-800 text-xs animate-pulse">
                  {adjustSuccessMsg}
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Chọn nguyên vật liệu *</label>
                <select
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 bg-white font-medium"
                  value={adjustMatId}
                  onChange={e => {
                    setAdjustMatId(e.target.value);
                    setAdjustSuccessMsg('');
                    setAdjustErrorMsg('');
                  }}
                >
                  {materials.map(m => (
                    <option key={m.Ma_nvl} value={m.Ma_nvl}>
                      {m.Ten_nvl} ({m.Don_vi_tinh})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-xl border border-dashed border-gray-200" id="adjust-calc-panel">
                <div>
                  <span className="text-[10px] text-gray-400 uppercase tracking-widest block font-bold mb-1">Tồn kho trong sổ</span>
                  <span className="text-lg font-mono font-extrabold text-[#EE3124]">
                    {adjustCurrentStock.toLocaleString()} {selectedAdjustMaterial?.Don_vi_tinh}
                  </span>
                </div>
                <div className="border-t sm:border-t-0 sm:border-l border-gray-200 pt-3 sm:pt-0 sm:pl-4">
                  <span className="text-[10px] text-gray-400 uppercase tracking-widest block font-bold mb-1">Dự thảo tồn kho sau sửa</span>
                  <span className={`text-lg font-mono font-extrabold ${adjustComputedNew < 0 ? 'text-red-500 animate-pulse' : 'text-blue-700'}`}>
                    {adjustComputedNew.toLocaleString()} {selectedAdjustMaterial?.Don_vi_tinh}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Lượng tăng / giảm *</label>
                  <div className="relative">
                    <input
                      type="number"
                      className="w-full px-3.5 py-2 rounded-xl border border-gray-200 font-mono font-bold text-center"
                      placeholder="Vd: -500 hoặc 500"
                      value={adjustAmount === 0 ? '' : adjustAmount}
                      onChange={e => setAdjustAmount(Number(e.target.value))}
                    />
                    <div className="absolute inset-y-0 right-3.5 flex items-center pointer-events-none text-xs text-gray-400 font-bold">
                      {selectedAdjustMaterial?.Don_vi_tinh}
                    </div>
                  </div>
                  <p className="text-[10px] text-gray-400 mt-1 italic">Vd: Để trừ hỏng hao hụt nhập -500.</p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Lý do cân đối kho *</label>
                  <select
                    className="w-full px-3 py-2 bg-white rounded-xl border border-gray-200 text-xs font-bold"
                    value={adjustReason}
                    onChange={e => setAdjustReason(e.target.value)}
                  >
                    <option value="">-- Lựa chọn lý do --</option>
                    <option value="Hao hụt héo hỏng tự nhiên">Hao hụt héo hỏng tự nhiên</option>
                    <option value="Thất thoát đổ vỡ bàn phục vụ">Thất thoát đổ vỡ</option>
                    <option value="Sai lệch khớp số kiểm kê ca tối">Sai lệch khớp số ca tối</option>
                    <option value="Mẫu dùng thử nghiệm">Mẫu dùng thử nghiệm</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Nội dung thuyết minh chi tiết</label>
                <textarea
                  className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-xs h-16 resize-none"
                  placeholder="Ghi nhận cụ thể để lưu log bảo lãnh..."
                  value={adjustNote}
                  onChange={e => setAdjustNote(e.target.value)}
                />
              </div>

              <div className="pt-2 flex items-center space-x-3">
                <button
                  type="submit"
                  disabled={adjustComputedNew < 0 || adjustAmount === 0}
                  className={`w-full py-3 text-white rounded-xl font-bold text-xs tracking-wider uppercase cursor-pointer ${
                    adjustComputedNew < 0 || adjustAmount === 0
                      ? 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-none'
                      : 'bg-[#EE3124] hover:bg-brand-red-dark'
                  }`}
                >
                  Ghi Nhận Chỉnh Kho
                </button>
              </div>
            </form>
          </div>

          <div className="lg:col-span-5 space-y-4" id="adjust-audit-policy">
            <div className="bg-[#FAF9F6] p-6 rounded-2xl border border-gray-200 shadow-xs space-y-4">
              <h3 className="font-display font-black text-red-900 text-xs uppercase tracking-wide flex items-center space-x-1.5 border-b pb-2.5">
                <ShieldAlert size={14} className="text-[#EE3124]" />
                <span>Kiểm soát sai lệch kho vật tư</span>
              </h3>
              <ul className="space-y-3 text-xs text-gray-600 leading-relaxed">
                <li className="flex items-start space-x-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#EE3124] mt-1.5 shrink-0"></span>
                  <span>
                    Chỉ sử dụng <strong>Cân đối thủ công</strong> khi phát hiện héo, rách hoá đơn hoặc sụt hỏng thức ăn lúc xếp lên bàn lẩu.
                  </span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#EE3124] mt-1.5 shrink-0"></span>
                  <span>
                    Mọi hành động đều tạo log vĩnh viễn trên ERP trực ca, không thể sửa xoá.
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 4: LỊCH SỬ BIÊN ĐỘNG KHO */}
      {activeSubTab === 'history' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="warehouse-history-workspace">
          {/* Chart Panel */}
          <div className="lg:col-span-5 bg-white p-5 rounded-2xl border border-gray-150 shadow-sm flex flex-col space-y-4" id="history-chart-card">
            <div>
              <h3 className="font-bold text-gray-800 text-xs uppercase tracking-wider">Thống kê lượng Nhập/Xuất kho</h3>
              <p className="text-[10px] text-gray-400 mt-0.5">Top 5 nguyên vật liệu biến động nhiều nhất (đơn vị tính tương ứng)</p>
            </div>
            
            <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 flex items-center justify-center min-h-[240px]">
              {chartData.length > 0 ? (
                <div className="w-full space-y-3">
                  <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full h-auto bg-white rounded-xl">
                    {/* Grid lines */}
                    {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
                      const y = padding + graphHeight * (1 - ratio);
                      const val = Math.round(maxVal * ratio);
                      return (
                        <g key={i}>
                          <line x1={padding} y1={y} x2={chartWidth - padding} y2={y} stroke="#f3f4f6" strokeWidth={1} />
                          <text x={padding - 8} y={y + 4} textAnchor="end" className="text-[9px] font-mono fill-gray-400 font-bold">
                            {val}
                          </text>
                        </g>
                      );
                    })}

                    {/* Bars */}
                    {chartData.map((d, idx) => {
                      const x = padding + (graphWidth / chartData.length) * idx + 10;
                      const colWidth = (graphWidth / chartData.length) - 20;
                      const barWidth = colWidth / 2 - 2;
                      
                      const nhapHeight = (d.nhap / maxVal) * graphHeight;
                      const xuatHeight = (d.xuat / maxVal) * graphHeight;
                      
                      const nhapY = padding + graphHeight - nhapHeight;
                      const xuatY = padding + graphHeight - xuatHeight;

                      return (
                        <g key={idx}>
                          {/* Nhập Bar (Green) */}
                          <rect
                            x={x}
                            y={nhapY}
                            width={barWidth}
                            height={nhapHeight}
                            fill="#16a34a"
                            rx={2}
                            className="transition-all duration-350 hover:opacity-85"
                          />
                          {/* Xuất Bar (Red) */}
                          <rect
                            x={x + barWidth + 4}
                            y={xuatY}
                            width={barWidth}
                            height={xuatHeight}
                            fill="#EE3124"
                            rx={2}
                            className="transition-all duration-350 hover:opacity-85"
                          />
                          
                          {/* Label */}
                          <text
                            x={x + colWidth / 2}
                            y={chartHeight - padding + 15}
                            textAnchor="middle"
                            className="text-[9px] font-semibold fill-gray-500"
                          >
                            {d.name.length > 10 ? d.name.substring(0, 8) + '..' : d.name}
                          </text>
                        </g>
                      );
                    })}

                    {/* Y & X Axes */}
                    <line x1={padding} y1={padding} x2={padding} y2={chartHeight - padding} stroke="#e5e7eb" strokeWidth={1.5} />
                    <line x1={padding} y1={chartHeight - padding} x2={chartWidth - padding} y2={chartHeight - padding} stroke="#e5e7eb" strokeWidth={1.5} />
                  </svg>

                  {/* Chart Legend */}
                  <div className="flex justify-center items-center space-x-6 text-[10px] font-bold">
                    <div className="flex items-center space-x-1.5">
                      <span className="w-3 h-3 bg-[#16a34a] rounded-sm"></span>
                      <span className="text-gray-600">Tổng nhập kho</span>
                    </div>
                    <div className="flex items-center space-x-1.5">
                      <span className="w-3 h-3 bg-[#EE3124] rounded-sm"></span>
                      <span className="text-gray-600">Tổng khấu hao/xuất</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-gray-400 italic text-xs">Chưa có giao dịch biến động nào.</div>
              )}
            </div>
          </div>

          {/* Transactions List */}
          <div className="lg:col-span-7 bg-white p-5 rounded-2xl border border-gray-150 shadow-sm space-y-4" id="history-list-card">
            <div>
              <h3 className="font-bold text-gray-800 text-xs uppercase tracking-wider flex items-center space-x-2">
                <ArrowRightLeft size={14} className="text-[#EE3124]" />
                <span>Nhật ký biến động chi tiết</span>
              </h3>
              <p className="text-[11px] text-gray-400 mt-0.5">Danh sách các lần xuất kho tự động và điều chỉnh thủ công ca làm việc</p>
            </div>

            <div className="overflow-x-auto rounded-xl border border-gray-150">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-gray-50 text-[10px] font-bold text-gray-400 uppercase tracking-widest border-b border-gray-200">
                    <th className="py-2.5 px-3">Thời gian</th>
                    <th className="py-2.5 px-3">Nguyên liệu</th>
                    <th className="py-2.5 px-3 text-center">Phân loại</th>
                    <th className="py-2.5 px-3 text-center">Số lượng</th>
                    <th className="py-2.5 px-3">Thuyết minh / Mã liên chiếu</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 font-medium font-mono">
                  {inventoryTransactions && inventoryTransactions.length > 0 ? (
                    inventoryTransactions.slice().reverse().map((tx) => {
                      const mat = materials.find(m => m.Ma_nvl === tx.materialId);
                      const formattedTime = new Date(tx.createdAt).toLocaleString('vi-VN');
                      
                      return (
                        <tr key={tx.id} className="hover:bg-gray-50/50">
                          <td className="py-2.5 px-3 text-[10px] text-gray-500">
                            {formattedTime}
                          </td>
                          <td className="py-2.5 px-3 font-semibold font-sans text-gray-800">
                            {mat?.Ten_nvl || tx.materialId}
                          </td>
                          <td className="py-2.5 px-3 text-center">
                            <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
                              tx.transactionType === 'NHAP' 
                                ? 'bg-green-50 text-green-700 border border-green-150' 
                                : 'bg-red-50 text-red-700 border border-red-150'
                            }`}>
                              {tx.transactionType === 'NHAP' ? 'Nhập kho' : 'Khấu hao'}
                            </span>
                          </td>
                          <td className={`py-2.5 px-3 text-center font-bold ${
                            tx.transactionType === 'NHAP' ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {tx.transactionType === 'NHAP' ? '+' : '-'}{tx.quantity.toLocaleString()} {mat?.Don_vi_tinh}
                          </td>
                          <td className="py-2.5 px-3 text-gray-500 font-sans font-light text-[11px] max-w-xs truncate" title={tx.notes}>
                            {tx.notes || tx.referenceId}
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={5} className="py-16 text-center text-gray-400 italic">
                        Chưa ghi nhận bất kỳ biến động kho nào.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
