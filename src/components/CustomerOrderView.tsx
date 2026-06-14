/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useRestaurantStore } from '../data/store';
import { DishStatus, OrderItemStatus } from '../types';
import GiaKhanhLogo from './GiaKhanhLogo';
import { Phone, Users, Plus, Minus, ShoppingCart, Check, Clock, ChevronRight, ArrowLeft, Send, CheckCircle, Info } from 'lucide-react';

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
    return params.get('tableId') || hashParams.get('tableId') || 'B03';
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
  const [dishSpicy, setDishSpicy] = useState('Bình thường (Mặn)');

  // Step 1: Submit Phone / Check in as Host (creates or joins session)
  const handlePhoneSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneNumber || phoneNumber.length < 9) {
      setErrorMessage('Số điện thoại không hợp lệ.');
      return;
    }

    // Seek matches in active sessions
    const matchedCustomer = customers?.find(c => c.So_dien_thoai.trim() === phoneNumber.trim());
    let activeSess = null;

    if (matchedCustomer) {
      activeSess = sessions.find(s => s.Ma_khach_hang === matchedCustomer.Ma_khach_hang && s.Trang_thai === 'active');
    }

    // Fallback: check if selected table has an active session
    if (!activeSess) {
      activeSess = sessions.find(s => s.Ma_ban === tableId && s.Trang_thai === 'active');
    }

    if (activeSess) {
      // Direct pass: enter the existing session
      setTableId(activeSess.Ma_ban);
      setCurrentSessionCode(activeSess.Ma_phien_code);
      setActiveStep('menu');
      setErrorMessage('');
    } else {
      // Fallback: create fresh active session on target table
      try {
        const generatedCode = startTableSession(tableId, phoneNumber);
        setCurrentSessionCode(generatedCode);
        setActiveStep('menu');
        setErrorMessage('');
      } catch (err: any) {
        setErrorMessage(err.message || 'Mở bàn không thành công.');
      }
    }
  };

  // Step 2: Join Existing Shared Session of table mates
  const handleJoinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!enteredCode) return;

    // Find session with this code
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

  // Confirm order (sends to Kitchen Kanban) - Screen 13.5
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
  const activeCategoryDishes = (catId: string) => dishes.filter(d => d.Ma_danh_muc === catId);

  // Filter categories to show
  const activeTabsCategories = categories.filter(c => c.Trang_thai === 'Hiển thị');
  const [selectedCatId, setSelectedCatId] = useState(activeTabsCategories[0]?.Ma_danh_muc || 'dm01');

  // Load placed orders for Bàn B03 tracking - Screen 13.6
  const placedSession = sessions.find(s => s.Ma_ban === tableId && s.Trang_thai === 'active');
  const placedOrdersDetails = orderDetails.filter(od => {
    const parent = orders.find(o => o.Ma_hd_dat_mon === od.Ma_hd_dat_mon);
    return parent && parent.Ma_phien === placedSession?.Ma_phien;
  });

  return (
    <div className="flex items-center justify-center p-0 md:p-4 bg-gray-50 flex-1 min-h-screen font-sans" id="qr-scrolling-container">
      {/* Smartphone container wrapper */}
      <div className="w-full h-full min-h-screen md:min-h-0 md:w-[375px] md:h-[780px] bg-white md:rounded-[40px] md:shadow-2xl md:border-[10px] md:border-black overflow-hidden relative flex flex-col select-none" id="phone-shell">
        
        {/* Smartphone top ear-piece / notch */}
        <div className="absolute top-0 inset-x-0 h-6 bg-black hidden md:flex justify-center items-center z-50">
          <div className="w-24 h-3 bg-gray-800 rounded-full"></div>
        </div>

        {/* Dynamic header / back action */}
        {activeStep !== 'phone' && activeStep !== 'join_code' && (
          <div className="bg-[#800F14] text-white pt-4 md:pt-8 px-4 pb-3 flex items-center justify-between border-b border-red-900 shrink-0 z-40" id="phone-app-header">
            <div className="flex items-center space-x-2">
              {activeStep === 'menu' ? (
                <div className="flex flex-col">
                  <span className="text-xs text-[#E5BA73] font-bold">BÀN ĂN: {tableId}</span>
                  <span className="text-[9px] text-gray-300 font-mono">Chia sẻ mã: {currentSessionCode}</span>
                </div>
              ) : (
                <button onClick={() => {
                  if (activeStep === 'success' || activeStep === 'tracking') {
                    setActiveStep('menu');
                  } else {
                    setActiveStep('menu');
                  }
                }} className="text-[#E5BA73] hover:text-white flex items-center space-x-1 font-semibold text-xs cursor-pointer">
                  <ArrowLeft size={14} />
                  <span>Quay lại</span>
                </button>
              )}
            </div>

            {/* Step specific header details */}
            <div className="text-right">
              {activeStep === 'menu' && (
                <button
                  onClick={() => setActiveStep('tracking')}
                  className="px-2 py-1 bg-red-900 border border-red-800 rounded text-[9px] font-bold text-[#E5BA73] flex items-center space-x-1"
                >
                  <Clock size={10} className="animate-pulse" />
                  <span>Đã đặt ({placedOrdersDetails.length})</span>
                </button>
              )}
            </div>
          </div>
        )}

        {/* PHONE CASING INNER SCREEN */}
        <div className="flex-1 overflow-y-auto bg-gray-50 flex flex-col relative" id="phone-screen-body">

          {/* SCREEN 13.1: PHONE / TABLE INITIAL SCAN */}
          {activeStep === 'phone' && (
            <div className="flex flex-col justify-between h-full p-6 pt-10 md:pt-16 bg-white" id="customer-phone-view">
              <div className="text-center my-auto space-y-6">
                {/* Gold Crest Logo */}
                <div className="flex justify-center">
                  <GiaKhanhLogo size={120} />
                </div>

                <div className="space-y-1">
                  <h2 className="text-xl font-display font-extrabold text-gray-800">Chào mừng bạn!</h2>
                  <p className="text-xs text-gray-500 leading-relaxed max-w-xs mx-auto">Vui lòng chọn bàn ăn vật lý và cung cấp SĐT để mở thực đơn ăn nấm.</p>
                </div>

                {errorMessage && (
                  <p className="p-3 bg-red-50 text-red-800 text-[11px] rounded-lg border border-red-100 font-semibold">{errorMessage}</p>
                )}

                <form onSubmit={handlePhoneSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <label className="block text-[10px] font-bold text-gray-450 uppercase mb-1.5 text-left">Bàn ăn quét QR *</label>
                      <select
                        id="table-sim-select"
                        className="w-full p-2.5 rounded-lg border border-gray-250 bg-white"
                        value={tableId}
                        onChange={e => setTableId(e.target.value)}
                      >
                        {tables.map(t => (
                          <option key={t.Ma_ban} value={t.Ma_ban}>Bàn {t.Ma_ban} (Tầng {t.Tang})</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-gray-450 uppercase mb-1.5 text-left">Số điện thoại *</label>
                      <input
                        id="cust-phone-inp"
                        type="tel"
                        required
                        className="w-full p-2.5 rounded-lg border border-gray-250 font-mono font-bold text-center bg-gray-50"
                        placeholder="Vd: 0912345678"
                        value={phoneNumber}
                        onChange={e => setPhoneNumber(e.target.value)}
                      />
                    </div>
                  </div>

                  <button
                    id="btn-guest-submit"
                    type="submit"
                    className="w-full py-3 bg-brand-red hover:bg-brand-red-dark text-white rounded-xl text-xs font-black tracking-wide shadow-md cursor-pointer"
                  >
                    MỞ THỰC ĐƠN / ĐẶT MÓN
                  </button>
                </form>

                {/* Shared session block link */}
                <button
                  id="tab-join-session"
                  onClick={() => {
                    setErrorMessage('');
                    setActiveStep('join_code');
                  }}
                  className="text-xs text-brand-red hover:underline block mx-auto font-bold uppercase tracking-wider"
                >
                  Nhập mã tham gia chung với người cùng bàn
                </button>
              </div>

              <div className="text-[9px] text-gray-400 text-center uppercase tracking-widest mt-8">
                Lẩu Nấm Gia Khánh • 67 Vũ Phạm Hàm, Hà Nội
              </div>
            </div>
          )}

          {/* SCREEN 13.2: INPUT SHARE CODE */}
          {activeStep === 'join_code' && (
            <div className="flex flex-col justify-between h-full p-6 pt-10 md:pt-16 bg-white" id="customer-join-view">
              <div className="my-auto text-center space-y-6">
                <Users size={40} className="text-brand-red mx-auto animate-bounce" />
                
                <div className="space-y-1">
                  <h3 className="text-lg font-display font-black text-gray-800">Nhập Mã Phiên</h3>
                  <p className="text-xs text-gray-500 max-w-xs mx-auto">Vui lòng nhập mã code gồm 4 chữ số từ chủ bàn để đồng bộ giỏ hàng và đặt món cùng nhau.</p>
                </div>

                {errorMessage && (
                  <p className="p-3 bg-red-50 text-red-800 text-[11px] rounded-lg border border-red-100 font-semibold">{errorMessage}</p>
                )}

                <form onSubmit={handleJoinSubmit} className="space-y-3.5">
                  <input
                    id="join-code-inp"
                    type="text"
                    required
                    maxLength={4}
                    className="w-full p-3 border border-gray-200 rounded-xl font-mono font-black text-center tracking-widest text-lg bg-gray-50"
                    placeholder="7X2B"
                    value={enteredCode}
                    onChange={e => setEnteredCode(e.target.value.toUpperCase())}
                  />

                  <button
                    id="btn-join-code"
                    type="submit"
                    className="w-full py-3 bg-brand-red text-white font-bold text-xs rounded-xl shadow-md cursor-pointer"
                  >
                    THAM GIA PHIÊN BÀN
                  </button>
                </form>

                <button
                  onClick={() => {
                    setErrorMessage('');
                    setActiveStep('phone');
                  }}
                  className="text-xs text-gray-400 hover:text-gray-800 block mx-auto font-medium"
                >
                  Quay lại đăng nhập SĐT
                </button>
              </div>
            </div>
          )}

          {/* SCREEN 13.3: DYNAMIC BROWSING MENU */}
          {activeStep === 'menu' && (
            <div className="flex flex-col h-full bg-gray-50 pb-20" id="customer-browsing-menu">
              {/* Category tabs */}
              <div className="bg-white flex space-x-1.5 p-2 overflow-x-auto border-b border-gray-150 sticky top-0 z-30 shrink-0" id="guest-category-scroll">
                {activeTabsCategories.map(cat => (
                  <button
                    key={cat.Ma_danh_muc}
                    onClick={() => setSelectedCatId(cat.Ma_danh_muc)}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition cursor-pointer ${
                      selectedCatId === cat.Ma_danh_muc
                        ? 'bg-brand-red text-white'
                        : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                    }`}
                  >
                    {cat.Ten_danh_muc}
                  </button>
                ))}
              </div>

              {/* Dishes in selected category */}
              <div className="p-4 space-y-3 flex-1" id="guest-dishes-grid">
                {activeCategoryDishes(selectedCatId).map(dish => {
                  const isOutOfStock = dish.Trang_thai === DishStatus.HET_MON || dish.Trang_thai === DishStatus.NGUNG_PHUC_VU;
                  
                  return (
                    <div
                      key={dish.Ma_mon}
                      className={`bg-white rounded-xl border border-gray-150 p-3 flex space-x-3 shadow-xs relative overflow-hidden transition hover:shadow ${
                        isOutOfStock ? 'opacity-60' : 'group'
                      }`}
                    >
                      {/* Image */}
                      <div className="w-20 h-20 rounded-lg overflow-hidden border border-gray-100 bg-gray-100 shrink-0 shadow-inner">
                        <img
                          src={dish.Anh_mon}
                          alt={dish.Ten_mon}
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      </div>

                      {/* Info & pricing */}
                      <div className="flex-1 flex flex-col justify-between min-w-0">
                        <div>
                          <h4 className="font-bold text-gray-850 text-xs truncate">{dish.Ten_mon}</h4>
                          <p className="text-[10px] text-gray-400 mt-1 truncate max-w-[180px] font-light">{dish.Mo_ta || 'Ngọt ngào thanh tịnh nấm rừng.'}</p>
                        </div>

                        <div className="flex justify-between items-end mt-1.5">
                          <span className="font-mono font-bold text-xs text-brand-red">{dish.Don_gia.toLocaleString()}đ</span>
                          
                          {isOutOfStock ? (
                            <span className="px-2 py-0.5 bg-yellow-50 text-yellow-700 text-[8px] font-bold uppercase rounded border border-yellow-200 animate-pulse">Tạm Hết</span>
                          ) : (
                            <button
                              onClick={() => {
                                setSelectedDishId(dish.Ma_mon);
                                setActiveStep('dish_detail');
                              }}
                              className="w-7 h-7 bg-brand-red group-hover:bg-brand-red-dark text-white rounded-full flex items-center justify-center shadow-md cursor-pointer hover:scale-105"
                            >
                              <Plus size={14} />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Floating Cart bottom checkout board */}
              <div className="absolute bottom-0 inset-x-0 bg-white border-t border-gray-150 p-3 pb-6 md:pb-3 flex items-center justify-between z-40 shadow-xl" id="phone-bottom-cart-bar">
                <div className="flex items-center space-x-2">
                  <div className="w-10 h-10 bg-red-50 text-brand-red border border-red-100 rounded-xl flex items-center justify-center relative">
                    <ShoppingCart size={16} />
                    {cart.length > 0 && (
                      <span className="absolute -top-1.5 -right-1.5 bg-red-600 text-white font-mono font-bold text-[9px] w-4 h-4 rounded-full flex items-center justify-center border border-white">
                        {cart.reduce((sum, item) => sum + item.quantity, 0)}
                      </span>
                    )}
                  </div>
                  <div>
                    <span className="text-[8px] text-gray-400 font-bold block uppercase">Giỏ hàng tạm</span>
                    <span className="text-xs font-mono font-bold text-gray-800">{getCartTotal().toLocaleString()}đ</span>
                  </div>
                </div>

                <button
                  id="btn-go-to-cart"
                  disabled={cart.length === 0}
                  onClick={() => setActiveStep('cart')}
                  className={`px-4 py-2 text-xs font-bold rounded-lg tracking-wide transition cursor-pointer flex items-center space-x-1 ${
                    cart.length > 0
                      ? 'bg-brand-red text-white hover:bg-brand-red-dark shadow'
                      : 'bg-gray-100 text-gray-400 cursor-not-allowed shadow-none'
                  }`}
                >
                  <span>Mục giỏ ({cart.length})</span>
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          )}

          {/* SCREEN 13.4: VIEW DETAIL DIETARY NOTES */}
          {activeStep === 'dish_detail' && selectedDish && (
            <div className="flex flex-col justify-between h-full bg-white p-5" id="customer-dish-detail">
              <div className="space-y-4">
                {/* Visual Image */}
                <div className="w-full aspect-video rounded-xl overflow-hidden border border-gray-100 bg-gray-50 shadow-inner">
                  <img
                    src={selectedDish.Anh_mon}
                    alt={selectedDish.Ten_mon}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>

                <div>
                  <h3 className="font-display font-black text-gray-850 text-base">{selectedDish.Ten_mon}</h3>
                  <span className="text-xs text-brand-red font-mono font-bold block mt-1">{selectedDish.Don_gia.toLocaleString()}đ</span>
                  <p className="text-xs text-gray-500 font-light mt-1.5">{selectedDish.Mo_ta || 'Ủ trọn thanh thản nấm tự nhiên ngọt ngọt.'}</p>
                </div>

                {/* Spicy options selection */}
                <div className="space-y-2 pt-3 border-t border-gray-100">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">Lựa chọn chế biến</span>
                  <div className="grid grid-cols-3 gap-2">
                    {['Bình thường', 'Ít cay', 'Không hành'].map(opt => (
                      <button
                        key={opt}
                        onClick={() => setDishSpicy(opt)}
                        className={`py-1.5 border rounded-lg text-xs font-semibold text-center transition cursor-pointer ${
                          dishSpicy === opt ? 'bg-red-50 border-brand-red text-brand-red' : 'border-gray-200 text-gray-500 hover:bg-gray-50'
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Dietary note */}
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Ghi chú yêu cầu món</label>
                  <input
                    id="guest-dish-memo-inp"
                    type="text"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs"
                    placeholder="Vd: Không mặn, lấy thêm chanh..."
                    value={dishNotes}
                    onChange={e => setDishNotes(e.target.value)}
                  />
                </div>
              </div>

              {/* Trigger add to basket */}
              <div className="pt-6 border-t border-gray-100 flex items-center gap-3">
                <button
                  id="btn-add-to-cart-confirm"
                  onClick={() => addToCart(selectedDish.Ma_mon, 1, `${dishSpicy !== 'Bình thường' ? dishSpicy : ''}${dishNotes ? (dishSpicy !== 'Bình thường' ? ', ' : '') + dishNotes : ''}`)}
                  className="flex-1 py-3 bg-brand-red hover:bg-brand-red-dark text-white rounded-xl font-bold text-xs tracking-wide shadow cursor-pointer text-center"
                >
                  THÊM VÀO GIỎ HÀNG
                </button>
                <button
                  onClick={() => setActiveStep('menu')}
                  className="px-3.5 py-3 border border-gray-250 text-gray-600 rounded-xl text-xs font-bold hover:bg-gray-100 cursor-pointer text-center"
                >
                  HỦY
                </button>
              </div>
            </div>
          )}

          {/* SCREEN 13.5: CUSTOMER SHOPPING CART VIEW */}
          {activeStep === 'cart' && (
            <div className="flex flex-col justify-between h-full bg-white p-5" id="customer-cart-checkout">
              <div className="space-y-4 flex-1 overflow-y-auto">
                <h3 className="font-display font-black text-gray-800 text-sm uppercase tracking-wide flex items-center space-x-1.5 border-b border-gray-105 pb-3">
                  <ShoppingCart size={16} className="text-brand-red" />
                  <span>Xác Nhận Đơn Món Ăn</span>
                </h3>

                {/* Map current cart items */}
                <div className="space-y-3 text-xs" id="cart-rows-wrap">
                  {cart.map(item => {
                    const dish = dishes.find(d => d.Ma_mon === item.dishId)!;
                    return (
                      <div key={item.dishId} className="flex justify-between items-center p-2.5 rounded-xl border border-gray-100 bg-gray-50/50">
                        <div className="flex-1 pr-4 min-w-0">
                          <p className="font-bold text-gray-800 truncate">{dish.Ten_mon}</p>
                          <p className="text-[10px] text-brand-red font-mono mt-0.5">{dish.Don_gia.toLocaleString()}đ</p>
                          {item.notes && <p className="text-[9px] text-gray-400 mt-1 max-w-[180px] bg-white px-1.5 py-0.5 rounded border border-gray-100 truncate inline-block">Chế biến: {item.notes}</p>}
                        </div>

                        {/* Adjust qty panel */}
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => updateCartQty(item.dishId, -1)}
                            className="w-5 h-5 bg-gray-100 text-gray-500 rounded flex items-center justify-center border border-gray-200"
                          >
                            <Minus size={11} />
                          </button>
                          <span className="font-mono font-bold text-gray-800 w-5 text-center">{item.quantity}</span>
                          <button
                            onClick={() => updateCartQty(item.dishId, 1)}
                            className="w-5 h-5 bg-gray-100 text-gray-400 rounded flex items-center justify-center border border-gray-200"
                          >
                            <Plus size={11} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Sub totals */}
                <div className="border-t border-gray-100 pt-3 space-y-2 text-xs" id="billing-summary-block">
                  <div className="flex justify-between text-gray-500">
                    <span>Cộng tiền hàng</span>
                    <span className="font-mono">{getCartTotal().toLocaleString()}đ</span>
                  </div>
                  <div className="flex justify-between text-gray-500">
                    <span>Phí phục vụ nước lẩu (5%)</span>
                    <span className="font-mono">{Math.round(getCartTotal() * 0.05).toLocaleString()}đ</span>
                  </div>
                  <div className="flex justify-between text-brand-red font-bold text-sm pt-2 border-t border-dashed border-gray-100">
                    <span>TỔNG ĐẶT MÓN TẠM TÍNH</span>
                    <span className="font-mono">{Math.round(getCartTotal() * 1.05).toLocaleString()}đ</span>
                  </div>
                </div>

                <div className="bg-amber-50 p-3 rounded-xl border border-amber-150 text-[10px] text-amber-800 flex items-start space-x-1.5">
                  <Info size={14} className="shrink-0 mt-0.5" />
                  <span>Món đặt được chuyển trực tiếp tới màn hình phụ bếp để tiến hành chế biến nhanh chóng.</span>
                </div>
              </div>

              {/* Confirm submit values */}
              <div className="pt-6 border-t border-gray-200">
                <button
                  id="btn-place-order-confirm"
                  onClick={handleConfirmOrder}
                  className="w-full py-3 bg-brand-red hover:bg-brand-red-dark text-white font-extrabold text-xs tracking-wider rounded-xl shadow cursor-pointer text-center flex items-center justify-center space-x-1.5"
                >
                  <Send size={13} />
                  <span>XÁC NHẬN ĐẶT MÓN ĂN</span>
                </button>
              </div>
            </div>
          )}

          {/* SCREEN 13.6: SUCCESS & SESSION SHARING INFO */}
          {activeStep === 'success' && (
            <div className="flex flex-col justify-between h-full bg-white p-6 pt-12 text-center" id="customer-success-splash">
              <div className="my-auto space-y-6">
                <div className="w-16 h-16 bg-green-50 text-green-600 rounded-full border border-green-150 flex items-center justify-center mx-auto shadow-inner">
                  <Check size={32} className="animate-pulse" />
                </div>

                <div className="space-y-1.5">
                  <h2 className="text-xl font-display font-black text-gray-800">Đặt Món Thành Công!</h2>
                  <p className="text-xs text-gray-400">Đơn hàng của bạn đã gửi tới Bếp Lẩu nấm Gia Khánh.</p>
                </div>

                {/* Codes segment */}
                <div className="bg-blue-50/50 p-4 border border-blue-150 rounded-2xl space-y-2.5 max-w-[280px] mx-auto">
                  <span className="text-[10px] text-blue-900/60 font-bold uppercase tracking-wider block">Mã phiên chia sẻ cho người cùng bàn:</span>
                  <span className="font-mono text-2xl font-black text-blue-700 tracking-widest">{currentSessionCode}</span>
                  <p className="text-[9px] text-blue-800 font-light leading-relaxed">Người đi ăn cùng bàn có thể quét QR rồi điền mã này để chung giỏ hàng trực tuyến.</p>
                </div>
              </div>

              <div className="pt-6 border-t border-gray-100 flex gap-2">
                <button
                  onClick={() => setActiveStep('menu')}
                  className="flex-1 py-3 border border-gray-250 text-gray-600 rounded-xl text-xs font-bold hover:bg-gray-100 cursor-pointer"
                >
                  TIẾP TỤC ĐẶT MÓN
                </button>
                <button
                  id="btn-go-to-tracking"
                  onClick={() => setActiveStep('tracking')}
                  className="flex-1 py-3 bg-brand-red hover:bg-brand-red-dark text-white rounded-xl font-bold text-xs cursor-pointer"
                >
                  THEO DÕI ĐƠN
                </button>
              </div>
            </div>
          )}

          {/* EXTRA: DETAILED REALTIME DISH LIST TRACKER */}
          {activeStep === 'tracking' && (
            <div className="flex flex-col justify-between h-full bg-white p-5" id="customer-order-tracking">
              <div className="space-y-4 flex-1 overflow-y-auto">
                <h3 className="font-display font-black text-gray-800 text-sm uppercase tracking-widest flex items-center space-x-1.5 border-b border-gray-105 pb-3">
                  <Clock size={16} className="text-brand-red" />
                  <span>Trạng Thái Chế Biến</span>
                </h3>

                <div className="space-y-2.5 text-xs">
                  {placedOrdersDetails.map((item, index) => {
                    const dish = dishes.find(d => d.Ma_mon === item.Ma_mon)!;
                    const steps = [OrderItemStatus.DANG_CHO, OrderItemStatus.DANG_CHE_BIEN, OrderItemStatus.DA_HOAN_THANH, OrderItemStatus.DA_PHUC_VU];
                    const stepIndex = steps.indexOf(item.Trang_thai_mon);
                    
                    return (
                      <div key={index} className="p-3 bg-gray-50 border border-gray-150 rounded-xl space-y-3.5 shadow-2xs">
                        <div className="flex justify-between items-start">
                          <div className="min-w-0 pr-3">
                            <p className="font-bold text-gray-800 truncate">{dish.Ten_mon}</p>
                            <p className="text-[10px] text-gray-400 mt-0.5">Số lượng: x{item.So_luong}</p>
                            {item.Ghi_chu && <p className="text-[9px] text-brand-red italic mt-0.5">Yêu cầu: {item.Ghi_chu}</p>}
                          </div>
                          <span className="font-mono text-[9px] font-black uppercase text-gray-500 bg-white border px-1.5 py-0.5 rounded">
                            {item.Trang_thai_mon}
                          </span>
                        </div>

                        {/* Order status step timeline */}
                        <div className="flex items-center justify-between text-[8px] text-gray-400 font-bold pt-1">
                          {steps.map((step, sIdx) => {
                            const isActive = sIdx <= stepIndex;
                            const isCurrent = sIdx === stepIndex;
                            const stepNames = ['Đang chờ', 'Đang nấu', 'Hoàn thành', 'Bưng lên'];
                            return (
                              <div key={step} className="flex-1 flex flex-col items-center relative">
                                {sIdx < steps.length - 1 && (
                                  <div className={`absolute top-1.5 left-1/2 w-full h-0.5 z-0 ${sIdx < stepIndex ? 'bg-green-500' : 'bg-gray-250'}`}></div>
                                )}
                                <div className={`w-3.5 h-3.5 rounded-full flex items-center justify-center border z-10 font-mono text-[8px] font-black ${
                                  isCurrent ? 'bg-[#EE3124] text-white border-[#EE3124] animate-pulse scale-[1.15]' :
                                  isActive ? 'bg-green-500 text-white border-green-500' :
                                  'bg-white text-gray-400 border-gray-200'
                                }`}>
                                  {isActive && sIdx !== stepIndex ? '✓' : sIdx + 1}
                                </div>
                                <span className={`mt-1 font-sans ${isActive ? 'text-gray-700 font-extrabold' : 'text-gray-400 font-light'}`}>
                                  {stepNames[sIdx]}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}

                  {placedOrdersDetails.length === 0 && (
                    <div className="py-10 text-center text-gray-400 italic">
                      Chưa có món nào được thực hiện đặt trong phiên này.
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-6 border-t border-gray-100">
                <button
                  onClick={() => setActiveStep('menu')}
                  className="w-full py-2.5 bg-brand-red text-white font-bold text-xs rounded-xl cursor-pointer text-center"
                >
                  QUAY LẠI THỰC ĐƠN ĐỂ GỌI THÊM
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
