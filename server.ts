import express from 'express';
import * as path from 'path';
import * as fs from 'fs';
import { db, hashPassword, Employee, TableSession, DiningTable, Customer, Order, OrderDetail, Category, Dish, RawMaterial, ImportReceipt, ImportReceiptDetail, TableReservation, InventoryTransaction, SystemLog } from './db';

const app = express();
const PORT = process.env.PORT || 3001;

// Middlewares
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Simple Logging helper
function logAction(employeeId: string, employeeName: string, action: string, changedData: string) {
  const logs = db.get('system_logs');
  const newLog: SystemLog = {
    id: `log_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    employee_id: employeeId,
    employee_name: employeeName,
    action,
    created_at: new Date().toISOString(),
    changed_data: changedData
  };
  db.save('system_logs', [newLog, ...logs]);
}

// ================= AUTHENTICATION =================
app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'Vui lòng cung cấp đầy đủ thông tin.' });
  }

  const employees = db.get('employees');
  const hashed = hashPassword(password);

  const emp = employees.find(
    e => e.username.toLowerCase() === username.toLowerCase() && e.password_hash === hashed
  );

  if (emp) {
    if (emp.status === 'Ngừng hoạt động') {
      return res.status(403).json({ error: 'Tài khoản nhân viên này hiện đã bị khóa.' });
    }
    logAction(emp.id, emp.name, 'Đăng nhập hệ thống', `Nhân viên đăng nhập với vai trò: ${emp.role}`);
    return res.json({ success: true, user: emp });
  }

  return res.status(401).json({ error: 'Thông tin đăng nhập không chính xác.' });
});

// ================= EMPLOYEES CRUD =================
app.get('/api/employees', (req, res) => {
  return res.json(db.get('employees'));
});

app.post('/api/employees', (req, res) => {
  const { username, password, role, name, phone, operatorId, operatorName } = req.body;
  if (!username || !password || !role || !name) {
    return res.status(400).json({ error: 'Vui lòng điền đầy đủ thông tin nhân viên.' });
  }

  const employees = db.get('employees');
  const maxEmpId = employees.reduce((max: number, e: any) => {
    const num = parseInt(e.id.replace('mv', ''), 10);
    return isNaN(num) ? max : Math.max(max, num);
  }, 0);
  const newEmp: Employee = {
    id: `mv${(maxEmpId + 1).toString().padStart(3, '0')}`,
    username,
    password_hash: hashPassword(password),
    role,
    name,
    status: 'Hoạt động',
    phone: phone || ''
  };

  db.save('employees', [...employees, newEmp]);
  logAction(operatorId || 'system', operatorName || 'Quản lý', 'Thêm nhân viên', `Tạo tài khoản ${username} - vai trò ${role}`);
  return res.json({ success: true, user: newEmp });
});

app.put('/api/employees/:id', (req, res) => {
  const { id } = req.params;
  const { role, name, phone, status, operatorId, operatorName } = req.body;

  const employees = db.get('employees');
  const empIdx = employees.findIndex(e => e.id === id);
  if (empIdx === -1) return res.status(404).json({ error: 'Không tìm thấy nhân viên.' });

  employees[empIdx] = {
    ...employees[empIdx],
    role: role || employees[empIdx].role,
    name: name || employees[empIdx].name,
    phone: phone || employees[empIdx].phone,
    status: status || employees[empIdx].status
  };

  db.save('employees', employees);
  logAction(operatorId || 'system', operatorName || 'Quản lý', 'Cập nhật nhân viên', `Sửa đổi tài khoản ${employees[empIdx].name} (${id})`);
  return res.json({ success: true, user: employees[empIdx] });
});

app.delete('/api/employees/:id', (req, res) => {
  const { id } = req.params;
  const { operatorId, operatorName } = req.body;

  const employees = db.get('employees');
  const empIdx = employees.findIndex(e => e.id === id);
  if (empIdx === -1) return res.status(404).json({ error: 'Không tìm thấy nhân viên.' });

  // Soft lock account
  employees[empIdx].status = 'Ngừng hoạt động';
  db.save('employees', employees);

  logAction(operatorId || 'system', operatorName || 'Quản lý', 'Vô hiệu hóa nhân viên', `Khóa tài khoản nhân viên ${id}`);
  return res.json({ success: true, user: employees[empIdx] });
});

app.post('/api/auth/logout', (req, res) => {
  const { userId, name } = req.body;
  logAction(userId || 'system', name || 'Nhân viên', 'Đăng xuất hệ thống', 'Đăng xuất phiên làm việc');
  return res.json({ success: true });
});

// ================= DINING TABLES =================
app.get('/api/tables', (req, res) => {
  return res.json(db.get('dining_tables'));
});

app.post('/api/tables/:id/status', (req, res) => {
  const { id } = req.params;
  const { status, operatorId, operatorName } = req.body;

  const tables = db.get('dining_tables');
  const tblIdx = tables.findIndex(t => t.id === id);
  if (tblIdx === -1) return res.status(404).json({ error: 'Không tìm thấy bàn ăn.' });

  const oldStatus = tables[tblIdx].status;
  tables[tblIdx].status = status;
  db.save('dining_tables', tables);

  logAction(operatorId || 'system', operatorName || 'Lễ tân', 'Điều hành sơ đồ bàn', `Thay đổi trạng thái bàn ${id} từ "${oldStatus}" sang "${status}"`);
  return res.json({ success: true, table: tables[tblIdx] });
});

app.post('/api/tables/:id/activate', (req, res) => {
  const { id } = req.params;
  const { operatorId, operatorName } = req.body;

  const tables = db.get('dining_tables');
  const tblIdx = tables.findIndex(t => t.id === id);
  if (tblIdx === -1) return res.status(404).json({ error: 'Không tìm thấy bàn ăn.' });

  if (tables[tblIdx].status !== 'trong') {
    return res.status(400).json({ error: 'Bàn ăn không ở trạng thái trống để kích hoạt chuẩn bị.' });
  }

  tables[tblIdx].status = 'chuan_bi';
  db.save('dining_tables', tables);

  logAction(operatorId || 'system', operatorName || 'Nhân viên', 'Kích hoạt bàn', `Bàn ${id} chuyển sang "Đang chuẩn bị"`);
  return res.json({ success: true, table: tables[tblIdx] });
});

app.post('/api/tables/:id/deactivate', (req, res) => {
  const { id } = req.params;
  const { operatorId, operatorName } = req.body;

  const tables = db.get('dining_tables');
  const tblIdx = tables.findIndex(t => t.id === id);
  if (tblIdx === -1) return res.status(404).json({ error: 'Không tìm thấy bàn ăn.' });

  tables[tblIdx].status = 'trong';
  db.save('dining_tables', tables);

  logAction(operatorId || 'system', operatorName || 'Nhân viên', 'Hủy kích hoạt bàn', `Bàn ${id} chuyển về "Trống"`);
  return res.json({ success: true, table: tables[tblIdx] });
});

// ================= TABLE SESSIONS =================
app.get('/api/sessions', (req, res) => {
  return res.json(db.get('table_sessions'));
});


app.post(['/api/sessions', '/api/sessions/start'], (req, res) => {
  const { tableId, phone, guestsCount, existingCode, createdBy, customerName } = req.body;
  if (!tableId || !phone) {
    return res.status(400).json({ error: 'Thiếu thông tin số bàn hoặc số điện thoại.' });
  }
  // Validate phone number: must be exactly 10 digits
  const trimmedPhone = phone.trim();
  const phoneRegex = /^[0-9]{10}$/;
  if (!phoneRegex.test(trimmedPhone)) {
    return res.status(400).json({ error: 'Số điện thoại phải gồm 10 chữ số.' });
  }

  const sessions = db.get('table_sessions');
  const activeSess = sessions.find(s => s.table_id === tableId && s.status === 'active');
  if (activeSess) {
    return res.json({ success: true, shareCode: activeSess.share_code, sessionId: activeSess.id });
  }

  // Find or register customer
  const customers = db.get('customers');
  let cust = customers.find(c => c.phone.trim() === trimmedPhone);
  if (!cust) {
    cust = { id: `cust_${Date.now()}`, phone: trimmedPhone };
    db.save('customers', [...customers, cust]);
  }

  const generatedCode = existingCode || Math.random().toString(36).substring(2, 6).toUpperCase();
  const sessionId = `s_${tableId}_${Date.now().toString().slice(-4)}`;
  const displayCustomerName = customerName && customerName.trim() ? customerName.trim() : 'Khách vãng lai';

  const newSession: TableSession = {
    id: sessionId,
    table_id: tableId,
    customer_id: cust.id,
    customer_phone: trimmedPhone,
    start_time: new Date().toISOString(),
    end_time: null,
    share_code: generatedCode,
    status: 'active',
    guests_count: guestsCount ? Number(guestsCount) : 4,
    customer_name: displayCustomerName,
    created_by: createdBy || null
  };

  db.save('table_sessions', [newSession, ...sessions]);

  // Update table status to co_khach
  const tables = db.get('dining_tables');
  const tblIdx = tables.findIndex(t => t.id === tableId);
  if (tblIdx !== -1) {
    tables[tblIdx].status = 'co_khach';
    db.save('dining_tables', tables);
  }

  logAction(
    createdBy || 'guest',
    createdBy ? 'Nhân viên lễ tân' : 'Khách hàng',
    'Mở phiên đặt bàn',
    `Kích hoạt bàn ${tableId} cho ${displayCustomerName} cùng SĐT ${trimmedPhone} - Khách ngồi: ${newSession.guests_count} - Mã: ${generatedCode}`
  );

  return res.json({ success: true, shareCode: generatedCode, sessionId });
});


// ================= QR ORDER =================
app.get('/qr-order', (req, res) => {
  const tableId = req.query.table as string;
  if (!tableId) {
    return res.redirect('/customer');
  }
  return res.redirect(`/customer?table=${tableId}`);
});

app.post('/api/sessions/:id/pay', (req, res) => {
  const { id } = req.params;
  const { operatorId, operatorName } = req.body;

  const sessions = db.get('table_sessions');
  const sessIdx = sessions.findIndex(s => s.id === id && s.status === 'active');
  if (sessIdx === -1) return res.status(404).json({ error: 'Không tìm thấy phiên bàn ăn đang hoạt động.' });

  const session = sessions[sessIdx];
  session.status = 'completed';
  session.end_time = new Date().toISOString();
  db.save('table_sessions', sessions);

  // Transition table state directly to TRONG
  const tables = db.get('dining_tables');
  const tblIdx = tables.findIndex(t => t.id === session.table_id);
  if (tblIdx !== -1) {
    tables[tblIdx].status = 'trong';
    db.save('dining_tables', tables);
  }

  logAction(operatorId || 'system', operatorName || 'Lễ tân', 'Thanh toán & Đóng phiên', `Hoàn tất phiên ${id} cho bàn ${session.table_id}. Bàn trả về trạng thái Trống.`);
  return res.json({ success: true });
});

// ================= CATEGORIES & DISHES =================
app.get('/api/categories', (req, res) => {
  return res.json(db.get('categories'));
});

app.post('/api/categories', (req, res) => {
  const { name, sort_order, status, operatorId, operatorName } = req.body;
  if (!name) return res.status(400).json({ error: 'Tên danh mục không được trống.' });

  const categories = db.get('categories');
  const maxIdNum = categories.reduce((max: number, c: any) => {
    const num = parseInt(c.id.replace('dm', ''), 10);
    return isNaN(num) ? max : Math.max(max, num);
  }, 0);
  const newCat: Category = {
    id: `dm${(maxIdNum + 1).toString().padStart(2, '0')}`,
    name,
    sort_order: sort_order ? Number(sort_order) : maxIdNum + 1,
    status: status || 'Hiển thị'
  };

  db.save('categories', [...categories, newCat]);
  logAction(operatorId || 'system', operatorName || 'Quản lý', 'Thêm danh mục', `Tạo danh mục "${name}"`);
  return res.json({ success: true, category: newCat });
});

app.put('/api/categories/:id', (req, res) => {
  const { id } = req.params;
  const { name, sort_order, status, operatorId, operatorName } = req.body;

  const categories = db.get('categories');
  const catIdx = categories.findIndex(c => c.id === id);
  if (catIdx === -1) return res.status(404).json({ error: 'Không tìm thấy danh mục.' });

  categories[catIdx] = { ...categories[catIdx], name, sort_order: Number(sort_order), status };
  db.save('categories', categories);

  logAction(operatorId || 'system', operatorName || 'Quản lý', 'Cập nhật danh mục', `Sửa thông tin danh mục "${name}"`);
  return res.json({ success: true, category: categories[catIdx] });
});

app.delete('/api/categories/:id', (req, res) => {
  const { id } = req.params;
  const categories = db.get('categories');
  const filtered = categories.filter(c => c.id !== id);
  db.save('categories', filtered);
  return res.json({ success: true });
});

app.get('/api/dishes', (req, res) => {
  return res.json(db.get('dishes'));
});

app.post('/api/dishes', (req, res) => {
  const { category_id, name, price, description, image_url, status, operatorId, operatorName } = req.body;
  if (!name || price === undefined) {
    return res.status(400).json({ error: 'Thiếu tên món hoặc giá bán.' });
  }

  if (price < 0) {
    return res.status(400).json({ error: 'Đơn giá món ăn không được là số âm (BR09).' });
  }

  const dishes = db.get('dishes');
  const maxDishId = dishes.reduce((max: number, d: any) => {
    const num = parseInt(d.id.replace('m', ''), 10);
    return isNaN(num) ? max : Math.max(max, num);
  }, 0);
  const newDish: Dish = {
    id: `m${(maxDishId + 1).toString().padStart(2, '0')}`,
    category_id,
    name,
    price: Number(price),
    description: description || '',
    image_url: image_url || 'https://images.unsplash.com/photo-1547928500-4722f55cc829?w=600',
    status: status || 'Hết món'
  };

  db.save('dishes', [...dishes, newDish]);
  logAction(operatorId || 'system', operatorName || 'Quản lý', 'Khai báo món ăn', `Tạo món mới "${name}" giá ${newDish.price.toLocaleString()}đ`);
  return res.json({ success: true, dish: newDish });
});

app.put('/api/dishes/:id', (req, res) => {
  const { id } = req.params;
  const { category_id, name, price, description, image_url, status, operatorId, operatorName } = req.body;

  if (price < 0) {
    return res.status(400).json({ error: 'Đơn giá món ăn không được là số âm (BR09).' });
  }

  const dishes = db.get('dishes');
  const dishIdx = dishes.findIndex(d => d.id === id);
  if (dishIdx === -1) return res.status(404).json({ error: 'Không tìm thấy món ăn.' });

  // BR08: A dish must define at least 1 raw material before being marked ready ("Còn phục vụ")
  if (status === 'Còn phục vụ') {
    const recipes = db.get('recipe_items').filter(r => r.dish_id === id);
    if (recipes.length === 0) {
      return res.status(400).json({ error: 'Món ăn phải được khai báo ít nhất một nguyên liệu định lượng trước khi hoạt động! (BR08)' });
    }
  }

  dishes[dishIdx] = {
    id,
    category_id,
    name,
    price: Number(price),
    description: description || '',
    image_url: image_url || dishes[dishIdx].image_url,
    status
  };
  db.save('dishes', dishes);

  logAction(operatorId || 'system', operatorName || 'Quản lý', 'Cập nhật món ăn', `Sửa thông tin món "${name}"`);
  return res.json({ success: true, dish: dishes[dishIdx] });
});

app.delete('/api/dishes/:id', (req, res) => {
  const { id } = req.params;
  const { operatorId, operatorName } = req.body;

  // BR09: Cannot delete, change status to Ngừng phục vụ instead!
  const dishes = db.get('dishes');
  const dishIdx = dishes.findIndex(d => d.id === id);
  if (dishIdx === -1) return res.status(404).json({ error: 'Không tìm thấy món ăn.' });

  dishes[dishIdx].status = 'Ngừng phục vụ';
  db.save('dishes', dishes);

  logAction(operatorId || 'system', operatorName || 'Quản lý', 'Ngưng phục vụ món', `Ngừng phục vụ món ${id} (${dishes[dishIdx].name}) (BR09)`);
  return res.json({ success: true, dish: dishes[dishIdx] });
});

app.get('/api/recipes', (req, res) => {
  return res.json(db.get('recipe_items'));
});

app.put('/api/recipes/:dishId', (req, res) => {
  const { dishId } = req.params;
  const { recipeItems, operatorId, operatorName } = req.body; // Array of recipe items

  const recipes = db.get('recipe_items');
  const filtered = recipes.filter(r => r.dish_id !== dishId);
  const updatedRecipes = [...filtered, ...recipeItems];

  db.save('recipe_items', updatedRecipes);
  logAction(operatorId || 'system', operatorName || 'Quản lý', 'Cập nhật định lượng', `Chỉnh sửa công thức định lượng nguyên vật liệu cho món ${dishId}`);
  return res.json({ success: true });
});

// ================= ORDERS & DETAILS =================
app.get('/api/orders', (req, res) => {
  return res.json(db.get('orders'));
});

app.get('/api/order-details', (req, res) => {
  return res.json(db.get('order_details'));
});

app.post('/api/orders', (req, res) => {
  const { tableId, cartItems } = req.body; // cartItems: { dishId: string, quantity: number, notes: string }[]
  if (!tableId || !cartItems || cartItems.length === 0) {
    return res.status(400).json({ error: 'Thiếu thông tin bàn ăn hoặc giỏ hàng.' });
  }

  // Validate active session
  const sessions = db.get('table_sessions');
  const activeSession = sessions.find(s => s.table_id === tableId && s.status === 'active');
  if (!activeSession) {
    return res.status(400).json({ error: `Không tìm thấy phiên đặt bàn đang hoạt động cho Bàn ${tableId}` });
  }

  // Confirm items are not Out of Stock / Disabled
  const dishes = db.get('dishes');
  for (const item of cartItems) {
    const dish = dishes.find(d => d.id === item.dishId);
    if (!dish || dish.status !== 'Còn phục vụ') {
      return res.status(400).json({ error: `Món "${dish ? dish.name : item.dishId}" hiện đã hết món hoặc ngừng phục vụ.` });
    }
  }

  const orderId = `o_${tableId}_${Date.now().toString().slice(-4)}`;
  let totalComputed = 0;

  const orderDetails = db.get('order_details');
  const newDetails: OrderDetail[] = cartItems.map((item: any, index: number) => {
    const dish = dishes.find(d => d.id === item.dishId)!;
    totalComputed += dish.price * item.quantity;
    return {
      id: `od_${Date.now()}_${index}`,
      order_id: orderId,
      dish_id: item.dishId,
      quantity: item.quantity,
      price_at_time: dish.price,
      item_status: 'Đang chờ',
      notes: item.notes || '',
      ordered_at: new Date().toISOString()
    };
  });

  const newOrder: Order = {
    id: orderId,
    session_id: activeSession.id,
    created_at: new Date().toISOString(),
    service_status: 'Đang chuẩn bị',
    total_amount: totalComputed
  };

  db.save('orders', [newOrder, ...db.get('orders')]);
  db.save('order_details', [...newDetails, ...orderDetails]);

  logAction('guest', 'Khách hàng', 'Đặt món ăn', `Khách bàn ${tableId} gửi đơn ${orderId} gồm ${cartItems.length} món. Tạm tính ${totalComputed.toLocaleString()}đ`);

  return res.json({ success: true, orderId });
});

app.put('/api/order-details/:id/status', (req, res) => {
  const { id } = req.params;
  const { status, operatorId, operatorName } = req.body;

  const orderDetails = db.get('order_details');
  const detailIdx = orderDetails.findIndex(od => od.id === id);
  if (detailIdx === -1) return res.status(404).json({ error: 'Không tìm thấy chi tiết đơn hàng.' });

  const item = orderDetails[detailIdx];
  const oldStatus = item.item_status;

  // BR10: One-way status progression: Đang chờ -> Đang chế biến -> Đã hoàn thành -> Đã phục vụ
  const statusHierarchy = ['Đang chờ', 'Đang chế biến', 'Đã hoàn thành', 'Đã phục vụ'];
  const currentIndex = statusHierarchy.indexOf(oldStatus);
  const nextIndex = statusHierarchy.indexOf(status);

  if (nextIndex <= currentIndex) {
    return res.status(400).json({
      error: `Quá trình chế biến chỉ di chuyển một chiều (BR10). Không thể cập nhật ngược từ "${oldStatus}" về "${status}".`
    });
  }

  // BR11 / Deduct inventory automatically on transitioning into "Đang chế biến"
  if (oldStatus === 'Đang chờ' && status === 'Đang chế biến') {
    const recipes = db.get('recipe_items').filter(r => r.dish_id === item.dish_id);
    const materials = db.get('raw_materials');
    const transactions = db.get('inventory_transactions');
    const insufficient: string[] = [];

    // Pre-check stock levels
    recipes.forEach(recipe => {
      const mat = materials.find(m => m.id === recipe.material_id);
      if (!mat) return;
      const totalNeeded = recipe.quantity * item.quantity;
      if (mat.stock_current < totalNeeded) {
        insufficient.push(`${mat.name} (Thiếu ${(totalNeeded - mat.stock_current).toLocaleString()}${mat.unit})`);
      }
    });

    if (insufficient.length > 0) {
      // Set dish status to Out of Stock
      const dishes = db.get('dishes');
      const dIdx = dishes.findIndex(d => d.id === item.dish_id);
      if (dIdx !== -1) {
        dishes[dIdx].status = 'Hết món';
        db.save('dishes', dishes);
      }

      logAction(operatorId || 'system', operatorName || 'Bếp', 'Thiếu hụt nguyên liệu', `Bếp từ chối nấu món "${dishes[dIdx]?.name}" do thiếu: ${insufficient.join(', ')}`);

      return res.status(400).json({
        error: `Không đủ tồn kho nguyên vật liệu để chế biến! Thiếu: ${insufficient.join(', ')}. Hệ thống đã tự động đánh dấu HẾT MÓN trên thực đơn.`
      });
    }

    // Deduct stock and record transactions
    const newTxList: InventoryTransaction[] = [];
    recipes.forEach(recipe => {
      const mIdx = materials.findIndex(m => m.id === recipe.material_id);
      if (mIdx !== -1) {
        const consumed = recipe.quantity * item.quantity;
        materials[mIdx].stock_current -= consumed;
        if (materials[mIdx].stock_current < 0) materials[mIdx].stock_current = 0;

        newTxList.push({
          id: `tx_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`,
          material_id: recipe.material_id,
          transaction_type: 'XUAT',
          quantity: consumed,
          created_at: new Date().toISOString(),
          reference_id: item.order_id,
          notes: `Khấu trừ tự động chế biến chi tiết đơn ${item.id}`
        });
      }
    });

    db.save('raw_materials', materials);
    db.save('inventory_transactions', [...newTxList, ...transactions]);
    logAction(operatorId || 'system', operatorName || 'Bếp', 'Khấu trừ kho tự động', `Đã trừ nguyên liệu cho chi tiết món ${item.dish_id} x${item.quantity} trong đơn ${item.order_id}`);
  }

  // Update detail status
  item.item_status = status;
  db.save('order_details', orderDetails);

  // Re-compute parent order aggregate service status
  setTimeout(() => {
    const latestDetails = db.get('order_details');
    const siblings = latestDetails.filter(od => od.order_id === item.order_id);
    const allServed = siblings.every(od => od.item_status === 'Đã phục vụ');
    const allDone = siblings.every(od => od.item_status === 'Đã hoàn thành' || od.item_status === 'Đã phục vụ');

    const orders = db.get('orders');
    const oIdx = orders.findIndex(o => o.id === item.order_id);
    if (oIdx !== -1) {
      if (allServed) {
        orders[oIdx].service_status = 'Đã phục vụ';
      } else if (allDone) {
        orders[oIdx].service_status = 'Đã chế biến';
      } else {
        orders[oIdx].service_status = 'Đang chế biến';
      }
      db.save('orders', orders);
    }
  }, 30);

  logAction(operatorId || 'system', operatorName || 'Nhân viên', 'Cập nhật món ăn', `Thay đổi trạng thái món ăn trong đơn ${item.order_id} sang "${status}"`);
  return res.json({ success: true });
});

app.post('/api/order-details/:id/cancel', (req, res) => {
  const { id } = req.params;
  const { operatorId, operatorName } = req.body;

  const orderDetails = db.get('order_details');
  const detailIdx = orderDetails.findIndex(od => od.id === id);
  if (detailIdx === -1) return res.status(404).json({ error: 'Không tìm thấy chi tiết đơn hàng.' });

  const item = orderDetails[detailIdx];
  if (item.item_status !== 'Đang chờ') {
    return res.status(400).json({ error: 'Chỉ có thể hủy món ăn khi đang ở trạng thái Đang chờ.' });
  }

  item.item_status = 'Đã hủy';
  db.save('order_details', orderDetails);

  // Recalculate parent order total price and status
  const orders = db.get('orders');
  const oIdx = orders.findIndex(o => o.id === item.order_id);
  if (oIdx !== -1) {
    const subtractedAmount = item.price_at_time * item.quantity;
    orders[oIdx].total_amount = Math.max(0, orders[oIdx].total_amount - subtractedAmount);

    const siblings = orderDetails.filter(od => od.order_id === item.order_id);
    const nonCancelled = siblings.filter(od => od.item_status !== 'Đã hủy');

    if (nonCancelled.length === 0) {
      orders[oIdx].service_status = 'Đã phục vụ';
    } else {
      const allServed = nonCancelled.every(od => od.item_status === 'Đã phục vụ');
      const allDone = nonCancelled.every(od => od.item_status === 'Đã hoàn thành' || od.item_status === 'Đã phục vụ');
      if (allServed) {
        orders[oIdx].service_status = 'Đã phục vụ';
      } else if (allDone) {
        orders[oIdx].service_status = 'Đã chế biến';
      } else {
        orders[oIdx].service_status = 'Đang chế biến';
      }
    }
    db.save('orders', orders);
  }

  logAction(operatorId || 'guest', operatorName || 'Khách hàng', 'Hủy món ăn', `Đã hủy món ăn trong đơn ${item.order_id}: chi tiết ${item.id}`);
  return res.json({ success: true });
});

app.post('/api/orders/:id/invoice', (req, res) => {
  const { id } = req.params;
  const { imageBase64, operatorId, operatorName } = req.body;

  const orders = db.get('orders');
  const oIdx = orders.findIndex(o => o.id === id);
  if (oIdx === -1) return res.status(404).json({ error: 'Không tìm thấy hóa đơn.' });

  orders[oIdx].invoice_image = imageBase64;
  db.save('orders', orders);

  logAction(operatorId || 'system', operatorName || 'Nhân viên', 'Cập nhật hóa đơn', `Tải ảnh hóa đơn thanh toán cho đơn ${id}`);
  return res.json({ success: true });
});

// ================= WAREHOUSE & MATERIALS =================
app.get('/api/materials', (req, res) => {
  return res.json(db.get('raw_materials'));
});

app.post('/api/materials', (req, res) => {
  const { name, unit, stock_current, stock_min, stock_max, operatorId, operatorName } = req.body;
  if (!name || !unit) {
    return res.status(400).json({ error: 'Tên và đơn vị tính nguyên liệu không được trống.' });
  }

  const materials = db.get('raw_materials');
  const maxMatId = materials.reduce((max: number, m: any) => {
    const num = parseInt(m.id.replace('nvl', ''), 10);
    return isNaN(num) ? max : Math.max(max, num);
  }, 0);
  const newMat: RawMaterial = {
    id: `nvl${(maxMatId + 1).toString().padStart(2, '0')}`,
    name,
    unit,
    stock_current: stock_current ? Number(stock_current) : 0,
    stock_min: stock_min ? Number(stock_min) : 0,
    stock_max: stock_max ? Number(stock_max) : 10000
  };

  db.save('raw_materials', [...materials, newMat]);
  logAction(operatorId || 'system', operatorName || 'Kho', 'Khai báo nguyên liệu', `Thêm mới vật tư "${name}" vào danh mục`);
  return res.json({ success: true, material: newMat });
});

app.put('/api/materials/:id', (req, res) => {
  const { id } = req.params;
  const { name, unit, stock_current, stock_min, stock_max, operatorId, operatorName } = req.body;

  if (stock_min >= stock_max) {
    return res.status(400).json({ error: 'Ngưỡng tồn tối thiểu phải nhỏ hơn ngưỡng tồn tối đa! (BR05)' });
  }

  const materials = db.get('raw_materials');
  const mIdx = materials.findIndex(m => m.id === id);
  if (mIdx === -1) return res.status(404).json({ error: 'Không tìm thấy nguyên vật liệu.' });

  materials[mIdx] = {
    id,
    name: name || materials[mIdx].name,
    unit: unit || materials[mIdx].unit,
    stock_current: stock_current !== undefined ? Number(stock_current) : materials[mIdx].stock_current,
    stock_min: Number(stock_min),
    stock_max: Number(stock_max)
  };
  db.save('raw_materials', materials);

  logAction(operatorId || 'system', operatorName || 'Kho', 'Cập nhật nguyên liệu', `Sửa cấu hình định mức tồn kho cho "${materials[mIdx].name}"`);
  return res.json({ success: true, material: materials[mIdx] });
});

app.post('/api/materials/:id/adjust', (req, res) => {
  const { id } = req.params;
  const { amount, reason, operatorId, operatorName } = req.body;

  if (!reason || reason.trim() === '') {
    return res.status(400).json({ error: 'Hãy nhập lý do điều chỉnh bắt buộc (BR12).' });
  }

  const materials = db.get('raw_materials');
  const mIdx = materials.findIndex(m => m.id === id);
  if (mIdx === -1) return res.status(404).json({ error: 'Không tìm thấy nguyên vật liệu.' });

  const mat = materials[mIdx];
  const finalStock = mat.stock_current + Number(amount);

  if (finalStock < 0) {
    return res.status(400).json({
      error: `Tồn kho không được nhỏ hơn 0 (BR04). Tồn hiện tại là ${mat.stock_current}, không thể giảm ${Math.abs(amount)}.`
    });
  }

  mat.stock_current = finalStock;
  db.save('raw_materials', materials);

  // Record transactions log
  const transactions = db.get('inventory_transactions');
  const txId = `tx_${Date.now()}`;
  const newTx: InventoryTransaction = {
    id: txId,
    material_id: id,
    transaction_type: amount > 0 ? 'NHAP' : 'XUAT',
    quantity: Math.abs(amount),
    created_at: new Date().toISOString(),
    reference_id: 'MANUAL',
    notes: reason
  };
  db.save('inventory_transactions', [newTx, ...transactions]);

  logAction(operatorId || 'system', operatorName || 'Kho', 'Điều chỉnh tồn kho', `Nhân viên điều chỉnh tồn kho thủ công: ${mat.name} (${amount > 0 ? '+' : ''}${amount} ${mat.unit}). Lý do: ${reason}`);
  return res.json({ success: true, stock: finalStock });
});

app.get('/api/import-receipts', (req, res) => {
  return res.json(db.get('import_receipts'));
});

app.post('/api/import-receipts', (req, res) => {
  const { shipperName, notes, receiptImage, items, employeeId, employeeName } = req.body;
  // items: { materialId: string, quantity: number, price: number }[]

  if (!shipperName) return res.status(400).json({ error: 'Thiếu tên người giao hàng.' });
  if (!items || items.length === 0) return res.status(400).json({ error: 'Vui lòng nhập danh mục nguyên liệu nhận.' });
  if (!receiptImage) {
    return res.status(400).json({ error: 'QUY TRÌNH BẮT BUỘC: Bạn phải tải lên ảnh chụp Hóa đơn/Đơn nhập kho trước khi xác nhận!' });
  }

  // BR06: Check non-negative quantity. If zero quantity, notes must exist.
  for (const it of items) {
    if (it.quantity < 0) {
      return res.status(400).json({ error: 'Số lượng thực nhận không được là số âm (BR06).' });
    }
    if (it.quantity === 0 && (!notes || notes.trim() === '')) {
      const matName = db.get('raw_materials').find(m => m.id === it.materialId)?.name || it.materialId;
      return res.status(400).json({ error: `Nguyên liệu "${matName}" có số lượng nhận bằng 0. Bạn phải ghi chú thích lý do khuyết vật tư (BR06).` });
    }
  }

  const receiptId = `bb_${Date.now().toString().slice(-4)}`;
  let totalValue = 0;

  const receiptDetails: ImportReceiptDetail[] = items.map((it: any) => {
    totalValue += it.price * it.quantity;
    return {
      receipt_id: receiptId,
      material_id: it.materialId,
      quantity_received: it.quantity,
      price: it.price
    };
  });

  const newReceipt: ImportReceipt = {
    id: receiptId,
    date_received: new Date().toISOString(),
    shipper_name: shipperName,
    employee_id: employeeId || 'mv005',
    employee_name: employeeName || 'Hoàng Văn E',
    notes: notes || 'Nhập kho từ nhà cung cấp',
    total_value: totalValue,
    receipt_image: receiptImage
  };

  db.save('import_receipts', [newReceipt, ...db.get('import_receipts')]);
  db.save('import_receipt_details', [...receiptDetails, ...db.get('import_receipt_details')]);

  // Adjust materials inventory and write transaction logs
  const materials = db.get('raw_materials');
  const transactions = db.get('inventory_transactions');
  const newTxList: InventoryTransaction[] = [];

  items.forEach((it: any) => {
    const mIdx = materials.findIndex(m => m.id === it.materialId);
    if (mIdx !== -1) {
      materials[mIdx].stock_current += it.quantity;
      newTxList.push({
        id: `tx_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`,
        material_id: it.materialId,
        transaction_type: 'NHAP',
        quantity: it.quantity,
        created_at: new Date().toISOString(),
        reference_id: receiptId,
        notes: `Nhập kho theo biên bản ${receiptId}`
      });
    }
  });

  db.save('raw_materials', materials);
  db.save('inventory_transactions', [...newTxList, ...transactions]);

  logAction(employeeId || 'mv005', employeeName || 'Hoàng Văn E', 'Biên bản nhập hàng', `Tạo biên bản nhập hàng ${receiptId}, tổng cộng trị giá: ${totalValue.toLocaleString()}đ (BR07)`);
  return res.json({ success: true, receipt: newReceipt });
});

app.get('/api/inventory-transactions', (req, res) => {
  return res.json(db.get('inventory_transactions'));
});

// ================= RESERVATIONS =================
app.get('/api/reservations', (req, res) => {
  return res.json(db.get('table_reservations'));
});

app.post('/api/reservations', (req, res) => {
  const { tableId, customerName, phone, date, time } = req.body;
  if (!tableId || !customerName || !phone || !date || !time) {
    return res.status(400).json({ error: 'Vui lòng nhập đầy đủ các thông tin đặt bàn trước.' });
  }

  const reservations = db.get('table_reservations');
  const newRes: TableReservation = {
    id: `db_${Date.now()}`,
    table_id: tableId,
    customer_name: customerName,
    phone,
    reservation_date: date,
    reservation_time: time,
    status: 'Chờ đến'
  };

  db.save('table_reservations', [newRes, ...reservations]);
  logAction('system', 'Nhân viên lễ tân', 'Đặt bàn trước', `Tạo lịch đặt bàn cho ${customerName} SĐT ${phone} nhắm bàn ${tableId} ngày ${date} lúc ${time}`);
  return res.json({ success: true, reservation: newRes });
});

app.put('/api/reservations/:id/status', (req, res) => {
  const { id } = req.params;
  const { status, operatorId, operatorName } = req.body;

  const reservations = db.get('table_reservations');
  const resIdx = reservations.findIndex(r => r.id === id);
  if (resIdx === -1) return res.status(404).json({ error: 'Không tìm thấy lượt đặt bàn.' });

  const old = reservations[resIdx];
  reservations[resIdx].status = status;
  db.save('table_reservations', reservations);

  logAction(operatorId || 'system', operatorName || 'Lễ tân', 'Đổi trạng thái đặt bàn', `Lượt đặt bàn ${old.table_id} của ${old.customer_name} chuyển sang "${status}"`);
  return res.json({ success: true });
});

// ================= LOGS =================
app.get('/api/logs', (req, res) => {
  return res.json(db.get('system_logs'));
});

app.post('/api/logs', (req, res) => {
  const { employeeId, employeeName, action, changedData } = req.body;
  logAction(employeeId || 'hethong', employeeName || 'Nhà bếp', action, changedData || '');
  return res.json({ success: true });
});

// ================= SPECIAL ANALYTICAL REPORTS =================
// Date range filter report for Materials
app.get('/api/reports/materials', (req, res) => {
  const from = req.query.from as string;
  const to = req.query.to as string;

  const materials = db.get('raw_materials');
  const txs = db.get('inventory_transactions');

  // Filter transactions in range
  const filteredTxs = txs.filter(tx => {
    const d = tx.created_at.split('T')[0];
    return (!from || d >= from) && (!to || d <= to);
  });

  const report = materials.map(mat => {
    const matTxs = filteredTxs.filter(tx => tx.material_id === mat.id);
    const imported = matTxs.filter(tx => tx.transaction_type === 'NHAP').reduce((sum, tx) => sum + tx.quantity, 0);
    const consumed = matTxs.filter(tx => tx.transaction_type === 'XUAT').reduce((sum, tx) => sum + tx.quantity, 0);

    // Simulating starting stock level before filtering
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

// Date range filter report for Staff Activity
app.get('/api/reports/staff', (req, res) => {
  const from = req.query.from as string;
  const to = req.query.to as string;

  const employees = db.get('employees');
  const logs = db.get('system_logs');

  const filteredLogs = logs.filter(l => {
    const d = l.created_at.split('T')[0];
    return (!from || d >= from) && (!to || d <= to);
  });

  const report = employees.map(emp => {
    const empLogs = filteredLogs.filter(l => l.employee_id === emp.id);
    const actionsCount = empLogs.length;
    const lastActive = empLogs[0] ? empLogs[0].created_at : 'Không hoạt động';

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

// CSV Export Endpoint
app.get('/api/reports/export', (req, res) => {
  const { type, from, to } = req.query;
  let csvContent = '\uFEFF'; // Add BOM for Excel Vietnamese compatibility

  if (type === 'revenue') {
    csvContent += 'Mã Phiên,Mã Bàn,Thời Gian Bắt Đầu,Thời Gian Kết Thúc,Trạng Thái,Tổng Thanh Toán (VND)\n';
    const sessions = db.get('table_sessions');
    const orders = db.get('orders');

    sessions.forEach(sess => {
      const d = sess.start_time.split('T')[0];
      if ((from && d < from) || (to && d > to)) return;

      const sessionOrders = orders.filter(o => o.session_id === sess.id);
      const totalCost = sessionOrders.reduce((sum, o) => sum + o.total_amount, 0);

      csvContent += `${sess.id},${sess.table_id},${sess.start_time},${sess.end_time || 'Chưa đóng'},${sess.status},${totalCost}\n`;
    });
  } else if (type === 'materials') {
    csvContent += 'Mã NVL,Tên Nguyên Liệu,Đơn Vị,Tồn Đầu Kỳ,Nhập Trong Kỳ,Xuất Tiêu Thụ,Tồn Hiện Tại\n';
    const materials = db.get('raw_materials');
    const txs = db.get('inventory_transactions');
    const filteredTxs = txs.filter(tx => {
      const d = tx.created_at.split('T')[0];
      return (!from || d >= from) && (!to || d <= to);
    });

    materials.forEach(mat => {
      const matTxs = filteredTxs.filter(tx => tx.material_id === mat.id);
      const imported = matTxs.filter(tx => tx.transaction_type === 'NHAP').reduce((sum, tx) => sum + tx.quantity, 0);
      const consumed = matTxs.filter(tx => tx.transaction_type === 'XUAT').reduce((sum, tx) => sum + tx.quantity, 0);
      const startingStock = mat.stock_current - imported + consumed;

      csvContent += `${mat.id},${mat.name},${mat.unit},${startingStock < 0 ? 0 : startingStock},${imported},${consumed},${mat.stock_current}\n`;
    });
  } else {
    csvContent += 'Mã NV,Tên Nhân Viên,Tài Khoản,Vai Trò,Trạng Thái,Số Thao Tác Ghi Nhận,Hoạt Động Cuối\n';
    const employees = db.get('employees');
    const logs = db.get('system_logs');
    const filteredLogs = logs.filter(l => {
      const d = l.created_at.split('T')[0];
      return (!from || d >= from) && (!to || d <= to);
    });

    employees.forEach(emp => {
      const empLogs = filteredLogs.filter(l => l.employee_id === emp.id);
      const actionsCount = empLogs.length;
      const lastActive = empLogs[0] ? empLogs[0].created_at : 'Không hoạt động';

      csvContent += `${emp.id},${emp.name},${emp.username},${emp.role},${emp.status},${actionsCount},${lastActive}\n`;
    });
  }

  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', `attachment; filename=bao_cao_${type}_${from}_to_${to}.csv`);
  return res.send(csvContent);
});

// Serves built client in production
const distPath = path.join(process.cwd(), 'dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.get('*', (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

// Start Server
db.init().then(() => {
  app.listen(PORT, () => {
    console.log(`Express API Server running on port ${PORT}`);
  });
}).catch(err => {
  console.error('Failed to initialize database:', err);
  process.exit(1);
});

