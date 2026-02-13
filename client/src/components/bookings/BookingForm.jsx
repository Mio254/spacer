import { useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

import { checkAvailability, createBooking } from "../../services/bookingService";
import AvailabilityCalendar from "./AvailabilityCalendar";
import DurationSelector from "./DurationSelector";
import BookingSummary from "./BookingSummary";
import { calculateDuration } from "../../utils/dateUtils";
import { calculatePrice } from "../../utils/priceCalculator";

const BookingForm = ({ spaceId, pricePerHour }) => {
  const { token } = useSelector((s) => s.auth);
  const navigate = useNavigate();

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [duration, setDuration] = useState(1);
  const [available, setAvailable] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  // Auto-calculate duration from dates if both provided
  const derivedDuration = useMemo(() => {
    if (!startDate || !endDate) return null;
    const hrs = calculateDuration(startDate, endDate);
    if (!Number.isFinite(hrs) || hrs <= 0) return null;
    return Math.max(1, Math.ceil(hrs));
  }, [startDate, endDate]);

  const effectiveDuration = derivedDuration ?? duration;
  const totalPrice = calculatePrice(effectiveDuration, pricePerHour);

  const handleCheck = async () => {
    setError(null);
    setBusy(true);
    try {
      const data = await checkAvailability(spaceId, {
        start_date: startDate,
        end_date: endDate,
      });
      setAvailable(Boolean(data.available));
    } catch (e) {
      setError(e.message);
      setAvailable(null);
    } finally {
      setBusy(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!token) {
      setError("You must be logged in to create a booking.");
      return;
    }
    if (!startDate || !endDate) {
      setError("Please select both start and end date/time.");
      return;
    }
    if (available === false) {
      setError("Selected time slot is unavailable.");
      return;
    }

    setBusy(true);
    try {
      await createBooking(
        {
          space_id: spaceId,
          start_date: startDate,
          end_date: endDate,
          duration: effectiveDuration,
        },
        token
      );

      // ✅ SUCCESS → redirect to confirmation page
      navigate("/booking/confirmed", { replace: true });
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm"
    >
      <div className="grid gap-3 md:grid-cols-2">
        <div className="space-y-1">
          <label className="text-sm font-medium text-gray-700">Start</label>
          <input
            type="datetime-local"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-600"
          />
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium text-gray-700">End</label>
          <input
            type="datetime-local"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-600"
          />
        </div>
      </div>

      <div className="flex items-center justify-between gap-3">
        <div className="text-sm text-gray-600">
          Duration:{" "}
          <span className="font-semibold text-gray-900">
            {effectiveDuration}
          </span>{" "}
          hour(s)
          {derivedDuration !== null && (
            <span className="ml-2 rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
              auto
            </span>
          )}
        </div>

        {derivedDuration === null && (
          <div className="w-28">
            <DurationSelector
              duration={duration}
              setDuration={setDuration}
            />
          </div>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={handleCheck}
          disabled={busy || !startDate || !endDate}
          className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-800 hover:bg-gray-50 disabled:opacity-60"
        >
          {busy ? "Checking..." : "Check availability"}
        </button>

        <button
          type="submit"
          disabled={busy || !startDate || !endDate}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
        >
          {busy ? "Submitting..." : "Confirm booking"}
        </button>
      </div>

      <AvailabilityCalendar available={available} />

      <BookingSummary
        startDate={startDate}
        endDate={endDate}
        totalPrice={totalPrice}
      />

      {error && <p className="text-sm text-red-600">{error}</p>}
    </form>
  );
};

export default BookingForm;
