import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getMembershipDetails, getQRCode } from '../userServices/membershipApi';
import toast from 'react-hot-toast';

const MembershipPaymentSuccess = () => {
  const { membershipId } = useParams();
  const navigate = useNavigate();

  const [membership, setMembership] = useState(null);
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [memRes, qrRes] = await Promise.all([
          getMembershipDetails(membershipId),
          getQRCode(membershipId)
        ]);
        setMembership(memRes.data);
        setQrCodeUrl(qrRes.qrCodeUrl);
      } catch (err) {
        console.error('Error fetching success details:', err);
        toast.error('Failed to retrieve membership activation details');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [membershipId]);

  const handleDownloadInvoice = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-6">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-zinc-400 font-medium">Activating membership details...</p>
        </div>
      </div>
    );
  }

  const isPending = membership?.status === 'PAY_AT_GYM_PENDING';

  return (
    <div className="min-h-screen bg-black py-10 px-4 md:px-8 print:bg-white print:py-0 text-white">
      <div className="max-w-4xl mx-auto bg-zinc-900/60 rounded-[32px] border border-zinc-800/80 overflow-hidden print:shadow-none print:border-none backdrop-blur-md">
        
        {/* Top Celebration Banner */}
        <div className="p-8 text-center bg-gradient-to-b from-purple-950/20 to-zinc-900/40 border-b border-zinc-800 flex flex-col items-center print:hidden">
          <div className="w-16 h-16 rounded-full bg-emerald-950/50 border-4 border-emerald-900/40 flex items-center justify-center mb-4 text-emerald-400 animate-bounce">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight">
            {isPending ? 'Membership Request Placed!' : 'Payment Successful!'}
          </h1>
          <p className="text-zinc-400 text-xs font-semibold mt-1 max-w-sm">
            {isPending 
              ? 'Please confirm and pay at the gym entrance reception desk to activate.' 
              : 'Welcome to the club! Your membership subscription is now active.'}
          </p>
        </div>

        {/* 2-Column Responsive Layout */}
        <div className="grid grid-cols-1 md:grid-cols-12 divide-y md:divide-y-0 md:divide-x divide-zinc-800/80">
          
          {/* Left Column: Billing Details (7 cols) */}
          <div className="md:col-span-7 p-6 md:p-8 space-y-6">
            <div className="flex items-center gap-3">
              <span className="w-2.5 h-6 bg-purple-600 rounded-full"></span>
              <h3 className="text-sm font-black text-white tracking-tight uppercase">Receipt Summary</h3>
            </div>

            <div className="bg-zinc-950/40 rounded-2xl p-5 border border-zinc-800 text-xs md:text-sm space-y-3.5 print:bg-white print:border-slate-200">
              <div className="flex justify-between text-zinc-400 font-semibold">
                <span>Membership ID</span>
                <span className="font-mono font-bold text-white">{membership?.membershipId || 'N/A'}</span>
              </div>
              <div className="flex justify-between text-zinc-400 font-semibold">
                <span>Gym Name</span>
                <span className="font-bold text-zinc-200">{membership?.gymName || membership?.gymId?.name || 'N/A'}</span>
              </div>
              <div className="flex justify-between text-zinc-400 font-semibold">
                <span>Plan Title</span>
                <span className="font-bold text-zinc-200">{membership?.planName || membership?.planTitle || 'N/A'}</span>
              </div>
              {membership?.startDate && (
                <div className="flex justify-between text-zinc-400 font-semibold">
                  <span>Start Date</span>
                  <span className="font-bold text-zinc-300">{new Date(membership.startDate).toLocaleDateString()}</span>
                </div>
              )}
              {membership?.endDate && (
                <div className="flex justify-between text-zinc-400 font-semibold">
                  <span>End Date</span>
                  <span className="font-bold text-zinc-300">{new Date(membership.endDate).toLocaleDateString()}</span>
                </div>
              )}
              <div className="flex justify-between text-zinc-400 font-semibold">
                <span>Amount Paid</span>
                <span className="font-extrabold text-purple-400 text-base">₹{membership?.amountPaid || membership?.pricePaid || 0}</span>
              </div>
              <div className="flex justify-between text-zinc-400 font-semibold items-center">
                <span>Status Badge</span>
                <span className={`px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                  isPending 
                    ? 'bg-amber-950/40 text-amber-400 border border-amber-900/60' 
                    : 'bg-emerald-955/40 text-emerald-400 border border-emerald-900/60'
                }`}>
                  {isPending ? 'PAY AT GYM PENDING' : 'ACTIVE / PAID'}
                </span>
              </div>
            </div>

            {/* Quick Invoice CTAs */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4 print:hidden">
              <button 
                onClick={() => navigate('/membership/my')}
                className="flex-grow h-11 bg-gradient-to-r from-purple-700 to-indigo-600 hover:from-purple-800 hover:to-indigo-700 text-white font-bold rounded-2xl text-xs transition-all shadow-md shadow-purple-100 flex items-center justify-center gap-2 cursor-pointer outline-none"
              >
                Go to My Membership
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </button>

              <button 
                onClick={handleDownloadInvoice}
                className="px-5 h-11 bg-zinc-950 hover:bg-zinc-900 text-zinc-300 border border-zinc-800 font-bold rounded-2xl text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer outline-none"
              >
                <svg className="w-4 h-4 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                </svg>
                Print / Save PDF
              </button>
            </div>
          </div>

          {/* Right Column: Pass QR Code Verification (5 cols) */}
          <div className="md:col-span-5 p-6 md:p-8 bg-zinc-900/20 flex flex-col justify-center items-center text-center">
            <h3 className="text-xs font-black text-purple-300 uppercase tracking-widest mb-4">Gym Entry Scan Pass</h3>
            {qrCodeUrl ? (
              <div className="bg-white p-4 rounded-3xl border border-purple-900/40 shadow-md inline-block">
                <img src={qrCodeUrl} alt="Entrance QR Pass" className="w-48 h-48" />
              </div>
            ) : (
              <div className="w-48 h-48 bg-zinc-950 rounded-3xl flex items-center justify-center text-zinc-550 border border-dashed border-zinc-800 text-xs">
                Generating pass QR...
              </div>
            )}
            <p className="text-[11px] text-purple-400 font-extrabold uppercase tracking-wider mt-4 leading-relaxed max-w-xs">
              Show this QR Code at the entry gates or gym reception scanner to check in
            </p>
          </div>

        </div>
      </div>
    </div>
  );
};

export default MembershipPaymentSuccess;
