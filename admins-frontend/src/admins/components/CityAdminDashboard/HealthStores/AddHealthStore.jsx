import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { inviteHealthStore } from '../../../../services/cityAdminHealthStoreApi';

const STORE_TYPES = ['Diet Only', 'Supplement Only', 'Diet + Supplement'];

const AddHealthStore = () => {
  const [form, setForm] = useState({
    storeName: '', ownerName: '', ownerEmail: '', ownerMobile: '',
    city: '', address: '', storeType: 'Diet + Supplement', inviteNote: '',
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await inviteHealthStore(form);
      setSuccess(true);
      toast.success(`Invite sent to ${form.ownerEmail}`);
      setForm({ storeName: '', ownerName: '', ownerEmail: '', ownerMobile: '', city: '', address: '', storeType: 'Diet + Supplement', inviteNote: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send invite');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Invite Health Store</h2>
        <p className="text-gray-500 mt-1">Send an invite email to a Health Store owner to register on livesale.Fitness.</p>
      </div>

      {success && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl flex items-center gap-3">
          <span className="text-2xl">✅</span>
          <div>
            <p className="font-semibold text-green-800">Invite Sent!</p>
            <p className="text-green-600 text-sm">The owner will receive a registration link valid for 48 hours.</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6 space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Store Name *</label>
            <input name="storeName" value={form.storeName} onChange={handleChange} required
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              placeholder="e.g. HealthFuel Store" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Store Type *</label>
            <select name="storeType" value={form.storeType} onChange={handleChange} required
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500">
              {STORE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Owner Name *</label>
            <input name="ownerName" value={form.ownerName} onChange={handleChange} required
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              placeholder="Owner Full Name" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Owner Email *</label>
            <input name="ownerEmail" type="email" value={form.ownerEmail} onChange={handleChange} required
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              placeholder="owner@email.com" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Owner Mobile *</label>
            <input name="ownerMobile" value={form.ownerMobile} onChange={handleChange} required
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              placeholder="+91 9876543210" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">City *</label>
            <input name="city" value={form.city} onChange={handleChange} required
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              placeholder="e.g. Pune" />
          </div>
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">Store Address</label>
          <textarea name="address" value={form.address} onChange={handleChange} rows={2}
            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
            placeholder="Full store address..." />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">Invite Note (Optional)</label>
          <textarea name="inviteNote" value={form.inviteNote} onChange={handleChange} rows={2}
            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
            placeholder="Any message for the store owner..." />
        </div>
        <button type="submit" disabled={loading}
          className="w-full bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white font-bold py-3 rounded-xl transition-colors flex items-center justify-center gap-2">
          {loading ? <><span className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />Sending...</> : '📧 Send Invite'}
        </button>
      </form>
    </div>
  );
};

export default AddHealthStore;
