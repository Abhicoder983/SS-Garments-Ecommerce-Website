import { useState } from "react";

export default function EditAddressModal({address, closeModal ,index, pageName,uploadSetAddress}) {
  const [formData, setFormData] = useState((index||index==0)?address[index]:{});
  const[errors, setErrors]=useState(null)
  
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
     if (e.target.value.trim()) {
      
      setErrors({ ...errors, [e.target.name]: "" });
    }
  };

  const handleSave = async() => {
     const newErrors = {};

    if (!formData.address?.trim()) {
      console.log(formData)
      newErrors.address = "Name is required"};
    if (!formData.city?.trim()) newErrors.city = "City is required";
    if (!formData.state?.trim()) newErrors.state = "State is required";
    if (!formData.pincode?.trim()) newErrors.pincode = "Pincode is required";

    setErrors(newErrors);
    if (Object.keys(newErrors).length >0) {
      return 
    }
    let updatedAddresses = [...address];

    if (index !== null && index !== undefined) {
      updatedAddresses[index] = formData;
    } else {
      updatedAddresses.push(formData);
    }

    
    await uploadSetAddress(updatedAddresses);
    closeModal();
  };

  return (
    <div className="fixed inset-0 bg-[#1f1f1fc9] bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg w-96 border-2 border-green-700 h-3/5 m-2">
        <h2 className="text-lg font-semibold mb-4">{pageName} Address</h2>
        <div className=" h-3/4 gap-2 flex flex-col justify-evenly ">

        <input
          name="address"
          value={formData.address}
          onChange={handleChange}
          placeholder="street Address"
        
            className={`w-full p-2 rounded border 
            ${errors?.address ? "border-red-500" : "border-gray-400"}`}
        />
         <input
          name="city"
          value={formData.city || ""}
          onChange={handleChange}
          placeholder="Your City"
        
            className={`w-full p-2 rounded border 
            ${errors?.city ? "border-red-500" : "border-gray-400"}`}
        />

       

       

        <input
          name="state"
          value={formData.state || ""}
          onChange={handleChange}
          placeholder="State"
          className={`w-full p-2 rounded border 
            ${errors?.state? "border-red-500" : "border-gray-400"}`}
        />

        <input
          name="pincode"
          value={formData.pincode || ""}
          onChange={handleChange}
          placeholder="Pincode"
           className={`w-full p-2 rounded border 
            ${errors?.pincode? "border-red-500" : "border-gray-400"}`}
        />
        </div>
        <div className="flex justify-end gap-3">
          <button
            onClick={closeModal}
            className="px-4 py-2 bg-gray-600 rounded"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-emerald-600 rounded"
          >
            Save
          </button>
        </div>

        
      </div>
    </div>
  );
}
