import * as fs from 'fs';
import * as path from 'path';
import * as mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

// Types representation corresponding to database tables
export interface Customer {
  id: string;
  phone: string;
}

export interface DiningTable {
  id: string; // B01..
  floor: number;
  capacity: number;
  status: 'trong' | 'chuan_bi' | 'co_khach' | 'dang_don';
}

export interface TableSession {
  id: string;
  table_id: string;
  customer_id: string | null;
  start_time: string;
  end_time: string | null;
  share_code: string;
  status: 'active' | 'completed';
  guests_count: number;
}

export interface Category {
  id: string;
  name: string;
  sort_order: number;
  status: 'Hiển thị' | 'Ẩn';
}

export interface Dish {
  id: string;
  category_id: string;
  name: string;
  price: number;
  description: string;
  image_url: string;
  status: 'Còn phục vụ' | 'Hết món' | 'Ngừng phục vụ';
}

export interface RecipeItem {
  dish_id: string;
  material_id: string;
  quantity: number; // raw material weight in g/ml/unit
  unit: string;
}

export interface Order {
  id: string;
  session_id: string;
  created_at: string;
  service_status: 'Đang chuẩn bị' | 'Đang chế biến' | 'Đã chế biến' | 'Đã phục vụ';
  total_amount: number;
  invoice_image?: string;
}

export interface OrderDetail {
  id: string;
  order_id: string;
  dish_id: string;
  quantity: number;
  price_at_time: number;
  item_status: 'Đang chờ' | 'Đang chế biến' | 'Đã hoàn thành' | 'Đã phục vụ';
  notes: string;
  ordered_at: string;
}

export interface RawMaterial {
  id: string;
  name: string;
  unit: string;
  stock_current: number;
  stock_min: number;
  stock_max: number;
}

export interface ImportReceipt {
  id: string;
  date_received: string;
  shipper_name: string;
  employee_id: string;
  employee_name: string;
  notes: string;
  total_value: number;
  receipt_image?: string;
}

export interface ImportReceiptDetail {
  receipt_id: string;
  material_id: string;
  quantity_received: number;
  price: number;
}

export interface Employee {
  id: string;
  username: string;
  password_hash: string;
  role: 'Lễ tân' | 'Bếp' | 'Phục vụ' | 'Kho' | 'Quản lý';
  name: string;
  status: 'Hoạt động' | 'Ngừng hoạt động';
  phone: string;
}

export interface SystemLog {
  id: string;
  employee_id: string;
  employee_name: string;
  action: string;
  created_at: string;
  changed_data: string;
}

export interface TableReservation {
  id: string;
  table_id: string;
  customer_name: string;
  phone: string;
  reservation_date: string;
  reservation_time: string;
  status: 'Chờ đến' | 'Đã nhận phiên' | 'Đã hủy';
}

export interface InventoryTransaction {
  id: string;
  material_id: string;
  transaction_type: 'NHAP' | 'XUAT';
  quantity: number;
  created_at: string;
  reference_id: string;
  notes?: string;
}

// Full DB State container
export interface DatabaseSchema {
  customers: Customer[];
  dining_tables: DiningTable[];
  table_sessions: TableSession[];
  categories: Category[];
  dishes: Dish[];
  recipe_items: RecipeItem[];
  orders: Order[];
  order_details: OrderDetail[];
  raw_materials: RawMaterial[];
  import_receipts: ImportReceipt[];
  import_receipt_details: ImportReceiptDetail[];
  employees: Employee[];
  system_logs: SystemLog[];
  table_reservations: TableReservation[];
  inventory_transactions: InventoryTransaction[];
}

const DB_FILE = path.join(process.cwd(), 'database.json');

// Simple hash simulation helper (SHA256 representation of '123456')
export function hashPassword(password: string): string {
  // Simple deterministic hashing for security simulation
  let hash = 0;
  for (let i = 0; i < password.length; i++) {
    const char = password.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return 'hash_' + Math.abs(hash).toString(16);
}

// Default Seed Data
const defaultDbState: DatabaseSchema = {
  employees: [
    { id: 'mv001', username: 'admin', password_hash: hashPassword('123456'), role: 'Quản lý', name: 'Nguyễn Văn A', status: 'Hoạt động', phone: '0912345678' },
    { id: 'mv002', username: 'letan01', password_hash: hashPassword('123456'), role: 'Lễ tân', name: 'Trần Thị B', status: 'Hoạt động', phone: '0987654321' },
    { id: 'mv003', username: 'bep01', password_hash: hashPassword('123456'), role: 'Bếp', name: 'Lê Văn C', status: 'Hoạt động', phone: '0971234567' },
    { id: 'mv004', username: 'phucvu01', password_hash: hashPassword('123456'), role: 'Phục vụ', name: 'Phạm Thị D', status: 'Hoạt động', phone: '0965432109' },
    { id: 'mv005', username: 'kho01', password_hash: hashPassword('123456'), role: 'Kho', name: 'Hoàng Văn E', status: 'Hoạt động', phone: '0933210987' },
    { id: 'mv006', username: 'bep02', password_hash: hashPassword('123456'), role: 'Bếp', name: 'Nguyễn Văn F', status: 'Ngừng hoạt động', phone: '0911222333' }
  ],
  dining_tables: [
    // Floor 1 (B01-B14)
    { id: 'B01', floor: 1, capacity: 4, status: 'trong' },
    { id: 'B02', floor: 1, capacity: 4, status: 'trong' },
    { id: 'B03', floor: 1, capacity: 4, status: 'trong' },
    { id: 'B04', floor: 1, capacity: 6, status: 'co_khach' },
    { id: 'B05', floor: 1, capacity: 4, status: 'trong' },
    { id: 'B06', floor: 1, capacity: 4, status: 'trong' },
    { id: 'B07', floor: 1, capacity: 4, status: 'trong' },
    { id: 'B08', floor: 1, capacity: 4, status: 'trong' },
    { id: 'B09', floor: 1, capacity: 8, status: 'co_khach' },
    { id: 'B10', floor: 1, capacity: 6, status: 'trong' },
    { id: 'B11', floor: 1, capacity: 4, status: 'trong' },
    { id: 'B12', floor: 1, capacity: 4, status: 'trong' },
    { id: 'B13', floor: 1, capacity: 4, status: 'trong' },
    { id: 'B14', floor: 1, capacity: 4, status: 'co_khach' },
    
    // Floor 2 (B15-B28)
    { id: 'B15', floor: 2, capacity: 4, status: 'trong' },
    { id: 'B16', floor: 2, capacity: 4, status: 'trong' },
    { id: 'B17', floor: 2, capacity: 4, status: 'trong' },
    { id: 'B18', floor: 2, capacity: 6, status: 'co_khach' },
    { id: 'B19', floor: 2, capacity: 4, status: 'trong' },
    { id: 'B20', floor: 2, capacity: 4, status: 'trong' },
    { id: 'B21', floor: 2, capacity: 4, status: 'trong' },
    { id: 'B22', floor: 2, capacity: 4, status: 'trong' },
    { id: 'B23', floor: 2, capacity: 8, status: 'co_khach' },
    { id: 'B24', floor: 2, capacity: 4, status: 'trong' },
    { id: 'B25', floor: 2, capacity: 6, status: 'trong' },
    { id: 'B26', floor: 2, capacity: 4, status: 'trong' },
    { id: 'B27', floor: 2, capacity: 4, status: 'trong' },
    { id: 'B28', floor: 2, capacity: 4, status: 'co_khach' },

    // Floor 3 (B29-B42)
    { id: 'B29', floor: 3, capacity: 4, status: 'trong' },
    { id: 'B30', floor: 3, capacity: 4, status: 'trong' },
    { id: 'B31', floor: 3, capacity: 4, status: 'trong' },
    { id: 'B32', floor: 3, capacity: 6, status: 'trong' },
    { id: 'B33', floor: 3, capacity: 4, status: 'trong' },
    { id: 'B34', floor: 3, capacity: 4, status: 'trong' },
    { id: 'B35', floor: 3, capacity: 4, status: 'trong' },
    { id: 'B36', floor: 3, capacity: 4, status: 'trong' },
    { id: 'B37', floor: 3, capacity: 8, status: 'trong' },
    { id: 'B38', floor: 3, capacity: 4, status: 'trong' },
    { id: 'B39', floor: 3, capacity: 6, status: 'trong' },
    { id: 'B40', floor: 3, capacity: 4, status: 'trong' },
    { id: 'B41', floor: 3, capacity: 4, status: 'trong' },
    { id: 'B42', floor: 3, capacity: 4, status: 'trong' },

    // Floor 4 (B43-B56)
    { id: 'B43', floor: 4, capacity: 4, status: 'trong' },
    { id: 'B44', floor: 4, capacity: 4, status: 'trong' },
    { id: 'B45', floor: 4, capacity: 4, status: 'trong' },
    { id: 'B46', floor: 4, capacity: 6, status: 'trong' },
    { id: 'B47', floor: 4, capacity: 4, status: 'trong' },
    { id: 'B48', floor: 4, capacity: 4, status: 'trong' },
    { id: 'B49', floor: 4, capacity: 4, status: 'trong' },
    { id: 'B50', floor: 4, capacity: 4, status: 'trong' },
    { id: 'B51', floor: 4, capacity: 8, status: 'trong' },
    { id: 'B52', floor: 4, capacity: 4, status: 'trong' },
    { id: 'B53', floor: 4, capacity: 6, status: 'trong' },
    { id: 'B54', floor: 4, capacity: 4, status: 'trong' },
    { id: 'B55', floor: 4, capacity: 4, status: 'trong' },
    { id: 'B56', floor: 4, capacity: 4, status: 'trong' }
  ],
  customers: [
    { id: 'kh001', phone: '0912345678' },
    { id: 'kh002', phone: '0987654321' },
    { id: 'kh003', phone: '0971234567' }
  ],
  categories: [
    { id: 'dm05', name: 'Đồ khai vị', sort_order: 1, status: 'Hiển thị' },
    { id: 'dm01', name: 'Lẩu', sort_order: 2, status: 'Hiển thị' },
    { id: 'dm02', name: 'Đồ nhúng lẩu', sort_order: 3, status: 'Hiển thị' },
    { id: 'dm03', name: 'Đồ uống', sort_order: 4, status: 'Hiển thị' }
  ],
  dishes: [
    { id: 'm01', category_id: 'dm01', name: 'Lẩu Nấm Thập Cẩm', price: 299000, description: 'Lẩu nấm thập cẩm với nhiều loại nấm tươi ngon, nước dùng thanh ngọt.', image_url: 'https://images.unsplash.com/photo-1547928500-4722f55cc829?w=600&auto=format&fit=crop&q=60', status: 'Còn phục vụ' },
    { id: 'm02', category_id: 'dm01', name: 'Lẩu Nấm Gà Đen', price: 289000, description: 'Lẩu nấm kết hợp cùng Gà đen giàu dinh dưỡng, thịt gà săn chắc, nước cốt nấm đặc biệt.', image_url: 'https://images.unsplash.com/photo-1598449356475-b9f71db7d847?w=600&auto=format&fit=crop&q=60', status: 'Còn phục vụ' },
    { id: 'm03', category_id: 'dm01', name: 'Lẩu Nấm Hải Sản', price: 329000, description: 'Hương vị biển cả hòa quyện cùng vị ngọt thanh của nấm rừng tự nhiên.', image_url: 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=600&auto=format&fit=crop&q=60', status: 'Còn phục vụ' },
    { id: 'm04', category_id: 'dm02', name: 'Ba chỉ bò Mỹ', price: 159000, description: 'Thịt ba chỉ bò Mỹ thái lát mỏng, xen kẽ vân mỡ hoàn hảo để nhúng lẩu.', image_url: 'https://images.unsplash.com/photo-1514516317472-f558c73c295f?w=600&auto=format&fit=crop&q=60', status: 'Còn phục vụ' },
    { id: 'm05', category_id: 'dm02', name: 'Nấm Kim Châm', price: 39000, description: 'Nấm kim châm tươi, giòn ngọt, thích hợp nhúng lẩu.', image_url: 'https://images.unsplash.com/photo-1504387828639-127924548c41?w=600&auto=format&fit=crop&q=60', status: 'Còn phục vụ' },
    { id: 'm06', category_id: 'dm02', name: 'Nấm bào ngư', price: 39000, description: 'Nấm bào ngư tươi, vị dai bùi tinh khiết.', image_url: 'https://images.unsplash.com/photo-1535254973040-607b474cb50d?w=600&auto=format&fit=crop&q=60', status: 'Còn phục vụ' },
    { id: 'm07', category_id: 'dm02', name: 'Tàu hũ kỵ', price: 35000, description: 'Tàu hũ kỵ chiên giòn, béo ngậy nhúng lẩu nấm cực hợp.', image_url: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=60', status: 'Hết món' },
    { id: 'm08', category_id: 'dm03', name: 'Nước suối Lavie', price: 15000, description: 'Nước suối khoáng chai 500ml mát lạnh.', image_url: 'https://images.unsplash.com/photo-1548839140-29a749e1cf4d?w=600&auto=format&fit=crop&q=60', status: 'Còn phục vụ' }
  ],
  recipe_items: [
    { dish_id: 'm01', material_id: 'nvl01', quantity: 150, unit: 'g' },
    { dish_id: 'm01', material_id: 'nvl02', quantity: 100, unit: 'g' },
    { dish_id: 'm01', material_id: 'nvl03', quantity: 80, unit: 'g' },
    { dish_id: 'm01', material_id: 'nvl04', quantity: 50, unit: 'g' },
    { dish_id: 'm01', material_id: 'nvl05', quantity: 30, unit: 'g' },
    { dish_id: 'm01', material_id: 'nvl06', quantity: 200, unit: 'g' },
    { dish_id: 'm01', material_id: 'nvl07', quantity: 1200, unit: 'ml' },
    { dish_id: 'm02', material_id: 'nvl08', quantity: 500, unit: 'g' },
    { dish_id: 'm02', material_id: 'nvl01', quantity: 100, unit: 'g' },
    { dish_id: 'm02', material_id: 'nvl04', quantity: 50, unit: 'g' },
    { dish_id: 'm02', material_id: 'nvl07', quantity: 1000, unit: 'ml' },
    { dish_id: 'm04', material_id: 'nvl09', quantity: 200, unit: 'g' },
    { dish_id: 'm05', material_id: 'nvl01', quantity: 150, unit: 'g' },
    { dish_id: 'm06', material_id: 'nvl02', quantity: 150, unit: 'g' },
    { dish_id: 'm08', material_id: 'nvl10', quantity: 1, unit: 'chai' }
  ],
  raw_materials: [
    { id: 'nvl01', name: 'Nấm kim châm', unit: 'g', stock_current: 8200, stock_min: 2000, stock_max: 20000 },
    { id: 'nvl02', name: 'Nấm bào ngư', unit: 'g', stock_current: 4000, stock_min: 1500, stock_max: 15000 },
    { id: 'nvl03', name: 'Nấm đùi gà', unit: 'g', stock_current: 1200, stock_min: 1000, stock_max: 10000 },
    { id: 'nvl04', name: 'Nấm hương', unit: 'g', stock_current: 600, stock_min: 800, stock_max: 8000 },
    { id: 'nvl05', name: 'Nấm tuyết', unit: 'g', stock_current: 1500, stock_min: 500, stock_max: 5000 },
    { id: 'nvl06', name: 'Đậu hũ non', unit: 'g', stock_current: 16000, stock_min: 2000, stock_max: 15000 },
    { id: 'nvl07', name: 'Nước dùng', unit: 'ml', stock_current: 110000, stock_min: 20000, stock_max: 250000 },
    { id: 'nvl08', name: 'Gà đen', unit: 'g', stock_current: 0, stock_min: 2000, stock_max: 15000 },
    { id: 'nvl09', name: 'Thịt bò Mỹ', unit: 'g', stock_current: 25000, stock_min: 5000, stock_max: 50000 },
    { id: 'nvl10', name: 'Nước suối chai', unit: 'chai', stock_current: 48, stock_min: 20, stock_max: 200 }
  ],
  table_sessions: [
    { id: 's_B04', table_id: 'B04', customer_id: 'kh001', start_time: new Date(Date.now() - 45 * 60000).toISOString(), end_time: null, share_code: '0987.654.321', status: 'active', guests_count: 4 },
    { id: 's_B09', table_id: 'B09', customer_id: 'kh002', start_time: new Date(Date.now() - 90 * 60000).toISOString(), end_time: null, share_code: '0912.345.678', status: 'active', guests_count: 5 },
    { id: 's_B14', table_id: 'B14', customer_id: 'kh003', start_time: new Date(Date.now() - 555 * 60000).toISOString(), end_time: null, share_code: '0934.567.890', status: 'active', guests_count: 2 }
  ],
  orders: [
    { id: 'o_B04_1', session_id: 's_B04', created_at: new Date(Date.now() - 40 * 60000).toISOString(), service_status: 'Đang chế biến', total_amount: 617000 },
    { id: 'o_B09_1', session_id: 's_B09', created_at: new Date(Date.now() - 10 * 60000).toISOString(), service_status: 'Đang chuẩn bị', total_amount: 1680000 },
    { id: 'o_B14_1', session_id: 's_B14', created_at: new Date(Date.now() - 85 * 60000).toISOString(), service_status: 'Đã phục vụ', total_amount: 1250000 }
  ],
  order_details: [
    { id: 'od_1', order_id: 'o_B04_1', dish_id: 'm01', quantity: 1, price_at_time: 299000, item_status: 'Đã phục vụ', notes: 'Ít cay, không hành', ordered_at: new Date(Date.now() - 40 * 60000).toISOString() },
    { id: 'od_2', order_id: 'o_B04_1', dish_id: 'm04', quantity: 2, price_at_time: 159000, item_status: 'Đã phục vụ', notes: '', ordered_at: new Date(Date.now() - 40 * 60000).toISOString() },
    { id: 'od_3', order_id: 'o_B09_1', dish_id: 'm01', quantity: 4, price_at_time: 299000, item_status: 'Đang chờ', notes: '', ordered_at: new Date(Date.now() - 10 * 60000).toISOString() },
    { id: 'od_4', order_id: 'o_B09_1', dish_id: 'm04', quantity: 3, price_at_time: 159000, item_status: 'Đang chế biến', notes: 'Nước dùng nhiều sả', ordered_at: new Date(Date.now() - 10 * 60000).toISOString() },
    { id: 'od_5', order_id: 'o_B09_1', dish_id: 'm08', quantity: 6, price_at_time: 15000, item_status: 'Đã hoàn thành', notes: 'Lấy nhiều đá', ordered_at: new Date(Date.now() - 10 * 60000).toISOString() },
    { id: 'od_6', order_id: 'o_B14_1', dish_id: 'm03', quantity: 3, price_at_time: 329000, item_status: 'Đã phục vụ', notes: '', ordered_at: new Date(Date.now() - 85 * 60000).toISOString() },
    { id: 'od_7', order_id: 'o_B14_1', dish_id: 'm05', quantity: 5, price_at_time: 39000, item_status: 'Đã phục vụ', notes: '', ordered_at: new Date(Date.now() - 85 * 60000).toISOString() },
    { id: 'od_8', order_id: 'o_B14_1', dish_id: 'm08', quantity: 4, price_at_time: 15000, item_status: 'Đã phục vụ', notes: '', ordered_at: new Date(Date.now() - 85 * 60000).toISOString() }
  ],
  import_receipts: [
    { id: 'bb_001', date_received: '2026-06-11T10:00:00Z', shipper_name: 'Nguyễn Văn Định (NhaCungCap Việt)', employee_id: 'mv005', employee_name: 'Hoàng Văn E', notes: 'Nhận đầy đủ nấm tươi và nước dùng đóng chai.', total_value: 7700000 },
    { id: 'bb_002', date_received: '2026-06-12T14:30:00Z', shipper_name: 'Công ty Thực phẩm Sạch Gia Khánh', employee_id: 'mv005', employee_name: 'Hoàng Văn E', notes: 'Nhập hàng khẩn cấp buổi chiều.', total_value: 1800000 }
  ],
  import_receipt_details: [
    { receipt_id: 'bb_001', material_id: 'nvl01', quantity_received: 10000, price: 45000 },
    { receipt_id: 'bb_001', material_id: 'nvl02', quantity_received: 5000, price: 50000 },
    { receipt_id: 'bb_001', material_id: 'nvl10', quantity_received: 100, price: 7000 },
    { receipt_id: 'bb_002', material_id: 'nvl09', quantity_received: 15000, price: 120000 }
  ],
  system_logs: [
    { id: 'log_001', employee_id: 'mv001', employee_name: 'Nguyễn Văn A', action: 'Khởi tạo hệ thống', created_at: '2026-06-11T08:00:00Z', changed_data: 'Tải cấu hình ban đầu' },
    { id: 'log_002', employee_id: 'mv001', employee_name: 'Nguyễn Văn A', action: 'Cập nhật giá thực đơn', created_at: '2026-06-11T09:12:00Z', changed_data: 'Giá Lẩu Thập Cẩm -> 299.000đ' },
    { id: 'log_003', employee_id: 'mv005', employee_name: 'Hoàng Văn E', action: 'Xác nhận biên bản nhập kho', created_at: '2026-06-12T14:35:00Z', changed_data: 'Biên bản bb_002, +15.000g Thịt bò Mỹ' }
  ],
  table_reservations: [
    { id: 'db_01', table_id: 'B04', customer_name: 'Nguyễn Lâm Hoàng', phone: '0388998877', reservation_date: new Date().toISOString().split('T')[0], reservation_time: '19:00', status: 'Chờ đến' },
    { id: 'db_02', table_id: 'B01', customer_name: 'Phạm Thanh Hà', phone: '0977665544', reservation_date: new Date(Date.now() + 86400000).toISOString().split('T')[0], reservation_time: '18:30', status: 'Chờ đến' }
  ],
  inventory_transactions: [
    { id: 'tx_001', material_id: 'nvl01', transaction_type: 'NHAP', quantity: 10000, created_at: '2026-06-11T10:00:00Z', reference_id: 'bb_001', notes: 'Nhập hàng từ nhà cung cấp' },
    { id: 'tx_002', material_id: 'nvl02', transaction_type: 'NHAP', quantity: 5000, created_at: '2026-06-11T10:00:00Z', reference_id: 'bb_001', notes: 'Nhập hàng từ nhà cung cấp' },
    { id: 'tx_003', material_id: 'nvl10', transaction_type: 'NHAP', quantity: 100, created_at: '2026-06-11T10:00:00Z', reference_id: 'bb_001', notes: 'Nhập hàng từ nhà cung cấp' },
    { id: 'tx_004', material_id: 'nvl09', transaction_type: 'NHAP', quantity: 15000, created_at: '2026-06-12T14:30:00Z', reference_id: 'bb_002', notes: 'Nhập hàng khẩn cấp buổi chiều' }
  ]
};

export class Database {
  private state: DatabaseSchema;
  private pool: mysql.Pool | null = null;

  constructor() {
    this.state = defaultDbState;
  }

  public async init(): Promise<void> {
    const useMysql = process.env.USE_MYSQL === 'true';
    if (!useMysql) {
      console.log('USE_MYSQL is false. Using JSON file-based database.');
      this.state = this.read();
      return;
    }

    console.log('USE_MYSQL is true. Connecting to MySQL Database...');
    const host = process.env.DB_HOST || 'localhost';
    const port = Number(process.env.DB_PORT || 3306);
    const user = process.env.DB_USER || 'root';
    const password = process.env.DB_PASSWORD || '';
    const databaseName = process.env.DB_NAME || 'lau_nam_gia_khanh';

    try {
      this.pool = mysql.createPool({
        host,
        port,
        user,
        password,
        database: databaseName,
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0
      });

      // Test connection
      await this.pool.query('SELECT 1');
      console.log('MySQL connection pool established successfully.');

      // Load all 15 tables from MySQL
      const tables = [
        'customers', 'dining_tables', 'table_sessions', 'categories', 'dishes',
        'recipe_items', 'orders', 'order_details', 'raw_materials',
        'import_receipts', 'import_receipt_details', 'employees', 'system_logs',
        'table_reservations', 'inventory_transactions'
      ];

      const newState: any = {};
      for (const table of tables) {
        const [rows] = await this.pool.query(`SELECT * FROM \`${table}\``);
        newState[table] = rows;
      }
      
      this.state = newState as DatabaseSchema;
      console.log('All data loaded from MySQL into cache state.');
    } catch (err: any) {
      console.error('MySQL initialization failed, falling back to JSON file:', err.message);
      this.state = this.read();
    }
  }

  private read(): DatabaseSchema {
    if (!fs.existsSync(DB_FILE)) {
      this.writeAtomic(defaultDbState);
      return defaultDbState;
    }
    try {
      const data = fs.readFileSync(DB_FILE, 'utf8');
      return JSON.parse(data);
    } catch (e) {
      console.error('Error reading database file, using default schema:', e);
      return defaultDbState;
    }
  }

  private writeAtomic(data: DatabaseSchema) {
    const tmpFile = DB_FILE + '.tmp';
    try {
      fs.writeFileSync(tmpFile, JSON.stringify(data, null, 2), 'utf8');
      fs.renameSync(tmpFile, DB_FILE);
    } catch (e) {
      console.error('Atomic write failed, attempting standard write:', e);
      try {
        fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf8');
      } catch (writeError) {
        console.error('Database write completely failed:', writeError);
      }
    }
  }

  private async saveToMySql(table: string, data: any[]) {
    if (!this.pool) return;
    try {
      const conn = await this.pool.getConnection();
      try {
        await conn.query('SET FOREIGN_KEY_CHECKS = 0');
        await conn.query(`TRUNCATE TABLE \`${table}\``);
        await conn.query('SET FOREIGN_KEY_CHECKS = 1');
        
        if (data.length > 0) {
          for (const row of data) {
            const cols = Object.keys(row);
            const vals = Object.values(row);
            const placeholders = cols.map(() => '?').join(', ');
            const sql = `INSERT IGNORE INTO \`${table}\` (${cols.map(c => `\`${c}\``).join(', ')}) VALUES (${placeholders})`;
            await conn.query(sql, vals);
          }
        }
      } finally {
        conn.release();
      }
    } catch (err) {
      console.error(`Error saving table ${table} to MySQL:`, err);
    }
  }

  public get<K extends keyof DatabaseSchema>(table: K): DatabaseSchema[K] {
    if (process.env.USE_MYSQL !== 'true') {
      this.state = this.read(); // Refresh memory state from disk for JSON mode
    }
    return this.state[table];
  }

  public save<K extends keyof DatabaseSchema>(table: K, data: DatabaseSchema[K]) {
    this.state[table] = data as any;
    
    if (process.env.USE_MYSQL === 'true' && this.pool) {
      this.saveToMySql(table, data).catch(err => {
        console.error(`MySQL async save error on table ${table}:`, err);
      });
    } else {
      this.writeAtomic(this.state);
    }
  }

  // Transaction support helper
  public runTransaction(callback: (db: Database) => boolean): boolean {
    const backupState = JSON.parse(JSON.stringify(this.state));
    try {
      const success = callback(this);
      if (success) {
        if (process.env.USE_MYSQL === 'true' && this.pool) {
          const tables = Object.keys(this.state) as Array<keyof DatabaseSchema>;
          for (const table of tables) {
            if (JSON.stringify(backupState[table]) !== JSON.stringify(this.state[table])) {
              this.saveToMySql(table, this.state[table]).catch(err => {
                console.error(`MySQL transaction sync error on table ${table}:`, err);
              });
            }
          }
        } else {
          this.writeAtomic(this.state);
        }
        return true;
      } else {
        this.state = backupState;
        return false;
      }
    } catch (e) {
      console.error('Transaction rolled back due to error:', e);
      this.state = backupState;
      return false;
    }
  }
}

export const db = new Database();
