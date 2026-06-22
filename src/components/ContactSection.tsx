import React, { useState, useEffect } from "react";
import { Mail, Phone, MapPin, Send, CheckCircle2, Navigation, Loader2 } from "lucide-react";
import { supabase } from "../lib/supabase";
import { useSiteContent } from "../context/SiteContentContext";

interface ContactSectionProps {
  initialSubject?: string;
}

export const ContactSection: React.FC<ContactSectionProps> = ({ initialSubject }) => {
  const { value } = useSiteContent();
  const [directionsExpanded, setDirectionsExpanded] = useState(false);
  const [supportSubmitted, setSupportSubmitted] = useState(false);
  const [supportName, setSupportName] = useState("");
  const [supportEmail, setSupportEmail] = useState("");
  const [supportMsg, setSupportMsg] = useState("");
  const [supportSubject, setSupportSubject] = useState("Invoice or Lettings Finance question");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  useEffect(() => {
    if (initialSubject) {
      setSupportSubject(initialSubject);
    }
  }, [initialSubject]);

  const handleSupportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setSubmitError("");
    const { error } = await supabase.from("contacts").insert({
      name: supportName,
      email: supportEmail,
      subject: supportSubject,
      message: supportMsg,
    });
    setSubmitting(false);
    if (error) {
      setSubmitError(error.message);
    } else {
      setSupportSubmitted(true);
    }
  };

  const stepsM23 = [
    "Leave M23 at Junction 10 and follow signs to Crawley.",
    "After the dual carriageway, take the 4th exit off the roundabout towards Manor Royal.",
    "At the next roundabout, take the 1st exit and follow the road to the junction with A23.",
    "Turn right at the traffic lights, go through the next set of traffic lights, and at the subsequent set of traffic lights (with NEXT on your left-hand side), turn left.",
    "At the roundabout, go straight over and take the next turning on your right into Whitworth Road.",
    "Follow the road around to the left and enter Amberley Court.",
    "LRSO is situated at Unit 8 (the last building/office on the right-hand side).",
  ];

  return (
    <section className="bg-slate-50 py-20 border-y border-slate-200" id="contact-section">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="font-display text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 leading-tight">
            {value("contact.page.title", "Contact Headquarters & Support")}
          </h2>
          <p className="mt-5 text-lg text-slate-600 max-w-2xl mx-auto font-medium">
            {value("contact.page.subtitle", "We operate fully staffed administrations from Crawley, handling reservations, payments, and site health audits.")}
          </p>
        </div>

        <div className="grid gap-10 lg:grid-cols-12 items-stretch">
          
          {/* Left Block: Direct Communications & Directions */}
          <div className="lg:col-span-5 space-y-6 flex flex-col justify-between">
            <div className="space-y-6">
              
              {/* Core Information Cards */}
              <div className="rounded-2xl bg-white p-6 border border-slate-200 shadow-xs">
                <h3 className="font-display text-lg font-bold text-slate-950 mb-4">Contact Info</h3>
                <div className="space-y-4">
                  <a href={`tel:${value("footer.phone", "03333355944")}`} className="flex items-center gap-3.5 hover:text-lrso-blue-600 transition-colors group">
                    <span className="rounded-xl bg-lrso-blue-50 p-2.5 text-lrso-blue-600 group-hover:bg-lrso-blue-100">
                      <Phone className="h-5 w-5" />
                    </span>
                    <div>
                      <span className="block text-[10px] uppercase font-bold text-slate-400">Call Support Office</span>
                      <span className="text-sm font-bold text-slate-800 font-mono">{value("footer.phone", "0333 3355 944")}</span>
                    </div>
                  </a>

                  <a href={`mailto:${value("footer.email", "enquiries@lrso.co.uk")}`} className="flex items-center gap-3.5 hover:text-lrso-crimson-600 transition-colors group">
                    <span className="rounded-xl bg-lrso-crimson-50 p-2.5 text-[#c11f38] group-hover:bg-red-100">
                      <Mail className="h-5 w-5" />
                    </span>
                    <div>
                      <span className="block text-[10px] uppercase font-bold text-slate-400">General Enquiries</span>
                      <span className="text-sm font-bold text-slate-800">{value("footer.email", "enquiries@lrso.co.uk")}</span>
                    </div>
                  </a>

                  <div className="flex items-start gap-3.5">
                    <span className="rounded-xl bg-slate-100 p-2.5 text-slate-600 mt-1">
                      <MapPin className="h-5 w-5" />
                    </span>
                    <div>
                      <span className="block text-[10px] uppercase font-bold text-slate-400">Sales & Marketing HQ</span>
                      <span className="text-xs text-slate-600 font-semibold leading-relaxed whitespace-pre-line">
                        {value("contact.address", "LRSO Ltd, Unit 8, Amberley Court,\nWhitworth Road, Crawley, West Sussex,\nRH11 7XL")}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Driving Directions Accordion (Text pasted from requirements) */}
              <div className="rounded-2xl bg-white border border-slate-200 overflow-hidden shadow-xs">
                <button
                  onClick={() => setDirectionsExpanded(!directionsExpanded)}
                  className="flex w-full items-center justify-between p-6 text-left select-none font-sans"
                >
                  <div className="flex items-center gap-3">
                    <Navigation className="h-5 w-5 text-lrso-crimson-600 animate-pulse" />
                    <span className="font-bold text-sm text-slate-900">Driving Directions (from M23)</span>
                  </div>
                  <span className="text-xs font-bold text-lrso-blue-600 hover:underline">
                    {directionsExpanded ? "Collapse" : "Expand"}
                  </span>
                </button>

                {directionsExpanded && (
                  <div className="p-6 bg-slate-50 border-t border-slate-100 text-xs text-slate-600 space-y-3.5">
                    <div className="font-bold text-slate-900 pb-1 border-b">Junction 10 M23 Directions:</div>
                    <ol className="space-y-2.5">
                      {stepsM23.map((step, k) => (
                        <li key={k} className="flex gap-2">
                          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-slate-200 text-[10px] font-bold text-slate-700">
                            {k + 1}
                          </span>
                          <span className="leading-relaxed font-semibold">{step}</span>
                        </li>
                      ))}
                    </ol>
                  </div>
                )}
              </div>
            </div>

            {/* Operating Times footer advice */}
            <div className="bg-lrso-blue-800 rounded-2xl p-6 text-white text-xs">
              <h4 className="font-display font-bold text-sm mb-2">Primary Support Hours</h4>
              <p className="text-slate-300 leading-relaxed font-medium mb-3">Our administrators are online Monday through Friday, 9:00 AM to 5:30 PM. For emergency supervisor contact, reach out to specific venue dispatch numbers provided on checkout.</p>
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
                <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-slate-300">Offices Operational</span>
              </div>
            </div>

          </div>

          {/* Right Block: Instant Ticket submissions */}
          <div className="lg:col-span-7">
            <div className="rounded-3xl bg-white border border-slate-200 p-8 shadow-xs h-full flex flex-col justify-between">
              
              {!supportSubmitted ? (
                <form onSubmit={handleSupportSubmit} className="space-y-6 h-full flex flex-col justify-between">
                  <div>
                    <h3 className="font-display text-lg font-bold text-slate-950 mb-2">Send an Instant Support Ticket</h3>
                    <p className="text-xs text-slate-500 mb-6">Need support regarding payments, invoices, site coordinates, or lost items? Submit your message in the dashboard lines below.</p>
                    
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Your Name *</label>
                        <input
                          type="text"
                          required
                          value={supportName}
                          onChange={(e) => setSupportName(e.target.value)}
                          placeholder="e.g. Sarah Connor"
                          className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm font-semibold text-slate-800 focus:bg-white focus:outline-hidden"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Your Email *</label>
                        <input
                          type="email"
                          required
                          value={supportEmail}
                          onChange={(e) => setSupportEmail(e.target.value)}
                          placeholder="e.g. sarah@outlook.com"
                          className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm font-semibold text-slate-800 focus:bg-white focus:outline-hidden"
                        />
                      </div>
                    </div>

                    <div className="mt-4">
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Regarding Subject</label>
                      <select value={supportSubject} onChange={(e) => setSupportSubject(e.target.value)} className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm font-semibold text-slate-800 focus:bg-white focus:outline-hidden">
                        <option>Invoice or Lettings Finance question</option>
                        <option>Forgotten/Lost item claim</option>
                        <option>Onboarding my School / Sports club trust</option>
                        <option>Complaint/Feedback on Venue Supervisor</option>
                        <option>Venue enquiry</option>
                        <option>Other emergency enquiry</option>
                      </select>
                    </div>

                    <div className="mt-4">
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Explain details *</label>
                      <textarea
                        required
                        value={supportMsg}
                        onChange={(e) => setSupportMsg(e.target.value)}
                        placeholder="Please describe details of your inquiry clearly, including specific dates if referring to a completed booking event..."
                        rows={5}
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs font-semibold text-slate-800 focus:bg-white focus:outline-hidden resize-none"
                      />
                    </div>
                  </div>

                  {submitError && (
                    <div className="mt-4 rounded-xl bg-red-50 border border-red-200 p-3 text-xs font-bold text-red-700">
                      {submitError}
                    </div>
                  )}
                  <button
                    type="submit"
                    disabled={submitting}
                    id="submit-support-ticket"
                    className="w-full mt-6 flex items-center justify-center gap-2 rounded-xl bg-slate-900 py-3.5 text-xs font-bold text-white cursor-pointer select-none hover:bg-slate-800 disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                    {submitting ? "Sending..." : "Submit Enquiry"}
                  </button>
                </form>
              ) : (
                /* Ticket Success Panel */
                <div className="flex flex-col items-center justify-center text-center p-8 space-y-6 h-full">
                  <div className="h-14 w-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
                    <CheckCircle2 className="h-8 w-8" />
                  </div>
                  <div>
                    <h4 className="font-display font-bold text-xl text-slate-900">Message Lodged Successfully!</h4>
                    <p className="mt-2 text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
                      Thank you, <strong className="text-slate-800">{supportName || "Customer"}</strong>. Your support query has been logged with system ticket identifier <strong>#LRS-{Math.floor(Math.random() * 100000)}</strong>.
                    </p>
                    <p className="mt-1 text-xs text-slate-400">Our support coordinators will reply to you within 2-4 working hours.</p>
                  </div>
                  <button
                    onClick={() => {
                      setSupportSubmitted(false);
                      setSupportName("");
                      setSupportEmail("");
                      setSupportMsg("");
                      setSubmitError("");
                    }}
                    id="new-ticket-btn"
                    className="rounded-xl border border-slate-200 text-xs font-semibold px-5 py-2.5 text-slate-700 hover:bg-slate-50"
                  >
                    Submit Another Help Ticket
                  </button>
                </div>
              )}

            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
