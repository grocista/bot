"use client";

import { useState, useEffect } from "react";
import { Search, Loader2, RefreshCw, Trash2, Edit, ChevronLeft, ChevronRight, Download, X } from "lucide-react";

interface FormFields {
  firstName: string;
  lastName: string;
  gender: string;
  dateOfBirth: string;
  currentNationality: string;
  passportNumber: string;
  passportExpiryDate: string;
  contactNumber: string;
}

interface Commands {
  autoClick: boolean;
  autoFill: boolean;
  targetForm: string;
  submitForm: boolean;
  delayMs: number;
  scrollToElement: boolean;
}

interface User {
  userId: string;
  formFields: FormFields;
  commands: Commands;
  timestamp: string;
  _id: string;
}

export default function ViewUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [sortBy, setSortBy] = useState<keyof User | "formFields.firstName" | "timestamp">("timestamp");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [usersPerPage] = useState<number>(10);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState<FormFields>({
    firstName: "", lastName: "", gender: "", dateOfBirth: "", currentNationality: "",
    passportNumber: "", passportExpiryDate: "", contactNumber: ""
  });
  const [commandData, setCommandData] = useState<Commands>({
    autoClick: true, autoFill: true, targetForm: "vfs-global-form", submitForm: false, delayMs: 1000, scrollToElement: true
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("https://api.wenepal.com/api/get-all-form-data");
      const data = await res.json();
      if (res.ok) {
        setUsers(data);
        setFilteredUsers(data);
      } else {
        setError(data.error || "Failed to fetch users");
      }
    } catch (err) {
      setError("Network error: Unable to fetch users");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);
    const filtered = users.filter(u =>
      u.userId.toLowerCase().includes(term) ||
      u.formFields.firstName.toLowerCase().includes(term) ||
      u.formFields.lastName.toLowerCase().includes(term) ||
      u.formFields.passportNumber.toLowerCase().includes(term)
    );
    setFilteredUsers(filtered);
    setCurrentPage(1);
  };

  const handleSort = (field: keyof User | "formFields.firstName" | "timestamp") => {
    const newOrder = sortBy === field && sortOrder === "asc" ? "desc" : "asc";
    setSortBy(field);
    setSortOrder(newOrder);
    const sorted = [...filteredUsers].sort((a, b) => {
      const aValue = field === "formFields.firstName" ? a.formFields.firstName : a[field];
      const bValue = field === "formFields.firstName" ? b.formFields.firstName : b[field];
      if (typeof aValue === "string" && typeof bValue === "string") {
        return newOrder === "asc" ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
      }
      return newOrder === "asc" ? (aValue > bValue ? 1 : -1) : (bValue > aValue ? 1 : -1);
    });
    setFilteredUsers(sorted);
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setFormData({
      firstName: user.formFields.firstName, lastName: user.formFields.lastName, gender: user.formFields.gender,
      dateOfBirth: user.formFields.dateOfBirth.split("T")[0], currentNationality: user.formFields.currentNationality,
      passportNumber: user.formFields.passportNumber, passportExpiryDate: user.formFields.passportExpiryDate.split("T")[0],
      contactNumber: user.formFields.contactNumber
    });
    setCommandData(user.commands);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`https://api.wenepal.com/api/update-form-data/${editingUser?.userId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          formFields: formData,
          commands: commandData
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setUsers(users.map(u => u.userId === editingUser?.userId ? data.user : u));
        setFilteredUsers(filteredUsers.map(u => u.userId === editingUser?.userId ? data.user : u));
        setEditingUser(null);
      } else {
        setError(data.error || "Failed to update user");
      }
    } catch (err) {
      setError("Network error: Unable to update user");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (userId: string) => {
    if (!confirm("Are you sure you want to delete this user?")) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`https://api.wenepal.com/api/delete-form-data/${userId}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json();
      if (res.ok) {
        setUsers(users.filter(u => u.userId !== userId));
        setFilteredUsers(filteredUsers.filter(u => u.userId !== userId));
      } else {
        setError(data.error || "Failed to delete user");
      }
    } catch (err) {
      setError("Network error: Unable to delete user");
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    const dataStr = JSON.stringify(filteredUsers, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "vfs-users.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  return (
    <div className="min-h-screen bg-indigo-50 p-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl font-bold mb-6 text-center text-indigo-900">Admin: Manage VFS Users</h1>
        <div className="flex justify-between mb-4">
          <div className="flex items-center">
            <Search className="h-5 w-5 text-indigo-500 mr-2" />
            <input
              type="text"
              value={searchTerm}
              onChange={handleSearch}
              className="p-2 border border-indigo-300 rounded-md focus:ring-2 focus:ring-indigo-500 text-indigo-900"
              placeholder="Search by User ID, Name, or Passport"
            />
          </div>
          <div className="flex space-x-2">
            <button
              onClick={fetchUsers}
              className="flex items-center bg-indigo-600 text-white p-2 rounded-md hover:bg-indigo-700 transition-colors"
            >
              <RefreshCw className="h-5 w-5 mr-2" />
              Refresh
            </button>
            <button
              onClick={handleExport}
              className="flex items-center bg-teal-600 text-white p-2 rounded-md hover:bg-teal-700 transition-colors"
            >
              <Download className="h-5 w-5 mr-2" />
              Export
            </button>
          </div>
        </div>
        {loading && <p className="text-center text-indigo-600"><Loader2 className="animate-spin h-6 w-6 mx-auto" /></p>}
        {error && <p className="mt-4 text-red-600 text-center">{error}</p>}
        <div className="bg-white p-6 rounded-xl shadow-lg overflow-x-auto">
          {filteredUsers.length === 0 && !loading ? (
            <p className="text-indigo-800 text-center">No users found</p>
          ) : (
            <>
              <table className="min-w-full divide-y divide-indigo-200">
                <thead className="bg-indigo-100">
                  <tr>
                    {[
                      { label: "User ID", key: "userId" },
                      { label: "First Name", key: "formFields.firstName" },
                      { label: "Last Name", key: "formFields.lastName" },
                      { label: "Gender", key: "formFields.gender" },
                      { label: "Nationality", key: "formFields.currentNationality" },
                      { label: "Passport", key: "formFields.passportNumber" },
                      { label: "Contact", key: "formFields.contactNumber" },
                      { label: "Created", key: "timestamp" },
                      { label: "Actions", key: "" }
                    ].map(({ label, key }) => (
                      <th
                        key={label}
                        className="px-4 py-2 text-left text-sm font-medium text-indigo-900 cursor-pointer"
                        onClick={() => key && handleSort(key as keyof User | "formFields.firstName" | "timestamp")}
                      >
                        {label} {sortBy === key && (sortOrder === "asc" ? "↑" : "↓")}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-indigo-200">
                  {currentUsers.map((user: User) => (
                    <tr key={user.userId}>
                      <td className="px-4 py-2 text-sm text-indigo-900">{user.userId.slice(0, 8)}...</td>
                      <td className="px-4 py-2 text-sm text-indigo-900">{user.formFields.firstName}</td>
                      <td className="px-4 py-2 text-sm text-indigo-900">{user.formFields.lastName}</td>
                      <td className="px-4 py-2 text-sm text-indigo-900">{user.formFields.gender}</td>
                      <td className="px-4 py-2 text-sm text-indigo-900">{user.formFields.currentNationality}</td>
                      <td className="px-4 py-2 text-sm text-indigo-900">{user.formFields.passportNumber}</td>
                      <td className="px-4 py-2 text-sm text-indigo-900">{user.formFields.contactNumber}</td>
                      <td className="px-4 py-2 text-sm text-indigo-900">{new Date(user.timestamp).toLocaleDateString()}</td>
                      <td className="px-4 py-2 text-sm">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleEdit(user)}
                            className="bg-indigo-600 text-white p-1 rounded-md hover:bg-indigo-700 transition-colors"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(user.userId)}
                            className="bg-red-600 text-white p-1 rounded-md hover:bg-red-700 transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="mt-4 flex justify-between items-center">
                <p className="text-sm text-indigo-800">
                  Showing {indexOfFirstUser + 1} to {Math.min(indexOfLastUser, filteredUsers.length)} of {filteredUsers.length} users
                </p>
                <div className="flex space-x-2">
                  <button
                    onClick={() => paginate(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="p-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:bg-indigo-400"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => paginate(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="p-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:bg-indigo-400"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {editingUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white p-6 rounded-xl shadow-lg max-w-lg w-full max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-indigo-900">Edit User</h2>
              <button onClick={() => setEditingUser(null)} className="text-indigo-600 hover:text-indigo-800">
                <X className="h-6 w-6" />
              </button>
            </div>
            <form onSubmit={handleUpdate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-indigo-800">First Name</label>
                <input
                  type="text"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  className="mt-1 w-full p-2 border border-indigo-300 rounded-md focus:ring-2 focus:ring-indigo-500 text-indigo-900"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-indigo-800">Last Name</label>
                <input
                  type="text"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  className="mt-1 w-full p-2 border border-indigo-300 rounded-md focus:ring-2 focus:ring-indigo-500 text-indigo-900"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-indigo-800">Gender</label>
                <select
                  value={formData.gender}
                  onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                  className="mt-1 w-full p-2 border border-indigo-300 rounded-md focus:ring-2 focus:ring-indigo-500 text-indigo-900"
                  required
                >
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-indigo-800">Date of Birth</label>
                <input
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                  className="mt-1 w-full p-2 border border-indigo-300 rounded-md focus:ring-2 focus:ring-indigo-500 text-indigo-900"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-indigo-800">Current Nationality</label>
                <input
                  type="text"
                  value={formData.currentNationality}
                  onChange={(e) => setFormData({ ...formData, currentNationality: e.target.value })}
                  className="mt-1 w-full p-2 border border-indigo-300 rounded-md focus:ring-2 focus:ring-indigo-500 text-indigo-900"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-indigo-800">Passport Number</label>
                <input
                  type="text"
                  value={formData.passportNumber}
                  onChange={(e) => setFormData({ ...formData, passportNumber: e.target.value })}
                  className="mt-1 w-full p-2 border border-indigo-300 rounded-md focus:ring-2 focus:ring-indigo-500 text-indigo-900"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-indigo-800">Passport Expiry Date</label>
                <input
                  type="date"
                  value={formData.passportExpiryDate}
                  onChange={(e) => setFormData({ ...formData, passportExpiryDate: e.target.value })}
                  className="mt-1 w-full p-2 border border-indigo-300 rounded-md focus:ring-2 focus:ring-indigo-500 text-indigo-900"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-indigo-800">Contact Number</label>
                <input
                  type="text"
                  value={formData.contactNumber}
                  onChange={(e) => setFormData({ ...formData, contactNumber: e.target.value })}
                  className="mt-1 w-full p-2 border border-indigo-300 rounded-md focus:ring-2 focus:ring-indigo-500 text-indigo-900"
                  required
                />
              </div>
              <div>
                <label className="flex items-center text-sm font-medium text-indigo-800">
                  <input
                    type="checkbox"
                    checked={commandData.autoClick}
                    onChange={(e) => setCommandData({ ...commandData, autoClick: e.target.checked })}
                    className="mr-2 h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-indigo-300 rounded"
                  />
                  Auto Click
                </label>
              </div>
              <div>
                <label className="flex items-center text-sm font-medium text-indigo-800">
                  <input
                    type="checkbox"
                    checked={commandData.autoFill}
                    onChange={(e) => setCommandData({ ...commandData, autoFill: e.target.checked })}
                    className="mr-2 h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-indigo-300 rounded"
                  />
                  Auto Fill
                </label>
              </div>
              <div>
                <label className="block text-sm font-medium text-indigo-800">Target Form (CSS Selector/ID)</label>
                <input
                  type="text"
                  value={commandData.targetForm}
                  onChange={(e) => setCommandData({ ...commandData, targetForm: e.target.value })}
                  className="mt-1 w-full p-2 border border-indigo-300 rounded-md focus:ring-2 focus:ring-indigo-500 text-indigo-900"
                />
              </div>
              <div>
                <label className="flex items-center text-sm font-medium text-indigo-800">
                  <input
                    type="checkbox"
                    checked={commandData.submitForm}
                    onChange={(e) => setCommandData({ ...commandData, submitForm: e.target.checked })}
                    className="mr-2 h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-indigo-300 rounded"
                  />
                  Submit Form
                </label>
              </div>
              <div>
                <label className="block text-sm font-medium text-indigo-800">Delay (ms)</label>
                <input
                  type="number"
                  value={commandData.delayMs}
                  onChange={(e) => setCommandData({ ...commandData, delayMs: Number(e.target.value) })}
                  className="mt-1 w-full p-2 border border-indigo-300 rounded-md focus:ring-2 focus:ring-indigo-500 text-indigo-900"
                />
              </div>
              <div>
                <label className="flex items-center text-sm font-medium text-indigo-800">
                  <input
                    type="checkbox"
                    checked={commandData.scrollToElement}
                    onChange={(e) => setCommandData({ ...commandData, scrollToElement: e.target.checked })}
                    className="mr-2 h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-indigo-300 rounded"
                  />
                  Scroll to Element
                </label>
              </div>
              <div className="flex space-x-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-indigo-600 text-white p-2 rounded-md hover:bg-indigo-700 disabled:bg-indigo-400 transition-colors"
                >
                  Save
                </button>
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="flex-1 bg-gray-500 text-white p-2 rounded-md hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}