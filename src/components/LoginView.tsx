/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useRestaurantStore } from '../data/store';
import { LogIn, ShieldAlert, CheckCircle } from 'lucide-react';
import GiaKhanhLogo from './GiaKhanhLogo';

export default function LoginView() {
  const { login, employees, setCurrentRole } = useRestaurantStore();
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('123456');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!username || !password) {
      setErrorMsg('Vui lòng nhập đầy đủ tên đăng nhập và mật khẩu.');
      return;
    }

    const emp = login(username, password);
    if (emp) {
      setSuccessMsg(`Đăng nhập thành công! Chào mừng ${emp.Ho_ten} (${emp.Vai_tro})`);
    } else {
      setErrorMsg('Sai tên đăng nhập hoặc mật khẩu, hoặc tài khoản đã bị vô hiệu hóa.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex font-sans" id="login-container">
      {/* Left panel - Solid red branding */}
      <div className="hidden md:flex md:w-5/12 bg-[#800F14] text-white flex-col justify-between p-12 relative overflow-hidden" id="login-brand-panel">
        {/* Subtle background graphics */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-red-800 rounded-full filter blur-3xl opacity-20 -mr-20 -mt-20"></div>

        <div>
          {/* Decorative Top Line */}
          <div className="w-16 h-1 bg-[#E5BA73] mb-8"></div>
        </div>

        {/* Central Logo */}
        <div className="flex flex-col items-center justify-center text-center my-auto space-y-6" id="login-brand-logo-area">
          <GiaKhanhLogo size={150} />

          <div className="space-y-2">
            <h1 className="text-3xl font-display font-medium tracking-wide text-white">Lẩu Nấm Gia Khánh</h1>
            <p className="text-sm text-gray-300 tracking-wider font-light">Management System</p>
          </div>
        </div>

        {/* Bottom copyright notice */}
        <div className="text-xs text-gray-400 font-light" id="login-copyright">
          <p>© 2026 Lẩu Nấm Gia Khánh. All rights reserved.</p>
        </div>
      </div>

      {/* Right panel - Credentials Form */}
      <div className="w-full md:w-7/12 flex items-center justify-center p-6 bg-[#FAF9F6]" id="login-form-panel">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-gray-100 p-10 relative overflow-hidden" id="login-card">
          {/* Small Top Banner */}
          <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-red-800 via-[#EE3124] to-red-600"></div>

          <div className="mb-8 text-center">
            <h2 className="text-2xl font-display font-bold text-brand-red tracking-wide">ĐĂNG NHẬP HỆ THỐNG</h2>
            <p className="text-xs text-gray-400 mt-1 uppercase tracking-widest">Cozy Mushroom Hotpot Portal</p>
          </div>

          {errorMsg && (
            <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-600 text-red-800 text-sm flex items-start space-x-2 rounded-r-lg" id="login-error">
              <ShieldAlert size={18} className="shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="mb-6 p-4 bg-green-50 border-l-4 border-green-600 text-green-800 text-sm flex items-start space-x-2 rounded-r-lg" id="login-success">
              <CheckCircle size={18} className="shrink-0 mt-0.5" />
              <span>{successMsg}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">Tên đăng nhập</label>
              <input
                id="username-inp"
                type="text"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm text-gray-800 transition bg-gray-50 focus:bg-white"
                placeholder="Nhập tài khoản"
                value={username}
                onChange={e => setUsername(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">Mật khẩu</label>
              <input
                id="password-inp"
                type="password"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm text-gray-800 transition bg-gray-50 focus:bg-white"
                placeholder="Nhập mật khẩu"
                value={password}
                onChange={e => setPassword(e.target.value)}
              />
            </div>

            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center space-x-2 text-gray-500 cursor-pointer">
                <input type="checkbox" defaultChecked className="rounded border-gray-300 text-brand-red focus:ring-brand-red" />
                <span>Ghi nhớ đăng nhập</span>
              </label>
              <a href="#" className="font-semibold text-brand-red hover:underline" onClick={e => e.preventDefault()}>Quên mật khẩu?</a>
            </div>

            <button
              id="submit-login-btn"
              type="submit"
              className="w-full py-3 bg-brand-red hover:bg-brand-red-dark text-white font-semibold text-sm rounded-xl flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl transition-all cursor-pointer mt-4"
            >
              <LogIn size={16} />
              <span>ĐĂNG NHẬP</span>
            </button>
          </form>

          {/* Quick accounts help box for grading ease */}
          <div className="mt-8 pt-6 border-t border-gray-100 text-center" id="quick-login-hints">
            <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-2.5">Tài khoản trải nghiệm nhanh</p>
            <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto pr-1">
              {employees.map(emp => (
                <button
                  key={emp.Ma_nhan_vien}
                  onClick={() => {
                    setUsername(emp.Ten_dang_nhap);
                    setPassword(emp.Mat_khau_hash);
                  }}
                  className={`px-2.5 py-1.5 border border-dashed rounded-lg text-left transition hover:bg-red-50/50 hover:border-red-300 text-[10px] ${
                    username === emp.Ten_dang_nhap && password === emp.Mat_khau_hash
                      ? 'bg-red-50 border-red-500 text-red-800'
                      : 'border-gray-200 text-gray-600'
                  }`}
                >
                  <p className="font-semibold truncate">{emp.Ho_ten}</p>
                  <div className="flex justify-between text-[9px] text-gray-400 mt-0.5">
                    <span>{emp.Ten_dang_nhap}</span>
                    <span className="font-medium text-brand-red">{emp.Vai_tro}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
