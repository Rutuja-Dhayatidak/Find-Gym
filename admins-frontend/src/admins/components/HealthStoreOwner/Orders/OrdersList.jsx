import React, { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { getOrders, updateOrderStatus } from '../../../../services/healthStoreOwnerApi';

const STATUS_TABS = ['All', 'Pending', 'Confirmed', 'Packed', 'Shipped', 'Delivered', 'Cancelled'];

const STATUS_COLORS = {
  Pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  Confirmed: 'bg-blue-105 bg-blue-100 text-blue-700 border-blue-200',
  Packed: 'bg-indigo-100 text-indigo-700 border-indigo-200',
  Shipped: 'bg-purple-100 text-purple-700 border-purple-200',
  Delivered: 'bg-green-100 text-green-700 border-green-200',
  Cancelled: 'bg-red-100 text-red-700 border-red-200',
};

const OrdersList = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('All');
  const [selectedSource, setSelectedSource] = useState('all');
  const [pagination, setPagination] = useState({ total: 0, page: 1, pages: 1 });
  const [updatingId, setUpdatingId] = useState(null);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        page: pagination.page,
        limit: 10
      };
      if (activeTab !== 'All') params.status = activeTab;
      if (selectedSource !== 'all') params.source = selectedSource;
      const res = await getOrders(params);
      setOrders(res.data.data);
      setPagination(p => ({ ...p, ...res.data.pagination }));
    } catch (err) {
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  }, [activeTab, selectedSource, pagination.page]);

  useEffect(() => {
    fetchOrders();
  }, [activeTab, selectedSource]);

  useEffect(() => {
    if (orders && orders.length > 0) {
      const currentViewed = JSON.parse(localStorage.getItem('viewedOrderIds') || '[]');
      const newViewed = [...currentViewed];
      let updated = false;
      orders.forEach(order => {
        if (!newViewed.includes(order._id)) {
          newViewed.push(order._id);
          updated = true;
        }
      });
      if (updated) {
        localStorage.setItem('viewedOrderIds', JSON.stringify(newViewed));
        window.dispatchEvent(new Event('orders-viewed'));
      }
    }
  }, [orders]);

  const handleStatusChange = async (id, newStatus) => {
    setUpdatingId(id);
    try {
      await updateOrderStatus(id, newStatus);
      toast.success(`Order status updated to ${newStatus}`);
      fetchOrders();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update order status');
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-800">Customer Orders</h2>
        <p className="text-gray-500 text-sm mt-1">Track payments, shipping, delivery status, and order dispatch operations.</p>
      </div>

      {/* Order Source */}
      <div className="bg-white border rounded-2xl p-5 shadow-sm space-y-3">
        <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block">Order Source</label>
        <div className="flex gap-2">
          <button
            onClick={() => {
              setSelectedSource(selectedSource === 'mobile_app' ? 'all' : 'mobile_app');
              setPagination(p => ({ ...p, page: 1 }));
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
              selectedSource === 'mobile_app'
                ? 'bg-red-600 text-white border-red-600 shadow-md shadow-red-600/10'
                : 'bg-white text-gray-600 border-gray-300 hover:border-red-400'
            }`}
          >
            <span>📱</span> Mobile App
          </button>
          <button
            onClick={() => {
              setSelectedSource(selectedSource === 'website' ? 'all' : 'website');
              setPagination(p => ({ ...p, page: 1 }));
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
              selectedSource === 'website'
                ? 'bg-red-600 text-white border-red-600 shadow-md shadow-red-600/10'
                : 'bg-white text-gray-600 border-gray-300 hover:border-red-400'
            }`}
          >
            <span>🌐</span> Website
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 flex-wrap pb-2 border-b">
        {STATUS_TABS.map(tab => (
          <button key={tab} onClick={() => { setActiveTab(tab); setPagination(p => ({ ...p, page: 1 })); }}
            className={`px-4 py-1.5 rounded-xl text-xs font-semibold border transition-colors ${activeTab === tab ? 'bg-red-600 text-white border-red-600' : 'bg-white text-gray-600 border-gray-300 hover:border-red-400'}`}>
            {tab}
          </button>
        ))}
      </div>

      {/* Orders */}
      {loading ? (
        <div className="p-12 text-center">
          <div className="animate-spin w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full mx-auto mb-3" />
          <p className="text-gray-500">Loading orders...</p>
        </div>
      ) : orders.length === 0 ? (
        <div className="p-12 bg-white border rounded-2xl text-center">
          <p className="text-4xl mb-3">📦</p>
          <p className="text-gray-500 font-medium">No orders found in this category.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map(order => (
            <div key={order._id} className="bg-white border rounded-2xl p-6 shadow-sm space-y-4 hover:shadow-md transition-shadow">
              {/* Order Metadata */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b pb-4">
                <div>
                  <h3 className="font-bold text-base text-gray-800">{order.orderNumber}</h3>
                  <p className="text-xs text-gray-400 mt-0.5">Placed on: {new Date(order.createdAt).toLocaleString('en-IN')}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${STATUS_COLORS[order.orderStatus] || 'bg-gray-150'}`}>
                    Order: {order.orderStatus}
                  </span>
                  <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${order.paymentStatus === 'Paid' ? 'bg-green-105 bg-green-100 text-green-700 border-green-200' : 'bg-red-100 text-red-700 border-red-200'}`}>
                    Payment: {order.paymentStatus}
                  </span>
                  <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${
                    (order.orderSource === 'website' || order.sourceLabel === 'Website')
                      ? 'bg-gray-100 text-gray-700 border-gray-200'
                      : 'bg-orange-100 text-orange-700 border-orange-200'
                  }`}>
                    {order.orderSource === 'website' || order.sourceLabel === 'Website' ? '🌐 Website' : '📱 Mobile App'}
                  </span>
                </div>
              </div>

              {/* Order content */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Products */}
                <div className="md:col-span-2 space-y-3">
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Items Summary</h4>
                  <div className="space-y-3">
                    {order.items?.map((item, idx) => (
                      <div key={idx} className="flex justify-between items-center text-sm">
                        <div>
                          <p className="font-semibold text-gray-800">{item.name}</p>
                          <p className="text-xs text-gray-400 mt-0.5">Type: {item.productType} • Flavor/Qty: {item.flavor || 'N/A'} - {item.quantity}</p>
                        </div>
                        <p className="font-semibold text-gray-700">₹{item.price} x {item.quantity}</p>
                      </div>
                    ))}
                  </div>

                  <div className="border-t pt-3 flex justify-between text-sm">
                    <span className="font-bold text-gray-800">Total Order Value:</span>
                    <span className="font-bold text-red-600">₹{order.total}</span>
                  </div>
                </div>

                {/* Customer Details & Actions */}
                <div className="space-y-4 md:border-l md:pl-6">
                  <div>
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Customer Shipping</h4>
                    <p className="text-sm font-semibold text-gray-800">{order.address?.fullName || order.customer?.name || 'Walk-in Customer'}</p>
                    <p className="text-xs text-gray-500 mt-0.5">Phone: {order.address?.mobile || order.customer?.phone || 'N/A'}</p>
                    <p className="text-xs text-gray-400 mt-1">{order.address?.address || order.shippingAddress || 'Store Pick-up'}</p>
                    <div className="mt-3 space-y-1 text-xs text-gray-600">
                      <p><span className="font-semibold text-gray-500">Order Source:</span> {order.sourceLabel || (order.orderSource === 'website' ? 'Website' : 'Mobile App')}</p>
                      <p><span className="font-semibold text-gray-500">Customer Type:</span> {order.customerTypeLabel || (order.customerType === 'website_user' ? 'Website User' : 'Mobile User')}</p>
                    </div>
                  </div>

                  {/* Transaction Payment Box */}
                  <div className="border-t pt-4 space-y-2 text-xs">
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">💳 Transaction details</h4>
                    <div>
                      <span className="text-gray-450 font-semibold block">Payment Mode:</span>
                      <span className="font-bold text-gray-700">
                        {order.razorpayPaymentId ? 'Online Payment (Razorpay)' : 'Cash on Delivery (COD)'}
                      </span>
                    </div>
                    {order.razorpayPaymentId && (
                      <>
                        <div>
                          <span className="text-gray-450 font-semibold block">Razorpay ID:</span>
                          <span className="font-mono font-bold text-gray-705 text-gray-700 break-all">{order.razorpayPaymentId}</span>
                        </div>
                        <div>
                          <span className="text-gray-450 font-semibold block">Paid From Account:</span>
                          <span className="font-bold text-gray-700">
                            {order.address?.fullName || order.customer?.name || 'Customer'}'s Account (**{order.razorpayPaymentId.slice(-4)})
                          </span>
                        </div>
                      </>
                    )}
                    <div>
                      <span className="text-gray-450 font-semibold block">Payment Date/Time:</span>
                      <span className="font-bold text-gray-700">
                        {new Date(order.createdAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
                      </span>
                    </div>
                  </div>

                  {order.orderStatus !== 'Delivered' && order.orderStatus !== 'Cancelled' && (
                    <div className="border-t pt-4">
                      <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Manage Dispatch Status</label>
                      <select
                        disabled={updatingId === order._id}
                        value={order.orderStatus}
                        onChange={(e) => handleStatusChange(order._id, e.target.value)}
                        className="w-full border rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-red-500"
                      >
                        <option value="Pending">Pending</option>
                        <option value="Confirmed">Confirm Order</option>
                        <option value="Packed">Pack Order</option>
                        <option value="Shipped">Ship Order</option>
                        <option value="Delivered">Deliver Order</option>
                        <option value="Cancelled">Cancel Order</option>
                      </select>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OrdersList;
