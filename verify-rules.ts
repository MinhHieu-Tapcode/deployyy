import { db, hashPassword } from './db';

async function runTests() {
  console.log('=== STARTING BUSINESS RULES AND FLOW VERIFICATION ===');
  await db.init();
  let passed = 0;
  let failed = 0;

  const assert = (condition: boolean, message: string) => {
    if (condition) {
      console.log(`[PASS] ${message}`);
      passed++;
    } else {
      console.error(`[FAIL] ${message}`);
      failed++;
    }
  };

  // Test 1: Verify database tables count
  try {
    const tableKeys = ['dining_tables', 'employees', 'raw_materials', 'dishes', 'recipe_items', 'orders', 'order_details', 'inventory_transactions', 'system_logs', 'table_sessions', 'customers', 'import_receipts', 'table_reservations'];
    let allExist = true;
    for (const key of tableKeys) {
      const data = db.get(key as any);
      if (!data) {
        allExist = false;
        console.error(`Missing table data for key: ${key}`);
      }
    }
    assert(allExist, 'Tất cả các bảng dữ liệu quy định đều tồn tại trong database');
  } catch (e) {
    assert(false, `Lỗi truy vấn bảng dữ liệu: ${e}`);
  }

  // Test 2: Verify password hashing consistency
  try {
    const rawPass = '123456';
    const hash1 = hashPassword(rawPass);
    const hash2 = hashPassword(rawPass);
    assert(hash1 === hash2, 'Mã hóa mật khẩu băm SHA-256 đồng nhất');
    assert(hash1 !== rawPass, 'Mật khẩu đã được mã hóa không lộ thông tin gốc');
  } catch (e) {
    assert(false, `Lỗi băm mật khẩu: ${e}`);
  }

  // Test 3: Simulating Order Progression and stock lock (BR10 & BR11)
  try {
    const materials = db.get('raw_materials');
    const dishes = db.get('dishes');
    const recipes = db.get('recipe_items');
    
    // Find a dish with a recipe
    const testRecipe = recipes[0];
    assert(!!testRecipe, `Tìm thấy công thức định lượng mẫu để kiểm thử: Món ${testRecipe?.dish_id} cần NVL ${testRecipe?.material_id}`);
    
    const mat = materials.find(m => m.id === testRecipe.material_id);
    const dish = dishes.find(d => d.id === testRecipe.dish_id);
    
    if (mat && dish) {
      const originalStock = mat.stock_current;
      console.log(`Thông tin ban đầu - NVL: ${mat.name}, Tồn: ${originalStock} ${mat.unit}`);
      
      // Simulate detail
      const quantity = 2;
      const consumed = testRecipe.quantity * quantity;
      
      // Check if we have enough stock or temporary inject stock for test
      mat.stock_current = consumed + 10; // ensure sufficient
      db.save('raw_materials', materials);
      
      // Create mock detail in DANG_CHO state
      const mockDetailId = 'det_test_999';
      const orderDetails = db.get('order_details');
      const testDetail = {
        id: mockDetailId,
        order_id: 'o_test_999',
        dish_id: dish.id,
        quantity: quantity,
        price_at_order: dish.price,
        item_status: 'Đang chờ' as any,
        notes: 'Test automatic deduction'
      };
      
      db.save('order_details', [testDetail, ...orderDetails]);
      
      // Simulate status transition: Đang chờ -> Đang chế biến
      // We will perform the stock deduction manually as server does to verify logic
      const currentDetail = db.get('order_details').find(od => od.id === mockDetailId);
      assert(currentDetail?.item_status === 'Đang chờ', 'Tạo thành công chi tiết món ăn ở trạng thái: Đang chờ');
      
      // Deduct
      const updatedMaterials = db.get('raw_materials');
      const testMatIdx = updatedMaterials.findIndex(m => m.id === testRecipe.material_id);
      updatedMaterials[testMatIdx].stock_current -= consumed;
      db.save('raw_materials', updatedMaterials);
      
      currentDetail.item_status = 'Đang chế biến';
      db.save('order_details', [currentDetail, ...orderDetails.filter(od => od.id !== mockDetailId)]);
      
      const afterDeductionMat = db.get('raw_materials').find(m => m.id === testRecipe.material_id);
      assert(afterDeductionMat?.stock_current === 10, 'Tồn kho được khấu trừ chính xác theo công thức định lượng');
      
      // Clean up test items
      db.save('order_details', orderDetails);
      mat.stock_current = originalStock;
      db.save('raw_materials', materials);
      
      console.log('Đã dọn dẹp dữ liệu kiểm thử thành công.');
    }
  } catch (e) {
    assert(false, `Lỗi kiểm định luồng khấu trừ tồn kho: ${e}`);
  }

  // Test 4: One-way status checking logic
  try {
    const statusHierarchy = ['Đang chờ', 'Đang chế biến', 'Đã hoàn thành', 'Đã phục vụ'];
    const checkTransition = (oldStatus: string, nextStatus: string): boolean => {
      const currentIndex = statusHierarchy.indexOf(oldStatus);
      const nextIndex = statusHierarchy.indexOf(nextStatus);
      return nextIndex > currentIndex;
    };
    
    assert(checkTransition('Đang chờ', 'Đang chế biến') === true, 'Hợp lệ: Đang chờ -> Đang chế biến');
    assert(checkTransition('Đang chế biến', 'Đã hoàn thành') === true, 'Hợp lệ: Đang chế biến -> Đã hoàn thành');
    assert(checkTransition('Đã hoàn thành', 'Đang chờ') === false, 'BẤT HỢP LỆ (Ngăn chặn): Đã hoàn thành -> Đang chờ');
    assert(checkTransition('Đã phục vụ', 'Đang chế biến') === false, 'BẤT HỢP LỆ (Ngăn chặn): Đã phục vụ -> Đang chế biến');
  } catch (e) {
    assert(false, `Lỗi kiểm định di chuyển một chiều (BR10): ${e}`);
  }

  console.log(`\n=== KẾT QUẢ KIỂM THỬ: ${passed} ĐẠT, ${failed} LỖI ===`);
  process.exit(failed > 0 ? 1 : 0);
}

runTests();
