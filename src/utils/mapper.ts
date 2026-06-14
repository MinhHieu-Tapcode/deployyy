import * as types from '../types';

export function mapTableToFrontend(t: any): types.DiningTable {
  return {
    Ma_ban: t.id,
    Tang: t.floor,
    Suc_chua: t.capacity,
    Trang_thai: t.status as types.TableStatus
  };
}

export function mapCustomerToFrontend(c: any): types.Customer {
  return {
    Ma_khach_hang: c.id,
    So_dien_thoai: c.phone
  };
}

export function mapSessionToFrontend(s: any): types.Session {
  return {
    Ma_phien: s.id,
    Ma_ban: s.table_id,
    Ma_khach_hang: s.customer_id,
    Thoi_gian_bat_dau: s.start_time,
    Thoi_gian_ket_thuc: s.end_time,
    Ma_phien_code: s.share_code,
    Trang_thai: s.status,
    So_khach: s.guests_count || 4,
    customer_phone: s.customer_phone,
    customer_name: s.customer_name,
    created_by: s.created_by
  } as any; // Using type casting to support extended property safely
}

export function mapCategoryToFrontend(c: any): types.Category {
  return {
    Ma_danh_muc: c.id,
    Ten_danh_muc: c.name,
    Thu_tu_hien_thi: c.sort_order,
    Trang_thai: c.status as any
  };
}

export function mapDishToFrontend(d: any): types.Dish {
  return {
    Ma_mon: d.id,
    Ma_danh_muc: d.category_id,
    Ten_mon: d.name,
    Don_gia: Number(d.price),
    Mo_ta: d.description,
    Anh_mon: d.image_url,
    Trang_thai: d.status as types.DishStatus
  };
}

export function mapRecipeToFrontend(r: any): types.RecipeItem {
  return {
    Ma_mon: r.dish_id,
    Ma_nvl: r.material_id,
    So_luong_dinh_luong: r.quantity,
    Don_vi_tinh: r.unit
  };
}

export function mapOrderToFrontend(o: any): types.Order {
  return {
    Ma_hd_dat_mon: o.id,
    Ma_phien: o.session_id,
    Thoi_gian: o.created_at,
    Trang_thai_phuc_vu: o.service_status,
    Tong_tien: Number(o.total_amount),
    Anh_hoa_don: o.invoice_image
  };
}

export function mapOrderDetailToFrontend(od: any): types.OrderDetail {
  return {
    Ma_detail_id: od.id,
    Ma_hd_dat_mon: od.order_id,
    Ma_mon: od.dish_id,
    So_luong: Number(od.quantity),
    Don_gia_tai_thoi_diem: Number(od.price_at_time),
    Trang_thai_mon: od.item_status as types.OrderItemStatus,
    Ghi_chu: od.notes,
    Thoi_gian_dat: od.ordered_at
  };
}

export function mapMaterialToFrontend(m: any): types.RawMaterial {
  return {
    Ma_nvl: m.id,
    Ten_nvl: m.name,
    Don_vi_tinh: m.unit,
    Ton_kho_hien_tai: Number(m.stock_current),
    Ton_kho_toi_thieu: Number(m.stock_min),
    Ton_kho_toi_da: Number(m.stock_max)
  };
}

export function mapImportReceiptToFrontend(r: any): types.ImportReceipt {
  return {
    Ma_bb: r.id,
    Ngay_nhan: r.date_received,
    Ten_nguoi_giao: r.shipper_name,
    Ma_nhan_vien: r.employee_id,
    Ho_ten_nhan_vien: r.employee_name,
    Ghi_chu: r.notes,
    Tong_tien: Number(r.total_value),
    Anh_don_nhap: r.receipt_image,
    Chi_tiet: (r.Chi_tiet || []).map((d: any) => ({
      Ma_nvl: d.material_id,
      So_luong_thuc_nhan: Number(d.quantity_received),
      Don_gia_tham_khao: Number(d.price)
    }))
  };
}

export function mapEmployeeToFrontend(e: any): types.Employee {
  return {
    Ma_nhan_vien: e.id,
    Ho_ten: e.name,
    Vai_tro: e.role as types.UserRole,
    Trang_thai_tai_khoan: e.status as any,
    Ten_dang_nhap: e.username,
    Mat_khau_hash: e.password_hash,
    SOT: e.phone
  };
}

export function mapLogToFrontend(l: any): types.SystemLog {
  return {
    Ma_log: l.id,
    Ma_nhan_vien: l.employee_id,
    Ten_nhan_vien: l.employee_name,
    Hanh_dong: l.action,
    Thoi_gian: l.created_at,
    Du_lieu_thay_doi: l.changed_data
  };
}

export function mapReservationToFrontend(r: any): types.TableReservation {
  return {
    Ma_dat_ban: r.id,
    Ma_ban: r.table_id,
    Ten_khach_hang: r.customer_name,
    So_dien_thoai: r.phone,
    Ngay_dat: r.reservation_date,
    Gio_dat: r.reservation_time,
    Trang_thai: r.status as any
  };
}
