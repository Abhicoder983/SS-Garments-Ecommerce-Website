import React, { useState, useEffect, useRef } from 'react';
import Footer from './Footer';
import NavBar from './NavBar';

/* ------------------------------------------------------------------ */
/*  TermsAndConditions.jsx  —  Tailwind CSS version                   */
/*  Drop this into any React + Tailwind project. No extra CSS needed. */
/* ------------------------------------------------------------------ */

/* ── Icons ── */
const ShieldIcon = ({ className = '' }) => (
  <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
);

const FileTextIcon = ({ className = '' }) => (
  <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" />
  </svg>
);

const ChevronRightIcon = ({ className = '' }) => (
  <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="9 18 15 12 9 6" />
  </svg>
);

const ArrowLeftIcon = ({ className = '' }) => (
  <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="15 18 9 12 15 6" />
  </svg>
);

const MailIcon = ({ className = '' }) => (
  <svg className={className} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" />
  </svg>
);

const PhoneIcon = ({ className = '' }) => (
  <svg className={className} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
  </svg>
);

const MapPinIcon = ({ className = '' }) => (
  <svg className={className} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
  </svg>
);

const PhonePeIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
    <rect width="24" height="24" rx="6" fill="#5f259f" />
    <text x="12" y="16" textAnchor="middle" fill="white" fontSize="10" fontWeight="bold" fontFamily="sans-serif">P</text>
  </svg>
);

/* ── Reusable List Item ── */
const ListItem = ({ children }) => (
  <li className="flex gap-3 items-start">
    <ChevronRightIcon className="shrink-0 mt-1 text-slate-400" />
    <span className="flex-1">{children}</span>
  </li>
);

/* ── Site Header / Nav bar ── (was named `Header`, clashing with the main
   page component further down — renamed to SiteHeader) */
const SiteHeader = () => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-white/95 backdrop-blur-md border-b border-slate-200 py-3.5'
          : 'bg-transparent border-b border-transparent py-5'
      }`}
    >
      <div className="max-w-[1100px] mx-auto px-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-[42px] h-[42px] rounded-xl bg-gradient-to-br from-slate-800 to-slate-700 flex items-center justify-center text-white font-extrabold text-lg">
            SS
          </div>
          <div>
            <div className="font-bold text-lg text-slate-900 leading-tight tracking-tight">SS Garments</div>
            <div className="text-xs text-slate-500 font-medium leading-tight">ssgarment.in</div>
          </div>
        </div>
        <a
          href="/"
          className="flex items-center gap-1 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeftIcon />
          Back to Home
        </a>
      </div>
    </header>
  );
};

/* ── Hero ── */
const Hero = () => (
  <section className="pt-[140px] pb-[60px] px-6 text-center bg-gradient-to-b from-slate-100 to-slate-50 border-b border-slate-200">
    <div className="inline-flex items-center gap-2 bg-white border border-slate-200 rounded-full px-4 py-1.5 text-sm font-medium text-slate-600 shadow-sm mb-6">
      <FileTextIcon />
      Last updated: August 11, 2026
    </div>
    <h1 className="text-[clamp(32px,5vw,48px)] font-extrabold text-slate-900 tracking-tight leading-tight mb-4">
      Terms & Conditions
    </h1>
    <p className="text-lg text-slate-500 max-w-xl mx-auto">
      Please read these terms carefully before using our services. By accessing <strong>ssgarment.in</strong>, you agree to be bound by these terms.
    </p>
  </section>
);

/* ── Section Card (with scroll-reveal) ── */
const SectionCard = ({ icon, title, children, index }) => {
  const [visible, setVisible] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`bg-white rounded-2xl border border-slate-200 p-8 mb-5 shadow-sm transition-all duration-[600ms] ${
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      }`}
      style={{ transitionDelay: `${index * 80}ms`, transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)' }}
    >
      <div className="flex items-center gap-3.5 mb-5">
        <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-slate-50 to-slate-100 border border-slate-200 flex items-center justify-center text-slate-700">
          {icon}
        </div>
        <h2 className="text-xl font-bold text-slate-900">{title}</h2>
      </div>
      <div className="text-[15px] text-slate-600 leading-relaxed">{children}</div>
    </div>
  );
};

/* ── Table of Contents (sticky sidebar) ── */
const TOC = () => {
  const sections = [
    { id: 'general', label: 'General' },
    { id: 'orders', label: 'Orders' },
    { id: 'pricing', label: 'Pricing & Payment' },
    { id: 'shipping', label: 'Shipping' },
    { id: 'liability', label: 'Limitation of Liability' },
    { id: 'governing', label: 'Governing Law' },
    { id: 'contact', label: 'Contact' },
  ];

  const [active, setActive] = useState('general');

  useEffect(() => {
    const onScroll = () => {
      for (const s of sections) {
        const el = document.getElementById(s.id);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= 120) setActive(s.id);
        }
      }
    };
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <nav className="sticky top-[100px] bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
      <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">
        On this page
      </div>
      {sections.map((s) => (
        <button
          key={s.id}
          onClick={() => scrollTo(s.id)}
          className={`flex items-center gap-2 w-full px-3 py-2.5 rounded-lg text-sm font-medium transition-all text-left mb-1 ${
            active === s.id
              ? 'bg-slate-100 text-slate-900 font-semibold'
              : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
          }`}
        >
          <span
            className={`w-1.5 h-1.5 rounded-full shrink-0 transition-colors ${
              active === s.id ? 'bg-slate-900' : 'bg-slate-300'
            }`}
          />
          {s.label}
        </button>
      ))}
    </nav>
  );
};

/* ── Footer ── */


/* ═══════════════════════════════════════════════════════════════════ */
/*  MAIN COMPONENT                                                    */
/* ═══════════════════════════════════════════════════════════════════ */
const TermsAndConditions = () => {
  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800">
      <NavBar />
      <Hero />

      <div className="max-w-[1100px] mx-auto px-6 py-12 grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-10">
        {/* Sidebar TOC */}
        <aside className="hidden lg:block">
          <TOC />
        </aside>

        {/* Main Content */}
        <main>
          {/* ── General ── */}
          <div id="general">
            <SectionCard icon={<FileTextIcon />} title="General" index={0}>
              <ul className="flex flex-col gap-3.5 list-none p-0 m-0">
                <ListItem>
                  All content on this website — including text, images, product photographs, logos, and brand assets — is the exclusive property of <strong>SS Garments</strong> and is protected under applicable copyright and trademark laws. It may not be reused, reproduced, or distributed without prior written permission.
                </ListItem>
                <ListItem>
                  We reserve the right to modify products, prices, policies, and these terms at any time without prior notice. Changes will be effective immediately upon posting on this page.
                </ListItem>
                <ListItem>
                  Your continued use of <strong>ssgarment.in</strong> after any changes constitutes your acceptance of the revised terms.
                </ListItem>
              </ul>
            </SectionCard>
          </div>

          {/* ── Orders ── */}
          <div id="orders">
            <SectionCard icon={<FileTextIcon />} title="Orders" index={1}>
              <ul className="flex flex-col gap-3.5 list-none p-0 m-0">
                <ListItem>
                  Placing an order on our website constitutes a binding offer to purchase the selected products. We reserve the right to accept or decline any order at our sole discretion.
                </ListItem>
                <ListItem>
                  We may decline orders due to stock unavailability, pricing errors, suspected fraudulent activity, or shipping restrictions to your location.
                </ListItem>
                <ListItem>
                  An order confirmation will be sent to your registered email address and/or mobile number via SMS once your payment is successfully processed and the order is accepted.
                </ListItem>
                <ListItem>
                  In the event that an item becomes unavailable after you place an order, we will notify you promptly and issue a full refund for the unavailable item.
                </ListItem>
              </ul>
            </SectionCard>
          </div>

          {/* ── Pricing & Payment ── */}
          <div id="pricing">
            <SectionCard icon={<PhonePeIcon />} title="Pricing & Payment" index={2}>
              <ul className="flex flex-col gap-3.5 list-none p-0 m-0">
                <ListItem>
                  All prices listed on <strong>ssgarment.in</strong> are in <strong>Indian Rupees (INR)</strong> and are inclusive of all applicable taxes (GST), unless explicitly stated otherwise.
                </ListItem>
                <ListItem>
                  Additional charges such as shipping fees, if applicable, will be clearly displayed at checkout before you confirm your payment.
                </ListItem>
                <ListItem>
                  Payments are processed securely through our trusted third-party payment gateway partner, <strong>PhonePe</strong>. We support UPI, credit/debit cards, wallets, and net banking via the PhonePe platform.
                </ListItem>
                <ListItem>
                  <strong>SS Garments does not store</strong> your payment credentials, card numbers, or UPI PINs. All payment data is encrypted and handled directly by PhonePe in compliance with PCI-DSS standards.
                </ListItem>
                <ListItem>
                  In the rare event of a payment failure, please do not retry the payment immediately. Verify your account balance and contact our support team if the amount was debited but the order was not confirmed.
                </ListItem>
              </ul>
            </SectionCard>
          </div>

          {/* ── Shipping ── */}
          <div id="shipping">
            <SectionCard icon={<FileTextIcon />} title="Shipping" index={3}>
              <ul className="flex flex-col gap-3.5 list-none p-0 m-0">
                <ListItem>
                  We aim to process and ship all orders within <strong>1–3 business days</strong> from the date of order confirmation. During peak seasons or sales, processing times may extend slightly.
                </ListItem>
                <ListItem>
                  Delivery timelines vary based on your location, courier partner availability, and local logistics conditions. Estimated delivery dates are provided at checkout for your reference.
                </ListItem>
                <ListItem>
                  Once your order is shipped, you will receive a tracking link via email and SMS to monitor the real-time status of your delivery.
                </ListItem>
                <ListItem>
                  Please ensure that your shipping address is accurate and complete. SS Garments is not responsible for delays or non-delivery caused by incorrect addresses provided by the customer.
                </ListItem>
              </ul>
            </SectionCard>
          </div>

          {/* ── Limitation of Liability ── */}
          <div id="liability">
            <SectionCard icon={<ShieldIcon />} title="Limitation of Liability" index={4}>
              <ul className="flex flex-col gap-3.5 list-none p-0 m-0">
                <ListItem>
                  SS Garments shall not be held liable for any delays in delivery caused by third-party courier partners, logistical disruptions, or circumstances beyond our reasonable control.
                </ListItem>
                <ListItem>
                  We are not responsible for delays or failures caused by natural events (floods, earthquakes, pandemics), government actions, strikes, wars, or other force majeure events.
                </ListItem>
                <ListItem>
                  Our total liability to you for any claim arising from your use of this website or purchase of products shall not exceed the total amount paid by you for the specific order in question.
                </ListItem>
                <ListItem>
                  Product colors may vary slightly from photographs due to screen calibration and lighting during photography. Such variations do not qualify as defects.
                </ListItem>
              </ul>
            </SectionCard>
          </div>

          {/* ── Governing Law ── */}
          <div id="governing">
            <SectionCard icon={<FileTextIcon />} title="Governing Law" index={5}>
              <ul className="flex flex-col gap-3.5 list-none p-0 m-0">
                <ListItem>
                  These Terms and Conditions are governed by and construed in accordance with the <strong>laws of the Republic of India</strong>.
                </ListItem>
                <ListItem>
                  Any dispute arising out of or in connection with these terms shall be subject to the exclusive jurisdiction of the courts located in <strong>Ghaziabad, Uttar Pradesh</strong>, India.
                </ListItem>
                <ListItem>
                  If any provision of these terms is found to be invalid or unenforceable by a court of competent jurisdiction, the remaining provisions shall continue in full force and effect.
                </ListItem>
              </ul>
            </SectionCard>
          </div>

          {/* ── Contact ── */}
          <div id="contact">
            <SectionCard icon={<MailIcon />} title="Contact Us" index={6}>
              <p className="mb-5">
                If you have any questions, concerns, or disputes regarding these Terms and Conditions, please reach out to us through any of the channels below:
              </p>
              <div className="bg-slate-50 rounded-xl border border-slate-200 p-6 flex flex-col gap-4">
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-700 shrink-0">
                    <MailIcon />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Email</div>
                    <div className="font-semibold text-slate-900">abhishek558818@gmail.com</div>
                  </div>
                </div>
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-700 shrink-0">
                    <PhoneIcon />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Phone</div>
                    <div className="font-semibold text-slate-900">+91 8700993207</div>
                  </div>
                </div>
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-700 shrink-0">
                    <MapPinIcon />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Address</div>
                    <div className="font-semibold text-slate-900">Mishalgarhi Govindpuram, Ghaziabad, Uttar Pradesh, 201013, India</div>
                  </div>
                </div>
              </div>
              <p className="mt-5 text-sm text-slate-500">
                We aim to respond to all inquiries within <strong>24–48 business hours</strong>.
              </p>
            </SectionCard>
          </div>
        </main>
      </div>

      <Footer />
    </div>
  );
};

export default TermsAndConditions;