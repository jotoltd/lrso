import React, { useState, useEffect, useCallback } from "react";
import {
  LayoutDashboard,
  Building2,
  Mail,
  Users,
  LogOut,
  Search,
  Plus,
  CheckCircle2,
  Clock,
  XCircle,
  ExternalLink,
  MapPin,
  Tag,
  Loader2,
  Trash2,
  RefreshCw,
  ImagePlus,
  Pencil,
  FileText,
  Save,
} from "lucide-react";
import { supabase } from "../lib/supabase";

interface AdminDashboardProps {
  onLogout: () => void;
}

type AdminTab = "overview" | "venues" | "enquiries" | "contacts" | "content";

interface Venue { id: string; name: string; address: string; book_link: string; logo_url: string | null; created_at: string; }
interface Enquiry { id: string; name: string; email: string; venue: string; message: string | null; status: "pending" | "approved" | "rejected"; created_at: string; }
interface Contact { id: string; name: string; email: string; subject: string; message: string | null; read: boolean; status: "open" | "replied" | "closed"; notes: string | null; created_at: string; }
interface VenueForm { name: string; address: string; book_link: string; logo_url: string | null; }
interface FacilityRow { uid: string; name: string; description: string; file: File | null; preview: string | null; }
interface EditFacilityRow { uid: string; dbId?: string; name: string; description: string; existingImageUrl: string | null; file: File | null; preview: string | null; }
interface SiteContentItem { id: string; key: string; page: string; label: string; content: string; image_url: string | null; updated_at: string; }

const navItems: { id: AdminTab; label: string; icon: React.ReactNode }[] = [
  { id: "overview", label: "Overview", icon: <LayoutDashboard className="h-4 w-4" /> },
  { id: "venues", label: "Venues", icon: <Building2 className="h-4 w-4" /> },
  { id: "enquiries", label: "Enquiries", icon: <Mail className="h-4 w-4" /> },
  { id: "contacts", label: "Contacts", icon: <Users className="h-4 w-4" /> },
  { id: "content", label: "Site Content", icon: <FileText className="h-4 w-4" /> },
];

const StatusBadge = ({ status }: { status: string }) => {
  const s: Record<string, string> = { pending: "bg-amber-50 text-amber-700 border-amber-200", approved: "bg-emerald-50 text-emerald-700 border-emerald-200", rejected: "bg-red-50 text-red-700 border-red-200" };
  return (
    <span className={`inline-flex items-center gap-1 rounded-lg border px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide ${s[status] || s.pending}`}>
      {status === "approved" && <CheckCircle2 className="h-3 w-3" />}
      {status === "pending" && <Clock className="h-3 w-3" />}
      {status === "rejected" && <XCircle className="h-3 w-3" />}
      {status}
    </span>
  );
};

const Spinner = () => <div className="p-10 text-center"><Loader2 className="h-5 w-5 animate-spin mx-auto text-slate-400" /></div>;
const Empty = ({ msg }: { msg: string }) => <p className="px-6 py-10 text-sm text-slate-400 text-center">{msg}</p>;

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onLogout }) => {
  const [activeTab, setActiveTab] = useState<AdminTab>("overview");
  const [searchQuery, setSearchQuery] = useState("");
  const [venues, setVenues] = useState<Venue[]>([]);
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loadingV, setLoadingV] = useState(true);
  const [loadingE, setLoadingE] = useState(true);
  const [loadingC, setLoadingC] = useState(true);
  const [contentItems, setContentItems] = useState<SiteContentItem[]>([]);
  const [loadingContent, setLoadingContent] = useState(false);
  const [contentSearch, setContentSearch] = useState("");
  const [contentPage, setContentPage] = useState("");
  const [savingContent, setSavingContent] = useState<string | null>(null);
  const [showContentForm, setShowContentForm] = useState(false);
  const [newContent, setNewContent] = useState({ key: "", page: "global", label: "", content: "" });
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<VenueForm>({ name: "", address: "", book_link: "", logo_url: null });
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [facilityRows, setFacilityRows] = useState<FacilityRow[]>([{ uid: crypto.randomUUID(), name: "", file: null, preview: null }]);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveErr, setSaveErr] = useState("");

  // Edit venue state
  const [editingVenue, setEditingVenue] = useState<Venue | null>(null);
  const [editForm, setEditForm] = useState<VenueForm>({ name: "", address: "", book_link: "", logo_url: null });
  const [editLogoFile, setEditLogoFile] = useState<File | null>(null);
  const [editLogoPreview, setEditLogoPreview] = useState<string | null>(null);
  const [editFacilityRows, setEditFacilityRows] = useState<EditFacilityRow[]>([]);
  const [editOriginalIds, setEditOriginalIds] = useState<Set<string>>(new Set());
  const [editSaving, setEditSaving] = useState(false);
  const [editSaved, setEditSaved] = useState(false);
  const [editErr, setEditErr] = useState("");

  const fetchV = useCallback(async () => { setLoadingV(true); const { data } = await supabase.from("venues").select("*").order("created_at", { ascending: false }); if (data) setVenues(data as Venue[]); setLoadingV(false); }, []);
  const fetchE = useCallback(async () => { setLoadingE(true); const { data } = await supabase.from("enquiries").select("*").order("created_at", { ascending: false }); if (data) setEnquiries(data as Enquiry[]); setLoadingE(false); }, []);
  const fetchC = useCallback(async () => { setLoadingC(true); const { data } = await supabase.from("contacts").select("*").order("created_at", { ascending: false }); if (data) setContacts(data as Contact[]); setLoadingC(false); }, []);
  const fetchContent = useCallback(async () => { setLoadingContent(true); const { data } = await supabase.from("site_content").select("*").order("page", { ascending: true }).order("label", { ascending: true }); if (data) setContentItems(data as SiteContentItem[]); setLoadingContent(false); }, []);

  useEffect(() => { fetchV(); fetchE(); fetchC(); fetchContent(); }, [fetchV, fetchE, fetchC, fetchContent]);

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    setLogoFile(file);
    setLogoPreview(file ? URL.createObjectURL(file) : null);
  };

  const addFacilityRow = () => setFacilityRows(r => [...r, { uid: crypto.randomUUID(), name: "", description: "", file: null, preview: null }]);
  const removeFacilityRow = (uid: string) => setFacilityRows(r => r.filter(f => f.uid !== uid));
  const updateFacilityName = (uid: string, name: string) => setFacilityRows(r => r.map(f => f.uid === uid ? { ...f, name } : f));
  const updateFacilityDescription = (uid: string, description: string) => setFacilityRows(r => r.map(f => f.uid === uid ? { ...f, description } : f));
  const updateFacilityImage = (uid: string, file: File | null) => setFacilityRows(r => r.map(f => f.uid === uid ? { ...f, file, preview: file ? URL.createObjectURL(file) : null } : f));

  const uploadImage = async (bucket: string, file: File): Promise<string> => {
    const ext = file.name.split(".").pop();
    const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const { error } = await supabase.storage.from(bucket).upload(path, file, { upsert: true });
    if (error) throw error;
    return supabase.storage.from(bucket).getPublicUrl(path).data.publicUrl;
  };

  const addVenue = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true); setSaveErr("");
    try {
      let logo_url: string | null = null;
      if (logoFile) logo_url = await uploadImage("venue-logos", logoFile);
      const { data: venueData, error: venueErr } = await supabase.from("venues").insert([{ ...form, logo_url }]).select().single();
      if (venueErr) throw venueErr;
      const validFacilities = facilityRows.filter(f => f.name.trim());
      for (let i = 0; i < validFacilities.length; i++) {
        const fac = validFacilities[i];
        let image_url: string | null = null;
        if (fac.file) image_url = await uploadImage("facility-images", fac.file);
        await supabase.from("facilities").insert([{ venue_id: venueData.id, name: fac.name.trim(), description: fac.description.trim() || null, image_url, sort_order: i }]);
      }
      setForm({ name: "", address: "", book_link: "", logo_url: null });
      setLogoFile(null); setLogoPreview(null);
      setFacilityRows([{ uid: crypto.randomUUID(), name: "", description: "", file: null, preview: null }]);
      setShowForm(false); setSaved(true); fetchV();
      setTimeout(() => setSaved(false), 4000);
    } catch (err: unknown) {
      setSaveErr(err instanceof Error ? err.message : "An error occurred");
    }
    setSaving(false);
  };

  const deleteVenue = async (id: string) => { if (!confirm("Delete this venue?")) return; await supabase.from("venues").delete().eq("id", id); fetchV(); };

  // Edit venue functions
  const startEdit = async (venue: Venue) => {
    setEditingVenue(venue);
    setEditForm({ name: venue.name, address: venue.address, book_link: venue.book_link, logo_url: venue.logo_url });
    setEditLogoFile(null);
    setEditLogoPreview(venue.logo_url);
    setEditErr(""); setEditSaved(false);
    const { data } = await supabase.from("facilities").select("*").eq("venue_id", venue.id).order("sort_order", { ascending: true });
    if (data) {
      const rows: EditFacilityRow[] = (data as { id: string; name: string; description: string | null; image_url: string | null; sort_order: number }[]).map(f => ({
        uid: crypto.randomUUID(),
        dbId: f.id,
        name: f.name,
        description: f.description || "",
        existingImageUrl: f.image_url,
        file: null,
        preview: null,
      }));
      setEditFacilityRows(rows.length ? rows : [{ uid: crypto.randomUUID(), name: "", description: "", existingImageUrl: null, file: null, preview: null }]);
      setEditOriginalIds(new Set(rows.map(r => r.dbId!).filter(Boolean)));
    } else {
      setEditFacilityRows([{ uid: crypto.randomUUID(), name: "", description: "", existingImageUrl: null, file: null, preview: null }]);
      setEditOriginalIds(new Set());
    }
  };

  const cancelEdit = () => { setEditingVenue(null); setEditFacilityRows([]); setEditOriginalIds(new Set()); setEditLogoFile(null); setEditLogoPreview(null); };

  const addEditFacilityRow = () => setEditFacilityRows(r => [...r, { uid: crypto.randomUUID(), name: "", description: "", existingImageUrl: null, file: null, preview: null }]);
  const removeEditFacilityRow = (uid: string) => setEditFacilityRows(r => r.filter(f => f.uid !== uid));
  const updateEditFacilityName = (uid: string, name: string) => setEditFacilityRows(r => r.map(f => f.uid === uid ? { ...f, name } : f));
  const updateEditFacilityDescription = (uid: string, description: string) => setEditFacilityRows(r => r.map(f => f.uid === uid ? { ...f, description } : f));
  const updateEditFacilityImage = (uid: string, file: File | null) => setEditFacilityRows(r => r.map(f => f.uid === uid ? { ...f, file, preview: file ? URL.createObjectURL(file) : null } : f));

  const saveEditVenue = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingVenue) return;
    setEditSaving(true); setEditErr("");
    try {
      let logo_url = editForm.logo_url;
      if (editLogoFile) logo_url = await uploadImage("venue-logos", editLogoFile);
      const { error: venueErr } = await supabase.from("venues").update({
        name: editForm.name, address: editForm.address, book_link: editForm.book_link, logo_url
      }).eq("id", editingVenue.id);
      if (venueErr) throw venueErr;

      const currentIds = new Set<string>();
      const validFacilities = editFacilityRows.filter(f => f.name.trim());
      for (let i = 0; i < validFacilities.length; i++) {
        const fac = validFacilities[i];
        let image_url = fac.existingImageUrl;
        if (fac.file) image_url = await uploadImage("facility-images", fac.file);
        if (fac.dbId) {
          await supabase.from("facilities").update({
            name: fac.name.trim(), description: fac.description.trim() || null, image_url, sort_order: i
          }).eq("id", fac.dbId);
          currentIds.add(fac.dbId);
        } else {
          const { data } = await supabase.from("facilities").insert([{
            venue_id: editingVenue.id, name: fac.name.trim(), description: fac.description.trim() || null, image_url, sort_order: i
          }]).select().single();
          if (data) currentIds.add((data as { id: string }).id);
        }
      }
      for (const oldId of editOriginalIds) {
        if (!currentIds.has(oldId)) await supabase.from("facilities").delete().eq("id", oldId);
      }
      setEditSaved(true); fetchV(); cancelEdit();
      setTimeout(() => setEditSaved(false), 4000);
    } catch (err: unknown) {
      setEditErr(err instanceof Error ? err.message : "An error occurred");
    }
    setEditSaving(false);
  };

  const updateEnquiryStatus = async (id: string, status: Enquiry["status"]) => { await supabase.from("enquiries").update({ status }).eq("id", id); fetchE(); };
  const markRead = async (id: string) => { await supabase.from("contacts").update({ read: true }).eq("id", id); fetchC(); };
  const updateContactStatus = async (id: string, status: Contact["status"]) => { await supabase.from("contacts").update({ status }).eq("id", id); fetchC(); };
  const updateContactNotes = async (id: string, notes: string) => { await supabase.from("contacts").update({ notes }).eq("id", id); fetchC(); };

  const filteredE = enquiries.filter(e => [e.name, e.email, e.venue].some(f => f.toLowerCase().includes(searchQuery.toLowerCase())));

  const renderOverview = () => (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { label: "Total Venues", val: loadingV ? "—" : venues.length, icon: <Building2 className="h-5 w-5" />, gradient: "from-lrso-blue-600 to-lrso-blue-700", light: "bg-lrso-blue-50 text-lrso-blue-600", refresh: fetchV },
          { label: "Pending Enquiries", val: loadingE ? "—" : enquiries.filter(e => e.status === "pending").length, icon: <Mail className="h-5 w-5" />, gradient: "from-amber-500 to-orange-500", light: "bg-amber-50 text-amber-600", refresh: fetchE },
          { label: "Unread Messages", val: loadingC ? "—" : contacts.filter(c => !c.read).length, icon: <Users className="h-5 w-5" />, gradient: "from-lrso-crimson-600 to-rose-600", light: "bg-rose-50 text-rose-600", refresh: fetchC },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
              <span className={`inline-flex items-center justify-center h-10 w-10 rounded-xl bg-gradient-to-br ${s.gradient} text-white shadow-sm`}>{s.icon}</span>
              <button onClick={s.refresh} className="text-slate-300 hover:text-slate-500 cursor-pointer transition-colors mt-0.5"><RefreshCw className="h-3.5 w-3.5" /></button>
            </div>
            <div className="mt-4 text-3xl font-extrabold text-slate-900 font-display">{String(s.val)}</div>
            <div className="text-xs font-bold text-slate-500 mt-1 uppercase tracking-wide">{s.label}</div>
          </div>
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-bold text-slate-900">Recent Enquiries</h3>
            <button onClick={() => setActiveTab("enquiries")} className="text-xs font-bold text-lrso-crimson-600 hover:underline cursor-pointer">View All</button>
          </div>
          {loadingE ? <Spinner /> : enquiries.length === 0 ? <Empty msg="No enquiries yet." /> : (
            <div className="divide-y divide-slate-100">
              {enquiries.slice(0, 5).map(e => (
                <div key={e.id} className="px-6 py-4 flex items-center justify-between hover:bg-slate-50">
                  <div><p className="text-sm font-bold text-slate-900">{e.name}</p><p className="text-xs text-slate-500">{e.venue} &bull; {new Date(e.created_at).toLocaleDateString()}</p></div>
                  <StatusBadge status={e.status} />
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-bold text-slate-900">Recent Messages</h3>
            <button onClick={() => setActiveTab("contacts")} className="text-xs font-bold text-lrso-crimson-600 hover:underline cursor-pointer">View All</button>
          </div>
          {loadingC ? <Spinner /> : contacts.length === 0 ? <Empty msg="No messages yet." /> : (
            <div className="divide-y divide-slate-100">
              {contacts.slice(0, 5).map(c => (
                <div key={c.id} className="px-6 py-4 flex items-center justify-between hover:bg-slate-50">
                  <div className="flex items-center gap-2">
                    {!c.read && <span className="h-2 w-2 rounded-full bg-lrso-crimson-600 shrink-0" />}
                    <div><p className="text-sm font-bold text-slate-900">{c.name}</p><p className="text-xs text-slate-500">{c.subject}</p></div>
                  </div>
                  <span className="text-xs text-slate-400">{new Date(c.created_at).toLocaleDateString()}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderVenues = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h3 className="font-bold text-slate-900">Venue Management</h3><p className="text-sm text-slate-500">Bookings via Bookteq.</p></div>
        <button onClick={() => {
          const opening = !showForm;
          setShowForm(opening); setSaveErr("");
          if (opening) {
            setForm({ name: "", address: "", book_link: "", logo_url: null });
            setLogoFile(null); setLogoPreview(null);
            setFacilityRows([{ uid: crypto.randomUUID(), name: "", description: "", file: null, preview: null }]);
          }
        }} className="flex items-center gap-2 rounded-xl bg-lrso-crimson-600 hover:bg-lrso-crimson-700 text-sm font-bold text-white px-5 py-2.5 transition-all cursor-pointer">
          <Plus className="h-4 w-4" />{showForm ? "Cancel" : "Add Venue"}
        </button>
      </div>
      {saved && <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-4 text-sm text-emerald-800 flex items-center gap-2"><CheckCircle2 className="h-4 w-4" />Venue saved successfully.</div>}
      {showForm && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6">
          <h4 className="font-bold text-slate-900 mb-5">Add New Venue</h4>
          <form onSubmit={addVenue} className="space-y-5">

            {/* Venue details */}
            <div className="grid gap-4 md:grid-cols-2">
              <div className="md:col-span-2">
                <label className="block text-sm font-bold text-slate-700 mb-2">Venue Name</label>
                <input type="text" required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 px-4 text-sm focus:border-lrso-blue-600 focus:outline-hidden focus:bg-white transition-all" placeholder="e.g. The Regis School" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5 text-slate-400" />Address</label>
                <input type="text" required value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 px-4 text-sm focus:border-lrso-blue-600 focus:outline-hidden focus:bg-white transition-all" placeholder="Full address with postcode" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-1.5"><ExternalLink className="h-3.5 w-3.5 text-slate-400" />Book Now Link <span className="text-xs font-normal text-slate-400">(Bookteq URL)</span></label>
                <input type="url" required value={form.book_link} onChange={e => setForm({ ...form, book_link: e.target.value })} className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 px-4 text-sm focus:border-lrso-blue-600 focus:outline-hidden focus:bg-white transition-all" placeholder="https://bookteq.com/..." />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-1.5"><ImagePlus className="h-3.5 w-3.5 text-slate-400" />Venue Logo <span className="text-xs font-normal text-slate-400">(optional)</span></label>
                <input type="file" accept="image/*" onChange={handleLogoChange} className="w-full text-sm text-slate-600 file:mr-4 file:rounded-xl file:border-0 file:bg-slate-100 file:px-4 file:py-2 file:text-sm file:font-bold file:text-slate-700 hover:file:bg-slate-200 cursor-pointer" />
                {logoPreview && <img src={logoPreview} alt="Logo preview" className="mt-3 h-16 w-16 rounded-xl object-contain border border-slate-200 bg-slate-50 p-1" />}
              </div>
            </div>

            {/* Facilities */}
            <div className="border-t border-slate-100 pt-5">
              <div className="flex items-center justify-between mb-4">
                <label className="text-sm font-bold text-slate-700 flex items-center gap-1.5"><Tag className="h-3.5 w-3.5 text-slate-400" />Facilities <span className="text-xs font-normal text-slate-400">(each with optional image)</span></label>
                <button type="button" onClick={addFacilityRow} className="flex items-center gap-1.5 text-xs font-bold text-lrso-blue-600 hover:text-lrso-blue-800 border border-lrso-blue-200 rounded-lg px-3 py-1.5 hover:bg-lrso-blue-50 transition-all cursor-pointer">
                  <Plus className="h-3.5 w-3.5" />Add Facility
                </button>
              </div>
              <div className="space-y-3">
                {facilityRows.map((fac, idx) => (
                  <div key={fac.uid} className="flex items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3">
                    <div className="flex-1 grid gap-2">
                      <input
                        type="text"
                        placeholder={`Facility ${idx + 1} name, e.g. Sports Hall`}
                        value={fac.name || ""}
                        onChange={e => updateFacilityName(fac.uid, e.target.value)}
                        className="rounded-lg border border-slate-200 bg-white py-2 px-3 text-sm focus:border-lrso-blue-600 focus:outline-hidden transition-all"
                      />
                      <input
                        type="text"
                        placeholder="Short description (optional)"
                        value={fac.description || ""}
                        onChange={e => updateFacilityDescription(fac.uid, e.target.value)}
                        className="rounded-lg border border-slate-200 bg-white py-2 px-3 text-sm focus:border-lrso-blue-600 focus:outline-hidden transition-all"
                      />
                      <div className="flex items-center gap-2">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={e => updateFacilityImage(fac.uid, e.target.files?.[0] ?? null)}
                          className="flex-1 text-xs text-slate-500 file:mr-2 file:rounded-lg file:border-0 file:bg-slate-200 file:px-2 file:py-1.5 file:text-xs file:font-bold file:text-slate-700 hover:file:bg-slate-300 cursor-pointer min-w-0"
                        />
                        {fac.preview && <img src={fac.preview} alt="" className="h-8 w-8 rounded-lg object-cover border border-slate-200 shrink-0" />}
                      </div>
                    </div>
                    {facilityRows.length > 1 && (
                      <button type="button" onClick={() => removeFacilityRow(fac.uid)} className="text-slate-300 hover:text-red-500 transition-colors mt-1 cursor-pointer shrink-0">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {saveErr && <p className="text-sm text-red-600">{saveErr}</p>}
            <button type="submit" disabled={saving} className="flex items-center gap-2 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-sm font-bold text-white px-6 py-3 cursor-pointer">
              {saving ? <><Loader2 className="h-4 w-4 animate-spin" />Saving...</> : "Save Venue"}
            </button>
          </form>
        </div>
      )}
      {editingVenue && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6">
          <h4 className="font-bold text-slate-900 mb-5">Edit Venue</h4>
          <form onSubmit={saveEditVenue} className="space-y-5">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="md:col-span-2">
                <label className="block text-sm font-bold text-slate-700 mb-2">Venue Name</label>
                <input type="text" required value={editForm.name} onChange={e => setEditForm({ ...editForm, name: e.target.value })} className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 px-4 text-sm focus:border-lrso-blue-600 focus:outline-hidden focus:bg-white transition-all" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5 text-slate-400" />Address</label>
                <input type="text" required value={editForm.address} onChange={e => setEditForm({ ...editForm, address: e.target.value })} className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 px-4 text-sm focus:border-lrso-blue-600 focus:outline-hidden focus:bg-white transition-all" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-1.5"><ExternalLink className="h-3.5 w-3.5 text-slate-400" />Book Now Link</label>
                <input type="url" required value={editForm.book_link} onChange={e => setEditForm({ ...editForm, book_link: e.target.value })} className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 px-4 text-sm focus:border-lrso-blue-600 focus:outline-hidden focus:bg-white transition-all" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-1.5"><ImagePlus className="h-3.5 w-3.5 text-slate-400" />Venue Logo</label>
                <input type="file" accept="image/*" onChange={e => { const file = e.target.files?.[0] ?? null; setEditLogoFile(file); setEditLogoPreview(file ? URL.createObjectURL(file) : editForm.logo_url); }} className="w-full text-sm text-slate-600 file:mr-4 file:rounded-xl file:border-0 file:bg-slate-100 file:px-4 file:py-2 file:text-sm file:font-bold file:text-slate-700 hover:file:bg-slate-200 cursor-pointer" />
                {editLogoPreview && <img src={editLogoPreview} alt="Logo preview" className="mt-3 h-16 w-16 rounded-xl object-contain border border-slate-200 bg-slate-50 p-1" />}
              </div>
            </div>
            <div className="border-t border-slate-100 pt-5">
              <div className="flex items-center justify-between mb-4">
                <label className="text-sm font-bold text-slate-700 flex items-center gap-1.5"><Tag className="h-3.5 w-3.5 text-slate-400" />Facilities</label>
                <button type="button" onClick={addEditFacilityRow} className="flex items-center gap-1.5 text-xs font-bold text-lrso-blue-600 hover:text-lrso-blue-800 border border-lrso-blue-200 rounded-lg px-3 py-1.5 hover:bg-lrso-blue-50 transition-all cursor-pointer">
                  <Plus className="h-3.5 w-3.5" />Add Facility
                </button>
              </div>
              <div className="space-y-3">
                {editFacilityRows.map((fac, idx) => (
                  <div key={fac.uid} className="flex items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3">
                    <div className="flex-1 grid gap-2">
                      <input type="text" placeholder={`Facility ${idx + 1} name`} value={fac.name || ""} onChange={e => updateEditFacilityName(fac.uid, e.target.value)} className="rounded-lg border border-slate-200 bg-white py-2 px-3 text-sm focus:border-lrso-blue-600 focus:outline-hidden transition-all" />
                      <input type="text" placeholder="Short description (optional)" value={fac.description || ""} onChange={e => updateEditFacilityDescription(fac.uid, e.target.value)} className="rounded-lg border border-slate-200 bg-white py-2 px-3 text-sm focus:border-lrso-blue-600 focus:outline-hidden transition-all" />
                      <div className="flex items-center gap-2">
                        <input type="file" accept="image/*" onChange={e => updateEditFacilityImage(fac.uid, e.target.files?.[0] ?? null)} className="flex-1 text-xs text-slate-500 file:mr-2 file:rounded-lg file:border-0 file:bg-slate-200 file:px-2 file:py-1.5 file:text-xs file:font-bold file:text-slate-700 hover:file:bg-slate-300 cursor-pointer min-w-0" />
                        {fac.preview ? <img src={fac.preview} alt="" className="h-8 w-8 rounded-lg object-cover border border-slate-200 shrink-0" /> : fac.existingImageUrl ? <img src={fac.existingImageUrl} alt="" className="h-8 w-8 rounded-lg object-cover border border-slate-200 shrink-0" /> : null}
                      </div>
                    </div>
                    {editFacilityRows.length > 1 && (
                      <button type="button" onClick={() => removeEditFacilityRow(fac.uid)} className="text-slate-300 hover:text-red-500 transition-colors mt-1 cursor-pointer shrink-0"><Trash2 className="h-4 w-4" /></button>
                    )}
                  </div>
                ))}
              </div>
            </div>
            {editErr && <p className="text-sm text-red-600">{editErr}</p>}
            <div className="flex items-center gap-3">
              <button type="submit" disabled={editSaving} className="flex items-center gap-2 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-sm font-bold text-white px-6 py-3 cursor-pointer">
                {editSaving ? <><Loader2 className="h-4 w-4 animate-spin" />Saving...</> : "Save Changes"}
              </button>
              <button type="button" onClick={cancelEdit} className="rounded-xl border border-slate-200 hover:bg-slate-100 text-sm font-bold text-slate-600 px-6 py-3 cursor-pointer transition-all">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                {["Venue","Address","Book Link",""].map(h => <th key={h} className="px-6 py-3 text-xs font-bold uppercase tracking-wide text-slate-500">{h}</th>)}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loadingV ? (
                <tr><td colSpan={4} className="px-6 py-10 text-center text-sm text-slate-400"><Loader2 className="h-5 w-5 animate-spin mx-auto mb-2" />Loading...</td></tr>
              ) : venues.length === 0 ? (
                <tr><td colSpan={4} className="px-6 py-10 text-center text-sm text-slate-400">No venues added yet. Click &lsquo;Add Venue&rsquo; to get started.</td></tr>
              ) : venues.map(v => (
                <tr key={v.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {v.logo_url ? <img src={v.logo_url} alt={v.name} className="h-8 w-8 rounded-lg object-contain border border-slate-200 bg-slate-50 shrink-0" /> : <div className="h-8 w-8 rounded-lg bg-slate-100 shrink-0" />}
                      <span className="text-sm font-bold text-slate-900">{v.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">{v.address}</td>
                  <td className="px-6 py-4"><a href={v.book_link} target="_blank" rel="noopener noreferrer" className="text-xs font-bold text-lrso-blue-600 hover:underline flex items-center gap-1">Bookteq <ExternalLink className="h-3 w-3" /></a></td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button onClick={() => startEdit(v)} className="text-slate-300 hover:text-lrso-blue-600 transition-colors cursor-pointer"><Pencil className="h-4 w-4" /></button>
                      <button onClick={() => deleteVenue(v.id)} className="text-slate-300 hover:text-red-500 transition-colors cursor-pointer"><Trash2 className="h-4 w-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderEnquiries = () => (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
      <div className="px-6 py-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
        <h3 className="font-bold text-slate-900">All Enquiries</h3>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input type="text" placeholder="Search..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="rounded-xl border border-slate-200 bg-slate-50 py-2 pl-9 pr-4 text-sm focus:border-lrso-blue-600 focus:outline-hidden w-full sm:w-56" />
          </div>
          <button onClick={fetchE} className="text-slate-400 hover:text-slate-600 cursor-pointer"><RefreshCw className="h-4 w-4" /></button>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-100">
            <tr>{["Name","Email","Venue","Date","Status"].map(h => <th key={h} className="px-6 py-3 text-xs font-bold uppercase tracking-wide text-slate-500">{h}</th>)}</tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loadingE ? (
              <tr><td colSpan={5} className="px-6 py-10 text-center text-sm text-slate-400"><Loader2 className="h-5 w-5 animate-spin mx-auto mb-2" />Loading...</td></tr>
            ) : filteredE.length === 0 ? (
              <tr><td colSpan={5} className="px-6 py-10 text-center text-sm text-slate-400">No enquiries yet.</td></tr>
            ) : filteredE.map(e => (
              <tr key={e.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4 text-sm font-bold text-slate-900">{e.name}</td>
                <td className="px-6 py-4 text-sm text-slate-600">{e.email}</td>
                <td className="px-6 py-4 text-sm text-slate-600">{e.venue}</td>
                <td className="px-6 py-4 text-sm text-slate-500">{new Date(e.created_at).toLocaleDateString()}</td>
                <td className="px-6 py-4">
                  <select value={e.status} onChange={ev => updateEnquiryStatus(e.id, ev.target.value as Enquiry["status"])} className="rounded-lg border border-slate-200 bg-slate-50 py-1.5 px-2 text-xs font-bold text-slate-700 focus:outline-hidden cursor-pointer">
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const ContactStatusBadge = ({ status }: { status: Contact["status"] }) => {
    const s: Record<string, string> = { open: "bg-amber-50 text-amber-700 border-amber-200", replied: "bg-blue-50 text-blue-700 border-blue-200", closed: "bg-emerald-50 text-emerald-700 border-emerald-200" };
    return <span className={`inline-flex items-center rounded-lg border px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide ${s[status]}`}>{status}</span>;
  };

  const renderContacts = () => (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
      <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
        <h3 className="font-bold text-slate-900">Contact Submissions</h3>
        <button onClick={fetchC} className="text-slate-400 hover:text-slate-600 cursor-pointer"><RefreshCw className="h-4 w-4" /></button>
      </div>
      {loadingC ? <Spinner /> : contacts.length === 0 ? <Empty msg="No contact submissions yet." /> : (
        <div className="divide-y divide-slate-100">
          {contacts.map(c => (
            <div key={c.id} className="px-6 py-5 hover:bg-slate-50 transition-colors">
              <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-bold text-slate-900">{c.name}</p>
                    {!c.read && <span className="h-2 w-2 rounded-full bg-lrso-crimson-600" />}
                    <span className="text-xs text-slate-400 ml-auto">{new Date(c.created_at).toLocaleDateString()}</span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">{c.email}</p>
                  <div className="flex flex-wrap items-center gap-2 mt-2">
                    <p className="text-sm font-medium text-slate-700">{c.subject}</p>
                    <ContactStatusBadge status={c.status} />
                  </div>
                  {c.message && <p className="text-sm text-slate-600 mt-2 leading-relaxed bg-slate-50 rounded-xl p-3 border border-slate-100">{c.message}</p>}

                  {/* Notes */}
                  <div className="mt-3">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Internal notes</label>
                    <div className="flex items-start gap-2 mt-1">
                      <textarea
                        value={c.notes || ""}
                        onChange={(e) => updateContactNotes(c.id, e.target.value)}
                        placeholder="Add reply notes..."
                        rows={2}
                        className="flex-1 min-w-0 rounded-xl border border-slate-200 bg-slate-50 p-2 text-xs text-slate-700 focus:bg-white focus:outline-hidden resize-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-row sm:flex-col items-center sm:items-end gap-2 shrink-0">
                  <select
                    value={c.status}
                    onChange={(e) => updateContactStatus(c.id, e.target.value as Contact["status"])}
                    className="rounded-lg border border-slate-200 bg-slate-50 py-1.5 px-2 text-xs font-bold text-slate-700 focus:outline-hidden cursor-pointer"
                  >
                    <option value="open">Open</option>
                    <option value="replied">Replied</option>
                    <option value="closed">Closed</option>
                  </select>
                  {!c.read && (
                    <button onClick={() => markRead(c.id)} className="text-xs font-bold text-lrso-blue-600 hover:underline cursor-pointer whitespace-nowrap">
                      Mark read
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  // Content management functions
  const saveContent = async (id: string, content: string) => {
    setSavingContent(id);
    const { error } = await supabase.from("site_content").update({ content, updated_at: new Date().toISOString() }).eq("id", id);
    setSavingContent(null);
    if (!error) fetchContent();
  };

  const saveContentImage = async (id: string, file: File) => {
    setSavingContent(id);
    try {
      const ext = file.name.split(".").pop();
      const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const { error: uploadErr } = await supabase.storage.from("site-content").upload(path, file, { upsert: true });
      if (uploadErr) throw uploadErr;
      const image_url = supabase.storage.from("site-content").getPublicUrl(path).data.publicUrl;
      const { error } = await supabase.from("site_content").update({ image_url, updated_at: new Date().toISOString() }).eq("id", id);
      if (error) throw error;
      await fetchContent();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Image upload failed");
    }
    setSavingContent(null);
  };

  const createContent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newContent.key.trim() || !newContent.label.trim()) return;
    const { error } = await supabase.from("site_content").insert([{
      key: newContent.key.trim(),
      page: newContent.page.trim() || "global",
      label: newContent.label.trim(),
      content: newContent.content,
    }]);
    if (!error) {
      setNewContent({ key: "", page: "global", label: "", content: "" });
      setShowContentForm(false);
      fetchContent();
    }
  };

  const deleteContent = async (id: string) => {
    if (!confirm("Delete this content item?")) return;
    await supabase.from("site_content").delete().eq("id", id);
    fetchContent();
  };

  const pages = Array.from(new Set(contentItems.map(i => i.page))).sort();
  const filteredContent = contentItems.filter(i => {
    const matchesSearch = i.label.toLowerCase().includes(contentSearch.toLowerCase()) || i.key.toLowerCase().includes(contentSearch.toLowerCase());
    const matchesPage = !contentPage || i.page === contentPage;
    return matchesSearch && matchesPage;
  });

  const renderContent = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-3 flex-1 w-full">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search content keys or labels..."
              value={contentSearch}
              onChange={(e) => setContentSearch(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-3 py-2 text-sm font-medium text-slate-700 focus:bg-white focus:outline-hidden"
            />
          </div>
          <select
            value={contentPage}
            onChange={(e) => setContentPage(e.target.value)}
            className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-700 focus:bg-white focus:outline-hidden cursor-pointer"
          >
            <option value="">All pages</option>
            {pages.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>
        <button
          onClick={() => setShowContentForm(s => !s)}
          className="flex items-center gap-2 rounded-xl bg-lrso-blue-600 hover:bg-lrso-blue-700 text-white px-4 py-2 text-sm font-bold transition-all cursor-pointer"
        >
          <Plus className="h-4 w-4" /> Add Content
        </button>
      </div>

      {showContentForm && (
        <form onSubmit={createContent} className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-4">
          <h3 className="font-bold text-slate-900">Add new content item</h3>
          <div className="grid sm:grid-cols-3 gap-4">
            <input required value={newContent.key} onChange={e => setNewContent(c => ({ ...c, key: e.target.value }))} placeholder="Key (e.g. home.hero.title)" className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 focus:bg-white focus:outline-hidden" />
            <input required value={newContent.label} onChange={e => setNewContent(c => ({ ...c, label: e.target.value }))} placeholder="Label" className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 focus:bg-white focus:outline-hidden" />
            <input value={newContent.page} onChange={e => setNewContent(c => ({ ...c, page: e.target.value }))} placeholder="Page (e.g. home)" className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 focus:bg-white focus:outline-hidden" />
          </div>
          <textarea value={newContent.content} onChange={e => setNewContent(c => ({ ...c, content: e.target.value }))} placeholder="Content" rows={3} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 focus:bg-white focus:outline-hidden resize-none" />
          <div className="flex items-center gap-3">
            <button type="submit" className="rounded-xl bg-lrso-crimson-600 hover:bg-lrso-crimson-700 text-white px-4 py-2 text-sm font-bold cursor-pointer">Create</button>
            <button type="button" onClick={() => setShowContentForm(false)} className="text-sm font-bold text-slate-500 hover:text-slate-700 cursor-pointer">Cancel</button>
          </div>
        </form>
      )}

      {loadingContent ? <Spinner /> : filteredContent.length === 0 ? <Empty msg="No content items found." /> : (
        <div className="grid gap-4">
          {filteredContent.map(item => (
            <div key={item.id} className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-3">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-bold text-slate-900">{item.label}</p>
                  <p className="text-xs text-slate-400 font-mono">{item.key} <span className="text-slate-300">·</span> {item.page}</p>
                </div>
                <div className="flex items-center gap-2">
                  {savingContent === item.id && <Loader2 className="h-4 w-4 animate-spin text-slate-400" />}
                  <button onClick={() => deleteContent(item.id)} className="text-slate-400 hover:text-red-600 cursor-pointer"><Trash2 className="h-4 w-4" /></button>
                </div>
              </div>
              <textarea
                value={item.content}
                onChange={(e) => setContentItems(items => items.map(i => i.id === item.id ? { ...i, content: e.target.value } : i))}
                onBlur={(e) => saveContent(item.id, e.target.value)}
                rows={Math.min(6, Math.max(2, item.content.split("\n").length))}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 focus:bg-white focus:outline-hidden resize-none"
              />
              <div className="flex items-center gap-4">
                {item.image_url ? (
                  <div className="relative group">
                    <img src={item.image_url} alt="" className="h-24 w-24 object-cover rounded-xl border border-slate-200" />
                    <label className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center rounded-xl cursor-pointer transition-opacity">
                      <ImagePlus className="h-5 w-5 text-white" />
                      <input type="file" accept="image/*" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) saveContentImage(item.id, f); }} />
                    </label>
                  </div>
                ) : (
                  <label className="flex items-center justify-center h-24 w-24 rounded-xl border-2 border-dashed border-slate-200 hover:border-lrso-blue-400 cursor-pointer text-slate-400 hover:text-lrso-blue-600 transition-colors">
                    <ImagePlus className="h-6 w-6" />
                    <input type="file" accept="image/*" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) saveContentImage(item.id, f); }} />
                  </label>
                )}
                <p className="text-xs text-slate-400">Upload or replace image for this item.</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const tabContent: Record<AdminTab, React.ReactNode> = {
    overview: renderOverview(),
    venues: renderVenues(),
    enquiries: renderEnquiries(),
    contacts: renderContacts(),
    content: renderContent(),
  };

  const tabMeta: Record<AdminTab, { title: string; subtitle: string }> = {
    overview: { title: "Overview", subtitle: "Welcome back, Josh. Live data from Supabase." },
    venues: { title: "Venues", subtitle: "Manage venue listings and facilities." },
    enquiries: { title: "Enquiries", subtitle: "Review and respond to hire enquiries." },
    contacts: { title: "Messages", subtitle: "View messages from partners and customers." },
    content: { title: "Site Content", subtitle: "Edit website copy and images." },
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <aside className="w-60 bg-slate-950 text-white flex-col hidden md:flex shrink-0 fixed top-0 bottom-0 left-0 z-40">
        {/* Logo area */}
        <div className="px-5 py-5 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-lrso-crimson-600 flex items-center justify-center shrink-0">
              <span className="text-white font-display font-black text-sm">L</span>
            </div>
            <div>
              <p className="font-display text-sm font-extrabold text-white leading-tight">LRSO</p>
              <p className="text-[10px] text-slate-400 font-medium">Admin Portal</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5">
          {navItems.map(item => (
            <button key={item.id} onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-bold transition-all cursor-pointer ${
                activeTab === item.id
                  ? "bg-white/10 text-white"
                  : "text-slate-400 hover:bg-white/5 hover:text-white"
              }`}>
              <span className={activeTab === item.id ? "text-lrso-crimson-400" : ""}>{item.icon}</span>
              {item.label}
              {item.id === "enquiries" && enquiries.filter(e => e.status === "pending").length > 0 && (
                <span className="ml-auto bg-lrso-crimson-600 text-white text-[10px] font-extrabold rounded-full h-5 w-5 flex items-center justify-center">
                  {enquiries.filter(e => e.status === "pending").length}
                </span>
              )}
              {item.id === "contacts" && contacts.filter(c => !c.read).length > 0 && (
                <span className="ml-auto bg-amber-500 text-white text-[10px] font-extrabold rounded-full h-5 w-5 flex items-center justify-center">
                  {contacts.filter(c => !c.read).length}
                </span>
              )}
            </button>
          ))}
        </nav>

        {/* Sign out */}
        <div className="px-3 py-4 border-t border-white/5">
          <button onClick={onLogout}
            className="w-full flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-bold text-slate-400 hover:bg-white/5 hover:text-white transition-all cursor-pointer">
            <LogOut className="h-4 w-4" />Sign Out
          </button>
        </div>
      </aside>

      {/* Mobile top bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-40 bg-slate-950 text-white px-4 h-12 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="h-6 w-6 rounded-lg bg-lrso-crimson-600 flex items-center justify-center">
            <span className="text-white font-display font-black text-[10px]">L</span>
          </div>
          <span className="font-display text-sm font-bold">LRSO Admin</span>
        </div>
        <button onClick={onLogout} className="text-xs font-bold text-slate-400 flex items-center gap-1 cursor-pointer hover:text-white transition-colors">
          <LogOut className="h-3.5 w-3.5" /> Sign Out
        </button>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 md:ml-60">
        {/* Mobile tab bar */}
        <div className="md:hidden fixed top-12 left-0 right-0 z-30 bg-white border-b border-slate-200 overflow-x-auto shadow-xs">
          <div className="flex px-3 py-2 gap-1">
            {navItems.map(item => (
              <button key={item.id} onClick={() => setActiveTab(item.id)}
                className={`shrink-0 flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-all cursor-pointer ${
                  activeTab === item.id ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-100"
                }`}>
                {item.icon}{item.label}
              </button>
            ))}
          </div>
        </div>

        {/* Page header */}
        <header className="hidden md:flex items-center justify-between bg-white border-b border-slate-200 px-8 py-4 sticky top-0 z-20">
          <div>
            <h1 className="font-display text-xl font-extrabold text-slate-900">{tabMeta[activeTab].title}</h1>
            <p className="text-xs text-slate-400 mt-0.5">{tabMeta[activeTab].subtitle}</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-xl bg-lrso-blue-50 border border-lrso-blue-100 flex items-center justify-center text-xs font-extrabold text-lrso-blue-700">J</div>
          </div>
        </header>

        <main className="flex-1 p-5 pt-24 md:pt-6">
          {tabContent[activeTab]}
        </main>
      </div>
    </div>
  );
};
