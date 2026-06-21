import React, { useState, useEffect } from "react";
import { Calendar, User, Clock, Dumbbell, Award, CreditCard, Send, CheckCircle2 } from "lucide-react";
import { supabase } from "../lib/supabase";

interface LiveVenue { id: string; name: string; }

interface BookingFormProps {
  initialVenueName?: string;
  onSuccessSubmit?: () => void;
}

export const BookingForm: React.FC<BookingFormProps> = ({ initialVenueName = "", onSuccessSubmit }) => {
  const [liveVenues, setLiveVenues] = useState<LiveVenue[]>([]);
  const [selectedVenue, setSelectedVenue] = useState(initialVenueName || "");

  useEffect(() => {
    supabase.from("venues").select("id, name").order("created_at", { ascending: true }).then(({ data }) => {
      if (data && data.length > 0) {
        setLiveVenues(data as LiveVenue[]);
        if (!initialVenueName) setSelectedVenue(data[0].name);
      }
    });
  }, [initialVenueName]);
  const [activity, setActivity] = useState("Football (3G Pitch)");
  const [facilitiesNeeded, setFacilitiesNeeded] = useState("3G All-Weather Pitch");
  const [bookingDate, setBookingDate] = useState("");
  const [timeslot, setTimeslot] = useState("18:00 - 20:00 (Evenings)");
  const [durationHours, setDurationHours] = useState(2);
  const [attendees, setAttendees] = useState(15);
  
  // Contact details
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [org, setOrg] = useState("");
  const [notes, setNotes] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Sync initial venue if passed in
  useEffect(() => {
    if (initialVenueName) setSelectedVenue(initialVenueName);
  }, [initialVenueName]);

  const sportsOptions = [
    "Football (3G Pitch)",
    "Indoor Football / Futsal",
    "Basketball / Netball",
    "Badminton Singles/Doubles",
    "Dance Studio Classes",
    "Drama & Performing Arts",
    "Religious Services / Worship",
    "Meetings / Classroom Exams",
    "Community Celebrations",
  ];

  // Estimate a price based on selected facilities, duration, etc. for extreme realism!
  const estimatedHourlyPrice = (() => {
    switch (facilitiesNeeded) {
      case "3G All-Weather Pitch":
        return 75;
      case "Sports Hall":
        return 55;
      case "Dance Studio":
        return 35;
      case "Classrooms":
        return 25;
      case "Main Hall":
        return 45;
      default:
        return 40;
    }
  })();

  const totalPrice = estimatedHourlyPrice * durationHours;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !email || !phone) {
      alert("Please fill in all mandatory contact information (Name, Email, Phone).");
      return;
    }
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
      if (onSuccessSubmit) {
        onSuccessSubmit();
      }
    }, 1200);
  };

  const handleReset = () => {
    setIsSubmitted(false);
    setFullName("");
    setEmail("");
    setPhone("");
    setOrg("");
    setNotes("");
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8" id="booking-form-box">
      
      {/* Title */}
      <div className="mb-12 text-center">
        <span className="text-sm font-bold uppercase tracking-wider text-lrso-crimson-600 bg-lrso-crimson-50 border border-lrso-crimson-600/10 px-4 py-2 rounded-full">
          Instant Reservation Request
        </span>
        <h2 className="mt-5 font-display text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 leading-tight">
          Book Your Shared Space
        </h2>
        <p className="mt-5 text-lg text-slate-600 max-w-2xl mx-auto font-medium">
          We operate full calendar booking setups powered by Bookteq. Submit your slot requirements, and team coordinators will finalize locking schedules.
        </p>
      </div>

      {!isSubmitted ? (
        <form
          onSubmit={handleSubmit}
          className="rounded-3xl bg-white p-6 border border-slate-200 shadow-xl lg:p-10"
        >
          <div className="grid gap-8 md:grid-cols-2">
            
            {/* Step 1: Booking parameters */}
            <div className="space-y-6">
              <h3 className="font-display text-lg font-bold text-slate-950 flex items-center gap-2 border-b border-slate-100 pb-3">
                <Dumbbell className="h-5 w-5 text-lrso-blue-600" />
                1. Select Venue & Space
              </h3>

              {/* Venue Dropdown */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                  Target School Venue *
                </label>
                <select
                  value={selectedVenue}
                  onChange={(e) => setSelectedVenue(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm font-semibold text-slate-800 focus:bg-white focus:outline-hidden"
                >
                  {liveVenues.length === 0 && <option value="">Loading venues…</option>}
                  {liveVenues.map((v) => (
                    <option key={v.id} value={v.name}>
                      {v.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Activities Dropdown */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                  Activity Intent *
                </label>
                <select
                  value={activity}
                  onChange={(e) => setActivity(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm font-semibold text-slate-800 focus:bg-white focus:outline-hidden"
                >
                  {sportsOptions.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>

              {/* Specific Space Selection */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                  Desired Facility Space *
                </label>
                <select
                  value={facilitiesNeeded}
                  onChange={(e) => setFacilitiesNeeded(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm font-semibold text-slate-800 focus:bg-white focus:outline-hidden"
                >
                  {["3G All-Weather Pitch", "Sports Hall", "Dance Studio", "Drama Studio", "Main Hall", "Classrooms", "Gymnasium", "Other"].map((fac) => (
                    <option key={fac} value={fac}>
                      {fac}
                    </option>
                  ))}
                </select>
              </div>

              {/* Schedule and timeslots */}
              <div className="grid gap-4 grid-cols-2">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                    Date Required *
                  </label>
                  <input
                    type="date"
                    required
                    value={bookingDate}
                    onChange={(e) => setBookingDate(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs font-semibold text-slate-800 focus:bg-white focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                    Timeslot Interval
                  </label>
                  <select
                    value={timeslot}
                    onChange={(e) => setTimeslot(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs font-semibold text-slate-800 focus:bg-white focus:outline-hidden"
                  >
                    <option value="17:00 - 19:00 (Evenings)">17:00 - 19:00</option>
                    <option value="18:00 - 20:00 (Evenings)">18:00 - 20:00</option>
                    <option value="20:00 - 22:00 (Evenings)">20:00 - 22:00</option>
                    <option value="09:00 - 11:00 (Weekends)">09:00 - 11:00</option>
                    <option value="13:00 - 15:00 (Weekends)">13:00 - 15:00</option>
                    <option value="15:00 - 17:00 (Weekends)">15:00 - 17:00</option>
                  </select>
                </div>
              </div>

              {/* Attendees & Duration */}
              <div className="grid gap-4 grid-cols-2">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                    Duration (Hours)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={durationHours}
                    onChange={(e) => setDurationHours(parseInt(e.target.value) || 1)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm font-semibold text-slate-800 focus:bg-white focus:outline-hidden px-4"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                    Expected Attendees
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={attendees}
                    onChange={(e) => setAttendees(parseInt(e.target.value) || 1)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm font-semibold text-slate-800 focus:bg-white focus:outline-hidden px-4"
                  />
                </div>
              </div>
            </div>

            {/* Step 2: Customer Contact info */}
            <div className="space-y-6">
              <h3 className="font-display text-lg font-bold text-slate-950 flex items-center gap-2 border-b border-slate-100 pb-3">
                <User className="h-5 w-5 text-lrso-crimson-600" />
                2. Contact Details
              </h3>

              {/* Full name */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. David Beckham"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm font-semibold text-slate-800 focus:bg-white focus:outline-hidden"
                />
              </div>

              {/* Email Address */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  placeholder="e.g. david@myfutsalclub.co.uk"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm font-semibold text-slate-800 focus:bg-white focus:outline-hidden"
                />
              </div>

              {/* Telephone */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                  Mobile / Phone Number *
                </label>
                <input
                  type="tel"
                  required
                  placeholder="e.g. +44 7700 900077"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm font-semibold text-slate-800 focus:bg-white focus:outline-hidden font-mono"
                />
              </div>

              {/* Organisation Name */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                  Organisation Name (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Aspley Youth FC or Nottingham Worship"
                  value={org}
                  onChange={(e) => setOrg(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm font-semibold text-slate-800 focus:bg-white focus:outline-hidden"
                />
              </div>

              {/* Additional Notes */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                  Special Guidelines & Equipment Needs
                </label>
                <textarea
                  placeholder="Detail clean requirements, changing rooms need, goals set up or netball posts etc."
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs font-semibold text-slate-800 focus:bg-white focus:outline-hidden resize-none"
                />
              </div>
            </div>
          </div>

          {/* Pricing Estimation Banner & Submission */}
          <div className="mt-10 rounded-2xl bg-slate-900 text-white p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-white/10 p-3 text-emerald-400">
                <CreditCard className="h-6 w-6" />
              </div>
              <div>
                <div className="text-[10px] uppercase font-bold tracking-widest text-[#a0aec0]">
                  Dynamic Estimator
                </div>
                <div className="font-display text-2xl font-bold">
                  &pound;{totalPrice}{" "}
                  <span className="text-xs font-normal text-slate-300">
                    (&pound;{estimatedHourlyPrice}/hr for {durationHours}hrs)
                  </span>
                </div>
              </div>
            </div>

            <button
              type="submit"
              id="submit-enquiry-btn"
              disabled={isSubmitting}
              className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-lrso-crimson-600 to-lrso-crimson-700 px-8 py-4 text-sm font-bold text-white shadow-lg hover:from-lrso-crimson-700 hover:to-lrso-crimson-800 hover:scale-[1.02] disabled:opacity-50 select-none cursor-pointer transition-all"
            >
              {isSubmitting ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Syncing with Bookteq...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  Request Booking Slot &rarr;
                </>
              )}
            </button>
          </div>
        </form>
      ) : (
        /* Submission Success Screen */
        <div className="rounded-3xl bg-white border border-slate-200 p-10 shadow-xl text-center max-w-2xl mx-auto space-y-6">
          <div className="mx-auto h-16 w-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center animate-bounce">
            <CheckCircle2 className="h-10 w-10" />
          </div>
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">
              Enquiry Transmitted
            </span>
            <h3 className="mt-4 font-display text-2xl font-bold text-slate-900">
              Booking Request Successfully Lodged!
            </h3>
            <p className="mt-2 text-sm text-slate-500 leading-relaxed font-semibold">
              Thank you, <strong className="text-slate-800 font-bold">{fullName}</strong>. Your enquiry for{" "}
              <strong className="text-slate-800 font-bold">{facilitiesNeeded}</strong> at{" "}
              <strong className="text-slate-800 font-bold">{selectedVenue}</strong> on{" "}
              <strong className="text-slate-800 font-bold">{bookingDate || "your requested date"}</strong> has been registered.
            </p>
          </div>

          {/* Receipt Breakdown */}
          <div className="rounded-2xl bg-slate-50 border border-slate-100 p-6 text-left text-xs text-slate-600 font-medium">
            <div className="font-bold text-slate-900 text-sm mb-4 border-b pb-2">Facility Receipt Breakdown</div>
            <div className="space-y-1.5">
              <p><strong>Proposed Space:</strong> {facilitiesNeeded}</p>
              <p><strong>Sport/Intent:</strong> {activity}</p>
              <p><strong>Date & Timeslot:</strong> {bookingDate} &bull; {timeslot}</p>
              {org && <p><strong>Club/Organisation:</strong> {org}</p>}
              <p><strong>Est. Budget:</strong> &pound;{totalPrice} (&pound;{estimatedHourlyPrice}/hour)</p>
              <p className="mt-2 text-[10px] text-slate-400">Our Bookteq administration will reach out to you within 24 hours to schedule activation.</p>
            </div>
          </div>

          <div className="pt-4 flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={handleReset}
              id="new-booking-enquiry"
              className="rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-bold text-slate-700 px-6 py-3"
            >
              Submit Another Request
            </button>
            <a
              href="mailto:enquiries@lrso.co.uk"
              className="rounded-xl bg-slate-900 text-white hover:bg-slate-800 text-xs font-bold px-6 py-3 block text-center"
            >
              Email Directly
            </a>
          </div>
        </div>
      )}
    </div>
  );
};
