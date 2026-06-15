import React, { useState, useEffect } from 'react';
import { getAllGymOwners, approveGymOwner, rejectGymOwner } from '../../../../services/cityAdminApi';

const GymOwnersList = () => {
  const [owners, setOwners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const fetchOwners = async () => {
    setLoading(true);
    try {
      const res = await getAllGymOwners({
        search: searchTerm || undefined,
        status: statusFilter || undefined
      });
      if (res.success) {
        setOwners(res.data);
      } else {
        setError(res.message || 'Failed to fetch owners');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error communicating with server');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOwners();
  }, [searchTerm, statusFilter]);

  const handleApprove = async (ownerId) => {
    if (!window.confirm('Are you sure you want to approve this Gym Owner?')) return;
    try {
      const res = await approveGymOwner(ownerId);
      if (res.success) {
        alert('Gym Owner approved successfully!');
        fetchOwners();
      } else {
        alert(res.message || 'Approval failed');
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error executing request');
    }
  };

  const handleReject = async (ownerId) => {
    const reason = window.prompt('Please enter the reason for rejection:');
    if (reason === null) return;
    try {
      const res = await rejectGymOwner(ownerId, reason);
      if (res.success) {
        alert('Gym Owner rejected successfully!');
        fetchOwners();
      } else {
        alert(res.message || 'Rejection failed');
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error executing request');
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Gym Owner Requests</h1>
          <p className="text-slate-500 text-sm">Review applications, approve or reject gym owners registration.</p>
        </div>
        <div className="flex gap-4 items-center w-full sm:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border border-slate-300 rounded-lg px-3 py-1.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-orange-500"
          >
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="active">Active</option>
            <option value="rejected">Rejected</option>
            <option value="suspended">Suspended</option>
          </select>
          <input
            type="text"
            placeholder="Search owners..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="border border-slate-300 rounded-lg px-3 py-1.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-orange-500 w-full sm:w-64"
          />
        </div>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg border border-red-200">
          {error}
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {loading ? (
          <div className="text-center py-10 font-medium text-slate-600">Loading gym owners...</div>
        ) : owners.length === 0 ? (
          <div className="text-center py-10 font-medium text-slate-500">No requests found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 text-sm font-semibold">
                  <th className="p-4">Name</th>
                  <th className="p-4">Contact Info</th>
                  <th className="p-4">GST Number</th>
                  <th className="p-4">Bank Details</th>
                  <th className="p-4">KYC Documents</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Actions</th>
                </tr>
              </thead>
              <tbody className="text-slate-700 text-sm divide-y divide-slate-100">
                {owners.map((owner) => (
                  <tr key={owner._id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-4 font-medium text-slate-900">{owner.name}</td>
                    <td className="p-4">
                      <div className="font-semibold">{owner.email}</div>
                      <div className="text-xs text-slate-500">{owner.phone}</div>
                    </td>
                    <td className="p-4">{owner.gstNumber || 'N/A'}</td>
                    <td className="p-4">
                      <div className="text-xs font-semibold">{owner.bankAccount?.bankName}</div>
                      <div className="text-xs text-slate-500">A/C: {owner.bankAccount?.accountNumber}</div>
                      <div className="text-xs text-slate-400">IFSC: {owner.bankAccount?.ifscCode}</div>
                    </td>
                    <td className="p-4 space-y-1">
                      <div>Aadhar: {owner.kyc?.aadharNumber || 'N/A'}</div>
                      <div>PAN: {owner.kyc?.panNumber || 'N/A'}</div>
                      <div className="flex gap-2 text-xs pt-1">
                        {owner.kyc?.kycDocumentUrl && (
                          <a
                            href={owner.kyc.kycDocumentUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-orange-600 hover:underline font-semibold"
                          >
                            📄 KYC File
                          </a>
                        )}
                        {owner.kyc?.bankProofUrl && (
                          <a
                            href={owner.kyc.bankProofUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-orange-600 hover:underline font-semibold"
                          >
                            📄 Bank Proof
                          </a>
                        )}
                      </div>
                    </td>
                    <td className="p-4">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          owner.status === 'active'
                            ? 'bg-green-50 text-green-700 border border-green-150'
                            : owner.status === 'pending'
                            ? 'bg-yellow-50 text-yellow-700 border border-yellow-150'
                            : owner.status === 'suspended'
                            ? 'bg-orange-50 text-orange-700 border border-orange-150'
                            : 'bg-red-50 text-red-700 border border-red-150'
                        }`}
                      >
                        {owner.status}
                      </span>
                    </td>
                    <td className="p-4 space-x-2">
                      {owner.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleApprove(owner._id)}
                            className="bg-green-600 hover:bg-green-700 text-white px-2.5 py-1 rounded text-xs transition-colors font-medium"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleReject(owner._id)}
                            className="bg-red-600 hover:bg-red-700 text-white px-2.5 py-1 rounded text-xs transition-colors font-medium"
                          >
                            Reject
                          </button>
                        </>
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
};

export default GymOwnersList;
