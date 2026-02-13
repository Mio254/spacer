import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { apiFetch } from "../api/client";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

function CheckoutForm() {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const stripe = useStripe();
  const elements = useElements();

  const { token } = useSelector((s) => s.auth);

  const [clientSecret, setClientSecret] = useState("");
  const [error, setError] = useState("");
  const [processing, setProcessing] = useState(false);
  const [loadingIntent, setLoadingIntent] = useState(true);

  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        setError("");
        setLoadingIntent(true);

        if (!token) {
          navigate("/login", { replace: true });
          return;
        }

        const data = await apiFetch("/api/payments/create-intent", {
          method: "POST",
          token,
          body: { booking_id: bookingId },
        });

        if (!alive) return;

        // Already paid -> go to invoice
        if (data?.invoice_id && !data?.client_secret) {
          navigate(`/invoices/${data.invoice_id}`, { replace: true });
          return;
        }

        if (!data?.client_secret) {
          throw new Error("Missing client_secret from server.");
        }

        setClientSecret(data.client_secret);
      } catch (e) {
        if (!alive) return;
        setError(e?.message || "Failed to create payment intent");
      } finally {
        if (alive) setLoadingIntent(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [token, bookingId, navigate]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!stripe || !elements || !clientSecret) return;

    setProcessing(true);
    setError("");

    const card = elements.getElement(CardElement);
    if (!card) {
      setError("Card input not ready.");
      setProcessing(false);
      return;
    }

    const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(
      clientSecret,
      { payment_method: { card } }
    );

    if (stripeError) {
      setError(stripeError.message || "Payment failed.");
      setProcessing(false);
      return;
    }

    try {
      if (!token) {
        navigate("/login", { replace: true });
        return;
      }

      const data = await apiFetch(`/api/payments/confirm/${paymentIntent.id}`, {
        method: "POST",
        token,
      });

      if (!data?.invoice_id) {
        throw new Error("Payment confirmed but invoice_id missing.");
      }

      navigate(`/invoices/${data.invoice_id}`, { replace: true });
    } catch (e) {
      setError(e?.message || "Failed to confirm payment");
    } finally {
      setProcessing(false);
    }
  };

  if (loadingIntent) {
    return (
      <div className="mx-auto max-w-md p-6">
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="h-6 w-32 animate-pulse rounded bg-gray-100" />
          <div className="mt-6 h-12 animate-pulse rounded bg-gray-100" />
          <div className="mt-4 h-10 animate-pulse rounded bg-gray-100" />
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md p-6">
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-bold text-gray-900">Checkout</h2>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div className="rounded-lg border border-gray-200 p-3">
            <CardElement />
          </div>

          <button
            disabled={!stripe || processing || !clientSecret}
            className="w-full rounded-lg bg-blue-600 px-4 py-2 text-white disabled:opacity-60"
          >
            {processing ? "Processing..." : "Pay Now"}
          </button>

          {error && <p className="text-sm text-red-600">{error}</p>}
        </form>
      </div>
    </div>
  );
}

export default function Checkout() {
  return (
    <Elements stripe={stripePromise}>
      <CheckoutForm />
    </Elements>
  );
}
