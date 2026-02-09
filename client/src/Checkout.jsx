import { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';

// Load Stripe with publishable key (for testing, this is mocked)
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

/**
 * CheckoutForm component handles the payment form using Stripe Elements.
 * Creates payment intent on mount and handles form submission.
 */
const CheckoutForm = ({ bookingId, amount }) => {
  const stripe = useStripe(); // Stripe hook
  const elements = useElements(); // Elements hook
  const [clientSecret, setClientSecret] = useState(''); // Client secret for payment intent
  const [error, setError] = useState(null); // Error state
  const [processing, setProcessing] = useState(false); // Processing state

  // Create payment intent when component mounts
  useEffect(() => {
    fetch('http://127.0.0.1:5001/payments/create-intent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}` // JWT token from localStorage
      },
      body: JSON.stringify({ booking_id: bookingId, amount: amount * 100 }) // Convert to cents
    })
      .then(res => res.json())
      .then(data => {
        if (data.client_secret) {
          setClientSecret(data.client_secret); // Set client secret if successful
        } else {
          setError(data.error); // Set error if failed
        }
      });
  }, [bookingId, amount]);

  // Handle form submission for payment
  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!stripe || !elements) return; // Ensure Stripe is loaded

    setProcessing(true); // Set processing state
    const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
      payment_method: {
        card: elements.getElement(CardElement), // Get card element
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
            alert('Payment successful!'); // Success alert
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
      <CardElement /> {/* Stripe card input element */}
      <button disabled={!stripe || processing}>Pay ${amount}</button> {/* Submit button */}
      {error && <div>{error}</div>} {/* Display error if any */}
    </form>
  );
};

/**
 * Checkout component wraps CheckoutForm with Stripe Elements provider.
 */
const Checkout = ({ bookingId, amount }) => (
  <Elements stripe={stripePromise}>
    <CheckoutForm bookingId={bookingId} amount={amount} />
  </Elements>
);

export default Checkout;
