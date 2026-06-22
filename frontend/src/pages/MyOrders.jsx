import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getUserOrders } from "../userServices/publicHealthStoreApi";
import toast from "react-hot-toast";

const MyOrders = () => {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all"); // 'all', 'active', 'delivered', 'cancelled'
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const token = localStorage.getItem("userToken");
        if (!token) {
          toast.error("Please login to view orders");
          navigate("/login");
          return;
        }

        const ordersRes = await getUserOrders();
        if (ordersRes.success) {
          const allOrders = ordersRes.data || [];
          setOrders(allOrders);
          setFilteredOrders(allOrders);
        } else {
          toast.error("Failed to load orders");
        }
      } catch (err) {
        console.error("Error loading orders:", err);
        toast.error("Session expired or server error. Please login again.");
        navigate("/login");
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [navigate]);

  // Apply tab filters whenever activeTab or orders change
  useEffect(() => {
    if (activeTab === "all") {
      setFilteredOrders(orders);
    } else if (activeTab === "active") {
      // Pending, Packed, Shipped or Confirmed orders
      setFilteredOrders(
        orders.filter(
          (o) =>
            !["Delivered", "Cancelled", "Refunded"].includes(o.orderStatus)
        )
      );
    } else if (activeTab === "delivered") {
      setFilteredOrders(orders.filter((o) => o.orderStatus === "Delivered"));
    } else if (activeTab === "cancelled") {
      setFilteredOrders(
        orders.filter((o) => ["Cancelled", "Refunded"].includes(o.orderStatus))
      );
    }
  }, [activeTab, orders]);

  const renderTrackingTimeline = (status) => {
    if (["Cancelled", "Refunded"].includes(status)) {
      return (
        <div className="flex items-center gap-2 text-red-500 bg-red-500/10 border border-red-500/20 px-4 py-2.5 rounded-xl text-xs font-semibold">
          <span>❌</span> Order status: {status}
        </div>
      );
    }

    const steps = [
      { label: "Placed", statusKey: "Pending" },
      { label: "Packed", statusKey: "Packed" },
      { label: "Shipped", statusKey: "Shipped" },
      { label: "Delivered", statusKey: "Delivered" },
    ];

    let currentIndex = 0;
    if (status === "Confirmed" || status === "Pending") currentIndex = 0;
    else if (status === "Packed") currentIndex = 1;
    else if (status === "Shipped") currentIndex = 2;
    else if (status === "Delivered") currentIndex = 3;

    return (
      <div className="w-full mt-4 bg-[#070708] border border-white/5 rounded-2xl p-4">
        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-4">
          Order Tracking Timeline
        </p>
        <div className="flex items-center justify-between relative px-2">
          {/* Progress line connector */}
          <div className="absolute left-6 right-6 top-[15px] h-[2px] bg-white/10 z-0">
            <div
              className="h-full bg-gradient-to-r from-[#FF7A00] to-orange-400 transition-all duration-500"
              style={{ width: `${(currentIndex / (steps.length - 1)) * 100}%` }}
            />
          </div>

          {/* Steps rendering */}
          {steps.map((step, idx) => {
            const isCompleted = idx <= currentIndex;
            return (
              <div key={idx} className="flex flex-col items-center relative z-10">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center border font-bold text-xs transition-all duration-300 ${
                    isCompleted
                      ? "bg-[#FF7A00] border-[#FF7A00] text-white shadow-[0_0_10px_rgba(255,122,0,0.4)]"
                      : "bg-[#111112] border-white/10 text-gray-500"
                  }`}
                >
                  {isCompleted ? "✓" : idx + 1}
                </div>
                <span
                  className={`text-[9px] font-bold mt-2 ${
                    isCompleted ? "text-white" : "text-gray-500"
                  }`}
                >
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#070708] flex items-center justify-center text-white">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 border-4 border-[#FF7A00] border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-400 text-sm">Loading your orders...</p>
        </div>
      </div>
    );
  }

  // Count helper functions for tab indicators
  const activeCount = orders.filter(
    (o) => !["Delivered", "Cancelled", "Refunded"].includes(o.orderStatus)
  ).length;
  const deliveredCount = orders.filter((o) => o.orderStatus === "Delivered").length;
  const cancelledCount = orders.filter((o) =>
    ["Cancelled", "Refunded"].includes(o.orderStatus)
  ).length;

  return (
    <div className="pt-24 pb-12 min-h-screen bg-[#070708] text-white px-4 md:px-8 max-w-5xl mx-auto font-sans">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">
            My <span className="text-[#FF7A00]">Orders</span>
          </h1>
          <p className="text-gray-400 text-xs mt-1">
            Track, view and filter all your health store purchases.
          </p>
        </div>
        <Link
          to="/profile"
          className="px-4 py-2 border border-zinc-700 text-zinc-300 hover:text-white hover:bg-white/5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
        >
          👤 Back to Profile
        </Link>
      </div>

      {/* History Tabs Filter */}
      <div className="flex flex-wrap gap-2 mb-6 bg-[#111112] border border-white/5 p-2 rounded-2xl">
        <button
          onClick={() => setActiveTab("all")}
          className={`flex-1 min-w-[80px] py-2.5 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === "all"
              ? "bg-[#FF7A00] text-white shadow-lg shadow-[#FF7A00]/25"
              : "text-gray-400 hover:text-white hover:bg-white/[0.02]"
          }`}
        >
          All ({orders.length})
        </button>
        <button
          onClick={() => setActiveTab("active")}
          className={`flex-1 min-w-[80px] py-2.5 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === "active"
              ? "bg-[#FF7A00] text-white shadow-lg shadow-[#FF7A00]/25"
              : "text-gray-400 hover:text-white hover:bg-white/[0.02]"
          }`}
        >
          Active ({activeCount})
        </button>
        <button
          onClick={() => setActiveTab("delivered")}
          className={`flex-1 min-w-[80px] py-2.5 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === "delivered"
              ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/25"
              : "text-gray-400 hover:text-white hover:bg-white/[0.02]"
          }`}
        >
          Delivered ({deliveredCount})
        </button>
        <button
          onClick={() => setActiveTab("cancelled")}
          className={`flex-1 min-w-[80px] py-2.5 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === "cancelled"
              ? "bg-red-650 text-white shadow-lg shadow-red-650/25"
              : "text-gray-400 hover:text-white hover:bg-white/[0.02]"
          }`}
        >
          Cancelled ({cancelledCount})
        </button>
      </div>

      <div className="bg-[#111112] border border-white/5 rounded-3xl p-5 md:p-6 shadow-xl space-y-6">
        <div className="flex justify-between items-center border-b border-white/5 pb-3">
          <h3 className="font-black text-sm text-white flex items-center gap-2">
            📦 {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Orders
          </h3>
          <span className="text-[10px] bg-[#FF7A00]/10 border border-[#FF7A00]/25 text-[#FF7A00] px-3 py-1 rounded-full font-bold uppercase tracking-wider">
            {filteredOrders.length} Shown
          </span>
        </div>

        {filteredOrders.length > 0 ? (
          <div className="space-y-6">
            {filteredOrders.map((order) => (
              <div
                key={order._id}
                className="p-4 md:p-5 bg-black/40 border border-white/5 rounded-2xl space-y-4"
              >
                {/* Order Meta Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-white/5 pb-3">
                  <div>
                    <p className="text-[9px] text-gray-500 font-bold uppercase tracking-wider">
                      Order Number
                    </p>
                    <p className="text-xs font-black text-white mt-0.5">
                      {order.orderNumber}
                    </p>
                  </div>
                  <div>
                    <p className="text-[9px] text-gray-500 font-bold uppercase tracking-wider">
                      Date Placed
                    </p>
                    <p className="text-[10px] font-semibold text-gray-300 mt-0.5">
                      {new Date(order.createdAt).toLocaleDateString("en-GB", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <span
                      className={`px-2.5 py-1 rounded-md text-[8px] font-extrabold uppercase tracking-wider ${
                        order.paymentStatus === "Paid"
                          ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400"
                          : "bg-yellow-500/10 border border-yellow-500/20 text-yellow-400"
                      }`}
                    >
                      {order.paymentStatus}
                    </span>
                    <span
                      className={`px-2.5 py-1 rounded-md text-[8px] font-extrabold uppercase tracking-wider ${
                        ["Delivered", "Confirmed"].includes(order.orderStatus)
                          ? "bg-green-500/10 border border-green-500/20 text-green-400"
                          : order.orderStatus === "Cancelled"
                          ? "bg-red-500/10 border border-red-500/20 text-red-400"
                          : "bg-[#FF7A00]/10 border border-[#FF7A00]/25 text-[#FF7A00]"
                      }`}
                    >
                      {order.orderStatus}
                    </span>
                  </div>
                </div>

                {/* Order Items */}
                <div className="space-y-3">
                  {order.items.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex justify-between items-center gap-4 bg-[#111112]/40 p-3 rounded-xl border border-white/[0.02]"
                    >
                      <div className="flex items-center gap-3">
                        {item.image ? (
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-12 h-12 object-cover rounded-lg border border-white/5"
                          />
                        ) : (
                          <div className="w-12 h-12 bg-black flex items-center justify-center rounded-lg text-lg border border-white/5">
                            {item.productType === "Diet" ? "🥗" : "💊"}
                          </div>
                        )}
                        <div>
                          <h4 className="font-bold text-xs text-white leading-tight">
                            {item.name}
                          </h4>
                          <p className="text-[10px] text-gray-500 mt-1">
                            Qty:{" "}
                            <span className="font-semibold text-gray-300">
                              {item.quantity}
                            </span>
                            {item.purchaseType === "Monthly" && (
                              <span className="ml-2 text-[#FF7A00] font-bold">
                                Monthly Plan
                              </span>
                            )}
                          </p>
                        </div>
                      </div>
                      <span className="font-extrabold text-xs text-white">
                        ₹{item.price * item.quantity}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Tracking Timeline */}
                {renderTrackingTimeline(order.orderStatus)}

                {/* Delivery & Pricing Details */}
                <div className="text-[10px] text-gray-400 border-t border-white/5 pt-3 flex flex-col sm:flex-row justify-between gap-2">
                  <p className="leading-relaxed">
                    📍 <span className="font-bold text-gray-300">Deliver to:</span>{" "}
                    {order.address?.address || order.address}
                  </p>
                  <p className="font-bold text-white shrink-0">
                    Paid Total:{" "}
                    <span className="text-[#FF7A00] text-xs">₹{order.total}</span>
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-center text-zinc-500 text-xs gap-3">
            <span className="text-4xl">📦</span>
            <p>No {activeTab !== "all" ? activeTab : ""} orders found here.</p>
            {activeTab === "all" && (
              <Link
                to="/categories"
                className="px-4 py-2 bg-[#FF7A00] hover:bg-orange-600 text-white font-bold text-[10px] rounded-xl transition-all uppercase tracking-wider"
              >
                Browse Health Store &rarr;
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyOrders;
