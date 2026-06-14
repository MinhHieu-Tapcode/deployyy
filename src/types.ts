/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export enum TableStatus {
  TRONG = 'trong', // Trống (Xanh lá)
  CHUAN_BI = 'chuan_bi', // Đang chuẩn bị (Vàng)
  CO_KHACH = 'co_khach', // Có khách (Đỏ)
  DANG_DON = 'dang_don', // Đang dọn (Cam)
}

export enum TableStatusLabel {
  trong = 'Trống',
  chuan_bi = 'Đang chuẩn bị',
  co_khach = 'Có khách',
  dang_don = 'Đang dọn',
}

export enum DishStatus {
  CON_PHUC_VU = 'Còn phục vụ',
  HET_MON = 'Hết món',
  NGUNG_PHUC_VU = 'Ngừng phục vụ',
}

export enum OrderItemStatus {
  DANG_CHO = 'Đang chờ',
  DANG_CHE_BIEN = 'Đang chế biến',
  DA_HOAN_THANH = 'Đã hoàn thành',
  DA_PHUC_VU = 'Đã phục vụ',
}

export enum MaterialStatus {
  DU_HANG = 'Đủ hàng',
  SAP_HET = 'Sắp hết',
  HET_HANG = 'Hết hàng',
  QUA_MUC = 'Quá mức',
}

export enum UserRole {
  LE_TAN = 'Lễ tân',
  BEP = 'Bếp',
  PHUC_VU = 'Phục vụ',
  KHO = 'Kho',
  QUAN_LY = 'Quản lý',
}

export interface Customer {
  Ma_khach_hang: string;
  So_dien_thoai: string;
}

export interface DiningTable {
  Ma_ban: string;
  Tang: number;
  Suc_chua: number;
  Trang_thai: TableStatus;
}

export interface Session {
  Ma_phien: string;
  Ma_ban: string;
  Ma_khach_hang: string | null;
  Thoi_gian_bat_dau: string;
  Thoi_gian_ket_thuc: string | null;
  Ma_phien_code: string;
  Trang_thai: 'active' | 'completed';
  customer_phone?: string;
  created_by?: string | null;
}

export interface Category {
  Ma_danh_muc: string;
  Ten_danh_muc: string;
  Thu_tu_hien_thi: number;
  Trang_thai: 'Hiển thị' | 'Ẩn';
}

export interface Dish {
  Ma_mon: string;
  Ma_danh_muc: string;
  Ten_mon: string;
  Don_gia: number;
  Mo_ta: string;
  Anh_mon: string;
  Trang_thai: DishStatus;
}

export interface RecipeItem {
  Ma_mon: string;
  Ma_nvl: string;
  So_luong_dinh_luong: number; // For 1 unit of dish
  Don_vi_tinh: string;
}

export interface Order {
  Ma_hd_dat_mon: string;
  Ma_phien: string;
  Thoi_gian: string;
  Trang_thai_phuc_vu: string;
  Tong_tien: number;
  Anh_hoa_don?: string;
}

export interface OrderDetail {
  Ma_detail_id: string; // Internal helper unique key
  Ma_hd_dat_mon: string;
  Ma_mon: string;
  So_luong: number;
  Don_gia_tai_thoi_diem: number;
  Trang_thai_mon: OrderItemStatus;
  Ghi_chu: string;
  Thoi_gian_dat: string; // ISO string to track elapsed time (Kanban)
}

export interface RawMaterial {
  Ma_nvl: string;
  Ten_nvl: string;
  Don_vi_tinh: string;
  Ton_kho_hien_tai: number;
  Ton_kho_toi_thieu: number;
  Ton_kho_toi_da: number;
}

export interface ImportReceipt {
  Ma_bb: string;
  Ngay_nhan: string;
  Ten_nguoi_giao: string;
  Ma_nhan_vien: string;
  Ho_ten_nhan_vien: string;
  Ghi_chu: string;
  Chi_tiet: ImportReceiptDetail[];
  Tong_tien?: number;
  Anh_don_nhap?: string; // Base64 string hoặc URL ảnh tải lên của biên bản nhập kho
}

export interface TableReservation {
  Ma_dat_ban: string;
  Ma_ban: string;
  Ten_khach_hang: string;
  So_dien_thoai: string;
  Ngay_dat: string; // YYYY-MM-DD dạng ngày đặt
  Gio_dat: string; // HH:MM dạng giờ đặt
  Trang_thai: 'Chờ đến' | 'Đã nhận phiên' | 'Đã hủy';
}

export interface ImportReceiptDetail {
  Ma_nvl: string;
  So_luong_thuc_nhan: number;
  Don_gia_tham_khao: number;
}

export interface Employee {
  Ma_nhan_vien: string;
  Ho_ten: string;
  Vai_tro: UserRole;
  Trang_thai_tai_khoan: 'Hoạt động' | 'Ngừng hoạt động';
  Ten_dang_nhap: string;
  Mat_khau_hash: string;
  SOT: string; // Số điện thoại
}

export interface SystemLog {
  Ma_log: string;
  Ma_nhan_vien: string;
  Ten_nhan_vien: string;
  Hanh_dong: string;
  Thoi_gian: string;
  Du_lieu_thay_doi: string;
}
