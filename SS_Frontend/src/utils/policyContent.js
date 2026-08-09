// src/pages/Policies/policiesContent.js

const policies = {
    Date:"2026-08-10",
  returns: {
    title: "Return Policy",
    sections: [
      {
        heading: "Return Window",
        body: [
          "Returns are accepted only within 6 hours of delivery.",
          "Once 6 hours have passed since delivery, the order is final and cannot be returned.",
        ],
      },
      {
        heading: "How to Request a Return",
        body: [
          "Go to 'My Orders', select the delivered item, and submit a return request within the 6-hour window.",
          "Our team will review the request and share pickup details once approved.",
        ],
      },
      {
        heading: "Condition of Returned Items",
        body: [
          "Items must be unused, unwashed, and returned with original tags and packaging.",
          "Innerwear and items marked 'non-returnable' on the product page are not eligible for return.",
        ],
      },
    ],
  },

  delivery: {
    title: "Delivery Policy",
    sections: [
      {
        heading: "Delivery Timelines",
        body: [
          "Orders are shipped within [X] business days of confirmation.",
          "Delivery time varies by location and courier availability, and is shown at checkout as an estimate.",
        ],
      },
      {
        heading: "Delivery Attempts",
        body: [
          "Our courier partner will attempt delivery to the address provided at checkout.",
          "If delivery cannot be completed (customer unavailable, incorrect address, etc.), a reattempt will be made.",
        ],
      },
      {
        heading: "Delayed or Failed Delivery",
        body: [
          "If your order is delayed beyond the estimated window, please contact us with your Order ID.",
          "SS Garments is not liable for delays caused by courier partners, natural events, or circumstances beyond our control.",
        ],
      },
    ],
  },

  refunds: {
    title: "Refund Policy",
    sections: [
      {
        heading: "When Refunds Apply",
        body: [
          "Refunds are only applicable if the product received is damaged, defective, or different from what was ordered.",
          "Such issues must be reported within 48 hours of delivery, along with unboxing photos/video as proof.",
        ],
      },
      {
        heading: "Refund Process",
        body: [
          "Once a claim is verified, we offer a replacement (preferred) or a refund to the original payment method.",
          "Approved refunds are processed within 7–10 business days and credited to the original payment source only.",
        ],
      },
      {
        heading: "Not Eligible for Refund",
        body: [
          "Change of mind, or wrong size selected despite following the size chart, is not eligible for a refund.",
        ],
      },
    ],
  },

  privacy: {
    title: "Privacy Policy",
    sections: [
      {
        heading: "Information We Collect",
        body: [
          "Personal details you provide: name, phone number, email, and shipping address.",
          "Order and payment details, processed securely via our payment gateway partner — we do not store your card/UPI credentials.",
          "Browsing data such as IP address, device/browser type, and cookies for improving site experience.",
        ],
      },
      {
        heading: "How We Use Your Information",
        body: [
          "To process and deliver your orders, and to communicate order updates.",
          "To respond to customer support queries and improve our website and offerings.",
          "To send promotional offers only if you opt in — you can unsubscribe anytime.",
        ],
      },
      {
        heading: "Your Data Stays With Us",
        body: [
          "We do not sell or share your personal data with any third party for marketing purposes.",
          "Information is shared only where necessary — with our payment gateway to process payments, and with our courier partner to deliver your order — or if legally required by a government authority.",
        ],
      },
      {
        heading: "Your Rights",
        body: [
          "You may request to view, correct, or delete your personal data by contacting us.",
        ],
      },
    ],
  },

  shipping: {
    title: "Shipping Policy",
    sections: [
      {
        heading: "Shipping Charges",
        body: [
          "Shipping charges, if applicable, are shown at checkout before payment.",
          "Orders above [X amount] qualify for free shipping.",
        ],
      },
      {
        heading: "Dispatch",
        body: [
          "Orders are dispatched to our courier partner once payment is confirmed and the order is packed.",
          "You will receive tracking details via email/SMS once your order is shipped.",
        ],
      },
      {
        heading: "Serviceable Areas",
        body: [
          "We currently ship across serviceable pin codes in India, as supported by our courier partner.",
        ],
      },
    ],
  },

  cancellation: {
    title: "Cancellation Policy",
    sections: [
      {
        heading: "Before Shipping",
        body: [
          "Orders can be cancelled only before the order has been shipped.",
          "If cancelled before shipping, the order amount will be refunded after deducting applicable delivery charges.",
        ],
      },
      {
        heading: "After Shipping",
        body: [
          "Once an order has been shipped, it cannot be cancelled.",
          "If you no longer want the item after it is shipped, you may request a return within 6 hours of delivery as per our Return Policy.",
        ],
      },
      {
        heading: "How to Cancel",
        body: [
          "Go to 'My Orders' and select 'Cancel Order' on the relevant order, if it is still eligible for cancellation.",
        ],
      },
    ],
  },
};

export default policies;