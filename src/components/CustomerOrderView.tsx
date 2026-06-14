/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useRestaurantStore } from '../data/store';
import { DishStatus, OrderItemStatus } from '../types';
import { Phone, Users, Plus, Minus, ShoppingCart, Check, Clock, ChevronRight, ArrowLeft, Send, Heart, BookOpen, Trash2, Search, X, Home, Sparkles, MessageCircle, LogOut } from 'lucide-react';

// Circular Official Brand Logo matching the uploaded image perfectly
const BrandLogo = ({ size = 120 }: { size?: number }) => {
  return (
    <div className="flex flex-col items-center justify-center text-center select-none">
      <svg
        width={size}
        height={size}
        viewBox="0 0 500 500"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="drop-shadow-md rounded-full overflow-hidden"
      >
        {/* Red circular background */}
        <circle cx="250" cy="235" r="235" fill="#EE3124" />

        {/* Elegant Gold traditional corners outside inner border */}
        <circle cx="250" cy="235" r="190" stroke="#FFE600" strokeWidth="5" />
        <circle cx="250" cy="235" r="178" stroke="#FFE600" strokeWidth="2" strokeDasharray="6 5" />

        {/* Traditional profile facing right */}
        <g transform="translate(145, 95) scale(1.05)">
          {/* Emperor hat */}
          <path d="M105 10C105 10 95 15 80 20C75 10 50 15 45 35C40 50 60 65 75 65C85 65 95 62 105 58C110 58 115 50 120 40C125 30 115 15 105 10Z" fill="#FFE600" />
          <path d="M100 12L85 -18L103 -13L112 8L100 12Z" fill="#FFE600" />
          <line x1="100" y1="12" x2="85" y2="-18" stroke="#EE3124" strokeWidth="2.5" />
          <path d="M115 25C130 20 145 35 140 50C135 60 120 62 112 58" fill="#FFE600" />

          {/* Head/Face profile */}
          <path d="M80 62C75 62 70 65 68 70C65 75 65 80 67 85C69 90 73 95 73 98C68 102 62 104 60 108C58 112 60 118 64 122C70 125 78 122 83 120C85 125 90 130 95 132C100 134 105 132 108 130" fill="#FFE600" />
          <path d="M103 58C103 62 110 68 110 72C110 75 105 78 108 82C110 85 116 87 114 91C112 94 106 94 104 98" stroke="#EE3124" strokeWidth="2.5" fill="none" />
          
          <ellipse cx="94" cy="74" rx="6" ry="2.5" transform="rotate(-15 94 74)" fill="#EE3124" />
          <path d="M85 68C90 66 100 68 103 72" stroke="#EE3124" strokeWidth="3" strokeLinecap="round" fill="none" />

          {/* Mustache */}
          <path d="M102 85C110 85 115 88 118 94C115 96 110 94 106 91C104 93 104 96 102 98C100 95 101 90 102 85Z" fill="#EE3124" />
          <path d="M107 88C114 88 124 92 126 99C121 101 116 97 112 93" stroke="#EE3124" strokeWidth="2" strokeLinecap="round" fill="none" />

          {/* Beard */}
          <path d="M96 100C96 100 98 115 104 125C108 130 112 120 110 112C105 108 100 102 96 100Z" fill="#EE3124" />
          <path d="M102 98C102 108 108 118 112 122" stroke="#EE3124" strokeWidth="2" />
          <path d="M72 65C62 75 60 90 62 105C64 110 68 110 68 105C66 95 70 80 76 70L72 65Z" fill="#EE3124" />

          {/* Neck and collar */}
          <path d="M80 110C83 115 86 122 88 130H100C101 122 102 115 104 110" fill="#FFE600" />
          
          {/* Armor robe */}
          <path d="M42 125C30 135 15 150 10 170H140C130 150 115 135 103 125C98 128 88 128 83 125C78 128 68 128 63 125C58 128 48 128 42 125Z" fill="#FFE600" />
          <path d="M45 125L83 170" stroke="#EE3124" strokeWidth="3.5" />
          <path d="M100 125L60 170" stroke="#EE3124" strokeWidth="3.5" fill="none" />
          <path d="M10 170C10 170 15 195 28 205C40 195 50 170 50 170" fill="#FFE600" />
          <path d="M85 170C85 170 95 195 107 205C120 195 125 170 125 170" fill="#FFE600" />
        </g>

        {/* Master typography brand name */}
        <text
          x="250"
          y="350"
          textAnchor="middle"
          fill="#FFE600"
          fontFamily="'Be Vietnam Pro', system-ui, sans-serif"
          fontWeight="900"
          fontSize="48"
          letterSpacing="1"
        >
          GIA KHÁNH
        </text>

        {/* Sub-label banner */}
        <text
          x="250"
          y="388"
          textAnchor="middle"
          fill="#FFE600"
          fontFamily="'Inter', system-ui, sans-serif"
          fontWeight="700"
          fontSize="18"
          letterSpacing="4"
        >
          MUSHROOM HOTPOT
        </text>

        <line x1="120" y1="410" x2="380" y2="410" stroke="#FFE600" strokeWidth="3" />

        {/* Website Domain */}
        <text
          x="250"
          y="435"
          textAnchor="middle"
          fill="#FFE600"
          fontFamily="'JetBrains Mono', monospace"
          fontWeight="500"
          fontSize="15"
          letterSpacing="0.5"
        >
          www.launamgiakhanh.vn
        </text>
      </svg>
    </div>
  );
};

export default function CustomerOrderView() {
  const {
    tables,
    dishes,
    categories,
    startTableSession,
    placeCustomerOrder,
    cancelOrderItem,
    sessions,
    orders,
    orderDetails,
    customers,
    recipes,
    materials
  } = useRestaurantStore();

  const formatPrice = (price: any) => {
    const num = typeof price === 'string' ? parseFloat(price) : price;
    return Math.round(num || 0).toLocaleString('vi-VN') + 'đ';
  };

  const removeDiacritics = (str: string) => {
    return str
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/đ/g, 'd')
      .replace(/Đ/g, 'D');
  };

  // QR Session states
  const [phoneNumber, setPhoneNumber] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [tableId, setTableId] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    const hashParams = new URLSearchParams(window.location.hash.split('?')[1] || '');
    return params.get('table') || params.get('tableId') || hashParams.get('table') || hashParams.get('tableId') || 'B04';
  });
  const [enteredCode, setEnteredCode] = useState('');
  const [activeStep, setActiveStep] = useState<'phone' | 'join_code' | 'menu' | 'dish_detail' | 'cart' | 'success' | 'tracking'>('phone');
  
  const [currentSessionCode, setCurrentSessionCode] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Cart Local state
  interface CartItem {
    dishId: string;
    quantity: number;
    notes: string;
  }
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedDishId, setSelectedDishId] = useState<string | null>(null);
  const [isAssistantOpen, setIsAssistantOpen] = useState(false);
  const [assistantMode, setAssistantMode] = useState<'home' | 'guests' | 'taste' | 'budget' | 'ordered' | 'popular' | 'combo'>('home');
  const [assistantFilter, setAssistantFilter] = useState<string>('');

  // Detail View configurations
  const [detailQuantity, setDetailQuantity] = useState(1);
  const [dishNotes, setDishNotes] = useState('');

  // Scroll to top handler
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLeaveTable = () => {
    if (window.confirm('Bạn có chắc chắn muốn rời bàn? Giỏ hàng hiện tại chưa đặt sẽ bị xóa.')) {
      setPhoneNumber('');
      setCart([]);
      setActiveStep('phone');
      setErrorMessage('');
    }
  };

  // Submit Phone / Check in as Host
  const handlePhoneSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check if table has an active session
    const activeSess = sessions.find(s => s.Ma_ban === tableId && s.Trang_thai === 'active');
    if (!activeSess) {
      setErrorMessage('Bàn chưa được kích hoạt. Vui lòng liên hệ nhân viên.');
      return;
    }

    const trimmedEntered = phoneNumber.trim();
    if (trimmedEntered.length !== 10) {
      setErrorMessage('Số điện thoại phải gồm 10 chữ số.');
      return;
    }

    const savedPhone = (activeSess.customer_phone || '').trim();
    if (savedPhone && trimmedEntered !== savedPhone) {
      setErrorMessage('Số điện thoại không đúng với số điện thoại đăng ký cho phiên bàn này.');
      return;
    }

    setTableId(activeSess.Ma_ban);
    setCurrentSessionCode(activeSess.Ma_phien_code);
    setActiveStep('menu');
    setErrorMessage('');
  };

  // Join Existing Shared Session
  const handleJoinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!enteredCode) return;

    const foundSess = sessions.find(s => s.Ma_phien_code.toUpperCase() === enteredCode.toUpperCase() && s.Trang_thai === 'active');
    if (foundSess) {
      setCurrentSessionCode(foundSess.Ma_phien_code);
      setTableId(foundSess.Ma_ban);
      setActiveStep('menu');
      setErrorMessage('');
    } else {
      setErrorMessage('Mã phiên không chính xác hoặc đã hết hiệu lực.');
    }
  };

  // Cart operations
  const addToCart = (dishId: string, quantity: number, notes: string) => {
    setCart(prev => {
      const existing = prev.find(item => item.dishId === dishId);
      if (existing) {
        return prev.map(item =>
          item.dishId === dishId
            ? { ...item, quantity: item.quantity + quantity, notes: notes || item.notes }
            : item
        );
      }
      return [...prev, { dishId, quantity, notes }];
    });
    setSelectedDishId(null);
    setDishNotes('');
    setDetailQuantity(1);
    setActiveStep('menu');
  };

  const updateCartQty = (dishId: string, delta: number) => {
    setCart(prev =>
      prev
        .map(item => (item.dishId === dishId ? { ...item, quantity: item.quantity + delta } : item))
        .filter(item => item.quantity > 0)
    );
  };

  const getCartTotal = () => {
    return cart.reduce((sum, item) => {
      const dish = dishes.find(d => d.Ma_mon === item.dishId);
      return sum + (dish ? dish.Don_gia * item.quantity : 0);
    }, 0);
  };

  // Confirm order
  const handleConfirmOrder = () => {
    if (cart.length === 0) return;
    
    placeCustomerOrder(tableId, cart)
      .then(() => {
        setCart([]);
        setActiveStep('success');
      })
      .catch((err: any) => {
        alert(err.message || 'Đặt món không thành công.');
      });
  };

  const handleCancelOrderItem = async (detailId: string) => {
    const confirmed = window.confirm('Bạn muốn hủy món này khi bếp chưa tiếp nhận?');
    if (!confirmed) return;

    const result = await cancelOrderItem(detailId);
    if (!result.success) {
      alert(result.error || 'Không thể hủy món. Vui lòng liên hệ nhân viên để được hỗ trợ.');
    }
  };

  const selectedDish = dishes.find(d => d.Ma_mon === selectedDishId);
  
  // Filter categories to show and sort them by Thu_tu_hien_thi ascending
  const activeTabsCategories = categories
    .filter(c => c.Trang_thai === 'Hiển thị')
    .sort((a, b) => a.Thu_tu_hien_thi - b.Thu_tu_hien_thi);
  const [selectedCatId, setSelectedCatId] = useState('all');

  const activeCategoryDishes = (catId: string) => {
    let list = dishes;
    if (catId === 'all') {
      const activeCatIds = activeTabsCategories.map(c => c.Ma_danh_muc);
      list = dishes.filter(d => activeCatIds.includes(d.Ma_danh_muc));
    } else {
      list = dishes.filter(d => d.Ma_danh_muc === catId);
    }

    if (searchQuery.trim()) {
      const query = removeDiacritics(searchQuery.trim()).toLowerCase();
      list = list.filter(d => {
        const nameNormalized = removeDiacritics(d.Ten_mon).toLowerCase();
        const descNormalized = d.Mo_ta ? removeDiacritics(d.Mo_ta).toLowerCase() : '';
        return nameNormalized.includes(query) || descNormalized.includes(query);
      });
    }
    return list;
  };

  // Load placed orders for tracking
  const placedSession = sessions.find(s => s.Ma_ban === tableId && s.Trang_thai === 'active');
  const placedOrdersDetails = orderDetails.filter(od => {
    const parent = orders.find(o => o.Ma_hd_dat_mon === od.Ma_hd_dat_mon);
    return parent && parent.Ma_phien === placedSession?.Ma_phien;
  });

  // Get ingredients formatted from recipes & materials
  const getDishIngredients = (dishId: string) => {
    const dishRecipes = recipes.filter(r => r.Ma_mon === dishId);
    if (dishRecipes.length === 0) return [];
    return dishRecipes.map(r => {
      const mat = materials.find(m => m.Ma_nvl === r.Ma_nvl);
      return mat ? mat.Ten_nvl : '';
    }).filter(Boolean);
  };

  type AssistantSuggestion = {
    id: string;
    title: string;
    description: string;
    price: number;
    dishIds: string[];
    note?: string;
  };

  const availableDishes = dishes.filter(d => d.Trang_thai === DishStatus.CON_PHUC_VU);
  const guestCount = placedSession?.So_khach || 4;
  const cartDishIds = cart.map(item => item.dishId);
  const orderedDishIds = placedOrdersDetails
    .filter(item => item.Trang_thai_mon !== OrderItemStatus.DA_HUY)
    .map(item => item.Ma_mon);
  const selectedDishIds = [...cartDishIds, ...orderedDishIds];

  const findDishesByKeywords = (keywords: string[], limit = 3, excludeSelected = false) => {
    const normalizedKeywords = keywords.map(k => removeDiacritics(k).toLowerCase());
    const found = availableDishes.filter(dish => {
      if (excludeSelected && selectedDishIds.includes(dish.Ma_mon)) return false;
      const haystack = removeDiacritics(`${dish.Ten_mon} ${dish.Mo_ta || ''}`).toLowerCase();
      return normalizedKeywords.some(keyword => haystack.includes(keyword));
    });
    const fallback = availableDishes.filter(dish => !excludeSelected || !selectedDishIds.includes(dish.Ma_mon));
    return (found.length ? found : fallback).slice(0, limit);
  };

  const toSuggestion = (dishIds: string[], title: string, description: string, note?: string): AssistantSuggestion => {
    const comboDishes = dishIds
      .map(id => availableDishes.find(d => d.Ma_mon === id))
      .filter(Boolean) as typeof availableDishes;
    return {
      id: `${title}_${dishIds.join('_')}`,
      title,
      description,
      price: comboDishes.reduce((sum, dish) => sum + dish.Don_gia, 0),
      dishIds,
      note
    };
  };

  const buildDishSuggestions = (keywordGroups: string[][], note?: string) => {
    return keywordGroups.flatMap(keywords =>
      findDishesByKeywords(keywords, 1, true).map(dish =>
        toSuggestion([dish.Ma_mon], dish.Ten_mon, dish.Mo_ta || 'Món phù hợp để bổ sung cho bàn lẩu nấm.', note)
      )
    ).slice(0, 4);
  };

  const buildComboSuggestion = (size: 'small' | 'medium' | 'group' | 'large', budget = 'Vừa đủ') => {
    const baseCount = size === 'small' ? 2 : size === 'medium' ? 3 : size === 'group' ? 4 : 5;
    const pools = [
      findDishesByKeywords(['lau', 'lẩu'], 1),
      findDishesByKeywords(['nam', 'nấm'], 2),
      findDishesByKeywords(['bo', 'ga', 'hai san', 'hải sản', 'topping'], 2),
      findDishesByKeywords(['nuoc', 'trà', 'lavie', 'do uong', 'đồ uống'], 1)
    ].flat();
    const unique = Array.from(new Map(pools.map(d => [d.Ma_mon, d])).values()).slice(0, baseCount);
    return toSuggestion(
      unique.map(d => d.Ma_mon),
      size === 'large' ? 'Combo lớn cho bàn đông' : size === 'group' ? 'Combo nhóm Gia Khánh' : size === 'medium' ? 'Combo 4 người' : 'Combo nhỏ',
      `${budget}. Gợi ý cân bằng giữa lẩu, nấm/topping và đồ uống.`,
      'Các món sẽ được thêm vào giỏ tạm, chưa gửi xuống bếp.'
    );
  };

  const assistantOptions = {
    home: ['Theo số lượng khách', 'Theo khẩu vị', 'Theo ngân sách', 'Theo món đã gọi', 'Món bán chạy', 'Combo gợi ý'],
    taste: ['Thanh đạm', 'Cay nhẹ', 'Đậm đà', 'Ăn chay', 'Có trẻ em'],
    budget: ['Tiết kiệm', 'Vừa đủ', 'Đầy đủ', 'Cao cấp']
  };

  const getAssistantSuggestions = (): AssistantSuggestion[] => {
    if (assistantMode === 'guests') {
      if (guestCount <= 2) return [buildComboSuggestion('small')];
      if (guestCount <= 4) return [buildComboSuggestion('medium')];
      if (guestCount <= 6) return [buildComboSuggestion('group')];
      return [buildComboSuggestion('large', 'Nên gọi nhân viên hỗ trợ sắp bàn và khẩu phần')];
    }
    if (assistantMode === 'taste') {
      const map: Record<string, string[][]> = {
        'Thanh đạm': [['nam', 'nấm'], ['rau'], ['lau', 'lẩu']],
        'Cay nhẹ': [['cay'], ['lau', 'lẩu'], ['bo', 'bò']],
        'Đậm đà': [['bo', 'bò'], ['ga', 'gà'], ['hai san', 'hải sản']],
        'Ăn chay': [['nam', 'nấm'], ['rau'], ['tau hu', 'đậu', 'chay']],
        'Có trẻ em': [['nuoc', 'nước'], ['ga', 'gà'], ['nam', 'nấm']]
      };
      return buildDishSuggestions(map[assistantFilter] || map['Thanh đạm'], assistantFilter);
    }
    if (assistantMode === 'budget') {
      const sorted = [...availableDishes].sort((a, b) =>
        assistantFilter === 'Cao cấp' ? b.Don_gia - a.Don_gia : a.Don_gia - b.Don_gia
      );
      const count = assistantFilter === 'Tiết kiệm' ? 2 : assistantFilter === 'Cao cấp' ? 4 : 3;
      return sorted.slice(0, count).map(d => toSuggestion([d.Ma_mon], d.Ten_mon, d.Mo_ta || `${assistantFilter} cho bàn lẩu nấm.`, assistantFilter));
    }
    if (assistantMode === 'ordered') {
      const selectedText = selectedDishIds
        .map(id => availableDishes.find(d => d.Ma_mon === id) || dishes.find(d => d.Ma_mon === id))
        .filter(Boolean)
        .map(d => removeDiacritics(`${d!.Ten_mon} ${d!.Mo_ta || ''}`).toLowerCase())
        .join(' ');
      const groups: string[][] = [];
      if (!selectedText.includes('rau')) groups.push(['rau']);
      if (!selectedText.includes('nam')) groups.push(['nam', 'nấm']);
      if (!selectedText.includes('bo') && !selectedText.includes('ga') && !selectedText.includes('hai san')) groups.push(['bo', 'gà', 'hải sản', 'topping']);
      if (!selectedText.includes('nuoc') && !selectedText.includes('lavie') && !selectedText.includes('tra')) groups.push(['nuoc', 'nước', 'lavie', 'trà']);
      return buildDishSuggestions(groups.length ? groups : [['nam', 'nấm'], ['nuoc', 'nước']], 'Bổ sung theo món đã gọi');
    }
    if (assistantMode === 'popular') {
      return availableDishes
        .filter(d => /lẩu|nấm|bò|hải sản|gà/i.test(d.Ten_mon))
        .concat(availableDishes)
        .filter((dish, index, arr) => arr.findIndex(d => d.Ma_mon === dish.Ma_mon) === index)
        .slice(0, 4)
        .map(d => toSuggestion([d.Ma_mon], d.Ten_mon, d.Mo_ta || 'Món được nhiều bàn lựa chọn tại Gia Khánh.', 'Món bán chạy'));
    }
    if (assistantMode === 'combo') {
      if (guestCount <= 2) return [buildComboSuggestion('small', assistantFilter || 'Vừa đủ')];
      if (guestCount <= 4) return [buildComboSuggestion('medium', assistantFilter || 'Vừa đủ')];
      if (guestCount <= 6) return [buildComboSuggestion('group', assistantFilter || 'Vừa đủ')];
      return [buildComboSuggestion('large', assistantFilter || 'Cao cấp')];
    }
    return [];
  };

  const handleAssistantChoice = (label: string) => {
    if (label === 'Theo số lượng khách') {
      setAssistantMode('guests');
      setAssistantFilter('');
    } else if (label === 'Theo khẩu vị') {
      setAssistantMode('taste');
      setAssistantFilter('');
    } else if (label === 'Theo ngân sách') {
      setAssistantMode('budget');
      setAssistantFilter('');
    } else if (label === 'Theo món đã gọi') {
      setAssistantMode('ordered');
      setAssistantFilter('');
    } else if (label === 'Món bán chạy') {
      setAssistantMode('popular');
      setAssistantFilter('');
    } else if (label === 'Combo gợi ý') {
      setAssistantMode('combo');
      setAssistantFilter('');
    }
  };

  const addSuggestionToCart = (suggestion: AssistantSuggestion) => {
    suggestion.dishIds.forEach(dishId => addToCart(dishId, 1, suggestion.note || 'Gợi ý từ trợ lý món'));
    setIsAssistantOpen(false);
    setActiveStep('cart');
  };

  const viewSuggestionDetail = (suggestion: AssistantSuggestion) => {
    const firstDishId = suggestion.dishIds[0];
    if (!firstDishId) return;
    setSelectedDishId(firstDishId);
    setDetailQuantity(1);
    setDishNotes(suggestion.note || '');
    setIsAssistantOpen(false);
    setActiveStep('dish_detail');
  };

  // Keep selected category correct on start
  useEffect(() => {
    if (selectedCatId !== 'all' && activeTabsCategories.length > 0 && !activeTabsCategories.some(c => c.Ma_danh_muc === selectedCatId)) {
      setSelectedCatId('all');
    }
  }, [categories]);

  // Floating widgets JSX
  const renderFloatingWidgets = () => {
    if (activeStep === 'phone' || activeStep === 'join_code') return null;

    const totalQty = cart.reduce((sum, item) => sum + item.quantity, 0);

    return (
      <>
        {/* Hotline Widget (Bottom Left) */}
        <div className="fixed bottom-20 left-4 z-40 hidden md:block">
          <a 
            href="tel:19000056" 
            className="flex items-center space-x-2 bg-[#800F14] hover:bg-[#EE3124] text-white px-4 py-2.5 rounded-full shadow-lg transition-all transform hover:scale-105 active:scale-95"
          >
            <Phone size={14} className="animate-bounce" />
            <span className="text-xs font-black tracking-wider">1900 0056</span>
          </a>
        </div>

        {/* Assistant and Cart Widgets (Bottom Right) */}
        <div className="fixed bottom-20 right-4 z-40 flex flex-col space-y-3 items-end">
          <button
            onClick={() => {
              setAssistantMode('home');
              setAssistantFilter('');
              setIsAssistantOpen(true);
            }}
            className="w-14 h-14 bg-[#EE3124] hover:bg-[#800F14] text-white rounded-full flex items-center justify-center shadow-2xl relative transition-transform transform hover:scale-110 active:scale-95"
            title="Trợ lý gợi ý món"
            aria-label="Mở trợ lý gợi ý món"
          >
            <MessageCircle size={24} />
            <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-[#FFE600] text-[#800F14] border-2 border-white flex items-center justify-center shadow-md">
              <Sparkles size={10} />
            </span>
          </button>

          {/* Floating Cart Button */}
          {activeStep !== 'cart' && activeStep !== 'dish_detail' && (
            <button
              onClick={() => setActiveStep('cart')}
              className="w-14 h-14 bg-[#EE3124] hover:bg-[#800F14] text-white rounded-full flex items-center justify-center shadow-2xl relative transition-transform transform hover:scale-110 active:scale-95 animate-pulse-red"
              title="Xem giỏ hàng"
            >
              <ShoppingCart size={24} />
              {totalQty > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#FFE600] text-[#800F14] font-mono font-black text-[10px] w-6 h-6 rounded-full flex items-center justify-center border-2 border-white shadow-md">
                  {totalQty}
                </span>
              )}
            </button>
          )}
        </div>
      </>
    );
  };

  const renderAssistantModal = () => {
    if (!isAssistantOpen) return null;

    const suggestions = getAssistantSuggestions();
    const showHome = assistantMode === 'home';
    const showTasteOptions = assistantMode === 'taste' && !assistantFilter;
    const showBudgetOptions = assistantMode === 'budget' && !assistantFilter;
    const showComboBudgetOptions = assistantMode === 'combo' && !assistantFilter;

    return (
      <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
        <div className="bg-white w-full sm:max-w-2xl max-h-[88vh] overflow-hidden rounded-t-3xl sm:rounded-3xl shadow-2xl border border-gray-200 flex flex-col">
          <div className="bg-[#EE3124] text-white px-5 py-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles size={20} />
              <div>
                <h3 className="text-sm font-black uppercase tracking-wider">Trợ lý gợi ý món</h3>
                <p className="text-[10px] text-white/80 font-semibold">Chọn nhanh, không cần nhập tin nhắn</p>
              </div>
            </div>
            <button
              onClick={() => {
                setIsAssistantOpen(false);
                setAssistantMode('home');
                setAssistantFilter('');
              }}
              className="h-9 w-9 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center"
              aria-label="Đóng trợ lý"
            >
              <X size={18} />
            </button>
          </div>

          <div className="p-5 overflow-y-auto space-y-5">
            <div className="rounded-2xl bg-gray-50 border border-gray-200 p-4">
              <p className="text-sm font-bold text-gray-800 leading-relaxed">
                Mình có thể gợi ý món phù hợp cho bàn của bạn. Bạn muốn gợi ý theo tiêu chí nào?
              </p>
              <p className="mt-2 text-[11px] text-gray-500 font-semibold">
                Bàn {tableId} • {guestCount} khách • Giỏ tạm {cart.reduce((sum, item) => sum + item.quantity, 0)} món
              </p>
            </div>

            {showHome && (
              <div className="grid grid-cols-2 gap-3">
                {assistantOptions.home.map(label => (
                  <button
                    key={label}
                    onClick={() => handleAssistantChoice(label)}
                    className="min-h-14 rounded-2xl border border-gray-200 bg-white px-3 py-3 text-xs font-black text-gray-800 hover:border-[#EE3124] hover:text-[#EE3124] hover:bg-red-50 active:scale-[0.98]"
                  >
                    {label}
                  </button>
                ))}
              </div>
            )}

            {(showTasteOptions || showBudgetOptions || showComboBudgetOptions) && (
              <div className="grid grid-cols-2 gap-3">
                {(showTasteOptions ? assistantOptions.taste : assistantOptions.budget).map(label => (
                  <button
                    key={label}
                    onClick={() => setAssistantFilter(label)}
                    className="min-h-12 rounded-2xl border border-gray-200 bg-white px-3 py-3 text-xs font-black text-gray-800 hover:border-[#EE3124] hover:text-[#EE3124] hover:bg-red-50 active:scale-[0.98]"
                  >
                    {label}
                  </button>
                ))}
              </div>
            )}

            {!showHome && !showTasteOptions && !showBudgetOptions && !showComboBudgetOptions && (
              <div className="space-y-3">
                {suggestions.length === 0 ? (
                  <div className="rounded-2xl border border-gray-200 bg-gray-50 p-5 text-center text-sm text-gray-500 font-semibold">
                    Chưa có món phù hợp. Bạn có thể chọn tiêu chí khác hoặc gọi nhân viên hỗ trợ.
                  </div>
                ) : (
                  suggestions.map(suggestion => {
                    const suggestionDishes = suggestion.dishIds
                      .map(id => availableDishes.find(d => d.Ma_mon === id) || dishes.find(d => d.Ma_mon === id))
                      .filter(Boolean) as typeof availableDishes;
                    const coverDish = suggestionDishes[0];
                    const extraDishCount = Math.max(0, suggestionDishes.length - 1);

                    return (
                    <div key={suggestion.id} className="rounded-2xl border border-gray-200 bg-white p-3 shadow-sm space-y-3">
                      <div className="flex items-start gap-3">
                        <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-2xl border border-gray-100 bg-gray-100">
                          {coverDish?.Anh_mon ? (
                            <img
                              src={coverDish.Anh_mon}
                              alt={coverDish.Ten_mon}
                              className="h-full w-full object-cover"
                              referrerPolicy="no-referrer"
                              loading="lazy"
                              onError={(event) => {
                                event.currentTarget.style.display = 'none';
                              }}
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center bg-red-50 text-[#EE3124]">
                              <Sparkles size={22} />
                            </div>
                          )}
                          {extraDishCount > 0 && (
                            <span className="absolute bottom-1.5 right-1.5 rounded-full bg-black/70 px-2 py-0.5 text-[10px] font-black text-white">
                              +{extraDishCount}
                            </span>
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-2">
                            <h4 className="text-sm font-black uppercase text-gray-950 leading-tight line-clamp-2">{suggestion.title}</h4>
                            <span className="shrink-0 rounded-full bg-red-50 px-2.5 py-1 text-[10px] font-black text-[#EE3124]">
                              {formatPrice(suggestion.price)}
                            </span>
                          </div>
                          <p className="mt-1 text-xs text-gray-600 leading-relaxed line-clamp-2">{suggestion.description}</p>
                          {suggestion.note && (
                            <p className="mt-1 text-[10px] text-[#EE3124] font-bold line-clamp-1">{suggestion.note}</p>
                          )}
                          {suggestionDishes.length > 1 && (
                            <p className="mt-1 text-[10px] text-gray-500 font-semibold line-clamp-1">
                              Gồm: {suggestionDishes.map(dish => dish.Ten_mon).join(', ')}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={() => addSuggestionToCart(suggestion)}
                          className="rounded-xl bg-[#EE3124] px-3 py-3 text-[11px] font-black uppercase text-white hover:bg-[#800F14]"
                        >
                          Thêm vào đơn
                        </button>
                        <button
                          onClick={() => viewSuggestionDetail(suggestion)}
                          className="rounded-xl border border-gray-200 bg-white px-3 py-3 text-[11px] font-black uppercase text-gray-700 hover:bg-gray-50"
                        >
                          Xem chi tiết
                        </button>
                        <button
                          onClick={() => {
                            setAssistantMode('home');
                            setAssistantFilter('');
                          }}
                          className="rounded-xl border border-gray-200 bg-white px-3 py-3 text-[11px] font-black uppercase text-gray-700 hover:bg-gray-50"
                        >
                          Gợi ý món khác
                        </button>
                        <button
                          onClick={() => {
                            setAssistantMode('home');
                            setAssistantFilter('');
                          }}
                          className="rounded-xl border border-gray-200 bg-white px-3 py-3 text-[11px] font-black uppercase text-gray-700 hover:bg-gray-50"
                        >
                          Quay lại
                        </button>
                      </div>
                    </div>
                    );
                  })
                )}
              </div>
            )}
          </div>

          <div className="border-t border-gray-200 bg-gray-50 p-4 grid grid-cols-3 gap-2">
            <button
              onClick={() => {
                setAssistantMode('home');
                setAssistantFilter('');
              }}
              className="rounded-xl border border-gray-200 bg-white py-3 text-[10px] font-black uppercase text-gray-700"
            >
              Quay lại
            </button>
            <button
              onClick={() => {
                setIsAssistantOpen(false);
                setActiveStep('cart');
              }}
              className="rounded-xl border border-gray-200 bg-white py-3 text-[10px] font-black uppercase text-gray-700"
            >
              Xem đơn tạm
            </button>
            <button
              onClick={() => {
                setIsAssistantOpen(false);
                handleConfirmOrder();
              }}
              disabled={cart.length === 0}
              className={`rounded-xl py-3 text-[10px] font-black uppercase ${cart.length > 0 ? 'bg-[#EE3124] text-white' : 'bg-gray-200 text-gray-400'}`}
            >
              Xác nhận gọi món
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Header Brand Navigation Bar (Responsive website layout)
  const renderHeader = () => {
    return (
      <header className="bg-white border-b border-gray-100 py-3.5 px-4 sticky top-0 z-40 shadow-xs">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveStep('menu')}>
            <div className="w-12 h-12 shrink-0">
              <BrandLogo size={48} />
            </div>
            <div className="hidden sm:flex flex-col">
              <span className="text-sm font-black text-[#800F14] leading-tight font-display tracking-wide uppercase">LẨU NẤM GIA KHÁNH</span>
              <span className="text-[9px] text-gray-400 font-mono tracking-wider">www.launamgiakhanh.vn</span>
            </div>
          </div>

          {/* Table ID Display & Leave Button */}
          <div className="flex items-center space-x-3">
            <div className="bg-[#800F14] text-white px-3.5 py-1.5 rounded-full text-[11px] font-black tracking-wider shadow-sm flex items-center space-x-1">
              <span>BÀN:</span>
              <span className="text-[#FFE600]">{tableId}</span>
            </div>

            <button 
              onClick={handleLeaveTable}
              className="flex items-center space-x-1 bg-red-50 text-[#EE3124] hover:bg-red-100 px-3 py-1.5 rounded-full text-[10px] font-black tracking-wider transition active:scale-95 cursor-pointer border border-red-200"
            >
              <LogOut size={12} />
              <span>RỜI BÀN</span>
            </button>

            {/* Desktop Quick Nav Menu */}
            <nav className="hidden md:flex items-center space-x-6 text-xs font-bold text-gray-600 pl-3">
              <button onClick={() => setActiveStep('menu')} className={`hover:text-[#EE3124] ${activeStep === 'menu' ? 'text-[#EE3124]' : ''}`}>THỰC ĐƠN</button>
              <button onClick={() => setActiveStep('cart')} className={`hover:text-[#EE3124] ${activeStep === 'cart' ? 'text-[#EE3124]' : ''}`}>GIỎ HÀNG</button>
              <button onClick={() => setActiveStep('tracking')} className={`hover:text-[#EE3124] ${activeStep === 'tracking' ? 'text-[#EE3124]' : ''}`}>ĐƠN ĐÃ ĐẶT</button>
            </nav>
          </div>
        </div>
      </header>
    );
  };

  return (
    <div className="min-h-screen bg-[#F9F9F9] w-full flex flex-col justify-between font-sans overflow-x-hidden relative" id="customer-root-wrapper">
      
      {/* HEADER: Only render when activeStep is not welcome step */}
      {activeStep !== 'phone' && activeStep !== 'join_code' && renderHeader()}

      {/* VIEWPORT BODY CONTAINER */}
      <main className="flex-1 flex flex-col justify-start relative w-full pb-20">
        
        {/* ================= SCREEN 1: PHONE LOGIN (Giao diện sáng sạch đẹp) ================= */}
        {activeStep === 'phone' && (
          <div className="w-full max-w-4xl mx-auto px-4 py-10 md:py-16 flex flex-col md:flex-row items-center justify-center gap-8 md:gap-16 z-10 flex-1 animate-slide-up" id="customer-phone-view">
            
            {/* Left Column: Brand Promotion */}
            <div className="flex-1 text-center md:text-left space-y-6">
              <div className="flex justify-center md:justify-start">
                <BrandLogo size={140} />
              </div>
              <div className="space-y-3">
                <h1 className="text-3xl md:text-4xl font-display font-black text-[#800F14] tracking-wide leading-tight uppercase">
                  Lẩu Nấm Gia Khánh
                </h1>
                <p className="text-xs md:text-sm text-gray-500 leading-relaxed max-w-md mx-auto md:mx-0">
                  Hương vị tinh khiết từ nấm thiên nhiên mang lại sức khỏe và niềm vui trọn vẹn cho gia đình bạn. Quét QR gọi món nhanh chóng và tiện lợi tại bàn.
                </p>
              </div>

              {/* Table Info Badge */}
              <div className="inline-flex items-center space-x-3 bg-white border border-gray-200 rounded-2xl p-4 shadow-sm text-left">
                <div className="w-10 h-10 bg-[#EE3124] text-white rounded-xl flex items-center justify-center shrink-0 shadow-sm">
                  <span className="font-black text-sm">{tableId}</span>
                </div>
                <div>
                  <h4 className="text-xs font-black text-[#800F14] uppercase tracking-wider">Bàn ăn hiện tại</h4>
                  <p className="text-[10px] text-gray-400 mt-0.5">Vui lòng nhập số điện thoại để bắt đầu gọi món</p>
                </div>
              </div>
            </div>

                {/* Right Form Entry Card */}
                <div className="w-full lg:max-w-md space-y-4">
                  {errorMessage && (
                    <p className="p-3 bg-red-50 text-[#EE3124] text-xs rounded-xl border border-red-200 font-bold text-center">{errorMessage}</p>
                  )}

                  <form onSubmit={handlePhoneSubmit} className="space-y-4">
                    {/* Số điện thoại input */}
                    <div className="space-y-2.5 bg-white rounded-3xl border border-gray-150 p-6 shadow-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black text-gray-800 uppercase tracking-wider">Số điện thoại</span>
                        <span className="bg-red-50 text-[#EE3124] px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider">Bắt buộc</span>
                      </div>
                      <p className="text-xs text-gray-400 -mt-1 leading-normal">Nhập số điện thoại để nhận thông báo về đơn hàng</p>
                      
                      <div className="flex items-center border border-gray-200 rounded-xl px-3.5 py-3 bg-gray-50 focus-within:border-[#EE3124] focus-within:bg-white transition mt-2">
                        <Phone size={16} className="text-gray-400 shrink-0" />
                        <input
                          id="cust-phone-inp"
                          type="tel"
                          required
                          className="w-full bg-transparent border-none outline-none pl-3 font-mono font-bold text-gray-808 text-sm focus:ring-0"
                          placeholder="09XX XXX XXX"
                          value={phoneNumber}
                          onChange={e => setPhoneNumber(e.target.value)}
                        />
                      </div>

                      <div className="text-[9px] text-gray-450 flex items-center justify-center space-x-1 pt-2">
                        <span className="text-green-600 font-bold">✓</span>
                        <span>Thông tin của bạn được bảo mật tuyệt đối</span>
                      </div>
                    </div>

                    <button
                      id="btn-guest-submit"
                      type="submit"
                      className="w-full py-4 bg-[#EE3124] hover:bg-[#800F14] text-white rounded-xl text-xs font-black tracking-widest shadow-md hover:shadow-lg active:scale-95 transition-all duration-150 cursor-pointer uppercase flex items-center justify-center space-x-2"
                    >
                      <span>BẮT ĐẦU GỌI MÓN</span>
                      <span className="text-xs">→</span>
                    </button>
                  </form>

                  {/* Share code invitation link */}
                  {/* Feature Badges */}
                  <div className="rounded-2xl p-4 flex justify-between items-center bg-gray-50 border border-gray-100 shadow-3xs shrink-0 mt-6">
                    <div className="flex-1 flex items-center space-x-1.5 justify-center">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#EE3124" strokeWidth="2.5" className="shrink-0">
                        <path d="M2 20h20" />
                        <path d="M20 16v-2a8 8 0 0 0-16 0v2" />
                        <path d="M12 4V2" />
                      </svg>
                      <span className="text-[9px] font-black text-gray-700 leading-tight">Món ngon chuẩn vị</span>
                    </div>
                    <div className="w-px h-6 bg-gray-250"></div>
                    <div className="flex-1 flex items-center space-x-1.5 justify-center">
                      <Clock size={14} className="text-[#EE3124] stroke-[2.5] shrink-0" />
                      <span className="text-[9px] font-black text-gray-700 leading-tight">Chế biến nhanh tại bàn</span>
                    </div>
                    <div className="w-px h-6 bg-gray-250"></div>
                    <div className="flex-1 flex items-center space-x-1.5 justify-center">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#EE3124" strokeWidth="2.5" className="shrink-0">
                        <path d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z" />
                        <path d="M8 14s1.5 2 4 2 4-2 4-2" />
                        <line x1="9" y1="9" x2="9.01" y2="9" />
                        <line x1="15" y1="9" x2="15.01" y2="9" />
                      </svg>
                      <span className="text-[9px] font-black text-gray-700 leading-tight">Phục vụ tận tâm chu đáo</span>
                    </div>
                  </div>
                </div>

          </div>
        )}

        {/* ================= SCREEN 2: JOIN SHARE CODE ================= */}
        {activeStep === 'join_code' && (
          <div className="w-full max-w-md mx-auto px-4 py-20 z-10 flex-1 flex flex-col justify-center animate-slide-up" id="customer-join-view">
            <div className="bg-white border border-gray-150 rounded-3xl p-6 md:p-8 shadow-md text-center space-y-6">
              <div className="flex justify-center">
                <BrandLogo size={100} />
              </div>

              <div className="space-y-2">
                <h3 className="text-lg font-black text-[#800F14] uppercase tracking-wider">Nhập mã gộp bàn</h3>
                <p className="text-xs text-gray-500 max-w-xs mx-auto leading-relaxed">
                  Nhập mã code gồm 4 ký tự từ người quét đầu tiên (Host) để dùng chung giỏ hàng trực tuyến.
                </p>
              </div>

              {errorMessage && (
                <div className="p-3 bg-red-50 text-[#EE3124] text-xs rounded-xl border border-red-200 font-bold text-center">
                  {errorMessage}
                </div>
              )}

              <form onSubmit={handleJoinSubmit} className="space-y-4">
                <input
                  id="join-code-inp"
                  type="text"
                  required
                  maxLength={6}
                  className="w-full p-3.5 border border-gray-200 focus:border-[#EE3124] rounded-xl font-mono font-black text-center tracking-[0.4em] text-xl bg-gray-50 focus:bg-white transition uppercase"
                  placeholder="EX: 7X2B"
                  value={enteredCode}
                  onChange={e => setEnteredCode(e.target.value.toUpperCase())}
                />

                <button
                  id="btn-join-code"
                  type="submit"
                  className="w-full py-4 bg-[#EE3124] hover:bg-[#800F14] text-white font-black text-xs tracking-widest rounded-xl shadow cursor-pointer uppercase active:scale-95 transition"
                >
                  XÁC NHẬN THAM GIA
                </button>
              </form>

              <button
                onClick={() => {
                  setErrorMessage('');
                  setActiveStep('phone');
                }}
                className="text-xs text-gray-500 hover:text-gray-800 font-bold tracking-wider block mx-auto uppercase hover:underline pt-2"
              >
                ← Quay lại đăng nhập SĐT
              </button>
            </div>
          </div>
        )}

        {/* ================= SCREEN 3: MENU BROWSE (Responsive layout) ================= */}
        {activeStep === 'menu' && (
          <div className="w-full max-w-6xl mx-auto px-4 py-6 animate-slide-up flex flex-col space-y-6" id="customer-browsing-menu">
            
            {/* Elegant Search Input */}
            <div className="w-full max-w-md mx-auto space-y-3">
              <div className="relative flex items-center bg-white border border-gray-200 focus-within:border-[#EE3124] rounded-2xl shadow-2xs px-4 py-3.5 transition duration-150">
                <Search size={18} className="text-gray-400 mr-3 shrink-0" />
                <input
                  type="text"
                  className="w-full bg-transparent border-none outline-none font-sans font-medium text-sm text-gray-800 focus:ring-0 placeholder-gray-400"
                  placeholder="Tìm kiếm món ngon..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="text-gray-400 hover:text-[#EE3124] transition ml-2 cursor-pointer shrink-0"
                    title="Xóa tìm kiếm"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>
            </div>

            {/* Horizontal Categories Scroll tags */}
            <div className="sticky top-[78px] z-30 bg-[#F9F9F9] py-3 border-b border-gray-200 overflow-x-auto hide-scrollbar flex space-x-2 whitespace-nowrap">
              <button
                onClick={() => {
                  setSelectedCatId('all');
                  scrollToTop();
                }}
                className={`px-5 py-2.5 rounded-full text-xs font-black tracking-wider transition cursor-pointer select-none active:scale-95 border ${
                  selectedCatId === 'all'
                    ? 'bg-[#EE3124] border-[#EE3124] text-white shadow-sm'
                    : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                }`}
              >
                TẤT CẢ
              </button>
              {activeTabsCategories.map(cat => (
                <button
                  key={cat.Ma_danh_muc}
                  onClick={() => {
                    setSelectedCatId(cat.Ma_danh_muc);
                    scrollToTop();
                  }}
                  className={`px-5 py-2.5 rounded-full text-xs font-black tracking-wider transition cursor-pointer select-none active:scale-95 border ${
                    selectedCatId === cat.Ma_danh_muc
                      ? 'bg-[#EE3124] border-[#EE3124] text-white shadow-sm'
                      : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {cat.Ten_danh_muc.toUpperCase()}
                </button>
              ))}
            </div>

            {/* Grid layout for Dishes: 2 cols on mobile, 3-4 on desktop */}
            {activeCategoryDishes(selectedCatId).length === 0 ? (
              <div className="py-20 text-center text-gray-400 bg-white border border-gray-150 rounded-3xl italic text-xs flex flex-col items-center justify-center space-y-3 shadow-2xs">
                <Search size={32} className="text-gray-300 animate-pulse" />
                <span className="font-bold text-gray-800 text-sm">Không tìm thấy món ăn nào phù hợp</span>
                <span className="text-[10px] text-gray-400">Vui lòng nhập từ khóa khác hoặc xóa tìm kiếm</span>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6" id="guest-dishes-grid">
                {activeCategoryDishes(selectedCatId).map(dish => {
                  const isOutOfStock = dish.Trang_thai === DishStatus.HET_MON || dish.Trang_thai === DishStatus.NGUNG_PHUC_VU;
                  
                  return (
                    <div
                      key={dish.Ma_mon}
                      onClick={() => {
                        if (!isOutOfStock) {
                          setSelectedDishId(dish.Ma_mon);
                          setDetailQuantity(1);
                          setDishNotes('');
                          setActiveStep('dish_detail');
                        }
                      }}
                      className={`bg-white rounded-2xl border border-gray-200/80 overflow-hidden flex flex-col justify-between shadow-2xs transition-all duration-200 ${
                        isOutOfStock ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:shadow-md hover:scale-[1.02]'
                      }`}
                    >
                      {/* Dish Image */}
                      <div className="w-full aspect-square md:aspect-video relative bg-gray-100 overflow-hidden">
                        <img
                          src={dish.Anh_mon}
                          alt={dish.Ten_mon}
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                        {isOutOfStock && (
                          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                            <span className="bg-[#FFE600] text-[#850E12] font-black text-[9px] md:text-xs px-2.5 py-1 rounded-full uppercase tracking-widest shadow-md">Tạm Hết</span>
                          </div>
                        )}
                      </div>

                      {/* Dish Details */}
                      <div className="p-3 md:p-4 flex flex-col justify-between flex-1 space-y-2">
                        <div className="space-y-1">
                          <div className="min-h-[2.5rem] flex items-center">
                            <h4 className="font-black text-gray-950 text-xs sm:text-sm uppercase tracking-wide line-clamp-2 overflow-hidden leading-tight">
                              {dish.Ten_mon}
                            </h4>
                          </div>
                          <p className="text-[11px] text-gray-600 line-clamp-2 leading-relaxed font-medium">
                            {dish.Mo_ta || 'Lẩu nấm tinh túy, tốt sức khỏe.'}
                          </p>
                        </div>

                        <div className="flex justify-between items-center pt-2">
                          <span className="font-sans font-black text-xs sm:text-sm text-[#EE3124]">
                            {formatPrice(dish.Don_gia)}
                          </span>

                          {!isOutOfStock && (
                            <div className="w-7 h-7 bg-[#EE3124] text-white rounded-full flex items-center justify-center shadow-md">
                              <Plus size={14} className="stroke-[3]" />
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ================= SCREEN 4: DISH DETAIL & INGREDIENTS ================= */}
        {activeStep === 'dish_detail' && selectedDish && (
          <div className="w-full max-w-3xl mx-auto px-4 py-6 animate-slide-up flex flex-col space-y-6" id="customer-dish-detail">
            
            {/* Back to menu button */}
            <button
              onClick={() => setActiveStep('menu')}
              className="inline-flex items-center space-x-1 text-gray-600 hover:text-gray-900 text-xs font-black uppercase tracking-wider cursor-pointer"
            >
              <ArrowLeft size={16} />
              <span>Quay lại thực đơn</span>
            </button>

            {/* Main Dish Info and image (Split layout) */}
            <div className="bg-white border border-gray-200 rounded-3xl p-5 md:p-8 shadow-sm flex flex-col md:flex-row gap-6 md:gap-10">
              {/* Left Column: Image */}
              <div className="w-full md:w-1/2 aspect-video md:aspect-square bg-gray-150 rounded-2xl overflow-hidden shadow-inner shrink-0">
                <img
                  src={selectedDish.Anh_mon}
                  alt={selectedDish.Ten_mon}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>

              {/* Right Column: Information & Actions */}
              <div className="flex-1 flex flex-col justify-between space-y-5">
                <div className="space-y-3">
                  <h2 className="text-2xl font-black text-gray-950 uppercase tracking-wide leading-tight">
                    {selectedDish.Ten_mon}
                  </h2>
                  <div className="text-xl font-sans font-black text-[#EE3124]">
                    {formatPrice(selectedDish.Don_gia)}
                  </div>
                  <hr className="border-gray-200" />
                  <p className="text-xs sm:text-sm text-gray-700 font-normal leading-relaxed">
                    {selectedDish.Mo_ta || 'Hương vị thơm ngọt thanh lành từ nấm tự nhiên, giàu dinh dưỡng và tốt cho sức khỏe.'}
                  </p>
                </div>

                {/* Display ingredient list from recipes & materials */}
                {getDishIngredients(selectedDish.Ma_mon).length > 0 && (
                  <div className="space-y-2 bg-[#F9F9F9] p-4 rounded-xl border border-gray-150">
                    <h4 className="text-[10px] font-black text-gray-805 uppercase tracking-widest">Thành phần nguyên liệu:</h4>
                    <ul className="text-xs text-gray-600 space-y-1 list-disc list-inside font-medium">
                      {getDishIngredients(selectedDish.Ma_mon).map((name, idx) => (
                        <li key={idx} className="capitalize">{name}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Dietary requirements note */}
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-black text-gray-700 uppercase tracking-widest">Yêu cầu đặc biệt cho món này</label>
                  <input
                    id="guest-dish-memo-inp"
                    type="text"
                    className="w-full px-3.5 py-3 border border-gray-200 focus:border-[#EE3124] rounded-xl text-xs bg-gray-50 focus:bg-white transition"
                    placeholder="Ví dụ: Ít cay, không lấy hành, thêm chanh..."
                    value={dishNotes}
                    onChange={e => setDishNotes(e.target.value)}
                  />
                </div>

                {/* Quantity selector and Cart button */}
                <div className="flex items-center gap-4 pt-3">
                  {/* Quantity selector box */}
                  <div className="flex items-center space-x-3 bg-white border border-gray-300 rounded-xl p-1 shrink-0">
                    <button
                      onClick={() => setDetailQuantity(q => Math.max(1, q - 1))}
                      className="w-8 h-8 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-lg flex items-center justify-center font-black text-sm cursor-pointer"
                    >
                      -
                    </button>
                    <span className="font-mono font-black text-gray-800 text-sm w-6 text-center">{detailQuantity}</span>
                    <button
                      onClick={() => setDetailQuantity(q => q + 1)}
                      className="w-8 h-8 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-lg flex items-center justify-center font-black text-sm cursor-pointer"
                    >
                      +
                    </button>
                  </div>

                  <button
                    id="btn-add-to-cart-confirm"
                    onClick={() => addToCart(selectedDish.Ma_mon, detailQuantity, dishNotes)}
                    className="flex-1 py-3.5 bg-[#EE3124] hover:bg-[#800F14] text-white rounded-xl font-black text-xs tracking-wider shadow hover:shadow-lg active:scale-95 transition cursor-pointer text-center uppercase flex items-center justify-center space-x-2"
                  >
                    <ShoppingCart size={14} />
                    <span>THÊM VÀO GIỎ HÀNG &gt;</span>
                  </button>
                </div>
              </div>
            </div>

            {/* recommended section: CÁC MÓN KHÁC */}
            <div className="space-y-4">
              <h3 className="text-sm font-black text-[#800F14] uppercase tracking-widest border-l-4 border-[#EE3124] pl-2">
                Các Món Khác
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {dishes
                  .filter(d => d.Ma_mon !== selectedDish.Ma_mon && d.Trang_thai === DishStatus.CON_PHUC_VU)
                  .slice(0, 4)
                  .map(d => (
                    <div
                      key={d.Ma_mon}
                      onClick={() => {
                        setSelectedDishId(d.Ma_mon);
                        setDetailQuantity(1);
                        setDishNotes('');
                        scrollToTop();
                      }}
                      className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-2xs hover:shadow-sm cursor-pointer flex flex-col justify-between h-full"
                    >
                      <div className="w-full aspect-square bg-gray-100 overflow-hidden">
                        <img src={d.Anh_mon} alt={d.Ten_mon} className="w-full h-full object-cover" />
                      </div>
                      <div className="p-2.5 space-y-1">
                        <h5 className="font-bold text-gray-950 text-[10px] md:text-xs uppercase truncate">{d.Ten_mon}</h5>
                        <p className="font-sans text-[10px] md:text-xs text-[#EE3124] font-black">{formatPrice(d.Don_gia)}</p>
                      </div>
                    </div>
                  ))}
              </div>
            </div>

          </div>
        )}

        {/* ================= SCREEN 5: SHOPPING CART ================= */}
        {activeStep === 'cart' && (
          <div className="w-full max-w-4xl mx-auto px-4 py-6 animate-slide-up flex flex-col space-y-6" id="customer-cart-checkout">
            
            <button
              onClick={() => setActiveStep('menu')}
              className="inline-flex items-center space-x-1 text-gray-600 hover:text-gray-900 text-xs font-black uppercase tracking-wider cursor-pointer"
            >
              <ArrowLeft size={16} />
              <span>Tiếp tục thêm món</span>
            </button>

            <div className="flex flex-col lg:flex-row gap-6 items-start">
              
              {/* Left Column: Cart Rows */}
              <div className="flex-1 w-full space-y-4">
                <div className="bg-white border border-gray-200 rounded-3xl p-5 md:p-6 shadow-sm space-y-4">
                  <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                    <h3 className="font-black text-gray-900 uppercase text-sm tracking-wider">Giỏ hàng tạm tính</h3>
                    {cart.length > 0 && (
                      <button
                        onClick={() => setCart([])}
                        className="text-[10px] text-gray-400 hover:text-[#EE3124] font-black flex items-center space-x-1 uppercase active:scale-95 transition cursor-pointer"
                      >
                        <Trash2 size={12} />
                        <span>Xóa tất cả</span>
                      </button>
                    )}
                  </div>

                  {cart.length === 0 ? (
                    <div className="py-16 text-center text-gray-400 italic text-xs">
                      Giỏ hàng của bạn đang trống. Hãy quay lại menu để thêm món ngon.
                    </div>
                  ) : (
                    <div className="divide-y divide-gray-100" id="cart-rows-wrap">
                      {cart.map(item => {
                        const dish = dishes.find(d => d.Ma_mon === item.dishId);
                        if (!dish) return null;
                        return (
                          <div key={item.dishId} className="flex space-x-4 py-4 first:pt-0 last:pb-0 items-center justify-between">
                            <div className="flex space-x-4 items-center min-w-0 flex-1">
                              {/* Thumbnail */}
                              <div className="w-12 h-12 rounded-xl overflow-hidden bg-gray-50 border border-gray-100 shrink-0">
                                <img src={dish.Anh_mon} alt={dish.Ten_mon} className="w-full h-full object-cover" />
                              </div>

                              {/* Details */}
                              <div className="min-w-0 flex-1">
                                <h4 className="font-black text-gray-950 text-xs sm:text-sm uppercase leading-tight line-clamp-2">{dish.Ten_mon}</h4>
                                {item.notes && (
                                  <p className="text-[9px] text-[#EE3124] italic font-semibold truncate mt-0.5">
                                    Yêu cầu: {item.notes}
                                  </p>
                                )}
                                <span className="font-sans text-xs sm:text-sm text-[#EE3124] font-black block mt-1">
                                  {formatPrice(dish.Don_gia)}
                                </span>
                              </div>
                            </div>

                            {/* Qty and Delete */}
                            <div className="flex items-center space-x-4 shrink-0">
                              <div className="flex items-center space-x-2 bg-gray-50 border border-gray-200 rounded-lg p-0.5">
                                <button
                                  onClick={() => updateCartQty(item.dishId, -1)}
                                  className="w-5 h-5 bg-white text-gray-600 rounded flex items-center justify-center border border-gray-200 active:scale-90 font-black text-xs cursor-pointer"
                                >
                                  -
                                </button>
                                <span className="font-mono font-black text-gray-850 text-xs w-4 text-center">{item.quantity}</span>
                                <button
                                  onClick={() => updateCartQty(item.dishId, 1)}
                                  className="w-5 h-5 bg-white text-gray-600 rounded flex items-center justify-center border border-gray-200 active:scale-90 font-black text-xs cursor-pointer"
                                >
                                  +
                                </button>
                              </div>

                              <button
                                onClick={() => updateCartQty(item.dishId, -item.quantity)}
                                className="text-gray-400 hover:text-red-500 font-bold text-lg px-2 cursor-pointer"
                                title="Xóa món"
                              >
                                ×
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column: Checkout summary */}
              {cart.length > 0 && (
                <div className="w-full lg:w-96 bg-white border border-gray-200 rounded-3xl p-6 shadow-sm space-y-5 shrink-0">
                  <h3 className="font-black text-[#800F14] text-sm uppercase tracking-wider border-b border-gray-100 pb-3">Chi tiết hóa đơn</h3>

                  {/* General kitchen memo */}
                  <div className="space-y-1.5">
                    <label className="block text-[9px] font-black text-gray-700 uppercase tracking-widest">Ghi chú chung cho bếp</label>
                    <input
                      id="guest-cart-memo-inp"
                      type="text"
                      className="w-full px-3.5 py-3 border border-gray-200 focus:border-[#EE3124] rounded-xl text-xs bg-gray-50 focus:bg-white transition"
                      placeholder="VD: Nhúng lẩu ít cay, nhiều gia vị chấm..."
                      value={dishNotes}
                      onChange={e => setDishNotes(e.target.value)}
                    />
                  </div>

                  {/* Total calculation */}
                  <div className="flex justify-between items-center text-xs pt-2" id="billing-summary-block">
                    <span className="text-gray-500 font-bold uppercase tracking-wider text-[9px]">Tổng thanh toán ({cart.reduce((sum, item) => sum + item.quantity, 0)} món)</span>
                    <span className="font-sans font-black text-base text-[#EE3124]">{formatPrice(getCartTotal())}</span>
                  </div>

                  <button
                    id="btn-place-order-confirm"
                    onClick={handleConfirmOrder}
                    className="w-full py-4 bg-[#EE3124] hover:bg-[#800F14] text-white font-black text-xs tracking-widest rounded-xl shadow cursor-pointer text-center flex items-center justify-center space-x-1.5 uppercase active:scale-95 transition"
                  >
                    <Send size={14} />
                    <span>GỬI ĐƠN HÀNG XUỐNG BẾP &gt;</span>
                  </button>
                </div>
              )}
            </div>

          </div>
        )}

        {/* ================= SCREEN 6: SUCCESS & SESSION SHARING ================= */}
        {activeStep === 'success' && (
          <div className="w-full max-w-md mx-auto px-4 py-16 z-10 flex-1 flex flex-col justify-center animate-slide-up text-center" id="customer-success-splash">
            <div className="bg-white border border-gray-200 rounded-3xl p-6 md:p-8 shadow-md space-y-6">
              
              <div className="w-16 h-16 bg-green-50 text-green-600 rounded-full border border-green-200 flex items-center justify-center mx-auto">
                <Check size={36} className="stroke-[3]" />
              </div>

              <div className="space-y-2">
                <h2 className="text-xl font-black text-[#800F14] uppercase tracking-wider">Đặt món thành công!</h2>
                <p className="text-xs text-gray-500 leading-relaxed max-w-[260px] mx-auto">
                  Đơn đặt nấm của bạn đã được chuyển xuống bếp chế biến. Chúc quý khách ngon miệng!
                </p>
              </div>

              {/* Shared Code card */}
              <div className="bg-[#800F14]/5 border border-[#800F14]/10 p-5 rounded-2xl space-y-2.5 max-w-[280px] mx-auto shadow-2xs">
                <span className="text-[9px] text-[#800F14] font-black uppercase tracking-wider block">Mã phiên chia sẻ cho bạn đi cùng:</span>
                <span className="font-mono text-2xl font-black text-[#800F14] tracking-widest">{currentSessionCode || '7X2B'}</span>
                <p className="text-[9px] text-gray-400 leading-normal font-medium">
                  Người đi ăn cùng bàn chỉ cần quét mã QR và điền mã này ở phần "ĂN CHUNG" để đặt cùng bạn.
                </p>
              </div>

              {/* Action buttons */}
              <div className="space-y-2.5 pt-4">
                <button
                  onClick={() => setActiveStep('menu')}
                  className="w-full py-3.5 bg-[#EE3124] hover:bg-[#800F14] text-white font-black text-xs tracking-wider rounded-xl shadow cursor-pointer uppercase active:scale-95 transition"
                >
                  TIẾP TỤC ĐẶT MÓN
                </button>
                <button
                  id="btn-go-to-tracking"
                  onClick={() => setActiveStep('tracking')}
                  className="w-full py-2.5 bg-white border border-gray-200 text-gray-500 hover:bg-gray-50 rounded-xl text-[10px] font-black cursor-pointer uppercase active:scale-95 transition"
                >
                  THEO DÕI TRẠNG THÁI BẾP
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ================= SCREEN 7: PROCESS TRACKING TIMELINE ================= */}
        {activeStep === 'tracking' && (
          <div className="w-full max-w-4xl mx-auto px-4 py-6 animate-slide-up flex flex-col space-y-6" id="customer-order-tracking">
            
            <button
              onClick={() => setActiveStep('menu')}
              className="inline-flex items-center space-x-1 text-gray-600 hover:text-gray-900 text-xs font-black uppercase tracking-wider cursor-pointer"
            >
              <ArrowLeft size={16} />
              <span>Quay lại thực đơn gọi thêm</span>
            </button>

            <div className="bg-white border border-gray-200 rounded-3xl p-5 md:p-6 shadow-sm space-y-6">
              <div className="border-b border-gray-150 pb-3 flex items-center justify-between">
                <h3 className="font-black text-gray-900 uppercase text-sm tracking-wider flex items-center space-x-2">
                  <Clock size={16} className="text-[#EE3124]" />
                  <span>Trạng thái chế biến món ăn</span>
                </h3>
                <span className="text-[10px] text-gray-400 font-bold">BÀN ĂN: {tableId}</span>
              </div>

              {placedOrdersDetails.length === 0 ? (
                <div className="py-16 text-center text-gray-400 italic text-xs">
                  Chưa có món lẩu nấm nào được đặt chế biến trong phiên làm việc này.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {placedOrdersDetails.map((item, index) => {
                    const dish = dishes.find(d => d.Ma_mon === item.Ma_mon);
                    if (!dish) return null;
                    const steps = [OrderItemStatus.DANG_CHO, OrderItemStatus.DANG_CHE_BIEN, OrderItemStatus.DA_HOAN_THANH, OrderItemStatus.DA_PHUC_VU];
                    const stepIndex = steps.indexOf(item.Trang_thai_mon);
                    const canCancel = item.Trang_thai_mon === OrderItemStatus.DANG_CHO;
                    const isCanceled = item.Trang_thai_mon === OrderItemStatus.DA_HUY;
                    
                    return (
                      <div key={index} className={`p-4 border rounded-2xl space-y-4 ${isCanceled ? 'bg-gray-50 border-gray-200 opacity-75' : 'bg-[#F9F9F9] border-gray-200'}`}>
                        {/* Title details */}
                        <div className="flex justify-between items-start gap-2">
                          <div className="min-w-0 flex-1">
                            <h4 className="font-black text-gray-950 text-xs sm:text-sm uppercase leading-tight line-clamp-2">{dish.Ten_mon}</h4>
                            <p className="text-[10px] text-gray-600 mt-1 font-bold">Số lượng: x{item.So_luong}</p>
                            {item.Ghi_chu && (
                              <p className="text-[9px] text-[#EE3124] italic mt-1 font-semibold">
                                Ghi chú: {item.Ghi_chu}
                              </p>
                            )}
                          </div>
                          <span className={`font-sans text-[8px] font-black uppercase px-2.5 py-1 rounded-full shrink-0 ${
                            isCanceled
                              ? 'text-gray-600 bg-gray-100 border border-gray-200'
                              : 'text-[#EE3124] bg-red-50 border border-red-200'
                          }`}>
                            {isCanceled ? 'ĐÃ HỦY' : item.Trang_thai_mon === OrderItemStatus.DA_PHUC_VU ? 'ĐÃ PHỤC VỤ' : item.Trang_thai_mon.toUpperCase()}
                          </span>
                        </div>

                        {isCanceled ? (
                          <div className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-[10px] font-semibold text-gray-500">
                            Món đã được hủy trước khi bếp tiếp nhận.
                          </div>
                        ) : (
                          <>
                            {/* Visual timeline process */}
                            <div className="flex items-center justify-between text-[8px] text-gray-400 font-bold pt-1.5 border-t border-gray-200/50">
                              {steps.map((step, sIdx) => {
                                const isPassed = sIdx < stepIndex;
                                const isCurrent = sIdx === stepIndex;
                                const isFuture = sIdx > stepIndex;
                                const stepNames = ['Chờ bếp tiếp nhận', 'Đang nấu', 'Hoàn tất', 'Đã bưng'];
                                
                                return (
                                  <div key={step} className="flex-1 flex flex-col items-center relative">
                                    {/* Connector */}
                                    {sIdx < steps.length - 1 && (
                                      <div className={`absolute top-1.5 left-1/2 w-full h-[2px] z-0 ${sIdx < stepIndex ? 'bg-[#EE3124]' : 'bg-gray-200'}`}></div>
                                    )}
                                    
                                    {/* Timeline Circle */}
                                    <div className={`w-3.5 h-3.5 rounded-full flex items-center justify-center border z-10 font-mono text-[8px] font-black ${
                                      isPassed ? 'bg-[#EE3124] text-white border-[#EE3124]' :
                                      isCurrent ? 'bg-[#EE3124] text-white border-[#EE3124] animate-pulse scale-110' :
                                      'bg-white text-gray-300 border-gray-200'
                                    }`}>
                                      {isPassed ? '✓' : sIdx + 1}
                                    </div>
                                    
                                    <span className={`mt-1 font-sans text-[8px] text-center leading-tight ${!isFuture ? 'text-[#EE3124] font-black' : 'text-gray-400 font-light'}`}>
                                      {stepNames[sIdx]}
                                    </span>
                                  </div>
                                );
                              })}
                            </div>

                            {canCancel ? (
                              <button
                                onClick={() => handleCancelOrderItem(item.Ma_detail_id)}
                                className="w-full py-2 rounded-xl border border-red-200 bg-white text-[#EE3124] hover:bg-red-50 text-[10px] font-black uppercase flex items-center justify-center gap-1.5"
                              >
                                <Trash2 size={13} />
                                <span>Hủy món</span>
                              </button>
                            ) : (
                              <p className="text-[10px] text-gray-500 font-semibold leading-relaxed">
                                Bếp đã tiếp nhận món. Nếu vẫn muốn hủy, vui lòng liên hệ nhân viên để được hỗ trợ xử lý.
                              </p>
                            )}
                          </>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

          </div>
        )}

      </main>

      {/* FLOAT WIDGETS & NAVBAR */}
      {renderFloatingWidgets()}

      {/* GLOBAL BOTTOM TAB NAVIGATION BAR (Mobile layout) */}
      {activeStep !== 'phone' && activeStep !== 'join_code' && activeStep !== 'dish_detail' && (
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-150 py-2.5 flex justify-around text-gray-500 z-40" id="cart-bottom-navbar">
          <button
            onClick={() => setActiveStep('menu')}
            className={`flex-1 flex flex-col items-center justify-center cursor-pointer ${
              activeStep === 'menu' ? 'text-[#EE3124]' : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            <Home size={18} />
            <span className="text-[8px] font-black uppercase mt-1 leading-none">Thực đơn</span>
          </button>
          
          <button
            onClick={() => setActiveStep('cart')}
            className={`flex-1 flex flex-col items-center justify-center relative cursor-pointer ${
              activeStep === 'cart' ? 'text-[#EE3124]' : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            <ShoppingCart size={18} />
            <span className="text-[8px] font-black uppercase mt-1 leading-none">Giỏ hàng</span>
            {cart.length > 0 && (
              <span className="absolute top-0 right-[42%] bg-[#EE3124] text-white text-[8px] font-bold w-4 h-4 rounded-full flex items-center justify-center border border-white">
                {cart.reduce((sum, item) => sum + item.quantity, 0)}
              </span>
            )}
          </button>
          
          <button
            onClick={() => setActiveStep('tracking')}
            className={`flex-1 flex flex-col items-center justify-center cursor-pointer ${
              activeStep === 'tracking' ? 'text-[#EE3124]' : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            <Clock size={18} />
            <span className="text-[8px] font-black uppercase mt-1 leading-none">Đơn đã đặt</span>
          </button>
        </div>
      )}

      {renderAssistantModal()}

    </div>
  );
}
