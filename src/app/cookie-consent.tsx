'use client';

import { useState, useEffect } from 'react';
import Script from 'next/script';

const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

export function CookieConsent() {
  const [consent, setConsent] = useState<'pending' | 'accepted' | 'declined'>('pending');
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('cookie_consent');
    if (stored === 'accepted') {
      setConsent('accepted');
    } else if (stored === 'declined') {
      setConsent('declined');
    } else {
      // Small delay so banner doesn't flash on initial load
      const timer = setTimeout(() => setVisible(true), 500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('cookie_consent', 'accepted');
    setConsent('accepted');
    setVisible(false);
  };

  const handleDecline = () => {
    localStorage.setItem('cookie_consent', 'declined');
    setConsent('declined');
    setVisible(false);
  };

  return (
    <>
      {/* Only load GA after consent and when measurement ID is configured */}
      {consent === 'accepted' && GA_MEASUREMENT_ID && (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
            strategy="afterInteractive"
          />
          <Script id="google-analytics" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${GA_MEASUREMENT_ID}');
            `}
          </Script>
        </>
      )}

      {/* Cookie consent banner */}
      {visible && consent === 'pending' && (
        <div className="fixed bottom-0 left-0 right-0 z-[100] p-4 md:p-6">
          <div className="max-w-2xl mx-auto bg-[#1a1a1a] border border-[#333] p-5 md:p-6 shadow-[0_-4px_30px_rgba(0,0,0,0.5)]">
            <p className="text-sm text-[#aaa] mb-4 leading-relaxed">
              We use cookies for analytics to improve your experience. Your marketing data is processed by Google Gemini AI.{' '}
              <a href="/privacy" className="text-[#FF0066] hover:text-[#FFFF00] underline">Privacy Policy</a>
            </p>
            <div className="flex items-center gap-3">
              <button
                onClick={handleAccept}
                className="px-5 py-2 bg-[#FFFF00] text-black font-display text-sm tracking-wider hover:bg-white transition-colors"
              >
                ACCEPT
              </button>
              <button
                onClick={handleDecline}
                className="px-5 py-2 border border-[#555] text-[#aaa] font-display text-sm tracking-wider hover:border-white hover:text-white transition-colors"
              >
                DECLINE
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
