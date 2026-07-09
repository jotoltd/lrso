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
  X,
} from "lucide-react";
import { supabase, supabaseAdmin } from "../lib/supabase";
import { Logo } from "./Logo";
import logoImage from "../assets/lrso_logo.jpg";

interface AdminDashboardProps {
  onLogout: () => void;
  currentUserRole: string;
}

type AdminTab = "overview" | "venues" | "contacts" | "content" | "users";

interface Venue { id: string; name: string; address: string; book_link: string; logo_url: string | null; created_at: string; }
interface Contact { id: string; name: string; email: string; phone: string | null; subject: string; message: string | null; read: boolean; status: "open" | "replied" | "closed"; notes: string | null; created_at: string; }
interface VenueForm { name: string; address: string; book_link: string; logo_url: string | null; }
interface FacilityRow { uid: string; name: string; description: string; file: File | null; preview: string | null; }
interface EditFacilityRow { uid: string; dbId?: string; name: string; description: string; existingImageUrl: string | null; file: File | null; preview: string | null; }
interface SiteContentItem { id: string; key: string; page: string; label: string; content: string; image_url: string | null; updated_at: string; }
interface AdminUser { id: string; username: string; password: string; email: string | null; name: string | null; role: string; created_at: string; updated_at: string; }

const navItems: { id: AdminTab; label: string; icon: React.ReactNode }[] = [
  { id: "overview", label: "Overview", icon: <LayoutDashboard className="h-4 w-4" /> },
  { id: "venues", label: "Venues", icon: <Building2 className="h-4 w-4" /> },
  { id: "contacts", label: "Messages", icon: <Mail className="h-4 w-4" /> },
  { id: "users", label: "Users", icon: <Users className="h-4 w-4" /> },
  { id: "content", label: "Site Content", icon: <FileText className="h-4 w-4" /> },
];

const Spinner = () => <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 shadow-sm"><Loader2 className="h-6 w-6 animate-spin mx-auto text-slate-400 mb-2" /><p className="text-sm text-slate-400 font-medium">Loading...</p></div>;
const Empty = ({ msg }: { msg: string }) => <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 shadow-sm"><p className="text-sm text-slate-400 font-medium">{msg}</p></div>;

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onLogout, currentUserRole }) => {
  const [activeTab, setActiveTab] = useState<AdminTab>("overview");
  const [searchQuery, setSearchQuery] = useState("");
  const [venues, setVenues] = useState<Venue[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>([]);
  const [loadingV, setLoadingV] = useState(true);
  const [loadingC, setLoadingC] = useState(true);
  const [loadingU, setLoadingU] = useState(true);
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
  const [showUserForm, setShowUserForm] = useState(false);
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);
  const [userForm, setUserForm] = useState({ username: "", password: "", email: "", name: "", role: "Staff" });
  const [savingUser, setSavingUser] = useState(false);

  const fetchV = useCallback(async () => { setLoadingV(true); const { data } = await supabase.from("venues").select("*").order("created_at", { ascending: false }); if (data) setVenues(data as Venue[]); setLoadingV(false); }, []);
  const fetchC = useCallback(async () => { setLoadingC(true); const { data } = await supabase.from("contacts").select("*").order("created_at", { ascending: false }); if (data) setContacts(data as Contact[]); setLoadingC(false); }, []);
  const fetchU = useCallback(async () => { setLoadingU(true); const { data } = await supabase.from("admin_users").select("*").order("created_at", { ascending: false }); if (data) setAdminUsers(data as AdminUser[]); setLoadingU(false); }, []);
  const fetchContent = useCallback(async () => { setLoadingContent(true); const { data } = await supabase.from("site_content").select("*").order("page", { ascending: true }).order("label", { ascending: true }); if (data) setContentItems(data as SiteContentItem[]); setLoadingContent(false); }, []);

  useEffect(() => { fetchV(); fetchC(); fetchU(); fetchContent(); }, [fetchV, fetchC, fetchU, fetchContent]);

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

  const markRead = async (id: string) => { await supabase.from("contacts").update({ read: true }).eq("id", id); fetchC(); };
  const updateContactStatus = async (id: string, status: Contact["status"]) => { await supabase.from("contacts").update({ status }).eq("id", id); fetchC(); };
  const updateContactNotes = async (id: string, notes: string) => { await supabase.from("contacts").update({ notes }).eq("id", id); fetchC(); };
  const deleteContact = async (id: string) => { await supabaseAdmin.from("contacts").delete().eq("id", id); fetchC(); };

  const saveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingUser(true);
    try {
      if (editingUser) {
        await supabase.from("admin_users").update({
          username: userForm.username,
          password: userForm.password,
          email: userForm.email || null,
          name: userForm.name || null,
          role: userForm.role,
          updated_at: new Date().toISOString()
        }).eq("id", editingUser.id);
      } else {
        await supabase.from("admin_users").insert({
          username: userForm.username,
          password: userForm.password,
          email: userForm.email || null,
          name: userForm.name || null,
          role: userForm.role
        });
      }
      setShowUserForm(false);
      setEditingUser(null);
      setUserForm({ username: "", password: "", email: "", name: "", role: "Staff" });
      fetchU();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "An error occurred");
    }
    setSavingUser(false);
  };

  const deleteUser = async (id: string) => {
    if (currentUserRole !== "Admin") {
      alert("Only Admins can delete users.");
      return;
    }
    if (!confirm("Delete this admin user?")) return;
    await supabaseAdmin.from("admin_users").delete().eq("id", id);
    fetchU();
  };

  const changeUserPassword = async (id: string, newPassword: string) => {
    if (currentUserRole !== "Admin") {
      alert("Only Admins can change passwords.");
      return;
    }
    const newPasswordPrompt = prompt("Enter new password:");
    if (!newPasswordPrompt) return;
    await supabaseAdmin.from("admin_users").update({ password: newPasswordPrompt }).eq("id", id);
    fetchU();
  };

  const startEditUser = (user: AdminUser) => {
    setEditingUser(user);
    setUserForm({ username: user.username, password: user.password, email: user.email || "", name: user.name || "", role: user.role || "Staff" });
    setShowUserForm(true);
  };

  const cancelEditUser = () => {
    setEditingUser(null);
    setUserForm({ username: "", password: "", email: "", name: "", role: "Staff" });
    setShowUserForm(false);
  };

  const renderOverview = () => (
    <div className="space-y-8">
      <div className="grid gap-5 sm:grid-cols-3">
        {[
          { label: "Total Venues", val: loadingV ? "—" : venues.length, icon: Building2, gradient: "from-blue-600 to-blue-700", refresh: fetchV },
          { label: "Open Messages", val: loadingC ? "—" : contacts.filter(c => c.status === "open").length, icon: Mail, gradient: "from-amber-500 to-orange-500", refresh: fetchC },
          { label: "Unread Messages", val: loadingC ? "—" : contacts.filter(c => !c.read).length, icon: Users, gradient: "from-rose-600 to-pink-600", refresh: fetchC },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
              <div className={`inline-flex items-center justify-center h-12 w-12 rounded-xl bg-gradient-to-br ${s.gradient} text-white shadow-md`}>
                <s.icon className="h-5 w-5" />
              </div>
              <button onClick={s.refresh} className="text-slate-300 hover:text-slate-500 cursor-pointer transition-colors"><RefreshCw className="h-4 w-4" /></button>
            </div>
            <div className="mt-5 text-4xl font-extrabold text-slate-900 font-display">{String(s.val)}</div>
            <div className="text-sm font-semibold text-slate-500 mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-bold text-slate-900 text-lg">Recent Messages</h3>
          <button onClick={() => setActiveTab("contacts")} className="text-sm font-bold text-lrso-blue-600 hover:underline">View all</button>
        </div>
        {loadingC ? <Spinner /> : contacts.length === 0 ? <Empty msg="No messages yet." /> : (
          <div className="divide-y divide-slate-100">
            {contacts.slice(0, 5).map(c => (
              <div key={c.id} className="px-6 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className={`h-10 w-10 rounded-full flex items-center justify-center text-sm font-bold ${!c.read ? "bg-rose-100 text-rose-600" : "bg-slate-100 text-slate-500"}`}>{c.name.charAt(0).toUpperCase()}</div>
                  <div>
                    <p className="text-sm font-bold text-slate-900">{c.name} <span className="text-xs font-normal text-slate-400">· {c.subject}</span></p>
                    <p className="text-xs text-slate-500">{new Date(c.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
                <ContactStatusBadge status={c.status} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  const renderVenues = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
        <div>
          <h3 className="font-bold text-slate-900 text-lg">Venue Management</h3>
          <p className="text-sm text-slate-500">Add venues, upload logos, and manage facilities.</p>
        </div>
        <button onClick={() => {
          const opening = !showForm;
          setShowForm(opening); setSaveErr("");
          if (opening) {
            setForm({ name: "", address: "", book_link: "", logo_url: null });
            setLogoFile(null); setLogoPreview(null);
            setFacilityRows([{ uid: crypto.randomUUID(), name: "", description: "", file: null, preview: null }]);
          }
        }} className="flex items-center gap-2 rounded-xl bg-lrso-crimson-600 hover:bg-lrso-crimson-700 text-sm font-bold text-white px-5 py-2.5 transition-all cursor-pointer shadow-sm">
          <Plus className="h-4 w-4" />{showForm ? "Cancel" : "Add Venue"}
        </button>
      </div>
      {saved && <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-4 text-sm text-emerald-800 flex items-center gap-2 shadow-sm"><CheckCircle2 className="h-4 w-4" />Venue saved successfully.</div>}
      {showForm && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <h4 className="font-bold text-slate-900 text-lg mb-5">Add New Venue</h4>
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
              <div className="grid gap-4 sm:grid-cols-2">
                {facilityRows.map((fac, idx) => (
                  <div key={fac.uid} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm flex flex-col gap-3">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">Facility {idx + 1}</span>
                      {facilityRows.length > 1 && (
                        <button type="button" onClick={() => removeFacilityRow(fac.uid)} className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors cursor-pointer shrink-0">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                    <input
                      type="text"
                      placeholder="e.g. Sports Hall"
                      value={fac.name || ""}
                      onChange={e => updateFacilityName(fac.uid, e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 px-3 text-sm focus:border-lrso-blue-600 focus:outline-hidden focus:bg-white transition-all"
                    />
                    <input
                      type="text"
                      placeholder="Short description (optional)"
                      value={fac.description || ""}
                      onChange={e => updateFacilityDescription(fac.uid, e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 px-3 text-sm focus:border-lrso-blue-600 focus:outline-hidden focus:bg-white transition-all"
                    />
                    <div className="flex items-center gap-3">
                      {fac.preview ? (
                        <div className="relative group shrink-0">
                          <img src={fac.preview} alt="" className="h-20 w-20 rounded-xl object-cover border border-slate-200" />
                          <label className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center rounded-xl cursor-pointer transition-opacity">
                            <ImagePlus className="h-5 w-5 text-white" />
                            <input type="file" accept="image/*" className="hidden" onChange={e => updateFacilityImage(fac.uid, e.target.files?.[0] ?? null)} />
                          </label>
                        </div>
                      ) : (
                        <label className="flex items-center justify-center h-20 w-20 rounded-xl border-2 border-dashed border-slate-200 hover:border-lrso-blue-400 cursor-pointer text-slate-400 hover:text-lrso-blue-600 transition-colors bg-slate-50 shrink-0">
                          <ImagePlus className="h-6 w-6" />
                          <input type="file" accept="image/*" className="hidden" onChange={e => updateFacilityImage(fac.uid, e.target.files?.[0] ?? null)} />
                        </label>
                      )}
                      <p className="text-xs text-slate-400">Upload facility image.</p>
                    </div>
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={cancelEdit} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
              <h4 className="font-bold text-slate-900 text-lg">Edit Venue: {editingVenue.name}</h4>
              <button onClick={cancelEdit} className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={saveEditVenue} className="p-6 space-y-5">
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
                <div className="grid gap-4 sm:grid-cols-2">
                  {editFacilityRows.map((fac, idx) => (
                    <div key={fac.uid} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm flex flex-col gap-3">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">Facility {idx + 1}</span>
                        {editFacilityRows.length > 1 && (
                          <button type="button" onClick={() => removeEditFacilityRow(fac.uid)} className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors cursor-pointer shrink-0">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                      <input type="text" placeholder="e.g. Sports Hall" value={fac.name || ""} onChange={e => updateEditFacilityName(fac.uid, e.target.value)} className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 px-3 text-sm focus:border-lrso-blue-600 focus:outline-hidden focus:bg-white transition-all" />
                      <input type="text" placeholder="Short description (optional)" value={fac.description || ""} onChange={e => updateEditFacilityDescription(fac.uid, e.target.value)} className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 px-3 text-sm focus:border-lrso-blue-600 focus:outline-hidden focus:bg-white transition-all" />
                      <div className="flex items-center gap-3">
                        {fac.preview || fac.existingImageUrl ? (
                          <div className="relative group shrink-0">
                            <img src={fac.preview || fac.existingImageUrl || undefined} alt="" className="h-20 w-20 rounded-xl object-cover border border-slate-200" />
                            <label className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center rounded-xl cursor-pointer transition-opacity">
                              <ImagePlus className="h-5 w-5 text-white" />
                              <input type="file" accept="image/*" className="hidden" onChange={e => updateEditFacilityImage(fac.uid, e.target.files?.[0] ?? null)} />
                            </label>
                          </div>
                        ) : (
                          <label className="flex items-center justify-center h-20 w-20 rounded-xl border-2 border-dashed border-slate-200 hover:border-lrso-blue-400 cursor-pointer text-slate-400 hover:text-lrso-blue-600 transition-colors bg-slate-50 shrink-0">
                            <ImagePlus className="h-6 w-6" />
                            <input type="file" accept="image/*" className="hidden" onChange={e => updateEditFacilityImage(fac.uid, e.target.files?.[0] ?? null)} />
                          </label>
                        )}
                        <p className="text-xs text-slate-400">Upload or replace image.</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              {editErr && <p className="text-sm text-red-600">{editErr}</p>}
              <div className="flex items-center gap-3 pt-4 border-t border-slate-100">
                <button type="submit" disabled={editSaving} className="flex items-center gap-2 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-sm font-bold text-white px-6 py-3 cursor-pointer">
                  {editSaving ? <><Loader2 className="h-4 w-4 animate-spin" />Saving...</> : "Save Changes"}
                </button>
                <button type="button" onClick={cancelEdit} className="rounded-xl border border-slate-200 hover:bg-slate-100 text-sm font-bold text-slate-600 px-6 py-3 cursor-pointer transition-all">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {loadingV ? (
          <div className="col-span-full"><Spinner /></div>
        ) : venues.length === 0 ? (
          <div className="col-span-full bg-white rounded-2xl border border-slate-200 p-10 text-center text-sm text-slate-400">No venues added yet. Click <strong>Add Venue</strong> to get started.</div>
        ) : venues.map(v => (
          <div key={v.id} className="group bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all p-5 flex flex-col">
            <div className="flex items-start gap-4">
              {v.logo_url ? (
                <img src={v.logo_url} alt={v.name} className="h-14 w-14 rounded-xl object-contain border border-slate-200 bg-slate-50 shrink-0" />
              ) : (
                <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center text-slate-500 font-display font-bold text-xl shrink-0">{v.name.charAt(0)}</div>
              )}
              <div className="flex-1 min-w-0">
                <h4 className="font-bold text-slate-900 truncate">{v.name}</h4>
                <p className="text-xs text-slate-500 mt-1 line-clamp-2">{v.address}</p>
              </div>
            </div>
            <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between gap-2">
              <a href={v.book_link} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-xs font-bold text-lrso-blue-600 hover:text-lrso-blue-800 hover:underline">
                Bookteq <ExternalLink className="h-3 w-3" />
              </a>
              <div className="flex items-center gap-1">
                <button onClick={() => startEdit(v)} className="p-2 rounded-lg text-slate-400 hover:text-lrso-blue-600 hover:bg-slate-50 transition-colors cursor-pointer"><Pencil className="h-4 w-4" /></button>
                <button onClick={() => deleteVenue(v.id)} className="p-2 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors cursor-pointer"><Trash2 className="h-4 w-4" /></button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const ContactStatusBadge = ({ status }: { status: Contact["status"] }) => {
    const s: Record<string, string> = { open: "bg-amber-50 text-amber-700 border-amber-200", replied: "bg-blue-50 text-blue-700 border-blue-200", closed: "bg-emerald-50 text-emerald-700 border-emerald-200" };
    return <span className={`inline-flex items-center rounded-lg border px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide ${s[status]}`}>{status}</span>;
  };

  const renderContacts = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-bold text-slate-900 text-lg">Messages</h3>
          <p className="text-sm text-slate-500">Messages from the public contact form.</p>
        </div>
        <button onClick={fetchC} className="flex items-center gap-2 rounded-xl bg-white border border-slate-200 hover:border-slate-300 px-4 py-2 text-sm font-bold text-slate-600 transition-colors cursor-pointer shadow-sm">
          <RefreshCw className="h-4 w-4" /> Refresh
        </button>
      </div>

      {loadingC ? <Spinner /> : contacts.length === 0 ? <Empty msg="No contact submissions yet." /> : (
        <div className="grid gap-5 lg:grid-cols-2">
          {contacts.map(c => (
            <div key={c.id} className={`bg-white rounded-2xl border shadow-sm p-5 flex flex-col gap-4 transition-all ${!c.read ? "border-l-4 border-l-rose-500 border-slate-200" : "border-slate-200"}`}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className={`h-11 w-11 rounded-full flex items-center justify-center text-sm font-bold ${!c.read ? "bg-rose-100 text-rose-600" : "bg-slate-100 text-slate-500"}`}>{c.name.charAt(0).toUpperCase()}</div>
                  <div>
                    <p className="font-bold text-slate-900">{c.name}</p>
                    <a href={`mailto:${c.email}`} className="text-xs text-lrso-blue-600 hover:underline">{c.email}</a>
                    {c.phone && <p className="text-xs text-slate-500 mt-0.5"><a href={`tel:${c.phone}`} className="hover:text-lrso-blue-600">{c.phone}</a></p>}
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <ContactStatusBadge status={c.status} />
                  <span className="text-xs text-slate-400">{new Date(c.created_at).toLocaleDateString()}</span>
                </div>
              </div>

              <div>
                <p className="text-sm font-semibold text-slate-700 mb-1">{c.subject}</p>
                {c.message && <p className="text-sm text-slate-600 leading-relaxed bg-slate-50 rounded-xl p-3 border border-slate-100">{c.message}</p>}
              </div>

              <div className="mt-auto pt-4 border-t border-slate-100">
                <label className="text-xs font-bold text-slate-500 mb-1.5 block">Internal notes</label>
                <textarea
                  value={c.notes || ""}
                  onChange={(e) => updateContactNotes(c.id, e.target.value)}
                  placeholder="Add reply notes..."
                  rows={2}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-sm text-slate-700 focus:bg-white focus:outline-hidden resize-none"
                />
              </div>

              <div className="flex items-center justify-between gap-3">
                <select
                  value={c.status}
                  onChange={(e) => updateContactStatus(c.id, e.target.value as Contact["status"])}
                  className="rounded-lg border border-slate-200 bg-slate-50 py-2 px-3 text-sm font-bold text-slate-700 focus:outline-hidden cursor-pointer"
                >
                  <option value="open">Open</option>
                  <option value="replied">Replied</option>
                  <option value="closed">Closed</option>
                </select>
                <div className="flex items-center gap-2">
                  {!c.read ? (
                    <button onClick={() => markRead(c.id)} className="rounded-lg bg-lrso-blue-50 hover:bg-lrso-blue-100 text-lrso-blue-700 px-4 py-2 text-sm font-bold transition-colors cursor-pointer">
                      Mark read
                    </button>
                  ) : (
                    <span className="text-xs font-bold text-slate-400 flex items-center gap-1"><CheckCircle2 className="h-3.5 w-3.5" /> Read</span>
                  )}
                  <button onClick={() => { if (confirm('Delete this message?')) deleteContact(c.id); }} className="p-2 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors cursor-pointer" title="Delete message">
                    <Trash2 className="h-4 w-4" />
                  </button>
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

  const pageBadge = (page: string) => (
    <span className="inline-flex items-center rounded-md bg-slate-100 px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-slate-600 border border-slate-200">
      {page || "global"}
    </span>
  );

  const renderContent = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-3 flex-1 w-full">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search content keys or labels..."
              value={contentSearch}
              onChange={(e) => setContentSearch(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-3 py-2.5 text-sm font-medium text-slate-700 focus:bg-white focus:outline-hidden"
            />
          </div>
          <select
            value={contentPage}
            onChange={(e) => setContentPage(e.target.value)}
            className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm font-medium text-slate-700 focus:bg-white focus:outline-hidden cursor-pointer"
          >
            <option value="">All pages</option>
            {pages.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>
        <button
          onClick={() => setShowContentForm(s => !s)}
          className="flex items-center gap-2 rounded-xl bg-lrso-blue-600 hover:bg-lrso-blue-700 text-white px-4 py-2.5 text-sm font-bold transition-all cursor-pointer shadow-sm"
        >
          <Plus className="h-4 w-4" /> Add Content
        </button>
      </div>

      {showContentForm && (
        <form onSubmit={createContent} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
          <h3 className="font-bold text-slate-900 text-lg">Add new content item</h3>
          <div className="grid sm:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-500 mb-1.5 block">Key</label>
              <input required value={newContent.key} onChange={e => setNewContent(c => ({ ...c, key: e.target.value }))} placeholder="home.hero.title" className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 focus:bg-white focus:outline-hidden" />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 mb-1.5 block">Label</label>
              <input required value={newContent.label} onChange={e => setNewContent(c => ({ ...c, label: e.target.value }))} placeholder="Hero title" className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 focus:bg-white focus:outline-hidden" />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 mb-1.5 block">Page</label>
              <input value={newContent.page} onChange={e => setNewContent(c => ({ ...c, page: e.target.value }))} placeholder="home" className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 focus:bg-white focus:outline-hidden" />
            </div>
          </div>
          <div>
            <label className="text-xs font-bold text-slate-500 mb-1.5 block">Content</label>
            <textarea value={newContent.content} onChange={e => setNewContent(c => ({ ...c, content: e.target.value }))} placeholder="Text or HTML content..." rows={3} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 focus:bg-white focus:outline-hidden resize-none" />
          </div>
          <div className="flex items-center gap-3">
            <button type="submit" className="rounded-xl bg-lrso-crimson-600 hover:bg-lrso-crimson-700 text-white px-5 py-2.5 text-sm font-bold cursor-pointer shadow-sm">Create</button>
            <button type="button" onClick={() => setShowContentForm(false)} className="text-sm font-bold text-slate-500 hover:text-slate-700 cursor-pointer">Cancel</button>
          </div>
        </form>
      )}

      {loadingContent ? <Spinner /> : filteredContent.length === 0 ? <Empty msg="No content items found." /> : (
        <div className="grid gap-5 lg:grid-cols-2">
          {filteredContent.map(item => (
            <div key={item.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 flex flex-col gap-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    {pageBadge(item.page)}
                    <p className="text-sm font-bold text-slate-900">{item.label}</p>
                  </div>
                  <p className="text-xs text-slate-400 font-mono">{item.key}</p>
                </div>
                <div className="flex items-center gap-2">
                  {savingContent === item.id && <Loader2 className="h-4 w-4 animate-spin text-slate-400" />}
                  <button onClick={() => deleteContent(item.id)} className="p-2 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"><Trash2 className="h-4 w-4" /></button>
                </div>
              </div>
              <textarea
                value={item.content}
                onChange={(e) => setContentItems(items => items.map(i => i.id === item.id ? { ...i, content: e.target.value } : i))}
                onBlur={(e) => saveContent(item.id, e.target.value)}
                rows={Math.min(8, Math.max(3, item.content.split("\n").length))}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700 focus:bg-white focus:outline-hidden resize-none"
              />
              <div className="flex items-center gap-4">
                {item.image_url ? (
                  <div className="relative group">
                    <img src={item.image_url} alt="" className="h-28 w-28 object-cover rounded-xl border border-slate-200" />
                    <label className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center rounded-xl cursor-pointer transition-opacity">
                      <ImagePlus className="h-5 w-5 text-white" />
                      <input type="file" accept="image/*" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) saveContentImage(item.id, f); }} />
                    </label>
                  </div>
                ) : (
                  <label className="flex items-center justify-center h-28 w-28 rounded-xl border-2 border-dashed border-slate-200 hover:border-lrso-blue-400 cursor-pointer text-slate-400 hover:text-lrso-blue-600 transition-colors bg-slate-50">
                    <ImagePlus className="h-6 w-6" />
                    <input type="file" accept="image/*" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) saveContentImage(item.id, f); }} />
                  </label>
                )}
                <p className="text-xs text-slate-400">Upload or replace image.</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderUsers = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-bold text-slate-900 text-lg">Admin Users</h3>
          <p className="text-sm text-slate-500">Manage admin dashboard access.</p>
        </div>
        {currentUserRole === "Admin" && (
          <button onClick={() => { setEditingUser(null); setUserForm({ username: "", password: "", email: "", name: "", role: "Staff" }); setShowUserForm(true); }} className="flex items-center gap-2 rounded-xl bg-lrso-blue-600 hover:bg-lrso-blue-700 text-white px-4 py-2.5 text-sm font-bold transition-all cursor-pointer shadow-sm">
            <Plus className="h-4 w-4" /> Add User
          </button>
        )}
      </div>

      {showUserForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-lg w-full max-w-md">
            <div className="flex items-center justify-between p-5 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-lg">{editingUser ? "Edit User" : "Add New User"}</h3>
              <button onClick={cancelEditUser} className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={saveUser} className="p-5 space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-500 mb-1.5 block">Username *</label>
                <input required value={userForm.username} onChange={e => setUserForm(f => ({ ...f, username: e.target.value }))} placeholder="username" className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700 focus:bg-white focus:outline-hidden" />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 mb-1.5 block">Password *</label>
                <input required value={userForm.password} onChange={e => setUserForm(f => ({ ...f, password: e.target.value }))} placeholder="password" className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700 focus:bg-white focus:outline-hidden" />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 mb-1.5 block">Email</label>
                <input value={userForm.email} onChange={e => setUserForm(f => ({ ...f, email: e.target.value }))} placeholder="email@example.com" type="email" className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700 focus:bg-white focus:outline-hidden" />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 mb-1.5 block">Name</label>
                <input value={userForm.name} onChange={e => setUserForm(f => ({ ...f, name: e.target.value }))} placeholder="Full Name" className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700 focus:bg-white focus:outline-hidden" />
              </div>
              {currentUserRole === "Admin" && (
                <div>
                  <label className="text-xs font-bold text-slate-500 mb-1.5 block">Role</label>
                  <select value={userForm.role} onChange={e => setUserForm(f => ({ ...f, role: e.target.value }))} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700 focus:bg-white focus:outline-hidden cursor-pointer">
                    <option value="Staff">Staff</option>
                    <option value="Admin">Admin</option>
                  </select>
                </div>
              )}
              <div className="flex items-center gap-3 pt-2">
                <button type="submit" disabled={savingUser} className="flex-1 rounded-xl bg-lrso-blue-600 hover:bg-lrso-blue-700 text-white px-4 py-2.5 text-sm font-bold transition-all cursor-pointer shadow-sm disabled:opacity-50">
                  {savingUser ? <Loader2 className="h-4 w-4 animate-spin mx-auto" /> : (editingUser ? "Update User" : "Create User")}
                </button>
                <button type="button" onClick={cancelEditUser} className="rounded-xl border border-slate-200 text-slate-600 px-4 py-2.5 text-sm font-bold hover:bg-slate-50 cursor-pointer">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {loadingU ? <Spinner /> : adminUsers.length === 0 ? <Empty msg="No admin users yet." /> : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="text-left text-xs font-bold text-slate-500 uppercase tracking-wider px-6 py-3">Username</th>
                <th className="text-left text-xs font-bold text-slate-500 uppercase tracking-wider px-6 py-3">Name</th>
                <th className="text-left text-xs font-bold text-slate-500 uppercase tracking-wider px-6 py-3">Email</th>
                <th className="text-left text-xs font-bold text-slate-500 uppercase tracking-wider px-6 py-3">Role</th>
                <th className="text-left text-xs font-bold text-slate-500 uppercase tracking-wider px-6 py-3">Created</th>
                <th className="text-right text-xs font-bold text-slate-500 uppercase tracking-wider px-6 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {adminUsers.map(u => (
                <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <p className="font-bold text-slate-900">{u.username}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-slate-700">{u.name || "—"}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-slate-700">{u.email || "—"}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center rounded-lg px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide ${u.role === "Admin" ? "bg-lrso-crimson-50 text-lrso-crimson-700 border border-lrso-crimson-200" : "bg-slate-100 text-slate-600 border border-slate-200"}`}>
                      {u.role || "Staff"}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-xs text-slate-500">{new Date(u.created_at).toLocaleDateString()}</p>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {currentUserRole === "Admin" && (
                        <button onClick={() => changeUserPassword(u.id, "")} className="p-2 rounded-lg text-slate-400 hover:text-lrso-blue-600 hover:bg-lrso-blue-50 transition-colors cursor-pointer" title="Change password">
                          <Lock className="h-4 w-4" />
                        </button>
                      )}
                      {currentUserRole === "Admin" && (
                        <button onClick={() => startEditUser(u)} className="p-2 rounded-lg text-slate-400 hover:text-lrso-blue-600 hover:bg-lrso-blue-50 transition-colors cursor-pointer" title="Edit user">
                          <Pencil className="h-4 w-4" />
                        </button>
                      )}
                      {currentUserRole === "Admin" && (
                        <button onClick={() => deleteUser(u.id)} className="p-2 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer" title="Delete user">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );

  const tabContent: Record<AdminTab, React.ReactNode> = {
    overview: renderOverview(),
    venues: renderVenues(),
    contacts: renderContacts(),
    users: renderUsers(),
    content: renderContent(),
  };

  const tabMeta: Record<AdminTab, { title: string; subtitle: string }> = {
    overview: { title: "Overview", subtitle: "Live snapshot of your site and messages." },
    venues: { title: "Venues", subtitle: "Manage venues and their facilities." },
    contacts: { title: "Messages", subtitle: "Contact form submissions from visitors." },
    users: { title: "Users", subtitle: "Manage admin dashboard access." },
    content: { title: "Site Content", subtitle: "Edit copy and images across the site." },
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Desktop Sidebar */}
      <aside className="w-64 bg-slate-950 text-white hidden md:flex flex-col shrink-0 fixed top-0 bottom-0 left-0 z-40 border-r border-slate-800">
        <div className="px-5 py-6 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <Logo className="h-20 w-auto" showText={false} imageSrc={logoImage} />
            <div>
              <p className="font-display text-base font-extrabold text-white leading-tight">LRSO</p>
              <p className="text-xs text-slate-500 font-medium">Admin Portal</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-3 py-5 space-y-1">
          {navItems.map(item => {
            const isActive = activeTab === item.id;
            return (
              <button key={item.id} onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 rounded-xl px-3.5 py-3 text-sm font-bold transition-all cursor-pointer group ${
                  isActive ? "bg-white/10 text-white shadow-inner" : "text-slate-400 hover:bg-white/5 hover:text-white"
                }`}>
                <span className={`${isActive ? "text-lrso-crimson-400" : "text-slate-500 group-hover:text-slate-300"} transition-colors`}>{item.icon}</span>
                {item.label}
                {item.id === "contacts" && contacts.filter(c => !c.read).length > 0 && (
                  <span className="ml-auto bg-amber-500 text-white text-[10px] font-extrabold rounded-full h-5 w-5 flex items-center justify-center">
                    {contacts.filter(c => !c.read).length}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        <div className="px-3 py-4 border-t border-slate-800">
          <button onClick={onLogout}
            className="w-full flex items-center gap-3 rounded-xl px-3.5 py-3 text-sm font-bold text-slate-400 hover:bg-white/5 hover:text-white transition-all cursor-pointer">
            <LogOut className="h-4 w-4" />Sign Out
          </button>
        </div>
      </aside>

      {/* Mobile header */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-40 bg-slate-950 text-white px-4 h-20 flex items-center justify-between border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <Logo className="h-14 w-auto" showText={false} imageSrc={logoImage} />
          <span className="font-display text-sm font-bold">LRSO Admin</span>
        </div>
        <button onClick={onLogout} className="text-xs font-bold text-slate-400 flex items-center gap-1 cursor-pointer hover:text-white transition-colors">
          <LogOut className="h-3.5 w-3.5" /> Sign Out
        </button>
      </div>

      {/* Mobile tab bar */}
      <div className="md:hidden fixed top-20 left-0 right-0 z-30 bg-white border-b border-slate-200 overflow-x-auto shadow-sm">
        <div className="flex px-3 py-2.5 gap-2">
          {navItems.map(item => (
            <button key={item.id} onClick={() => setActiveTab(item.id)}
              className={`shrink-0 flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-xs font-bold transition-all cursor-pointer ${
                activeTab === item.id ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-100"
              }`}>
              {item.icon}{item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 md:ml-64">
        <header className="hidden md:flex items-center justify-between bg-white border-b border-slate-200 px-8 py-5 sticky top-0 z-20">
          <div>
            <h1 className="font-display text-2xl font-extrabold text-slate-900 tracking-tight">{tabMeta[activeTab].title}</h1>
            <p className="text-sm text-slate-500 mt-0.5">{tabMeta[activeTab].subtitle}</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-lrso-blue-50 to-white border border-lrso-blue-100 flex items-center justify-center text-sm font-extrabold text-lrso-blue-700 shadow-sm">J</div>
          </div>
        </header>

        <main className="flex-1 p-6 pt-36 md:pt-8">
          {tabContent[activeTab]}
        </main>
      </div>
    </div>
  );
};
