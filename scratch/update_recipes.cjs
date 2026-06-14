const fs = require('fs');
const path = require('path');

// 1. Read files
const dbPath = path.join(__dirname, '..', 'database.json');
const db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));

const scrapedPath = path.join(__dirname, 'scraped_details.json');
let scrapedProducts = [];
try {
  scrapedProducts = JSON.parse(fs.readFileSync(scrapedPath, 'utf8'));
} catch (e) {
  console.warn('Warning: Could not read scraped_details.json. Falling back to default combo details.');
}

// Helper: Normalize name for matching
function normalizeName(name) {
  return name.toLowerCase()
    .replace(/\s+/g, '')
    .replace(/[^a-z0-9]/g, '');
}

// 2. Custom mapping for individual dishes
const individualMappings = {
  'm10': ['Dưa chuột'],
  'm11': ['Lạc'],
  'm12': ['Khoai môn'],
  'm13': ['Khoai lang'],
  'm14': ['Khoai tây'],
  'm15': ['Ngô ngọt'],
  'm16': ['Nấm tuyết nhĩ', 'Thịt băm'],
  'm17': ['Tôm sú', 'Mực', 'Nấm hải sản'],
  'm18': ['Nấm hương', 'Mộc nhĩ', 'Bánh đa nem'],
  'm19': ['Nấm đùi gà', 'Rau trộn', 'Xốt Salad'],
  'm20': ['Nấm hương', 'Nấm bào ngư', 'Nấm đùi gà'],
  'm21': ['Khoai môn'],
  'm22': ['Rau muống'],
  'm23': ['Rau cải xanh'],
  'm24': ['Rau cần'],
  'm25': ['Rau cải xoong'],
  'm26': ['Rau cải cúc'],
  'm27': ['Rau cải thảo'],
  'm28': ['Thịt bò Mỹ'],
  'm29': ['Thịt gà ta'],
  'm30': ['Thịt gà ác'],
  'm31': ['Thịt chim câu'],
  'm32': ['Tôm sú'],
  'm33': ['Thịt ếch'],
  'm34': ['Thịt cá hồi'],
  'm35': ['Nấm hương tươi'],
  'm36': ['Nấm yến'],
  'm37': ['Nấm tiên'],
  'm38': ['Nấm hải sản'],
  'm39': ['Nấm kim châm trắng'],
  'm40': ['Nấm tuyết nhĩ'],
  'm41': ['Nấm thủy tinh nâu'],
  'm42': ['Nấm thủy tinh trắng'],
  'm43': ['Nước suối chai']
};

// Default combo ingredients backup if scraped data has issues
const defaultCombos = {
  'm01': ['Canh đặc biệt', 'Salad nấm', 'Thịt chim câu', 'Thịt bò ba chỉ', 'Thịt tôm sú', 'Nấm vuốt hổ đen', 'Nấm đông trùng hạ thảo', 'Set 7 nấm thiên nhiên', 'Đậu phụ', 'Khoai môn', 'Rau tổng hợp', 'Mỳ Gia Khánh'],
  'm02': ['Canh đặc biệt', 'Khoai lang chiên', 'Thịt gà ác', 'Thịt bò', 'Thịt cá chình', 'Nấm đông trùng', 'Nấm gan bò', 'Set 6 nấm thiên nhiên', 'Đậu phụ', 'Rau tổng hợp', 'Mỳ Gia Khánh'],
  'm03': ['Canh đặc biệt', 'Ngô chiên', 'Thịt gà ta', 'Thịt tôm sú', 'Thịt bò ba chỉ', 'Nấm bụng dê', 'Nấm đông trùng hạ thảo', 'Set 5 nấm thiên nhiên', 'Đậu phụ', 'Khoai môn', 'Rau tổng hợp', 'Mỳ Gia Khánh'],
  'm04': ['Canh đặc biệt', 'Salad nấm', 'Thịt tôm sú', 'Thịt bò ba chỉ', 'Set 7 nấm thiên nhiên', 'Đậu phụ', 'Phù trúc', 'Rau tổng hợp', 'Mỳ Gia Khánh'],
  'm05': ['Canh đặc biệt', 'Thịt gà ta', 'Thịt bò ba chỉ', 'Set 6 nấm thiên nhiên', 'Đậu phụ', 'Cải xanh', 'Mỳ Gia Khánh'],
  'm06': ['Canh đặc biệt', 'Thịt chim câu', 'Thịt bò ba chỉ', 'Nấm vuốt hổ đen', 'Nấm tiên', 'Nấm thủy tinh nâu', 'Nấm kim châm', 'Đậu phụ', 'Rau theo mùa', 'Mỳ tôm'],
  'm07': ['Canh đặc biệt', 'Thịt gà ác', 'Thịt bò ba chỉ', 'Thịt tôm', 'Nấm đông trùng hạ thảo', 'Set 6 nấm thiên nhiên', 'Đậu phụ', 'Rau theo mùa', 'Mỳ Gia Khánh'],
  'm08': ['Canh đặc biệt', 'Khoai chiên', 'Thịt gà ác', 'Thịt bò ba chỉ', 'Set 6 nấm thiên nhiên', 'Đậu phụ', 'Phù trúc', 'Rau tổng hợp', 'Mỳ Gia Khánh'],
  'm09': ['Canh đặc biệt', 'Thịt chim câu', 'Thịt bò ba chỉ', 'Ngô chiên', 'Set 5 nấm thiên nhiên', 'Đậu phụ', 'Phù trúc', 'Rau tổng hợp', 'Mỳ Gia Khánh']
};

// 3. Build mappings for each dish
const finalDishIngredients = {};

db.dishes.forEach((dish) => {
  const dishId = dish.id;
  const isCombo = dishId.startsWith('m0') && parseInt(dishId.slice(1, 3)) <= 9;
  
  if (isCombo) {
    // Attempt matching with scraped products
    const normalizedDishName = normalizeName(dish.name);
    const matched = scrapedProducts.find(p => normalizeName(p.name) === normalizedDishName);
    
    if (matched && matched.ingredients) {
      // Split ingredients list
      const items = matched.ingredients.split(',').map(i => i.trim()).filter(i => i.length > 0);
      if (items.length > 0) {
        finalDishIngredients[dishId] = items;
        console.log(`Matched combo [${dish.name}] -> Scraped ingredients:`, items);
        return;
      }
    }
    
    // Fallback
    finalDishIngredients[dishId] = defaultCombos[dishId] || [];
    console.log(`Using default combo ingredients for [${dish.name}]:`, finalDishIngredients[dishId]);
  } else {
    // Individual dishes
    finalDishIngredients[dishId] = individualMappings[dishId] || [dish.name];
  }
});

// 4. Rebuild raw_materials
const existingMaterialsMap = new Map();
db.raw_materials.forEach((m) => {
  existingMaterialsMap.set(m.name.toLowerCase().trim(), m);
});

const newRawMaterials = [];
const materialIdMap = new Map(); // Name -> ID

// We want to reuse existing materials first
let nextMaterialNum = 11; // We have nvl01 to nvl10 currently

function getOrCreateMaterial(name) {
  const normalized = name.toLowerCase().trim();
  
  // 1. If exists in db
  if (existingMaterialsMap.has(normalized)) {
    const mat = existingMaterialsMap.get(normalized);
    materialIdMap.set(normalized, mat.id);
    if (!newRawMaterials.some(m => m.id === mat.id)) {
      newRawMaterials.push(mat);
    }
    return mat.id;
  }
  
  // 2. If already added in this run
  if (materialIdMap.has(normalized)) {
    return materialIdMap.get(normalized);
  }
  
  // 3. Create new material
  const id = `nvl${String(nextMaterialNum).padStart(2, '0')}`;
  nextMaterialNum++;
  
  // Guess unit based on name
  let unit = 'g';
  if (normalized.includes('canh') || normalized.includes('nước') || normalized.includes('bia') || normalized.includes('rượu')) {
    unit = 'ml';
  } else if (normalized.includes('mỳ') || normalized.includes('nem') || normalized.includes('chai') || normalized.includes('lon') || normalized.includes('cái') || normalized.includes('chiếc')) {
    unit = 'cái';
  }
  
  const newMat = {
    id,
    name: name,
    unit,
    stock_current: 5000,
    stock_min: 1000,
    stock_max: 20000
  };
  
  newRawMaterials.push(newMat);
  materialIdMap.set(normalized, id);
  return id;
}

// 5. Build recipe_items
const newRecipeItems = [];

db.dishes.forEach((dish) => {
  const dishId = dish.id;
  const ingredients = finalDishIngredients[dishId] || [];
  
  ingredients.forEach((ing) => {
    const matId = getOrCreateMaterial(ing);
    
    // Guess default quantity
    let quantity = 100;
    const normalizedIng = ing.toLowerCase();
    
    if (normalizedIng.includes('nước') || normalizedIng.includes('canh')) {
      quantity = 1500;
    } else if (normalizedIng.includes('salad') || normalizedIng.includes('rau') || normalizedIng.includes('set')) {
      quantity = 250;
    } else if (normalizedIng.includes('đậu') || normalizedIng.includes('khoai')) {
      quantity = 150;
    } else if (normalizedIng.includes('mỳ') || normalizedIng.includes('nem') || normalizedIng.includes('lon') || normalizedIng.includes('chai') || normalizedIng.includes('cái')) {
      quantity = 1;
    }
    
    const mat = newRawMaterials.find(m => m.id === matId);
    
    newRecipeItems.push({
      dish_id: dishId,
      material_id: matId,
      quantity,
      unit: mat ? mat.unit : 'g'
    });
  });
});

// 6. Write back to database.json
db.raw_materials = newRawMaterials;
db.recipe_items = newRecipeItems;

fs.writeFileSync(dbPath, JSON.stringify(db, null, 2), 'utf8');

console.log(`\nRebuild Completed Successfully:`);
console.log(`- Updated ${db.raw_materials.length} Raw Materials (nvl01 to nvl${nextMaterialNum-1})`);
console.log(`- Updated ${db.recipe_items.length} Recipe Items`);
