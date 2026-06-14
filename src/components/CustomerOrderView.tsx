/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useRestaurantStore } from '../data/store';
import { DishStatus, OrderItemStatus } from '../types';
import { Phone, Users, Plus, Minus, ShoppingCart, Check, Clock, ChevronRight, ArrowLeft, Send, Heart, BookOpen, Trash2 } from 'lucide-react';

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
        className="w-full h-full drop-shadow-md rounded-full overflow-hidden"
      >
        {/* Red circular background */}
        <circle cx="250" cy="235" r="235" fill="#EE3124" />

        {/* Elegant Gold traditional corners outside inner border */}
        {/* Inner Beaded Circle */}
        <circle cx="250" cy="235" r="190" stroke="#FFE600" strokeWidth="5" />
        <circle cx="250" cy="235" r="178" stroke="#FFE600" strokeWidth="2" strokeDasharray="6 5" />

        {/* Traditional general/emperor drawing profile facing right */}
        <g transform="translate(145, 95) scale(1.05)">
          {/* Emperor hat (Mũ cánh chuồn / Mũ triều đình) */}
          <path d="M105 10C105 10 95 15 80 20C75 10 50 15 45 35C40 50 60 65 75 65C85 65 95 62 105 58C110 58 115 50 120 40C125 30 115 15 105 10Z" fill="#FFE600" />
          {/* Plum/feather spike on Top of hat */}
          <path d="M100 12L85 -18L103 -13L112 8L100 12Z" fill="#FFE600" />
          <line x1="100" y1="12" x2="85" y2="-18" stroke="#EE3124" strokeWidth="2.5" />
          
          {/* Back panel of the traditional headpiece */}
          <path d="M115 25C130 20 145 35 140 50C135 60 120 62 112 58" fill="#FFE600" />

          {/* Head/Face profile looking to right */}
          <path d="M80 62C75 62 70 65 68 70C65 75 65 80 67 85C69 90 73 95 73 98C68 102 62 104 60 108C58 112 60 118 64 122C70 125 78 122 83 120C85 125 90 130 95 132C100 134 105 132 108 130" fill="#FFE600" />
          
          {/* Forehead, nose, lips silhouette details */}
          <path d="M103 58C103 62 110 68 110 72C110 75 105 78 108 82C110 85 116 87 114 91C112 94 106 94 104 98" stroke="#EE3124" strokeWidth="2.5" fill="none" />
          
          {/* Eye block */}
          <ellipse cx="94" cy="74" rx="6" ry="2.5" transform="rotate(-15 94 74)" fill="#EE3124" />
          <path d="M85 68C90 66 100 68 103 72" stroke="#EE3124" strokeWidth="3" strokeLinecap="round" fill="none" />

          {/* Mustache traditional curled design */}
          <path d="M102 85C110 85 115 88 118 94C115 96 110 94 106 91C104 93 104 96 102 98C100 95 101 90 102 85Z" fill="#EE3124" />
          <path d="M107 88C114 88 124 92 126 99C121 101 116 97 112 93" stroke="#EE3124" strokeWidth="2" strokeLinecap="round" fill="none" />

          {/* Long traditional Beard */}
          <path d="M96 100C96 100 98 115 104 125C108 130 112 120 110 112C105 108 100 102 96 100Z" fill="#EE3124" />
          <path d="M102 98C102 108 108 118 112 122" stroke="#EE3124" strokeWidth="2" />

          {/* Hair drapery back */}
          <path d="M72 65C62 75 60 90 62 105C64 110 68 110 68 105C66 95 70 80 76 70L72 65Z" fill="#EE3124" />

          {/* Neck and collar */}
          <path d="M80 110C83 115 86 122 88 130H100C101 122 102 115 104 110" fill="#FFE600" />
          
          {/* Armor robe */}
          <path d="M42 125C30 135 15 150 10 170H140C130 150 115 135 103 125C98 128 88 128 83 125C78 128 68 128 63 125C58 128 48 128 42 125Z" fill="#FFE600" />
          
          {/* Cross shoulder band garment line details */}
          <path d="M45 125L83 170" stroke="#EE3124" strokeWidth="3.5" />
          <path d="M100 125L60 170" stroke="#EE3124" strokeWidth="3.5" fill="none" />
          
          {/* Ancient shoulder armor plates */}
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

        {/* Traditional horizontal lines separating the URL */}
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

// Elegant line-art mushroom footer matching Screen 2, 3, 4, 5
const ElegantMushroomFooter = () => (
  <div className="absolute bottom-0 inset-x-0 h-24 opacity-20 pointer-events-none select-none z-0 overflow-hidden">
    <svg viewBox="0 0 360 100" className="w-full h-full stroke-[#EE3124] fill-none" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
      {/* Left mushroom cluster */}
      <path d="M40 95 C45 80, 50 70, 55 70 C60 70, 65 80, 70 95" />
      <path d="M30 70 C30 50, 80 50, 80 70 Z" />
      <path d="M40 70 C42 60, 68 60, 70 70" />
      <circle cx="45" cy="62" r="2" fill="#EE3124" stroke="none" />
      <circle cx="55" cy="58" r="3" fill="#EE3124" stroke="none" />
      <circle cx="65" cy="63" r="2.5" fill="#EE3124" stroke="none" />
      
      {/* Small mushroom left */}
      <path d="M25 95 C27 88, 30 85, 33 85 C36 85, 39 88, 41 95" />
      <path d="M20 85 C20 75, 48 75, 48 85 Z" />

      {/* Middle mushroom cluster (tall, central) */}
      <path d="M165 95 C170 75, 175 60, 180 60 C185 60, 190 75, 195 95" />
      <path d="M150 60 C150 35, 210 35, 210 60 Z" />
      <path d="M160 60 C165 48, 195 48, 200 60" />
      {/* Dots on cap */}
      <circle cx="170" cy="48" r="3" fill="#EE3124" stroke="none" />
      <circle cx="190" cy="46" r="4" fill="#EE3124" stroke="none" />
      <circle cx="180" cy="54" r="2.5" fill="#EE3124" stroke="none" />
      <circle cx="200" cy="53" r="2" fill="#EE3124" stroke="none" />
      <circle cx="160" cy="54" r="2" fill="#EE3124" stroke="none" />

      {/* Right mushroom cluster */}
      <path d="M290 95 C293 83, 297 75, 300 75 C303 75, 307 83, 310 95" />
      <path d="M280 75 C280 58, 320 58, 320 75 Z" />
      
      {/* Little grassy elements / ferns */}
      <path d="M95 95 C92 88, 88 85, 82 86 C88 88, 92 92, 95 95 Z" fill="#EE3124" stroke="none" className="opacity-60" />
      <path d="M100 95 C102 85, 106 80, 112 82 C106 86, 102 91, 100 95 Z" fill="#EE3124" stroke="none" className="opacity-60" />
      <path d="M260 95 C258 87, 254 84, 248 85 C254 87, 258 91, 260 95 Z" fill="#EE3124" stroke="none" className="opacity-60" />
      <path d="M265 95 C267 86, 271 81, 277 83 C271 87, 267 91, 265 95 Z" fill="#EE3124" stroke="none" className="opacity-60" />
    </svg>
  </div>
);

const formatPrice = (price: any): string => {
  const num = typeof price === 'number' ? price : parseFloat(price || '0');
  return new Intl.NumberFormat('vi-VN').format(Math.round(num)) + 'đ';
};

export default function CustomerOrderView() {
  const {
    tables,
    dishes,
    categories,
    startTableSession,
    placeCustomerOrder,
    sessions,
    orders,
    orderDetails,
    customers,
  } = useRestaurantStore();

  // QR Session states
  const [phoneNumber, setPhoneNumber] = useState('');
  const [tableId, setTableId] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    const hashParams = new URLSearchParams(window.location.hash.split('?')[1] || '');
    return params.get('tableId') || hashParams.get('tableId') || 'B04';
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

  // Dish choices
  const [dishNotes, setDishNotes] = useState('');

  // Submit Phone / Check in as Host
  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneNumber || phoneNumber.length < 9) {
      setErrorMessage('Số điện thoại không hợp lệ.');
      return;
    }

    const matchedCustomer = customers?.find(c => c.So_dien_thoai.trim() === phoneNumber.trim());
    let activeSess = null;

    if (matchedCustomer) {
      activeSess = sessions.find(s => s.Ma_khach_hang === matchedCustomer.Ma_khach_hang && s.Trang_thai === 'active');
    }

    if (!activeSess) {
      activeSess = sessions.find(s => s.Ma_ban === tableId && s.Trang_thai === 'active');
    }

    if (activeSess) {
      setTableId(activeSess.Ma_ban);
      setCurrentSessionCode(activeSess.Ma_phien_code);
      setActiveStep('menu');
      setErrorMessage('');
    } else {
      try {
        const generatedCode = await startTableSession(tableId, phoneNumber);
        setCurrentSessionCode(generatedCode);
        setActiveStep('menu');
        setErrorMessage('');
      } catch (err: any) {
        setErrorMessage(err.message || 'Mở bàn không thành công.');
      }
    }
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
    
    try {
      placeCustomerOrder(tableId, cart);
      setCart([]);
      setActiveStep('success');
    } catch (err: any) {
      alert(err.message || 'Đặt món không thành công.');
    }
  };

  const selectedDish = dishes.find(d => d.Ma_mon === selectedDishId);
  const activeCategoryDishes = (catId: string) => {
    if (catId === 'all') {
      return dishes;
    }
    return dishes.filter(d => d.Ma_danh_muc === catId);
  };

  // Sort and filter categories to show, adding "Tất cả" at the beginning
  const sortedCategories = [...categories]
    .filter(c => c.Trang_thai === 'Hiển thị')
    .sort((a, b) => (a.Thu_tu_hien_thi || 0) - (b.Thu_tu_hien_thi || 0));

  const allTab = { Ma_danh_muc: 'all', Ten_danh_muc: 'Tất cả', Thu_tu_hien_thi: 0, Trang_thai: 'Hiển thị' };
  const activeTabsCategories = [allTab, ...sortedCategories];
  const [selectedCatId, setSelectedCatId] = useState('all');

  // Load placed orders for tracking
  const placedSession = sessions.find(s => s.Ma_ban === tableId && s.Trang_thai === 'active');
  const placedOrdersDetails = orderDetails.filter(od => {
    const parent = orders.find(o => o.Ma_hd_dat_mon === od.Ma_hd_dat_mon);
    return parent && parent.Ma_phien === placedSession?.Ma_phien;
  });

  return (
    <div className="min-h-screen bg-[#FCFAF6] w-full flex flex-col justify-start font-sans overflow-x-hidden relative" id="customer-root-wrapper">
      
      {/* 100% Fully Responsive Viewport Container */}
      <div className="w-full flex-1 flex flex-col justify-between relative pb-16" id="customer-viewport">
        
        {/* Active view block */}
        <div className="flex-1 flex flex-col justify-between relative w-full">
          
          {/* SCREEN 13.1: PHONE / TABLE INITIAL SCAN (Screen 2: Chào mừng & Nhập bàn - Responsive Grid) */}
          {activeStep === 'phone' && (
            <div className="flex flex-col flex-1 overflow-y-auto bg-[#FCFAF6] relative z-10 animate-slide-up w-full" id="customer-phone-view">
              
              <ElegantMushroomFooter />

              <div className="w-full max-w-5xl mx-auto px-4 py-8 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8 lg:gap-16 z-10 flex-1 min-h-[calc(100vh-80px)]">
                
                {/* Left Presentation Panel: Logo, Welcome and Table Banner */}
                <div className="flex-1 space-y-6 text-center lg:text-left">
                  <div className="flex justify-center lg:justify-start">
                    <BrandLogo size={150} />
                  </div>
                  <div className="space-y-2">
                    <h2 className="text-3xl lg:text-4xl font-display font-black text-[#800F14] tracking-wide">
                      Chào mừng bạn!
                    </h2>
                    <p className="text-xs lg:text-sm text-gray-500 leading-relaxed max-w-md mx-auto lg:mx-0">
                      Cảm ơn bạn đã chọn Lẩu nấm Gia Khánh. Chúng tôi sẽ mang đến cho bạn trải nghiệm ẩm thực tươi ngon và đáng nhớ.
                    </p>
                  </div>

                  {/* Locked Table Card */}
                  <div className="bg-gradient-to-r from-[#800F14] to-[#EE3124] rounded-[24px] p-5 text-white flex items-center justify-between shadow-lg max-w-md mx-auto lg:mx-0 relative overflow-hidden">
                    <div className="flex items-center flex-1">
                      <div className="flex items-center space-x-2.5">
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-red-200 shrink-0">
                          <path d="M3 5h18v3H3z" />
                          <path d="M5 8v11" />
                          <path d="M19 8v11" />
                          <path d="M9 19v-7h6v7" />
                        </svg>
                        <div className="flex flex-col">
                          <span className="text-[8px] text-red-200/80 tracking-widest font-black uppercase">BÀN CỦA BẠN</span>
                          <span className="text-2xl font-black tracking-tight leading-none mt-0.5">{tableId}</span>
                        </div>
                      </div>

                      <div className="h-10 w-px bg-white/20 mx-5"></div>

                      <div className="flex items-center space-x-2.5">
                        <Users size={20} className="text-red-200 shrink-0" strokeWidth={2.5} />
                        <div className="flex flex-col">
                          <span className="text-[8px] text-red-200/80 tracking-widest font-black uppercase">SỐ KHÁCH</span>
                          <span className="text-[14px] font-bold mt-0.5 leading-none">4 người</span>
                        </div>
                      </div>
                    </div>

                    <div className="w-18 h-18 rounded-full border-2 border-white/30 overflow-hidden shadow-md shrink-0">
                      <img 
                        src="https://images.unsplash.com/photo-1547928500-4722f55cc829?w=300&auto=format&fit=crop&q=80" 
                        alt="Lẩu nấm" 
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>

                  <div className="text-[10px] lg:text-xs text-gray-450 flex items-center justify-center lg:justify-start space-x-1.5 py-1">
                    <span className="text-green-600 font-bold">✓</span>
                    <span>Thông tin bàn đã được xác nhận qua QR Code</span>
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
                  <button
                    onClick={() => {
                      setErrorMessage('');
                      setActiveStep('join_code');
                    }}
                    className="w-full text-xs text-[#EE3124] font-black tracking-wider text-center block pt-1 cursor-pointer uppercase hover:underline"
                  >
                    NHẬP MÃ THAM GIA CHUNG VỚI NGƯỜI CÙNG BÀN
                  </button>

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
            </div>
          )}

          {/* SCREEN 13.2: INPUT SHARE CODE */}
          {activeStep === 'join_code' && (
            <div className="flex flex-col justify-between h-full p-6 pt-10 bg-[#FCFAF6] relative z-10 animate-slide-up w-full min-h-[calc(100vh-80px)]" id="customer-join-view">
              <ElegantMushroomFooter />
              
              <div className="my-auto text-center space-y-6 relative z-10 max-w-md mx-auto w-full">
                <div className="flex justify-center">
                  <BrandLogo size={130} />
                </div>
                
                <div className="space-y-2">
                  <h3 className="text-xl font-display font-black text-[#800F14] uppercase tracking-wider">Nhập Mã Phiên</h3>
                  <p className="text-xs text-gray-505 max-w-xs mx-auto leading-relaxed">
                    Vui lòng nhập mã code gồm 4 chữ số từ chủ bàn để đồng bộ giỏ hàng và gọi món cùng nhau.
                  </p>
                </div>

                {errorMessage && (
                  <p className="p-2.5 bg-red-50 text-[#EE3124] text-xs rounded-xl border border-red-200 font-bold">{errorMessage}</p>
                )}

                <form onSubmit={handleJoinSubmit} className="space-y-4 max-w-[280px] mx-auto w-full">
                  <input
                    id="join-code-inp"
                    type="text"
                    required
                    maxLength={4}
                    className="w-full p-3 border border-gray-255 focus:border-[#EE3124] rounded-xl font-mono font-black text-center tracking-[0.4em] text-xl bg-white transition duration-150 uppercase"
                    placeholder="7X2B"
                    value={enteredCode}
                    onChange={e => setEnteredCode(e.target.value.toUpperCase())}
                  />

                  <button
                    id="btn-join-code"
                    type="submit"
                    className="w-full py-3.5 bg-[#EE3124] hover:bg-[#800F14] text-white font-black text-xs rounded-xl shadow-md active:scale-95 transition-all duration-150 cursor-pointer"
                  >
                    THAM GIA PHIÊN BÀN
                  </button>
                </form>

                <button
                  onClick={() => {
                    setErrorMessage('');
                    setActiveStep('phone');
                  }}
                  className="text-[10px] text-gray-500 hover:text-gray-800 block mx-auto font-black uppercase tracking-wider pt-2"
                >
                  ← Quay lại đăng nhập SĐT
                </button>
              </div>
            </div>
          )}

          {/* SCREEN 13.3: DYNAMIC BROWSING MENU (Responsive split layout) */}
          {activeStep === 'menu' && (
            <div className="flex flex-col h-full bg-[#FCFAF6] animate-slide-up relative z-10 w-full min-h-[calc(100vh-80px)]" id="customer-browsing-menu">
              
              {/* Header đỏ sẫm */}
              <div className="bg-[#800F14] text-white p-4 pt-4 flex justify-between items-center shrink-0 shadow-md">
                <div className="max-w-6xl mx-auto w-full flex justify-between items-center">
                  <div className="flex flex-col">
                    <span className="text-sm font-black tracking-wider uppercase font-display">BÀN ĂN: {tableId}</span>
                    <span className="text-[10px] text-white/70 mt-0.5">Chia sẻ mã: {currentSessionCode || phoneNumber || 'Chưa mở'}</span>
                  </div>
                  {placedOrdersDetails.length > 0 ? (
                    <button
                      onClick={() => setActiveStep('tracking')}
                      className="px-3.5 py-1.5 bg-white text-[#EE3124] text-[10px] font-black rounded-full active:scale-95 transition-all duration-150 cursor-pointer shadow-sm"
                    >
                      Đã đặt ({placedOrdersDetails.length})
                    </button>
                  ) : (
                    <span className="px-3 py-1 bg-white/10 text-white/50 text-[10px] font-bold rounded-full">Chưa đặt món</span>
                  )}
                </div>
              </div>

              {/* Main Workspace grid: Categories list + dishes cards */}
              <div className="w-full max-w-6xl mx-auto p-4 flex flex-col lg:flex-row gap-6 flex-1 items-start">
                
                {/* Categories Tabs (Sticky vertical sidebar on desktop, horizontal scroll on mobile) */}
                <div className="w-full lg:w-56 shrink-0 bg-white rounded-2xl p-2 border border-gray-150 sticky top-4 z-30 lg:flex lg:flex-col gap-1.5 overflow-x-auto lg:overflow-x-visible hide-scrollbar flex whitespace-nowrap">
                  {activeTabsCategories.map(cat => (
                    <button
                      key={cat.Ma_danh_muc}
                      onClick={() => setSelectedCatId(cat.Ma_danh_muc)}
                      className={`px-4 py-2.5 rounded-xl text-xs font-black transition cursor-pointer text-left active:scale-95 whitespace-nowrap ${
                        selectedCatId === cat.Ma_danh_muc
                          ? 'bg-[#EE3124] text-white shadow-sm'
                          : 'bg-transparent text-gray-500 hover:bg-gray-50'
                      }`}
                    >
                      {cat.Ten_danh_muc}
                    </button>
                  ))}
                </div>

                {/* Dishes list Grid */}
                <div className="flex-1 w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" id="guest-dishes-grid">
                  {activeCategoryDishes(selectedCatId).map(dish => {
                    const isOutOfStock = dish.Trang_thai === DishStatus.HET_MON || dish.Trang_thai === DishStatus.NGUNG_PHUC_VU;
                    
                    return (
                      <div
                        key={dish.Ma_mon}
                        className={`bg-white rounded-2xl border border-gray-150 p-4 flex space-x-3.5 shadow-2xs relative overflow-hidden transition-all duration-150 ${
                          isOutOfStock ? 'opacity-60' : 'hover:shadow-sm'
                        }`}
                      >
                        {/* Image */}
                        <div className="w-20 h-20 rounded-xl overflow-hidden border border-gray-100 bg-gray-55 shrink-0 shadow-inner">
                          <img
                            src={dish.Anh_mon}
                            alt={dish.Ten_mon}
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                        </div>

                        {/* Info & pricing */}
                        <div className="flex-1 flex flex-col justify-between min-w-0">
                          <div className="space-y-0.5">
                            <h4 className="font-black text-gray-805 text-sm truncate leading-tight">{dish.Ten_mon}</h4>
                            <p className="text-[10px] text-gray-400 line-clamp-2 leading-relaxed font-light">{dish.Mo_ta || 'Ngọt ngào thanh tịnh nấm rừng.'}</p>
                          </div>

                          <div className="flex justify-between items-center mt-1.5">
                            <span className="font-mono font-black text-sm text-[#EE3124]">{formatPrice(dish.Don_gia)}</span>
                            
                            {isOutOfStock ? (
                              <span className="px-2 py-0.5 bg-yellow-50 text-yellow-750 text-[8px] font-black uppercase rounded border border-yellow-200 animate-pulse">Tạm Hết</span>
                            ) : (
                              <button
                                onClick={() => {
                                  setSelectedDishId(dish.Ma_mon);
                                  setActiveStep('dish_detail');
                                }}
                                className="w-7 h-7 bg-[#EE3124] hover:bg-[#800F14] text-white rounded-full flex items-center justify-center shadow-md cursor-pointer hover:scale-105 active:scale-95 transition-all duration-150"
                              >
                                <Plus size={14} className="stroke-[3]" />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Floating Cart bottom checkout board (Only on mobile layout) */}
              <div className="lg:hidden absolute bottom-4 inset-x-4 bg-white border border-gray-150 p-3 rounded-2xl flex items-center justify-between z-40 shadow-lg animate-slide-up" id="phone-bottom-cart-bar">
                <div className="flex items-center space-x-2.5">
                  <div className="w-9 h-9 bg-red-50 text-[#EE3124] border border-red-100 rounded-xl flex items-center justify-center relative shadow-inner">
                    <ShoppingCart size={15} />
                    {cart.length > 0 && (
                      <span className="absolute -top-1.5 -right-1.5 bg-[#EE3124] text-white font-mono font-black text-[8px] w-4 h-4 rounded-full flex items-center justify-center border border-white">
                        {cart.reduce((sum, item) => sum + item.quantity, 0)}
                      </span>
                    )}
                  </div>
                  <div>
                    <span className="text-[7px] text-gray-400 font-black block uppercase tracking-wider">Giỏ hàng tạm</span>
                    <span className="text-xs font-mono font-black text-gray-800">{formatPrice(getCartTotal())}</span>
                  </div>
                </div>

                <button
                  id="btn-go-to-cart"
                  disabled={cart.length === 0}
                  onClick={() => setActiveStep('cart')}
                  className={`px-4 py-2 text-[10px] font-black rounded-xl tracking-wider transition cursor-pointer flex items-center space-x-1 uppercase active:scale-95 ${
                    cart.length > 0
                      ? 'bg-[#EE3124] text-white hover:bg-[#800F14] shadow-md'
                      : 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200/50'
                  }`}
                >
                  <span>Xem giỏ ({cart.length})</span>
                </button>
              </div>
            </div>
          )}

          {/* SCREEN 13.4: VIEW DETAIL DIETARY NOTES (Centered Modal overlay on Desktop, Full screen slide-up on mobile) */}
          {activeStep === 'dish_detail' && selectedDish && (
            <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 animate-fade-in" id="customer-dish-detail">
              <div className="bg-white rounded-[32px] max-w-lg w-full flex flex-col overflow-hidden shadow-2xl animate-slide-up relative max-h-[90vh]">
                
                {/* Visual Image */}
                <div className="w-full h-64 relative bg-gray-100 shrink-0">
                  <img
                    src={selectedDish.Anh_mon}
                    alt={selectedDish.Ten_mon}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  
                  {/* Floating back icon */}
                  <button
                    onClick={() => setActiveStep('menu')}
                    className="absolute top-4 left-4 w-9 h-9 bg-black/40 text-white rounded-full flex items-center justify-center cursor-pointer hover:bg-black/60 transition active:scale-95"
                  >
                    <ArrowLeft size={18} />
                  </button>
                  
                  <button
                    className="absolute top-4 right-4 w-9 h-9 bg-black/40 text-white rounded-full flex items-center justify-center cursor-pointer hover:bg-black/60 transition active:scale-95"
                  >
                    <Heart size={18} className="fill-transparent stroke-white" />
                  </button>
                </div>

                {/* Detail Content */}
                <div className="p-6 flex-1 space-y-4 overflow-y-auto">
                  <div>
                    <h3 className="font-display font-black text-gray-855 text-lg leading-tight">{selectedDish.Ten_mon}</h3>
                    <span className="text-base text-[#EE3124] font-mono font-black block mt-1">{formatPrice(selectedDish.Don_gia)}</span>
                    <p className="text-xs text-gray-450 font-light mt-2 leading-relaxed">{selectedDish.Mo_ta || 'Lẩu nấm kết hợp tinh tế cùng nấm rừng thanh mát.'}</p>
                  </div>

                  {/* Dietary note */}
                  <div className="space-y-2 pt-4 border-t border-gray-100">
                    <label className="block text-[10px] font-black text-gray-805 uppercase tracking-widest">GHI CHÚ YÊU CẦU MÓN</label>
                    <input
                      id="guest-dish-memo-inp"
                      type="text"
                      className="w-full px-3.5 py-3 border border-gray-250 focus:border-[#EE3124] rounded-xl text-xs bg-gray-50 focus:bg-white transition"
                      placeholder="VD: Không mặn, lấy thêm chanh..."
                      value={dishNotes}
                      onChange={e => setDishNotes(e.target.value)}
                    />
                  </div>
                </div>

                {/* Bottom buttons panel */}
                <div className="p-6 border-t border-gray-150 flex flex-col sm:flex-row gap-3 bg-white shrink-0">
                  <button
                    id="btn-add-to-cart-confirm"
                    onClick={() => addToCart(selectedDish.Ma_mon, 1, dishNotes)}
                    className="flex-1 py-3.5 bg-[#EE3124] hover:bg-[#800F14] text-white rounded-xl font-black text-xs tracking-wider shadow active:scale-95 transition cursor-pointer text-center flex items-center justify-center space-x-1.5 uppercase"
                  >
                    <ShoppingCart size={13} />
                    <span>THÊM VÀO GIỎ HÀNG</span>
                  </button>
                  <button
                    onClick={() => {
                      setSelectedDishId(null);
                      setActiveStep('menu');
                    }}
                    className="sm:w-28 py-3.5 border border-gray-250 text-gray-500 rounded-xl text-[10px] font-black hover:bg-gray-50 transition cursor-pointer text-center uppercase active:scale-95"
                  >
                    HỦY
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* SCREEN 13.5: CUSTOMER SHOPPING CART VIEW (Screen 6: Giỏ hàng tạm tính - Responsive Grid) */}
          {activeStep === 'cart' && (
            <div className="flex flex-col h-full bg-[#FCFAF6] animate-slide-up relative z-10 w-full min-h-[calc(100vh-80px)] pb-20" id="customer-cart-checkout">
              
              {/* Header trắng */}
              <div className="bg-white border-b border-gray-150 p-4 flex justify-between items-center shrink-0">
                <div className="max-w-5xl mx-auto w-full flex justify-between items-center">
                  <button
                    onClick={() => setActiveStep('menu')}
                    className="text-gray-650 hover:text-gray-955 active:scale-95 transition cursor-pointer"
                  >
                    <ArrowLeft size={18} />
                  </button>
                  <span className="text-sm font-black text-gray-805 uppercase tracking-wider font-display">Giỏ hàng tạm</span>
                  <button
                    onClick={() => setCart([])}
                    className="text-[10px] text-gray-400 hover:text-[#EE3124] font-black flex items-center space-x-1 active:scale-95 transition cursor-pointer uppercase"
                  >
                    <Trash2 size={12} />
                    <span>Xóa tất cả</span>
                  </button>
                </div>
              </div>

              {/* Main Cart Body */}
              <div className="w-full max-w-5xl mx-auto p-4 flex flex-col lg:flex-row gap-6 flex-1 items-start">
                
                {/* Left side: Cart Items List */}
                <div className="flex-1 w-full space-y-3.5">
                  {cart.length === 0 ? (
                    <div className="py-20 text-center text-gray-400 bg-white border border-gray-150 rounded-2xl italic text-xs w-full">
                      Giỏ hàng của bạn đang trống.
                    </div>
                  ) : (
                    <div className="space-y-3" id="cart-rows-wrap">
                      {cart.map(item => {
                        const dish = dishes.find(d => d.Ma_mon === item.dishId);
                        if (!dish) return null;
                        return (
                          <div key={item.dishId} className="flex space-x-3.5 p-3.5 rounded-2xl border border-gray-150 bg-white shadow-2xs relative">
                            
                            {/* Close delete button */}
                            <button
                              onClick={() => updateCartQty(item.dishId, -item.quantity)}
                              className="absolute top-2.5 right-2.5 text-gray-450 hover:text-gray-700 w-5 h-5 flex items-center justify-center font-bold text-sm cursor-pointer"
                            >
                              ×
                            </button>

                            {/* Image */}
                            <div className="w-14 h-14 rounded-xl overflow-hidden border border-gray-100 bg-gray-50 shrink-0">
                              <img
                                src={dish.Anh_mon}
                                alt={dish.Ten_mon}
                                className="w-full h-full object-cover"
                                referrerPolicy="no-referrer"
                              />
                            </div>

                            {/* Details */}
                            <div className="flex-1 flex flex-col justify-between min-w-0 pr-3.5">
                              <div>
                                <p className="font-black text-gray-805 text-xs truncate leading-tight">{dish.Ten_mon}</p>
                                {item.notes && (
                                  <p className="text-[9px] text-[#EE3124] italic mt-0.5 truncate font-medium">
                                    {item.notes}
                                  </p>
                                )}
                              </div>

                              {/* Qty panel and Price */}
                              <div className="flex justify-between items-center mt-1">
                                <div className="flex items-center space-x-2 bg-gray-50 border border-gray-200 rounded-lg p-0.5">
                                  <button
                                    onClick={() => updateCartQty(item.dishId, -1)}
                                    className="w-5 h-5 bg-white text-gray-600 rounded flex items-center justify-center border border-gray-200 active:scale-90 font-black text-xs cursor-pointer"
                                  >
                                    -
                                  </button>
                                  <span className="font-mono font-black text-gray-808 text-xs w-4 text-center">{item.quantity}</span>
                                  <button
                                    onClick={() => updateCartQty(item.dishId, 1)}
                                    className="w-5 h-5 bg-white text-gray-600 rounded flex items-center justify-center border border-gray-200 active:scale-90 font-black text-xs cursor-pointer"
                                  >
                                    +
                                  </button>
                                </div>
                                <span className="font-mono font-black text-xs text-[#EE3124]">{formatPrice(dish.Don_gia)}</span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Right side: Summary and checkout (Only if items exist) */}
                {cart.length > 0 && (
                  <div className="w-full lg:w-96 shrink-0 bg-white border border-gray-150 rounded-2xl p-6 shadow-2xs space-y-4 self-start">
                    {/* General note input */}
                    <div className="space-y-1.5">
                      <label className="block text-[9px] font-black text-gray-800 uppercase tracking-widest">Ghi chú chung cho bếp</label>
                      <input
                        id="guest-cart-memo-inp"
                        type="text"
                        className="w-full px-3.5 py-3 border border-gray-200 focus:border-[#EE3124] rounded-xl text-xs bg-gray-50 focus:bg-white transition"
                        placeholder="VD: Không mặn, thêm rau..."
                        value={dishNotes}
                        onChange={e => setDishNotes(e.target.value)}
                      />
                    </div>

                    {/* Sub totals */}
                    <div className="border-t border-gray-100 pt-3 flex justify-between items-center text-xs" id="billing-summary-block">
                      <span className="text-gray-450 font-bold uppercase tracking-wider text-[9px]">Tạm tính ({cart.reduce((sum, item) => sum + item.quantity, 0)} món)</span>
                      <span className="font-mono font-black text-sm text-[#EE3124]">{formatPrice(getCartTotal())}</span>
                    </div>

                    {/* Submit checkout button */}
                    <button
                      id="btn-place-order-confirm"
                      onClick={handleConfirmOrder}
                      className="w-full py-3.5 bg-[#EE3124] hover:bg-[#800F14] text-white font-black text-xs tracking-widest rounded-xl shadow cursor-pointer text-center flex items-center justify-center space-x-1.5 uppercase active:scale-95 transition duration-150"
                    >
                      <Send size={13} />
                      <span>GỬI ĐƠN HÀNG</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* SCREEN 13.6: SUCCESS & SESSION SHARING INFO (Screen 5: Đặt món thành công) */}
          {activeStep === 'success' && (
            <div className="flex flex-col justify-between h-full bg-[#FCFAF6] p-6 relative overflow-y-auto animate-slide-up text-center z-10 w-full min-h-[calc(100vh-80px)]" id="customer-success-splash">
              
              <ElegantMushroomFooter />

              <div className="my-auto space-y-6 relative z-10 pt-8 max-w-md mx-auto w-full">
                {/* Red tick circle */}
                <div className="w-16 h-16 bg-red-50 text-[#EE3124] rounded-full border border-red-100 flex items-center justify-center mx-auto shadow-inner">
                  <Check size={32} className="stroke-[3]" />
                </div>

                <div className="space-y-2">
                  <h2 className="text-xl font-display font-black text-[#800F14] uppercase tracking-wider">Đặt Món Thành Công!</h2>
                  <p className="text-xs text-gray-550 leading-relaxed max-w-[240px] mx-auto font-medium">
                    Đơn hàng của bạn đã được gửi tới Bếp Lẩu nấm Gia Khánh.
                  </p>
                </div>

                {/* Shared session code card */}
                <div className="bg-[#FCDEDF]/60 p-5 border border-[#F8D0D2]/50 rounded-2xl space-y-2.5 max-w-[280px] mx-auto shadow-2xs">
                  <span className="text-[9px] text-[#800F14] font-black uppercase tracking-wider block">MÃ PHIÊN CHIA SẺ CHO NGƯỜI CÙNG BÀN:</span>
                  <span className="font-mono text-2xl font-black text-[#800F14] tracking-widest">{currentSessionCode || '0987.654.321'}</span>
                  <p className="text-[9px] text-gray-500 leading-relaxed font-bold">
                    Người đi ăn cùng bàn có thể quét QR rồi điền mã này để chung giỏ hàng trực tuyến.
                  </p>
                </div>
              </div>

              {/* Two buttons */}
              <div className="pt-6 border-t border-gray-150 flex flex-col gap-2.5 relative z-10 shrink-0 pb-6 max-w-md mx-auto w-full">
                <button
                  onClick={() => setActiveStep('menu')}
                  className="w-full py-3.5 bg-[#EE3124] hover:bg-[#800F14] text-white font-black text-xs tracking-wider rounded-xl shadow cursor-pointer text-center uppercase active:scale-95 transition"
                >
                  TIẾP TỤC ĐẶT MÓN
                </button>
                <button
                  id="btn-go-to-tracking"
                  onClick={() => setActiveStep('tracking')}
                  className="w-full py-2.5 bg-white border border-gray-250 text-gray-505 hover:bg-gray-50 rounded-xl text-[10px] font-black cursor-pointer text-center uppercase active:scale-95 transition"
                >
                  THEO DÕI ĐƠN
                </button>
              </div>
            </div>
          )}

          {/* SCREEN 13.7: DETAILED REALTIME DISH LIST TRACKER (Screen 3: Trạng thái chế biến - Grid on Desktop) */}
          {activeStep === 'tracking' && (
            <div className="flex flex-col justify-between h-full bg-[#FCFAF6] animate-slide-up relative z-10 w-full min-h-[calc(100vh-80px)] pb-16" id="customer-order-tracking">
              
              {/* Header white with red text & red back icon */}
              <div className="bg-white border-b border-gray-150 p-4 flex items-center shrink-0 shadow-sm">
                <div className="max-w-5xl mx-auto w-full">
                  <button
                    onClick={() => setActiveStep('menu')}
                    className="flex items-center space-x-1.5 active:scale-95 transition cursor-pointer text-[#EE3124]"
                  >
                    <ArrowLeft size={18} className="stroke-[3]" />
                    <span className="text-xs font-black uppercase tracking-wider">Trạng thái chế biến</span>
                  </button>
                </div>
              </div>

              {/* Body container scroll */}
              <div className="w-full max-w-5xl mx-auto p-4 flex-1 overflow-y-auto space-y-4 pb-24">
                
                {/* List of ordered items grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {placedOrdersDetails.map((item, index) => {
                    const dish = dishes.find(d => d.Ma_mon === item.Ma_mon);
                    if (!dish) return null;
                    const steps = [OrderItemStatus.DANG_CHO, OrderItemStatus.DANG_CHE_BIEN, OrderItemStatus.DA_HOAN_THANH, OrderItemStatus.DA_PHUC_VU];
                    const stepIndex = steps.indexOf(item.Trang_thai_mon);
                    
                    return (
                      <div key={index} className="p-4 bg-white border border-gray-150 rounded-2xl space-y-4 shadow-2xs">
                        
                        {/* Title and Badge */}
                        <div className="flex justify-between items-start gap-2">
                          <div className="min-w-0 flex-1">
                            <p className="font-black text-gray-805 text-sm truncate leading-tight">{dish.Ten_mon}</p>
                            <p className="text-[10px] text-gray-400 mt-1 font-bold">Số lượng: x{item.So_luong}</p>
                            {item.Ghi_chu && (
                              <p className="text-[10px] text-[#EE3124] italic mt-1 font-semibold">
                                Yêu cầu: {item.Ghi_chu}
                              </p>
                            )}
                          </div>
                          <span className="font-mono text-[8px] font-black uppercase text-[#EE3124] bg-[#FCDEDF] border border-[#F8D0D2] px-2 py-0.5 rounded-lg shrink-0">
                            {item.Trang_thai_mon === OrderItemStatus.DA_PHUC_VU ? 'ĐÃ PHỤC VỤ' : item.Trang_thai_mon.toUpperCase()}
                          </span>
                        </div>

                        {/* Tracking timeline */}
                        <div className="flex items-center justify-between text-[8px] text-gray-400 font-bold pt-1">
                          {steps.map((step, sIdx) => {
                            const isPassed = sIdx < stepIndex;
                            const isCurrent = sIdx === stepIndex;
                            const isFuture = sIdx > stepIndex;
                            const stepNames = ['Đang chờ', 'Đang nấu', 'Hoàn thành', 'Bưng lên'];
                            
                            return (
                              <div key={step} className="flex-1 flex flex-col items-center relative">
                                {/* Connector line */}
                                {sIdx < steps.length - 1 && (
                                  <div className={`absolute top-1.5 left-1/2 w-full h-[2px] z-0 ${sIdx < stepIndex ? 'bg-[#EE3124]' : 'bg-gray-200'}`}></div>
                                )}
                                
                                {/* Circle representation */}
                                <div className={`w-3.5 h-3.5 rounded-full flex items-center justify-center border z-10 font-mono text-[8px] font-black ${
                                  isPassed ? 'bg-[#EE3124] text-white border-[#EE3124]' :
                                  isCurrent ? 'bg-[#EE3124] text-white border-[#EE3124] animate-pulse scale-110' :
                                  'bg-white text-gray-300 border-gray-200'
                                }`}>
                                  {isPassed ? '✓' : sIdx + 1}
                                </div>
                                
                                {/* Text label */}
                                <span className={`mt-1.5 font-sans text-[8px] ${!isFuture ? 'text-[#EE3124] font-black' : 'text-gray-455 font-light'}`}>
                                  {stepNames[sIdx]}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {placedOrdersDetails.length === 0 && (
                  <div className="py-20 text-center text-gray-450 bg-white border border-gray-150 rounded-2xl italic text-xs flex flex-col items-center justify-center space-y-2">
                    <Clock size={24} className="text-gray-300" />
                    <span>Chưa có món nào được thực hiện đặt trong phiên này.</span>
                  </div>
                )}
              </div>

              {/* Bottom buttons panel (Safe bottom fixed at max-w-5xl) */}
              <div className="px-4 pb-4 bg-transparent fixed left-0 right-0 z-30" style={{ bottom: '58px' }}>
                <div className="max-w-5xl mx-auto w-full">
                  <button
                    onClick={() => setActiveStep('menu')}
                    className="w-full py-3.5 bg-[#EE3124] hover:bg-[#800F14] text-white font-black text-xs tracking-wider rounded-xl shadow active:scale-95 transition cursor-center uppercase"
                  >
                    QUAY LẠI THỰC ĐƠN ĐỂ GỌI THÊM
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Global Bottom Tab navigation (Visible in all screens except welcome screens) */}
        {activeStep !== 'phone' && activeStep !== 'join_code' && activeStep !== 'dish_detail' && (
          <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-150 flex justify-between items-center py-3.5 text-gray-400 z-40" id="cart-bottom-navbar">
            <div className="max-w-md mx-auto w-full flex justify-between px-6">
              <button
                onClick={() => setActiveStep('menu')}
                className={`flex-1 flex flex-col items-center justify-center cursor-pointer ${
                  activeStep === 'menu' ? 'text-[#EE3124]' : 'text-gray-400 hover:text-gray-750'
                }`}
              >
                <BookOpen size={18} />
                <span className="text-[8px] font-black uppercase mt-1 leading-none">Thực đơn</span>
              </button>
              
              <button
                onClick={() => setActiveStep('cart')}
                className={`flex-1 flex flex-col items-center justify-center relative cursor-pointer ${
                  activeStep === 'cart' ? 'text-[#EE3124]' : 'text-gray-400 hover:text-gray-750'
                }`}
              >
                <ShoppingCart size={18} />
                <span className="text-[8px] font-black uppercase mt-1 leading-none">Giỏ hàng</span>
                {cart.length > 0 && (
                  <span className="absolute top-0 right-10 bg-[#EE3124] text-white text-[7.5px] font-bold w-4 h-4 rounded-full flex items-center justify-center border border-white">
                    {cart.reduce((sum, item) => sum + item.quantity, 0)}
                  </span>
                )}
              </button>
              
              <button
                onClick={() => setActiveStep('tracking')}
                className={`flex-1 flex flex-col items-center justify-center cursor-pointer ${
                  activeStep === 'tracking' ? 'text-[#EE3124]' : 'text-gray-400 hover:text-gray-750'
                }`}
              >
                <Clock size={18} />
                <span className="text-[8px] font-black uppercase mt-1 leading-none">Đơn hàng</span>
              </button>
            </div>
          </div>
        )}
        
      </div>
    </div>
  );
}
