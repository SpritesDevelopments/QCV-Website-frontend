'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { products as productsApi } from '@/lib/api';
import Link from 'next/link';
import { CheckCircle, Loader } from 'lucide-react';

function PaymentSuccessContent() {
  const searchParams = useSearchParams();
  const { token } = useAuth();
  const [status, setStatus] = useState<'verifying' | 'success' | 'failed'>('verifying');
  const sessionId = searchParams.get('session_id');

  useEffect(() => {
    if (!sessionId || !token) return;
    productsApi
      .verifyPayment(token, sessionId)
      .then((r) => setStatus(r.status === 'completed' ? 'success' : 'failed'))
      .catch(() => setStatus('failed'));
  }, [sessionId, token]);

  return (
    <div className="max-w-lg mx-auto px-4 py-20 text-center animate-fade-in-up">
      <div className="glass-card p-12">
        {status === 'verifying' ? (
          <>
            <Loader className="w-16 h-16 mx-auto mb-4 text-primary-400 animate-spin" />
            <h1 className="text-2xl font-bold mb-2">Verifying payment...</h1>
          </>
        ) : status === 'success' ? (
          <>
            <CheckCircle className="w-16 h-16 mx-auto mb-4 text-green-400" />
            <h1 className="text-2xl font-bold mb-2">Payment Successful!</h1>
            <p className="text-gray-400 mb-6">Thank you for your purchase. You can now download your product.</p>
            <Link href="/shop" className="btn-primary">Back to Shop</Link>
          </>
        ) : (
          <>
            <h1 className="text-2xl font-bold mb-2 text-red-400">Payment Issue</h1>
            <p className="text-gray-400 mb-6">There was a problem verifying your payment. Please contact support.</p>
            <Link href="/start-chat" className="btn-primary">Contact Support</Link>
          </>
        )}
      </div>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center py-20"><Loader className="w-8 h-8 animate-spin text-primary-400" /></div>}>
      <PaymentSuccessContent />
    </Suspense>
  );
}
