import Footer from "./Footer";
import policies from '../utils/policyContent.js';
import { Link } from "react-router-dom";
import NavBar from "./NavBar";

const NAV_ITEMS = [
  { slug: 'returns', label: 'Return Policy' },
  { slug: 'delivery', label: 'Delivery Policy' },
  { slug: 'refunds', label: 'Refund Policy' },
  { slug: 'privacy', label: 'Privacy Policy' },
  { slug: 'shipping', label: 'Shipping Policy' },
  { slug: 'cancellation', label: 'Cancellation Policy' },
];

export default function PolicyPage({ slug }) {
    console.log("policies", policies);
    const policy = policies[slug];
  

  if (!policy) {
    return (

      <div className="max-w-4xl mx-auto px-4 py-16 text-center text-gray-400">
        Policy not found
      </div>
    );
  }

  return (
    <>
    <NavBar />
    <div className="max-w-6xl mx-auto px-4 py-10 flex gap-10">
      {/* Sidebar nav */}
      <aside className="w-56 shrink-0 hidden md:block">
        <nav className="sticky top-10 space-y-1">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.slug}
              to={`/${item.slug}`}
              className={`block px-3 py-2 rounded-lg text-sm transition ${
                item.slug === slug
                  ? 'bg-blue-50 text-blue-700 font-medium'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">{policy.title}</h1>
        <p className="text-sm text-gray-400 mb-8">Last updated: {policies['Date']}</p>

        <div className="space-y-8">
          {policy.sections.map((section, idx) => (
            <div key={idx}>
              <h2 className="text-lg font-semibold text-gray-800 mb-3">{section.heading}</h2>
              <ul className="space-y-2">
                {section.body.map((line, i) => (
                  <li key={i} className="text-gray-600 text-sm leading-relaxed flex gap-2">
                    <span className="text-gray-300 mt-1">•</span>
                    <span>{line}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Mobile-only nav at the bottom */}
        <div className="md:hidden mt-12 pt-6 border-t">
          <p className="text-xs text-gray-400 mb-3">Other policies</p>
          <div className="flex flex-wrap gap-2">
            {NAV_ITEMS.filter((i) => i.slug !== slug).map((item) => (
              <Link
                key={item.slug}
                to={`/${item.slug}`}
                className="text-xs px-3 py-1.5 rounded-full border border-gray-200 text-gray-600 hover:bg-gray-50"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
      
    </div>

    <Footer />
    </>
    
  );
}