import { 
  Mail, 
  Phone, 
  MapPin, 
  Instagram, 
  Facebook, 
  Twitter, 
  ArrowUpRight,
  Heart
} from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    support: [
      { label: "Track Order", href: "/track-order" },
      { label: "Contact Us", href: "/contactus" },
      { label: "Return Policy", href: "/returns" },
      { label: "Delivery Policy", href: "/delivery" },
      { label: "Refund Policy", href: "/refunds" },
    ],
    company: [
      { label: "About Us", href: "/aboutus" },
      { label: "Privacy Policy", href: "/privacy" },
      { label: "Terms & Conditions", href: "/terms" },
      { label: "Shipping Policy", href: "/shipping" },
      { label: "Cancellation Policy", href: "/cancellation" },
      { label: "Vote For Designs", href: "/vote" },
    ],
  };

  const socialLinks = [
    { icon: Instagram, href: "#", label: "Instagram" },
    { icon: Facebook, href: "#", label: "Facebook" },
    { icon: Twitter, href: "#", label: "Twitter" },
  ];

  return (
    <footer className="bg-[#2B2422] text-white mt-auto">
      {/* Main Footer Content */}
      <div className="max-w-6xl mx-auto px-6 sm:px-8 pt-16 pb-12">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 md:gap-8">
          
          {/* Brand Column */}
          <div className="md:col-span-4 space-y-6">
            <div>
              <h2 
                className="text-2xl text-[#FDF6ED] tracking-tight"
                style={{ fontFamily: "'Fraunces', serif", fontWeight: 600 }}
              >
                Your Brand
              </h2>
              <p className="text-sm text-[#9A9187] mt-3 leading-relaxed max-w-xs">
                Crafting timeless pieces with passion and precision. Experience fashion that speaks to your soul.
              </p>
            </div>

            {/* Contact Info */}
            <div className="space-y-3">
              <a 
                href="mailto:abhishek558818@gmail.com" 
                className="flex items-center gap-3 text-sm text-[#C4B8A8] hover:text-[#FDF6ED] transition-colors duration-200 group"
              >
                <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center group-hover:bg-[#4A0E1C] transition-colors">
                  <Mail size={14} />
                </div>
                abhishek558818@gmail.com
              </a>
              <a 
                href="tel:+918796210760" 
                className="flex items-center gap-3 text-sm text-[#C4B8A8] hover:text-[#FDF6ED] transition-colors duration-200 group"
              >
                <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center group-hover:bg-[#4A0E1C] transition-colors">
                  <Phone size={14} />
                </div>
                +91 87962 10760
              </a>
              <div className="flex items-start gap-3 text-sm text-[#C4B8A8]">
                <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center shrink-0 mt-0.5">
                  <MapPin size={14} />
                </div>
                <span className="leading-relaxed">

                  Mishalgarhi, Govindpuram<br />
                  Ghaziabad, Uttar Pradesh - 201013
                  
                </span>
              </div>
            </div>

            {/* Social Links */}
            <div className="flex gap-3 pt-2">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  aria-label={social.label}
                  className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-[#C4B8A8] hover:bg-[#4A0E1C] hover:text-white transition-all duration-200 hover:scale-110"
                >
                  <social.icon size={18} />
                </a>
              ))}
            </div>
          </div>

          {/* Support Links */}
          <div className="md:col-span-4 md:pl-8">
            <h3 className="text-xs font-bold text-[#FDF6ED] uppercase tracking-[0.15em] mb-6">
              Support
            </h3>
            <ul className="space-y-3.5">
              {footerLinks.support.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="group flex items-center gap-2 text-sm text-[#9A9187] hover:text-[#FDF6ED] transition-colors duration-200"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-[#4A0E1C] opacity-0 group-hover:opacity-100 transition-opacity" />
                    {link.label}
                    <ArrowUpRight 
                      size={12} 
                      className="opacity-0 group-hover:opacity-100 transition-all duration-200 -translate-x-1 group-hover:translate-x-0" 
                    />
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Links */}
          <div className="md:col-span-4 md:pl-8">
            <h3 className="text-xs font-bold text-[#FDF6ED] uppercase tracking-[0.15em] mb-6">
              Company
            </h3>
            <ul className="space-y-3.5">
              {footerLinks.company.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="group flex items-center gap-2 text-sm text-[#9A9187] hover:text-[#FDF6ED] transition-colors duration-200"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-[#4A0E1C] opacity-0 group-hover:opacity-100 transition-opacity" />
                    {link.label}
                    <ArrowUpRight 
                      size={12} 
                      className="opacity-0 group-hover:opacity-100 transition-all duration-200 -translate-x-1 group-hover:translate-x-0" 
                    />
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/10">
        <div className="max-w-6xl mx-auto px-6 sm:px-8 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-[#9A9187] flex items-center gap-1.5">
            © {currentYear} Your Brand. Made with 
            <Heart size={12} className="text-[#B24444] fill-[#B24444]" /> 
            in India
          </p>
          <div className="flex items-center gap-6">
            <a href="/sitemap" className="text-xs text-[#9A9187] hover:text-[#FDF6ED] transition-colors">
              Sitemap
            </a>
            <a href="/accessibility" className="text-xs text-[#9A9187] hover:text-[#FDF6ED] transition-colors">
              Accessibility
            </a>
            <a href="/cookies" className="text-xs text-[#9A9187] hover:text-[#FDF6ED] transition-colors">
              Cookies
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}