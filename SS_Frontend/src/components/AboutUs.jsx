
import { Link } from "react-router-dom";
import {
  ShieldCheck,
  Truck,
  Sparkles,
  Users,
  Target,
  Eye,
  ArrowRight,
} from "lucide-react";
import NavBar from "./NavBar";
import Footer from "./Footer";

export default function AboutUs() {
  const features = [
    {
      icon: <Sparkles className="w-10 h-10 text-yellow-500" />,
      title: "Premium Quality",
      desc: "Carefully selected apparel with comfort and durability.",
    },
    {
      icon: <Truck className="w-10 h-10 text-green-600" />,
      title: "Fast Delivery",
      desc: "Reliable delivery across India.",
    },
    {
      icon: <ShieldCheck className="w-10 h-10 text-blue-600" />,
      title: "Secure Shopping",
      desc: "Safe payments and trusted checkout.",
    },
    {
      icon: <Users className="w-10 h-10 text-pink-600" />,
      title: "Customer First",
      desc: "Friendly support before and after every purchase.",
    },
  ];

  return (
    <>
    <NavBar />
    <div className="bg-slate-50 min-h-screen">
      <section className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <span className="text-yellow-500 font-semibold tracking-widest">
              ABOUT SS GARMENTS
            </span>

            <h1 className="text-5xl font-bold text-slate-900 mt-3">
              Fashion That Fits Every Lifestyle
            </h1>

            <p className="text-slate-600 text-lg mt-6 leading-8">
              SS Garments brings premium quality clothing at affordable prices.
              We focus on style, comfort and trust to make every shopping
              experience enjoyable.
            </p>

            <Link
              to="/"
              className="inline-flex items-center gap-2 mt-8 bg-yellow-400 hover:bg-yellow-500 transition px-8 py-3 rounded-xl font-semibold"
            >
              Shop Now <ArrowRight size={18} />
            </Link>
          </div>

          <img
            src="https://images.unsplash.com/photo-1523398002811-999ca8dec234?q=80&w=1200&auto=format&fit=crop"
            className="rounded-3xl shadow-xl h-[420px] w-full object-cover"
          />
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-6 pb-16">
        <div className="bg-white rounded-3xl shadow p-10">
          <h2 className="text-3xl font-bold mb-5">Our Story</h2>
          <p className="text-slate-600 leading-8">
            Our mission is simple — deliver fashionable clothing with premium
            quality, secure shopping and excellent customer service. Whether
            you're shopping for casual wear, ethnic collections or everyday
            essentials, SS Garments is committed to giving you the best value.
          </p>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-6 pb-16">
        <h2 className="text-4xl font-bold text-center mb-12">
          Why Choose Us
        </h2>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-7">
          {features.map((item) => (
            <div
              key={item.title}
              className="bg-white rounded-2xl p-8 shadow hover:-translate-y-2 transition"
            >
              {item.icon}
              <h3 className="font-bold text-xl mt-5">{item.title}</h3>
              <p className="text-slate-600 mt-3">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-6 pb-16">
        <div className="grid lg:grid-cols-2 gap-8">
          <div className="bg-white rounded-3xl shadow p-8">
            <Target className="text-yellow-500 w-10 h-10"/>
            <h3 className="text-2xl font-bold mt-4">Our Mission</h3>
            <p className="text-slate-600 mt-4">
              To make premium fashion affordable and accessible to everyone.
            </p>
          </div>

          <div className="bg-white rounded-3xl shadow p-8">
            <Eye className="text-green-600 w-10 h-10"/>
            <h3 className="text-2xl font-bold mt-4">Our Vision</h3>
            <p className="text-slate-600 mt-4">
              Become India's trusted online destination for quality apparel.
            </p>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-6 pb-20">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            ["1000+","Happy Customers"],
            ["500+","Products"],
            ["50+","Categories"],
            ["24/7","Support"]
          ].map(([n,t])=>(
            <div key={t} className="bg-white rounded-2xl shadow text-center py-8">
              <div className="text-4xl font-bold text-green-600">{n}</div>
              <div className="text-slate-600 mt-2">{t}</div>
            </div>
          ))}
        </div>
      </section>
    </div>
    <Footer/>
    </>
    
  );
}
