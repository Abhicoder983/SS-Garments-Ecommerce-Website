
import { Mail, Phone, MapPin, Clock } from "lucide-react";
import NavBar from "./NavBar";
import Footer from "./Footer";
import { useState, useContext } from "react";
import axios from "axios";
import { AuthContext } from "../Context/AuthContext";
import { toast } from "react-toastify"
const apiUrl = import.meta.env.VITE_API_URL;
export default function ContactUs() {
   const { setLogin, token, setToken} = useContext(AuthContext);
  const [formData, setFormData] = useState({
  name: "",
  email: "",
  phone: "",
  subject: "",
  message: "",
});
  const [loading, setLoading] = useState(false);
  const handleChange = (e) => {
  setFormData({
    ...formData,
    [e.target.name]: e.target.value,
  });
};

  const handleSubmit = async (e) => {
  e.preventDefault();

  // Trim whitespace
  const name = formData.name.trim();
  const email = formData.email.trim();
  const phone = formData.phone.trim();
  const subject = formData.subject.trim();
  const message = formData.message.trim();

  // Required fields
  if (!name || !email || !phone || !subject || !message) {
    toast.error("Please fill all fields.");
    return;
  }

  // Email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailRegex.test(email)) {
    toast.error("Please enter a valid email address.");
    return;
  }

  // Phone validation (Indian mobile number)
  const phoneRegex = /^[6-9]\d{9}$/;

  if (!phoneRegex.test(phone)) {
    toast.error("Please enter a valid 10-digit mobile number.");
    return;
  }

  setLoading(true);

  try {
    const response = await axios.post(
      `http://localhost:8000/contactusEmail/`,
      formData,
      { withCredentials: true, headers: { 
           Authorization:`Bearer ${token}`,
          "Content-Type": "multipart/form-data" },
         }
    );
  

    setFormData({
      name: "",
      email: "",
      phone: "",
      subject: "",
      message: "",
    });
    response?.data?.success?toast.success(response.data.message):toast.error(response.data.message)


  } catch (error) {
    if (error.response) {
      setLogin(null)
      setToken(null)

      if(error.response?.data?.success){
      setFormData({
      name: "",
      email: "",
      phone: "",
      subject: "",
      message: "",
    });
  }
      
      error.response?.data?.success?toast.success(error.response.data.message):toast.error(error.response.data.message)
      
    } else {
      alert("Something went wrong.");
    }
  } finally {
    setLoading(false);
  }
};
  return (
    <>
    <NavBar />
    
    <div className="bg-slate-50 min-h-screen">
      <section className="max-w-7xl mx-auto px-6 py-16 text-center">
        <h1 className="text-5xl font-bold">Contact Us</h1>
        <p className="text-slate-600 mt-4 text-lg">
          We'd love to hear from you.
        </p>
      </section>

      <section className="max-w-7xl mx-auto px-6 pb-20 grid lg:grid-cols-2 gap-10">
        <div className="bg-white rounded-3xl shadow p-8 space-y-8">
          <div className="flex gap-4">
            <MapPin className="text-yellow-500"/>
            <div>
              <h3 className="font-bold">Address</h3>
              <p className="text-slate-600">
                Mishalgarhi, Govindpuram <br/>
                Ghaziabad, Uttar Pradesh - 201013
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <Phone className="text-green-600"/>
            <div>
              <h3 className="font-bold">Phone</h3>
              <p className="text-slate-600">+91 8796210760</p>
            </div>
          </div>

          <div className="flex gap-4">
            <Mail className="text-blue-600"/>
            <div>
              <h3 className="font-bold">Email</h3>
              <p className="text-slate-600">support@ssgarment.in</p>
            </div>
          </div>

          <div className="flex gap-4">
            <Clock className="text-pink-600"/>
            <div>
              <h3 className="font-bold">Working Hours</h3>
              <p className="text-slate-600">Mon - Sat : 9 AM - 7 PM</p>
            </div>
          </div>
        </div>

        <form className="bg-white rounded-3xl shadow p-8 space-y-5" onSubmit={handleSubmit}>
          <input type="text" maxLength={50} className="w-full border rounded-xl p-3" placeholder="Your Name" name="name" onChange={handleChange} value={formData?.name}/>
          <input type="email" className="w-full border rounded-xl p-3" placeholder="Email" name="email" onChange={handleChange} value={formData?.email}/>
          <input type="tel" maxLength={10} pattern="[6-9]{1}[0-9]{9}" className="w-full border rounded-xl p-3" placeholder="Phone" name="phone" 
          onChange={(e) => {const value = e.target.value.replace(/\D/g, "");
    setFormData({ ...formData, phone: value });
  }} value={formData?.phone}
  />
          <input type="text" className="w-full border rounded-xl p-3" placeholder="Subject" name="subject" onChange={handleChange} value={formData?.subject}/>
          <textarea rows="5" className="w-full border rounded-xl p-3" placeholder="Message" name="message" onChange={handleChange} value={formData?.message}/>
          <button className="bg-yellow-400 hover:bg-yellow-500 transition rounded-xl px-8 py-3 font-semibold" disabled={loading}>
            {loading ? "Sending..." : "Send Message"}
          </button>
        </form>
      </section>

      <section className="max-w-7xl mx-auto px-6 pb-20">
        <div className="bg-white rounded-3xl shadow overflow-hidden">
          <iframe
            title="map"
            className="w-full h-[400px]"
            loading="lazy"
            src="https://maps.google.com/maps?q=Block%20C%20Mishal%20Garhi%20Govindpuram%20Ghaziabad%20Uttar%20Pradesh%20201013&t=&z=15&ie=UTF8&iwloc=&output=embed"
          />
        </div>
      </section>
    </div>
    <Footer />
    </>
  );
}
