import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { getProducts, deleteProduct, submitForApproval, toggleActiveProduct } from '../../../../services/healthStoreOwnerApi';

const STATUS_TABS = ['All', 'Draft', 'Pending Approval', 'Live', 'Rejected'];

const STATUS_COLORS = {
  Draft: 'bg-gray-100 text-gray-700 border-gray-250',
  'Pending Approval': 'bg-orange-100 text-orange-700 border-orange-200',
  Live: 'bg-green-100 text-green-700 border-green-200',
  Rejected: 'bg-red-100 text-red-700 border-red-200',
};

const SupplementList = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeStatus, setActiveStatus] = useState('All');
  const [search, setSearch] = useState('');
  const [pagination, setPagination] = useState({ total: 0, page: 1, pages: 1 });

  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        page: pagination.page,
        limit: 10,
        type: 'Supplement',
        search
      };
      if (activeStatus !== 'All') params.status = activeStatus;
      const res = await getProducts(params);
      setProducts(res.data.data);
      setPagination(p => ({ ...p, ...res.data.pagination }));
    } catch (err) {
      toast.error('Failed to load supplements list');
    } finally {
      setLoading(false);
    }
  }, [activeStatus, search, pagination.page]);

  useEffect(() => {
    fetchItems();
  }, [activeStatus, search]);

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete "${name}"?`)) return;
    try {
      await deleteProduct(id);
      toast.success('Supplement deleted successfully');
      fetchItems();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed');
    }
  };

  const handleToggleActive = async (id, name, isActive) => {
    const action = isActive ? 'make unavailable' : 'make available';
    if (!window.confirm(`Are you sure you want to ${action} "${name}"?`)) return;
    try {
      const res = await toggleActiveProduct(id);
      toast.success(res.data.message || 'Availability status updated');
      fetchItems();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update availability');
    }
  };

  const handleSubmitApproval = async (id, name) => {
    if (!window.confirm(`Submit "${name}" for Admin verification?`)) return;
    try {
      await submitForApproval(id);
      toast.success('Submitted for approval!');
      fetchItems();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Submission failed');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Premium Supplements</h2>
          <p className="text-gray-500 text-sm mt-1">Manage whey proteins, creatines, mass gainers, and multivitamins stock listings.</p>
        </div>
        <button onClick={() => navigate('/health-store-owner/supplements/add')}
          className="bg-red-600 hover:bg-red-750 text-white font-semibold text-sm px-5 py-2.5 rounded-xl transition-colors shadow-md flex items-center gap-2">
          💊 Add Supplement listing
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 flex-wrap pb-2 border-b">
        {STATUS_TABS.map(tab => (
          <button key={tab} onClick={() => { setActiveStatus(tab); setPagination(p => ({ ...p, page: 1 })); }}
            className={`px-4 py-1.5 rounded-xl text-xs font-semibold border transition-colors ${activeStatus === tab ? 'bg-red-600 text-white border-red-600' : 'bg-white text-gray-600 border-gray-300 hover:border-red-400'}`}>
            {tab}
          </button>
        ))}
      </div>

      {/* Search */}
      <div>
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="🔍 Search supplements by name..."
          className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-400" />
      </div>

      {/* Grid */}
      {loading ? (
        <div className="p-12 text-center">
          <div className="animate-spin w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full mx-auto mb-3" />
          <p className="text-gray-500">Loading supplements...</p>
        </div>
      ) : products.length === 0 ? (
        <div className="p-12 bg-white border rounded-2xl text-center">
          <p className="text-4xl mb-3">💊</p>
          <p className="text-gray-500 font-medium">No supplement listings found. Add one today!</p>
        </div>
      ) : (
        <div className="overflow-x-auto bg-white border border-gray-200 rounded-2xl shadow-sm">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-xs font-bold text-gray-500 uppercase tracking-wider">
                <th className="py-4 px-5">Product Info</th>
                <th className="py-4 px-5">Brand & Category</th>
                <th className="py-4 px-5">Price</th>
                <th className="py-4 px-5">Stock Info</th>
                <th className="py-4 px-5">Status</th>
                <th className="py-4 px-5">Availability</th>
                <th className="py-4 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-150 text-sm">
              {products.map(item => (
                <tr key={item._id} className={`hover:bg-gray-50 transition-colors ${!item.isActive ? 'bg-gray-50 opacity-75' : ''}`}>
                  <td className="py-4 px-5">
                    <div className="flex items-center gap-3">
                      {item.images?.[0] ? (
                        <img src={item.images[0]} alt="" className="w-12 h-12 rounded-lg object-cover border" />
                      ) : (
                        <div className="w-12 h-12 rounded-lg bg-red-50 flex items-center justify-center text-red-500 text-xl font-bold border border-red-100">
                          💊
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="font-bold text-gray-800 truncate max-w-xs">{item.name}</p>
                        {item.shortDescription && (
                          <p className="text-xs text-gray-455 truncate max-w-xs">{item.shortDescription}</p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-5">
                    <div className="text-xs font-semibold text-gray-600">{item.brand || 'N/A'}</div>
                    <div className="text-[11px] text-gray-400 mt-0.5">{item.category}</div>
                  </td>
                  <td className="py-4 px-5 font-semibold text-gray-700">
                    ₹{item.sellingPrice || item.oneTimePrice}
                  </td>
                  <td className="py-4 px-5">
                    <span className={`inline-block text-xs font-bold px-2 py-0.5 rounded ${item.stock <= item.lowStockAlert ? 'bg-red-50 text-red-650' : 'bg-gray-100 text-gray-700'}`}>
                      {item.stock} in stock
                    </span>
                    {item.stock <= item.lowStockAlert && (
                      <span className="block text-[10px] text-red-500 font-semibold mt-0.5">Low Stock Alert</span>
                    )}
                  </td>
                  <td className="py-4 px-5">
                    <span className={`text-[10px] font-bold uppercase px-2.5 py-1 rounded-full border ${STATUS_COLORS[item.approvalStatus] || 'bg-gray-100'}`}>
                      {item.approvalStatus}
                    </span>
                    {item.approvalStatus === 'Rejected' && item.rejectionReason && (
                      <p className="text-[10px] text-red-650 italic mt-1 max-w-[150px] truncate" title={item.rejectionReason}>
                        Reason: {item.rejectionReason}
                      </p>
                    )}
                  </td>
                  <td className="py-4 px-5">
                    <span className={`text-[10px] font-bold uppercase px-2.5 py-1 rounded-full border ${item.isActive ? 'bg-green-100 text-green-700 border-green-200' : 'bg-red-100 text-red-700 border-red-200'}`}>
                      {item.isActive ? 'Available' : 'Unavailable'}
                    </span>
                  </td>
                  <td className="py-4 px-5 text-right">
                    <div className="flex gap-1.5 justify-end items-center">
                      {['Draft', 'Rejected'].includes(item.approvalStatus) && (
                        <button onClick={() => handleSubmitApproval(item._id, item.name)}
                          className="bg-red-600 hover:bg-red-700 text-white font-bold text-xs px-2.5 py-1.5 rounded-lg transition-colors shadow-sm"
                          title="Submit Live">
                          🚀 Submit
                        </button>
                      )}
                      <button onClick={() => navigate(`/health-store-owner/supplements/edit/${item._id}`)}
                        className="bg-white hover:bg-slate-50 text-slate-800 border font-bold text-xs px-2.5 py-1.5 rounded-lg transition-colors"
                        title="Edit Supplement">
                        ✍️ Edit
                      </button>
                      <button onClick={() => handleToggleActive(item._id, item.name, item.isActive)}
                        className={`border font-bold text-xs px-2.5 py-1.5 rounded-lg transition-colors ${item.isActive ? 'bg-amber-50 hover:bg-amber-100 text-amber-800 border-amber-250' : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border-emerald-250'}`}
                        title={item.isActive ? 'Pause listing' : 'Resume listing'}>
                        {item.isActive ? '⏸️ Pause' : '▶️ Resume'}
                      </button>
                      <button onClick={() => handleDelete(item._id, item.name)}
                        className="text-red-650 hover:bg-red-50 border border-red-200 text-red-600 font-semibold text-xs p-1.5 rounded-lg transition-colors"
                        title="Delete">
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default SupplementList;
