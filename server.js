// server.ts
import express from "express";
import * as path2 from "path";
import * as fs2 from "fs";

// db.ts
import * as fs from "fs";
import * as path from "path";
import * as mysql from "mysql2/promise";
import dotenv from "dotenv";
dotenv.config();
var DB_FILE = path.join(process.cwd(), "database.json");
function hashPassword(password) {
  let hash = 0;
  for (let i = 0; i < password.length; i++) {
    const char = password.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return "hash_" + Math.abs(hash).toString(16);
}
var defaultDbState = {
  employees: [
    { id: "mv001", username: "admin", password_hash: hashPassword("123456"), role: "Qu\u1EA3n l\xFD", name: "Nguy\u1EC5n V\u0103n A", status: "Ho\u1EA1t \u0111\u1ED9ng", phone: "0912345678" },
    { id: "mv002", username: "letan01", password_hash: hashPassword("123456"), role: "L\u1EC5 t\xE2n", name: "Tr\u1EA7n Th\u1ECB B", status: "Ho\u1EA1t \u0111\u1ED9ng", phone: "0987654321" },
    { id: "mv003", username: "bep01", password_hash: hashPassword("123456"), role: "B\u1EBFp", name: "L\xEA V\u0103n C", status: "Ho\u1EA1t \u0111\u1ED9ng", phone: "0971234567" },
    { id: "mv004", username: "phucvu01", password_hash: hashPassword("123456"), role: "Ph\u1EE5c v\u1EE5", name: "Ph\u1EA1m Th\u1ECB D", status: "Ho\u1EA1t \u0111\u1ED9ng", phone: "0965432109" },
    { id: "mv005", username: "kho01", password_hash: hashPassword("123456"), role: "Kho", name: "Ho\xE0ng V\u0103n E", status: "Ho\u1EA1t \u0111\u1ED9ng", phone: "0933210987" },
    { id: "mv006", username: "bep02", password_hash: hashPassword("123456"), role: "B\u1EBFp", name: "Nguy\u1EC5n V\u0103n F", status: "Ng\u1EEBng ho\u1EA1t \u0111\u1ED9ng", phone: "0911222333" }
  ],
  dining_tables: [
    // Floor 1 (B01-B14)
    { id: "B01", floor: 1, capacity: 4, status: "trong" },
    { id: "B02", floor: 1, capacity: 4, status: "trong" },
    { id: "B03", floor: 1, capacity: 4, status: "trong" },
    { id: "B04", floor: 1, capacity: 6, status: "co_khach" },
    { id: "B05", floor: 1, capacity: 4, status: "trong" },
    { id: "B06", floor: 1, capacity: 4, status: "trong" },
    { id: "B07", floor: 1, capacity: 4, status: "trong" },
    { id: "B08", floor: 1, capacity: 4, status: "trong" },
    { id: "B09", floor: 1, capacity: 8, status: "co_khach" },
    { id: "B10", floor: 1, capacity: 6, status: "trong" },
    { id: "B11", floor: 1, capacity: 4, status: "trong" },
    { id: "B12", floor: 1, capacity: 4, status: "trong" },
    { id: "B13", floor: 1, capacity: 4, status: "trong" },
    { id: "B14", floor: 1, capacity: 4, status: "co_khach" },
    // Floor 2 (B15-B28)
    { id: "B15", floor: 2, capacity: 4, status: "trong" },
    { id: "B16", floor: 2, capacity: 4, status: "trong" },
    { id: "B17", floor: 2, capacity: 4, status: "trong" },
    { id: "B18", floor: 2, capacity: 6, status: "co_khach" },
    { id: "B19", floor: 2, capacity: 4, status: "trong" },
    { id: "B20", floor: 2, capacity: 4, status: "trong" },
    { id: "B21", floor: 2, capacity: 4, status: "trong" },
    { id: "B22", floor: 2, capacity: 4, status: "trong" },
    { id: "B23", floor: 2, capacity: 8, status: "co_khach" },
    { id: "B24", floor: 2, capacity: 4, status: "trong" },
    { id: "B25", floor: 2, capacity: 6, status: "trong" },
    { id: "B26", floor: 2, capacity: 4, status: "trong" },
    { id: "B27", floor: 2, capacity: 4, status: "trong" },
    { id: "B28", floor: 2, capacity: 4, status: "co_khach" },
    // Floor 3 (B29-B42)
    { id: "B29", floor: 3, capacity: 4, status: "trong" },
    { id: "B30", floor: 3, capacity: 4, status: "trong" },
    { id: "B31", floor: 3, capacity: 4, status: "trong" },
    { id: "B32", floor: 3, capacity: 6, status: "trong" },
    { id: "B33", floor: 3, capacity: 4, status: "trong" },
    { id: "B34", floor: 3, capacity: 4, status: "trong" },
    { id: "B35", floor: 3, capacity: 4, status: "trong" },
    { id: "B36", floor: 3, capacity: 4, status: "trong" },
    { id: "B37", floor: 3, capacity: 8, status: "trong" },
    { id: "B38", floor: 3, capacity: 4, status: "trong" },
    { id: "B39", floor: 3, capacity: 6, status: "trong" },
    { id: "B40", floor: 3, capacity: 4, status: "trong" },
    { id: "B41", floor: 3, capacity: 4, status: "trong" },
    { id: "B42", floor: 3, capacity: 4, status: "trong" },
    // Floor 4 (B43-B56)
    { id: "B43", floor: 4, capacity: 4, status: "trong" },
    { id: "B44", floor: 4, capacity: 4, status: "trong" },
    { id: "B45", floor: 4, capacity: 4, status: "trong" },
    { id: "B46", floor: 4, capacity: 6, status: "trong" },
    { id: "B47", floor: 4, capacity: 4, status: "trong" },
    { id: "B48", floor: 4, capacity: 4, status: "trong" },
    { id: "B49", floor: 4, capacity: 4, status: "trong" },
    { id: "B50", floor: 4, capacity: 4, status: "trong" },
    { id: "B51", floor: 4, capacity: 8, status: "trong" },
    { id: "B52", floor: 4, capacity: 4, status: "trong" },
    { id: "B53", floor: 4, capacity: 6, status: "trong" },
    { id: "B54", floor: 4, capacity: 4, status: "trong" },
    { id: "B55", floor: 4, capacity: 4, status: "trong" },
    { id: "B56", floor: 4, capacity: 4, status: "trong" }
  ],
  customers: [
    { id: "kh001", phone: "0912345678" },
    { id: "kh002", phone: "0987654321" },
    { id: "kh003", phone: "0971234567" }
  ],
  categories: [
    { id: "dm05", name: "\u0110\u1ED3 khai v\u1ECB", sort_order: 1, status: "Hi\u1EC3n th\u1ECB" },
    { id: "dm01", name: "L\u1EA9u", sort_order: 2, status: "Hi\u1EC3n th\u1ECB" },
    { id: "dm02", name: "\u0110\u1ED3 nh\xFAng l\u1EA9u", sort_order: 3, status: "Hi\u1EC3n th\u1ECB" },
    { id: "dm03", name: "\u0110\u1ED3 u\u1ED1ng", sort_order: 4, status: "Hi\u1EC3n th\u1ECB" }
  ],
  dishes: [
    { id: "m01", category_id: "dm01", name: "L\u1EA9u N\u1EA5m Th\u1EADp C\u1EA9m", price: 299e3, description: "L\u1EA9u n\u1EA5m th\u1EADp c\u1EA9m v\u1EDBi nhi\u1EC1u lo\u1EA1i n\u1EA5m t\u01B0\u01A1i ngon, n\u01B0\u1EDBc d\xF9ng thanh ng\u1ECDt.", image_url: "https://images.unsplash.com/photo-1547928500-4722f55cc829?w=600&auto=format&fit=crop&q=60", status: "C\xF2n ph\u1EE5c v\u1EE5" },
    { id: "m02", category_id: "dm01", name: "L\u1EA9u N\u1EA5m G\xE0 \u0110en", price: 289e3, description: "L\u1EA9u n\u1EA5m k\u1EBFt h\u1EE3p c\xF9ng G\xE0 \u0111en gi\xE0u dinh d\u01B0\u1EE1ng, th\u1ECBt g\xE0 s\u0103n ch\u1EAFc, n\u01B0\u1EDBc c\u1ED1t n\u1EA5m \u0111\u1EB7c bi\u1EC7t.", image_url: "https://images.unsplash.com/photo-1598449356475-b9f71db7d847?w=600&auto=format&fit=crop&q=60", status: "C\xF2n ph\u1EE5c v\u1EE5" },
    { id: "m03", category_id: "dm01", name: "L\u1EA9u N\u1EA5m H\u1EA3i S\u1EA3n", price: 329e3, description: "H\u01B0\u01A1ng v\u1ECB bi\u1EC3n c\u1EA3 h\xF2a quy\u1EC7n c\xF9ng v\u1ECB ng\u1ECDt thanh c\u1EE7a n\u1EA5m r\u1EEBng t\u1EF1 nhi\xEAn.", image_url: "https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=600&auto=format&fit=crop&q=60", status: "C\xF2n ph\u1EE5c v\u1EE5" },
    { id: "m04", category_id: "dm02", name: "Ba ch\u1EC9 b\xF2 M\u1EF9", price: 159e3, description: "Th\u1ECBt ba ch\u1EC9 b\xF2 M\u1EF9 th\xE1i l\xE1t m\u1ECFng, xen k\u1EBD v\xE2n m\u1EE1 ho\xE0n h\u1EA3o \u0111\u1EC3 nh\xFAng l\u1EA9u.", image_url: "https://images.unsplash.com/photo-1514516317472-f558c73c295f?w=600&auto=format&fit=crop&q=60", status: "C\xF2n ph\u1EE5c v\u1EE5" },
    { id: "m05", category_id: "dm02", name: "N\u1EA5m Kim Ch\xE2m", price: 39e3, description: "N\u1EA5m kim ch\xE2m t\u01B0\u01A1i, gi\xF2n ng\u1ECDt, th\xEDch h\u1EE3p nh\xFAng l\u1EA9u.", image_url: "https://images.unsplash.com/photo-1504387828639-127924548c41?w=600&auto=format&fit=crop&q=60", status: "C\xF2n ph\u1EE5c v\u1EE5" },
    { id: "m06", category_id: "dm02", name: "N\u1EA5m b\xE0o ng\u01B0", price: 39e3, description: "N\u1EA5m b\xE0o ng\u01B0 t\u01B0\u01A1i, v\u1ECB dai b\xF9i tinh khi\u1EBFt.", image_url: "https://images.unsplash.com/photo-1535254973040-607b474cb50d?w=600&auto=format&fit=crop&q=60", status: "C\xF2n ph\u1EE5c v\u1EE5" },
    { id: "m07", category_id: "dm02", name: "T\xE0u h\u0169 k\u1EF5", price: 35e3, description: "T\xE0u h\u0169 k\u1EF5 chi\xEAn gi\xF2n, b\xE9o ng\u1EADy nh\xFAng l\u1EA9u n\u1EA5m c\u1EF1c h\u1EE3p.", image_url: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=60", status: "H\u1EBFt m\xF3n" },
    { id: "m08", category_id: "dm03", name: "N\u01B0\u1EDBc su\u1ED1i Lavie", price: 15e3, description: "N\u01B0\u1EDBc su\u1ED1i kho\xE1ng chai 500ml m\xE1t l\u1EA1nh.", image_url: "https://images.unsplash.com/photo-1548839140-29a749e1cf4d?w=600&auto=format&fit=crop&q=60", status: "C\xF2n ph\u1EE5c v\u1EE5" }
  ],
  recipe_items: [
    { dish_id: "m01", material_id: "nvl01", quantity: 0.15, unit: "kg" },
    { dish_id: "m01", material_id: "nvl02", quantity: 0.1, unit: "kg" },
    { dish_id: "m01", material_id: "nvl03", quantity: 0.08, unit: "kg" },
    { dish_id: "m01", material_id: "nvl04", quantity: 0.05, unit: "kg" },
    { dish_id: "m01", material_id: "nvl05", quantity: 0.03, unit: "kg" },
    { dish_id: "m01", material_id: "nvl06", quantity: 0.2, unit: "kg" },
    { dish_id: "m01", material_id: "nvl07", quantity: 1.2, unit: "l" },
    { dish_id: "m02", material_id: "nvl08", quantity: 0.5, unit: "kg" },
    { dish_id: "m02", material_id: "nvl01", quantity: 0.1, unit: "kg" },
    { dish_id: "m02", material_id: "nvl04", quantity: 0.05, unit: "kg" },
    { dish_id: "m02", material_id: "nvl07", quantity: 1, unit: "l" },
    { dish_id: "m04", material_id: "nvl09", quantity: 0.2, unit: "kg" },
    { dish_id: "m05", material_id: "nvl01", quantity: 0.15, unit: "kg" },
    { dish_id: "m06", material_id: "nvl02", quantity: 0.15, unit: "kg" },
    { dish_id: "m08", material_id: "nvl10", quantity: 1, unit: "chai" }
  ],
  raw_materials: [
    { id: "nvl01", name: "N\u1EA5m kim ch\xE2m", unit: "kg", stock_current: 8.2, stock_min: 2, stock_max: 20 },
    { id: "nvl02", name: "N\u1EA5m b\xE0o ng\u01B0", unit: "kg", stock_current: 4, stock_min: 1.5, stock_max: 15 },
    { id: "nvl03", name: "N\u1EA5m \u0111\xF9i g\xE0", unit: "kg", stock_current: 1.2, stock_min: 1, stock_max: 10 },
    { id: "nvl04", name: "N\u1EA5m h\u01B0\u01A1ng", unit: "kg", stock_current: 0.6, stock_min: 0.8, stock_max: 8 },
    { id: "nvl05", name: "N\u1EA5m tuy\u1EBFt", unit: "kg", stock_current: 1.5, stock_min: 0.5, stock_max: 5 },
    { id: "nvl06", name: "\u0110\u1EADu h\u0169 non", unit: "kg", stock_current: 16, stock_min: 2, stock_max: 15 },
    { id: "nvl07", name: "N\u01B0\u1EDBc d\xF9ng", unit: "l", stock_current: 110, stock_min: 20, stock_max: 250 },
    { id: "nvl08", name: "G\xE0 \u0111en", unit: "kg", stock_current: 0, stock_min: 2, stock_max: 15 },
    { id: "nvl09", name: "Th\u1ECBt b\xF2 M\u1EF9", unit: "kg", stock_current: 25, stock_min: 5, stock_max: 50 },
    { id: "nvl10", name: "N\u01B0\u1EDBc su\u1ED1i chai", unit: "chai", stock_current: 48, stock_min: 20, stock_max: 200 }
  ],
  table_sessions: [
    { id: "s_B04", table_id: "B04", customer_id: "kh001", start_time: new Date(Date.now() - 45 * 6e4).toISOString(), end_time: null, share_code: "0987.654.321", status: "active", guests_count: 4 },
    { id: "s_B09", table_id: "B09", customer_id: "kh002", start_time: new Date(Date.now() - 90 * 6e4).toISOString(), end_time: null, share_code: "0912.345.678", status: "active", guests_count: 5 },
    { id: "s_B14", table_id: "B14", customer_id: "kh003", start_time: new Date(Date.now() - 555 * 6e4).toISOString(), end_time: null, share_code: "0934.567.890", status: "active", guests_count: 2 }
  ],
  orders: [
    { id: "o_B04_1", session_id: "s_B04", created_at: new Date(Date.now() - 40 * 6e4).toISOString(), service_status: "\u0110ang ch\u1EBF bi\u1EBFn", total_amount: 617e3 },
    { id: "o_B09_1", session_id: "s_B09", created_at: new Date(Date.now() - 10 * 6e4).toISOString(), service_status: "\u0110ang chu\u1EA9n b\u1ECB", total_amount: 168e4 },
    { id: "o_B14_1", session_id: "s_B14", created_at: new Date(Date.now() - 85 * 6e4).toISOString(), service_status: "\u0110\xE3 ph\u1EE5c v\u1EE5", total_amount: 125e4 }
  ],
  order_details: [
    { id: "od_1", order_id: "o_B04_1", dish_id: "m01", quantity: 1, price_at_time: 299e3, item_status: "\u0110\xE3 ph\u1EE5c v\u1EE5", notes: "\xCDt cay, kh\xF4ng h\xE0nh", ordered_at: new Date(Date.now() - 40 * 6e4).toISOString() },
    { id: "od_2", order_id: "o_B04_1", dish_id: "m04", quantity: 2, price_at_time: 159e3, item_status: "\u0110\xE3 ph\u1EE5c v\u1EE5", notes: "", ordered_at: new Date(Date.now() - 40 * 6e4).toISOString() },
    { id: "od_3", order_id: "o_B09_1", dish_id: "m01", quantity: 4, price_at_time: 299e3, item_status: "\u0110ang ch\u1EDD", notes: "", ordered_at: new Date(Date.now() - 10 * 6e4).toISOString() },
    { id: "od_4", order_id: "o_B09_1", dish_id: "m04", quantity: 3, price_at_time: 159e3, item_status: "\u0110ang ch\u1EBF bi\u1EBFn", notes: "N\u01B0\u1EDBc d\xF9ng nhi\u1EC1u s\u1EA3", ordered_at: new Date(Date.now() - 10 * 6e4).toISOString() },
    { id: "od_5", order_id: "o_B09_1", dish_id: "m08", quantity: 6, price_at_time: 15e3, item_status: "\u0110\xE3 ho\xE0n th\xE0nh", notes: "L\u1EA5y nhi\u1EC1u \u0111\xE1", ordered_at: new Date(Date.now() - 10 * 6e4).toISOString() },
    { id: "od_6", order_id: "o_B14_1", dish_id: "m03", quantity: 3, price_at_time: 329e3, item_status: "\u0110\xE3 ph\u1EE5c v\u1EE5", notes: "", ordered_at: new Date(Date.now() - 85 * 6e4).toISOString() },
    { id: "od_7", order_id: "o_B14_1", dish_id: "m05", quantity: 5, price_at_time: 39e3, item_status: "\u0110\xE3 ph\u1EE5c v\u1EE5", notes: "", ordered_at: new Date(Date.now() - 85 * 6e4).toISOString() },
    { id: "od_8", order_id: "o_B14_1", dish_id: "m08", quantity: 4, price_at_time: 15e3, item_status: "\u0110\xE3 ph\u1EE5c v\u1EE5", notes: "", ordered_at: new Date(Date.now() - 85 * 6e4).toISOString() }
  ],
  import_receipts: [
    { id: "bb_001", date_received: "2026-06-11T10:00:00Z", shipper_name: "Nguy\u1EC5n V\u0103n \u0110\u1ECBnh (NhaCungCap Vi\u1EC7t)", employee_id: "mv005", employee_name: "Ho\xE0ng V\u0103n E", notes: "Nh\u1EADn \u0111\u1EA7y \u0111\u1EE7 n\u1EA5m t\u01B0\u01A1i v\xE0 n\u01B0\u1EDBc d\xF9ng \u0111\xF3ng chai.", total_value: 77e5 },
    { id: "bb_002", date_received: "2026-06-12T14:30:00Z", shipper_name: "C\xF4ng ty Th\u1EF1c ph\u1EA9m S\u1EA1ch Gia Kh\xE1nh", employee_id: "mv005", employee_name: "Ho\xE0ng V\u0103n E", notes: "Nh\u1EADp h\xE0ng kh\u1EA9n c\u1EA5p bu\u1ED5i chi\u1EC1u.", total_value: 18e5 }
  ],
  import_receipt_details: [
    { receipt_id: "bb_001", material_id: "nvl01", quantity_received: 1e4, price: 45e3 },
    { receipt_id: "bb_001", material_id: "nvl02", quantity_received: 5e3, price: 5e4 },
    { receipt_id: "bb_001", material_id: "nvl10", quantity_received: 100, price: 7e3 },
    { receipt_id: "bb_002", material_id: "nvl09", quantity_received: 15e3, price: 12e4 }
  ],
  system_logs: [
    { id: "log_001", employee_id: "mv001", employee_name: "Nguy\u1EC5n V\u0103n A", action: "Kh\u1EDFi t\u1EA1o h\u1EC7 th\u1ED1ng", created_at: "2026-06-11T08:00:00Z", changed_data: "T\u1EA3i c\u1EA5u h\xECnh ban \u0111\u1EA7u" },
    { id: "log_002", employee_id: "mv001", employee_name: "Nguy\u1EC5n V\u0103n A", action: "C\u1EADp nh\u1EADt gi\xE1 th\u1EF1c \u0111\u01A1n", created_at: "2026-06-11T09:12:00Z", changed_data: "Gi\xE1 L\u1EA9u Th\u1EADp C\u1EA9m -> 299.000\u0111" },
    { id: "log_003", employee_id: "mv005", employee_name: "Ho\xE0ng V\u0103n E", action: "X\xE1c nh\u1EADn bi\xEAn b\u1EA3n nh\u1EADp kho", created_at: "2026-06-12T14:35:00Z", changed_data: "Bi\xEAn b\u1EA3n bb_002, +15.000g Th\u1ECBt b\xF2 M\u1EF9" }
  ],
  table_reservations: [
    { id: "db_01", table_id: "B04", customer_name: "Nguy\u1EC5n L\xE2m Ho\xE0ng", phone: "0388998877", reservation_date: (/* @__PURE__ */ new Date()).toISOString().split("T")[0], reservation_time: "19:00", status: "Ch\u1EDD \u0111\u1EBFn" },
    { id: "db_02", table_id: "B01", customer_name: "Ph\u1EA1m Thanh H\xE0", phone: "0977665544", reservation_date: new Date(Date.now() + 864e5).toISOString().split("T")[0], reservation_time: "18:30", status: "Ch\u1EDD \u0111\u1EBFn" }
  ],
  inventory_transactions: [
    { id: "tx_001", material_id: "nvl01", transaction_type: "NHAP", quantity: 1e4, created_at: "2026-06-11T10:00:00Z", reference_id: "bb_001", notes: "Nh\u1EADp h\xE0ng t\u1EEB nh\xE0 cung c\u1EA5p" },
    { id: "tx_002", material_id: "nvl02", transaction_type: "NHAP", quantity: 5e3, created_at: "2026-06-11T10:00:00Z", reference_id: "bb_001", notes: "Nh\u1EADp h\xE0ng t\u1EEB nh\xE0 cung c\u1EA5p" },
    { id: "tx_003", material_id: "nvl10", transaction_type: "NHAP", quantity: 100, created_at: "2026-06-11T10:00:00Z", reference_id: "bb_001", notes: "Nh\u1EADp h\xE0ng t\u1EEB nh\xE0 cung c\u1EA5p" },
    { id: "tx_004", material_id: "nvl09", transaction_type: "NHAP", quantity: 15e3, created_at: "2026-06-12T14:30:00Z", reference_id: "bb_002", notes: "Nh\u1EADp h\xE0ng kh\u1EA9n c\u1EA5p bu\u1ED5i chi\u1EC1u" }
  ]
};
var Database = class {
  constructor() {
    this.pool = null;
    this.state = defaultDbState;
  }
  async init() {
    const useMysql = process.env.USE_MYSQL === "true";
    if (!useMysql) {
      console.log("USE_MYSQL is false. Using JSON file-based database.");
      this.state = this.read();
      return;
    }
    console.log("USE_MYSQL is true. Connecting to MySQL Database...");
    const host = process.env.DB_HOST || "localhost";
    const port = Number(process.env.DB_PORT || 3306);
    const user = process.env.DB_USER || "root";
    const password = process.env.DB_PASSWORD || "";
    const databaseName = process.env.DB_NAME || "lau_nam_gia_khanh";
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
      await this.pool.query("SELECT 1");
      console.log("MySQL connection pool established successfully.");
      try {
        await this.pool.query("ALTER TABLE `table_sessions` ADD COLUMN IF NOT EXISTS `customer_phone` VARCHAR(20) DEFAULT NULL");
      } catch (e) {
        try {
          await this.pool.query("ALTER TABLE `table_sessions` ADD COLUMN `customer_phone` VARCHAR(20) DEFAULT NULL");
        } catch (_) {
        }
      }
      try {
        await this.pool.query("ALTER TABLE `table_sessions` ADD COLUMN IF NOT EXISTS `created_by` VARCHAR(50) DEFAULT NULL");
      } catch (e) {
        try {
          await this.pool.query("ALTER TABLE `table_sessions` ADD COLUMN `created_by` VARCHAR(50) DEFAULT NULL");
        } catch (_) {
        }
      }
      const tables = [
        "customers",
        "dining_tables",
        "table_sessions",
        "categories",
        "dishes",
        "recipe_items",
        "orders",
        "order_details",
        "raw_materials",
        "import_receipts",
        "import_receipt_details",
        "employees",
        "system_logs",
        "table_reservations",
        "inventory_transactions"
      ];
      const newState = {};
      for (const table of tables) {
        const [rows] = await this.pool.query(`SELECT * FROM \`${table}\``);
        newState[table] = rows;
      }
      this.state = newState;
      console.log("All data loaded from MySQL into cache state.");
    } catch (err) {
      console.error("MySQL initialization failed, falling back to JSON file:", err.message);
      this.state = this.read();
    }
  }
  read() {
    if (!fs.existsSync(DB_FILE)) {
      this.writeAtomic(defaultDbState);
      return defaultDbState;
    }
    try {
      const data = fs.readFileSync(DB_FILE, "utf8");
      return JSON.parse(data);
    } catch (e) {
      console.error("Error reading database file, using default schema:", e);
      return defaultDbState;
    }
  }
  writeAtomic(data) {
    const tmpFile = DB_FILE + ".tmp";
    try {
      fs.writeFileSync(tmpFile, JSON.stringify(data, null, 2), "utf8");
      fs.renameSync(tmpFile, DB_FILE);
    } catch (e) {
      console.error("Atomic write failed, attempting standard write:", e);
      try {
        fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), "utf8");
      } catch (writeError) {
        console.error("Database write completely failed:", writeError);
      }
    }
  }
  async saveToMySql(table, data) {
    if (!this.pool) return;
    try {
      const conn = await this.pool.getConnection();
      try {
        await conn.query("SET FOREIGN_KEY_CHECKS = 0");
        await conn.query(`TRUNCATE TABLE \`${table}\``);
        await conn.query("SET FOREIGN_KEY_CHECKS = 1");
        if (data.length > 0) {
          for (const row of data) {
            const cols = Object.keys(row);
            const vals = Object.values(row);
            const placeholders = cols.map(() => "?").join(", ");
            const sql = `INSERT IGNORE INTO \`${table}\` (${cols.map((c) => `\`${c}\``).join(", ")}) VALUES (${placeholders})`;
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
  get(table) {
    if (process.env.USE_MYSQL !== "true") {
      this.state = this.read();
    }
    return this.state[table];
  }
  save(table, data) {
    this.state[table] = data;
    if (process.env.USE_MYSQL === "true" && this.pool) {
      this.saveToMySql(table, data).catch((err) => {
        console.error(`MySQL async save error on table ${table}:`, err);
      });
    } else {
      this.writeAtomic(this.state);
    }
  }
  // Transaction support helper
  runTransaction(callback) {
    const backupState = JSON.parse(JSON.stringify(this.state));
    try {
      const success = callback(this);
      if (success) {
        if (process.env.USE_MYSQL === "true" && this.pool) {
          const tables = Object.keys(this.state);
          for (const table of tables) {
            if (JSON.stringify(backupState[table]) !== JSON.stringify(this.state[table])) {
              this.saveToMySql(table, this.state[table]).catch((err) => {
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
      console.error("Transaction rolled back due to error:", e);
      this.state = backupState;
      return false;
    }
  }
};
var db = new Database();

// server.ts
var app = express();
var PORT = process.env.PORT || 3001;
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));
function logAction(employeeId, employeeName, action, changedData) {
  const logs = db.get("system_logs");
  const newLog = {
    id: `log_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    employee_id: employeeId,
    employee_name: employeeName,
    action,
    created_at: (/* @__PURE__ */ new Date()).toISOString(),
    changed_data: changedData
  };
  db.save("system_logs", [newLog, ...logs]);
}
function closeStaleSessions() {
  const sessions = db.get("table_sessions");
  const tables = db.get("dining_tables");
  let changed = false;
  let tablesChanged = false;
  const now = /* @__PURE__ */ new Date();
  sessions.forEach((session) => {
    if (session.status === "active") {
      const startTime = new Date(session.start_time);
      if (isNaN(startTime.getTime())) return;
      const diffHours = (now.getTime() - startTime.getTime()) / (1e3 * 60 * 60);
      const isOver6Hours = diffHours >= 6;
      const sessionLocalDate = new Date(startTime.getTime() + 7 * 60 * 60 * 1e3).toISOString().split("T")[0];
      const currentLocalDate = new Date(now.getTime() + 7 * 60 * 60 * 1e3).toISOString().split("T")[0];
      const isPreviousDay = sessionLocalDate !== currentLocalDate;
      if (isOver6Hours || isPreviousDay) {
        session.status = "completed";
        session.end_time = now.toISOString();
        changed = true;
        const tblIdx = tables.findIndex((t) => t.id === session.table_id);
        if (tblIdx !== -1 && tables[tblIdx].status !== "trong") {
          tables[tblIdx].status = "trong";
          tablesChanged = true;
        }
        logAction(
          "system",
          "H\u1EC7 th\u1ED1ng t\u1EF1 \u0111\u1ED9ng",
          "T\u1EF1 \u0111\u1ED9ng \u0111\xF3ng phi\xEAn qu\xE1 h\u1EA1n",
          `Phi\xEAn ${session.id} c\u1EE7a b\xE0n ${session.table_id} \u0111\xE3 \u0111\u01B0\u1EE3c \u0111\xF3ng t\u1EF1 \u0111\u1ED9ng do qu\xE1 6 ti\u1EBFng ho\u1EB7c qu\xE1 ca.`
        );
      }
    }
  });
  if (changed) {
    db.save("table_sessions", sessions);
  }
  if (tablesChanged) {
    db.save("dining_tables", tables);
  }
}
app.post("/api/auth/login", (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: "Vui l\xF2ng cung c\u1EA5p \u0111\u1EA7y \u0111\u1EE7 th\xF4ng tin." });
  }
  const employees = db.get("employees");
  const hashed = hashPassword(password);
  const emp = employees.find(
    (e) => e.username.toLowerCase() === username.toLowerCase() && e.password_hash === hashed
  );
  if (emp) {
    if (emp.status === "Ng\u1EEBng ho\u1EA1t \u0111\u1ED9ng") {
      return res.status(403).json({ error: "T\xE0i kho\u1EA3n nh\xE2n vi\xEAn n\xE0y hi\u1EC7n \u0111\xE3 b\u1ECB kh\xF3a." });
    }
    logAction(emp.id, emp.name, "\u0110\u0103ng nh\u1EADp h\u1EC7 th\u1ED1ng", `Nh\xE2n vi\xEAn \u0111\u0103ng nh\u1EADp v\u1EDBi vai tr\xF2: ${emp.role}`);
    return res.json({ success: true, user: emp });
  }
  return res.status(401).json({ error: "Th\xF4ng tin \u0111\u0103ng nh\u1EADp kh\xF4ng ch\xEDnh x\xE1c." });
});
app.get("/api/employees", (req, res) => {
  return res.json(db.get("employees"));
});
app.post("/api/employees", (req, res) => {
  const { username, password, role, name, phone, operatorId, operatorName } = req.body;
  if (!username || !password || !role || !name) {
    return res.status(400).json({ error: "Vui l\xF2ng \u0111i\u1EC1n \u0111\u1EA7y \u0111\u1EE7 th\xF4ng tin nh\xE2n vi\xEAn." });
  }
  const employees = db.get("employees");
  const maxEmpId = employees.reduce((max, e) => {
    const num = parseInt(e.id.replace("mv", ""), 10);
    return isNaN(num) ? max : Math.max(max, num);
  }, 0);
  const newEmp = {
    id: `mv${(maxEmpId + 1).toString().padStart(3, "0")}`,
    username,
    password_hash: hashPassword(password),
    role,
    name,
    status: "Ho\u1EA1t \u0111\u1ED9ng",
    phone: phone || ""
  };
  db.save("employees", [...employees, newEmp]);
  logAction(operatorId || "system", operatorName || "Qu\u1EA3n l\xFD", "Th\xEAm nh\xE2n vi\xEAn", `T\u1EA1o t\xE0i kho\u1EA3n ${username} - vai tr\xF2 ${role}`);
  return res.json({ success: true, user: newEmp });
});
app.put("/api/employees/:id", (req, res) => {
  const { id } = req.params;
  const { role, name, phone, status, operatorId, operatorName } = req.body;
  const employees = db.get("employees");
  const empIdx = employees.findIndex((e) => e.id === id);
  if (empIdx === -1) return res.status(404).json({ error: "Kh\xF4ng t\xECm th\u1EA5y nh\xE2n vi\xEAn." });
  employees[empIdx] = {
    ...employees[empIdx],
    role: role || employees[empIdx].role,
    name: name || employees[empIdx].name,
    phone: phone || employees[empIdx].phone,
    status: status || employees[empIdx].status
  };
  db.save("employees", employees);
  logAction(operatorId || "system", operatorName || "Qu\u1EA3n l\xFD", "C\u1EADp nh\u1EADt nh\xE2n vi\xEAn", `S\u1EEDa \u0111\u1ED5i t\xE0i kho\u1EA3n ${employees[empIdx].name} (${id})`);
  return res.json({ success: true, user: employees[empIdx] });
});
app.delete("/api/employees/:id", (req, res) => {
  const { id } = req.params;
  const { operatorId, operatorName } = req.body;
  const employees = db.get("employees");
  const empIdx = employees.findIndex((e) => e.id === id);
  if (empIdx === -1) return res.status(404).json({ error: "Kh\xF4ng t\xECm th\u1EA5y nh\xE2n vi\xEAn." });
  employees[empIdx].status = "Ng\u1EEBng ho\u1EA1t \u0111\u1ED9ng";
  db.save("employees", employees);
  logAction(operatorId || "system", operatorName || "Qu\u1EA3n l\xFD", "V\xF4 hi\u1EC7u h\xF3a nh\xE2n vi\xEAn", `Kh\xF3a t\xE0i kho\u1EA3n nh\xE2n vi\xEAn ${id}`);
  return res.json({ success: true, user: employees[empIdx] });
});
app.post("/api/auth/logout", (req, res) => {
  const { userId, name } = req.body;
  logAction(userId || "system", name || "Nh\xE2n vi\xEAn", "\u0110\u0103ng xu\u1EA5t h\u1EC7 th\u1ED1ng", "\u0110\u0103ng xu\u1EA5t phi\xEAn l\xE0m vi\u1EC7c");
  return res.json({ success: true });
});
app.get("/api/tables", (req, res) => {
  closeStaleSessions();
  return res.json(db.get("dining_tables"));
});
app.post("/api/tables/:id/status", (req, res) => {
  const { id } = req.params;
  const { status, operatorId, operatorName } = req.body;
  const tables = db.get("dining_tables");
  const tblIdx = tables.findIndex((t) => t.id === id);
  if (tblIdx === -1) return res.status(404).json({ error: "Kh\xF4ng t\xECm th\u1EA5y b\xE0n \u0103n." });
  const oldStatus = tables[tblIdx].status;
  tables[tblIdx].status = status;
  db.save("dining_tables", tables);
  logAction(operatorId || "system", operatorName || "L\u1EC5 t\xE2n", "\u0110i\u1EC1u h\xE0nh s\u01A1 \u0111\u1ED3 b\xE0n", `Thay \u0111\u1ED5i tr\u1EA1ng th\xE1i b\xE0n ${id} t\u1EEB "${oldStatus}" sang "${status}"`);
  return res.json({ success: true, table: tables[tblIdx] });
});
app.post("/api/tables/:id/activate", (req, res) => {
  const { id } = req.params;
  const { operatorId, operatorName } = req.body;
  const tables = db.get("dining_tables");
  const tblIdx = tables.findIndex((t) => t.id === id);
  if (tblIdx === -1) return res.status(404).json({ error: "Kh\xF4ng t\xECm th\u1EA5y b\xE0n \u0103n." });
  if (tables[tblIdx].status !== "trong") {
    return res.status(400).json({ error: "B\xE0n \u0103n kh\xF4ng \u1EDF tr\u1EA1ng th\xE1i tr\u1ED1ng \u0111\u1EC3 k\xEDch ho\u1EA1t chu\u1EA9n b\u1ECB." });
  }
  tables[tblIdx].status = "chuan_bi";
  db.save("dining_tables", tables);
  logAction(operatorId || "system", operatorName || "Nh\xE2n vi\xEAn", "K\xEDch ho\u1EA1t b\xE0n", `B\xE0n ${id} chuy\u1EC3n sang "\u0110ang chu\u1EA9n b\u1ECB"`);
  return res.json({ success: true, table: tables[tblIdx] });
});
app.post("/api/tables/:id/deactivate", (req, res) => {
  const { id } = req.params;
  const { operatorId, operatorName } = req.body;
  const tables = db.get("dining_tables");
  const tblIdx = tables.findIndex((t) => t.id === id);
  if (tblIdx === -1) return res.status(404).json({ error: "Kh\xF4ng t\xECm th\u1EA5y b\xE0n \u0103n." });
  tables[tblIdx].status = "trong";
  db.save("dining_tables", tables);
  logAction(operatorId || "system", operatorName || "Nh\xE2n vi\xEAn", "H\u1EE7y k\xEDch ho\u1EA1t b\xE0n", `B\xE0n ${id} chuy\u1EC3n v\u1EC1 "Tr\u1ED1ng"`);
  return res.json({ success: true, table: tables[tblIdx] });
});
app.get("/api/sessions", (req, res) => {
  closeStaleSessions();
  return res.json(db.get("table_sessions"));
});
app.post(["/api/sessions", "/api/sessions/start"], (req, res) => {
  const { tableId, phone, guestsCount, existingCode, createdBy, customerName } = req.body;
  if (!tableId || !phone) {
    return res.status(400).json({ error: "Thi\u1EBFu th\xF4ng tin s\u1ED1 b\xE0n ho\u1EB7c s\u1ED1 \u0111i\u1EC7n tho\u1EA1i." });
  }
  const trimmedPhone = phone.trim();
  const phoneRegex = /^[0-9]{10}$/;
  if (!phoneRegex.test(trimmedPhone)) {
    return res.status(400).json({ error: "S\u1ED1 \u0111i\u1EC7n tho\u1EA1i ph\u1EA3i g\u1ED3m 10 ch\u1EEF s\u1ED1." });
  }
  const sessions = db.get("table_sessions");
  const activeSess = sessions.find((s) => s.table_id === tableId && s.status === "active");
  if (activeSess) {
    return res.json({ success: true, shareCode: activeSess.share_code, sessionId: activeSess.id });
  }
  const customers = db.get("customers");
  let cust = customers.find((c) => c.phone.trim() === trimmedPhone);
  if (!cust) {
    cust = { id: `cust_${Date.now()}`, phone: trimmedPhone };
    db.save("customers", [...customers, cust]);
  }
  const generatedCode = existingCode || Math.random().toString(36).substring(2, 6).toUpperCase();
  const sessionId = `s_${tableId}_${Date.now().toString().slice(-4)}`;
  const displayCustomerName = customerName && customerName.trim() ? customerName.trim() : "Kh\xE1ch v\xE3ng lai";
  const newSession = {
    id: sessionId,
    table_id: tableId,
    customer_id: cust.id,
    customer_phone: trimmedPhone,
    start_time: (/* @__PURE__ */ new Date()).toISOString(),
    end_time: null,
    share_code: generatedCode,
    status: "active",
    guests_count: guestsCount ? Number(guestsCount) : 4,
    customer_name: displayCustomerName,
    created_by: createdBy || null
  };
  db.save("table_sessions", [newSession, ...sessions]);
  const tables = db.get("dining_tables");
  const tblIdx = tables.findIndex((t) => t.id === tableId);
  if (tblIdx !== -1) {
    tables[tblIdx].status = "co_khach";
    db.save("dining_tables", tables);
  }
  logAction(
    createdBy || "guest",
    createdBy ? "Nh\xE2n vi\xEAn l\u1EC5 t\xE2n" : "Kh\xE1ch h\xE0ng",
    "M\u1EDF phi\xEAn \u0111\u1EB7t b\xE0n",
    `K\xEDch ho\u1EA1t b\xE0n ${tableId} cho ${displayCustomerName} c\xF9ng S\u0110T ${trimmedPhone} - Kh\xE1ch ng\u1ED3i: ${newSession.guests_count} - M\xE3: ${generatedCode}`
  );
  return res.json({ success: true, shareCode: generatedCode, sessionId });
});
app.get("/qr-order", (req, res) => {
  const tableId = req.query.table;
  if (!tableId) {
    return res.redirect("/customer");
  }
  return res.redirect(`/customer?table=${tableId}`);
});
app.post("/api/sessions/:id/pay", (req, res) => {
  const { id } = req.params;
  const { operatorId, operatorName } = req.body;
  const sessions = db.get("table_sessions");
  const sessIdx = sessions.findIndex((s) => s.id === id && s.status === "active");
  if (sessIdx === -1) return res.status(404).json({ error: "Kh\xF4ng t\xECm th\u1EA5y phi\xEAn b\xE0n \u0103n \u0111ang ho\u1EA1t \u0111\u1ED9ng." });
  const session = sessions[sessIdx];
  session.status = "completed";
  session.end_time = (/* @__PURE__ */ new Date()).toISOString();
  db.save("table_sessions", sessions);
  const tables = db.get("dining_tables");
  const tblIdx = tables.findIndex((t) => t.id === session.table_id);
  if (tblIdx !== -1) {
    tables[tblIdx].status = "trong";
    db.save("dining_tables", tables);
  }
  logAction(operatorId || "system", operatorName || "L\u1EC5 t\xE2n", "Thanh to\xE1n & \u0110\xF3ng phi\xEAn", `Ho\xE0n t\u1EA5t phi\xEAn ${id} cho b\xE0n ${session.table_id}. B\xE0n tr\u1EA3 v\u1EC1 tr\u1EA1ng th\xE1i Tr\u1ED1ng.`);
  return res.json({ success: true });
});
app.get("/api/categories", (req, res) => {
  return res.json(db.get("categories"));
});
app.post("/api/categories", (req, res) => {
  const { name, sort_order, status, operatorId, operatorName } = req.body;
  if (!name) return res.status(400).json({ error: "T\xEAn danh m\u1EE5c kh\xF4ng \u0111\u01B0\u1EE3c tr\u1ED1ng." });
  const categories = db.get("categories");
  const maxIdNum = categories.reduce((max, c) => {
    const num = parseInt(c.id.replace("dm", ""), 10);
    return isNaN(num) ? max : Math.max(max, num);
  }, 0);
  const newCat = {
    id: `dm${(maxIdNum + 1).toString().padStart(2, "0")}`,
    name,
    sort_order: sort_order ? Number(sort_order) : maxIdNum + 1,
    status: status || "Hi\u1EC3n th\u1ECB"
  };
  db.save("categories", [...categories, newCat]);
  logAction(operatorId || "system", operatorName || "Qu\u1EA3n l\xFD", "Th\xEAm danh m\u1EE5c", `T\u1EA1o danh m\u1EE5c "${name}"`);
  return res.json({ success: true, category: newCat });
});
app.put("/api/categories/:id", (req, res) => {
  const { id } = req.params;
  const { name, sort_order, status, operatorId, operatorName } = req.body;
  const categories = db.get("categories");
  const catIdx = categories.findIndex((c) => c.id === id);
  if (catIdx === -1) return res.status(404).json({ error: "Kh\xF4ng t\xECm th\u1EA5y danh m\u1EE5c." });
  categories[catIdx] = { ...categories[catIdx], name, sort_order: Number(sort_order), status };
  db.save("categories", categories);
  logAction(operatorId || "system", operatorName || "Qu\u1EA3n l\xFD", "C\u1EADp nh\u1EADt danh m\u1EE5c", `S\u1EEDa th\xF4ng tin danh m\u1EE5c "${name}"`);
  return res.json({ success: true, category: categories[catIdx] });
});
app.delete("/api/categories/:id", (req, res) => {
  const { id } = req.params;
  const categories = db.get("categories");
  const filtered = categories.filter((c) => c.id !== id);
  db.save("categories", filtered);
  return res.json({ success: true });
});
app.get("/api/dishes", (req, res) => {
  return res.json(db.get("dishes"));
});
app.post("/api/dishes", (req, res) => {
  const { category_id, name, price, description, image_url, status, operatorId, operatorName } = req.body;
  if (!name || price === void 0) {
    return res.status(400).json({ error: "Thi\u1EBFu t\xEAn m\xF3n ho\u1EB7c gi\xE1 b\xE1n." });
  }
  if (price < 0) {
    return res.status(400).json({ error: "\u0110\u01A1n gi\xE1 m\xF3n \u0103n kh\xF4ng \u0111\u01B0\u1EE3c l\xE0 s\u1ED1 \xE2m (BR09)." });
  }
  const dishes = db.get("dishes");
  const maxDishId = dishes.reduce((max, d) => {
    const num = parseInt(d.id.replace("m", ""), 10);
    return isNaN(num) ? max : Math.max(max, num);
  }, 0);
  const newDish = {
    id: `m${(maxDishId + 1).toString().padStart(2, "0")}`,
    category_id,
    name,
    price: Number(price),
    description: description || "",
    image_url: image_url || "https://images.unsplash.com/photo-1547928500-4722f55cc829?w=600",
    status: status || "H\u1EBFt m\xF3n"
  };
  db.save("dishes", [...dishes, newDish]);
  logAction(operatorId || "system", operatorName || "Qu\u1EA3n l\xFD", "Khai b\xE1o m\xF3n \u0103n", `T\u1EA1o m\xF3n m\u1EDBi "${name}" gi\xE1 ${newDish.price.toLocaleString()}\u0111`);
  return res.json({ success: true, dish: newDish });
});
app.put("/api/dishes/:id", (req, res) => {
  const { id } = req.params;
  const { category_id, name, price, description, image_url, status, operatorId, operatorName } = req.body;
  if (price < 0) {
    return res.status(400).json({ error: "\u0110\u01A1n gi\xE1 m\xF3n \u0103n kh\xF4ng \u0111\u01B0\u1EE3c l\xE0 s\u1ED1 \xE2m (BR09)." });
  }
  const dishes = db.get("dishes");
  const dishIdx = dishes.findIndex((d) => d.id === id);
  if (dishIdx === -1) return res.status(404).json({ error: "Kh\xF4ng t\xECm th\u1EA5y m\xF3n \u0103n." });
  if (status === "C\xF2n ph\u1EE5c v\u1EE5") {
    const recipes = db.get("recipe_items").filter((r) => r.dish_id === id);
    if (recipes.length === 0) {
      return res.status(400).json({ error: "M\xF3n \u0103n ph\u1EA3i \u0111\u01B0\u1EE3c khai b\xE1o \xEDt nh\u1EA5t m\u1ED9t nguy\xEAn li\u1EC7u \u0111\u1ECBnh l\u01B0\u1EE3ng tr\u01B0\u1EDBc khi ho\u1EA1t \u0111\u1ED9ng! (BR08)" });
    }
  }
  dishes[dishIdx] = {
    id,
    category_id,
    name,
    price: Number(price),
    description: description || "",
    image_url: image_url || dishes[dishIdx].image_url,
    status
  };
  db.save("dishes", dishes);
  logAction(operatorId || "system", operatorName || "Qu\u1EA3n l\xFD", "C\u1EADp nh\u1EADt m\xF3n \u0103n", `S\u1EEDa th\xF4ng tin m\xF3n "${name}"`);
  return res.json({ success: true, dish: dishes[dishIdx] });
});
app.delete("/api/dishes/:id", (req, res) => {
  const { id } = req.params;
  const { operatorId, operatorName } = req.body;
  const dishes = db.get("dishes");
  const dishIdx = dishes.findIndex((d) => d.id === id);
  if (dishIdx === -1) return res.status(404).json({ error: "Kh\xF4ng t\xECm th\u1EA5y m\xF3n \u0103n." });
  dishes[dishIdx].status = "Ng\u1EEBng ph\u1EE5c v\u1EE5";
  db.save("dishes", dishes);
  logAction(operatorId || "system", operatorName || "Qu\u1EA3n l\xFD", "Ng\u01B0ng ph\u1EE5c v\u1EE5 m\xF3n", `Ng\u1EEBng ph\u1EE5c v\u1EE5 m\xF3n ${id} (${dishes[dishIdx].name}) (BR09)`);
  return res.json({ success: true, dish: dishes[dishIdx] });
});
app.get("/api/recipes", (req, res) => {
  return res.json(db.get("recipe_items"));
});
app.put("/api/recipes/:dishId", (req, res) => {
  const { dishId } = req.params;
  const { recipeItems, operatorId, operatorName } = req.body;
  const recipes = db.get("recipe_items");
  const filtered = recipes.filter((r) => r.dish_id !== dishId);
  const updatedRecipes = [...filtered, ...recipeItems];
  db.save("recipe_items", updatedRecipes);
  logAction(operatorId || "system", operatorName || "Qu\u1EA3n l\xFD", "C\u1EADp nh\u1EADt \u0111\u1ECBnh l\u01B0\u1EE3ng", `Ch\u1EC9nh s\u1EEDa c\xF4ng th\u1EE9c \u0111\u1ECBnh l\u01B0\u1EE3ng nguy\xEAn v\u1EADt li\u1EC7u cho m\xF3n ${dishId}`);
  return res.json({ success: true });
});
app.get("/api/orders", (req, res) => {
  return res.json(db.get("orders"));
});
app.get("/api/order-details", (req, res) => {
  return res.json(db.get("order_details"));
});
app.post("/api/orders", (req, res) => {
  const { tableId, cartItems } = req.body;
  if (!tableId || !cartItems || cartItems.length === 0) {
    return res.status(400).json({ error: "Thi\u1EBFu th\xF4ng tin b\xE0n \u0103n ho\u1EB7c gi\u1ECF h\xE0ng." });
  }
  const sessions = db.get("table_sessions");
  const activeSession = sessions.find((s) => s.table_id === tableId && s.status === "active");
  if (!activeSession) {
    return res.status(400).json({ error: `Kh\xF4ng t\xECm th\u1EA5y phi\xEAn \u0111\u1EB7t b\xE0n \u0111ang ho\u1EA1t \u0111\u1ED9ng cho B\xE0n ${tableId}` });
  }
  const dishes = db.get("dishes");
  for (const item of cartItems) {
    const dish = dishes.find((d) => d.id === item.dishId);
    if (!dish || dish.status !== "C\xF2n ph\u1EE5c v\u1EE5") {
      return res.status(400).json({ error: `M\xF3n "${dish ? dish.name : item.dishId}" hi\u1EC7n \u0111\xE3 h\u1EBFt m\xF3n ho\u1EB7c ng\u1EEBng ph\u1EE5c v\u1EE5.` });
    }
  }
  const orderId = `o_${tableId}_${Date.now().toString().slice(-4)}`;
  let totalComputed = 0;
  const orderDetails = db.get("order_details");
  const newDetails = cartItems.map((item, index) => {
    const dish = dishes.find((d) => d.id === item.dishId);
    totalComputed += dish.price * item.quantity;
    return {
      id: `od_${Date.now()}_${index}`,
      order_id: orderId,
      dish_id: item.dishId,
      quantity: item.quantity,
      price_at_time: dish.price,
      item_status: "\u0110ang ch\u1EDD",
      notes: item.notes || "",
      ordered_at: (/* @__PURE__ */ new Date()).toISOString()
    };
  });
  const newOrder = {
    id: orderId,
    session_id: activeSession.id,
    created_at: (/* @__PURE__ */ new Date()).toISOString(),
    service_status: "\u0110ang chu\u1EA9n b\u1ECB",
    total_amount: totalComputed
  };
  db.save("orders", [newOrder, ...db.get("orders")]);
  db.save("order_details", [...newDetails, ...orderDetails]);
  logAction("guest", "Kh\xE1ch h\xE0ng", "\u0110\u1EB7t m\xF3n \u0103n", `Kh\xE1ch b\xE0n ${tableId} g\u1EEDi \u0111\u01A1n ${orderId} g\u1ED3m ${cartItems.length} m\xF3n. T\u1EA1m t\xEDnh ${totalComputed.toLocaleString()}\u0111`);
  return res.json({ success: true, orderId });
});
app.put("/api/order-details/:id/status", (req, res) => {
  const { id } = req.params;
  const { status, operatorId, operatorName } = req.body;
  const orderDetails = db.get("order_details");
  const detailIdx = orderDetails.findIndex((od) => od.id === id);
  if (detailIdx === -1) return res.status(404).json({ error: "Kh\xF4ng t\xECm th\u1EA5y chi ti\u1EBFt \u0111\u01A1n h\xE0ng." });
  const item = orderDetails[detailIdx];
  const oldStatus = item.item_status;
  const statusHierarchy = ["\u0110ang ch\u1EDD", "\u0110ang ch\u1EBF bi\u1EBFn", "\u0110\xE3 ho\xE0n th\xE0nh", "\u0110\xE3 ph\u1EE5c v\u1EE5"];
  const currentIndex = statusHierarchy.indexOf(oldStatus);
  const nextIndex = statusHierarchy.indexOf(status);
  if (nextIndex <= currentIndex) {
    return res.status(400).json({
      error: `Qu\xE1 tr\xECnh ch\u1EBF bi\u1EBFn ch\u1EC9 di chuy\u1EC3n m\u1ED9t chi\u1EC1u (BR10). Kh\xF4ng th\u1EC3 c\u1EADp nh\u1EADt ng\u01B0\u1EE3c t\u1EEB "${oldStatus}" v\u1EC1 "${status}".`
    });
  }
  if (oldStatus === "\u0110ang ch\u1EDD" && status === "\u0110ang ch\u1EBF bi\u1EBFn") {
    const recipes = db.get("recipe_items").filter((r) => r.dish_id === item.dish_id);
    const materials = db.get("raw_materials");
    const transactions = db.get("inventory_transactions");
    const insufficient = [];
    recipes.forEach((recipe) => {
      const mat = materials.find((m) => m.id === recipe.material_id);
      if (!mat) return;
      const totalNeeded = recipe.quantity * item.quantity;
      if (mat.stock_current < totalNeeded) {
        insufficient.push(`${mat.name} (Thi\u1EBFu ${(totalNeeded - mat.stock_current).toLocaleString()}${mat.unit})`);
      }
    });
    if (insufficient.length > 0) {
      const dishes = db.get("dishes");
      const dIdx = dishes.findIndex((d) => d.id === item.dish_id);
      if (dIdx !== -1) {
        dishes[dIdx].status = "H\u1EBFt m\xF3n";
        db.save("dishes", dishes);
      }
      logAction(operatorId || "system", operatorName || "B\u1EBFp", "Thi\u1EBFu h\u1EE5t nguy\xEAn li\u1EC7u", `B\u1EBFp t\u1EEB ch\u1ED1i n\u1EA5u m\xF3n "${dishes[dIdx]?.name}" do thi\u1EBFu: ${insufficient.join(", ")}`);
      return res.status(400).json({
        error: `Kh\xF4ng \u0111\u1EE7 t\u1ED3n kho nguy\xEAn v\u1EADt li\u1EC7u \u0111\u1EC3 ch\u1EBF bi\u1EBFn! Thi\u1EBFu: ${insufficient.join(", ")}. H\u1EC7 th\u1ED1ng \u0111\xE3 t\u1EF1 \u0111\u1ED9ng \u0111\xE1nh d\u1EA5u H\u1EBET M\xD3N tr\xEAn th\u1EF1c \u0111\u01A1n.`
      });
    }
    const newTxList = [];
    recipes.forEach((recipe) => {
      const mIdx = materials.findIndex((m) => m.id === recipe.material_id);
      if (mIdx !== -1) {
        const consumed = recipe.quantity * item.quantity;
        materials[mIdx].stock_current -= consumed;
        if (materials[mIdx].stock_current < 0) materials[mIdx].stock_current = 0;
        newTxList.push({
          id: `tx_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`,
          material_id: recipe.material_id,
          transaction_type: "XUAT",
          quantity: consumed,
          created_at: (/* @__PURE__ */ new Date()).toISOString(),
          reference_id: item.order_id,
          notes: `Kh\u1EA5u tr\u1EEB t\u1EF1 \u0111\u1ED9ng ch\u1EBF bi\u1EBFn chi ti\u1EBFt \u0111\u01A1n ${item.id}`
        });
      }
    });
    db.save("raw_materials", materials);
    db.save("inventory_transactions", [...newTxList, ...transactions]);
    logAction(operatorId || "system", operatorName || "B\u1EBFp", "Kh\u1EA5u tr\u1EEB kho t\u1EF1 \u0111\u1ED9ng", `\u0110\xE3 tr\u1EEB nguy\xEAn li\u1EC7u cho chi ti\u1EBFt m\xF3n ${item.dish_id} x${item.quantity} trong \u0111\u01A1n ${item.order_id}`);
  }
  item.item_status = status;
  db.save("order_details", orderDetails);
  setTimeout(() => {
    const latestDetails = db.get("order_details");
    const siblings = latestDetails.filter((od) => od.order_id === item.order_id);
    const allServed = siblings.every((od) => od.item_status === "\u0110\xE3 ph\u1EE5c v\u1EE5");
    const allDone = siblings.every((od) => od.item_status === "\u0110\xE3 ho\xE0n th\xE0nh" || od.item_status === "\u0110\xE3 ph\u1EE5c v\u1EE5");
    const orders = db.get("orders");
    const oIdx = orders.findIndex((o) => o.id === item.order_id);
    if (oIdx !== -1) {
      if (allServed) {
        orders[oIdx].service_status = "\u0110\xE3 ph\u1EE5c v\u1EE5";
      } else if (allDone) {
        orders[oIdx].service_status = "\u0110\xE3 ch\u1EBF bi\u1EBFn";
      } else {
        orders[oIdx].service_status = "\u0110ang ch\u1EBF bi\u1EBFn";
      }
      db.save("orders", orders);
    }
  }, 30);
  logAction(operatorId || "system", operatorName || "Nh\xE2n vi\xEAn", "C\u1EADp nh\u1EADt m\xF3n \u0103n", `Thay \u0111\u1ED5i tr\u1EA1ng th\xE1i m\xF3n \u0103n trong \u0111\u01A1n ${item.order_id} sang "${status}"`);
  return res.json({ success: true });
});
app.post("/api/order-details/:id/cancel", (req, res) => {
  const { id } = req.params;
  const { operatorId, operatorName } = req.body;
  const orderDetails = db.get("order_details");
  const detailIdx = orderDetails.findIndex((od) => od.id === id);
  if (detailIdx === -1) return res.status(404).json({ error: "Kh\xF4ng t\xECm th\u1EA5y chi ti\u1EBFt \u0111\u01A1n h\xE0ng." });
  const item = orderDetails[detailIdx];
  if (item.item_status !== "\u0110ang ch\u1EDD") {
    return res.status(400).json({ error: "Ch\u1EC9 c\xF3 th\u1EC3 h\u1EE7y m\xF3n \u0103n khi \u0111ang \u1EDF tr\u1EA1ng th\xE1i \u0110ang ch\u1EDD." });
  }
  item.item_status = "\u0110\xE3 h\u1EE7y";
  db.save("order_details", orderDetails);
  const orders = db.get("orders");
  const oIdx = orders.findIndex((o) => o.id === item.order_id);
  if (oIdx !== -1) {
    const subtractedAmount = item.price_at_time * item.quantity;
    orders[oIdx].total_amount = Math.max(0, orders[oIdx].total_amount - subtractedAmount);
    const siblings = orderDetails.filter((od) => od.order_id === item.order_id);
    const nonCancelled = siblings.filter((od) => od.item_status !== "\u0110\xE3 h\u1EE7y");
    if (nonCancelled.length === 0) {
      orders[oIdx].service_status = "\u0110\xE3 ph\u1EE5c v\u1EE5";
    } else {
      const allServed = nonCancelled.every((od) => od.item_status === "\u0110\xE3 ph\u1EE5c v\u1EE5");
      const allDone = nonCancelled.every((od) => od.item_status === "\u0110\xE3 ho\xE0n th\xE0nh" || od.item_status === "\u0110\xE3 ph\u1EE5c v\u1EE5");
      if (allServed) {
        orders[oIdx].service_status = "\u0110\xE3 ph\u1EE5c v\u1EE5";
      } else if (allDone) {
        orders[oIdx].service_status = "\u0110\xE3 ch\u1EBF bi\u1EBFn";
      } else {
        orders[oIdx].service_status = "\u0110ang ch\u1EBF bi\u1EBFn";
      }
    }
    db.save("orders", orders);
  }
  logAction(operatorId || "guest", operatorName || "Kh\xE1ch h\xE0ng", "H\u1EE7y m\xF3n \u0103n", `\u0110\xE3 h\u1EE7y m\xF3n \u0103n trong \u0111\u01A1n ${item.order_id}: chi ti\u1EBFt ${item.id}`);
  return res.json({ success: true });
});
app.post("/api/orders/:id/invoice", (req, res) => {
  const { id } = req.params;
  const { imageBase64, operatorId, operatorName } = req.body;
  const orders = db.get("orders");
  const oIdx = orders.findIndex((o) => o.id === id);
  if (oIdx === -1) return res.status(404).json({ error: "Kh\xF4ng t\xECm th\u1EA5y h\xF3a \u0111\u01A1n." });
  orders[oIdx].invoice_image = imageBase64;
  db.save("orders", orders);
  logAction(operatorId || "system", operatorName || "Nh\xE2n vi\xEAn", "C\u1EADp nh\u1EADt h\xF3a \u0111\u01A1n", `T\u1EA3i \u1EA3nh h\xF3a \u0111\u01A1n thanh to\xE1n cho \u0111\u01A1n ${id}`);
  return res.json({ success: true });
});
app.get("/api/materials", (req, res) => {
  return res.json(db.get("raw_materials"));
});
app.post("/api/materials", (req, res) => {
  const { name, unit, stock_current, stock_min, stock_max, operatorId, operatorName } = req.body;
  if (!name || !unit) {
    return res.status(400).json({ error: "T\xEAn v\xE0 \u0111\u01A1n v\u1ECB t\xEDnh nguy\xEAn li\u1EC7u kh\xF4ng \u0111\u01B0\u1EE3c tr\u1ED1ng." });
  }
  const materials = db.get("raw_materials");
  const maxMatId = materials.reduce((max, m) => {
    const num = parseInt(m.id.replace("nvl", ""), 10);
    return isNaN(num) ? max : Math.max(max, num);
  }, 0);
  const newMat = {
    id: `nvl${(maxMatId + 1).toString().padStart(2, "0")}`,
    name,
    unit,
    stock_current: stock_current ? Number(stock_current) : 0,
    stock_min: stock_min ? Number(stock_min) : 0,
    stock_max: stock_max ? Number(stock_max) : 1e4,
    status: "Ho\u1EA1t \u0111\u1ED9ng"
  };
  db.save("raw_materials", [...materials, newMat]);
  logAction(operatorId || "system", operatorName || "Kho", "Khai b\xE1o nguy\xEAn li\u1EC7u", `Th\xEAm m\u1EDBi v\u1EADt t\u01B0 "${name}" v\xE0o danh m\u1EE5c`);
  return res.json({ success: true, material: newMat });
});
app.put("/api/materials/:id", (req, res) => {
  const { id } = req.params;
  const { name, unit, stock_current, stock_min, stock_max, status, operatorId, operatorName } = req.body;
  if (stock_min !== void 0 && stock_max !== void 0 && Number(stock_min) >= Number(stock_max)) {
    return res.status(400).json({ error: "Ng\u01B0\u1EE1ng t\u1ED3n t\u1ED1i thi\u1EC3u ph\u1EA3i nh\u1ECF h\u01A1n ng\u01B0\u1EE1ng t\u1ED3n t\u1ED1i \u0111a! (BR05)" });
  }
  const materials = db.get("raw_materials");
  const mIdx = materials.findIndex((m) => m.id === id);
  if (mIdx === -1) return res.status(404).json({ error: "Kh\xF4ng t\xECm th\u1EA5y nguy\xEAn v\u1EADt li\u1EC7u." });
  const oldStatus = materials[mIdx].status || "Ho\u1EA1t \u0111\u1ED9ng";
  materials[mIdx] = {
    id,
    name: name || materials[mIdx].name,
    unit: unit || materials[mIdx].unit,
    stock_current: stock_current !== void 0 ? Number(stock_current) : materials[mIdx].stock_current,
    stock_min: stock_min !== void 0 ? Number(stock_min) : materials[mIdx].stock_min,
    stock_max: stock_max !== void 0 ? Number(stock_max) : materials[mIdx].stock_max,
    status: status || materials[mIdx].status || "Ho\u1EA1t \u0111\u1ED9ng"
  };
  db.save("raw_materials", materials);
  let actionDesc = `S\u1EEDa c\u1EA5u h\xECnh \u0111\u1ECBnh m\u1EE9c t\u1ED3n kho cho "${materials[mIdx].name}"`;
  if (status && status !== oldStatus) {
    actionDesc = status === "Ng\u1EEBng ho\u1EA1t \u0111\u1ED9ng" ? `Ng\u1EEBng s\u1EED d\u1EE5ng v\u1EADt t\u01B0 "${materials[mIdx].name}"` : `K\xEDch ho\u1EA1t l\u1EA1i v\u1EADt t\u01B0 "${materials[mIdx].name}"`;
  }
  logAction(operatorId || "system", operatorName || "Kho", "C\u1EADp nh\u1EADt nguy\xEAn li\u1EC7u", actionDesc);
  return res.json({ success: true, material: materials[mIdx] });
});
app.post("/api/materials/:id/adjust", (req, res) => {
  const { id } = req.params;
  const { amount, reason, operatorId, operatorName } = req.body;
  if (!reason || reason.trim() === "") {
    return res.status(400).json({ error: "H\xE3y nh\u1EADp l\xFD do \u0111i\u1EC1u ch\u1EC9nh b\u1EAFt bu\u1ED9c (BR12)." });
  }
  const materials = db.get("raw_materials");
  const mIdx = materials.findIndex((m) => m.id === id);
  if (mIdx === -1) return res.status(404).json({ error: "Kh\xF4ng t\xECm th\u1EA5y nguy\xEAn v\u1EADt li\u1EC7u." });
  const mat = materials[mIdx];
  const finalStock = mat.stock_current + Number(amount);
  if (finalStock < 0) {
    return res.status(400).json({
      error: `T\u1ED3n kho kh\xF4ng \u0111\u01B0\u1EE3c nh\u1ECF h\u01A1n 0 (BR04). T\u1ED3n hi\u1EC7n t\u1EA1i l\xE0 ${mat.stock_current}, kh\xF4ng th\u1EC3 gi\u1EA3m ${Math.abs(amount)}.`
    });
  }
  mat.stock_current = finalStock;
  db.save("raw_materials", materials);
  const transactions = db.get("inventory_transactions");
  const txId = `tx_${Date.now()}`;
  const newTx = {
    id: txId,
    material_id: id,
    transaction_type: amount > 0 ? "NHAP" : "XUAT",
    quantity: Math.abs(amount),
    created_at: (/* @__PURE__ */ new Date()).toISOString(),
    reference_id: "MANUAL",
    notes: reason
  };
  db.save("inventory_transactions", [newTx, ...transactions]);
  logAction(operatorId || "system", operatorName || "Kho", "\u0110i\u1EC1u ch\u1EC9nh t\u1ED3n kho", `Nh\xE2n vi\xEAn \u0111i\u1EC1u ch\u1EC9nh t\u1ED3n kho th\u1EE7 c\xF4ng: ${mat.name} (${amount > 0 ? "+" : ""}${amount} ${mat.unit}). L\xFD do: ${reason}`);
  return res.json({ success: true, stock: finalStock });
});
app.get("/api/import-receipts", (req, res) => {
  return res.json(db.get("import_receipts"));
});
app.post("/api/import-receipts", (req, res) => {
  const { shipperName, notes, receiptImage, items, employeeId, employeeName } = req.body;
  if (!shipperName) return res.status(400).json({ error: "Thi\u1EBFu t\xEAn ng\u01B0\u1EDDi giao h\xE0ng." });
  if (!items || items.length === 0) return res.status(400).json({ error: "Vui l\xF2ng nh\u1EADp danh m\u1EE5c nguy\xEAn li\u1EC7u nh\u1EADn." });
  if (!receiptImage) {
    return res.status(400).json({ error: "QUY TR\xCCNH B\u1EAET BU\u1ED8C: B\u1EA1n ph\u1EA3i t\u1EA3i l\xEAn \u1EA3nh ch\u1EE5p H\xF3a \u0111\u01A1n/\u0110\u01A1n nh\u1EADp kho tr\u01B0\u1EDBc khi x\xE1c nh\u1EADn!" });
  }
  for (const it of items) {
    if (it.quantity < 0) {
      return res.status(400).json({ error: "S\u1ED1 l\u01B0\u1EE3ng th\u1EF1c nh\u1EADn kh\xF4ng \u0111\u01B0\u1EE3c l\xE0 s\u1ED1 \xE2m (BR06)." });
    }
    if (it.quantity === 0 && (!notes || notes.trim() === "")) {
      const matName = db.get("raw_materials").find((m) => m.id === it.materialId)?.name || it.materialId;
      return res.status(400).json({ error: `Nguy\xEAn li\u1EC7u "${matName}" c\xF3 s\u1ED1 l\u01B0\u1EE3ng nh\u1EADn b\u1EB1ng 0. B\u1EA1n ph\u1EA3i ghi ch\xFA th\xEDch l\xFD do khuy\u1EBFt v\u1EADt t\u01B0 (BR06).` });
    }
  }
  const receiptId = `bb_${Date.now().toString().slice(-4)}`;
  let totalValue = 0;
  const receiptDetails = items.map((it) => {
    totalValue += it.price * it.quantity;
    return {
      receipt_id: receiptId,
      material_id: it.materialId,
      quantity_received: it.quantity,
      price: it.price
    };
  });
  const newReceipt = {
    id: receiptId,
    date_received: (/* @__PURE__ */ new Date()).toISOString(),
    shipper_name: shipperName,
    employee_id: employeeId || "mv005",
    employee_name: employeeName || "Ho\xE0ng V\u0103n E",
    notes: notes || "Nh\u1EADp kho t\u1EEB nh\xE0 cung c\u1EA5p",
    total_value: totalValue,
    receipt_image: receiptImage
  };
  db.save("import_receipts", [newReceipt, ...db.get("import_receipts")]);
  db.save("import_receipt_details", [...receiptDetails, ...db.get("import_receipt_details")]);
  const materials = db.get("raw_materials");
  const transactions = db.get("inventory_transactions");
  const newTxList = [];
  items.forEach((it) => {
    const mIdx = materials.findIndex((m) => m.id === it.materialId);
    if (mIdx !== -1) {
      materials[mIdx].stock_current += it.quantity;
      newTxList.push({
        id: `tx_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`,
        material_id: it.materialId,
        transaction_type: "NHAP",
        quantity: it.quantity,
        created_at: (/* @__PURE__ */ new Date()).toISOString(),
        reference_id: receiptId,
        notes: `Nh\u1EADp kho theo bi\xEAn b\u1EA3n ${receiptId}`
      });
    }
  });
  db.save("raw_materials", materials);
  db.save("inventory_transactions", [...newTxList, ...transactions]);
  logAction(employeeId || "mv005", employeeName || "Ho\xE0ng V\u0103n E", "Bi\xEAn b\u1EA3n nh\u1EADp h\xE0ng", `T\u1EA1o bi\xEAn b\u1EA3n nh\u1EADp h\xE0ng ${receiptId}, t\u1ED5ng c\u1ED9ng tr\u1ECB gi\xE1: ${totalValue.toLocaleString()}\u0111 (BR07)`);
  return res.json({ success: true, receipt: newReceipt });
});
app.get("/api/inventory-transactions", (req, res) => {
  return res.json(db.get("inventory_transactions"));
});
app.get("/api/reservations", (req, res) => {
  return res.json(db.get("table_reservations"));
});
app.post("/api/reservations", (req, res) => {
  const { tableId, customerName, phone, date, time } = req.body;
  if (!tableId || !customerName || !phone || !date || !time) {
    return res.status(400).json({ error: "Vui l\xF2ng nh\u1EADp \u0111\u1EA7y \u0111\u1EE7 c\xE1c th\xF4ng tin \u0111\u1EB7t b\xE0n tr\u01B0\u1EDBc." });
  }
  const reservations = db.get("table_reservations");
  const newRes = {
    id: `db_${Date.now()}`,
    table_id: tableId,
    customer_name: customerName,
    phone,
    reservation_date: date,
    reservation_time: time,
    status: "Ch\u1EDD \u0111\u1EBFn"
  };
  db.save("table_reservations", [newRes, ...reservations]);
  logAction("system", "Nh\xE2n vi\xEAn l\u1EC5 t\xE2n", "\u0110\u1EB7t b\xE0n tr\u01B0\u1EDBc", `T\u1EA1o l\u1ECBch \u0111\u1EB7t b\xE0n cho ${customerName} S\u0110T ${phone} nh\u1EAFm b\xE0n ${tableId} ng\xE0y ${date} l\xFAc ${time}`);
  return res.json({ success: true, reservation: newRes });
});
app.put("/api/reservations/:id/status", (req, res) => {
  const { id } = req.params;
  const { status, operatorId, operatorName } = req.body;
  const reservations = db.get("table_reservations");
  const resIdx = reservations.findIndex((r) => r.id === id);
  if (resIdx === -1) return res.status(404).json({ error: "Kh\xF4ng t\xECm th\u1EA5y l\u01B0\u1EE3t \u0111\u1EB7t b\xE0n." });
  const old = reservations[resIdx];
  reservations[resIdx].status = status;
  db.save("table_reservations", reservations);
  logAction(operatorId || "system", operatorName || "L\u1EC5 t\xE2n", "\u0110\u1ED5i tr\u1EA1ng th\xE1i \u0111\u1EB7t b\xE0n", `L\u01B0\u1EE3t \u0111\u1EB7t b\xE0n ${old.table_id} c\u1EE7a ${old.customer_name} chuy\u1EC3n sang "${status}"`);
  return res.json({ success: true });
});
app.get("/api/logs", (req, res) => {
  return res.json(db.get("system_logs"));
});
app.post("/api/logs", (req, res) => {
  const { employeeId, employeeName, action, changedData } = req.body;
  logAction(employeeId || "hethong", employeeName || "Nh\xE0 b\u1EBFp", action, changedData || "");
  return res.json({ success: true });
});
app.get("/api/reports/materials", (req, res) => {
  const from = req.query.from;
  const to = req.query.to;
  const materials = db.get("raw_materials").filter((mat) => mat.status !== "Ng\u1EEBng ho\u1EA1t \u0111\u1ED9ng");
  const txs = db.get("inventory_transactions");
  const filteredTxs = txs.filter((tx) => {
    const d = tx.created_at.split("T")[0];
    return (!from || d >= from) && (!to || d <= to);
  });
  const report = materials.map((mat) => {
    const matTxs = filteredTxs.filter((tx) => tx.material_id === mat.id);
    const imported = matTxs.filter((tx) => tx.transaction_type === "NHAP").reduce((sum, tx) => sum + tx.quantity, 0);
    const consumed = matTxs.filter((tx) => tx.transaction_type === "XUAT").reduce((sum, tx) => sum + tx.quantity, 0);
    const startingStock = mat.stock_current - imported + consumed;
    return {
      id: mat.id,
      name: mat.name,
      unit: mat.unit,
      starting: startingStock < 0 ? 0 : startingStock,
      imported,
      consumed,
      current: mat.stock_current,
      min: mat.stock_min,
      max: mat.stock_max
    };
  });
  return res.json(report);
});
app.get("/api/reports/staff", (req, res) => {
  const from = req.query.from;
  const to = req.query.to;
  const employees = db.get("employees");
  const logs = db.get("system_logs");
  const filteredLogs = logs.filter((l) => {
    const d = l.created_at.split("T")[0];
    return (!from || d >= from) && (!to || d <= to);
  });
  const report = employees.map((emp) => {
    const empLogs = filteredLogs.filter((l) => l.employee_id === emp.id);
    const actionsCount = empLogs.length;
    const lastActive = empLogs[0] ? empLogs[0].created_at : "Kh\xF4ng ho\u1EA1t \u0111\u1ED9ng";
    return {
      id: emp.id,
      name: emp.name,
      username: emp.username,
      role: emp.role,
      status: emp.status,
      actionsCount,
      lastActive
    };
  });
  return res.json(report);
});
app.get("/api/reports/export", (req, res) => {
  const { type, from, to } = req.query;
  let csvContent = "\uFEFF";
  if (type === "revenue") {
    csvContent += "M\xE3 Phi\xEAn,M\xE3 B\xE0n,Th\u1EDDi Gian B\u1EAFt \u0110\u1EA7u,Th\u1EDDi Gian K\u1EBFt Th\xFAc,Tr\u1EA1ng Th\xE1i,T\u1ED5ng Thanh To\xE1n (VND)\n";
    const sessions = db.get("table_sessions");
    const orders = db.get("orders");
    sessions.forEach((sess) => {
      const d = sess.start_time.split("T")[0];
      if (from && d < from || to && d > to) return;
      const sessionOrders = orders.filter((o) => o.session_id === sess.id);
      const totalCost = sessionOrders.reduce((sum, o) => sum + o.total_amount, 0);
      csvContent += `${sess.id},${sess.table_id},${sess.start_time},${sess.end_time || "Ch\u01B0a \u0111\xF3ng"},${sess.status},${totalCost}
`;
    });
  } else if (type === "materials") {
    csvContent += "M\xE3 NVL,T\xEAn Nguy\xEAn Li\u1EC7u,\u0110\u01A1n V\u1ECB,T\u1ED3n \u0110\u1EA7u K\u1EF3,Nh\u1EADp Trong K\u1EF3,Xu\u1EA5t Ti\xEAu Th\u1EE5,T\u1ED3n Hi\u1EC7n T\u1EA1i\n";
    const materials = db.get("raw_materials").filter((mat) => mat.status !== "Ng\u1EEBng ho\u1EA1t \u0111\u1ED9ng");
    const txs = db.get("inventory_transactions");
    const filteredTxs = txs.filter((tx) => {
      const d = tx.created_at.split("T")[0];
      return (!from || d >= from) && (!to || d <= to);
    });
    materials.forEach((mat) => {
      const matTxs = filteredTxs.filter((tx) => tx.material_id === mat.id);
      const imported = matTxs.filter((tx) => tx.transaction_type === "NHAP").reduce((sum, tx) => sum + tx.quantity, 0);
      const consumed = matTxs.filter((tx) => tx.transaction_type === "XUAT").reduce((sum, tx) => sum + tx.quantity, 0);
      const startingStock = mat.stock_current - imported + consumed;
      csvContent += `${mat.id},${mat.name},${mat.unit},${startingStock < 0 ? 0 : startingStock},${imported},${consumed},${mat.stock_current}
`;
    });
  } else {
    csvContent += "M\xE3 NV,T\xEAn Nh\xE2n Vi\xEAn,T\xE0i Kho\u1EA3n,Vai Tr\xF2,Tr\u1EA1ng Th\xE1i,S\u1ED1 Thao T\xE1c Ghi Nh\u1EADn,Ho\u1EA1t \u0110\u1ED9ng Cu\u1ED1i\n";
    const employees = db.get("employees");
    const logs = db.get("system_logs");
    const filteredLogs = logs.filter((l) => {
      const d = l.created_at.split("T")[0];
      return (!from || d >= from) && (!to || d <= to);
    });
    employees.forEach((emp) => {
      const empLogs = filteredLogs.filter((l) => l.employee_id === emp.id);
      const actionsCount = empLogs.length;
      const lastActive = empLogs[0] ? empLogs[0].created_at : "Kh\xF4ng ho\u1EA1t \u0111\u1ED9ng";
      csvContent += `${emp.id},${emp.name},${emp.username},${emp.role},${emp.status},${actionsCount},${lastActive}
`;
    });
  }
  res.setHeader("Content-Type", "text/csv; charset=utf-8");
  res.setHeader("Content-Disposition", `attachment; filename=bao_cao_${type}_${from}_to_${to}.csv`);
  return res.send(csvContent);
});
var distPath = path2.join(process.cwd(), "dist");
if (fs2.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.get("*", (req, res) => {
    res.sendFile(path2.join(distPath, "index.html"));
  });
}
db.init().then(() => {
  app.listen(PORT, () => {
    console.log(`Express API Server running on port ${PORT}`);
  });
}).catch((err) => {
  console.error("Failed to initialize database:", err);
  process.exit(1);
});
