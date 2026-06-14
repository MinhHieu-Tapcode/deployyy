/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  TableStatus,
  DishStatus,
  OrderItemStatus,
  UserRole,
  DiningTable,
  Customer,
  Session,
  Category,
  Dish,
  RecipeItem,
  Order,
  OrderDetail,
  RawMaterial,
  ImportReceipt,
  ImportReceiptDetail,
  Employee,
  SystemLog,
  TableReservation,
} from '../types';

interface RestaurantContextType {
  tables: DiningTable[];
  customers: Customer[];
  sessions: Session[];
  categories: Category[];
  dishes: Dish[];
  recipes: RecipeItem[];
  orders: Order[];
  orderDetails: OrderDetail[];
  materials: RawMaterial[];
  importReceipts: ImportReceipt[];
  employees: Employee[];
  logs: SystemLog[];
  reservations: TableReservation[];
  currentRole: UserRole;
  setCurrentRole: (role: UserRole) => void;
  currentUser: Employee | null;
  setCurrentUser: (user: Employee | null) => void;
  selectedTableId: string | null;
  setSelectedTableId: (id: string | null) => void;
  customerSession: {
    phoneNumber: string;
    tableId: string;
    sessionId: string;
    sessionCode: string;
  } | null;
  setCustomerSession: (session: any) => void;
  // Actions
  login: (username: string, pass: string) => Employee | null;
  logout: () => void;
  activateTable: (tableId: string) => void; // Transition Trống -> Đang chuẩn bị
  deactivateTable: (tableId: string) => void; // Transition -> Trống
  startTableSession: (tableId: string, phone: string, existingCode?: string) => string; // Transition Đang chuẩn bị -> Có khách, creates session
  placeCustomerOrder: (tableId: string, cartItems: { dishId: string; quantity: number; notes: string }[]) => string;
  updateOrderItemStatus: (detailId: string, newStatus: OrderItemStatus) => { success: boolean; error?: string };
  addEmployee: (emp: Omit<Employee, 'Ma_nhan_vien'>) => void;
  updateEmployee: (emp: Employee) => void;
  deleteEmployee: (id: string) => void;
  addDish: (dish: Omit<Dish, 'Ma_mon'>) => boolean;
  updateDish: (dish: Dish) => boolean;
  deleteDish: (id: string) => void;
  updateRecipe: (dishId: string, newRecipe: RecipeItem[]) => void;
  addCategory: (cat: Category) => void;
  updateCategory: (cat: Category) => void;
  deleteCategory: (id: string) => void;
  adjustInventory: (materialId: string, amount: number, reason: string) => { success: boolean; error?: string };
  addNewMaterial: (material: RawMaterial) => void;
  updateMaterial: (material: RawMaterial) => boolean;
  addImportReceipt: (receipt: { shipper: string; note: string; anhDonNhap?: string; items: { materialId: string; quantity: number; price: number }[] }) => { success: boolean; error?: string };
  logSystemAction: (action: string, changeDetails: string) => void;
  closeSessionAndPay: (sessionId: string) => void; // Transitions Có khách -> Đang dọn, then to Trống
  setTableStatusManual: (tableId: string, status: TableStatus) => void;
  addReservation: (res: Omit<TableReservation, 'Ma_dat_ban'>) => void;
  updateReservationStatus: (resId: string, status: 'Chờ đến' | 'Đã nhận phiên' | 'Đã hủy') => void;
  updateOrderInvoice: (orderId: string, imageBase64: string) => void;
}

export function playNotificationSound(type: 'new_order' | 'ready_dish') {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    
    if (type === 'new_order') {
      // Elegant musical chime (C5 -> E5 -> G5)
      const playTone = (freq: number, start: number, duration: number) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.setValueAtTime(freq, start);
        gain.gain.setValueAtTime(0.12, start);
        gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
        osc.start(start);
        osc.stop(start + duration);
      };
      playTone(523.25, ctx.currentTime, 0.4); // C5
      playTone(659.25, ctx.currentTime + 0.12, 0.4); // E5
      playTone(783.99, ctx.currentTime + 0.24, 0.6); // G5
    } else {
      // Double sharp bell hit (A5 -> A5)
      const playTone = (freq: number, start: number, duration: number) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.setValueAtTime(freq, start);
        gain.gain.setValueAtTime(0.15, start);
        gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
        osc.start(start);
        osc.stop(start + duration);
      };
      playTone(880.00, ctx.currentTime, 0.25); // A5
      playTone(880.00, ctx.currentTime + 0.1, 0.35); // A5
    }
  } catch (e) {
    console.warn("Audio Context playback failed slightly", e);
  }
}

const RestaurantContext = createContext<RestaurantContextType | undefined>(undefined);

export function RestaurantProvider({ children }: { children: React.ReactNode }) {
  // --- STATE INITIALIZATION WITH LOCAL_STORAGE PERSISTENCE ---

  // Load state helper
  const getStored = (key: string, backup: any) => {
    try {
      const item = localStorage.getItem(`giakhanh_${key}`);
      return item ? JSON.parse(item) : backup;
    } catch {
      return backup;
    }
  };

  const [currentUser, setCurrentUser] = useState<Employee | null>(null);
  const [currentRole, setCurrentRole] = useState<UserRole>(UserRole.QUAN_LY);
  const [selectedTableId, setSelectedTableId] = useState<string | null>('B03');
  const [customerSession, setCustomerSession] = useState<any>(null);

  const [reservations, setReservations] = useState<TableReservation[]>(() => getStored('reservations', [
    {
      Ma_dat_ban: 'db_01',
      Ma_ban: 'B04',
      Ten_khach_hang: 'Nguyễn Lâm Hoàng',
      So_dien_thoai: '0388998877',
      Ngay_dat: new Date().toISOString().split('T')[0], // Today
      Gio_dat: '19:00',
      Trang_thai: 'Chờ đến'
    },
    {
      Ma_dat_ban: 'db_02',
      Ma_ban: 'B01',
      Ten_khach_hang: 'Phạm Thanh Hà',
      So_dien_thoai: '0977665544',
      Ngay_dat: new Date(Date.now() + 86400000).toISOString().split('T')[0], // Tomorrow
      Gio_dat: '18:30',
      Trang_thai: 'Chờ đến'
    }
  ]));

  const [tables, setTables] = useState<DiningTable[]>(() => {
    const defaultTables: DiningTable[] = [
      // Tầng 1
      { Ma_ban: 'B01', Tang: 1, Suc_chua: 4, Trang_thai: TableStatus.TRONG },
      { Ma_ban: 'B02', Tang: 1, Suc_chua: 4, Trang_thai: TableStatus.TRONG },
      { Ma_ban: 'B03', Tang: 1, Suc_chua: 4, Trang_thai: TableStatus.TRONG },
      { Ma_ban: 'B04', Tang: 1, Suc_chua: 6, Trang_thai: TableStatus.CO_KHACH }, // B03(6) active 00:45
      { Ma_ban: 'B05', Tang: 1, Suc_chua: 4, Trang_thai: TableStatus.TRONG },
      { Ma_ban: 'B06', Tang: 1, Suc_chua: 4, Trang_thai: TableStatus.TRONG },
      { Ma_ban: 'B07', Tang: 1, Suc_chua: 4, Trang_thai: TableStatus.TRONG },
      { Ma_ban: 'B08', Tang: 1, Suc_chua: 4, Trang_thai: TableStatus.TRONG },
      { Ma_ban: 'B09', Tang: 1, Suc_chua: 8, Trang_thai: TableStatus.CO_KHACH }, // B08(8) active 01:30
      { Ma_ban: 'B10', Tang: 1, Suc_chua: 6, Trang_thai: TableStatus.TRONG }, // B10(6) green
      { Ma_ban: 'B11', Tang: 1, Suc_chua: 4, Trang_thai: TableStatus.TRONG }, // B11(4) green
      { Ma_ban: 'B12', Tang: 1, Suc_chua: 4, Trang_thai: TableStatus.TRONG },
      { Ma_ban: 'B13', Tang: 1, Suc_chua: 4, Trang_thai: TableStatus.TRONG },
      { Ma_ban: 'B14', Tang: 1, Suc_chua: 4, Trang_thai: TableStatus.CO_KHACH }, // B13(4) active 09:15
      
      // Tầng 2
      { Ma_ban: 'B15', Tang: 2, Suc_chua: 4, Trang_thai: TableStatus.TRONG },
      { Ma_ban: 'B16', Tang: 2, Suc_chua: 4, Trang_thai: TableStatus.TRONG },
      { Ma_ban: 'B17', Tang: 2, Suc_chua: 4, Trang_thai: TableStatus.TRONG },
      { Ma_ban: 'B18', Tang: 2, Suc_chua: 6, Trang_thai: TableStatus.CO_KHACH },
      { Ma_ban: 'B19', Tang: 2, Suc_chua: 4, Trang_thai: TableStatus.TRONG },
      { Ma_ban: 'B20', Tang: 2, Suc_chua: 4, Trang_thai: TableStatus.TRONG },
      { Ma_ban: 'B21', Tang: 2, Suc_chua: 4, Trang_thai: TableStatus.TRONG },
      { Ma_ban: 'B22', Tang: 2, Suc_chua: 4, Trang_thai: TableStatus.TRONG },
      { Ma_ban: 'B23', Tang: 2, Suc_chua: 8, Trang_thai: TableStatus.CO_KHACH },
      { Ma_ban: 'B24', Tang: 2, Suc_chua: 4, Trang_thai: TableStatus.TRONG },
      { Ma_ban: 'B25', Tang: 2, Suc_chua: 6, Trang_thai: TableStatus.TRONG },
      { Ma_ban: 'B26', Tang: 2, Suc_chua: 4, Trang_thai: TableStatus.TRONG },
      { Ma_ban: 'B27', Tang: 2, Suc_chua: 4, Trang_thai: TableStatus.TRONG },
      { Ma_ban: 'B28', Tang: 2, Suc_chua: 4, Trang_thai: TableStatus.CO_KHACH },

      // Tầng 3
      { Ma_ban: 'B29', Tang: 3, Suc_chua: 4, Trang_thai: TableStatus.TRONG },
      { Ma_ban: 'B30', Tang: 3, Suc_chua: 4, Trang_thai: TableStatus.TRONG },
      { Ma_ban: 'B31', Tang: 3, Suc_chua: 4, Trang_thai: TableStatus.TRONG },
      { Ma_ban: 'B32', Tang: 3, Suc_chua: 6, Trang_thai: TableStatus.TRONG },
      { Ma_ban: 'B33', Tang: 3, Suc_chua: 4, Trang_thai: TableStatus.TRONG },
      { Ma_ban: 'B34', Tang: 3, Suc_chua: 4, Trang_thai: TableStatus.TRONG },
      { Ma_ban: 'B35', Tang: 3, Suc_chua: 4, Trang_thai: TableStatus.TRONG },
      { Ma_ban: 'B36', Tang: 3, Suc_chua: 4, Trang_thai: TableStatus.TRONG },
      { Ma_ban: 'B37', Tang: 3, Suc_chua: 8, Trang_thai: TableStatus.TRONG },
      { Ma_ban: 'B38', Tang: 3, Suc_chua: 4, Trang_thai: TableStatus.TRONG },
      { Ma_ban: 'B39', Tang: 3, Suc_chua: 6, Trang_thai: TableStatus.TRONG },
      { Ma_ban: 'B40', Tang: 3, Suc_chua: 4, Trang_thai: TableStatus.TRONG },
      { Ma_ban: 'B41', Tang: 3, Suc_chua: 4, Trang_thai: TableStatus.TRONG },
      { Ma_ban: 'B42', Tang: 3, Suc_chua: 4, Trang_thai: TableStatus.TRONG },

      // Tầng 4
      { Ma_ban: 'B43', Tang: 4, Suc_chua: 4, Trang_thai: TableStatus.TRONG },
      { Ma_ban: 'B44', Tang: 4, Suc_chua: 4, Trang_thai: TableStatus.TRONG },
      { Ma_ban: 'B45', Tang: 4, Suc_chua: 4, Trang_thai: TableStatus.TRONG },
      { Ma_ban: 'B46', Tang: 4, Suc_chua: 6, Trang_thai: TableStatus.TRONG },
      { Ma_ban: 'B47', Tang: 4, Suc_chua: 4, Trang_thai: TableStatus.TRONG },
      { Ma_ban: 'B48', Tang: 4, Suc_chua: 4, Trang_thai: TableStatus.TRONG },
      { Ma_ban: 'B49', Tang: 4, Suc_chua: 4, Trang_thai: TableStatus.TRONG },
      { Ma_ban: 'B50', Tang: 4, Suc_chua: 4, Trang_thai: TableStatus.TRONG },
      { Ma_ban: 'B51', Tang: 4, Suc_chua: 8, Trang_thai: TableStatus.TRONG },
      { Ma_ban: 'B52', Tang: 4, Suc_chua: 4, Trang_thai: TableStatus.TRONG },
      { Ma_ban: 'B53', Tang: 4, Suc_chua: 6, Trang_thai: TableStatus.TRONG },
      { Ma_ban: 'B54', Tang: 4, Suc_chua: 4, Trang_thai: TableStatus.TRONG },
      { Ma_ban: 'B55', Tang: 4, Suc_chua: 4, Trang_thai: TableStatus.TRONG },
      { Ma_ban: 'B56', Tang: 4, Suc_chua: 4, Trang_thai: TableStatus.TRONG }
    ];

    const stored = localStorage.getItem('giakhanh_tables');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (parsed.length < 56 || !parsed.some((x: any) => x.Ma_ban === 'B14')) {
          localStorage.setItem('giakhanh_tables', JSON.stringify(defaultTables));
          return defaultTables;
        }
      } catch (e) {}
    }
    const rawTables = getStored('tables', defaultTables);
    return rawTables.map((t: DiningTable) => {
      if (t.Trang_thai === TableStatus.CHUAN_BI || t.Trang_thai === TableStatus.DANG_DON) {
        return { ...t, Trang_thai: TableStatus.TRONG };
      }
      return t;
    });
  });

  const [customers, setCustomers] = useState<Customer[]>(() => getStored('customers', [
    { Ma_khach_hang: 'kh001', So_dien_thoai: '0912345678' },
    { Ma_khach_hang: 'kh002', So_dien_thoai: '0987654321' },
    { Ma_khach_hang: 'kh003', So_dien_thoai: '0971234567' },
  ]));

  const [categories, setCategories] = useState<Category[]>(() => getStored('categories', [
    { Ma_danh_muc: 'dm01', Ten_danh_muc: 'Lẩu', Thu_tu_hien_thi: 1, Trang_thai: 'Hiển thị' },
    { Ma_danh_muc: 'dm02', Ten_danh_muc: 'Topping', Thu_tu_hien_thi: 2, Trang_thai: 'Hiển thị' },
    { Ma_danh_muc: 'dm03', Ten_danh_muc: 'Đồ uống', Thu_tu_hien_thi: 3, Trang_thai: 'Hiển thị' },
    { Ma_danh_muc: 'dm04', Ten_danh_muc: 'Tráng miệng', Thu_tu_hien_thi: 4, Trang_thai: 'Hiển thị' },
    { Ma_danh_muc: 'dm05', Ten_danh_muc: 'Khác', Thu_tu_hien_thi: 5, Trang_thai: 'Hiển thị' },
  ]));

  const [dishes, setDishes] = useState<Dish[]>(() => getStored('dishes', [
    {
      Ma_mon: 'm01',
      Ma_danh_muc: 'dm01',
      Ten_mon: 'Lẩu Nấm Thập Cẩm',
      Don_gia: 299000,
      Mo_ta: 'Lẩu nấm thập cẩm với nhiều loại nấm tươi ngon, nước dùng thanh ngọt.',
      Anh_mon: 'https://images.unsplash.com/photo-1547928500-4722f55cc829?w=600&auto=format&fit=crop&q=60',
      Trang_thai: DishStatus.CON_PHUC_VU,
    },
    {
      Ma_mon: 'm02',
      Ma_danh_muc: 'dm01',
      Ten_mon: 'Lẩu Nấm Gà Đen',
      Don_gia: 289000,
      Mo_ta: 'Lẩu nấm kết hợp cùng Gà đen giàu dinh dưỡng, thịt gà săn chắc, nước cốt nấm đặc biệt.',
      Anh_mon: 'https://images.unsplash.com/photo-1598449356475-b9f71db7d847?w=600&auto=format&fit=crop&q=60',
      Trang_thai: DishStatus.CON_PHUC_VU,
    },
    {
      Ma_mon: 'm03',
      Ma_danh_muc: 'dm01',
      Ten_mon: 'Lẩu Nấm Hải Sản',
      Don_gia: 329000,
      Mo_ta: 'Hương vị biển cả hòa quyện cùng vị ngọt thanh của nấm rừng tự nhiên.',
      Anh_mon: 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=600&auto=format&fit=crop&q=60',
      Trang_thai: DishStatus.CON_PHUC_VU,
    },
    {
      Ma_mon: 'm04',
      Ma_danh_muc: 'dm02',
      Ten_mon: 'Ba chỉ bò Mỹ',
      Don_gia: 159000,
      Mo_ta: 'Thịt ba chỉ bò Mỹ thái lát mỏng, xen kẽ vân mỡ hoàn hảo để nhúng lẩu.',
      Anh_mon: 'https://images.unsplash.com/photo-1514516317472-f558c73c295f?w=600&auto=format&fit=crop&q=60',
      Trang_thai: DishStatus.CON_PHUC_VU,
    },
    {
      Ma_mon: 'm05',
      Ma_danh_muc: 'dm02',
      Ten_mon: 'Nấm Kim Châm',
      Don_gia: 39000,
      Mo_ta: 'Nấm kim châm tươi, giòn ngọt, thích hợp nhúng lẩu.',
      Anh_mon: 'https://images.unsplash.com/photo-1504387828639-127924548c41?w=600&auto=format&fit=crop&q=60',
      Trang_thai: DishStatus.CON_PHUC_VU,
    },
    {
      Ma_mon: 'm06',
      Ma_danh_muc: 'dm02',
      Ten_mon: 'Nấm bào ngư',
      Don_gia: 39000,
      Mo_ta: 'Nấm bào ngư tươi, vị dai bùi tinh khiết.',
      Anh_mon: 'https://images.unsplash.com/photo-1535254973040-607b474cb50d?w=600&auto=format&fit=crop&q=60',
      Trang_thai: DishStatus.CON_PHUC_VU,
    },
    {
      Ma_mon: 'm07',
      Ma_danh_muc: 'dm02',
      Ten_mon: 'Tàu hũ kỵ',
      Don_gia: 35000,
      Mo_ta: 'Tàu hũ kỵ chiên giòn, béo ngậy nhúng lẩu nấm cực hợp.',
      Anh_mon: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=60',
      Trang_thai: DishStatus.HET_MON,
    },
    {
      Ma_mon: 'm08',
      Ma_danh_muc: 'dm03',
      Ten_mon: 'Nước suối Lavie',
      Don_gia: 15000,
      Mo_ta: 'Nước suối khoáng chai 500ml mát lạnh.',
      Anh_mon: 'https://images.unsplash.com/photo-1548839140-29a749e1cf4d?w=600&auto=format&fit=crop&q=60',
      Trang_thai: DishStatus.CON_PHUC_VU,
    },
  ]));

  const [recipes, setRecipes] = useState<RecipeItem[]>(() => getStored('recipes', [
    // Lẩu Nấm Thập Cẩm (m01) recipes
    { Ma_mon: 'm01', Ma_nvl: 'nvl01', So_luong_dinh_luong: 150, Don_vi_tinh: 'g' }, // Nấm kim châm
    { Ma_mon: 'm01', Ma_nvl: 'nvl02', So_luong_dinh_luong: 100, Don_vi_tinh: 'g' }, // Nấm bào ngư
    { Ma_mon: 'm01', Ma_nvl: 'nvl03', So_luong_dinh_luong: 80, Don_vi_tinh: 'g' },  // Nấm đùi gà
    { Ma_mon: 'm01', Ma_nvl: 'nvl04', So_luong_dinh_luong: 50, Don_vi_tinh: 'g' },  // Nấm hương
    { Ma_mon: 'm01', Ma_nvl: 'nvl05', So_luong_dinh_luong: 30, Don_vi_tinh: 'g' },  // Nấm tuyết
    { Ma_mon: 'm01', Ma_nvl: 'nvl06', So_luong_dinh_luong: 200, Don_vi_tinh: 'g' }, // Đậu hũ non
    { Ma_mon: 'm01', Ma_nvl: 'nvl07', So_luong_dinh_luong: 1200, Don_vi_tinh: 'ml' }, // Nước dùng

    // Lẩu Nấm Gà Đen (m02) recipes
    { Ma_mon: 'm02', Ma_nvl: 'nvl08', So_luong_dinh_luong: 500, Don_vi_tinh: 'g' }, // Gà đen
    { Ma_mon: 'm02', Ma_nvl: 'nvl01', So_luong_dinh_luong: 100, Don_vi_tinh: 'g' },
    { Ma_mon: 'm02', Ma_nvl: 'nvl04', So_luong_dinh_luong: 50, Don_vi_tinh: 'g' },
    { Ma_mon: 'm02', Ma_nvl: 'nvl07', So_luong_dinh_luong: 1000, Don_vi_tinh: 'ml' },

    // Ba chỉ bò Mỹ (m04) recipes
    { Ma_mon: 'm04', Ma_nvl: 'nvl09', So_luong_dinh_luong: 200, Don_vi_tinh: 'g' }, // Thịt bò Mỹ

    // Nấm Kim Châm (m05) recipes
    { Ma_mon: 'm05', Ma_nvl: 'nvl01', So_luong_dinh_luong: 150, Don_vi_tinh: 'g' },

    // Nấm bào ngư (m06) recipes
    { Ma_mon: 'm06', Ma_nvl: 'nvl02', So_luong_dinh_luong: 150, Don_vi_tinh: 'g' },

    // Nước suối (m08)
    { Ma_mon: 'm08', Ma_nvl: 'nvl10', So_luong_dinh_luong: 1, Don_vi_tinh: 'chai' }, // Nước suối đóng chai
  ]));

  const [materials, setMaterials] = useState<RawMaterial[]>(() => getStored('materials', [
    { Ma_nvl: 'nvl01', Ten_nvl: 'Nấm kim châm', Don_vi_tinh: 'g', Ton_kho_hien_tai: 8200, Ton_kho_toi_thieu: 2000, Ton_kho_toi_da: 20000 },
    { Ma_nvl: 'nvl02', Ten_nvl: 'Nấm bào ngư', Don_vi_tinh: 'g', Ton_kho_hien_tai: 4000, Ton_kho_toi_thieu: 1500, Ton_kho_toi_da: 15000 },
    { Ma_nvl: 'nvl03', Ten_nvl: 'Nấm đùi gà', Don_vi_tinh: 'g', Ton_kho_hien_tai: 1200, Ton_kho_toi_thieu: 1000, Ton_kho_toi_da: 10000 }, // Warning low
    { Ma_nvl: 'nvl04', Ten_nvl: 'Nấm hương', Don_vi_tinh: 'g', Ton_kho_hien_tai: 600, Ton_kho_toi_thieu: 800, Ton_kho_toi_da: 8000 },  // Trigger Warning
    { Ma_nvl: 'nvl05', Ten_nvl: 'Nấm tuyết', Don_vi_tinh: 'g', Ton_kho_hien_tai: 1500, Ton_kho_toi_thieu: 500, Ton_kho_toi_da: 5000 },
    { Ma_nvl: 'nvl06', Ten_nvl: 'Đậu hũ non', Don_vi_tinh: 'g', Ton_kho_hien_tai: 16000, Ton_kho_toi_thieu: 2000, Ton_kho_toi_da: 15000 }, // Exceed maximum! Trigger "Quá mức"
    { Ma_nvl: 'nvl07', Ten_nvl: 'Nước dùng', Don_vi_tinh: 'ml', Ton_kho_hien_tai: 110000, Ton_kho_toi_thieu: 20000, Ton_kho_toi_da: 250000 },
    { Ma_nvl: 'nvl08', Ten_nvl: 'Gà đen', Don_vi_tinh: 'g', Ton_kho_hien_tai: 0, Ton_kho_toi_thieu: 2000, Ton_kho_toi_da: 15000 }, // Out of stock!
    { Ma_nvl: 'nvl09', Ten_nvl: 'Thịt bò Mỹ', Don_vi_tinh: 'g', Ton_kho_hien_tai: 25000, Ton_kho_toi_thieu: 5000, Ton_kho_toi_da: 50000 },
    { Ma_nvl: 'nvl10', Ten_nvl: 'Nước suối chai', Don_vi_tinh: 'chai', Ton_kho_hien_tai: 48, Ton_kho_toi_thieu: 20, Ton_kho_toi_da: 200 },
  ]));

  const [sessions, setSessions] = useState<Session[]>(() => {
    const defaultSessions = [
      {
        Ma_phien: 's_B04',
        Ma_ban: 'B04',
        Ma_khach_hang: 'kh001',
        Thoi_gian_bat_dau: new Date(Date.now() - 45 * 60000).toISOString(), // 45 mins ago
        Thoi_gian_ket_thuc: null,
        Ma_phien_code: '0987.654.321', // Show Customer Phone directly as requested for search
        Trang_thai: 'active' as const,
      },
      {
        Ma_phien: 's_B09',
        Ma_ban: 'B09',
        Ma_khach_hang: 'kh002',
        Thoi_gian_bat_dau: new Date(Date.now() - 90 * 60000).toISOString(), // 90 mins ago
        Thoi_gian_ket_thuc: null,
        Ma_phien_code: '0912.345.678', // Show Customer Phone directly
        Trang_thai: 'active' as const,
      },
      {
        Ma_phien: 's_B14',
        Ma_ban: 'B14',
        Ma_khach_hang: 'kh003',
        Thoi_gian_bat_dau: new Date(Date.now() - 555 * 60000).toISOString(), // 9h15m ago (09:15)
        Thoi_gian_ket_thuc: null,
        Ma_phien_code: '0934.567.890', // Show Customer Phone directly
        Trang_thai: 'active' as const,
      }
    ];
    
    // Force reset if outdated sessions key
    const stored = localStorage.getItem('giakhanh_sessions');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (!parsed.some((s: any) => s.Ma_ban === 'B04')) {
          localStorage.setItem('giakhanh_sessions', JSON.stringify(defaultSessions));
          return defaultSessions;
        }
      } catch (e) {}
    }
    return getStored('sessions', defaultSessions);
  });

  const [orders, setOrders] = useState<Order[]>(() => {
    const defaultOrders = [
      { Ma_hd_dat_mon: 'o_B04_1', Ma_phien: 's_B04', Thoi_gian: new Date(Date.now() - 40 * 60000).toISOString(), Trang_thai_phuc_vu: 'Đang phục vụ', Tong_tien: 617000 },
      { Ma_hd_dat_mon: 'o_B09_1', Ma_phien: 's_B09', Thoi_gian: new Date(Date.now() - 10 * 60000).toISOString(), Trang_thai_phuc_vu: 'Đang chuẩn bị', Tong_tien: 1680000 },
      { Ma_hd_dat_mon: 'o_B14_1', Ma_phien: 's_B14', Thoi_gian: new Date(Date.now() - 85 * 60000).toISOString(), Trang_thai_phuc_vu: 'Đã hoàn thành', Tong_tien: 1250000 },
    ];
    const stored = localStorage.getItem('giakhanh_orders');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (!parsed.some((o: any) => o.Ma_phien === 's_B04')) {
          localStorage.setItem('giakhanh_orders', JSON.stringify(defaultOrders));
          return defaultOrders;
        }
      } catch (e) {}
    }
    return getStored('orders', defaultOrders);
  });

  const [orderDetails, setOrderDetails] = useState<OrderDetail[]>(() => {
    const minAgo = (offset: number) => new Date(Date.now() - offset * 60000).toISOString();
    const defaultOrderDetails = [
      // Table B04 Items
      { Ma_detail_id: 'od_1', Ma_hd_dat_mon: 'o_B04_1', Ma_mon: 'm01', So_luong: 1, Don_gia_tai_thoi_diem: 299000, Trang_thai_mon: OrderItemStatus.DA_PHUC_VU, Ghi_chu: 'Ít cay, không hành', Thoi_gian_dat: minAgo(40) },
      { Ma_detail_id: 'od_2', Ma_hd_dat_mon: 'o_B04_1', Ma_mon: 'm04', So_luong: 2, Don_gia_tai_thoi_diem: 159000, Trang_thai_mon: OrderItemStatus.DA_PHUC_VU, Ghi_chu: '', Thoi_gian_dat: minAgo(40) },

      // Table B09 Items (pending kitchen)
      { Ma_detail_id: 'od_3', Ma_hd_dat_mon: 'o_B09_1', Ma_mon: 'm01', So_luong: 4, Don_gia_tai_thoi_diem: 299000, Trang_thai_mon: OrderItemStatus.DANG_CHO, Ghi_chu: '', Thoi_gian_dat: minAgo(10) },
      { Ma_detail_id: 'od_4', Ma_hd_dat_mon: 'o_B09_1', Ma_mon: 'm04', So_luong: 3, Don_gia_tai_thoi_diem: 159000, Trang_thai_mon: OrderItemStatus.DANG_CHE_BIEN, Ghi_chu: 'Nước dùng nhiều sả', Thoi_gian_dat: minAgo(10) },
      { Ma_detail_id: 'od_5', Ma_hd_dat_mon: 'o_B09_1', Ma_mon: 'm08', So_luong: 6, Don_gia_tai_thoi_diem: 15000, Trang_thai_mon: OrderItemStatus.DA_HOAN_THANH, Ghi_chu: 'Lấy nhiều đá', Thoi_gian_dat: minAgo(10) },

      // Table B14 Items (complete histories)
      { Ma_detail_id: 'od_6', Ma_hd_dat_mon: 'o_B14_1', Ma_mon: 'm03', So_luong: 3, Don_gia_tai_thoi_diem: 329000, Trang_thai_mon: OrderItemStatus.DA_PHUC_VU, Ghi_chu: '', Thoi_gian_dat: minAgo(85) },
      { Ma_detail_id: 'od_7', Ma_hd_dat_mon: 'o_B14_1', Ma_mon: 'm05', So_luong: 5, Don_gia_tai_thoi_diem: 39000, Trang_thai_mon: OrderItemStatus.DA_PHUC_VU, Ghi_chu: '', Thoi_gian_dat: minAgo(85) },
      { Ma_detail_id: 'od_8', Ma_hd_dat_mon: 'o_B14_1', Ma_mon: 'm08', So_luong: 4, Don_gia_tai_thoi_diem: 15000, Trang_thai_mon: OrderItemStatus.DA_PHUC_VU, Ghi_chu: '', Thoi_gian_dat: minAgo(85) },
    ];
    const stored = localStorage.getItem('giakhanh_orderDetails');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (!parsed.some((od: any) => od.Ma_hd_dat_mon === 'o_B04_1')) {
          localStorage.setItem('giakhanh_orderDetails', JSON.stringify(defaultOrderDetails));
          return defaultOrderDetails;
        }
      } catch (e) {}
    }
    return getStored('orderDetails', defaultOrderDetails);
  });

  const [importReceipts, setImportReceipts] = useState<ImportReceipt[]>(() => getStored('importReceipts', [
    {
      Ma_bb: 'bb_001',
      Ngay_nhan: '2026-06-11T10:00:00Z',
      Ten_nguoi_giao: 'Nguyễn Văn Định (NhaCungCap Việt)',
      Ma_nhan_vien: 'kh001',
      Ho_ten_nhan_vien: 'Hoàng Văn E',
      Ghi_chu: 'Nhận đầy đủ nấm tươi và nước dùng đóng chai.',
      Chi_tiet: [
        { Ma_nvl: 'nvl01', So_luong_thuc_nhan: 10000, Don_gia_tham_khao: 45000 },
        { Ma_nvl: 'nvl02', So_luong_thuc_nhan: 5000, Don_gia_tham_khao: 50000 },
        { Ma_nvl: 'nvl10', So_luong_thuc_nhan: 100, Don_gia_tham_khao: 7000 },
      ],
      Tong_tien: 7700000,
    },
    {
      Ma_bb: 'bb_002',
      Ngay_nhan: '2026-06-12T14:30:00Z',
      Ten_nguoi_giao: 'Công ty Thực phẩm Sạch Gia Khánh',
      Ma_nhan_vien: 'kh001',
      Ho_ten_nhan_vien: 'Hoàng Văn E',
      Ghi_chu: 'Nhập hàng khẩn cấp buổi chiều.',
      Chi_tiet: [
        { Ma_nvl: 'nvl09', So_luong_thuc_nhan: 15000, Don_gia_tham_khao: 120000 },
      ],
      Tong_tien: 1800000,
    }
  ]));

  const [employees, setEmployees] = useState<Employee[]>(() => getStored('employees', [
    { Ma_nhan_vien: 'mv001', Ho_ten: 'Nguyễn Văn A', Vai_tro: UserRole.QUAN_LY, Trang_thai_tai_khoan: 'Hoạt động', Ten_dang_nhap: 'admin', Mat_khau_hash: '123456', SOT: '0912345678' },
    { Ma_nhan_vien: 'mv002', Ho_ten: 'Trần Thị B', Vai_tro: UserRole.LE_TAN, Trang_thai_tai_khoan: 'Hoạt động', Ten_dang_nhap: 'letan01', Mat_khau_hash: '123456', SOT: '0987654321' },
    { Ma_nhan_vien: 'mv003', Ho_ten: 'Lê Văn C', Vai_tro: UserRole.BEP, Trang_thai_tai_khoan: 'Hoạt động', Ten_dang_nhap: 'bep01', Mat_khau_hash: '123456', SOT: '0971234567' },
    { Ma_nhan_vien: 'mv004', Ho_ten: 'Phạm Thị D', Vai_tro: UserRole.PHUC_VU, Trang_thai_tai_khoan: 'Hoạt động', Ten_dang_nhap: 'phucvu01', Mat_khau_hash: '123456', SOT: '0965432109' },
    { Ma_nhan_vien: 'mv005', Ho_ten: 'Hoàng Văn E', Vai_tro: UserRole.KHO, Trang_thai_tai_khoan: 'Hoạt động', Ten_dang_nhap: 'kho01', Mat_khau_hash: '123456', SOT: '0933210987' },
    { Ma_nhan_vien: 'mv006', Ho_ten: 'Nguyễn Văn F', Vai_tro: UserRole.BEP, Trang_thai_tai_khoan: 'Ngừng hoạt động', Ten_dang_nhap: 'bep02', Mat_khau_hash: '123456', SOT: '0911222333' },
  ]));

  const [logs, setLogs] = useState<SystemLog[]>(() => getStored('logs', [
    { Ma_log: 'log_001', Ma_nhan_vien: 'mv001', Ten_nhan_vien: 'Nguyễn Văn A', Hanh_dong: 'Khởi tạo hệ thống', Thoi_gian: '2026-06-11T08:00:00Z', Du_lieu_thay_doi: 'Tải cấu hình ban đầu' },
    { Ma_log: 'log_002', Ma_nhan_vien: 'mv001', Ten_nhan_vien: 'Nguyễn Văn A', Hanh_dong: 'Cập nhật giá thực đơn', Thoi_gian: '2026-06-11T09:12:00Z', Du_lieu_thay_doi: 'Giá Lẩu Thập Cẩm -> 299.000đ' },
    { Ma_log: 'log_003', Ma_nhan_vien: 'mv005', Ten_nhan_vien: 'Hoàng Văn E', Hanh_dong: 'Xác nhận biên bản nhập kho', Thoi_gian: '2026-06-12T14:35:00Z', Du_lieu_thay_doi: 'Biên bản bb_002, +15.000g Thịt bò Mỹ' },
  ]));

  // Sync state to local storage whenever they change
  useEffect(() => { localStorage.setItem('giakhanh_tables', JSON.stringify(tables)); }, [tables]);
  useEffect(() => { localStorage.setItem('giakhanh_customers', JSON.stringify(customers)); }, [customers]);
  useEffect(() => { localStorage.setItem('giakhanh_categories', JSON.stringify(categories)); }, [categories]);
  useEffect(() => { localStorage.setItem('giakhanh_dishes', JSON.stringify(dishes)); }, [dishes]);
  useEffect(() => { localStorage.setItem('giakhanh_recipes', JSON.stringify(recipes)); }, [recipes]);
  useEffect(() => { localStorage.setItem('giakhanh_materials', JSON.stringify(materials)); }, [materials]);
  useEffect(() => { localStorage.setItem('giakhanh_sessions', JSON.stringify(sessions)); }, [sessions]);
  useEffect(() => { localStorage.setItem('giakhanh_orders', JSON.stringify(orders)); }, [orders]);
  useEffect(() => { localStorage.setItem('giakhanh_orderDetails', JSON.stringify(orderDetails)); }, [orderDetails]);
  useEffect(() => { localStorage.setItem('giakhanh_importReceipts', JSON.stringify(importReceipts)); }, [importReceipts]);
  useEffect(() => { localStorage.setItem('giakhanh_employees', JSON.stringify(employees)); }, [employees]);
  useEffect(() => { localStorage.setItem('giakhanh_logs', JSON.stringify(logs)); }, [logs]);
  useEffect(() => { localStorage.setItem('giakhanh_reservations', JSON.stringify(reservations)); }, [reservations]);

  // Sync current user to local storage and do not auto login on startup
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('giakhanh_currentUser', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('giakhanh_currentUser');
    }
  }, [currentUser]);

  // --- ACTIONS & BUSINESS RULES IMPLEMENTATION ---

  const logSystemAction = (action: string, changeDetails: string) => {
    const operator = currentUser || { Ma_nhan_vien: 'system', Ho_ten: 'Hệ thống tự động' };
    const newLog: SystemLog = {
      Ma_log: `log_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      Ma_nhan_vien: operator.Ma_nhan_vien,
      Ten_nhan_vien: operator.Ho_ten,
      Hanh_dong: action,
      Thoi_gian: new Date().toISOString(),
      Du_lieu_thay_doi: changeDetails,
    };
    setLogs(prev => [newLog, ...prev]);
  };

  const login = (username: string, pass: string): Employee | null => {
    const found = employees.find(
      e => e.Ten_dang_nhap.toLowerCase() === username.toLowerCase() && e.Mat_khau_hash === pass
    );
    if (found) {
      if (found.Trang_thai_tai_khoan === 'Ngừng hoạt động') {
        return null;
      }
      setCurrentUser(found);
      setCurrentRole(found.Vai_tro);
      logSystemAction('Đăng nhập hệ thống', `Đăng nhập vai trò ${found.Vai_tro}`);
      return found;
    }
    return null;
  };

  const logout = () => {
    if (currentUser) {
      logSystemAction('Đăng xuất hệ thống', `Nhân viên ${currentUser.Ho_ten} đăng xuất`);
    }
    setCurrentUser(null);
  };

  const activateTable = (tableId: string) => {
    // BR01: transition Table from TRONG -> CHUAN_BI
    setTables(prev =>
      prev.map(t => {
        if (t.Ma_ban === tableId) {
          if (t.Trang_thai === TableStatus.TRONG) {
            logSystemAction('Kích hoạt bàn', `Bàn ${tableId} chuyển sang Đang chuẩn bị`);
            return { ...t, Trang_thai: TableStatus.CHUAN_BI };
          }
        }
        return t;
      })
    );
  };

  const deactivateTable = (tableId: string) => {
    setTables(prev =>
      prev.map(t => {
        if (t.Ma_ban === tableId) {
          logSystemAction('Hủy kích hoạt bàn', `Bàn ${tableId} chuyển sang Trống`);
          return { ...t, Trang_thai: TableStatus.TRONG };
        }
        return t;
      })
    );
  };

  const startTableSession = (tableId: string, phone: string, existingCode?: string): string => {
    // BR01 & BR02: Checks if table already has an active session. If yes, return or join
    const active = sessions.find(s => s.Ma_ban === tableId && s.Trang_thai === 'active');
    if (active) {
      // Return existing code to share
      return active.Ma_phien_code;
    }

    // Register customer phone
    let customerId = '';
    const existingCust = customers.find(c => c.So_dien_thoai === phone);
    if (existingCust) {
      customerId = existingCust.Ma_khach_hang;
    } else {
      customerId = `cust_${Date.now()}`;
      setCustomers(prev => [...prev, { Ma_khach_hang: customerId, So_dien_thoai: phone }]);
    }

    const sessionCode = existingCode || Math.random().toString(36).substring(2, 6).toUpperCase();
    const sessionId = `s_${tableId}_${Date.now().toString().slice(-4)}`;

    const newSession: Session = {
      Ma_phien: sessionId,
      Ma_ban: tableId,
      Ma_khach_hang: customerId,
      Thoi_gian_bat_dau: new Date().toISOString(),
      Thoi_gian_ket_thuc: null,
      Ma_phien_code: sessionCode,
      Trang_thai: 'active',
    };

    setSessions(prev => [newSession, ...prev]);

    // Update table status to CO_KHACH
    setTables(prev =>
      prev.map(t => {
        if (t.Ma_ban === tableId) {
          return { ...t, Trang_thai: TableStatus.CO_KHACH };
        }
        return t;
      })
    );

    logSystemAction('Mở phiên đặt bàn', `Kích hoạt bàn ${tableId} cùng SĐT ${phone} - Mã chia sẻ: ${sessionCode}`);
    return sessionCode;
  };

  const placeCustomerOrder = (tableId: string, cartItems: { dishId: string; quantity: number; notes: string }[]): string => {
    // BR02: Checks if table is in "Có khách"
    const tbl = tables.find(t => t.Ma_ban === tableId);
    if (!tbl || tbl.Trang_thai !== TableStatus.CO_KHACH) {
      throw new Error(`Bàn ${tableId} hiện không ở trạng thái Có khách. Hãy kích hoạt phiên bàn trước!`);
    }

    const activeSession = sessions.find(s => s.Ma_ban === tableId && s.Trang_thai === 'active');
    if (!activeSession) {
      throw new Error(`Không tìm thấy phiên đặt bàn đang hoạt động cho Bàn ${tableId}`);
    }

    // BR03: Confirm items are not Hết món / Ngừng phục vụ
    cartItems.forEach(item => {
      const dish = dishes.find(d => d.Ma_mon === item.dishId);
      if (!dish || dish.Trang_thai !== DishStatus.CON_PHUC_VU) {
        throw new Error(`Món "${dish ? dish.Ten_mon : item.dishId}" hiện không phục vụ hoặc hết món.`);
      }
    });

    const orderId = `o_${tableId}_${Date.now().toString().slice(-4)}`;
    let totalComputed = 0;

    const details: OrderDetail[] = cartItems.map((item, index) => {
      const dish = dishes.find(d => d.Ma_mon === item.dishId)!;
      totalComputed += dish.Don_gia * item.quantity;
      return {
        Ma_detail_id: `od_${Date.now()}_${index}`,
        Ma_hd_dat_mon: orderId,
        Ma_mon: item.dishId,
        So_luong: item.quantity,
        Don_gia_tai_thoi_diem: dish.Don_gia,
        Trang_thai_mon: OrderItemStatus.DANG_CHO,
        Ghi_chu: item.notes,
        Thoi_gian_dat: new Date().toISOString(),
      };
    });

    const newOrder: Order = {
      Ma_hd_dat_mon: orderId,
      Ma_phien: activeSession.Ma_phien,
      Thoi_gian: new Date().toISOString(),
      Trang_thai_phuc_vu: 'Đang chuẩn bị',
      Tong_tien: totalComputed,
    };

    setOrders(prev => [newOrder, ...prev]);
    setOrderDetails(prev => [...details, ...prev]);

    logSystemAction(
      'Đặt món ăn',
      `Khách hàng tại bàn ${tableId} gửi đơn ${orderId} gồm ${cartItems.length} món. Tạm tính ${totalComputed.toLocaleString()}đ`
    );

    // Phát âm thanh báo bếp thiết bị khi có món mới
    playNotificationSound('new_order');

    return orderId;
  };

  const updateOrderItemStatus = (detailId: string, newStatus: OrderItemStatus): { success: boolean; error?: string } => {
    // BR10: One-way status progression: Đang chờ -> Đang chế biến -> Đã hoàn thành -> Đã phục vụ
    const item = orderDetails.find(od => od.Ma_detail_id === detailId);
    if (!item) {
      return { success: false, error: 'Không tìm thấy chi tiết món đặt.' };
    }

    const currentStatus = item.Trang_thai_mon;

    // Check one-way logic
    const statusOrder = [
      OrderItemStatus.DANG_CHO,
      OrderItemStatus.DANG_CHE_BIEN,
      OrderItemStatus.DA_HOAN_THANH,
      OrderItemStatus.DA_PHUC_VU,
    ];
    const currentIndex = statusOrder.indexOf(currentStatus);
    const newIndex = statusOrder.indexOf(newStatus);

    if (newIndex <= currentIndex) {
      return {
        success: false,
        error: `Quá trình chế biến chỉ di chuyển một chiều (BR10). Không thể cập nhật ngược từ "${currentStatus}" về "${newStatus}".`,
      };
    }

    // BR11 / Deduct inventory automatically on transitioning into "Đang chế biến"
    if (currentStatus === OrderItemStatus.DANG_CHO && newStatus === OrderItemStatus.DANG_CHE_BIEN) {
      const dishRecipe = recipes.filter(r => r.Ma_mon === item.Ma_mon);
      const insufficientMaterials: string[] = [];

      // Validate stock levels first
      dishRecipe.forEach(recipe => {
        const material = materials.find(m => m.Ma_nvl === recipe.Ma_nvl);
        if (!material) return;
        const totalNeeded = recipe.So_luong_dinh_luong * item.So_luong;

        if (material.Ton_kho_hien_tai < totalNeeded) {
          insufficientMaterials.push(`${material.Ten_nvl} (Thiếu ${(totalNeeded - material.Ton_kho_hien_tai).toLocaleString()}${material.Don_vi_tinh})`);
        }
      });

      if (insufficientMaterials.length > 0) {
        // BR11/SRS condition: Trình báo không đủ tồn kho và ngừng trừ kho, báo bếp thu hồi đánh dấu "Hết món"
        // Also automatically set dish status to Out of Stock
        setDishes(prev =>
          prev.map(d => (d.Ma_mon === item.Ma_mon ? { ...d, Trang_thai: DishStatus.HET_MON } : d))
        );

        logSystemAction(
          'Thiếu hụt nguyên liệu',
          `Bếp từ chối nấu món "${dishes.find(d => d.Ma_mon === item.Ma_mon)?.Ten_mon}" vì không đủ kho: ${insufficientMaterials.join(', ')}`
        );

        return {
          success: false,
          error: `Không đủ tồn kho nguyên liệu để nấu! Gồm: ${insufficientMaterials.join(', ')}. Hệ thống đã tự động đánh dấu [Hết món] của thực đơn.`,
        };
      }

      // Perform the actual inventory reduction!
      setMaterials(prev =>
        prev.map(mat => {
          const matchedRecipe = dishRecipe.find(r => r.Ma_nvl === mat.Ma_nvl);
          if (matchedRecipe) {
            const consumed = matchedRecipe.So_luong_dinh_luong * item.So_luong;
            const finalStock = mat.Ton_kho_hien_tai - consumed;
            return {
              ...mat,
              Ton_kho_hien_tai: finalStock < 0 ? 0 : finalStock,
            };
          }
          return mat;
        })
      );

      // Warning alarms if falling under minimum is handled dynamically in getters but writing log is good
      logSystemAction(
        'Khấu trừ kho tự động',
        `Nấu món ${dishes.find(d => d.Ma_mon === item.Ma_mon)?.Ten_mon} x${item.So_luong}, đã tự động trừ nguyên liệu khỏi kho.`
      );
    }

    // Set status
    setOrderDetails(prev =>
      prev.map(od => (od.Ma_detail_id === detailId ? { ...od, Trang_thai_mon: newStatus } : od))
    );

    // If all items of an order are DA_PHUC_VU, let's mark order status appropriately
    setTimeout(() => {
      setOrderDetails(latestDetails => {
        const orderId = item.Ma_hd_dat_mon;
        const siblings = latestDetails.filter(od => od.Ma_hd_dat_mon === orderId);
        const allServed = siblings.every(od => od.Trang_thai_mon === OrderItemStatus.DA_PHUC_VU);
        const allCompletedOrServed = siblings.every(
          od => od.Trang_thai_mon === OrderItemStatus.DA_HOAN_THANH || od.Trang_thai_mon === OrderItemStatus.DA_PHUC_VU
        );

        setOrders(prev =>
          prev.map(o => {
            if (o.Ma_hd_dat_mon === orderId) {
              let updatedStatus = o.Trang_thai_phuc_vu;
              if (allServed) {
                updatedStatus = 'Đã phục vụ';
              } else if (allCompletedOrServed) {
                updatedStatus = 'Đã chế biến';
              } else {
                updatedStatus = 'Đang chế biến';
              }
              return { ...o, Trang_thai_phuc_vu: updatedStatus };
            }
            return o;
          })
        );
        return latestDetails;
      });
    }, 50);

    logSystemAction(
      'Cập nhật món ăn',
      `Thay đổi trạng thái món "${dishes.find(d => d.Ma_mon === item.Ma_mon)?.Ten_mon}" sang "${newStatus}"`
    );

    // Phát âm thanh báo nhân viên bưng khi bếp nấu xong (Đã hoàn thành)
    if (newStatus === OrderItemStatus.DA_HOAN_THANH) {
      playNotificationSound('ready_dish');
    }

    return { success: true };
  };

  const addEmployee = (emp: Omit<Employee, 'Ma_nhan_vien'>) => {
    const id = `mv00${employees.length + 1}`;
    const newEmp: Employee = { ...emp, Ma_nhan_vien: id };
    setEmployees(prev => [...prev, newEmp]);
    logSystemAction('Thêm nhân viên', `Tạo tài khoản ${emp.Ten_dang_nhap} - vai trò ${emp.Vai_tro}`);
  };

  const updateEmployee = (emp: Employee) => {
    setEmployees(prev => prev.map(e => (e.Ma_nhan_vien === emp.Ma_nhan_vien ? emp : e)));
    logSystemAction('Cập nhật nhân viên', `Chỉnh sửa tài khoản ${emp.Ho_ten} (${emp.Ma_nhan_vien})`);
  };

  const deleteEmployee = (id: string) => {
    // We mark disabled instead of deleting completely for integrity
    setEmployees(prev =>
      prev.map(e => (e.Ma_nhan_vien === id ? { ...e, Trang_thai_tai_khoan: 'Ngừng hoạt động' as const } : e))
    );
    logSystemAction('Vô hiệu hóa nhân viên', `Khóa tài khoản ${id}`);
  };

  const addDish = (dish: Omit<Dish, 'Ma_mon'>): boolean => {
    // BR09: Price cannot be negative
    if (dish.Don_gia < 0) {
      alert('Đơn giá không được phép âm! (BR09)');
      return false;
    }

    const id = `m${(dishes.length + 1).toString().padStart(2, '0')}`;
    const newDish: Dish = { ...dish, Ma_mon: id };

    // BR08: Must have recipes before setting active status is checked on save but let's allow adding first inactive
    setDishes(prev => [...prev, newDish]);
    logSystemAction('Khai báo món ăn', `Tạo món ăn mới "${dish.Ten_mon}" giá ${dish.Don_gia.toLocaleString()}đ`);
    return true;
  };

  const updateDish = (dish: Dish): boolean => {
    if (dish.Don_gia < 0) {
      alert('Đơn giá không được phép là số âm! (BR09)');
      return false;
    }

    // BR08: A dish must define at least 1 raw material before being marked ready ("Còn phục vụ")
    if (dish.Trang_thai === DishStatus.CON_PHUC_VU) {
      const dishIngredients = recipes.filter(r => r.Ma_mon === dish.Ma_mon);
      if (dishIngredients.length === 0) {
        alert('Món ăn phải được khai báo ít nhất một nguyên liệu trong bảng định lượng trước khi hoạt động! (BR08)');
        return false;
      }
    }

    setDishes(prev => prev.map(d => (d.Ma_mon === dish.Ma_mon ? dish : d)));
    logSystemAction('Cập nhật món ăn', `Thay đổi thông tin món "${dish.Ten_mon}"`);
    return true;
  };

  const deleteDish = (id: string) => {
    // BR09: Cannot delete, change status to Ngừng phục vụ instead!
    setDishes(prev =>
      prev.map(d => (d.Ma_mon === id ? { ...d, Trang_thai: DishStatus.NGUNG_PHUC_VU } : d))
    );
    logSystemAction('Ngưng phục vụ món', `Chuyển trạng thái món ${id} sang Ngừng phục vụ (BR09)`);
  };

  const updateRecipe = (dishId: string, newRecipe: RecipeItem[]) => {
    setRecipes(prev => {
      const filtered = prev.filter(r => r.Ma_mon !== dishId);
      return [...filtered, ...newRecipe];
    });

    logSystemAction('Cập nhật định lượng', `Chỉnh sửa công thức định lượng nguyên liệu cho món ${dishId}`);
  };

  const adjustCategoryOrder = () => {}; // Helper unused

  const addCategory = (cat: Category) => {
    setCategories(prev => [...prev, cat]);
    logSystemAction('Thêm danh mục', `Tạo danh mục thực đơn "${cat.Ten_danh_muc}"`);
  };

  const updateCategory = (cat: Category) => {
    setCategories(prev => prev.map(c => (c.Ma_danh_muc === cat.Ma_danh_muc ? cat : c)));
  };

  const deleteCategory = (id: string) => {
    setCategories(prev => prev.filter(c => c.Ma_danh_muc !== id));
  };

  const adjustInventory = (materialId: string, amount: number, reason: string): { success: boolean; error?: string } => {
    // BR12: Adjustments must have explanation and logged
    if (!reason || reason.trim() === '') {
      return { success: false, error: 'Hãy nhập lý do điều chỉnh bắt buộc (BR12).' };
    }

    const material = materials.find(m => m.Ma_nvl === materialId);
    if (!material) {
      return { success: false, error: 'Không tìm thấy nguyên liệu chọn.' };
    }

    const finalAmount = material.Ton_kho_hien_tai + amount;

    // BR04: Inventory cannot decrease below 0
    if (finalAmount < 0) {
      return {
        success: false,
        error: `Tồn kho không được phép nhỏ hơn 0 (BR04). Tồn hiện tại là ${material.Ton_kho_hien_tai}, không thể giảm ${Math.abs(amount)}.`,
      };
    }

    setMaterials(prev =>
      prev.map(m => (m.Ma_nvl === materialId ? { ...m, Trang_thai: m.Trang_thai, Ton_kho_hien_tai: finalAmount } : m))
    );

    logSystemAction(
      'Điều chỉnh tồn kho',
      `Nhân viên điều chỉnh tồn kho thủ công: ${material.Ten_nvl} (${amount > 0 ? '+' : ''}${amount} ${material.Don_vi_tinh}). Lý do: ${reason}`
    );

    return { success: true };
  };

  const addNewMaterial = (material: RawMaterial) => {
    setMaterials(prev => [...prev, material]);
    logSystemAction('Khai báo nguyên liệu', `Thêm mới vật tư "${material.Ten_nvl}"`);
  };

  const updateMaterial = (material: RawMaterial): boolean => {
    // BR05: Min limit must be less than Max limit
    if (material.Ton_kho_toi_thieu >= material.Ton_kho_toi_da) {
      alert('Ngưỡng tồn tối thiểu phải nhỏ hơn ngưỡng tồn tối đa! (BR05)');
      return false;
    }

    setMaterials(prev => prev.map(m => (m.Ma_nvl === material.Ma_nvl ? material : m)));
    logSystemAction('Cập nhật nguyên liệu', `Sửa cấu hình định mức tồn kho cho "${material.Ten_nvl}"`);
    return true;
  };

  const addImportReceipt = (receipt: {
    shipper: string;
    note: string;
    anhDonNhap?: string;
    items: { materialId: string; quantity: number; price: number }[];
  }): { success: boolean; error?: string } => {
    // BR06: Quantities must be positive. If quantity is 0, notes are required.
    const invalidItem = receipt.items.find(it => it.quantity < 0);
    if (invalidItem) {
      return { success: false, error: 'Số lượng thực nhận không được là số âm (BR06).' };
    }

    const zeroItem = receipt.items.find(it => it.quantity === 0);
    if (zeroItem && (!receipt.note || receipt.note.trim() === '')) {
      return {
        success: false,
        error: `Có nguyên liệu nhận bằng 0 (${materials.find(m => m.Ma_nvl === zeroItem.materialId)?.Ten_nvl}). Bạn phải ghi cú thích lý do khuyết vật tư lúc nhận (BR06).`,
      };
    }

    if (!receipt.anhDonNhap) {
      return {
        success: false,
        error: 'Quy trình bắt buộc: Bạn phải chọn tải lên ảnh chụp Hóa đơn/Đơn nhập kho trước khi xác nhận nhập kho!'
      };
    }

    const receiptId = `bb_${Date.now().toString().slice(-4)}`;
    let totalValue = 0;

    const receiptDetails: ImportReceiptDetail[] = receipt.items.map(it => {
      totalValue += it.price * it.quantity;
      return {
        Ma_nvl: it.materialId,
        So_luong_thuc_nhan: it.quantity,
        Don_gia_tham_khao: it.price,
      };
    });

    const newReceipt: ImportReceipt = {
      Ma_bb: receiptId,
      Ngay_nhan: new Date().toISOString(),
      Ten_nguoi_giao: receipt.shipper,
      Ma_nhan_vien: currentUser ? currentUser.Ma_nhan_vien : 'mv005',
      Ho_ten_nhan_vien: currentUser ? currentUser.Ho_ten : 'Hoàng Văn E',
      Ghi_chu: receipt.note || 'Nhập kho từ nhà cung cấp',
      Chi_tiet: receiptDetails,
      Tong_tien: totalValue,
      Anh_don_nhap: receipt.anhDonNhap,
    };

    // Update material quantities in stock
    setMaterials(prev =>
      prev.map(mat => {
        const itemReceipt = receipt.items.find(it => it.materialId === mat.Ma_nvl);
        if (itemReceipt) {
          const finalStock = mat.Ton_kho_hien_tai + itemReceipt.quantity;

          // Check if exceed max - warnings are triggered dynamically based on current/max but log captures it
          return {
            ...mat,
            Ton_kho_hien_tai: finalStock,
          };
        }
        return mat;
      })
    );

    setImportReceipts(prev => [newReceipt, ...prev]);

    logSystemAction(
      'Biên bản nhập hàng',
      `Tạo biên bản ${receiptId} người giao: ${receipt.shipper}, cộng tồn ${receiptDetails.length} nguyên liệu. Tổng giá trị: ${totalValue.toLocaleString()}đ (BR07)`
    );

    return { success: true };
  };

  const closeSessionAndPay = (sessionId: string) => {
    const session = sessions.find(s => s.Ma_phien === sessionId);
    if (!session) return;

    // Transition table state directly to TRONG (Trống - Xanh lá) immediately
    setTables(prev =>
      prev.map(t => (t.Ma_ban === session.Ma_ban ? { ...t, Trang_thai: TableStatus.TRONG } : t))
    );

    // Complete session
    setSessions(prev =>
      prev.map(s => (s.Ma_phien === sessionId ? { ...s, Trang_thai: 'completed' as const, Thoi_gian_ket_thuc: new Date().toISOString() } : s))
    );

    logSystemAction('Đóng phiên bàn / Thanh toán', `Hoàn tất đơn hàng & thanh toán cho bàn ${session.Ma_ban}. Chuyển bàn sang Trống.`);
  };

  const addReservation = (res: Omit<TableReservation, 'Ma_dat_ban'>) => {
    const newId = `db_${Date.now()}`;
    const newRes: TableReservation = {
      ...res,
      Ma_dat_ban: newId
    };
    setReservations(prev => [newRes, ...prev]);
    logSystemAction(
      'Đặt bàn trước',
      `Tạo lịch đặt bàn cho khách ${res.Ten_khach_hang} SĐT ${res.So_dien_thoai} nhắm bàn ${res.Ma_ban} ngày ${res.Ngay_dat} lúc ${res.Gio_dat}`
    );
  };

  const updateReservationStatus = (resId: string, status: 'Chờ đến' | 'Đã nhận phiên' | 'Đã hủy') => {
    setReservations(prev =>
      prev.map(r => (r.Ma_dat_ban === resId ? { ...r, Trang_thai: status } : r))
    );
    const matched = reservations.find(r => r.Ma_dat_ban === resId);
    if (matched) {
      logSystemAction(
        'Đổi trạng thái đặt bàn',
        `Lượt đặt bàn ${matched.Ma_ban} của ${matched.Ten_khach_hang} chuyển sang "${status}"`
      );
    }
  };

  const setTableStatusManual = (tableId: string, status: TableStatus) => {
    setTables(prev =>
      prev.map(t => (t.Ma_ban === tableId ? { ...t, Trang_thai: status } : t))
    );
    logSystemAction('Điều hành sơ đồ bàn', `Thao tác thay đổi trạng thái bàn ${tableId} thành ${status}`);
  };

  const updateOrderInvoice = (orderId: string, imageBase64: string) => {
    setOrders(prev =>
      prev.map(o => (o.Ma_hd_dat_mon === orderId ? { ...o, Anh_hoa_don: imageBase64 } : o))
    );
    logSystemAction(
      'Cập nhật hóa đơn',
      `Tải lên ảnh chụp thực tế cho hóa đơn ${orderId}`
    );
  };

  return (
    <RestaurantContext.Provider
      value={{
        tables,
        customers,
        sessions,
        categories,
        dishes,
        recipes,
        orders,
        orderDetails,
        materials,
        importReceipts,
        employees,
        logs,
        reservations,
        currentRole,
        setCurrentRole,
        currentUser,
        setCurrentUser,
        selectedTableId,
        setSelectedTableId,
        customerSession,
        setCustomerSession,
        // Actions
        login,
        logout,
        activateTable,
        deactivateTable,
        startTableSession,
        placeCustomerOrder,
        updateOrderItemStatus,
        addEmployee,
        updateEmployee,
        deleteEmployee,
        addDish,
        updateDish,
        deleteDish,
        updateRecipe,
        addCategory,
        updateCategory,
        deleteCategory,
        adjustInventory,
        addNewMaterial,
        updateMaterial,
        addImportReceipt,
        logSystemAction,
        closeSessionAndPay,
        setTableStatusManual,
        addReservation,
        updateReservationStatus,
        updateOrderInvoice,
      }}
    >
      {children}
    </RestaurantContext.Provider>
  );
}

export function useRestaurantStore() {
  const context = useContext(RestaurantContext);
  if (!context) {
    throw new Error('useRestaurantStore must be used within a RestaurantProvider');
  }
  return context;
}
