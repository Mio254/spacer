import { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

const CheckoutForm = ({ bookingId, amount }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [clientSecret, setClientSecret] = useState('');
  const [error, setError] = useState(null);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    // Create payment intent
    fetch('http://127.0.0.1:5001/payments/create-intent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('token')}` },
      body: JSON.stringify({ booking_id: bookingId, amount: amount * 100 }) // amount in cents
    })
      .then(res => res.json())
      .then(data => {
        if (data.client_secret) {
          setClientSecret(data.client_secret);
        } else {
          setError(data.error);
        }
      });
  }, [bookingId, amount]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!stripe || !elements) return;

    setProcessing(true);
    const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
      payment_method: {
        card: elements.getElement(CardElement),
      }
    });

    if (error) {
      setError(error.message);
      setProcessing(false);
    } else if (paymentIntent && paymentIntent.status === 'succeeded') {
      // Payment succeeded, confirm on backend
      fetch(`http://127.0.0.1:5001/payments/confirm/${paymentIntent.id}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      })
        .then(res => res.json())
        .then(data => {
          if (data.message) {
            alert('Payment successful!');
          } else {
            setError(data.error || 'Confirmation failed');
          }
        })
        .catch(err => setError(err.message))
        .finally(() => setProcessing(false));
    } else {
      setError('Payment failed');
      setProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <CardElement />
      <button disabled={!stripe || processing}>Pay ${amount}</button>
      {error && <div>{error}</div>}
    </form>
  );
};

const Checkout = ({ bookingId, amount }) => (
  <Elements stripe={stripePromise}>
    <CheckoutForm bookingId={bookingId} amount={amount} />
  </Elements>
);

export default Checkout;
