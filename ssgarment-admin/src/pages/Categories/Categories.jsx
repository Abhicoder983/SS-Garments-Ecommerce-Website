// src/pages/Categories/Categories.jsx
import { useEffect, useState } from 'react';
import { ClipLoader } from 'react-spinners';
import toast from 'react-hot-toast';
import api from '../../services/api';

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newName, setNewName] = useState('');
  const [adding, setAdding] = useState(false);

  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState('');
  const [savingEdit, setSavingEdit] = useState(false);

  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await api.get('/categories/');
      setCategories(res.data);
    } catch (err) {
      toast.error('Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!newName.trim()) return;

    setAdding(true);
    try {
      const res = await api.post('/categories/', { name: newName.trim() });
      setCategories((prev) => [...prev, res.data]);
      setNewName('');
      toast.success('Category added');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to add category');
    } finally {
      setAdding(false);
    }
  };

  const startEdit = (category) => {
    setEditingId(category.id);
    setEditName(category.name);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditName('');
  };

  const handleSaveEdit = async (id) => {
    if (!editName.trim()) return;

    setSavingEdit(true);
    try {
      const res = await api.patch(`/categories/${id}/`, { name: editName.trim() });
      setCategories((prev) =>
        prev.map((c) => (c.id === id ? res.data : c))
      );
      toast.success('Category updated');
      cancelEdit();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to update category');
    } finally {
      setSavingEdit(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this category? Products under it may be affected.')) return;

    setDeletingId(id);
    try {
      await api.delete(`/categories/${id}/`);
      setCategories((prev) => prev.filter((c) => c.id !== id));
      toast.success('Category deleted');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to delete category');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Categories</h1>
        <p className="text-slate-400 text-sm mt-1">Manage product categories for your store</p>
      </div>

      {/* Add new category */}
      <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-5 mb-6">
        <form onSubmit={handleAdd} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
            </div>
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="New category name (e.g. Shirts, Kurtas)"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all"
            />
          </div>
          <button
            type="submit"
            disabled={adding || !newName.trim()}
            className="flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:shadow-lg hover:shadow-blue-500/25 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:shadow-none active:scale-[0.98] transition-all duration-200 min-w-[140px]"
          >
            {adding ? (
              <ClipLoader color="#ffffff" size={14} />
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
                Add Category
              </>
            )}
          </button>
        </form>
      </div>

      {/* Stats bar */}
      <div className="flex items-center gap-2 mb-4">
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
          {categories.length} {categories.length === 1 ? 'Category' : 'Categories'}
        </span>
        <div className="flex-1 h-px bg-slate-200" />
      </div>

      {/* List */}
      <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <ClipLoader color="#2563eb" size={32} />
            <p className="text-slate-400 text-sm mt-3">Loading categories...</p>
          </div>
        ) : categories.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center mb-3">
              <svg className="w-7 h-7 text-slate-300" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 6h.008v.008H6V6z" />
              </svg>
            </div>
            <p className="text-slate-500 font-medium text-sm">No categories yet</p>
            <p className="text-slate-400 text-xs mt-1">Add your first category above to get started</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-100">
                  <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Category Name</th>
                  <th className="px-6 py-3.5 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {categories.map((category, index) => (
                  <tr
                    key={category.id}
                    className="group hover:bg-slate-50/50 transition-colors duration-150"
                  >
                    <td className="px-6 py-4">
                      {editingId === category.id ? (
                        <div className="flex items-center gap-3">
                          <span className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center text-xs font-bold">
                            {index + 1}
                          </span>
                          <input
                            type="text"
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            autoFocus
                            className="border border-slate-300 rounded-lg px-3 py-2 text-sm w-full max-w-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white transition-all"
                          />
                        </div>
                      ) : (
                        <div className="flex items-center gap-3">
                          <span className="w-7 h-7 rounded-lg bg-slate-100 text-slate-500 flex items-center justify-center text-xs font-bold group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                            {index + 1}
                          </span>
                          <span className="text-slate-800 font-medium">{category.name}</span>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {editingId === category.id ? (
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleSaveEdit(category.id)}
                            disabled={savingEdit}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-600 text-xs font-semibold hover:bg-emerald-100 disabled:opacity-50 transition-colors"
                          >
                            {savingEdit ? (
                              <ClipLoader color="#059669" size={12} />
                            ) : (
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                              </svg>
                            )}
                            Save
                          </button>
                          <button
                            onClick={cancelEdit}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 text-slate-600 text-xs font-semibold hover:bg-slate-200 transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => startEdit(category)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 text-xs font-medium transition-colors"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                            </svg>
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(category.id)}
                            disabled={deletingId === category.id}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-slate-500 hover:text-red-600 hover:bg-red-50 text-xs font-medium transition-colors disabled:opacity-40"
                          >
                            {deletingId === category.id ? (
                              <ClipLoader color="#dc2626" size={12} />
                            ) : (
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                              </svg>
                            )}
                            Delete
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}