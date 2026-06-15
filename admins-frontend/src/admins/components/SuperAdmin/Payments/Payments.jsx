import React, { useState } from 'react';
import { CreditCard, TrendingUp, Wallet } from 'lucide-react';
import Table from '../../common/Table';
import Badge from '../../common/Badge';
import Button from '../../common/Button';

const Payments = () => {
  const [activeTab, setActiveTab] = useState('transactions');

  const transactions = [
    { id: 'TXN-1001', entity: 'Rahul Sharma', amount: '₹12,000', type: 'Subscription', method: 'UPI', status: 'Success', date: '2024-03-22 10:30 AM' },
    { id: 'TXN-1002', entity: 'Gold\'s Gym', amount: '₹4,500', type: 'Booking', method: 'Credit Card', status: 'Success', date: '2024-03-22 11:15 AM' },
    { id: 'TXN-1003', entity: 'Amit Kumar', amount: '₹8,000', type: 'Trainer Session', method: 'Net Banking', status: 'Pending', date: '2024-03-22 14:20 PM' },
    { id: 'TXN-1004', entity: 'Priya Singh', amount: '₹2,500', type: 'Class Pack', method: 'Wallet', status: 'Failed', date: '2024-03-22 16:45 PM' },
  ];

  const columns = [
    { title: 'Transaction ID', key: 'id' },
    { title: 'User / Gym', key: 'entity' },
    { title: 'Amount', key: 'amount' },
    { 
      title: 'Type', 
      key: 'type',
      render: (row) => <Badge label={row.type} variant="info" className="bg-purple-100 text-purple-800" />
    },
    { title: 'Method', key: 'method' },
    { 
      title: 'Status', 
      key: 'status',
      render: (row) => {
        const variants = { 'Success': 'success', 'Pending': 'warning', 'Failed': 'danger' };
        return <Badge label={row.status} variant={variants[row.status]} />;
      }
    },
    { title: 'Date', key: 'date' },
    { 
      title: 'Actions', 
      key: 'actions',
      render: (row) => (
        <div className="flex gap-2">
           <Button variant="secondary" size="sm">View</Button>
           {row.status === 'Success' && <Button variant="secondary" size="sm" className="text-red-500">Refund</Button>}
        </div>
      )
    },
  ];

  return (
    <div className="animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Payments & Revenue</h1>
          <p className="text-sm text-gray-500">Manage transactions, payouts, and view financial reports</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-6">
        <div className="flex border-b border-gray-200">
          <button 
            className={`flex-1 py-4 px-6 text-sm font-medium flex items-center justify-center gap-2 transition-colors
              ${activeTab === 'transactions' ? 'bg-orange-50 text-primary border-b-2 border-primary' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}
            onClick={() => setActiveTab('transactions')}
          >
            <CreditCard size={18} /> Transaction History
          </button>
          <button 
            className={`flex-1 py-4 px-6 text-sm font-medium flex items-center justify-center gap-2 transition-colors
              ${activeTab === 'reports' ? 'bg-orange-50 text-primary border-b-2 border-primary' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}
            onClick={() => setActiveTab('reports')}
          >
            <TrendingUp size={18} /> Revenue Reports
          </button>
          <button 
            className={`flex-1 py-4 px-6 text-sm font-medium flex items-center justify-center gap-2 transition-colors
              ${activeTab === 'payouts' ? 'bg-orange-50 text-primary border-b-2 border-primary' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}
            onClick={() => setActiveTab('payouts')}
          >
            <Wallet size={18} /> Payout Management
          </button>
        </div>

        {activeTab === 'transactions' && (
          <div className="p-0">
             <Table data={transactions} columns={columns} />
          </div>
        )}

        {activeTab === 'reports' && (
          <div className="p-8 text-center text-gray-500">
            Revenue Reports Charts (To be implemented with Chart.js)
          </div>
        )}

        {activeTab === 'payouts' && (
          <div className="p-8 text-center text-gray-500">
            Payout Management Table (Pending settlements to gyms/trainers)
          </div>
        )}
      </div>
    </div>
  );
};

export default Payments;
