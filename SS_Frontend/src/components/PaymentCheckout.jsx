import React, { useEffect, useRef, useState } from 'react';
import NavBar from './NavBar';
import Footer from './Footer';

/* ------------------------------------------------------------------ */
/*  PaymentCheckoutFlow.jsx — Tailwind CSS version                    */
/*  Same visual language as TermsAndConditions.jsx (slate palette,    */
/*  rounded cards, scroll-reveal). Drop into any Tailwind React app.  */
/* ------------------------------------------------------------------ */

/* ── Icons ── */
const icon = (paths, viewBox = '0 0 24 24') => ({ className = '' }) => (
  <svg className={className} width="22" height="22" viewBox={viewBox} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    {paths}
  </svg>
);

const ShirtIcon = icon(
  <path d="M16 3l3 3-3 9-3-3m-2 0-3 3-3-9 3-3M8 3a4 4 0 0 0 8 0" />
);
const CartIcon = icon(
  <>
    <circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" />
    <path d="M1 1h4l2.7 13.4a2 2 0 0 0 2 1.6h9.7a2 2 0 0 0 2-1.6L23 6H6" />
  </>
);
const LogInIcon = icon(
  <>
    <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
    <polyline points="10 17 15 12 10 7" /><line x1="15" y1="12" x2="3" y2="12" />
  </>
);
const ReceiptIcon = icon(
  <>
    <path d="M4 2h16v20l-3-2-3 2-3-2-3 2-3-2-1 1z" />
    <line x1="8" y1="7" x2="16" y2="7" /><line x1="8" y1="11" x2="16" y2="11" />
  </>
);
const PhonePeIcon = ({ className = '' }) => (
  <svg className={className} width="22" height="22" viewBox="0 0 24 24" fill="none">
    <rect width="24" height="24" rx="6" fill="#5f259f" />
    <text x="12" y="16" textAnchor="middle" fill="white" fontSize="10" fontWeight="bold" fontFamily="sans-serif">P</text>
  </svg>
);
const CheckCircleIcon = icon(
  <>
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <polyline points="22 4 12 14.01 9 11.01" />
  </>
);
const MailIcon = icon(
  <>
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
    <polyline points="22,6 12,13 2,6" />
  </>
);
const TruckIcon = icon(
  <>
    <rect x="1" y="3" width="15" height="13" />
    <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
    <circle cx="5.5" cy="18.5" r="2.5" /><circle cx="18.5" cy="18.5" r="2.5" />
  </>
);

/* ── Step data ── */
const STEPS = [
  {
    n: 1,
    icon: ShirtIcon,
    title: 'Browse & Select',
    desc: 'Customer browses products, selects size/color, and adds item(s) to Cart.',
  },
  {
    n: 2,
    icon: CartIcon,
    title: 'Cart Review',
    desc: 'Customer reviews items, quantities, and total price on the Cart page; a coupon can be applied if available.',
  },
  {
    n: 3,
    icon: LogInIcon,
    title: 'Login / Checkout',
    desc: 'Customer logs in (via Google OAuth or OTP) or proceeds as guest, then enters or selects a shipping address.',
  },
  {
    n: 4,
    icon: ReceiptIcon,
    title: 'Order Summary',
    desc: 'Final order summary is shown with item price, shipping charges (if any), and total payable amount.',
  },
  {
    n: 5,
    icon: PhonePeIcon,
    title: 'Payment',
    desc: 'Customer is redirected to the PhonePe payment gateway to complete payment via UPI, Card, Netbanking, or Wallet.',
    highlight: true,
  },
  {
    n: 6,
    icon: CheckCircleIcon,
    title: 'Payment Confirmation',
    desc: 'On successful payment, PhonePe sends a callback/webhook to our backend; order status updates to "Confirmed".',
    highlight: true,
  },
  {
    n: 7,
    icon: MailIcon,
    title: 'Order Confirmation',
    desc: 'Customer receives an on-screen confirmation, plus email/SMS with the Order ID and order summary.',
  },
  {
    n: 8,
    icon: TruckIcon,
    title: 'Fulfillment',
    desc: 'Order is packed and handed to the courier partner; tracking details are shared with the customer.',
  },
];

/* ── Step card with scroll-reveal + connecting line ── */
const StepItem = ({ step, isLast }) => {
  const [visible, setVisible] = useState(false);
  const ref = useRef(null);
  const Icon = step.icon;

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className="relative flex gap-5 sm:gap-6">
      {/* rail: node + connecting line */}
      <div className="flex flex-col items-center">
        <div
          className={`w-11 h-11 sm:w-12 sm:h-12 rounded-full flex items-center justify-center shrink-0 border transition-all duration-500 ${
            visible ? 'opacity-100 scale-100' : 'opacity-0 scale-75'
          } ${
            step.highlight
              ? 'bg-slate-900 border-slate-900 text-white'
              : 'bg-white border-slate-200 text-slate-700'
          }`}
        >
          <Icon className={step.highlight ? 'text-white' : 'text-slate-700'} />
        </div>
        {!isLast && (
          <div className="w-px flex-1 min-h-[36px] bg-gradient-to-b from-slate-300 to-slate-200 my-1" />
        )}
      </div>

      {/* content card */}
      <div
        className={`bg-white rounded-2xl border border-slate-200 p-6 mb-8 shadow-sm flex-1 transition-all duration-[600ms] ${
          visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
        }`}
        style={{ transitionDelay: `${step.n * 60}ms`, transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)' }}
      >
        <div className="flex items-center gap-2.5 mb-2">
          <span className="text-xs font-bold text-slate-400 tracking-widest">STEP {step.n}</span>
          {step.highlight && (
            <span className="text-[10px] font-semibold uppercase tracking-wider bg-slate-900 text-white px-2 py-0.5 rounded-full">
              Payment
            </span>
          )}
        </div>
        <h3 className="text-lg font-bold text-slate-900 mb-1.5">{step.title}</h3>
        <p className="text-[15px] text-slate-600 leading-relaxed">{step.desc}</p>
      </div>
    </div>
  );
};

/* ── Hero ── */
const Hero = () => (
  <section className="pt-16 pb-10 px-6 text-center bg-gradient-to-b from-slate-100 to-slate-50 border-b border-slate-200">
    <div className="inline-flex items-center gap-2 bg-white border border-slate-200 rounded-full px-4 py-1.5 text-sm font-medium text-slate-600 shadow-sm mb-6">
      <PhonePeIcon />
      Powered by PhonePe
    </div>
    <h1 className="text-[clamp(28px,5vw,44px)] font-extrabold text-slate-900 tracking-tight leading-tight mb-4">
      Payment &amp; Checkout Flow
    </h1>
    <p className="text-lg text-slate-500 max-w-xl mx-auto">
      How a customer completes a purchase on <strong>ssgarment.in</strong>, from browsing to fulfillment.
    </p>
  </section>
);

/* ── Main component ── */
const PaymentCheckout = () => {
  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800">
        <NavBar />
      <Hero />

      <div className="max-w-[720px] mx-auto px-6 py-14">
        {STEPS.map((step, i) => (
          <StepItem key={step.n} step={step} isLast={i === STEPS.length - 1} />
        ))}
      </div>
      <Footer />
    </div>
  );
};

export default PaymentCheckout;