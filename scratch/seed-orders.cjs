const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, '..', 'database.json');
if (!fs.existsSync(dbPath)) {
  console.error('Không tìm thấy file database.json');
  process.exit(1);
}

const db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));

const dishById = new Map(db.dishes.map(dish => [dish.id, dish]));
const priceOf = dishId => dishById.get(dishId)?.price || 0;

const comboProfiles = [
  {
    combo: 'm02', // Combo 6 khách - Gà ác
    guests: 6,
    weight: 14,
    addOns: [
      { id: 'm35', min: 1, max: 3, chance: 0.92 }, // Nấm hương tươi
      { id: 'm39', min: 1, max: 3, chance: 0.78 }, // Nấm kim châm trắng
      { id: 'm30', min: 1, max: 2, chance: 0.52 }, // Gà ác gọi thêm
      { id: 'm16', min: 1, max: 2, chance: 0.36 }, // Súp nấm trắng
      { id: 'm43', min: 3, max: 6, chance: 0.72 }, // Nước suối
    ],
  },
  {
    combo: 'm03', // Combo 6 khách - Gà ta
    guests: 6,
    weight: 12,
    addOns: [
      { id: 'm11', min: 1, max: 3, chance: 0.88 }, // Lạc
      { id: 'm29', min: 1, max: 2, chance: 0.58 }, // Gà ta gọi thêm
      { id: 'm22', min: 1, max: 3, chance: 0.68 }, // Rau muống
      { id: 'm24', min: 1, max: 2, chance: 0.46 }, // Rau cần
      { id: 'm43', min: 3, max: 6, chance: 0.68 },
    ],
  },
  {
    combo: 'm01', // Combo 6 khách - Chim câu
    guests: 6,
    weight: 10,
    addOns: [
      { id: 'm31', min: 1, max: 2, chance: 0.72 }, // Chim câu
      { id: 'm40', min: 1, max: 2, chance: 0.64 }, // Nấm tuyết nhĩ
      { id: 'm35', min: 1, max: 2, chance: 0.56 },
      { id: 'm18', min: 4, max: 8, chance: 0.42 }, // Nem nấm
      { id: 'm43', min: 3, max: 6, chance: 0.65 },
    ],
  },
  {
    combo: 'm04', // Combo 4 khách - Tôm sú
    guests: 4,
    weight: 11,
    addOns: [
      { id: 'm32', min: 1, max: 2, chance: 0.76 }, // Tôm sú
      { id: 'm38', min: 1, max: 3, chance: 0.70 }, // Nấm hải sản
      { id: 'm17', min: 1, max: 2, chance: 0.45 }, // Súp nấm hải sản
      { id: 'm19', min: 1, max: 2, chance: 0.38 }, // Salad nấm
      { id: 'm43', min: 2, max: 5, chance: 0.64 },
    ],
  },
  {
    combo: 'm08', // Combo 4 khách - Gà ác
    guests: 4,
    weight: 9,
    addOns: [
      { id: 'm35', min: 1, max: 2, chance: 0.86 },
      { id: 'm39', min: 1, max: 2, chance: 0.68 },
      { id: 'm30', min: 1, max: 1, chance: 0.44 },
      { id: 'm16', min: 1, max: 1, chance: 0.34 },
      { id: 'm43', min: 2, max: 4, chance: 0.62 },
    ],
  },
  {
    combo: 'm05', // Combo Tri kỉ
    guests: 2,
    weight: 7,
    addOns: [
      { id: 'm18', min: 2, max: 4, chance: 0.72 },
      { id: 'm20', min: 1, max: 1, chance: 0.55 }, // Nấm xào tổng hợp
      { id: 'm12', min: 1, max: 1, chance: 0.46 }, // Khoai môn chiên
      { id: 'm43', min: 1, max: 3, chance: 0.58 },
    ],
  },
  {
    combo: 'm06', // Combo Uyên Ương
    guests: 2,
    weight: 6,
    addOns: [
      { id: 'm19', min: 1, max: 1, chance: 0.68 },
      { id: 'm35', min: 1, max: 2, chance: 0.56 },
      { id: 'm28', min: 1, max: 1, chance: 0.38 },
      { id: 'm43', min: 1, max: 3, chance: 0.56 },
    ],
  },
  {
    combo: 'm07', // Combo Đặc biệt
    guests: 2,
    weight: 5,
    addOns: [
      { id: 'm28', min: 1, max: 2, chance: 0.62 },
      { id: 'm32', min: 1, max: 1, chance: 0.48 },
      { id: 'm38', min: 1, max: 2, chance: 0.58 },
      { id: 'm43', min: 1, max: 3, chance: 0.58 },
    ],
  },
];

let seed = 20260615;
function random() {
  seed = (seed * 1664525 + 1013904223) % 4294967296;
  return seed / 4294967296;
}

function randomInt(min, max) {
  return min + Math.floor(random() * (max - min + 1));
}

function weightedProfile() {
  const total = comboProfiles.reduce((sum, item) => sum + item.weight, 0);
  let pick = random() * total;
  for (const profile of comboProfiles) {
    pick -= profile.weight;
    if (pick <= 0) return profile;
  }
  return comboProfiles[0];
}

function pushItem(items, dishId, quantity) {
  if (!dishById.has(dishId) || quantity <= 0) return;
  const current = items.get(dishId) || 0;
  items.set(dishId, current + quantity);
}

db.table_sessions = db.table_sessions.filter(session => session.status === 'active');
const activeSessionIds = new Set(db.table_sessions.map(session => session.id));
db.orders = db.orders.filter(order => activeSessionIds.has(order.session_id));
const activeOrderIds = new Set(db.orders.map(order => order.id));
db.order_details = db.order_details.filter(detail => activeOrderIds.has(detail.order_id));

const now = Date.now();
const totalSessions = 64;
let totalGuests = 0;

for (let i = 1; i <= totalSessions; i += 1) {
  const profile = weightedProfile();
  const sessionId = `s_hist_${String(i).padStart(3, '0')}`;
  const orderId = `o_hist_${String(i).padStart(3, '0')}`;
  const ageMs = random() * 6.8 * 24 * 60 * 60 * 1000;
  const timestamp = new Date(now - ageMs).toISOString();
  const guests = Math.max(2, profile.guests + randomInt(-1, 2));
  const items = new Map();

  totalGuests += guests;
  pushItem(items, profile.combo, 1);

  profile.addOns.forEach(addOn => {
    if (random() <= addOn.chance) {
      pushItem(items, addOn.id, randomInt(addOn.min, addOn.max));
    }
  });

  // Common side orders appear across many baskets, but still stay as non-combo dishes.
  if (random() < 0.30) pushItem(items, 'm10', randomInt(1, 2)); // Dưa chuột chẻ
  if (random() < 0.28) pushItem(items, 'm13', 1); // Khoai lang chiên
  if (random() < 0.22) pushItem(items, 'm21', randomInt(1, 2)); // Khoai môn nhúng
  if (random() < 0.18) pushItem(items, 'm36', randomInt(1, 2)); // Nấm yến

  let orderTotal = 0;
  Array.from(items.entries()).forEach(([dishId, quantity]) => {
    const price = priceOf(dishId);
    orderTotal += price * quantity;
    db.order_details.push({
      id: `od_hist_${String(i).padStart(3, '0')}_${dishId}`,
      order_id: orderId,
      dish_id: dishId,
      quantity,
      price_at_time: price,
      item_status: 'Đã phục vụ',
      notes: '',
      ordered_at: timestamp,
    });
  });

  db.table_sessions.push({
    id: sessionId,
    table_id: `B${String(randomInt(1, 56)).padStart(2, '0')}`,
    customer_id: null,
    start_time: timestamp,
    end_time: timestamp,
    share_code: `H${String(i).padStart(3, '0')}`,
    status: 'completed',
    guests_count: guests,
  });

  db.orders.push({
    id: orderId,
    session_id: sessionId,
    created_at: timestamp,
    service_status: 'Đã phục vụ',
    total_amount: orderTotal,
  });
}

const comboIds = new Set(comboProfiles.map(profile => profile.combo));
const comboPairCount = db.order_details.filter(detail => comboIds.has(detail.dish_id)).length;

fs.writeFileSync(dbPath, JSON.stringify(db, null, 2), 'utf8');
console.log(`Đã tạo ${totalSessions} hóa đơn lịch sử cho ${totalGuests} khách.`);
console.log(`Tổng dòng combo chính: ${comboPairCount}. Các món đi kèm đều là món phụ/topping/đồ uống, tránh combo đi với combo.`);
