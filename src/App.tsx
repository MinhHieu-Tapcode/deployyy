/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useRestaurantStore } from './data/store';
import { UserRole } from './types';
import LoginView from './components/LoginView';
import { ToastContainer } from './components/SharedUI';
import GiaKhanhLogo from './components/GiaKhanhLogo';
import DashboardView from './components/DashboardView';
import AccountView from './components/AccountView';
import MenuView from './components/MenuView';
import RecipeView from './components/RecipeView';
import CategoryView from './components/CategoryView';
import MaterialCalcView from './components/MaterialCalcView';
import WarehouseView from './components/WarehouseView';
import ReceptionLayout from './components/ReceptionLayout';
import WaiterDashboard from './components/WaiterDashboard';
import CustomerOrderView from './components/CustomerOrderView';
import KitchenKanban from './components/KitchenKanban';
import {
  LayoutDashboard,
  Users2,
  Utensils,
  BookOpen,
  Boxes,
  ShieldCheck,
  TrendingUp,
  MapPin,
  QrCode,
  Flame,
  User,
  LogOut,
  Sparkles,
  Calculator
} from 'lucide-react';

export default function App() {
  const { currentUser, logout, logSystemAction, toasts, removeToast } = useRestaurantStore();
  
  // Check if we are in customer view mode
  const isCustomerMode = 
    window.location.pathname === '/customer' || 
    window.location.search.includes('view=customer') || 
    window.location.hash === '#/customer' ||
    window.location.hash.startsWith('#/customer?');

  if (isCustomerMode) {
    return (
      <div className="min-h-screen bg-[#FDFBF7] flex flex-col font-sans" id="app-cabinet">
        <CustomerOrderView />
        <ToastContainer toasts={toasts} onRemove={removeToast} />
      </div>
    );
  }

  // View navigation state
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  
  // Recipe sub-view state
  const [selectedRecipeDishId, setSelectedRecipeDishId] = useState<string | null>(null);

  // If there is no user logged in, render the login screen (Screen 01)
  if (!currentUser) {
    return <LoginView />;
  }

  // Handle auto route checks based on staff role access gates (BR12)
  const isAllAccess = currentUser.Vai_tro === UserRole.QUAN_LY;
  const isReception = currentUser.Vai_tro === UserRole.LE_TAN;
  const isKitchen = currentUser.Vai_tro === UserRole.BEP;
  const isWarehouse = currentUser.Vai_tro === UserRole.KHO;
  const isWaiter = currentUser.Vai_tro === UserRole.PHUC_VU;

  // Set default tabs based on role permissions
  let finalDefaultTab = activeTab;
  if (isReception && activeTab !== 'reception') {
    finalDefaultTab = 'reception';
  } else if (isKitchen && activeTab !== 'kitchen') {
    finalDefaultTab = 'kitchen';
  } else if (isWarehouse && activeTab !== 'warehouse_mgmt') {
    finalDefaultTab = 'warehouse_mgmt';
  } else if (isWaiter && activeTab !== 'reception') {
    finalDefaultTab = 'reception';
  } else if (isAllAccess && !['dashboard', 'reception', 'kitchen', 'warehouse_mgmt', 'menu', 'categories', 'calc', 'accounts'].includes(activeTab)) {
    finalDefaultTab = 'dashboard';
  }

  // Menu Tabs definitions
  const allTabs = [
    { id: 'dashboard', name: 'Dashboard Tổng Quan', icon: LayoutDashboard, visible: isAllAccess },
    { id: 'reception', name: isWaiter ? 'Màn hình Phục vụ' : 'Sơ đồ Bàn / Lễ Tân', icon: MapPin, visible: isAllAccess || isReception || isWaiter },
    { id: 'kitchen', name: 'Bếp / Kanban Queue', icon: Flame, visible: isAllAccess || isKitchen },
    { id: 'warehouse_mgmt', name: 'Kho & Nguyên Vật Liệu', icon: Boxes, visible: isAllAccess || isWarehouse },
    { id: 'menu', name: 'Thực Đơn & Món Ăn', icon: Utensils, visible: isAllAccess },
    { id: 'categories', name: 'Danh Mục Thực Đơn', icon: BookOpen, visible: isAllAccess },
    { id: 'calc', name: 'Tra Cứu Nhu Cầu NVL', icon: Calculator, visible: isAllAccess },
    { id: 'accounts', name: 'Chốt Quyền Nhân Viên', icon: Users2, visible: isAllAccess },
  ];

  const handleLogoutClick = () => {
    logout();
    setSelectedRecipeDishId(null);
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] flex flex-col font-sans" id="app-cabinet">
      {/* GLOBAL HEADER BAR */}
      <header className="bg-white text-gray-800 border-b-2 border-brand-gold px-6 py-3 flex flex-col md:flex-row justify-between items-center shrink-0 shadow-sm relative" id="main-app-header">
        {/* Crest logo */}
        <div className="flex items-center space-x-3.5" id="brand-crest">
          <GiaKhanhLogo size={52} />
          <div>
            <div className="flex items-center space-x-1.5">
              <h1 className="text-sm font-display font-black tracking-widest text-[#EE3124] uppercase">LẨU NẤM GIA KHÁNH</h1>
            </div>
            <p className="text-[10px] text-gray-500 tracking-wide font-light">Giải pháp chốt tồn kho trực tuyến bảo mật nhân viên</p>
          </div>
        </div>

        {/* User context action info */}
        <div className="flex items-center space-x-4 mt-3 md:mt-0" id="user-context-action">
          <div className="flex items-center space-x-2 text-right bg-gray-50 px-3.5 py-1.5 rounded-xl border border-gray-200 shadow-inner">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
            <div>
              <p className="text-xs font-bold text-gray-800 leading-none">{currentUser.Ten_nhan_vien}</p>
              <p className="text-[9px] text-brand-red block mt-0.5 font-bold uppercase tracking-wider">Vai trò: {currentUser.Vai_tro}</p>
            </div>
          </div>

          <button
            id="btn-logout"
            onClick={handleLogoutClick}
            className="p-2 bg-gray-100 hover:bg-gray-250 text-[#EE3124] border border-gray-300 rounded-xl transition cursor-pointer flex items-center space-x-1.5 text-xs font-bold"
            title="Đăng xuất khỏi tài khoản nhân viên"
          >
            <LogOut size={13} />
            <span>THOÁT</span>
          </button>
        </div>
      </header>

      {/* CORE SPLIT WORKSPACE BODY */}
      <div className="flex-1 flex flex-col overflow-hidden" id="workspace-layout">
        {/* TOP REMOVED SIDEBAR REPLACEMENT COMPACT NAVBAR */}
        <nav className="w-full bg-white border-b border-gray-200 px-6 py-2 flex items-center gap-2 overflow-x-auto shrink-0" id="top-nav">
          {allTabs
            .filter(tab => tab.visible)
            .map(tab => {
              const TabIcon = tab.icon;
              const isSelected = finalDefaultTab === tab.id && !selectedRecipeDishId;
              
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setSelectedRecipeDishId(null);
                    setActiveTab(tab.id);
                  }}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-left font-black text-[11px] tracking-wider transition cursor-pointer uppercase ${
                    isSelected
                      ? 'bg-[#EE3124] text-white shadow-xs'
                      : 'bg-gray-50 text-gray-650 hover:bg-gray-100 border border-gray-200'
                  }`}
                >
                  <TabIcon size={13} />
                  <span>{tab.name}</span>
                </button>
              );
            })}
        </nav>

        {/* INTERACTIVE RENDERING DESK (Taking full workspace area) */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6" id="active-rendition-panel">
          {/* If a dish is selected for recipe allocation */}
          {selectedRecipeDishId ? (
            <RecipeView
              dishId={selectedRecipeDishId}
              onBack={() => setSelectedRecipeDishId(null)}
            />
          ) : (
            <>
              {finalDefaultTab === 'dashboard' && <DashboardView />}
              {finalDefaultTab === 'accounts' && <AccountView />}
              {finalDefaultTab === 'menu' && (
                <MenuView
                  onSelectRecipe={(dishId) => setSelectedRecipeDishId(dishId)}
                />
              )}
              {finalDefaultTab === 'categories' && <CategoryView />}
              {finalDefaultTab === 'calc' && <MaterialCalcView />}
              {finalDefaultTab === 'warehouse_mgmt' && <WarehouseView />}
              {finalDefaultTab === 'reception' && (isWaiter ? <WaiterDashboard /> : <ReceptionLayout />)}
              {finalDefaultTab === 'kitchen' && <KitchenKanban />}
            </>
          )}
        </main>
      </div>

      {/* FOOTER METRICS SYSTEM */}
      <footer className="bg-[#FAF9F6] border-t border-gray-200 px-6 py-2.5 text-[10px] text-gray-400 font-mono tracking-wide flex flex-col sm:flex-row justify-between items-center space-y-1 sm:space-y-0 shrink-0" id="dev-credits-footer">
        <div>
          <span>Hệ thống cơ sở dữ liệu: <strong>REST API & database.json (Bảo mật)</strong></span>
          <span className="mx-2 text-gray-300">|</span>
          <span>Pháp lý: <strong>Nhà hàng Lẩu Nấm Gia Khánh</strong></span>
        </div>
        <div className="flex items-center space-x-1">
          <Sparkles size={11} className="text-[#EE3124]" />
          <span>Giao diện quản lý thông minh và tinh tế • Lẩu Nấm Gia Khánh</span>
        </div>
      </footer>
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  );
}
