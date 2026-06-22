import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { getDashboard } from '../../../../services/healthStoreOwnerApi';

const Dashboard = () => {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isPaymentInfoOpen, setIsPaymentInfoOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await getDashboard();
        setData(res.data.data);
      } catch (err) {
        toast.error('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[300px]">
        <div className="animate-spin w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full mb-3" />
        <p className="text-gray-500 text-sm">Loading statistics...</p>
      </div>
    );
  }

  const stats = data?.stats || {};
  const recentOrders = data?.recentOrders || [];

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-red-600/10 rounded-full blur-2xl pointer-events-none" />
        <div>
          <h2 className="text-xl font-bold">Hello Store Manager! 👋</h2>
          <p className="text-slate-400 text-xs mt-1">Manage your active products, track orders, and view performance metrics here.</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => navigate('/health-store-owner/diet-foods/add')} className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-xl text-xs font-bold transition-colors">
            🥗 Add Diet Plan
          </button>
          <button onClick={() => navigate('/health-store-owner/supplements/add')} className="bg-white hover:bg-slate-100 text-slate-800 px-4 py-2 rounded-xl text-xs font-bold transition-colors">
            💊 Add Supplement
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border rounded-2xl p-5 shadow-sm">
          <p className="text-gray-400 text-xs font-semibold uppercase">Total Revenue</p>
          <p className="text-2xl font-bold text-gray-800 mt-2">₹{stats.totalRevenue?.toLocaleString('en-IN') || 0}</p>
          <span className="text-[10px] text-green-600 font-bold bg-green-50 px-2 py-0.5 rounded-full mt-2 inline-block">Paid Orders</span>
        </div>

        <div className="bg-white border rounded-2xl p-5 shadow-sm">
          <p className="text-gray-400 text-xs font-semibold uppercase">Total Orders</p>
          <p className="text-2xl font-bold text-gray-800 mt-2">{stats.totalOrders || 0}</p>
          <span className="text-[10px] text-gray-500 mt-2 inline-block">{stats.pendingOrders || 0} pending orders</span>
        </div>

        <div className="bg-white border rounded-2xl p-5 shadow-sm">
          <p className="text-gray-400 text-xs font-semibold uppercase">Products Live</p>
          <p className="text-2xl font-bold text-gray-800 mt-2">{stats.liveProducts || 0}</p>
          <span className="text-[10px] text-blue-600 font-bold bg-blue-50 px-2 py-0.5 rounded-full mt-2 inline-block">{stats.totalProducts || 0} total listings</span>
        </div>

        <div className="bg-white border rounded-2xl p-5 shadow-sm">
          <p className="text-gray-400 text-xs font-semibold uppercase">Needs Approval</p>
          <p className="text-2xl font-bold text-orange-600 mt-2">{stats.pendingProducts || 0}</p>
          <span className="text-[10px] text-orange-600 font-bold bg-orange-50 px-2 py-0.5 rounded-full mt-2 inline-block">Pending Admin Verification</span>
        </div>
      </div>

      {stats.lowStockProducts > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl">⚠️</span>
            <div>
              <p className="text-sm font-semibold text-red-800">Low Stock Alert!</p>
              <p className="text-xs text-red-600">You have {stats.lowStockProducts} products that are running low on stock.</p>
            </div>
          </div>
          <button onClick={() => navigate('/health-store-owner/supplements')} className="bg-red-600 hover:bg-red-700 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition-colors">
            Update Stock
          </button>
        </div>
      )}

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Orders */}
        <div className="lg:col-span-2 bg-white border rounded-2xl p-6 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-gray-800">Recent Orders</h3>
            <button onClick={() => navigate('/health-store-owner/orders')} className="text-xs font-bold text-red-600 hover:text-red-700">
              View All Orders →
            </button>
          </div>

          {recentOrders.length === 0 ? (
            <div className="p-8 text-center text-gray-400 text-sm">
              No orders placed yet.
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {recentOrders.map(order => (
                <div 
                  key={order._id} 
                  onClick={() => setSelectedOrder(order)}
                  className="py-3 flex justify-between items-center gap-4 text-sm cursor-pointer hover:bg-slate-50 transition-colors px-3 rounded-xl border border-transparent hover:border-slate-100"
                >
                  <div>
                    <p className="font-bold text-gray-850">{order.orderNumber}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{order.customer?.name || order.address?.fullName} ({order.customer?.email || order.address?.email})</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-800">₹{order.total}</p>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      order.orderStatus === 'Delivered' ? 'bg-green-100 text-green-700' :
                      order.orderStatus === 'Cancelled' ? 'bg-red-100 text-red-700' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {order.orderStatus}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Store Summary */}
        <div className="bg-white border rounded-2xl p-6 shadow-sm space-y-4">
          <h3 className="font-bold text-gray-800">Product Breakdown</h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Live Items</span>
              <span className="font-bold text-gray-800">{stats.liveProducts}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Drafts</span>
              <span className="font-bold text-gray-800">{stats.draftProducts}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Pending Approval</span>
              <span className="font-bold text-gray-800">{stats.pendingProducts}</span>
            </div>
            <div className="flex justify-between border-t pt-2">
              <span className="text-gray-700 font-medium">Total Listings</span>
              <span className="font-bold text-red-600">{stats.totalProducts}</span>
            </div>
          </div>
        </div>
      </div>
      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 sweet-modal-backdrop">
          <style>{`
            @keyframes sweet-zoom {
              0% { transform: scale(0.85); opacity: 0; }
              70% { transform: scale(1.03); }
              100% { transform: scale(1); opacity: 1; }
            }
            @keyframes sweet-fade {
              from { opacity: 0; }
              to { opacity: 1; }
            }
            .sweet-modal-backdrop {
              animation: sweet-fade 0.2s ease-out forwards;
            }
            .sweet-modal-content {
              animation: sweet-zoom 0.35s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
            }
            .custom-scrollbar::-webkit-scrollbar {
              width: 5px;
            }
            .custom-scrollbar::-webkit-scrollbar-track {
              background: transparent;
            }
            .custom-scrollbar::-webkit-scrollbar-thumb {
              background: #cbd5e1;
              border-radius: 9999px;
            }
            .custom-scrollbar::-webkit-scrollbar-thumb:hover {
              background: #94a3b8;
            }
          `}</style>
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 md:p-8 shadow-2xl relative overflow-hidden max-h-[90vh] flex flex-col text-slate-800 sweet-modal-content">
            {/* Header */}
            <div className="flex justify-between items-start border-b pb-4 mb-4">
              <div>
                <p className="text-[10px] text-gray-400 font-extrabold uppercase tracking-widest">Order Details</p>
                <h3 className="text-xl font-bold text-slate-900 mt-0.5">{selectedOrder.orderNumber}</h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Placed on: {new Date(selectedOrder.createdAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
                </p>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="text-gray-400 hover:text-gray-600 bg-slate-100 hover:bg-slate-200 rounded-full p-2 transition-colors cursor-pointer"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Body */}
            <div className="overflow-y-auto pr-1 space-y-6 text-sm flex-grow custom-scrollbar">
              {/* Customer & Shipping Section */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 p-5 rounded-2xl border border-slate-100">
                <div>
                  <h4 className="font-extrabold text-xs text-slate-500 uppercase tracking-wider mb-2.5">👤 Customer Information</h4>
                  <p className="font-bold text-slate-800">{selectedOrder.address?.fullName || selectedOrder.customer?.name || 'N/A'}</p>
                  <p className="text-xs text-slate-500 mt-1">📧 {selectedOrder.address?.email || selectedOrder.customer?.email}</p>
                  <p className="text-xs text-slate-500 mt-1">📞 {selectedOrder.address?.mobile || 'N/A'}</p>
                </div>
                <div>
                  <h4 className="font-extrabold text-xs text-slate-500 uppercase tracking-wider mb-2.5">📍 Shipping Address</h4>
                  <p className="text-xs text-slate-700 leading-relaxed">
                    {selectedOrder.address?.address || selectedOrder.address || 'N/A'}
                  </p>
                </div>
              </div>

              {/* Items Section */}
              <div className="space-y-3">
                <h4 className="font-extrabold text-xs text-slate-500 uppercase tracking-wider">📦 Ordered Products</h4>
                <div className="divide-y divide-slate-100 border rounded-2xl bg-white overflow-hidden">
                  {selectedOrder.items?.map((item, idx) => (
                    <div key={idx} className="p-4 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3.5">
                        {item.image ? (
                          <img src={item.image} alt={item.name} className="w-14 h-14 object-cover rounded-xl border border-slate-150" />
                        ) : (
                          <div className="w-14 h-14 bg-slate-100 flex items-center justify-center rounded-xl text-2xl border border-slate-150">
                            {item.productType === 'Diet' ? '🥗' : '💊'}
                          </div>
                        )}
                        <div>
                          <p className="font-bold text-slate-900 leading-snug">{item.name}</p>
                          <p className="text-[10px] text-gray-500 mt-1.5 flex items-center gap-2">
                            <span className="bg-slate-100 px-2 py-0.5 rounded font-bold uppercase text-[9px]">{item.productType}</span>
                            <span>Qty: <strong className="text-slate-800 font-bold">{item.quantity}</strong></span>
                            {item.purchaseType === 'Monthly' && <span className="text-red-650 font-extrabold bg-red-50 px-1.5 py-0.5 rounded text-[9px]">Monthly Plan</span>}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-slate-900">₹{item.price * item.quantity}</p>
                        <p className="text-[10px] text-gray-400 mt-0.5">₹{item.price} each</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Premium Payment Details Section */}
              <div className="bg-slate-50 rounded-2xl border border-slate-150 overflow-hidden transition-all duration-355 shadow-sm">
                <button
                  type="button"
                  onClick={() => setIsPaymentInfoOpen(!isPaymentInfoOpen)}
                  className="w-full flex justify-between items-center p-5 text-left font-extrabold text-xs text-slate-550 uppercase tracking-wider hover:bg-slate-100/60 transition-colors focus:outline-none"
                >
                  <span className="flex items-center gap-2">💳 Detailed Transaction & Payment Info</span>
                  <span className={`text-[10px] text-slate-400 transition-transform duration-300 ${isPaymentInfoOpen ? 'rotate-180' : ''}`}>
                    ▼
                  </span>
                </button>
                
                {isPaymentInfoOpen && (
                  <div className="px-5 pb-5 pt-1 space-y-3.5 text-xs border-t border-slate-100 animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3.5">
                      <div>
                        <span className="text-gray-400 font-bold uppercase tracking-wider block">Order / Payment ID</span>
                        <span className="font-bold text-slate-800 text-[13px]">{selectedOrder.orderNumber}</span>
                      </div>
                      <div>
                        <span className="text-gray-400 font-bold uppercase tracking-wider block">Payment Status</span>
                        <span className={`inline-block font-extrabold mt-1 px-3 py-1 rounded-lg ${
                          selectedOrder.paymentStatus === 'Paid' ? 'bg-green-100 text-green-700 font-black' : 'bg-yellow-100 text-yellow-800 font-black'
                        }`}>
                          {selectedOrder.paymentStatus}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-400 font-bold uppercase tracking-wider block">Date & Time</span>
                        <span className="font-bold text-slate-800">
                          {new Date(selectedOrder.createdAt).toLocaleDateString('en-IN')} at {new Date(selectedOrder.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-400 font-bold uppercase tracking-wider block">Payment Mode</span>
                        <span className="font-bold text-slate-800">
                          {selectedOrder.razorpayPaymentId ? 'Online Payment (Razorpay)' : 'Cash on Delivery (COD)'}
                        </span>
                      </div>
                      {selectedOrder.razorpayPaymentId && (
                        <>
                          <div>
                            <span className="text-gray-400 font-bold uppercase tracking-wider block">Razorpay Payment ID</span>
                            <span className="font-mono font-bold text-slate-700">{selectedOrder.razorpayPaymentId}</span>
                          </div>
                          <div>
                            <span className="text-gray-400 font-bold uppercase tracking-wider block">Paid From Account</span>
                            <span className="font-bold text-slate-800">
                              {selectedOrder.address?.fullName || selectedOrder.customer?.name || 'Customer'}'s Account (Ending in **{selectedOrder.razorpayPaymentId.slice(-4)})
                            </span>
                          </div>
                        </>
                      )}
                      <div>
                        <span className="text-gray-400 font-bold uppercase tracking-wider block">Customer Mobile</span>
                        <span className="font-bold text-slate-800">{selectedOrder.address?.mobile || selectedOrder.customer?.phone || 'N/A'}</span>
                      </div>
                      <div>
                        <span className="text-gray-400 font-bold uppercase tracking-wider block">Customer Name</span>
                        <span className="font-bold text-slate-800">{selectedOrder.address?.fullName || selectedOrder.customer?.name || 'Walk-in'}</span>
                      </div>
                      <div>
                        <span className="text-gray-400 font-bold uppercase tracking-wider block">Order Dispatch Status</span>
                        <span className={`inline-block font-extrabold mt-1 px-3 py-1 rounded-lg ${
                          selectedOrder.orderStatus === 'Delivered' ? 'bg-green-100 text-green-700' :
                          selectedOrder.orderStatus === 'Cancelled' ? 'bg-red-100 text-red-700' :
                          'bg-orange-100 text-orange-700'
                        }`}>
                          {selectedOrder.orderStatus}
                        </span>
                      </div>
                    </div>

                    {/* Items and Quantities summary in Payment Box */}
                    <div className="border-t pt-3 mt-1.5 text-[11px] text-slate-500">
                      <span className="font-semibold block mb-1">Purchased Products Summary:</span>
                      <ul className="list-disc pl-4 space-y-0.5 font-medium">
                        {selectedOrder.items?.map((item, idx) => (
                          <li key={idx}>
                            {item.name} - Qty: <strong className="text-slate-700 font-bold">{item.quantity}</strong>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
              </div>

              {/* Pricing breakdown */}
              <div className="border-t pt-4 space-y-2 text-xs">
                <div className="flex justify-between text-gray-500">
                  <span>Subtotal</span>
                  <span>₹{selectedOrder.subtotal}</span>
                </div>
                <div className="flex justify-between text-gray-500">
                  <span>Delivery Charge</span>
                  <span>₹{selectedOrder.deliveryCharge}</span>
                </div>
                {selectedOrder.discount > 0 && (
                  <div className="flex justify-between text-green-600 font-medium">
                    <span>Discount</span>
                    <span>-₹{selectedOrder.discount}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm font-extrabold text-slate-900 border-t pt-2">
                  <span>Total Amount Paid</span>
                  <span>₹{selectedOrder.total}</span>
                </div>
              </div>
            </div>

            {/* Actions Footer */}
            <div className="border-t pt-4 mt-4 flex justify-end gap-3">
              <button
                onClick={() => setSelectedOrder(null)}
                className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors cursor-pointer border-0"
              >
                Close Details
              </button>
              <button
                onClick={() => { setSelectedOrder(null); navigate('/health-store-owner/orders'); }}
                className="px-5 py-2.5 bg-red-650 hover:bg-red-700 text-white font-bold text-xs rounded-xl transition-all cursor-pointer border-0 shadow-md"
              >
                Manage Status &rarr;
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
