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
  Employee,
  SystemLog,
  TableReservation,
} from '../types';
import {
  mapTableToFrontend,
  mapCustomerToFrontend,
  mapSessionToFrontend,
  mapCategoryToFrontend,
  mapDishToFrontend,
  mapRecipeToFrontend,
  mapOrderToFrontend,
  mapOrderDetailToFrontend,
  mapMaterialToFrontend,
  mapImportReceiptToFrontend,
  mapEmployeeToFrontend,
  mapLogToFrontend,
  mapReservationToFrontend
} from '../utils/mapper';

export interface ToastMessage {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
  duration?: number;
}

export interface InventoryTransaction {
  id: string;
  materialId: string;
  transactionType: 'NHAP' | 'XUAT';
  quantity: number;
  createdAt: string;
  referenceId: string;
  notes?: string;
}

export function playWarningSound() {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const playTone = (freq: number, start: number, duration: number) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.setValueAtTime(freq, start);
      gain.gain.setValueAtTime(0.08, start);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
      osc.start(start);
      osc.stop(start + duration);
    };
    playTone(220, ctx.currentTime, 0.35); // Low A3 sawtooth
    playTone(220, ctx.currentTime + 0.15, 0.45);
  } catch (e) {
    console.warn("Audio warning sound failed", e);
  }
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
  inventoryTransactions: InventoryTransaction[];
  currentRole: UserRole;
  setCurrentRole: (role: UserRole) => void;
  currentUser: Employee | null;
  setCurrentUser: (user: Employee | null) => void;
  selectedTableId: string | null;
  setSelectedTableId: (id: string | null) => void;
  customerSession: any;
  setCustomerSession: (session: any) => void;
  toasts: ToastMessage[];
  addToast: (message: string, type?: 'success' | 'error' | 'info', duration?: number) => void;
  removeToast: (id: string) => void;
  // Backend Sync Actions
  login: (username: string, pass: string) => Employee | null;
  logout: () => void;
  activateTable: (tableId: string) => void;
  deactivateTable: (tableId: string) => void;
  startTableSession: (tableId: string, phone: string, guestsCount?: number, existingCode?: string) => Promise<string>;
  placeCustomerOrder: (tableId: string, cartItems: { dishId: string; quantity: number; notes: string }[]) => Promise<string>;
  updateOrderItemStatus: (detailId: string, newStatus: OrderItemStatus) => Promise<{ success: boolean; error?: string }>;
  addEmployee: (emp: Omit<Employee, 'Ma_nhan_vien'>) => void;
  updateEmployee: (emp: Employee) => void;
  deleteEmployee: (id: string) => void;
  addDish: (dish: Omit<Dish, 'Ma_mon'>) => Promise<boolean>;
  updateDish: (dish: Dish) => Promise<boolean>;
  deleteDish: (id: string) => void;
  updateRecipe: (dishId: string, newRecipe: RecipeItem[]) => void;
  addCategory: (cat: Category) => void;
  updateCategory: (cat: Category) => void;
  deleteCategory: (id: string) => void;
  adjustInventory: (materialId: string, amount: number, reason: string) => Promise<{ success: boolean; error?: string }>;
  addNewMaterial: (material: RawMaterial) => void;
  updateMaterial: (material: RawMaterial) => Promise<boolean>;
  addImportReceipt: (receipt: { shipper: string; note: string; anhDonNhap?: string; items: { materialId: string; quantity: number; price: number }[] }) => Promise<{ success: boolean; error?: string }>;
  logSystemAction: (action: string, changeDetails: string) => void;
  closeSessionAndPay: (sessionId: string) => void;
  setTableStatusManual: (tableId: string, status: TableStatus) => void;
  addReservation: (res: Omit<TableReservation, 'Ma_dat_ban'>) => void;
  updateReservationStatus: (resId: string, status: 'Chờ đến' | 'Đã nhận phiên' | 'Đã hủy') => void;
  updateOrderInvoice: (orderId: string, imageBase64: string) => void;
  refreshData: () => void;
}

const RestaurantContext = createContext<RestaurantContextType | undefined>(undefined);

export function RestaurantProvider({ children }: { children: React.ReactNode }) {
  // State elements
  const [currentUser, setCurrentUser] = useState<Employee | null>(null);
  const [currentRole, setCurrentRole] = useState<UserRole>(UserRole.QUAN_LY);
  const [selectedTableId, setSelectedTableId] = useState<string | null>('B03');
  const [customerSession, setCustomerSession] = useState<any>(null);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const [tables, setTables] = useState<DiningTable[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [recipes, setRecipes] = useState<RecipeItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [orderDetails, setOrderDetails] = useState<OrderDetail[]>([]);
  const [materials, setMaterials] = useState<RawMaterial[]>([]);
  const [importReceipts, setImportReceipts] = useState<ImportReceipt[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [logs, setLogs] = useState<SystemLog[]>([]);
  const [reservations, setReservations] = useState<TableReservation[]>([]);
  const [inventoryTransactions, setInventoryTransactions] = useState<InventoryTransaction[]>([]);

  // Toast notifications helpers
  const addToast = (message: string, type: 'success' | 'error' | 'info' = 'info', duration = 4000) => {
    const id = `toast_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`;
    setToasts(prev => [...prev, { id, message, type, duration }]);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // Intercept global window alert to turn it into a toast message!
  useEffect(() => {
    window.alert = (msg: string) => {
      // Map common database check validations in alert to matching toast colors
      if (msg.includes('thành công') || msg.includes('Kích hoạt') || msg.includes('Đặt bàn trước')) {
        addToast(msg, 'success');
      } else if (msg.includes('không') || msg.includes('lỗi') || msg.includes('bị từ chối') || msg.includes('Thất bại') || msg.includes('âm') || msg.includes('tối thiểu')) {
        addToast(msg, 'error');
      } else {
        addToast(msg, 'info');
      }
    };
  }, []);

  // Fetch all databases from Express Backend
  const refreshData = () => {
    fetch('/api/tables').then(res => res.json()).then(data => setTables(data.map(mapTableToFrontend))).catch(e => console.error('Fetch tables error', e));
    fetch('/api/customers').then(res => res.json()).then(data => setCustomers(data.map(mapCustomerToFrontend))).catch(e => {});
    fetch('/api/categories').then(res => res.json()).then(data => setCategories(data.map(mapCategoryToFrontend))).catch(e => {});
    fetch('/api/dishes').then(res => res.json()).then(data => setDishes(data.map(mapDishToFrontend))).catch(e => {});
    fetch('/api/recipes').then(res => res.json()).then(data => setRecipes(data.map(mapRecipeToFrontend))).catch(e => {});
    fetch('/api/sessions').then(res => res.json()).then(data => setSessions(data.map(mapSessionToFrontend))).catch(e => {});
    fetch('/api/orders').then(res => res.json()).then(data => setOrders(data.map(mapOrderToFrontend))).catch(e => {});
    
    fetch('/api/order-details').then(res => res.json()).then(data => {
      const parsed = data.map(mapOrderDetailToFrontend);
      setOrderDetails(prev => {
        if (prev.length > 0) {
          const hasNewPending = parsed.some((item: any) => 
            item.Trang_thai_mon === OrderItemStatus.DANG_CHO && 
            !prev.some((p: any) => p.Ma_detail_id === item.Ma_detail_id)
          );
          const hasNewReady = parsed.some((item: any) => 
            item.Trang_thai_mon === OrderItemStatus.DA_HOAN_THANH && 
            !prev.some((p: any) => p.Ma_detail_id === item.Ma_detail_id && p.Trang_thai_mon === OrderItemStatus.DA_HOAN_THANH)
          );

          const isKitchenUser = currentUser?.Vai_tro === UserRole.BEP || currentUser?.Vai_tro === UserRole.QUAN_LY;
          const isWaiterUser = currentUser?.Vai_tro === UserRole.PHUC_VU || currentUser?.Vai_tro === UserRole.QUAN_LY;

          if (hasNewPending && isKitchenUser) {
            playNotificationSound('new_order');
          }
          if (hasNewReady && isWaiterUser) {
            playNotificationSound('ready_dish');
          }
        }
        return parsed;
      });
    }).catch(e => {});

    fetch('/api/materials').then(res => res.json()).then(data => setMaterials(data.map(mapMaterialToFrontend))).catch(e => {});
    fetch('/api/import-receipts').then(res => res.json()).then(data => setImportReceipts(data.map(mapImportReceiptToFrontend))).catch(e => {});
    fetch('/api/employees').then(res => res.json()).then(data => setEmployees(data.map(mapEmployeeToFrontend))).catch(e => {});
    fetch('/api/reservations').then(res => res.json()).then(data => setReservations(data.map(mapReservationToFrontend))).catch(e => {});
    fetch('/api/logs').then(res => res.json()).then(data => {
      const parsed = data.map(mapLogToFrontend);
      setLogs(prev => {
        if (prev.length > 0 && parsed.length > 0) {
          const latestLog = parsed[0];
          const hasNewWarning = latestLog.Hanh_dong === 'YÊU CẦU CẢNH BÁO KHẨN CẤP' && 
            !prev.some((p: any) => p.id === latestLog.id);
          
          if (hasNewWarning) {
            const isManagerOrWarehouse = currentUser?.Vai_tro === UserRole.QUAN_LY || currentUser?.Vai_tro === UserRole.KHO;
            if (isManagerOrWarehouse) {
              addToast(`[CẢNH BÁO BẾP]: ${latestLog.Du_lieu_thay_doi}`, 'error', 10000);
              playWarningSound();
            }
          }
        }
        return parsed;
      });
    }).catch(e => {});
    
    fetch('/api/inventory-transactions').then(res => res.json()).then(data => {
      const mapped = data.map((tx: any) => ({
        id: tx.id,
        materialId: tx.material_id,
        transactionType: tx.transaction_type,
        quantity: tx.quantity,
        createdAt: tx.created_at,
        referenceId: tx.reference_id,
        notes: tx.notes
      }));
      setInventoryTransactions(mapped);
    }).catch(e => {});
  };

  // Load configuration on Startup
  useEffect(() => {
    refreshData();
    
    const interval = setInterval(() => {
      refreshData();
    }, 3000);
    
    // Check localStorage for active staff session
    const storedUser = localStorage.getItem('giakhanh_currentUser');
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        setCurrentUser(user);
        setCurrentRole(user.Vai_tro);
      } catch (e) {}
    }

    return () => clearInterval(interval);
  }, []);

  const logSystemAction = (action: string, changeDetails: string) => {
    fetch('/api/logs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        employeeId: currentUser?.Ma_nhan_vien || 'bep',
        employeeName: currentUser?.Ho_ten || 'Nhà bếp',
        action,
        changedData: changeDetails
      })
    }).then(() => refreshData());
  };

  // --- ACTIONS WITH BACKEND INTEGRATION ---

  const login = (username: string, pass: string): Employee | null => {
    // Synchronous login facade with async hit
    // Since login view is synchronous, we will query via xhr/fetch synchronously if possible, or handle via mock comparison while POST resolves in background
    const matched = employees.find(
      e => e.Ten_dang_nhap.toLowerCase() === username.toLowerCase()
    );

    if (matched) {
      // Hit login API
      fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password: pass })
      }).then(res => res.json()).then(data => {
        if (data.success) {
          const emp = mapEmployeeToFrontend(data.user);
          setCurrentUser(emp);
          setCurrentRole(emp.Vai_tro);
          localStorage.setItem('giakhanh_currentUser', JSON.stringify(emp));
          addToast(`Chào mừng ${emp.Ho_ten} (${emp.Vai_tro}) đã quay lại!`, 'success');
          refreshData();
        } else {
          addToast(data.error || 'Mật khẩu đăng nhập sai.', 'error');
        }
      }).catch(e => {
        addToast('Không thể kết nối đến máy chủ Backend.', 'error');
      });
      return matched; // Return the user object so UI doesn't block
    }
    return null;
  };

  const logout = () => {
    if (currentUser) {
      fetch('/api/auth/logout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: currentUser.Ma_nhan_vien, name: currentUser.Ho_ten })
      }).then(() => {
        setCurrentUser(null);
        localStorage.removeItem('giakhanh_currentUser');
        addToast('Đăng xuất tài khoản thành công.', 'info');
        refreshData();
      });
    }
  };

  const activateTable = (tableId: string) => {
    fetch(`/api/tables/${tableId}/activate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ operatorId: currentUser?.Ma_nhan_vien, operatorName: currentUser?.Ho_ten })
    }).then(res => res.json()).then(data => {
      if (data.success) {
        addToast(`Bàn ${tableId} bắt đầu chuẩn bị.`, 'success');
        refreshData();
      }
    });
  };

  const deactivateTable = (tableId: string) => {
    fetch(`/api/tables/${tableId}/deactivate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ operatorId: currentUser?.Ma_nhan_vien, operatorName: currentUser?.Ho_ten })
    }).then(res => res.json()).then(data => {
      if (data.success) {
        refreshData();
      }
    });
  };

  const startTableSession = async (tableId: string, phone: string, guestsCount = 4, existingCode?: string): Promise<string> => {
    const res = await fetch('/api/sessions/start', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tableId, phone, guestsCount, existingCode, createdBy: currentUser?.Ma_nhan_vien })
    });
    const data = await res.json();
    if (data.success) {
      addToast(`Bàn ${tableId} đã đón ${guestsCount} khách vào ăn.`, 'success');
      refreshData();
      return data.shareCode;
    }
    throw new Error(data.error || 'Không thể tạo phiên ăn lẩu.');
  };

  const placeCustomerOrder = async (tableId: string, cartItems: { dishId: string; quantity: number; notes: string }[]): Promise<string> => {
    const res = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tableId, cartItems })
    });
    const data = await res.json();
    if (data.success) {
      addToast(`Đã chuyển đơn đặt nấm của bàn ${tableId} xuống bếp thành công!`, 'success');
      refreshData();
      return data.orderId;
    }
    throw new Error(data.error || 'Đặt món thất bại.');
  };

  const updateOrderItemStatus = async (detailId: string, newStatus: OrderItemStatus): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await fetch(`/api/order-details/${detailId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus, operatorId: currentUser?.Ma_nhan_vien, operatorName: currentUser?.Ho_ten })
      });
      const data = await res.json();
      if (data.success) {
        addToast(`Cập nhật trạng thái món ăn thành công: ${newStatus}`, 'success');
        refreshData();
        return { success: true };
      }
      return { success: false, error: data.error || 'Thao tác cập nhật lỗi.' };
    } catch (e) {
      return { success: false, error: 'Kết nối mạng thất bại.' };
    }
  };

  const addEmployee = (emp: Omit<Employee, 'Ma_nhan_vien'>) => {
    fetch('/api/employees', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: emp.Ten_dang_nhap,
        password: '123456', // default pass
        role: emp.Vai_tro,
        name: emp.Ho_ten,
        phone: emp.SOT,
        operatorId: currentUser?.Ma_nhan_vien,
        operatorName: currentUser?.Ho_ten
      })
    }).then(res => res.json()).then(data => {
      if (data.success) {
        addToast(`Đã thêm nhân viên ${emp.Ho_ten} mới.`, 'success');
        refreshData();
      }
    });
  };

  const updateEmployee = (emp: Employee) => {
    fetch(`/api/employees/${emp.Ma_nhan_vien}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        role: emp.Vai_tro,
        name: emp.Ho_ten,
        phone: emp.SOT,
        status: emp.Trang_thai_tai_khoan,
        operatorId: currentUser?.Ma_nhan_vien,
        operatorName: currentUser?.Ho_ten
      })
    }).then(res => res.json()).then(data => {
      if (data.success) {
        addToast(`Đã cập nhật hồ sơ tài khoản nhân viên ${emp.Ho_ten}.`, 'success');
        refreshData();
      }
    });
  };

  const deleteEmployee = (id: string) => {
    fetch(`/api/employees/${id}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ operatorId: currentUser?.Ma_nhan_vien, operatorName: currentUser?.Ho_ten })
    }).then(res => res.json()).then(data => {
      if (data.success) {
        addToast(`Đã khóa tài khoản của nhân viên ${id}.`, 'info');
        refreshData();
      }
    });
  };

  const addDish = async (dish: Omit<Dish, 'Ma_mon'>): Promise<boolean> => {
    const res = await fetch('/api/dishes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        category_id: dish.Ma_danh_muc,
        name: dish.Ten_mon,
        price: dish.Don_gia,
        description: dish.Mo_ta,
        image_url: dish.Anh_mon,
        status: dish.Trang_thai,
        operatorId: currentUser?.Ma_nhan_vien,
        operatorName: currentUser?.Ho_ten
      })
    });
    const data = await res.json();
    if (data.success) {
      addToast(`Đã thêm món ${dish.Ten_mon} vào thực đơn.`, 'success');
      refreshData();
      return true;
    }
    addToast(data.error || 'Lỗi thêm món ăn.', 'error');
    return false;
  };

  const updateDish = async (dish: Dish): Promise<boolean> => {
    const res = await fetch(`/api/dishes/${dish.Ma_mon}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        category_id: dish.Ma_danh_muc,
        name: dish.Ten_mon,
        price: dish.Don_gia,
        description: dish.Mo_ta,
        image_url: dish.Anh_mon,
        status: dish.Trang_thai,
        operatorId: currentUser?.Ma_nhan_vien,
        operatorName: currentUser?.Ho_ten
      })
    });
    const data = await res.json();
    if (data.success) {
      addToast(`Đã cập nhật món ăn "${dish.Ten_mon}".`, 'success');
      refreshData();
      return true;
    }
    addToast(data.error || 'Cập nhật món ăn thất bại.', 'error');
    return false;
  };

  const deleteDish = (id: string) => {
    fetch(`/api/dishes/${id}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ operatorId: currentUser?.Ma_nhan_vien, operatorName: currentUser?.Ho_ten })
    }).then(res => res.json()).then(data => {
      if (data.success) {
        addToast(`Ngừng phục vụ món ăn ${id} thành công.`, 'info');
        refreshData();
      }
    });
  };

  const updateRecipe = (dishId: string, newRecipe: RecipeItem[]) => {
    const items = newRecipe.map(r => ({
      dish_id: r.Ma_mon,
      material_id: r.Ma_nvl,
      quantity: r.So_luong_dinh_luong,
      unit: r.Don_vi_tinh
    }));

    fetch(`/api/recipes/${dishId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ recipeItems: items, operatorId: currentUser?.Ma_nhan_vien, operatorName: currentUser?.Ho_ten })
    }).then(res => res.json()).then(data => {
      if (data.success) {
        addToast('Cập nhật định lượng công thức món ăn thành công.', 'success');
        refreshData();
      }
    });
  };

  const addCategory = (cat: Category) => {
    fetch('/api/categories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: cat.Ten_danh_muc,
        sort_order: cat.Thu_tu_hien_thi,
        status: cat.Trang_thai,
        operatorId: currentUser?.Ma_nhan_vien,
        operatorName: currentUser?.Ho_ten
      })
    }).then(res => res.json()).then(data => {
      if (data.success) {
        addToast(`Đã tạo danh mục thực đơn "${cat.Ten_danh_muc}".`, 'success');
        refreshData();
      }
    });
  };

  const updateCategory = (cat: Category) => {
    fetch(`/api/categories/${cat.Ma_danh_muc}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: cat.Ten_danh_muc,
        sort_order: cat.Thu_tu_hien_thi,
        status: cat.Trang_thai,
        operatorId: currentUser?.Ma_nhan_vien,
        operatorName: currentUser?.Ho_ten
      })
    }).then(res => res.json()).then(data => {
      if (data.success) {
        refreshData();
      }
    });
  };

  const deleteCategory = (id: string) => {
    fetch(`/api/categories/${id}`, {
      method: 'DELETE'
    }).then(res => res.json()).then(data => {
      if (data.success) {
        refreshData();
      }
    });
  };

  const adjustInventory = async (materialId: string, amount: number, reason: string): Promise<{ success: boolean; error?: string }> => {
    const res = await fetch(`/api/materials/${materialId}/adjust`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount, reason, operatorId: currentUser?.Ma_nhan_vien, operatorName: currentUser?.Ho_ten })
    });
    const data = await res.json();
    if (data.success) {
      addToast('Cân đối tồn kho thủ công thành công.', 'success');
      refreshData();
      return { success: true };
    }
    return { success: false, error: data.error };
  };

  const addNewMaterial = (material: RawMaterial) => {
    fetch('/api/materials', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: material.Ten_nvl,
        unit: material.Don_vi_tinh,
        stock_current: material.Ton_kho_hien_tai,
        stock_min: material.Ton_kho_toi_thieu,
        stock_max: material.Ton_kho_toi_da,
        operatorId: currentUser?.Ma_nhan_vien,
        operatorName: currentUser?.Ho_ten
      })
    }).then(res => res.json()).then(data => {
      if (data.success) {
        addToast(`Thêm nguyên liệu "${material.Ten_nvl}" thành công.`, 'success');
        refreshData();
      }
    });
  };

  const updateMaterial = async (material: RawMaterial): Promise<boolean> => {
    const res = await fetch(`/api/materials/${material.Ma_nvl}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: material.Ten_nvl,
        unit: material.Don_vi_tinh,
        stock_min: material.Ton_kho_toi_thieu,
        stock_max: material.Ton_kho_toi_da,
        operatorId: currentUser?.Ma_nhan_vien,
        operatorName: currentUser?.Ho_ten
      })
    });
    const data = await res.json();
    if (data.success) {
      addToast(`Cập nhật định mức "${material.Ten_nvl}" thành công!`, 'success');
      refreshData();
      return true;
    }
    addToast(data.error || 'Cập nhật định mức thất bại.', 'error');
    return false;
  };

  const addImportReceipt = async (receipt: { shipper: string; note: string; anhDonNhap?: string; items: { materialId: string; quantity: number; price: number }[] }): Promise<{ success: boolean; error?: string }> => {
    const res = await fetch('/api/import-receipts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        shipperName: receipt.shipper,
        notes: receipt.note,
        receiptImage: receipt.anhDonNhap,
        items: receipt.items,
        employeeId: currentUser?.Ma_nhan_vien,
        employeeName: currentUser?.Ho_ten
      })
    });
    const data = await res.json();
    if (data.success) {
      addToast('Biên bản nhập kho đã lưu thành công.', 'success');
      refreshData();
      return { success: true };
    }
    return { success: false, error: data.error };
  };

  const closeSessionAndPay = (sessionId: string) => {
    fetch(`/api/sessions/${sessionId}/pay`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ operatorId: currentUser?.Ma_nhan_vien, operatorName: currentUser?.Ho_ten })
    }).then(res => res.json()).then(data => {
      if (data.success) {
        addToast('Thanh toán thành công! Bàn chuyển về trạng thái Trống.', 'success');
        refreshData();
      }
    });
  };

  const setTableStatusManual = (tableId: string, status: TableStatus) => {
    fetch(`/api/tables/${tableId}/status`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, operatorId: currentUser?.Ma_nhan_vien, operatorName: currentUser?.Ho_ten })
    }).then(res => res.json()).then(data => {
      if (data.success) {
        refreshData();
      }
    });
  };

  const addReservation = (res: Omit<TableReservation, 'Ma_dat_ban'>) => {
    fetch('/api/reservations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        tableId: res.Ma_ban,
        customerName: res.Ten_khach_hang,
        phone: res.So_dien_thoai,
        date: res.Ngay_dat,
        time: res.Gio_dat
      })
    }).then(res => res.json()).then(data => {
      if (data.success) {
        addToast('Lịch đặt bàn trước đã lưu thành công.', 'success');
        refreshData();
      }
    });
  };

  const updateReservationStatus = (resId: string, status: 'Chờ đến' | 'Đã nhận phiên' | 'Đã hủy') => {
    fetch(`/api/reservations/${resId}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, operatorId: currentUser?.Ma_nhan_vien, operatorName: currentUser?.Ho_ten })
    }).then(res => res.json()).then(data => {
      if (data.success) {
        refreshData();
      }
    });
  };

  const updateOrderInvoice = (orderId: string, imageBase64: string) => {
    fetch(`/api/orders/${orderId}/invoice`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ imageBase64, operatorId: currentUser?.Ma_nhan_vien, operatorName: currentUser?.Ho_ten })
    }).then(res => res.json()).then(data => {
      if (data.success) {
        addToast('Đã tải ảnh hóa đơn biên nhận thành công!', 'success');
        refreshData();
      }
    });
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
        inventoryTransactions,
        currentRole,
        setCurrentRole,
        currentUser,
        setCurrentUser,
        selectedTableId,
        setSelectedTableId,
        customerSession,
        setCustomerSession,
        toasts,
        addToast,
        removeToast,
        // Sync API actions
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
        refreshData,
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
