import { useState, useEffect } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { apiFetch } from "../api/client";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

const tokenKey = "spacer_token";

const CheckoutForm = ({ bookingId, amount }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [clientSecret, setClientSecret] = useState("");
  const [error, setError] = useState(null);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem(tokenKey);

    apiFetch("/api/payments/create-intent", {
      method: "POST",
      token,
      body: { booking_id: bookingId, amount: Math.round(amount * 100) }, // cents
    })
      .then((data) => {
        if (data.client_secret) setClientSecret(data.client_secret);
        else throw new Error(data.error || "No client secret returned");
      })
      .catch((e) => setError(e.message));
  }, [bookingId, amount]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!stripe || !elements) return;
    if (!clientSecret) return setError("Payment not initialized (missing client secret).");

    setProcessing(true);
    setError(null);

    const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
      payment_method: {
        card: elements.getElement(CardElement),
      },
    });

    if (stripeError) {
      setError(stripeError.message);
      setProcessing(false);
      return;
    }

    if (paymentIntent?.status === "succeeded") {
      try {
        const token = localStorage.getItem(tokenKey);
        const data = await apiFetch(`/api/payments/confirm/${paymentIntent.id}`, {
          method: "POST",
          token,
        });

        alert(data.message || "Payment successful!");
      } catch (e) {
        setError(e.message);
      } finally {
        setProcessing(false);
      }
      return;
    }

    setError("Payment failed");
    setProcessing(false);
  };

  return (
    <form onSubmit={handleSubmit}>
      <CardElement />
      <button disabled={!stripe || processing || !clientSecret}>
        {processing ? "Processing..." : `Pay ${amount}`}
      </button>
      {error && <div style={{ color: "crimson" }}>{error}</div>}
    </form>
  );
};

const Checkout = ({ bookingId, amount }) => (
  <Elements stripe={stripePromise}>
    <CheckoutForm bookingId={bookingId} amount={amount} />
  </Elements>
);

export default Checkout;
