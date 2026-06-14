/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useRestaurantStore } from '../data/store';
import { UserRole, Employee } from '../types';
import { Search, Plus, Edit2, ToggleLeft, ToggleRight, X, UserCheck, ShieldAlert } from 'lucide-react';

export default function AccountView() {
  const { employees, addEmployee, updateEmployee, deleteEmployee, currentUser } = useRestaurantStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('All');

  // Modal configuration
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEmp, setEditingEmp] = useState<Employee | null>(null);

  // Form Fields
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<UserRole>(UserRole.PHUC_VU);
  const [status, setStatus] = useState<'Hoạt động' | 'Ngừng hoạt động'>('Hoạt động');

  const openAddModal = () => {
    setEditingEmp(null);
    setFullName('');
    setUsername('');
    setPassword('123456');
    setPhone('');
    setRole(UserRole.PHUC_VU);
    setStatus('Hoạt động');
    setIsModalOpen(true);
  };

  const openEditModal = (emp: Employee) => {
    setEditingEmp(emp);
    setFullName(emp.Ho_ten);
    setUsername(emp.Ten_dang_nhap);
    setPassword(emp.Mat_khau_hash);
    setPhone(emp.SOT);
    setRole(emp.Vai_tro);
    setStatus(emp.Trang_thai_tai_khoan);
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !username || !phone) {
      alert('Vui lòng điền đầy đủ các thông tin bắt buộc.');
      return;
    }

    if (editingEmp) {
      updateEmployee({
        ...editingEmp,
        Ho_ten: fullName,
        Ten_dang_nhap: username,
        Mat_khau_hash: password,
        SOT: phone,
        Vai_tro: role,
        Trang_thai_tai_khoan: status,
      });
    } else {
      addEmployee({
        Ho_ten: fullName,
        Ten_dang_nhap: username,
        Mat_khau_hash: password,
        SOT: phone,
        Vai_tro: role,
        Trang_thai_tai_khoan: status,
      });
    }
    setIsModalOpen(false);
  };

  const toggleStatus = (emp: Employee) => {
    updateEmployee({
      ...emp,
      Trang_thai_tai_khoan: emp.Trang_thai_tai_khoan === 'Hoạt động' ? 'Ngừng hoạt động' : 'Hoạt động',
    });
  };

  const filteredEmployees = employees.filter(emp => {
    const matchesSearch =
      emp.Ho_ten.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.Ten_dang_nhap.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.SOT.includes(searchTerm);
    const matchesRole = roleFilter === 'All' || emp.Vai_tro === roleFilter;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="space-y-6" id="account-view-root">
      {/* Title Header */}
      <div className="flex justify-between items-center bg-white p-5 rounded-xl border border-gray-100 shadow-sm" id="account-header">
        <div>
          <h2 className="text-xl font-display font-bold text-gray-800 tracking-wide">Tài Khoản Nhân Viên</h2>
          <p className="text-xs text-gray-400 mt-1 uppercase tracking-widest font-mono">Employee Accounts & Permissions (UC02)</p>
        </div>
        <button
          id="btn-add-employee"
          onClick={openAddModal}
          className="bg-brand-red hover:bg-brand-red-dark text-white px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center space-x-2 shadow-md cursor-pointer"
        >
          <Plus size={16} />
          <span>THÊM NHÂN VIÊN</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex flex-col sm:flex-row gap-3 items-center justify-between" id="account-filter-bar">
        <div className="relative w-full sm:w-80">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-400 pointer-events-none">
            <Search size={16} />
          </span>
          <input
            id="search-employee-input"
            type="text"
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm bg-gray-50/50"
            placeholder="Tìm kiếm kiếm tên, SĐT, username..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto justify-end">
          <span className="text-xs text-gray-400 font-medium whitespace-nowrap">Vai trò:</span>
          <select
            id="filter-role"
            className="px-3.5 py-2 rounded-xl border border-gray-200 bg-white text-xs font-medium text-gray-700 min-w-40"
            value={roleFilter}
            onChange={e => setRoleFilter(e.target.value)}
          >
            <option value="All">Tất cả vai trò</option>
            {Object.values(UserRole).map(r => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Table list */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden" id="employee-list-table-wrapper">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse" id="employees-table">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-150 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                <th className="py-4 px-6 text-center w-12">STT</th>
                <th className="py-4 px-4 w-52">Họ Tên</th>
                <th className="py-4 px-4">Username</th>
                <th className="py-4 px-4">Vai Trò</th>
                <th className="py-4 px-4">SĐT</th>
                <th className="py-4 px-4 text-center">Trạng Thái</th>
                <th className="py-4 px-6 text-center w-28">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-xs text-gray-600">
              {filteredEmployees.map((emp, index) => (
                <tr key={emp.Ma_nhan_vien} className="hover:bg-gray-50/50 transition">
                  <td className="py-4 px-6 text-center font-semibold font-mono text-gray-400">{index + 1}</td>
                  <td className="py-4 px-4 font-semibold text-gray-800">
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 rounded-full bg-red-50 text-brand-red flex items-center justify-center font-bold text-[11px] border border-red-100">
                        {emp.Ho_ten.split(' ').slice(-1)[0][0]}
                      </div>
                      <div>
                        <p>{emp.Ho_ten}</p>
                        <p className="text-[10px] text-gray-400 font-mono mt-0.5">{emp.Ma_nhan_vien}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4 font-mono font-medium text-gray-500">{emp.Ten_dang_nhap}</td>
                  <td className="py-4 px-4">
                    <span className={`px-2 py-1 rounded-md text-[10px] font-semibold uppercase tracking-wider ${
                      emp.Vai_tro === UserRole.QUAN_LY ? 'bg-red-50 text-red-700 border border-red-100' :
                      emp.Vai_tro === UserRole.LE_TAN ? 'bg-purple-50 text-purple-700 border border-purple-100' :
                      emp.Vai_tro === UserRole.BEP ? 'bg-orange-50 text-orange-700 border border-orange-100' :
                      emp.Vai_tro === UserRole.PHUC_VU ? 'bg-blue-50 text-blue-700 border border-blue-100' :
                      'bg-green-50 text-green-700 border border-green-100'
                    }`}>
                      {emp.Vai_tro}
                    </span>
                  </td>
                  <td className="py-4 px-4 font-mono font-medium">{emp.SOT}</td>
                  <td className="py-4 px-4 text-center">
                    <span className={`inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[10px] font-semibold ${
                      emp.Trang_thai_tai_khoan === 'Hoạt động'
                        ? 'bg-green-50 text-green-700'
                        : 'bg-red-50 text-red-700'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${emp.Trang_thai_tai_khoan === 'Hoạt động' ? 'bg-green-500' : 'bg-red-500'}`}></span>
                      <span>{emp.Trang_thai_tai_khoan}</span>
                    </span>
                  </td>
                  <td className="py-4 px-6 text-center">
                    <div className="flex items-center justify-center space-x-2.5">
                      <button
                        onClick={() => openEditModal(emp)}
                        className="p-1 px-1.5 rounded bg-gray-50 hover:bg-gray-200 text-gray-600 transition"
                        title="Chỉnh sửa tài khoản"
                      >
                        <Edit2 size={13} />
                      </button>
                      
                      <button
                        onClick={() => toggleStatus(emp)}
                        disabled={emp.Ma_nhan_vien === currentUser?.Ma_nhan_vien}
                        className={`p-1 rounded transition ${
                          emp.Ma_nhan_vien === currentUser?.Ma_nhan_vien
                            ? 'text-gray-200 cursor-not-allowed'
                            : emp.Trang_thai_tai_khoan === 'Hoạt động'
                              ? 'text-brand-red hover:bg-red-50'
                              : 'text-green-600 hover:bg-green-50'
                        }`}
                        title={emp.Trang_thai_tai_khoan === 'Hoạt động' ? 'Tạm khóa tài khoản' : 'Kích hoạt lại'}
                      >
                        {emp.Trang_thai_tai_khoan === 'Hoạt động' ? <ToggleRight size={22} /> : <ToggleLeft size={22} />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredEmployees.length === 0 && (
          <div className="p-10 text-center text-gray-400 text-sm">
            <ShieldAlert size={36} className="mx-auto mb-2 text-gray-300" />
            Không tìm thấy nhân viên nào phù hợp với bộ lọc hiển thị.
          </div>
        )}
      </div>

      {/* Slide over Modal for Add / Edit */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 text-sm font-sans" id="employee-modal">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl relative overflow-hidden flex flex-col">
            <div className="absolute top-0 inset-x-0 h-1 bg-brand-red"></div>
            
            {/* Header */}
            <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <div className="flex items-center space-x-2 text-brand-red">
                <UserCheck size={18} />
                <h3 className="font-display font-bold text-base text-gray-800">
                  {editingEmp ? 'Cập Nhật Tài Khoản' : 'Thêm Nhân Viên Mới'}
                </h3>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X size={18} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Họ và tên *</label>
                <input
                  type="text"
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200"
                  placeholder="Ví dụ: Nguyễn Hùng Hiếu"
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Tên đăng nhập *</label>
                  <input
                    type="text"
                    required
                    disabled={editingEmp !== null}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 bg-gray-50/50 disabled:cursor-not-allowed disabled:opacity-75"
                    placeholder="Vd: hieunv"
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Mật khẩu *</label>
                  <input
                    type="text"
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200"
                    placeholder="Mật khẩu"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Số điện thoại *</label>
                <input
                  type="text"
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200"
                  placeholder="Ví dụ: 0912345678"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Vai trò</label>
                  <select
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-200 bg-white"
                    value={role}
                    onChange={e => setRole(e.target.value as UserRole)}
                  >
                    {Object.values(UserRole).map(r => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Trạng thái</label>
                  <select
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-200 bg-white"
                    value={status}
                    onChange={e => setStatus(e.target.value as any)}
                  >
                    <option value="Hoạt động">Hoạt động</option>
                    <option value="Ngừng hoạt động">Khóa / Ngừng</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 flex items-center space-x-2.5">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-3 border border-gray-200 hover:bg-gray-100 text-gray-500 rounded-xl font-semibold text-xs cursor-pointer"
                >
                  HỦY BỎ
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-brand-red hover:bg-brand-red-dark text-white rounded-xl font-semibold text-xs shadow-md cursor-pointer"
                >
                  LƯU THAY ĐỔI
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
