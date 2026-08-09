import { useMemo, useState } from "react";
// import { useLocation } from "react-router-dom"; // ← restore this in your app
import {
  Package,
  Undo2,
  BadgeCheck,
  XCircle,
  Truck,
  RotateCcw,
  Banknote,
  ArrowLeft,
  Clock,
  CheckCircle2,
  Ban,
  Box,
  AlertTriangle,
  Scissors,
} from "lucide-react";

/*
  Backend data format:
  {
    "id": "6a76020388439e542eede695",
    "status": "DELIVERED",
    "order_awb_id": "1322353445",
    "product_name": "party wear red T shirt fancy",
    "color": "Light shade",
    "size": "XL_42",
    "variant_image": "https://...",
    "qty": 2,
    "price": 1200,
    "return_reason": "",
    "return_requested_at": null,
    "return_awb_id": null,
    "updated_at": "2026-08-07T16:17:00.080000Z"
  }

  INTEGRATION NOTE (remove this block when you drop this into your app):
  This file swaps `useLocation` for local demo state so it can preview
  standalone with a status switcher. In your app, replace the two lines
  marked "DEMO" below with:
      const location = useLocation();
      const item = location.state || null;
*/

const STATUS_ORDER = [
  "CONFIRMED",
  "SHIPPED",
  "DELIVERED",
  "RETURN_REQUESTED",
  "APPROVED",
  "REJECTED",
  "RETURN_SHIPPED",
  "RETURNED",
  "REFUNDED",
  "CANCELLED",
  "RETURNED_TO_ORIGIN",
];

// A muted "dye-lot" palette instead of stock Tailwind sky/amber/emerald —
// each status reads like a swatch off a fabric card, not a generic status chip.
const PALETTE = {
  paper: "#FBF7EF",
  paperDeep: "#F4EEE0",
  ink: "#241C16",
  inkSoft: "#8A7F71",
  inkFaint: "#B4A891",
  thread: "#C9BCA1",
  wine: "#5C1220",
  cardBorder: "#E8DCC4",
  cardBorderSoft: "#EFE7D4",
};

const statusConfig = {
  CONFIRMED: {
    label: "Order Confirmed",
    icon: BadgeCheck,
    ink: "#3B5169",
    bg: "#EAEFF4",
    border: "#D3DEE8",
    desc: "Your order has been confirmed",
    phase: "order",
  },
  SHIPPED: {
    label: "Shipped",
    icon: Truck,
    ink: "#A9761D",
    bg: "#FAF1DC",
    border: "#EBDCB3",
    desc: "Item is on its way to you",
    phase: "order",
  },
  DELIVERED: {
    label: "Delivered",
    icon: CheckCircle2,
    ink: "#3F6B3F",
    bg: "#E9F1E6",
    border: "#CFE0C9",
    desc: "Item delivered successfully",
    phase: "order",
  },
  CANCELLED: {
    label: "Cancelled",
    icon: Ban,
    ink: "#8C3B2E",
    bg: "#F7E9E3",
    border: "#EAD1C4",
    desc: "Order was cancelled",
    phase: "order",
  },
  RETURNED_TO_ORIGIN: {
    label: "Returned to Origin",
    icon: RotateCcw,
    ink: "#6B6152",
    bg: "#F1EBDD",
    border: "#E2D7C0",
    desc: "Package returned to sender",
    phase: "order",
  },
  RETURN_REQUESTED: {
    label: "Return Requested",
    icon: Undo2,
    ink: "#B5602D",
    bg: "#FBEEE1",
    border: "#F0DAC0",
    desc: "Your return request has been submitted",
    phase: "return",
  },
  APPROVED: {
    label: "Approved",
    icon: BadgeCheck,
    ink: "#5E7A3D",
    bg: "#EEF1E1",
    border: "#DAE2C4",
    desc: "Return request approved by seller",
    phase: "return",
  },
  REJECTED: {
    label: "Rejected",
    icon: XCircle,
    ink: "#7A2635",
    bg: "#F5E6E8",
    border: "#E7CBCF",
    desc: "Return request was declined",
    phase: "return",
  },
  RETURN_SHIPPED: {
    label: "Return Shipped",
    icon: Truck,
    ink: "#5B4A6B",
    bg: "#EFEAF3",
    border: "#DBD2E3",
    desc: "Item is on its way back to seller",
    phase: "return",
  },
  RETURNED: {
    label: "Returned",
    icon: Box,
    ink: "#5C5347",
    bg: "#EFEAE0",
    border: "#DED4C0",
    desc: "Item received by seller",
    phase: "return",
  },
  REFUNDED: {
    label: "Refunded",
    icon: Banknote,
    ink: "#2E6B63",
    bg: "#E4F1EE",
    border: "#C9E0DB",
    desc: "Refund processed to your account",
    phase: "return",
  },
};

function getStatusConfig(status) {
  const key = status?.toUpperCase().trim() || "CONFIRMED";
  return statusConfig[key] || statusConfig.CONFIRMED;
}

function formatDateTime(dateStr) {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  return d.toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function buildTimeline(item) {
  const status = item.status?.toUpperCase() || "CONFIRMED";
  const isCancelled = status === "CANCELLED";
  const isRto = status === "RETURNED_TO_ORIGIN";
  const isRejected = status === "REJECTED";

  const orderFlow = ["CONFIRMED", "SHIPPED"];
  if (isCancelled) orderFlow.push("CANCELLED");
  else if (isRto) orderFlow.push("RETURNED_TO_ORIGIN");
  else orderFlow.push("DELIVERED");

  const returnFlow = ["RETURN_REQUESTED", "APPROVED", "RETURN_SHIPPED", "RETURNED", "REFUNDED"];
  if (isRejected) {
    returnFlow.splice(2, 3);
  }

  const currentIdx = STATUS_ORDER.indexOf(status);

  const orderTimeline = orderFlow.map((s) => ({
    status: s,
    completed: STATUS_ORDER.indexOf(s) <= currentIdx,
  }));

  let returnTimeline = [];
  const returnStartIdx = STATUS_ORDER.indexOf("RETURN_REQUESTED");

  if (currentIdx >= returnStartIdx && !isCancelled && !isRto) {
    returnTimeline = returnFlow.map((s) => ({
      status: s,
      completed: STATUS_ORDER.indexOf(s) <= currentIdx,
    }));
  }

  return { orderTimeline, returnTimeline, isRejected, isCancelled, isRto };
}

// Stitched thread connector between two steps — the page's signature motif.
function StitchConnector() {
  return (
    <div
      className="absolute left-[19px] top-10 bottom-0 w-px hidden sm:block"
      style={{
        backgroundImage: `repeating-linear-gradient(to bottom, ${PALETTE.thread} 0px, ${PALETTE.thread} 5px, transparent 5px, transparent 10px)`,
      }}
    />
  );
}

function TimelineStep({ step, item, isCurrent, isLast, showConnector }) {
  const config = getStatusConfig(step.status);
  const Icon = config.icon;
  const isCompleted = step.completed;
  const isPending = !isCompleted && !isCurrent;

  return (
    <div className={`relative flex gap-4 sm:gap-5 ${isLast ? "" : "pb-8"}`} style={{ opacity: isPending ? 0.4 : 1 }}>
      {showConnector && <StitchConnector />}

      <div className="relative shrink-0 z-10">
        {/* Double-ring "button stitch" badge */}
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center"
          style={{
            border: `2px ${isCompleted || isCurrent ? "solid" : "dashed"} ${
              isCompleted ? config.border : isCurrent ? config.ink : PALETTE.thread
            }`,
            backgroundColor: isCompleted ? config.bg : isCurrent ? PALETTE.paper : PALETTE.paperDeep,
            boxShadow: isCurrent ? `0 0 0 4px ${config.bg}` : "none",
            transform: isCurrent ? "scale(1.08)" : "scale(1)",
            transition: "all .3s",
          }}
        >
          <Icon size={16} strokeWidth={isCurrent ? 2.5 : 2} color={isCompleted || isCurrent ? config.ink : PALETTE.inkFaint} />
        </div>
        {isCurrent && (
          <span
            className="absolute inset-0 rounded-full animate-ping"
            style={{ backgroundColor: config.ink, opacity: 0.15 }}
          />
        )}
      </div>

      <div className="flex-1 min-w-0 pt-1">
        <h4 className="text-sm font-semibold" style={{ color: isCompleted || isCurrent ? PALETTE.ink : PALETTE.inkFaint }}>
          {config.label}
        </h4>
        <p className="text-xs mt-1 leading-relaxed" style={{ color: isCompleted || isCurrent ? PALETTE.inkSoft : PALETTE.inkFaint }}>
          {config.desc}
        </p>

        {isCurrent && step.status === "RETURN_SHIPPED" && (
          <div className="mt-3 p-3 rounded-xl" style={{ backgroundColor: PALETTE.paper, border: `1px solid ${PALETTE.cardBorderSoft}` }}>
            <div className="flex items-center gap-2 text-xs" style={{ color: PALETTE.inkSoft }}>
              <Truck size={13} color={config.ink} />
              <span>Tracking AWB:</span>
              <span className="font-medium" style={{ color: PALETTE.ink, fontFamily: "'IBM Plex Mono', monospace" }}>
                {item?.return_awb_id || "Not assigned"}
              </span>
            </div>
          </div>
        )}

        {isCurrent && step.status === "REJECTED" && (
          <div className="mt-3 p-3 rounded-xl" style={{ backgroundColor: config.bg, border: `1px solid ${config.border}` }}>
            <p className="text-xs leading-relaxed" style={{ color: config.ink }}>
              Your return request was rejected. Please contact support for more details.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// ---- DEMO sample data + status switcher (delete this block in your app) ----
const SAMPLE_ITEM = {
  id: "6a76020388439e542eede695",
  status: "DELIVERED",
  finalizeds: true,
  order_awb_id: "1322353445",
  variant_size_id: "6a6f481a8425618d970f0d9d",
  product_name: "party wear red T shirt fancy",
  color: "Light shade",
  size: "XL_42",
  variant_image: "https://ss-garments-product-image.s3.amazonaws.com/products/variants/product_18.jpg",
  qty: 2,
  price: 1200,
  return_reason: "",
  return_requested_at: null,
  return_awb_id: null,
  resolved_at: null,
  updated_at: "2026-08-07T16:17:00.080000Z",
};
// ---- end demo block ----

export default function ReturnTrackingPage() {
  // DEMO: swap these two lines for useLocation() in your app
  const [demoStatus, setDemoStatus] = useState("DELIVERED");
  const item = { ...SAMPLE_ITEM, status: demoStatus };

  const { orderTimeline, returnTimeline } = useMemo(() => buildTimeline(item), [item]);

  if (!item) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: PALETTE.paper }}>
        <p className="text-sm" style={{ color: PALETTE.inkSoft }}>No tracking details found for this item.</p>
      </div>
    );
  }

  const currentStatus = item.status?.toUpperCase() || "CONFIRMED";
  const currentMeta = getStatusConfig(currentStatus);
  const allSteps = [...orderTimeline, ...returnTimeline];
  const currentStepIndex = allSteps.findIndex((t) => t.status === currentStatus);

  const product = {
    name: item.product_name || "Product",
    image: item.variant_image || "",
    variant: `${item.color || ""}${item.color && item.size ? " · " : ""}${item.size || ""}`,
    price: item.price || 0,
    qty: item.qty || 1,
  };
  const totalRefund = product.price * product.qty;

  return (
    <div className="min-h-screen" style={{ backgroundColor: PALETTE.paper, fontFamily: "'Inter', sans-serif" }}>
      <link
        href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600&family=Inter:wght@400;500;600&family=IBM+Plex+Mono:wght@500&display=swap"
        rel="stylesheet"
      />

      <div className="max-w-3xl mx-auto p-4 sm:p-6 lg:p-8">
        {/* DEMO status switcher — remove in production */}
        <div className="mb-4 flex items-center gap-2 text-xs">
          <span style={{ color: PALETTE.inkFaint }}>Preview status:</span>
          <select
            value={demoStatus}
            onChange={(e) => setDemoStatus(e.target.value)}
            className="text-xs rounded-lg px-2 py-1"
            style={{ border: `1px solid ${PALETTE.cardBorder}`, backgroundColor: "#fff", color: PALETTE.ink }}
          >
            {STATUS_ORDER.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        {/* Header */}
        <button
          onClick={() => window.history.back()}
          className="flex items-center gap-2 text-sm mb-6 group"
          style={{ color: PALETTE.inkSoft }}
        >
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          Back to Orders
        </button>

        <div className="mb-8">
          <p
            className="text-[11px] font-semibold uppercase mb-1"
            style={{ color: currentMeta.ink, letterSpacing: "0.12em" }}
          >
            {returnTimeline.length > 0 ? "Return Tracking" : "Order Tracking"}
          </p>
          <h1
            className="text-2xl sm:text-3xl tracking-tight"
            style={{ fontFamily: "'Fraunces', serif", fontWeight: 600, color: PALETTE.ink }}
          >
            {product.name}
          </h1>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-3 text-sm">
            <p style={{ color: PALETTE.inkSoft }}>
              Item ID{" "}
              <span className="font-medium" style={{ color: PALETTE.ink, fontFamily: "'IBM Plex Mono', monospace", fontSize: "0.8em" }}>
                {item.id?.slice(-8)?.toUpperCase()}
              </span>
            </p>
            {item.order_awb_id && (
              <p style={{ color: PALETTE.inkSoft }}>
                AWB{" "}
                <span className="font-medium" style={{ color: PALETTE.ink, fontFamily: "'IBM Plex Mono', monospace", fontSize: "0.8em" }}>
                  {item.order_awb_id}
                </span>
              </p>
            )}
            {item.updated_at && (
              <p className="flex items-center gap-1.5 text-xs" style={{ color: PALETTE.inkSoft }}>
                <Clock size={12} />
                Updated: {formatDateTime(item.updated_at)}
              </p>
            )}
          </div>
        </div>

        {/* Swing-tag product card */}
        <div
          className="relative rounded-2xl p-5 sm:p-6 mb-6"
          style={{
            backgroundColor: "#fff",
            border: `1px solid ${PALETTE.cardBorder}`,
            boxShadow: "0 2px 16px rgba(36,28,22,0.05)",
          }}
        >
          {/* punch hole, like a swing tag */}
          <div
            className="absolute -top-2.5 left-6 w-5 h-5 rounded-full hidden sm:block"
            style={{ backgroundColor: PALETTE.paper, border: `1.5px solid ${PALETTE.cardBorder}` }}
          />
          <div className="flex flex-col sm:flex-row gap-5">
            <div
              className="shrink-0 overflow-hidden rounded-xl w-full sm:w-32 h-48 sm:h-32"
              style={{ border: `1px solid ${PALETTE.cardBorderSoft}`, backgroundColor: PALETTE.paper }}
            >
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover"
                onError={(e) => { e.target.style.display = "none"; }}
              />
            </div>
            <div className="flex-1 min-w-0 flex flex-col justify-between">
              <div>
                <p className="text-xs capitalize" style={{ color: PALETTE.inkSoft }}>{product.variant}</p>
                <div className="flex items-center gap-3 mt-2 text-xs" style={{ color: PALETTE.inkFaint }}>
                  <span>Qty {product.qty}</span>
                  <span className="w-1 h-1 rounded-full" style={{ backgroundColor: PALETTE.thread }} />
                  <span className="font-medium" style={{ color: PALETTE.ink }}>₹{product.price}</span>
                  <span className="w-1 h-1 rounded-full" style={{ backgroundColor: PALETTE.thread }} />
                  <span className="font-medium" style={{ color: PALETTE.ink }}>Total: ₹{totalRefund}</span>
                </div>
              </div>

              {item.return_reason && (
                <div className="mt-4 sm:mt-0 p-3 rounded-xl" style={{ backgroundColor: PALETTE.paper, border: `1px solid ${PALETTE.cardBorderSoft}` }}>
                  <div className="flex items-center gap-1.5 mb-1">
                    <Undo2 size={12} style={{ color: PALETTE.wine }} />
                    <span className="text-xs font-semibold" style={{ color: PALETTE.ink }}>Return Reason</span>
                  </div>
                  <p className="text-xs leading-relaxed" style={{ color: PALETTE.inkSoft }}>{item.return_reason}</p>
                </div>
              )}

              {item.return_requested_at && (
                <p className="flex items-center gap-1.5 text-[11px] mt-2" style={{ color: PALETTE.inkFaint }}>
                  <Clock size={11} />
                  Return requested on {formatDateTime(item.return_requested_at)}
                </p>
              )}
              {item.resolved_at && (
                <p className="flex items-center gap-1.5 text-[11px] mt-1" style={{ color: PALETTE.inkFaint }}>
                  <CheckCircle2 size={11} />
                  Resolved on {formatDateTime(item.resolved_at)}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Current status banner */}
        <div
          className="rounded-2xl p-5 mb-8 flex items-center gap-3"
          style={{ backgroundColor: currentMeta.bg, border: `1px solid ${currentMeta.border}` }}
        >
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
            style={{ backgroundColor: "#fff", border: `1px solid ${currentMeta.border}` }}
          >
            <currentMeta.icon size={22} color={currentMeta.ink} />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <p className="text-sm font-semibold" style={{ color: currentMeta.ink }}>{currentMeta.label}</p>
              {item.finalizeds && (
                <span
                  className="text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded"
                  style={{ color: currentMeta.ink, backgroundColor: "#fff", border: `1px solid ${currentMeta.border}`, letterSpacing: "0.06em" }}
                >
                  Final
                </span>
              )}
            </div>
            <p className="text-xs mt-0.5" style={{ color: PALETTE.inkSoft }}>{currentMeta.desc}</p>
          </div>
        </div>

        {/* Timeline */}
        <div
          className="rounded-2xl p-6 sm:p-8"
          style={{ backgroundColor: "#fff", border: `1px solid ${PALETTE.cardBorder}`, boxShadow: "0 2px 16px rgba(36,28,22,0.05)" }}
        >
          <div className={returnTimeline.length > 0 ? "mb-8" : ""}>
            <div className="flex items-center gap-3 mb-5">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: "#FAF1DC", color: "#A9761D" }}>
                <Package size={16} />
              </div>
              <h2 className="text-base font-semibold" style={{ fontFamily: "'Fraunces', serif", color: PALETTE.ink }}>
                Order Journey
              </h2>
              <div className="flex-1 h-px ml-2" style={{ backgroundColor: PALETTE.cardBorderSoft }} />
            </div>
            <div>
              {orderTimeline.map((step, index) => (
                <TimelineStep
                  key={`order-${index}`}
                  step={step}
                  item={item}
                  isCurrent={index === currentStepIndex}
                  isLast={index === orderTimeline.length - 1 && !returnTimeline.length}
                  showConnector={index !== orderTimeline.length - 1}
                />
              ))}
            </div>
          </div>

          {returnTimeline.length > 0 && (
            <>
              <div className="relative flex items-center justify-center my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full h-px" style={{ backgroundColor: PALETTE.cardBorderSoft }} />
                </div>
                <div
                  className="relative z-10 flex items-center gap-2 px-4 py-2 rounded-full"
                  style={{ backgroundColor: "#fff", border: `1px solid ${PALETTE.cardBorder}` }}
                >
                  <Scissors size={13} style={{ color: PALETTE.wine }} />
                  <span className="text-xs font-medium" style={{ color: PALETTE.inkSoft }}>Return Process Started</span>
                </div>
              </div>

              <div>
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: "#EEF1E1", color: "#5E7A3D" }}>
                    <Undo2 size={16} />
                  </div>
                  <h2 className="text-base font-semibold" style={{ fontFamily: "'Fraunces', serif", color: PALETTE.ink }}>
                    Return Journey
                  </h2>
                  <div className="flex-1 h-px ml-2" style={{ backgroundColor: PALETTE.cardBorderSoft }} />
                </div>
                <div>
                  {returnTimeline.map((step, index) => (
                    <TimelineStep
                      key={`return-${index}`}
                      step={step}
                      item={item}
                      isCurrent={orderTimeline.length + index === currentStepIndex}
                      isLast={index === returnTimeline.length - 1}
                      showConnector={index !== returnTimeline.length - 1}
                    />
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Summary */}
        <div
          className="mt-6 rounded-2xl p-6"
          style={{ backgroundColor: "#fff", border: `1px solid ${PALETTE.cardBorder}`, boxShadow: "0 2px 16px rgba(36,28,22,0.05)" }}
        >
          <h3 className="text-sm font-semibold mb-4" style={{ fontFamily: "'Fraunces', serif", color: PALETTE.ink }}>
            {returnTimeline.length > 0 ? "Return Summary" : "Order Summary"}
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center text-sm">
              <span style={{ color: PALETTE.inkSoft }}>Product Price</span>
              <span className="font-medium" style={{ color: PALETTE.ink }}>₹{product.price}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span style={{ color: PALETTE.inkSoft }}>Quantity</span>
              <span className="font-medium" style={{ color: PALETTE.ink }}>{product.qty}</span>
            </div>
            <div className="h-px" style={{ backgroundColor: PALETTE.cardBorderSoft }} />
            <div className="flex justify-between items-center">
              <span className="text-sm font-semibold" style={{ color: PALETTE.ink }}>
                {returnTimeline.length > 0 ? "Refund Amount" : "Total Amount"}
              </span>
              <span className="text-lg font-bold" style={{ fontFamily: "'Fraunces', serif", color: "#2E6B63" }}>
                ₹{totalRefund}
              </span>
            </div>

            {currentStatus === "REFUNDED" && (
              <p className="text-xs px-3 py-2 rounded-lg" style={{ color: "#2E6B63", backgroundColor: "#E4F1EE", border: "1px solid #C9E0DB" }}>
                Refund of ₹{totalRefund} has been credited to your original payment method. It may take 3–5 business days to reflect.
              </p>
            )}
            {currentStatus === "REJECTED" && (
              <p className="text-xs px-3 py-2 rounded-lg flex items-start gap-2" style={{ color: "#7A2635", backgroundColor: "#F5E6E8", border: "1px solid #E7CBCF" }}>
                <AlertTriangle size={14} className="shrink-0 mt-0.5" />
                Return request was rejected. No refund will be processed.
              </p>
            )}
          </div>
        </div>

        <div className="mt-6 text-center">
          <p className="text-xs" style={{ color: PALETTE.inkFaint }}>
            Need help?{" "}
            <button className="font-medium hover:underline" style={{ color: PALETTE.wine }}>Contact Support</button>
          </p>
        </div>
      </div>
    </div>
  );
}