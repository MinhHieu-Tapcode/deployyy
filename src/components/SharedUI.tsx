import React, { useEffect } from 'react';
import { 
  CheckCircle, 
  AlertCircle, 
  Info, 
  Search, 
  X, 
  Clock, 
  User, 
  Plus, 
  Minus, 
  Trash2, 
  HelpCircle, 
  Users, 
  DollarSign, 
  AlertTriangle 
} from 'lucide-react';
import { TableStatus, DishStatus, OrderItemStatus } from '../types';

// 1. Toast Notification Container and Component
export interface ToastMessage {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
  duration?: number;
}

export function ToastContainer({ toasts = [], onRemove }: { toasts?: ToastMessage[]; onRemove: (id: string) => void }) {
  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3.5 max-w-sm w-full" id="toast-cabinet">
      {(toasts || []).map(toast => (
        <ToastItem key={toast.id} toast={toast} onClose={() => onRemove(toast.id)} />
      ))}
    </div>
  );
}

function ToastItem({ toast, onClose }: { toast: ToastMessage; onClose: () => void; key?: any }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, toast.duration || 4000);
    return () => clearTimeout(timer);
  }, [toast, onClose]);

  const styles = {
    success: { bg: 'bg-green-50 border-green-200', text: 'text-green-800', icon: <CheckCircle className="text-green-600 w-5 h-5 shrink-0" /> },
    error: { bg: 'bg-red-50 border-red-200', text: 'text-red-800', icon: <AlertCircle className="text-[#EE3124] w-5 h-5 shrink-0" /> },
    info: { bg: 'bg-blue-50 border-blue-200', text: 'text-blue-800', icon: <Info className="text-blue-600 w-5 h-5 shrink-0" /> }
  }[toast.type];

  return (
    <div className={`p-4 border rounded-2xl shadow-xl flex items-start space-x-3.5 animate-in slide-in-from-bottom-5 duration-200 ${styles.bg}`}>
      {styles.icon}
      <div className="flex-1 min-w-0">
        <p className={`text-xs font-bold leading-relaxed ${styles.text}`}>{toast.message}</p>
      </div>
      <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-0.5 rounded-lg">
        <X size={14} />
      </button>
    </div>
  );
}

// 2. StatusBadge
export function StatusBadge({ status, variant }: { status: string; variant: 'table' | 'order' | 'material' }) {
  let badgeStyle = '';
  
  if (variant === 'table') {
    badgeStyle = {
      [TableStatus.TRONG]: 'bg-green-50 border-green-200 text-green-700',
      [TableStatus.CHUAN_BI]: 'bg-yellow-50 border-yellow-250 text-yellow-800',
      [TableStatus.CO_KHACH]: 'bg-red-50 border-red-200 text-[#EE3124]',
      [TableStatus.DANG_DON]: 'bg-orange-50 border-orange-200 text-orange-700',
      'BOOKED': 'bg-purple-50 border-purple-200 text-purple-700'
    }[status] || 'bg-gray-50 border-gray-200 text-gray-500';
  } else if (variant === 'order') {
    badgeStyle = {
      [OrderItemStatus.DANG_CHO]: 'bg-orange-50 border-orange-150 text-orange-700',
      [OrderItemStatus.DANG_CHE_BIEN]: 'bg-blue-50 border-blue-150 text-blue-700 animate-pulse',
      [OrderItemStatus.DA_HOAN_THANH]: 'bg-cyan-50 border-cyan-200 text-cyan-700',
      [OrderItemStatus.DA_PHUC_VU]: 'bg-green-50 border-green-200 text-green-700'
    }[status] || 'bg-gray-50 border-gray-200 text-gray-500';
  } else {
    // Material status
    badgeStyle = {
      'Đủ hàng': 'bg-green-50 border-green-200 text-green-700',
      'Sắp hết': 'bg-yellow-50 border-yellow-200 text-yellow-800 animate-pulse',
      'Hết hàng': 'bg-red-50 border-red-200 text-[#EE3124]',
      'Quá mức': 'bg-gray-100 border-gray-300 text-gray-600'
    }[status] || 'bg-gray-50 border-gray-200 text-gray-500';
  }

  return (
    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase font-mono tracking-wider border ${badgeStyle}`}>
      {status}
    </span>
  );
}

// 3. PriceDisplay
export function PriceDisplay({ amount, size = 'sm' }: { amount: number; size?: 'sm' | 'md' | 'lg' }) {
  const formatted = amount.toLocaleString('vi-VN') + 'đ';
  const sizeClasses = {
    sm: 'text-xs font-semibold',
    md: 'text-sm font-bold',
    lg: 'text-base font-black'
  }[size];

  return (
    <span className={`font-mono text-brand-red ${sizeClasses}`} id="price-board">
      {formatted}
    </span>
  );
}

// 4. ConfirmDialog
export function ConfirmDialog({ 
  isOpen, 
  title, 
  message, 
  onConfirm, 
  onCancel, 
  isDanger = false 
}: { 
  isOpen: boolean; 
  title: string; 
  message: string; 
  onConfirm: () => void; 
  onCancel: () => void; 
  isDanger?: boolean;
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
      <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-gray-100 space-y-4 animate-in zoom-in-95 duration-200">
        <div className="flex items-start space-x-3.5">
          {isDanger ? (
            <div className="p-2.5 bg-red-50 text-[#EE3124] rounded-2xl shrink-0">
              <AlertTriangle size={22} className="animate-bounce" />
            </div>
          ) : (
            <div className="p-2.5 bg-blue-50 text-blue-600 rounded-2xl shrink-0">
              <HelpCircle size={22} />
            </div>
          )}
          <div>
            <h3 className="font-display font-extrabold text-gray-900 text-sm uppercase tracking-wide">{title}</h3>
            <p className="text-xs text-gray-500 mt-1.5 leading-relaxed">{message}</p>
          </div>
        </div>

        <div className="flex justify-end space-x-2 pt-2">
          <button 
            onClick={onCancel}
            className="px-4 py-2 border border-gray-250 hover:bg-gray-100 text-gray-600 rounded-xl text-xs font-bold cursor-pointer"
          >
            Hủy bỏ
          </button>
          <button 
            onClick={onConfirm}
            className={`px-5 py-2 text-white font-extrabold text-xs rounded-xl shadow-md cursor-pointer uppercase ${
              isDanger ? 'bg-[#EE3124] hover:bg-[#C0271E]' : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            Xác nhận
          </button>
        </div>
      </div>
    </div>
  );
}

// 5. StatCard
export function StatCard({ 
  label, 
  value, 
  icon: Icon, 
  trend, 
  color = 'red' 
}: { 
  label: string; 
  value: string | number; 
  icon: React.ComponentType<any>; 
  trend?: { text: string; positive: boolean }; 
  color?: 'red' | 'blue' | 'green' | 'orange';
}) {
  const colorStyles = {
    red: 'bg-red-50 text-[#EE3124] border-red-100',
    blue: 'bg-blue-50 text-blue-600 border-blue-100',
    green: 'bg-green-50 text-green-600 border-green-100',
    orange: 'bg-orange-50 text-orange-600 border-orange-100'
  }[color];

  return (
    <div className="bg-white p-5 rounded-2xl border border-gray-150 shadow-xs flex items-start space-x-4 relative overflow-hidden group">
      <div className={`p-3.5 rounded-xl border group-hover:scale-105 transition duration-300 ${colorStyles}`}>
        <Icon size={20} />
      </div>
      <div>
        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">{label}</span>
        <span className="text-xl font-mono font-bold text-gray-900 tracking-tight block">{value}</span>
        {trend && (
          <span className={`text-[10px] font-semibold block mt-1 ${trend.positive ? 'text-green-600' : 'text-[#EE3124]'}`}>
            {trend.positive ? '↑' : '↓'} {trend.text}
          </span>
        )}
      </div>
    </div>
  );
}

// 6. SearchInput
export function SearchInput({ 
  placeholder, 
  onSearch, 
  value = '' 
}: { 
  placeholder: string; 
  onSearch: (val: string) => void;
  value?: string;
}) {
  const [inpValue, setInpValue] = React.useState(value);

  useEffect(() => {
    setInpValue(value);
  }, [value]);

  useEffect(() => {
    const handler = setTimeout(() => {
      onSearch(inpValue);
    }, 350);
    return () => clearTimeout(handler);
  }, [inpValue]);

  return (
    <div className="relative w-full">
      <Search className="absolute left-3.5 top-3.5 text-gray-400" size={16} />
      <input
        type="text"
        placeholder={placeholder}
        className="w-full pl-10 pr-9 py-3 rounded-lg border border-gray-300 text-sm bg-white font-semibold text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#EE3124] focus:ring-1 focus:ring-[#EE3124]/30 shadow-xs transition"
        value={inpValue}
        onChange={e => setInpValue(e.target.value)}
      />
      {inpValue && (
        <button
          onClick={() => setInpValue('')}
          className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600 p-0.5 rounded-full"
        >
          <X size={14} />
        </button>
      )}
    </div>
  );
}

// 7. LoadingSkeleton
export function LoadingSkeleton({ rows = 4, type = 'table' }: { rows?: number; type?: 'table' | 'card' | 'list' }) {
  return (
    <div className="space-y-4 animate-pulse w-full" id="loading-placeholder">
      {type === 'table' ? (
        <div className="border border-gray-200 rounded-2xl overflow-hidden bg-white">
          <div className="bg-gray-50 h-10 border-b border-gray-200"></div>
          {Array.from({ length: rows }).map((_, i) => (
            <div key={i} className="flex justify-between items-center p-4 border-b border-gray-100">
              <div className="h-4 bg-gray-200 rounded w-1/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/5"></div>
              <div className="h-4 bg-gray-200 rounded w-1/6"></div>
              <div className="h-4 bg-gray-200 rounded w-12"></div>
            </div>
          ))}
        </div>
      ) : type === 'card' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: rows }).map((_, i) => (
            <div key={i} className="bg-white p-5 rounded-2xl border border-gray-150 h-32 flex flex-col justify-between">
              <div className="h-5 bg-gray-200 rounded w-2/3"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              <div className="h-3 bg-gray-100 rounded w-full"></div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {Array.from({ length: rows }).map((_, i) => (
            <div key={i} className="p-3 bg-white border border-gray-150 rounded-xl flex items-center justify-between">
              <div className="flex items-center space-x-3 w-2/3">
                <div className="w-10 h-10 bg-gray-200 rounded-lg shrink-0"></div>
                <div className="space-y-1.5 flex-1">
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-3 bg-gray-100 rounded w-2/3"></div>
                </div>
              </div>
              <div className="h-5 bg-gray-200 rounded w-16"></div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// 8. EmptyState
export function EmptyState({ 
  icon: Icon = Info, 
  message = 'Không tìm thấy dữ liệu phù hợp.', 
  actionLabel, 
  onAction 
}: { 
  icon?: React.ComponentType<any>; 
  message?: string; 
  actionLabel?: string; 
  onAction?: () => void;
}) {
  return (
    <div className="py-12 px-6 bg-white border border-gray-150 rounded-2xl text-center flex flex-col items-center justify-center space-y-3.5 shadow-xs max-w-lg mx-auto" id="empty-state-canvas">
      <div className="p-4 bg-gray-50 text-gray-400 rounded-full border border-gray-100">
        <Icon size={36} className="opacity-80" />
      </div>
      <p className="text-gray-500 font-semibold text-xs leading-relaxed max-w-xs">{message}</p>
      {actionLabel && onAction && (
        <button 
          onClick={onAction}
          className="px-4 py-2 bg-[#EE3124] hover:bg-[#C0271E] text-white text-xs font-black uppercase tracking-wider rounded-xl shadow-xs transition"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}

// 9. FormField
export function FormField({ 
  label, 
  error, 
  required = false, 
  children 
}: { 
  label: string; 
  error?: string; 
  required?: boolean; 
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col space-y-1 text-left w-full">
      <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">
        {label} {required && <span className="text-[#EE3124] font-black">*</span>}
      </label>
      {children}
      {error && (
        <span className="text-[10px] font-bold text-[#EE3124] mt-0.5">{error}</span>
      )}
    </div>
  );
}

// 10. TableCard
export function TableCard({ 
  table, 
  simStatus, 
  booking, 
  session, 
  onClick 
}: { 
  table: any; 
  simStatus: string; 
  booking?: any; 
  session?: any; 
  onClick: () => void;
}) {
  let cardStyle = '';
  let badgeText = '';
  let indicatorBulb = '';

  if (simStatus === 'BOOKED' && booking) {
    cardStyle = 'bg-indigo-50/50 border-indigo-400 text-indigo-950 hover:bg-indigo-50';
    badgeText = `Lịch: ${booking.Gio_dat}`;
    indicatorBulb = 'bg-[#7B2CBF] scale-[1.1] animate-pulse';
  } else if (simStatus === TableStatus.CO_KHACH) {
    cardStyle = 'bg-[#EE3124] text-white hover:bg-[#C0271E] border-[#EE3124]';
    badgeText = 'Đang sử dụng';
    indicatorBulb = 'bg-white block animate-pulse';
  } else if (simStatus === TableStatus.DANG_DON) {
    cardStyle = 'bg-orange-50/70 text-orange-950 hover:bg-orange-50 border-orange-300';
    badgeText = 'Lau dọn';
    indicatorBulb = 'bg-orange-500';
  } else if (simStatus === TableStatus.CHUAN_BI) {
    cardStyle = 'bg-yellow-50/80 text-yellow-950 hover:bg-yellow-50 border-yellow-300';
    badgeText = 'Chuẩn bị';
    indicatorBulb = 'bg-yellow-500';
  } else {
    // Normal Available state
    cardStyle = 'bg-[#E8F5E9] hover:bg-[#C8E6C9] border-emerald-300 text-emerald-900';
    badgeText = 'Trống';
    indicatorBulb = 'bg-emerald-500';
  }

  // Calculate bill total if active
  const orderTotal = session && session.orderTotal ? session.orderTotal : 0;

  return (
    <button
      onClick={onClick}
      className={`w-full p-4 rounded-2xl border-2 text-left h-36 flex flex-col justify-between transition-all duration-200 hover:shadow-lg cursor-pointer select-none relative ${cardStyle}`}
      id={`table-trigger-${table.Ma_ban}`}
    >
      <div className="flex justify-between items-start w-full">
        <div>
          <h4 className="font-display font-black text-base tracking-tight leading-none block">{table.Ma_ban}</h4>
          <span className={`text-[8px] font-bold block mt-1 px-1.5 py-0.5 rounded uppercase font-mono tracking-wider border max-w-fit ${
            simStatus === TableStatus.CO_KHACH
              ? 'bg-white/20 border-white/40 text-white'
              : 'bg-black/5 border-black/10 text-gray-500'
          }`}>
            Sức chứa: {table.Suc_chua} ghế
          </span>
        </div>

        <div className="flex items-center shrink-0">
          <span className={`w-2.5 h-2.5 rounded-full ring-2 ring-white/10 ${indicatorBulb}`}></span>
        </div>
      </div>

      <div className="my-1 truncate text-[10px] leading-relaxed">
        {booking ? (
          <div>
            <p className="font-bold truncate">Khách: {booking.Ten_khach_hang}</p>
            <p className="font-mono text-[9px] opacity-75">{booking.So_dien_thoai}</p>
          </div>
        ) : session ? (
          <div className="space-y-1">
            <div className="flex justify-between font-bold">
              <span>Khách: {session.So_khach || 4} người</span>
              <span>Vào: {new Date(session.Thoi_gian_bat_dau).toLocaleTimeString('vi-VN', {hour: '2-digit', minute:'2-digit'})}</span>
            </div>
            <div className="flex justify-between items-center text-[10px] mt-0.5">
              <span className="opacity-90 truncate">Mã: {session.Ma_phien_code}</span>
              <span className="font-mono font-black">Tạm tính: {orderTotal.toLocaleString()}đ</span>
            </div>
          </div>
        ) : (
          <p className="font-sans italic opacity-75 font-semibold">Bàn lẩu khả dụng</p>
        )}
      </div>

      <div className="border-t border-black/5 pt-1 flex justify-between items-center text-[9px] font-black uppercase font-mono tracking-wider">
        <span className="opacity-95">{badgeText}</span>
        <span className="opacity-60 text-[8px]">Tầng {table.Tang}</span>
      </div>
    </button>
  );
}

// 11. DishCard
export function DishCard({ 
  dish, 
  mode, 
  onAdd, 
  onEdit 
}: { 
  dish: any; 
  mode: 'menu' | 'order'; 
  onAdd?: () => void; 
  onEdit?: () => void;
}) {
  const isOutOfStock = dish.Trang_thai === DishStatus.HET_MON || dish.Trang_thai === DishStatus.NGUNG_PHUC_VU;

  return (
    <div className={`bg-white rounded-2xl border border-gray-150 p-4 flex space-x-3.5 shadow-xs relative overflow-hidden transition hover:shadow-md ${
      isOutOfStock ? 'opacity-65' : 'group'
    }`}>
      <div className="w-20 h-20 rounded-xl overflow-hidden border border-gray-100 bg-gray-50 shrink-0 shadow-inner">
        <img
          src={dish.Anh_mon}
          alt={dish.Ten_mon}
          className="w-full h-full object-cover group-hover:scale-105 transition duration-350"
          referrerPolicy="no-referrer"
        />
      </div>

      <div className="flex-1 flex flex-col justify-between min-w-0">
        <div>
          <h4 className="font-bold text-gray-850 text-xs truncate leading-snug">{dish.Ten_mon}</h4>
          <p className="text-[9px] text-gray-400 mt-1 truncate max-w-[200px] font-light">
            {dish.Mo_ta || 'Hương vị nấm lẩu rừng tự nhiên.'}
          </p>
        </div>

        <div className="flex justify-between items-end mt-2">
          <PriceDisplay amount={dish.Don_gia} size="sm" />
          
          {isOutOfStock ? (
            <span className="px-2 py-0.5 bg-yellow-50 text-yellow-700 text-[8px] font-bold uppercase rounded border border-yellow-250 animate-pulse">
              Hết món
            </span>
          ) : mode === 'order' && onAdd ? (
            <button
              onClick={onAdd}
              className="w-7 h-7 bg-brand-red group-hover:bg-brand-red-dark text-white rounded-full flex items-center justify-center shadow-md cursor-pointer hover:scale-110 active:scale-95"
            >
              <Plus size={14} />
            </button>
          ) : onEdit ? (
            <button
              onClick={onEdit}
              className="text-xs text-blue-600 font-bold hover:underline cursor-pointer"
            >
              Sửa thực đơn
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}

// 12. OrderItemRow
export function OrderItemRow({ 
  item, 
  dishName, 
  onStatusChange, 
  showActions = true 
}: { 
  item: any; 
  dishName: string; 
  onStatusChange?: (nextStatus: OrderItemStatus) => void;
  showActions?: boolean;
  key?: any;
}) {
  // Calculate elapsed time
  const elapsedMins = Math.floor((Date.now() - new Date(item.Thoi_gian_dat).getTime()) / 60000);
  const isDelayed = (item.Trang_thai_mon === OrderItemStatus.DANG_CHO || item.Trang_thai_mon === OrderItemStatus.DANG_CHE_BIEN) && elapsedMins > 15;

  return (
    <div className={`p-4 bg-white border rounded-2xl shadow-xs transition duration-150 ${
      isDelayed ? 'border-red-400 bg-red-50/20' : 'border-gray-150 hover:border-gray-200'
    }`} id={`order-item-${item.Ma_detail_id}`}>
      <div className="flex justify-between items-start">
        <span className="text-xs font-black uppercase text-gray-800 bg-gray-100 px-2 py-0.5 rounded-lg border border-gray-200">
          Bàn {item.Ma_hd_dat_mon.split('_')[1]}
        </span>
        <div className="text-[9px] font-mono text-gray-400 font-bold flex items-center space-x-1">
          <Clock size={10} className={isDelayed ? 'text-[#EE3124] animate-spin' : ''} />
          <span className={isDelayed ? 'text-[#EE3124] font-black' : ''}>{elapsedMins} phút</span>
          {isDelayed && <span className="bg-[#EE3124] text-white px-1.5 py-0.5 rounded text-[8px] animate-pulse">TRỄ</span>}
        </div>
      </div>

      <div className="mt-3.5 space-y-1">
        <h4 className="font-bold text-xs text-gray-850 truncate">{dishName}</h4>
        <div className="flex justify-between items-center text-xs pt-1">
          <span className="text-brand-red font-mono font-bold">Số lượng: x{item.So_luong}</span>
          <span className="font-mono text-gray-500 font-semibold">{item.Don_gia_tai_thoi_diem.toLocaleString()}đ</span>
        </div>
        {item.Ghi_chu && (
          <p className="p-1.5 border-l-2 border-red-500 text-[10px] text-red-900 bg-red-50/50 mt-2 italic rounded-r-lg truncate">
            Lưu ý: {item.Ghi_chu}
          </p>
        )}
      </div>

      {showActions && onStatusChange && (
        <div className="mt-4 pt-3 border-t border-dashed border-gray-100">
          {item.Trang_thai_mon === OrderItemStatus.DANG_CHO && (
            <button
              onClick={() => onStatusChange(OrderItemStatus.DANG_CHE_BIEN)}
              className="w-full py-2 bg-orange-500 hover:bg-orange-600 text-white font-extrabold text-[10px] rounded-xl tracking-wider flex items-center justify-center space-x-1.5 cursor-pointer uppercase shadow-xs active:scale-95"
            >
              <Plus size={11} />
              <span>Duyệt nấu / Trừ kho</span>
            </button>
          )}
          {item.Trang_thai_mon === OrderItemStatus.DANG_CHE_BIEN && (
            <button
              onClick={() => onStatusChange(OrderItemStatus.DA_HOAN_THANH)}
              className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-[10px] rounded-xl tracking-wider flex items-center justify-center space-x-1.5 cursor-pointer uppercase shadow-xs active:scale-95"
            >
              <CheckCircle size={11} />
              <span>Hoàn thành món nấu</span>
            </button>
          )}
          {item.Trang_thai_mon === OrderItemStatus.DA_HOAN_THANH && (
            <button
              onClick={() => onStatusChange(OrderItemStatus.DA_PHUC_VU)}
              className="w-full py-2 bg-green-600 hover:bg-green-700 text-white font-extrabold text-[10px] rounded-xl tracking-wider flex items-center justify-center space-x-1.5 cursor-pointer uppercase shadow-xs active:scale-95"
            >
              <CheckCircle size={11} />
              <span>Xác nhận đã phục vụ</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
}
