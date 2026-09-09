"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  CheckCircle2,
  Lock,
  User,
  ArrowRight,
  ArrowLeft,
  ShoppingBag,
  ShieldCheck,
  Building,
  LogIn,
  UserPlus,
  Sparkles,
} from "lucide-react";
import { useCartStore } from "@/store/useCartStore";
import { useGetMe } from "@/hooks/useAuth";
import { useCreateMemberPurchase, useCreateGuestPurchase } from "@/hooks/usePurchases";
import { AddressForm } from "@/components/checkout/AddressForm";
import { OrderSummary } from "@/components/checkout/OrderSummary";
import { RUForm } from "@/components/forms";
import { guestCheckoutSchema, memberCheckoutSchema } from "@/schemas/checkout.schema";
import { z } from "zod";
import { toast } from "sonner";

export default function CheckoutPage() {
  const router = useRouter();
  const { items, clearCart, getTotalPrice } = useCartStore();
  const { data: user, isLoading: isUserLoading } = useGetMe();

  const { mutate: createMemberPurchase, isPending: isMemberPending } = useCreateMemberPurchase();
  const { mutate: createGuestPurchase, isPending: isGuestPending } = useCreateGuestPurchase();

  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);
  const [checkoutMode, setCheckoutMode] = useState<"MEMBER" | "GUEST" | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<"CASH" | "ONLINE">("CASH");

  // Unified checkout info capturing both guest contact details and the delivery address
  const [checkoutInfo, setCheckoutInfo] = useState<{
    guestName: string;
    guestPhone: string;
    guestEmail?: string;
    shippingAddress: string;
  }>({
    guestName: "",
    guestPhone: "",
    guestEmail: "",
    shippingAddress: "",
  });

  const [isMounted, setIsMounted] = useState(false);
  const [orderComplete, setOrderComplete] = useState<{ orderId: string } | null>(null);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Automatically advance to Step 2 if user is logged in
  useEffect(() => {
    if (user && !isUserLoading) {
      setCheckoutMode("MEMBER");
      if (currentStep === 1) {
        setCurrentStep(2);
      }
    }
  }, [user, isUserLoading, currentStep]);

  if (!isMounted || isUserLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (items.length === 0 && !orderComplete) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-4 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted text-muted-foreground mb-4">
          <ShoppingBag className="h-8 w-8" />
        </div>
        <h2 className="text-xl font-bold text-foreground mb-2">Your Cart is Empty</h2>
        <p className="text-sm text-muted-foreground max-w-md mb-6">
          You don't have any items in your checkout session. Add some books from our catalog first.
        </p>
        <Link
          href="/books"
          className="rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/90"
        >
          Explore Books Catalog
        </Link>
      </div>
    );
  }

  // Order Success Screen
  if (orderComplete) {
    return (
      <div className="min-h-screen bg-slate-50/50 dark:bg-zinc-950 py-16 px-4">
        <div className="max-w-lg mx-auto bg-card rounded-3xl border border-border p-8 text-center shadow-lg">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 mb-6">
            <CheckCircle2 className="h-12 w-12" />
          </div>
          <h1 className="text-2xl font-black text-foreground mb-2">Order Confirmed!</h1>
          <p className="text-sm text-muted-foreground mb-6">
            Thank you for ordering with Rajshahi University Islamic Library. Your order reference ID is{" "}
            <span className="font-mono font-bold text-foreground">{orderComplete.orderId}</span>.
          </p>

          <div className="p-4 rounded-xl bg-muted/40 text-xs text-muted-foreground text-left space-y-2 mb-8 border border-border/50">
            <p className="font-bold text-foreground">Next Steps for Collection:</p>
            <p>1. Present your Order ID at the RU Central Islamic Library counter.</p>
            <p>2. Shifter desk will verify payment & hand over your authentic edition.</p>
            <p>3. Borrowed titles are due within 14 days of checkout.</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/books"
              className="inline-flex items-center justify-center rounded-xl border border-border px-6 py-3 text-sm font-bold text-foreground hover:bg-muted transition-colors"
            >
              Back to Catalog
            </Link>
            {user ? (
              <Link
                href="/dashboard/member/purchases"
                className="inline-flex items-center justify-center rounded-xl bg-primary px-6 py-3 text-sm font-bold text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                View My Purchases
              </Link>
            ) : (
              <Link
                href={`/guest/dashboard?email=${encodeURIComponent(checkoutInfo.guestEmail || "")}&txn=${encodeURIComponent(orderComplete.orderId)}`}
                className="inline-flex items-center justify-center rounded-xl bg-[#C78700] hover:bg-amber-600 px-6 py-3 text-sm font-bold text-white transition-colors shadow-md"
              >
                Open Guest Dashboard & Tracker
              </Link>
            )}
          </div>
        </div>
      </div>
    );
  }

  const subtotal = getTotalPrice();
  const deliveryFee = 50;
  const grandTotal = subtotal + deliveryFee;
  const isPending = isMemberPending || isGuestPending;

  // Handle final order submission in Step 3
  const handlePlaceOrder = () => {
    const formattedItems = items.map((i) => ({
      bookId: Number(i.bookId) || 1,
      quantity: i.quantity,
    }));

    if (!checkoutInfo.shippingAddress) {
      toast.error("Please go back and enter a delivery address.");
      setCurrentStep(2);
      return;
    }

    if (checkoutMode === "MEMBER") {
      createMemberPurchase(
        {
          items: formattedItems,
          paymentMethod,
          shippingAddress: checkoutInfo.shippingAddress,
        },
        {
          onSuccess: (order) => {
            clearCart();
            setOrderComplete({ orderId: String(order.transactionId || order.id) });
          },
        }
      );
    } else {
      if (!checkoutInfo.guestEmail || !checkoutInfo.guestEmail.includes("@")) {
        toast.error("Valid email address is mandatory for guest checkout & order tracking.");
        setCurrentStep(2);
        return;
      }

      createGuestPurchase(
        {
          items: formattedItems,
          paymentMethod,
          shippingAddress: checkoutInfo.shippingAddress,
          guestName: checkoutInfo.guestName || "Guest Reader",
          guestPhone: checkoutInfo.guestPhone || "01700000000",
          guestEmail: checkoutInfo.guestEmail,
        },
        {
          onSuccess: (order) => {
            if (typeof window !== "undefined") {
              localStorage.setItem("ruil_guest_email", checkoutInfo.guestEmail || "");
              localStorage.setItem("ruil_last_order", String(order.transactionId || order.id));
            }
            clearCart();
            setOrderComplete({ orderId: String(order.transactionId || order.id) });
          },
        }
      );
    }
  };

  // Step 2 schema: always require shippingAddress; guest requires name, phone, and mandatory email
  const addressValidationSchema =
    checkoutMode === "GUEST"
      ? z.object({
          guestName: z.string().min(2, "Full name must be at least 2 characters"),
          guestPhone: z.string().min(10, "Valid phone number required (e.g. 01712345678)"),
          guestEmail: z
            .string()
            .min(1, "Email address is required for guest purchases")
            .email("Please enter a valid email address for guest tracking & receipts"),
          shippingAddress: z.string().min(5, "Please enter a valid delivery address or department"),
        })
      : z.object({
          shippingAddress: z.string().min(5, "Please enter a valid delivery address or department"),
        });

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-zinc-950 py-8 sm:py-12">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        {/* Checkout Stepper */}
        <div className="mb-8">
          <div className="flex items-center justify-between relative max-w-xl mx-auto">
            {/* Progress Line */}
            <div className="absolute left-0 top-1/2 -translate-y-1/2 h-0.5 w-full bg-border -z-0" />
            <div
              className="absolute left-0 top-1/2 -translate-y-1/2 h-0.5 bg-primary -z-0 transition-all duration-500"
              style={{
                width: currentStep === 1 ? "0%" : currentStep === 2 ? "50%" : "100%",
              }}
            />

            {/* Step 1 */}
            <div className="flex flex-col items-center relative z-10">
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-full text-xs font-bold transition-all shadow-xs ${
                  currentStep >= 1
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                1
              </div>
              <span className="text-[11px] font-semibold text-muted-foreground mt-1.5">
                Authentication
              </span>
            </div>

            {/* Step 2 */}
            <div className="flex flex-col items-center relative z-10">
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-full text-xs font-bold transition-all shadow-xs ${
                  currentStep >= 2
                    ? "bg-primary text-primary-foreground"
                    : "bg-card border-2 border-border text-muted-foreground"
                }`}
              >
                2
              </div>
              <span className="text-[11px] font-semibold text-muted-foreground mt-1.5">
                Delivery / Handover
              </span>
            </div>

            {/* Step 3 */}
            <div className="flex flex-col items-center relative z-10">
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-full text-xs font-bold transition-all shadow-xs ${
                  currentStep === 3
                    ? "bg-primary text-primary-foreground"
                    : "bg-card border-2 border-border text-muted-foreground"
                }`}
              >
                3
              </div>
              <span className="text-[11px] font-semibold text-muted-foreground mt-1.5">
                Payment & Review
              </span>
            </div>
          </div>
        </div>

        {/* Step Container Card */}
        <div className="bg-card rounded-3xl border border-border p-6 sm:p-8 shadow-sm">
          {/* STEP 1: AUTH SHORTCUT */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div className="text-center max-w-md mx-auto">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary mb-3">
                  <User className="h-7 w-7" />
                </div>
                <h2 className="text-xl font-bold text-foreground">How would you like to checkout?</h2>
                <p className="text-xs text-muted-foreground mt-1">
                  RU students and faculty can log in to link borrow quotas to their verified identity, or continue as a guest for instant counter purchase.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-xl mx-auto pt-2">
                {/* Member Login Option */}
                <div className="rounded-2xl border border-border bg-muted/20 p-5 flex flex-col justify-between hover:border-primary/40 transition-colors">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <LogIn className="h-4 w-4 text-primary" />
                      <h3 className="font-bold text-sm text-foreground">RU Member Account</h3>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Access membership discount, active borrow tracking, and instant ID verification.
                    </p>
                  </div>
                  <Link
                    href={`/login?redirect=/checkout`}
                    className="mt-5 w-full inline-flex items-center justify-center gap-2 rounded-xl bg-primary py-2.5 px-4 text-xs font-bold text-primary-foreground hover:bg-primary/90 transition-colors"
                  >
                    <span>Log In to Member Account</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>

                {/* Guest Checkout Option */}
                <div className="rounded-2xl border-2 border-primary/20 bg-primary/5 p-5 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Sparkles className="h-4 w-4 text-primary" />
                      <h3 className="font-bold text-sm text-foreground">Express Guest Checkout</h3>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      No password required. Just enter your name & phone number for counter pickup.
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setCheckoutMode("GUEST");
                      setCurrentStep(2);
                    }}
                    className="mt-5 w-full inline-flex items-center justify-center gap-2 rounded-xl bg-foreground text-background py-2.5 px-4 text-xs font-bold hover:bg-foreground/90 transition-colors"
                  >
                    <span>Continue as Guest</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              <div className="text-center pt-2">
                <p className="text-xs text-muted-foreground">
                  Don't have an account yet?{" "}
                  <Link href="/register" className="font-bold text-primary hover:underline">
                    Register for Library Card
                  </Link>
                </p>
              </div>
            </div>
          )}

          {/* STEP 2: ADDRESS & CONTACT */}
          {currentStep === 2 && (
            <RUForm
              schema={addressValidationSchema}
              defaultValues={{
                guestName: checkoutInfo.guestName,
                guestPhone: checkoutInfo.guestPhone,
                guestEmail: checkoutInfo.guestEmail,
                shippingAddress: checkoutInfo.shippingAddress,
              }}
              onSubmit={(values) => {
                // Merge form values into checkoutInfo for both GUEST and MEMBER
                setCheckoutInfo((prev) => ({
                  ...prev,
                  ...(values as Partial<typeof checkoutInfo>),
                }));
                setCurrentStep(3);
              }}
            >
              <div className="space-y-6">
                <AddressForm isGuest={checkoutMode === "GUEST"} />

                <div className="flex justify-between items-center pt-4 border-t border-border">
                  <button
                    type="button"
                    onClick={() => setCurrentStep(1)}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground"
                  >
                    <ArrowLeft className="h-3.5 w-3.5" />
                    Back to Auth
                  </button>
                  <button
                    type="submit"
                    className="inline-flex items-center gap-2 rounded-xl bg-primary py-3 px-6 text-xs font-bold text-primary-foreground hover:bg-primary/90 transition-colors shadow-xs"
                  >
                    <span>Continue to Payment</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </RUForm>
          )}

          {/* STEP 3: ORDER SUMMARY & PLACE ORDER */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <OrderSummary
                items={items}
                subtotal={subtotal}
                deliveryFee={deliveryFee}
                grandTotal={grandTotal}
                paymentMethod={paymentMethod}
                onPaymentMethodChange={setPaymentMethod}
                isPending={isPending}
              />

              <div className="flex justify-between items-center pt-4 border-t border-border">
                <button
                  type="button"
                  onClick={() => setCurrentStep(2)}
                  disabled={isPending}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground disabled:opacity-50"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  Back to Details
                </button>
                <button
                  type="button"
                  onClick={handlePlaceOrder}
                  disabled={isPending}
                  className="inline-flex items-center gap-2 rounded-xl bg-primary py-3.5 px-8 text-sm font-bold text-primary-foreground hover:bg-primary/90 transition-all shadow-md hover:shadow-lg disabled:opacity-50"
                >
                  {isPending ? (
                    <div className="flex items-center gap-2">
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      <span>Processing Order...</span>
                    </div>
                  ) : (
                    <>
                      <span>Place Order (৳{grandTotal.toLocaleString()})</span>
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
