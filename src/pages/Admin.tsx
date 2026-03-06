import { useState, useEffect } from "react";
import { CheckCircle, User, Users, Briefcase, FileText, Download, Eye, ExternalLink, LogOut, Lock, Phone, Edit2, Trash2, UserMinus, UserCheck, Save, X, Loader2, ShoppingBag, Plus } from "lucide-react";
import { toast } from "sonner";

interface Registration {
    id: number;
    type: string;
    studentName: string;
    dob: string;
    age: string;
    sex: string;
    nationality: string;
    schoolName: string;
    siblingsName: string;
    regNo: string;
    occupation: string;
    area: string;
    fatherName: string;
    fatherContact: string;
    fatherEmail: string;
    motherName: string;
    motherContact: string;
    motherEmail: string;
    tshirtSize: string;
    sessionsPerMonth: string;
    enrollmentDate: string;
    feesPerMonth: string;
    squadLevel: string;
    studentSignature: string;
    declarationDate: string;
    proofType: string;
    photoUrl: string;
    proofUrl: string;
    isActive: boolean;
    feesDate: string;
    lastPaidMonth: string;
    remarks: string;
    createdAt: string;
}

interface Purchase {
    id: number;
    registrationId: number;
    item: string;
    quantity: number;
    totalPrice: string;
    purchaseDate: string;
    createdAt: string;
}

interface UserSession {
    phone: string;
    name: string;
    role: string;
}

export default function AdminPortal() {
    const [registrations, setRegistrations] = useState<Registration[]>([]);
    const [loading, setLoading] = useState(true);
    const [selected, setSelected] = useState<Registration | null>(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [user, setUser] = useState<UserSession | null>(null);
    const [loginData, setLoginData] = useState({ phone: "", password: "" });
    const [isEditing, setIsEditing] = useState(false);
    const [editForm, setEditForm] = useState<Partial<Registration>>({});
    const [isUpdating, setIsUpdating] = useState(false);

    // New modals state
    const [showResetModal, setShowResetModal] = useState(false);
    const [showCoachModal, setShowCoachModal] = useState(false);
    const [resetForm, setResetForm] = useState({ current: "", new: "" });
    const [coachForm, setCoachForm] = useState({ phone: "", password: "", name: "" });

    // Purchase history state
    const [purchases, setPurchases] = useState<Purchase[]>([]);
    const [isFetchingPurchases, setIsFetchingPurchases] = useState(false);
    const [purchaseForm, setPurchaseForm] = useState({ item: "", quantity: "1", totalPrice: "", purchaseDate: new Date().toISOString().split('T')[0] });
    const [isSavingPurchase, setIsSavingPurchase] = useState(false);

    useEffect(() => {
        const savedUser = localStorage.getItem("adminUser");
        if (savedUser) {
            setUser(JSON.parse(savedUser));
            setIsAuthenticated(true);
        }
    }, []);

    useEffect(() => {
        const authStatus = localStorage.getItem("adminAuth");
        if (authStatus === "true") {
            setIsAuthenticated(true);
        }
    }, []);

    useEffect(() => {
        if (isAuthenticated) {
            fetch("/api/registrations")
                .then((res) => res.json())
                .then((data) => {
                    setRegistrations(data);
                    setLoading(false);
                })
                .catch((err) => {
                    console.error(err);
                    setLoading(false);
                });
        }
    }, [isAuthenticated]);

    useEffect(() => {
        if (selected) {
            fetchPurchases(selected.id);
        }
    }, [selected]);

    const fetchPurchases = async (regId: number) => {
        setIsFetchingPurchases(true);
        try {
            const res = await fetch(`/api/purchases?registrationId=${regId}`);
            if (res.ok) {
                const data = await res.json();
                setPurchases(data);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setIsFetchingPurchases(false);
        }
    };

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await fetch("/api/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(loginData),
            });
            const data = await res.json();
            if (res.ok) {
                setUser(data);
                setIsAuthenticated(true);
                localStorage.setItem("adminUser", JSON.stringify(data));
                toast.success(`Welcome back, ${data.name}!`);
            } else {
                toast.error(data.error || "Invalid credentials. Please try again.");
            }
        } catch (err) {
            toast.error("Login failed. Check connection.");
        }
    };

    const handleLogout = () => {
        setIsAuthenticated(false);
        setUser(null);
        localStorage.removeItem("adminUser");
        toast.info("Logged out successfully");
    };

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;
        const res = await fetch("/api/reset-password", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ phone: user.phone, currentPassword: resetForm.current, newPassword: resetForm.new }),
        });
        const data = await res.json();
        if (res.ok) {
            toast.success("Password reset successfully");
            setShowResetModal(false);
            setResetForm({ current: "", new: "" });
        } else {
            toast.error(data.error);
        }
    };

    const handleCreateCoach = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user || user.role !== 'admin') return;
        const res = await fetch("/api/create-coach", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ adminPhone: user.phone, ...coachForm }),
        });
        const data = await res.json();
        if (res.ok) {
            toast.success("Coach created successfully");
            setShowCoachModal(false);
            setCoachForm({ phone: "", password: "", name: "" });
        } else {
            toast.error(data.error);
        }
    };

    const handleAddPurchase = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selected) return;
        setIsSavingPurchase(true);
        try {
            const res = await fetch("/api/add-purchase", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ registrationId: selected.id, ...purchaseForm }),
            });
            if (res.ok) {
                toast.success("Purchase recorded!");
                setPurchaseForm({ item: "", quantity: "1", totalPrice: "", purchaseDate: new Date().toISOString().split('T')[0] });
                fetchPurchases(selected.id);
            } else {
                const data = await res.json();
                toast.error(data.error || "Failed to save purchase");
            }
        } catch (e) {
            toast.error("Error saving purchase");
        } finally {
            setIsSavingPurchase(false);
        }
    };

    const handleMarkFeePaid = async (reg: Registration) => {
        const currentMonth = new Date().toISOString().slice(0, 7); // 'YYYY-MM'
        const loadingToast = toast.loading("Updating fee status...");
        try {
            const res = await fetch("/api/update-registration", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id: reg.id, lastPaidMonth: currentMonth }),
            });
            if (!res.ok) throw new Error("Update failed");
            const updated = await res.json();
            setRegistrations(prev => prev.map(r => r.id === reg.id ? updated : r));
            if (selected?.id === reg.id) setSelected(updated);
            toast.success("Fee marked as paid for current month");
        } catch (e: any) {
            toast.error(e.message);
        } finally {
            toast.dismiss(loadingToast);
        }
    };

    const getFeeStatus = (reg: Registration) => {
        if (!reg.feesDate) return { isDue: false, label: "No Date Set" };
        const feesDateObj = new Date(reg.feesDate);
        const today = new Date();
        const currentMonthStr = today.toISOString().slice(0, 7);

        // If already paid for this month
        if (reg.lastPaidMonth === currentMonthStr) return { isDue: false, label: "Paid" };

        // Alert on the 5th of current month if date was set on 6th of previous? 
        // User said: "if date is set as Mar 6 on April 5 an alert should be sent"
        // This suggests alert is due 1 day before the anniversary in the next month.
        // Let's generalize: Alert if Today >= Anniversary - 1 day, AND not paid for this cycle.

        const anniversaryDay = feesDateObj.getDate();
        const alertDay = anniversaryDay - 1 || 28; // fallback for day 1

        if (today.getDate() >= alertDay) {
            return { isDue: true, label: "Fee Due" };
        }

        return { isDue: false, label: "Upcoming" };
    };

    const filteredRegistrations = registrations.filter(reg => {
        if (user?.role === 'coach') return reg.type === 'student';
        return true;
    });

    const dueRegistrations = filteredRegistrations.filter(reg => getFeeStatus(reg).isDue);

    const handleToggleStatus = async (reg: Registration) => {
        const newStatus = !reg.isActive;
        const loadingToast = toast.loading(`${newStatus ? 'Activating' : 'Deactivating'} ${reg.studentName}...`);

        try {
            const res = await fetch("/api/update-registration", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id: reg.id, isActive: newStatus }),
            });

            if (!res.ok) throw new Error("Failed to update status");

            const updatedReg = await res.json();
            setRegistrations(prev => prev.map(r => r.id === reg.id ? updatedReg : r));
            if (selected?.id === reg.id) setSelected(updatedReg);

            toast.success(`${reg.studentName} has been ${newStatus ? 'activated' : 'deactivated'}`);
        } catch (error: any) {
            toast.error(error.message);
        } finally {
            toast.dismiss(loadingToast);
        }
    };

    const handleStartEdit = () => {
        if (!selected) return;
        setEditForm(selected);
        setIsEditing(true);
    };

    const handleSaveEdit = async () => {
        if (!selected || !editForm) return;
        setIsUpdating(true);
        const loadingToast = toast.loading("Saving changes...");

        try {
            const res = await fetch("/api/update-registration", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(editForm),
            });

            if (!res.ok) throw new Error("Failed to save changes");

            const updatedReg = await res.json();
            setRegistrations(prev => prev.map(r => r.id === selected.id ? updatedReg : r));
            setSelected(updatedReg);
            setIsEditing(false);
            toast.success("Profile updated successfully");
        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setIsUpdating(false);
            toast.dismiss(loadingToast);
        }
    };

    if (!isAuthenticated) {
        return (
            <div className="flex h-screen items-center justify-center bg-background p-4 sm:p-0">
                <div className="w-full max-w-sm overflow-hidden rounded-[2.5rem] border border-border bg-card shadow-2xl">
                    <div className="bg-navy p-10 text-center text-white">
                        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-sm">
                            <Lock className="h-8 w-8" />
                        </div>
                        <h2 className="text-2xl font-black uppercase tracking-widest">Admin Access</h2>
                        <p className="mt-1 text-xs font-bold text-white/50">Strictly for Academy Management Only</p>
                    </div>
                    <form onSubmit={handleLogin} className="p-8 space-y-6">
                        <div className="space-y-4">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Phone Number</label>
                                <div className="relative">
                                    <Phone className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                    <input
                                        type="tel"
                                        placeholder="00000 00000"
                                        value={loginData.phone}
                                        onChange={(e) => setLoginData({ ...loginData, phone: e.target.value })}
                                        className="h-12 w-full rounded-2xl border border-border bg-muted/30 pl-11 pr-4 text-sm font-bold focus:border-navy focus:outline-none focus:ring-4 focus:ring-navy/5"
                                        required
                                    />
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Password</label>
                                <div className="relative">
                                    <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                    <input
                                        type="password"
                                        placeholder="••••••••"
                                        value={loginData.password}
                                        onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                                        className="h-12 w-full rounded-2xl border border-border bg-muted/30 pl-11 pr-4 text-sm font-bold focus:border-navy focus:outline-none focus:ring-4 focus:ring-navy/5"
                                        required
                                    />
                                </div>
                            </div>
                        </div>
                        <button
                            type="submit"
                            className="flex h-12 w-full items-center justify-center rounded-2xl bg-navy text-sm font-black uppercase tracking-widest text-white transition-all hover:bg-navy-dark active:scale-95 shadow-xl shadow-navy/20"
                        >
                            Sign In
                        </button>
                    </form>
                    <div className="bg-muted/30 p-4 text-center">
                        <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest leading-loose">
                            Unauthorized access is prohibited.<br />Privacy & Data Protection Verified by DK Academy.
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center bg-background">
                <div className="flex flex-col items-center gap-4">
                    <div className="h-12 w-12 animate-spin rounded-full border-4 border-navy border-t-transparent shadow-lg" />
                    <p className="text-[10px] font-black uppercase tracking-widest text-navy">Loading Databases...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-muted/30 p-4 sm:p-8">
            <div className="mx-auto max-w-7xl">
                <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-4">
                        <div>
                            <h1 className="text-3xl font-bold text-navy text-primary">Admin Portal</h1>
                            <p className="text-muted-foreground">Manage academy registrations and memberships</p>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-card text-muted-foreground transition-all hover:bg-destructive hover:text-white"
                            title="Sign Out"
                        >
                            <LogOut className="h-5 w-5" />
                        </button>
                    </div>
                    <div className="flex items-center gap-4 bg-card px-4 py-2 rounded-xl border border-border shadow-sm">
                        <div className="text-center">
                            <p className="text-[10px] font-bold uppercase text-muted-foreground tracking-tighter">Total</p>
                            <p className="text-xl font-black text-navy">{filteredRegistrations.length}</p>
                        </div>
                        <div className="h-8 w-px bg-border/60" />
                        <div className="text-center">
                            <p className="text-[10px] font-bold uppercase text-muted-foreground tracking-tighter">Students</p>
                            <p className="text-xl font-black text-navy">
                                {filteredRegistrations.filter((r) => r.type === "student").length}
                            </p>
                        </div>
                        {user?.role === 'admin' && (
                            <>
                                <div className="h-8 w-px bg-border/60" />
                                <div className="text-center">
                                    <p className="text-[10px] font-bold uppercase text-muted-foreground tracking-tighter">Members</p>
                                    <p className="text-xl font-black text-lime-dark">
                                        {filteredRegistrations.filter((r) => r.type === "member").length}
                                    </p>
                                </div>
                            </>
                        )}
                    </div>
                </div>

                {/* Quick Actions & Alerts */}
                <div className="mb-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="rounded-2xl bg-card border border-border p-6 shadow-sm">
                        <h3 className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-4">Account Actions</h3>
                        <div className="flex flex-wrap gap-2">
                            <button onClick={() => setShowResetModal(true)} className="flex items-center gap-2 rounded-lg bg-muted px-4 py-2 text-xs font-bold text-navy hover:bg-navy hover:text-white transition-all">
                                <Lock className="h-4 w-4" /> Reset Password
                            </button>
                            {user?.role === 'admin' && (
                                <button onClick={() => setShowCoachModal(true)} className="flex items-center gap-2 rounded-lg bg-navy px-4 py-2 text-xs font-bold text-white hover:bg-navy-dark transition-all shadow-md">
                                    <Briefcase className="h-4 w-4" /> Add Coach
                                </button>
                            )}
                        </div>
                    </div>

                    {dueRegistrations.length > 0 && (
                        <div className="rounded-2xl bg-destructive/10 border border-destructive/20 p-6 shadow-sm relative overflow-hidden group">
                            <div className="absolute right-[-10px] top-[-10px] opacity-10 group-hover:scale-110 transition-transform">
                                <Users className="h-24 w-24 text-destructive" />
                            </div>
                            <h3 className="text-xs font-black uppercase tracking-widest text-destructive mb-3">Fee Alerts Pending</h3>
                            <p className="text-sm font-bold text-destructive mb-3">{dueRegistrations.length} profiles have fees due for {new Date().toLocaleString('default', { month: 'long' })}.</p>
                            <div className="flex gap-2">
                                <button onClick={() => setSelected(dueRegistrations[0])} className="text-[10px] bg-destructive text-white px-3 py-1.5 rounded-lg font-black uppercase tracking-tighter shadow-lg shadow-destructive/20 active:scale-95 transition-all">
                                    Review All
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* List */}
                    <div className="lg:col-span-2 space-y-3">
                        {filteredRegistrations.length === 0 ? (
                            <div className="flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-border bg-card/50 p-20 text-center">
                                <Users className="mb-4 h-12 w-12 text-muted-foreground opacity-20" />
                                <h3 className="text-xl font-bold text-navy">No registrations yet</h3>
                                <p className="text-sm text-muted-foreground">New entries will appear here as they come in.</p>
                            </div>
                        ) : (
                            filteredRegistrations.map((reg) => {
                                const status = getFeeStatus(reg);
                                return (
                                    <div
                                        key={reg.id}
                                        onClick={() => setSelected(reg)}
                                        className={`group relative overflow-hidden rounded-2xl border bg-card p-5 transition-all hover:scale-[1.01] hover:shadow-lg ${selected?.id === reg.id ? "border-navy ring-4 ring-navy/5 shadow-md" : "border-border shadow-sm"
                                            }`}
                                    >
                                        <div className="flex items-center gap-5">
                                            <div className="h-16 w-16 overflow-hidden rounded-2xl bg-muted ring-2 ring-background shadow-inner shrink-0">
                                                {reg.photoUrl ? (
                                                    <img src={reg.photoUrl} alt="" className="h-full w-full object-cover" />
                                                ) : (
                                                    <div className="flex h-full w-full items-center justify-center">
                                                        <User className="text-muted-foreground h-6 w-6" />
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-3">
                                                    <h3 className="text-lg font-bold text-navy leading-tight truncate">{reg.studentName}</h3>
                                                    <span className={`rounded-full px-2.5 py-0.5 text-[9px] font-black uppercase tracking-widest shrink-0 ${reg.type === "student" ? "bg-navy/10 text-navy" : "bg-lime/20 text-lime-dark"
                                                        }`}>
                                                        {reg.type}
                                                    </span>
                                                    {!reg.isActive && (
                                                        <span className="rounded-full bg-destructive/10 px-2 py-0.5 text-[9px] font-black uppercase tracking-widest text-destructive shrink-0">
                                                            Inactive
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                                                    <span className="flex items-center gap-1 font-medium shrink-0"><CheckCircle className="h-3 w-3 text-lime-dark" /> {reg.area || "General"}</span>
                                                    <span className="h-1 w-1 rounded-full bg-border shrink-0" />
                                                    <span className="shrink-0">Joined {new Date(reg.createdAt).toLocaleDateString()}</span>
                                                    {status.isDue && (
                                                        <>
                                                            <span className="h-1 w-1 rounded-full bg-border shrink-0" />
                                                            <span className="text-destructive font-black uppercase text-[10px] tracking-tighter shrink-0 flex items-center gap-1 animate-pulse"><FileText className="h-3 w-3" /> {status.label}</span>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="text-right shrink-0">
                                                <div className="mb-1 rounded-lg bg-navy px-3 py-1 flex flex-col items-center justify-center">
                                                    <p className="text-[8px] font-black uppercase tracking-widest text-white/60">Squad</p>
                                                    <p className="text-xs font-black text-white">{reg.squadLevel || "—"}</p>
                                                </div>
                                                <button className="text-navy opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <ExternalLink className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>

                    {/* Details */}
                    <div className="lg:col-span-1">
                        {selected ? (
                            <div className="sticky top-8 rounded-3xl border border-border bg-card shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
                                <div className="p-8 pb-4 flex flex-col items-center text-center border-b border-border/50 bg-gradient-to-b from-muted/30 to-card">
                                    <div className="relative mb-6">
                                        <div className="h-40 w-32 overflow-hidden rounded-[2rem] border-4 border-background shadow-2xl rotate-3 transition-transform hover:rotate-0">
                                            {selected.photoUrl ? (
                                                <img src={selected.photoUrl} alt="" className="h-full w-full object-cover" />
                                            ) : (
                                                <div className="flex h-full w-full items-center justify-center bg-muted">
                                                    <User className="h-12 w-12 text-muted-foreground/30" />
                                                </div>
                                            )}
                                        </div>
                                        <div className={`absolute -bottom-2 -right-2 h-10 w-10 flex items-center justify-center rounded-full border-2 border-background font-bold text-white shadow-lg ${selected.type === "student" ? "bg-navy" : "bg-lime-dark"}`}>
                                            {selected.type === "student" ? "S" : "M"}
                                        </div>
                                    </div>
                                    <h2 className="text-2xl font-black text-navy leading-tight">{selected.studentName}</h2>
                                    <div className="mt-1 flex items-center gap-2">
                                        <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">{selected.type} Enrollment</p>
                                        {!selected.isActive && (
                                            <span className="rounded-full bg-destructive/10 px-2 py-0.5 text-[8px] font-black uppercase tracking-widest text-destructive">Deactivated</span>
                                        )}
                                    </div>

                                    {!isEditing && (
                                        <div className="mt-6 flex gap-2">
                                            <button
                                                onClick={handleStartEdit}
                                                className="flex h-9 items-center gap-2 rounded-lg bg-navy px-4 text-xs font-bold text-white transition-all hover:bg-navy-dark active:scale-95 shadow-md"
                                            >
                                                <Edit2 className="h-3 w-3" /> Edit Profile
                                            </button>
                                            <button
                                                onClick={() => handleToggleStatus(selected)}
                                                className={`flex h-9 items-center gap-2 rounded-lg px-4 text-xs font-bold transition-all active:scale-95 shadow-md ${selected.isActive
                                                    ? "bg-destructive/10 text-destructive hover:bg-destructive hover:text-white"
                                                    : "bg-lime text-secondary-foreground hover:bg-lime/90"}`}
                                            >
                                                {selected.isActive ? (
                                                    <><UserMinus className="h-3 w-3" /> Deactivate</>
                                                ) : (
                                                    <><UserCheck className="h-3 w-3" /> Activate</>
                                                )}
                                            </button>
                                        </div>
                                    )}

                                    {isEditing && (
                                        <div className="mt-6 flex gap-2">
                                            <button
                                                onClick={handleSaveEdit}
                                                disabled={isUpdating}
                                                className="flex h-9 items-center gap-2 rounded-lg bg-lime px-4 text-xs font-bold text-secondary-foreground transition-all hover:bg-lime/90 active:scale-95 shadow-md disabled:opacity-50"
                                            >
                                                {isUpdating ? <Loader2 className="h-3 w-3 animate-spin" /> : <Save className="h-3 w-3" />} Save Changes
                                            </button>
                                            <button
                                                onClick={() => setIsEditing(false)}
                                                disabled={isUpdating}
                                                className="flex h-9 items-center gap-2 rounded-lg bg-muted px-4 text-xs font-bold text-muted-foreground transition-all hover:bg-muted-foreground hover:text-white active:scale-95 shadow-sm disabled:opacity-50"
                                            >
                                                <X className="h-3 w-3" /> Cancel
                                            </button>
                                        </div>
                                    )}
                                </div>

                                <div className="flex-1 overflow-y-auto p-8 space-y-8 scrollbar-hide">
                                    <DetailSection title="Personal Information">
                                        <DetailItem label="Full Name" value={isEditing ? editForm.studentName : selected.studentName} isEditing={isEditing} field="studentName" onChange={(val) => setEditForm(f => ({ ...f, studentName: val }))} />
                                        <DetailItem label="DOB" value={isEditing ? editForm.dob : selected.dob} type="date" isEditing={isEditing} field="dob" onChange={(val) => setEditForm(f => ({ ...f, dob: val }))} />
                                        <DetailItem label="Age" value={isEditing ? editForm.age : selected.age} isEditing={isEditing} field="age" onChange={(val) => setEditForm(f => ({ ...f, age: val }))} />
                                        <DetailItem label="Sex" value={isEditing ? editForm.sex : selected.sex} isEditing={isEditing} field="sex" onChange={(val) => setEditForm(f => ({ ...f, sex: val }))} />
                                        <DetailItem label="Nationality" value={isEditing ? editForm.nationality : selected.nationality} isEditing={isEditing} field="nationality" onChange={(val) => setEditForm(f => ({ ...f, nationality: val }))} />
                                        <DetailItem label="Area" value={isEditing ? editForm.area : selected.area} isEditing={isEditing} field="area" onChange={(val) => setEditForm(f => ({ ...f, area: val }))} />
                                        {selected.type === "student" ? (
                                            <DetailItem label="School" value={isEditing ? editForm.schoolName : selected.schoolName} isEditing={isEditing} field="schoolName" onChange={(val) => setEditForm(f => ({ ...f, schoolName: val }))} />
                                        ) : (
                                            <DetailItem label="Occupation" value={isEditing ? editForm.occupation : selected.occupation} isEditing={isEditing} field="occupation" onChange={(val) => setEditForm(f => ({ ...f, occupation: val }))} />
                                        )}
                                    </DetailSection>

                                    {selected.type === "student" && (
                                        <DetailSection title="Parental Information">
                                            <DetailItem label="Father Name" value={isEditing ? editForm.fatherName : selected.fatherName} isEditing={isEditing} field="fatherName" onChange={(val) => setEditForm(f => ({ ...f, fatherName: val }))} />
                                            <DetailItem label="Father Contact" value={isEditing ? editForm.fatherContact : selected.fatherContact} isEditing={isEditing} field="fatherContact" onChange={(val) => setEditForm(f => ({ ...f, fatherContact: val }))} />
                                            <DetailItem label="Father Email" value={isEditing ? editForm.fatherEmail : selected.fatherEmail} isEditing={isEditing} field="fatherEmail" onChange={(val) => setEditForm(f => ({ ...f, fatherEmail: val }))} />
                                            <div className="col-span-2 h-px bg-border/30 my-1" />
                                            <DetailItem label="Mother Name" value={isEditing ? editForm.motherName : selected.motherName} isEditing={isEditing} field="motherName" onChange={(val) => setEditForm(f => ({ ...f, motherName: val }))} />
                                            <DetailItem label="Mother Contact" value={isEditing ? editForm.motherContact : selected.motherContact} isEditing={isEditing} field="motherContact" onChange={(val) => setEditForm(f => ({ ...f, motherContact: val }))} />
                                            <DetailItem label="Mother Email" value={isEditing ? editForm.motherEmail : selected.motherEmail} isEditing={isEditing} field="motherEmail" onChange={(val) => setEditForm(f => ({ ...f, motherEmail: val }))} />
                                        </DetailSection>
                                    )}

                                    <DetailSection title="Academy Details">
                                        <DetailItem
                                            label="Squad/Level"
                                            value={isEditing ? editForm.squadLevel : selected.squadLevel}
                                            isEditing={isEditing}
                                            field="squadLevel"
                                            type="select"
                                            options={["Beginner", "Intermediate", "Advanced", "Elite"]}
                                            onChange={(val) => setEditForm(f => ({ ...f, squadLevel: val }))}
                                        />
                                        <DetailItem
                                            label="T-Shirt Size"
                                            value={isEditing ? editForm.tshirtSize : selected.tshirtSize}
                                            isEditing={isEditing}
                                            field="tshirtSize"
                                            type="select"
                                            options={["XS", "S", "M", "L", "XL", "XXL"]}
                                            onChange={(val) => setEditForm(f => ({ ...f, tshirtSize: val }))}
                                        />
                                        <DetailItem label="Sessions/Month" value={isEditing ? editForm.sessionsPerMonth : selected.sessionsPerMonth} type="number" isEditing={isEditing} field="sessionsPerMonth" onChange={(val) => setEditForm(f => ({ ...f, sessionsPerMonth: val }))} />
                                        <DetailItem label="Fees/Month" value={isEditing ? editForm.feesPerMonth : selected.feesPerMonth} isEditing={isEditing} field="feesPerMonth" onChange={(val) => setEditForm(f => ({ ...f, feesPerMonth: val }))} />
                                        <DetailItem label="Fees Due Anniversary" value={isEditing ? editForm.feesDate : selected.feesDate} type="date" isEditing={isEditing} field="feesDate" onChange={(val) => setEditForm(f => ({ ...f, feesDate: val }))} />
                                        <DetailItem label="Enrollment Date" value={isEditing ? editForm.enrollmentDate : selected.enrollmentDate} type="date" isEditing={isEditing} field="enrollmentDate" onChange={(val) => setEditForm(f => ({ ...f, enrollmentDate: val }))} />
                                        <DetailItem label="Registration Link" value={isEditing ? editForm.regNo : selected.regNo} isEditing={isEditing} field="regNo" onChange={(val) => setEditForm(f => ({ ...f, regNo: val }))} />
                                    </DetailSection>

                                    <DetailSection title="Fee Tracking">
                                        <div className="col-span-2">
                                            <div className="rounded-xl border border-border bg-muted/30 p-4">
                                                <div className="flex items-center justify-between mb-4">
                                                    <div>
                                                        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Monthly Payment Status</p>
                                                        <h4 className="text-sm font-bold text-navy">Cycle: {new Date().toLocaleString('default', { month: 'long' })} {new Date().getFullYear()}</h4>
                                                    </div>
                                                    <span className={`rounded-full px-2.5 py-0.5 text-[9px] font-black uppercase tracking-widest ${getFeeStatus(selected).isDue ? "bg-destructive/10 text-destructive" : "bg-lime/20 text-lime-dark"}`}>
                                                        {getFeeStatus(selected).label}
                                                    </span>
                                                </div>
                                                <button
                                                    disabled={!getFeeStatus(selected).isDue}
                                                    onClick={() => handleMarkFeePaid(selected)}
                                                    className="w-full flex items-center justify-center gap-2 rounded-lg bg-navy py-2.5 text-xs font-bold text-white shadow-xl shadow-navy/20 hover:bg-navy-dark disabled:opacity-50 disabled:grayscale transition-all active:scale-95"
                                                >
                                                    <CheckCircle className="h-4 w-4" /> Mark as Paid for {new Date().toLocaleString('default', { month: 'long' })}
                                                </button>
                                                <p className="mt-2 text-[10px] text-center text-muted-foreground italic">Last payment recorded for: {selected.lastPaidMonth || "Never"}</p>
                                            </div>
                                        </div>
                                    </DetailSection>

                                    <DetailSection title="Admin Remarks">
                                        <div className="col-span-2">
                                            {isEditing ? (
                                                <textarea
                                                    value={editForm.remarks || ""}
                                                    onChange={(e) => setEditForm(f => ({ ...f, remarks: e.target.value }))}
                                                    placeholder="Add internal remarks/notes here..."
                                                    className="w-full rounded-xl border border-border bg-muted/30 p-3 text-sm font-medium focus:border-navy focus:outline-none focus:ring-4 focus:ring-navy/5 min-h-[80px]"
                                                />
                                            ) : (
                                                <p className="text-sm font-medium leading-relaxed text-muted-foreground italic">
                                                    {selected.remarks || "No remarks added yet."}
                                                </p>
                                            )}
                                        </div>
                                    </DetailSection>

                                    <DetailSection title="Declaration">
                                        <DetailItem label="Signed By" value={isEditing ? editForm.studentSignature : selected.studentSignature} isEditing={isEditing} field="studentSignature" onChange={(val) => setEditForm(f => ({ ...f, studentSignature: val }))} />
                                        <DetailItem label="Date" value={isEditing ? editForm.declarationDate : selected.declarationDate} type="date" isEditing={isEditing} field="declarationDate" onChange={(val) => setEditForm(f => ({ ...f, declarationDate: val }))} />
                                        <DetailItem
                                            label="Proof Type"
                                            value={isEditing ? editForm.proofType : selected.proofType}
                                            isEditing={isEditing}
                                            field="proofType"
                                            type="select"
                                            options={["Aadhaar Card", "PAN Card", "Driving Licence", "Passport", "Voter ID"]}
                                            onChange={(val) => setEditForm(f => ({ ...f, proofType: val }))}
                                        />
                                    </DetailSection>

                                    <DetailSection title="Purchase History">
                                        <div className="col-span-2 space-y-4">
                                            {/* History List */}
                                            <div className="max-h-[200px] overflow-y-auto rounded-xl border border-border bg-muted/20 scrollbar-hide">
                                                {isFetchingPurchases ? (
                                                    <div className="p-4 text-center"><Loader2 className="mx-auto h-4 w-4 animate-spin text-muted-foreground" /></div>
                                                ) : purchases.length === 0 ? (
                                                    <p className="p-4 text-center text-[10px] font-bold uppercase tracking-widest text-muted-foreground">No purchase records</p>
                                                ) : (
                                                    <table className="w-full text-left text-[11px]">
                                                        <thead className="sticky top-0 bg-muted/80 backdrop-blur-sm">
                                                            <tr>
                                                                <th className="px-3 py-2 font-black uppercase tracking-tighter">Date</th>
                                                                <th className="px-3 py-2 font-black uppercase tracking-tighter">Item</th>
                                                                <th className="px-3 py-2 font-black uppercase tracking-tighter">Qty</th>
                                                                <th className="px-3 py-2 font-black uppercase tracking-tighter text-right">Price</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody className="divide-y divide-border/50">
                                                            {purchases.map(p => (
                                                                <tr key={p.id}>
                                                                    <td className="px-3 py-2 text-muted-foreground">{new Date(p.purchaseDate).toLocaleDateString()}</td>
                                                                    <td className="px-3 py-2 font-bold text-navy">{p.item}</td>
                                                                    <td className="px-3 py-2">{p.quantity}</td>
                                                                    <td className="px-3 py-2 text-right font-black">₹{p.totalPrice}</td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                )}
                                            </div>

                                            {/* Add New Form */}
                                            <form onSubmit={handleAddPurchase} className="rounded-xl border border-dashed border-border p-4 bg-muted/10 space-y-3">
                                                <div className="grid grid-cols-2 gap-2">
                                                    <div className="col-span-2">
                                                        <input
                                                            placeholder="Item Name (e.g. Cork box)"
                                                            required
                                                            className="h-8 w-full rounded-lg border border-border bg-white px-3 text-[11px] font-bold focus:outline-none"
                                                            value={purchaseForm.item}
                                                            onChange={e => setPurchaseForm({ ...purchaseForm, item: e.target.value })}
                                                        />
                                                    </div>
                                                    <input
                                                        type="number"
                                                        placeholder="Qty"
                                                        required
                                                        className="h-8 w-full rounded-lg border border-border bg-white px-3 text-[11px] font-bold focus:outline-none"
                                                        value={purchaseForm.quantity}
                                                        onChange={e => setPurchaseForm({ ...purchaseForm, quantity: e.target.value })}
                                                    />
                                                    <input
                                                        type="number"
                                                        placeholder="Total Price"
                                                        required
                                                        className="h-8 w-full rounded-lg border border-border bg-white px-3 text-[11px] font-bold focus:outline-none"
                                                        value={purchaseForm.totalPrice}
                                                        onChange={e => setPurchaseForm({ ...purchaseForm, totalPrice: e.target.value })}
                                                    />
                                                    <div className="col-span-2">
                                                        <input
                                                            type="date"
                                                            required
                                                            className="h-8 w-full rounded-lg border border-border bg-white px-3 text-[11px] font-bold focus:outline-none"
                                                            value={purchaseForm.purchaseDate}
                                                            onChange={e => setPurchaseForm({ ...purchaseForm, purchaseDate: e.target.value })}
                                                        />
                                                    </div>
                                                </div>
                                                <button
                                                    type="submit"
                                                    disabled={isSavingPurchase}
                                                    className="w-full flex h-8 items-center justify-center gap-2 rounded-lg bg-navy text-white text-[10px] font-black uppercase tracking-widest hover:bg-navy-dark disabled:opacity-50"
                                                >
                                                    {isSavingPurchase ? <Loader2 className="h-3 w-3 animate-spin" /> : <Plus className="h-3 w-3" />} Add Record
                                                </button>
                                            </form>
                                        </div>
                                    </DetailSection>

                                    <DetailSection title="Documents">
                                        <div className="col-span-2 flex gap-3 mt-1">
                                            {selected.photoUrl && (
                                                <a href={selected.photoUrl} target="_blank" rel="noreferrer" className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-muted py-3 text-xs font-bold text-navy hover:bg-muted/80 transition-all active:scale-95 shadow-sm border border-border/50">
                                                    <Eye className="h-4 w-4" /> View Photo
                                                </a>
                                            )}
                                            {selected.proofUrl && (
                                                <a href={selected.proofUrl} target="_blank" rel="noreferrer" className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-navy text-primary-foreground py-3 text-xs font-bold hover:opacity-90 transition-all active:scale-95 shadow-md">
                                                    <FileText className="h-4 w-4" /> View ID Proof
                                                </a>
                                            )}
                                        </div>
                                    </DetailSection>
                                </div>
                                <div className="p-6 bg-muted/20 border-t border-border/50">
                                    <div className="flex items-center justify-between text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                                        <span>ID: #{selected.id.toString().padStart(4, '0')}</span>
                                        <span>Registered {new Date(selected.createdAt).toLocaleDateString()}</span>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="sticky top-8 flex h-[60vh] flex-col items-center justify-center rounded-[3rem] border-2 border-dashed border-border bg-card/50 text-center p-12 transition-all hover:bg-card">
                                <div className="mb-6 rounded-full bg-navy/5 p-8">
                                    <User className="h-16 w-16 text-navy/20" />
                                </div>
                                <h3 className="text-xl font-bold text-navy">Registration Details</h3>
                                <p className="mt-2 text-sm text-muted-foreground max-w-[200px]">Select a profile from the list to view all captured field data.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Modals */}
            {showResetModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="w-full max-w-sm rounded-[2rem] border border-border bg-card p-8 shadow-2xl">
                        <h2 className="mb-6 text-xl font-black uppercase tracking-widest text-navy">Reset Password</h2>
                        <form onSubmit={handleResetPassword} className="space-y-4">
                            <input type="password" placeholder="Current Password" required value={resetForm.current} onChange={e => setResetForm({ ...resetForm, current: e.target.value })} className="h-12 w-full rounded-2xl border border-border bg-muted/30 px-4 text-sm font-bold focus:border-navy focus:outline-none" />
                            <input type="password" placeholder="New Password" required value={resetForm.new} onChange={e => setResetForm({ ...resetForm, new: e.target.value })} className="h-12 w-full rounded-2xl border border-border bg-muted/30 px-4 text-sm font-bold focus:border-navy focus:outline-none" />
                            <div className="flex gap-2">
                                <button type="submit" className="flex-1 rounded-xl bg-navy py-3 text-xs font-black uppercase tracking-widest text-white">Save</button>
                                <button type="button" onClick={() => setShowResetModal(false)} className="flex-1 rounded-xl bg-muted py-3 text-xs font-black uppercase tracking-widest text-muted-foreground">Cancel</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {showCoachModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="w-full max-w-sm rounded-[2rem] border border-border bg-card p-8 shadow-2xl">
                        <h2 className="mb-6 text-xl font-black uppercase tracking-widest text-navy">Add Coach</h2>
                        <form onSubmit={handleCreateCoach} className="space-y-4">
                            <input type="text" placeholder="Coach Name" required value={coachForm.name} onChange={e => setCoachForm({ ...coachForm, name: e.target.value })} className="h-12 w-full rounded-2xl border border-border bg-muted/30 px-4 text-sm font-bold focus:border-navy focus:outline-none" />
                            <input type="tel" placeholder="Phone Number" required value={coachForm.phone} onChange={e => setCoachForm({ ...coachForm, phone: e.target.value })} className="h-12 w-full rounded-2xl border border-border bg-muted/30 px-4 text-sm font-bold focus:border-navy focus:outline-none" />
                            <input type="password" placeholder="Initial Password" required value={coachForm.password} onChange={e => setCoachForm({ ...coachForm, password: e.target.value })} className="h-12 w-full rounded-2xl border border-border bg-muted/30 px-4 text-sm font-bold focus:border-navy focus:outline-none" />
                            <div className="flex gap-2">
                                <button type="submit" className="flex-1 rounded-xl bg-navy py-3 text-xs font-black uppercase tracking-widest text-white">Add Coach</button>
                                <button type="button" onClick={() => setShowCoachModal(false)} className="flex-1 rounded-xl bg-muted py-3 text-xs font-black uppercase tracking-widest text-muted-foreground">Cancel</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

function DetailSection({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <div>
            <h4 className="mb-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{title}</h4>
            <div className="grid grid-cols-2 gap-y-3 gap-x-4">{children}</div>
        </div>
    );
}

function DetailItem({ label, value, isEditing, field, type = "text", options, onChange }: {
    label: string;
    value: string | null | undefined;
    isEditing?: boolean;
    field?: keyof Registration;
    type?: string;
    options?: string[];
    onChange?: (val: string) => void;
}) {
    if (isEditing && field && onChange) {
        return (
            <div>
                <p className="text-[10px] text-muted-foreground">{label}</p>
                {type === "select" ? (
                    <select
                        className="mt-1 h-8 w-full rounded-md border border-border bg-muted/50 px-2 text-xs font-bold text-navy focus:outline-none focus:ring-1 focus:ring-navy"
                        value={value || ""}
                        onChange={(e) => onChange(e.target.value)}
                    >
                        <option value="">Select</option>
                        {options?.map(o => <option key={o} value={o}>{o}</option>)}
                    </select>
                ) : (
                    <input
                        type={type}
                        className="mt-1 h-8 w-full rounded-md border border-border bg-muted/50 px-2 text-xs font-bold text-navy focus:outline-none focus:ring-1 focus:ring-navy"
                        value={value || ""}
                        onChange={(e) => onChange(e.target.value)}
                    />
                )}
            </div>
        );
    }

    return (
        <div>
            <p className="text-[10px] text-muted-foreground">{label}</p>
            <p className="text-xs font-bold text-navy truncate">
                {label === "Fees/Month" && value ? `₹${value}` : (value || "—")}
            </p>
        </div>
    );
}
