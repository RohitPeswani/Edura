import React, { useState } from "react";
import { Button } from "./ui/button";
import {
  useCreateCheckoutSessionMutation,
  useVerifyPaymentMutation,
} from "@/features/api/purchaseApi";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

const BuyCourseButton = ({ courseId }) => {
  const navigate = useNavigate();
  const [createCheckoutSession, { isLoading: isCreateLoading }] =
    useCreateCheckoutSessionMutation();
  const [verifyPayment, { isLoading: isVerifyLoading }] =
    useVerifyPaymentMutation();
  const [isScriptLoading, setIsScriptLoading] = useState(false);

  const purchaseCourseHandler = async () => {
    setIsScriptLoading(true);
    const isLoaded = await loadRazorpayScript();
    setIsScriptLoading(false);

    if (!isLoaded) {
      toast.error("Razorpay SDK failed to load. Are you online?");
      return;
    }

    try {
      const response = await createCheckoutSession(courseId).unwrap();
      if (!response?.success || !response?.order) {
        toast.error("Failed to create order session.");
        return;
      }

      const { order, key, course } = response;

      const options = {
        key: key,
        amount: order.amount,
        currency: order.currency,
        name: course?.name || "Course Purchase",
        description: course?.description || "Course Purchase",
        order_id: order.id,
        handler: async function (res) {
          try {
            const verifyRes = await verifyPayment({
              razorpay_order_id: res.razorpay_order_id,
              razorpay_payment_id: res.razorpay_payment_id,
              razorpay_signature: res.razorpay_signature,
              courseId,
            }).unwrap();

            if (verifyRes.success) {
              toast.success(verifyRes.message || "Payment successful!");
              navigate(`/course-progress/${courseId}`);
            } else {
              toast.error(verifyRes.message || "Payment verification failed.");
            }
          } catch (err) {
            toast.error(err?.data?.message || "Payment verification error");
          }
        },
        modal: {
          ondismiss: function () {
            toast.info("Payment cancelled.");
          },
        },
        theme: {
          color: "#3b82f6",
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", function (response) {
        toast.error(response.error?.description || "Payment failed");
      });
      rzp.open();
    } catch (err) {
      toast.error(err?.data?.message || "Failed to initiate checkout");
    }
  };

  const isLoading = isCreateLoading || isVerifyLoading || isScriptLoading;

  return (
    <Button
      disabled={isLoading}
      onClick={purchaseCourseHandler}
      className="w-full"
    >
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Please wait
        </>
      ) : (
        "Purchase Course"
      )}
    </Button>
  );
};

export default BuyCourseButton;
