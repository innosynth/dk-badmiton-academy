import { useState, useEffect } from "react";
import { CheckCircle, User, Users, Briefcase, FileText, Download, Eye, ExternalLink, LogOut, Lock, Phone, Edit2, Trash2, UserMinus, UserCheck, Save, X, Loader2, ShoppingBag, Plus, UserPlus, Calendar, CreditCard, DollarSign, Hash } from "lucide-react";
import { toast } from "sonner";
import FinancialYearSettings from "../components/FinancialYearSettings";

interface Registration {
    id: number;
    type: string;
    studentName: string;
    dob: string;
    age: string;
    sex: string;
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
    paidMonthsCount: number;
    remarks: string;
    financialYear: string;
    financialYearRegNo: number;
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

interface Guest {
    id: number;
    name: string;
    data: string | null;
    courtNumber: string | null;
    paymentDetails: string | null;
    visitTime: string | null;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
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
    const [showManageCoachesModal, setShowManageCoachesModal] = useState(false);
    const [resetForm, setResetForm] = useState({ current: "", new: "" });
    const [coachForm, setCoachForm] = useState({ phone: "", password: "", name: "" });
    const [allUsers, setAllUsers] = useState<any[]>([]);
    const [editingUser, setEditingUser] = useState<any | null>(null);

    // Purchase history state
    const [purchases, setPurchases] = useState<Purchase[]>([]);
    const [isFetchingPurchases, setIsFetchingPurchases] = useState(false);
    const [purchaseForm, setPurchaseForm] = useState({ item: "", quantity: "1", totalPrice: "", purchaseDate: new Date().toISOString().split('T')[0] });
    const [isSavingPurchase, setIsSavingPurchase] = useState(false);
    const [monthsPaying, setMonthsPaying] = useState(1);

    // Guest management state (Admin only)
    const [showGuestModal, setShowGuestModal] = useState(false);
    const [showManageGuestsModal, setShowManageGuestsModal] = useState(false);
    const [guests, setGuests] = useState<Guest[]>([]);
    const [guestForm, setGuestForm] = useState({ name: "", data: "", courtNumber: "", paymentDetails: "", visitTime: "" });
    const [editingGuest, setEditingGuest] = useState<Guest | null>(null);
    const [isSavingGuest, setIsSavingGuest] = useState(false);

    // Financial Year state
    const [activeFinancialYear, setActiveFinancialYear] = useState<string>("");

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
            fetchActiveFinancialYear();
            fetchRegistrations();

            if (user?.role === 'admin') {
                fetchUsers();
                fetchGuests();
            }
        }
    }, [isAuthenticated]);

    useEffect(() => {
        if (isAuthenticated && activeFinancialYear) {
            fetchRegistrations();
        }
    }, [activeFinancialYear]);

    const fetchUsers = async () => {
        try {
            const res = await fetch("/api/users");
            if (res.ok) {
                const data = await res.json();
                setAllUsers(data);
            }
        } catch (e) {
            console.error(e);
        }
    };

    const fetchGuests = async () => {
        try {
            const res = await fetch("/api/guests");
            if (res.ok) {
                const data = await res.json();
                setGuests(data);
            }
        } catch (e) {
            console.error(e);
        }
    };

    const fetchActiveFinancialYear = async () => {
        try {
            const res = await fetch("/api/financial-year?active=true");
            if (res.ok) {
                const data = await res.json();
                setActiveFinancialYear(data.fiscalYear);
            }
        } catch (e) {
            console.error("Failed to fetch active financial year:", e);
        }
    };

    const fetchRegistrations = async () => {
        setLoading(true);
        try {
            const url = activeFinancialYear 
                ? `/api/registrations?financialYear=${activeFinancialYear}`
                : "/api/registrations";
            
            const res = await fetch(url);
            const data = await res.json();
            setRegistrations(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleFinancialYearChange = (year: string) => {
        setActiveFinancialYear(year);
    };

    useEffect(() => {
        if (selected) {
            fetchPurchases(selected.id);
        }
    }, [selected, activeFinancialYear]);

    const fetchPurchases = async (regId: number) => {
        setIsFetchingPurchases(true);
        try {
            const url = activeFinancialYear
                ? `/api/purchases?registrationId=${regId}&financialYear=${activeFinancialYear}`
                : `/api/purchases?registrationId=${regId}`;
            
            const res = await fetch(url);
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
            const res = await fetch("/api/auth", {
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
        const res = await fetch("/api/auth", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ action: 'resetPassword', phone: user.phone, currentPassword: resetForm.current, newPassword: resetForm.new }),
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
        const res = await fetch("/api/users", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ adminPhone: user.phone, ...coachForm }),
        });
        const data = await res.json();
        if (res.ok) {
            toast.success("Coach created successfully");
            setShowCoachModal(false);
            setCoachForm({ phone: "", password: "", name: "" });
            fetchUsers();
        } else {
            toast.error(data.error);
        }
    };

    const handleDeleteUser = async (userId: number) => {
        if (!user || user.role !== 'admin') return;
        if (!confirm("Are you sure you want to remove this account? This action cannot be undone.")) return;

        try {
            const res = await fetch("/api/users", {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ adminPhone: user.phone, userId }),
            });
            const data = await res.json();
            if (res.ok) {
                toast.success(data.message);
                fetchUsers();
            } else {
                toast.error(data.error);
            }
        } catch (e) {
            toast.error("Failed to delete account");
        }
    };

    const handleUpdateUserInfo = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user || user.role !== 'admin' || !editingUser) return;

        try {
            const res = await fetch("/api/users", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ adminPhone: user.phone, userId: editingUser.id, ...editingUser }),
            });
            const data = await res.json();
            if (res.ok) {
                toast.success("User updated successfully");
                setEditingUser(null);
                fetchUsers();
            } else {
                toast.error(data.error);
            }
        } catch (e) {
            toast.error("Failed to update user");
        }
    };

    const handleAddGuest = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user || user.role !== 'admin') return;
        setIsSavingGuest(true);

        try {
            const res = await fetch("/api/guests", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ adminPhone: user.phone, ...guestForm }),
            });
            const data = await res.json();
            if (res.ok) {
                toast.success("Guest added successfully");
                setShowGuestModal(false);
                setGuestForm({ name: "", data: "", courtNumber: "", paymentDetails: "", visitTime: "" });
                fetchGuests();
            } else {
                toast.error(data.error || "Failed to add guest");
            }
        } catch (e) {
            toast.error("Failed to add guest");
        } finally {
            setIsSavingGuest(false);
        }
    };

    const handleUpdateGuest = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user || user.role !== 'admin' || !editingGuest) return;
        setIsSavingGuest(true);

        try {
            const res = await fetch("/api/guests", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ adminPhone: user.phone, id: editingGuest.id, ...editingGuest }),
            });
            const data = await res.json();
            if (res.ok) {
                toast.success("Guest updated successfully");
                setEditingGuest(null);
                fetchGuests();
            } else {
                toast.error(data.error || "Failed to update guest");
            }
        } catch (e) {
            toast.error("Failed to update guest");
        } finally {
            setIsSavingGuest(false);
        }
    };

    const handleDeleteGuest = async (guestId: number) => {
        if (!user || user.role !== 'admin') return;
        if (!confirm("Are you sure you want to delete this guest? This action cannot be undone.")) return;

        try {
            const res = await fetch("/api/guests", {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ adminPhone: user.phone, guestId }),
            });
            const data = await res.json();
            if (res.ok) {
                toast.success("Guest deleted successfully");
                fetchGuests();
            } else {
                toast.error(data.error || "Failed to delete guest");
            }
        } catch (e) {
            toast.error("Failed to delete guest");
        }
    };

    const handleAddPurchase = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selected) return;
        setIsSavingPurchase(true);
        try {
            const res = await fetch("/api/purchases", {
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

    const handleMarkFeePaid = async (reg: Registration, months: number = 1) => {
        const today = new Date();
        const currentMonthStr = today.toISOString().slice(0, 7);

        let year, month;
        if (reg.lastPaidMonth && reg.lastPaidMonth >= currentMonthStr) {
            // Start from month after last paid month
            const lastParts = reg.lastPaidMonth.split('-').map(Number);
            year = lastParts[0];
            month = lastParts[1] - 1; // Convert ISO month (1-12) to JS month (0-11)
        } else {
            // Start from current month
            year = today.getFullYear();
            month = today.getMonth();
        }

        const targetDate = new Date(year, month + months - 1, 1);
        const newPaidMonth = targetDate.toISOString().slice(0, 7);

        const loadingToast = toast.loading("Updating fee status...");
        try {
            const res = await fetch("/api/registrations", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    id: reg.id,
                    lastPaidMonth: newPaidMonth,
                    paidMonthsCount: (reg.paidMonthsCount || 0) + months
                }),
            });
            if (!res.ok) throw new Error("Update failed");
            const updated = await res.json();
            setRegistrations(prev => prev.map(r => r.id === reg.id ? updated : r));
            if (selected?.id === reg.id) setSelected(updated);
            toast.success(`Marked as paid for ${months} month(s) until ${newPaidMonth}`);
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

        // If already paid for this month OR future months
        if (reg.lastPaidMonth && reg.lastPaidMonth >= currentMonthStr) return { isDue: false, label: "Paid" };

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
            const res = await fetch("/api/registrations", {
                method: "PUT",
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
            const res = await fetch("/api/registrations", {
                method: "PUT",
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
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-4">
                        <div>
                            <h1 className="text-3xl font-bold text-navy text-primary">Admin Portal</h1>
                            <p className="text-muted-foreground">Manage academy registrations and memberships</p>
                        </div>
                        <FinancialYearSettings
                            adminPhone={user?.phone || null}
                            isAdmin={user?.role === 'admin'}
                            onYearChange={handleFinancialYearChange}
                        />
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
                            <p className="text-[10px] font-bold uppercase text-muted-foreground tracking-tighter">Active Students</p>
                            <p className="text-xl font-black text-navy">
                                {filteredRegistrations.filter((r) => r.type === "student" && r.isActive).length}
                            </p>
                        </div>
                        {user?.role === 'admin' && (
                            <>
                                <div className="h-8 w-px bg-border/60" />
                                <div className="text-center">
                                    <p className="text-[10px] font-bold uppercase text-muted-foreground tracking-tighter">Active Members</p>
                                    <p className="text-xl font-black text-lime-dark">
                                        {filteredRegistrations.filter((r) => r.type === "member" && r.isActive).length}
                                    </p>
                                </div>
                            </>
                        )}
                        <div className="h-8 w-px bg-border/60" />
                        <div className="text-center">
                            <p className="text-[10px] font-bold uppercase text-muted-foreground tracking-tighter">Inactive</p>
                            <p className="text-xl font-black text-destructive">
                                {filteredRegistrations.filter((r) => !r.isActive).length}
                            </p>
                        </div>
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
                                <>
                                    <button onClick={() => setShowCoachModal(true)} className="flex items-center gap-2 rounded-lg bg-navy px-4 py-2 text-xs font-bold text-white hover:bg-navy-dark transition-all shadow-md">
                                        <Briefcase className="h-4 w-4" /> Add Coach
                                    </button>
                                    <button onClick={() => setShowManageCoachesModal(true)} className="flex items-center gap-2 rounded-lg bg-muted px-4 py-2 text-xs font-bold text-navy hover:bg-navy hover:text-white transition-all">
                                        <Users className="h-4 w-4" /> Manage Coaches
                                    </button>
                                    <button onClick={() => setShowGuestModal(true)} className="flex items-center gap-2 rounded-lg bg-lime px-4 py-2 text-xs font-bold text-secondary-foreground hover:bg-lime/90 transition-all shadow-md">
                                        <UserPlus className="h-4 w-4" /> Add Guest
                                    </button>
                                    <button onClick={() => setShowManageGuestsModal(true)} className="flex items-center gap-2 rounded-lg bg-muted px-4 py-2 text-xs font-bold text-navy hover:bg-navy hover:text-white transition-all">
                                        <User className="h-4 w-4" /> Manage Guests
                                    </button>
                                </>
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

                {/* Main Table View */}
                <div className="rounded-[2.5rem] border border-border bg-card shadow-xl overflow-hidden">
                    <div className="overflow-x-auto custom-scrollbar">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-navy text-white">
                                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest">Profile</th>
                                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest">Name</th>
                                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest">Type</th>
                                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest">Squad/Level</th>
                                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest">Area</th>
                                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest">Status</th>
                                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest">Fees</th>
                                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-center">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border/50">
                                {filteredRegistrations.length === 0 ? (
                                    <tr>
                                        <td colSpan={8} className="px-6 py-20 text-center">
                                            <div className="flex flex-col items-center justify-center opacity-30">
                                                <Users className="h-12 w-12 mb-2" />
                                                <p className="text-sm font-bold uppercase tracking-widest">No matching records found</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    filteredRegistrations.map((reg) => {
                                        const status = getFeeStatus(reg);
                                        return (
                                            <tr key={reg.id} className="group hover:bg-muted/30 transition-colors">
                                                <td className="px-6 py-4">
                                                    <div className="h-12 w-10 overflow-hidden rounded-xl bg-muted border border-border/50 shadow-inner">
                                                        {reg.photoUrl ? (
                                                            <img src={reg.photoUrl} alt="" className="h-full w-full object-cover" />
                                                        ) : (
                                                            <div className="flex h-full w-full items-center justify-center">
                                                                <User className="h-4 w-4 text-muted-foreground/40" />
                                                            </div>
                                                        )}
                                                    </div>
                                                </td>
                                                 <td className="px-6 py-4">
                                                     <p className="text-sm font-black text-navy">{reg.studentName}</p>
                                                     <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-tight">
                                                         FY: {reg.financialYearRegNo?.toString().padStart(4, '0') || reg.id.toString().padStart(4, '0')}
                                                     </p>
                                                 </td>
                                                <td className="px-6 py-4">
                                                    <span className={`rounded-full px-2.5 py-0.5 text-[9px] font-black uppercase tracking-widest ${reg.type === "student" ? "bg-navy/10 text-navy" : "bg-lime/20 text-lime-dark"}`}>
                                                        {reg.type}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <p className="text-xs font-bold text-navy">{reg.squadLevel || "—"}</p>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <p className="text-xs font-medium text-muted-foreground">{reg.area || "General"}</p>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[9px] font-black uppercase tracking-widest ${reg.isActive ? "text-lime-dark" : "bg-destructive/10 text-destructive"}`}>
                                                        <span className={`h-1.5 w-1.5 rounded-full ${reg.isActive ? "bg-lime-dark" : "bg-destructive"}`} />
                                                        {reg.isActive ? "Active" : "Inactive"}
                                                    </span>
                                                </td>
                                                 <td className="px-6 py-4">
                                                     {status.isDue ? (
                                                         <span className="flex items-center gap-1 text-[9px] font-black uppercase tracking-tighter text-destructive animate-pulse">
                                                             <FileText className="h-3 w-3" /> Due
                                                         </span>
                                                     ) : status.label === "No Date Set" ? (
                                                         <span className="text-[9px] font-black uppercase tracking-tighter text-muted-foreground opacity-30">—</span>
                                                     ) : (
                                                         <span className="text-[9px] font-black uppercase tracking-tighter text-muted-foreground opacity-50">Paid</span>
                                                     )}
                                                 </td>
                                                <td className="px-6 py-4 text-center">
                                                    <button
                                                        onClick={() => setSelected(reg)}
                                                        className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-navy/5 text-navy hover:bg-navy hover:text-white transition-all active:scale-90"
                                                    >
                                                        <Eye className="h-4 w-4" />
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Registration Details Modal */}
            {selected && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-navy/20 p-4 backdrop-blur-md">
                    <div className="relative w-full max-w-5xl max-h-[90vh] overflow-hidden rounded-[3rem] border border-border bg-card shadow-2xl flex flex-col sm:flex-row">
                        <button
                            onClick={() => { setSelected(null); setIsEditing(false); }}
                            className="absolute right-6 top-6 z-10 rounded-full bg-white/80 p-2 text-navy hover:bg-destructive hover:text-white transition-all backdrop-blur-sm shadow-xl"
                        >
                            <X className="h-5 w-5" />
                        </button>

                        {/* Modal Header / Profile Info */}
                        <div className="w-full sm:w-80 shrink-0 bg-gradient-to-b from-muted/50 to-card p-8 flex flex-col items-center text-center border-b sm:border-b-0 sm:border-r border-border/50">
                            <div className="relative mb-6">
                                <div className="h-48 w-40 overflow-hidden rounded-[2.5rem] border-4 border-background shadow-2xl transition-transform hover:scale-105">
                                    {selected.photoUrl ? (
                                        <img src={selected.photoUrl} alt="" className="h-full w-full object-cover" />
                                    ) : (
                                        <div className="flex h-full w-full items-center justify-center bg-muted">
                                            <User className="h-12 w-12 text-muted-foreground/30" />
                                        </div>
                                    )}
                                </div>
                                <div className={`absolute -bottom-2 -right-2 h-10 w-10 flex items-center justify-center rounded-full border-2 border-background font-black text-white shadow-lg ${selected.type === "student" ? "bg-navy" : "bg-lime-dark"}`}>
                                    {selected.type === "student" ? "S" : "M"}
                                </div>
                            </div>

                            <h2 className="text-2xl font-black text-navy leading-tight">{selected.studentName}</h2>
                            <div className="mt-1 flex items-center gap-2">
                                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{selected.type} Enrollment</p>
                                {!selected.isActive && (
                                    <span className="rounded-full bg-destructive/10 px-2 py-0.5 text-[8px] font-black uppercase tracking-widest text-destructive">Deactivated</span>
                                )}
                            </div>

                            <div className="mt-8 w-full space-y-2">
                                {!isEditing ? (
                                    <>
                                        <button
                                            onClick={handleStartEdit}
                                            className="w-full flex h-10 items-center justify-center gap-2 rounded-xl bg-navy text-[10px] font-black uppercase tracking-widest text-white transition-all hover:bg-navy-dark shadow-lg shadow-navy/20"
                                        >
                                            <Edit2 className="h-3 w-3" /> Edit Profile
                                        </button>
                                        <button
                                            onClick={() => handleToggleStatus(selected)}
                                            className={`w-full flex h-10 items-center justify-center gap-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${selected.isActive
                                                ? "bg-destructive/10 text-destructive border border-destructive/20 hover:bg-destructive hover:text-white"
                                                : "bg-lime text-secondary-foreground hover:bg-lime/90"}`}
                                        >
                                            {selected.isActive ? <><UserMinus className="h-3 w-3" /> Deactivate</> : <><UserCheck className="h-3 w-3" /> Activate</>}
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <button
                                            onClick={handleSaveEdit}
                                            disabled={isUpdating}
                                            className="w-full flex h-10 items-center justify-center gap-2 rounded-xl bg-lime text-[10px] font-black uppercase tracking-widest text-secondary-foreground transition-all hover:bg-lime/90 shadow-lg disabled:opacity-50"
                                        >
                                            {isUpdating ? <Loader2 className="h-3 w-3 animate-spin" /> : <Save className="h-3 w-3" />} Save Changes
                                        </button>
                                        <button
                                            onClick={() => setIsEditing(false)}
                                            disabled={isUpdating}
                                            className="w-full flex h-10 items-center justify-center gap-2 rounded-xl bg-muted text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:bg-border transition-all disabled:opacity-50"
                                        >
                                            <X className="h-3 w-3" /> Cancel
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Modal Body / Scrollable Info */}
                        <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <DetailSection title="Personal Information">
                                    <DetailItem label="Full Name" value={isEditing ? editForm.studentName : selected.studentName} isEditing={isEditing} field="studentName" onChange={(val) => setEditForm(f => ({ ...f, studentName: val }))} />
                                    <DetailItem label="DOB" value={isEditing ? editForm.dob : selected.dob} type="date" isEditing={isEditing} field="dob" onChange={(val) => setEditForm(f => ({ ...f, dob: val }))} />
                                    <DetailItem label="Age" value={isEditing ? editForm.age : selected.age} isEditing={isEditing} field="age" onChange={(val) => setEditForm(f => ({ ...f, age: val }))} />
                                    <DetailItem label="Sex" value={isEditing ? editForm.sex : selected.sex} isEditing={isEditing} field="sex" onChange={(val) => setEditForm(f => ({ ...f, sex: val }))} />
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
                                        <div className="col-span-2 h-px bg-border/20 my-1" />
                                        <DetailItem label="Mother Name" value={isEditing ? editForm.motherName : selected.motherName} isEditing={isEditing} field="motherName" onChange={(val) => setEditForm(f => ({ ...f, motherName: val }))} />
                                        <DetailItem label="Mother Contact" value={isEditing ? editForm.motherContact : selected.motherContact} isEditing={isEditing} field="motherContact" onChange={(val) => setEditForm(f => ({ ...f, motherContact: val }))} />
                                        <DetailItem label="Mother Email" value={isEditing ? editForm.motherEmail : selected.motherEmail} isEditing={isEditing} field="motherEmail" onChange={(val) => setEditForm(f => ({ ...f, motherEmail: val }))} />
                                    </DetailSection>
                                )}

                                <DetailSection title="Academy Details">
                                    <DetailItem label="Squad/Level" value={isEditing ? editForm.squadLevel : selected.squadLevel} isEditing={isEditing} field="squadLevel" type="select" options={["Beginner", "Intermediate", "Advanced", "Elite"]} onChange={(val) => setEditForm(f => ({ ...f, squadLevel: val }))} />
                                    <DetailItem label="T-Shirt Size" value={isEditing ? editForm.tshirtSize : selected.tshirtSize} isEditing={isEditing} field="tshirtSize" type="select" options={["XS", "S", "M", "L", "XL", "XXL"]} onChange={(val) => setEditForm(f => ({ ...f, tshirtSize: val }))} />
                                    <DetailItem label="Fees Date" value={isEditing ? editForm.feesDate : selected.feesDate} type="date" isEditing={isEditing} field="feesDate" onChange={(val) => setEditForm(f => ({ ...f, feesDate: val }))} />
                                    <DetailItem label="Fees/Month" value={isEditing ? editForm.feesPerMonth : selected.feesPerMonth} isEditing={isEditing} field="feesPerMonth" onChange={(val) => setEditForm(f => ({ ...f, feesPerMonth: val }))} />
                                    <DetailItem label="Months Paid" value={isEditing ? (editForm.paidMonthsCount || 0).toString() : (selected.paidMonthsCount || 0).toString()} isEditing={isEditing} field="paidMonthsCount" onChange={(val) => setEditForm(f => ({ ...f, paidMonthsCount: parseInt(val) || 0 }))} />
                                    <DetailItem label="Enrollment Date" value={isEditing ? editForm.enrollmentDate : selected.enrollmentDate} type="date" isEditing={isEditing} field="enrollmentDate" onChange={(val) => setEditForm(f => ({ ...f, enrollmentDate: val }))} />
                                </DetailSection>

                                <DetailSection title="Fee Tracking">
                                    <div className="col-span-2 overflow-hidden rounded-2xl border border-border bg-card">
                                        <table className="w-full text-left">
                                            <thead className="bg-muted/50 border-b border-border">
                                                <tr className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                                                    <th className="px-4 py-3">Next Due Cycle</th>
                                                    <th className="px-4 py-3">Last Paid</th>
                                                    <th className="px-4 py-3">Total Paid</th>
                                                    <th className="px-4 py-3 text-right">Status</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-border/50 text-[11px] font-bold">
                                                <tr>
                                                    <td className="px-4 py-3 text-navy">
                                                        {getFeeStatus(selected).isDue ? new Date().toLocaleString('default', { month: 'long' }) : (selected.lastPaidMonth ? new Date(selected.lastPaidMonth + "-01").toLocaleString('default', { month: 'long', year: 'numeric' }) : "None")}
                                                    </td>
                                                    <td className="px-4 py-3 text-muted-foreground">
                                                        {selected.lastPaidMonth || "None"}
                                                    </td>
                                                    <td className="px-4 py-3 text-lime-dark">
                                                        {selected.paidMonthsCount || 0} Months
                                                    </td>
                                                    <td className="px-4 py-3 text-right">
                                                        <span className={`inline-block rounded-full px-2 py-0.5 text-[9px] font-black uppercase tracking-widest ${getFeeStatus(selected).isDue ? "bg-destructive/10 text-destructive animate-pulse" : "bg-lime/20 text-lime-dark"}`}>
                                                            {getFeeStatus(selected).label}
                                                        </span>
                                                    </td>
                                                </tr>
                                            </tbody>
                                        </table>
                                        <div className="p-4 bg-muted/20 border-t border-border flex items-center gap-4">
                                            <div className="w-1/3">
                                                <label className="text-[8px] font-black uppercase text-muted-foreground mb-1 block">Months</label>
                                                <select
                                                    value={monthsPaying}
                                                    onChange={(e) => setMonthsPaying(Number(e.target.value))}
                                                    className="h-9 w-full rounded-xl border border-border bg-white px-2 text-xs font-bold text-navy focus:outline-none"
                                                >
                                                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(m => (
                                                        <option key={m} value={m}>{m} Mo</option>
                                                    ))}
                                                </select>
                                            </div>
                                            <button
                                                onClick={() => handleMarkFeePaid(selected, monthsPaying)}
                                                className="flex-1 mt-4 h-9 flex items-center justify-center gap-2 rounded-xl bg-navy text-[10px] font-black uppercase tracking-widest text-white shadow-lg shadow-navy/10 hover:bg-navy-dark transition-all active:scale-95"
                                            >
                                                <CheckCircle className="h-4 w-4" />
                                                Quick Pay ({monthsPaying} Month{monthsPaying > 1 ? 's' : ''})
                                            </button>
                                        </div>
                                    </div>
                                </DetailSection>

                                <div className="md:col-span-2 space-y-6">
                                    <DetailSection title="Admin Remarks & Internal Notes">
                                        <div className="col-span-2">
                                            {isEditing ? (
                                                <textarea
                                                    value={editForm.remarks || ""}
                                                    onChange={(e) => setEditForm(f => ({ ...f, remarks: e.target.value }))}
                                                    placeholder="Add internal remarks/notes here..."
                                                    className="w-full min-h-[100px] rounded-2xl border border-border bg-muted/10 p-4 text-sm font-medium focus:ring-4 focus:ring-navy/5 focus:outline-none"
                                                />
                                            ) : (
                                                <div className="rounded-2xl bg-muted/10 p-4 min-h-[60px] border border-border/30">
                                                    <p className="text-sm font-medium leading-relaxed text-muted-foreground italic">
                                                        {selected.remarks || "No internal remarks added yet."}
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    </DetailSection>

                                    <DetailSection title="Purchase History & Shop Activity">
                                        <div className="col-span-2 grid grid-cols-1 md:grid-cols-3 gap-6">
                                            <div className="md:col-span-2 overflow-hidden rounded-2xl border border-border bg-muted/20">
                                                <div className="max-h-[250px] overflow-y-auto scrollbar-hide">
                                                    {isFetchingPurchases ? (
                                                        <div className="py-10 text-center"><Loader2 className="mx-auto h-5 w-5 animate-spin text-muted-foreground" /></div>
                                                    ) : purchases.length === 0 ? (
                                                        <div className="py-10 text-center text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-30">No shop activity</div>
                                                    ) : (
                                                        <table className="w-full text-left">
                                                            <thead className="sticky top-0 bg-white/80 backdrop-blur-md border-b border-border">
                                                                <tr className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">
                                                                    <th className="px-4 py-3">Date</th>
                                                                    <th className="px-4 py-3">Item</th>
                                                                    <th className="px-4 py-3">Qty</th>
                                                                    <th className="px-4 py-3 text-right">Price</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody className="divide-y divide-border/50 text-[11px]">
                                                                {purchases.map(p => (
                                                                    <tr key={p.id}>
                                                                        <td className="px-4 py-2.5 text-muted-foreground">{new Date(p.purchaseDate).toLocaleDateString()}</td>
                                                                        <td className="px-4 py-2.5 font-bold text-navy">{p.item}</td>
                                                                        <td className="px-4 py-2.5 font-black">{p.quantity}</td>
                                                                        <td className="px-4 py-2.5 text-right font-black">₹{p.totalPrice}</td>
                                                                    </tr>
                                                                ))}
                                                            </tbody>
                                                        </table>
                                                    )}
                                                </div>
                                            </div>
                                            <form onSubmit={handleAddPurchase} className="rounded-2xl border-2 border-dashed border-border p-4 space-y-3 flex flex-col justify-center">
                                                <h5 className="text-[9px] font-black uppercase tracking-widest text-navy text-center mb-1">New Purchase</h5>
                                                <input placeholder="Item (e.g. Shoes)" required className="h-9 w-full rounded-xl border border-border bg-white px-3 text-xs font-bold" value={purchaseForm.item} onChange={e => setPurchaseForm({ ...purchaseForm, item: e.target.value })} />
                                                <div className="grid grid-cols-2 gap-2">
                                                    <input type="number" placeholder="Qty" required className="h-9 w-full rounded-xl border border-border bg-white px-3 text-xs font-bold" value={purchaseForm.quantity} onChange={e => setPurchaseForm({ ...purchaseForm, quantity: e.target.value })} />
                                                    <input type="number" placeholder="Price" required className="h-9 w-full rounded-xl border border-border bg-white px-3 text-xs font-bold" value={purchaseForm.totalPrice} onChange={e => setPurchaseForm({ ...purchaseForm, totalPrice: e.target.value })} />
                                                </div>
                                                <input type="date" required className="h-9 w-full rounded-xl border border-border bg-white px-3 text-xs font-bold" value={purchaseForm.purchaseDate} onChange={e => setPurchaseForm({ ...purchaseForm, purchaseDate: e.target.value })} />
                                                <button type="submit" disabled={isSavingPurchase} className="h-9 w-full rounded-xl bg-navy text-white text-[9px] font-black uppercase tracking-widest hover:bg-navy-dark shadow-lg shadow-navy/10">
                                                    {isSavingPurchase ? <Loader2 className="h-3 w-3 animate-spin mx-auto" /> : "Add Record"}
                                                </button>
                                            </form>
                                        </div>
                                    </DetailSection>

                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {showResetModal && (
                <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
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
                <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
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

            {showManageCoachesModal && (
                <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
                    <div className="w-full max-w-2xl overflow-hidden rounded-3xl border border-border bg-card shadow-2xl">
                        <div className="bg-navy p-6 text-white flex justify-between items-center">
                            <div>
                                <h2 className="text-xl font-black uppercase tracking-widest">Manage Coaches</h2>
                                <p className="text-[10px] text-white/50 font-bold uppercase tracking-tight">Active Team Members & Access Control</p>
                            </div>
                            <button onClick={() => { setShowManageCoachesModal(false); setEditingUser(null); }} className="rounded-full bg-white/10 p-2 hover:bg-white/20 transition-colors">
                                <X className="h-5 w-5" />
                            </button>
                        </div>
                        <div className="p-6">
                            {editingUser ? (
                                <form onSubmit={handleUpdateUserInfo} className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1.5 px-1">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Full Name</label>
                                            <input
                                                type="text"
                                                value={editingUser.name}
                                                onChange={(e) => setEditingUser({ ...editingUser, name: e.target.value })}
                                                className="h-10 w-full rounded-xl border border-border bg-muted/30 px-4 text-xs font-bold focus:border-navy focus:outline-none"
                                                required
                                            />
                                        </div>
                                        <div className="space-y-1.5 px-1">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Phone Number</label>
                                            <input
                                                type="tel"
                                                value={editingUser.phone}
                                                onChange={(e) => setEditingUser({ ...editingUser, phone: e.target.value })}
                                                className="h-10 w-full rounded-xl border border-border bg-muted/30 px-4 text-xs font-bold focus:border-navy focus:outline-none"
                                                required
                                            />
                                        </div>
                                        <div className="space-y-1.5 px-1">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">New Password (Optional)</label>
                                            <input
                                                type="password"
                                                placeholder="Leave blank to keep current"
                                                onChange={(e) => setEditingUser({ ...editingUser, password: e.target.value })}
                                                className="h-10 w-full rounded-xl border border-border bg-muted/30 px-4 text-xs font-bold focus:border-navy focus:outline-none"
                                            />
                                        </div>
                                        <div className="space-y-1.5 px-1">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Role</label>
                                            <select
                                                value={editingUser.role}
                                                onChange={(e) => setEditingUser({ ...editingUser, role: e.target.value })}
                                                className="h-10 w-full rounded-xl border border-border bg-muted/30 px-4 text-xs font-bold focus:border-navy focus:outline-none"
                                            >
                                                <option value="coach">Coach</option>
                                                <option value="admin">Admin</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div className="flex gap-2 pt-2">
                                        <button type="submit" className="flex-1 rounded-xl bg-navy py-3 text-xs font-black uppercase tracking-widest text-white hover:bg-navy-dark shadow-lg shadow-navy/20">
                                            Save Updates
                                        </button>
                                        <button type="button" onClick={() => setEditingUser(null)} className="flex-1 rounded-xl bg-muted py-3 text-xs font-black uppercase tracking-widest text-muted-foreground hover:bg-border transition-colors">
                                            Cancel
                                        </button>
                                    </div>
                                </form>
                            ) : (
                                <div className="max-h-[400px] overflow-y-auto space-y-2 pr-2 scrollbar-hide">
                                    {allUsers.filter(u => u.phone !== user?.phone).length === 0 ? (
                                        <div className="text-center py-10">
                                            <Users className="h-12 w-12 text-muted-foreground opacity-20 mx-auto mb-2" />
                                            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">No other coaches found</p>
                                        </div>
                                    ) : (
                                        allUsers.filter(u => u.phone !== user?.phone).map(u => (
                                            <div key={u.id} className="group flex items-center justify-between rounded-2xl border border-border bg-muted/20 p-4 transition-all hover:bg-card hover:shadow-md">
                                                <div className="flex items-center gap-4">
                                                    <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-navy/10 text-navy uppercase font-black">
                                                        {u.name.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <h4 className="text-sm font-black text-navy">{u.name}</h4>
                                                        <div className="flex items-center gap-2">
                                                            <p className="text-[10px] font-bold text-muted-foreground">{u.phone}</p>
                                                            <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-full ${u.role === 'admin' ? 'bg-navy text-white' : 'bg-lime text-navy'}`}>
                                                                {u.role}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button
                                                        onClick={() => setEditingUser(u)}
                                                        className="p-2 rounded-lg bg-navy/5 text-navy hover:bg-navy hover:text-white transition-all"
                                                        title="Edit Coach"
                                                    >
                                                        <Edit2 className="h-4 w-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteUser(u.id)}
                                                        className="p-2 rounded-lg bg-destructive/5 text-destructive hover:bg-destructive hover:text-white transition-all"
                                                        title="Delete Coach"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Add Guest Modal */}
            {showGuestModal && (
                <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="w-full max-w-md rounded-[2rem] border border-border bg-card p-8 shadow-2xl">
                        <h2 className="mb-6 text-xl font-black uppercase tracking-widest text-navy">Add New Guest</h2>
                        <form onSubmit={handleAddGuest} className="space-y-4">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Name <span className="text-destructive">*</span></label>
                                <input
                                    type="text"
                                    placeholder="Guest Name"
                                    required
                                    value={guestForm.name}
                                    onChange={e => setGuestForm({ ...guestForm, name: e.target.value })}
                                    className="h-12 w-full rounded-2xl border border-border bg-muted/30 px-4 text-sm font-bold focus:border-navy focus:outline-none"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Data</label>
                                <input
                                    type="text"
                                    placeholder="Additional data/notes"
                                    value={guestForm.data}
                                    onChange={e => setGuestForm({ ...guestForm, data: e.target.value })}
                                    className="h-12 w-full rounded-2xl border border-border bg-muted/30 px-4 text-sm font-bold focus:border-navy focus:outline-none"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Court Number</label>
                                <input
                                    type="text"
                                    placeholder="Court number assigned"
                                    value={guestForm.courtNumber}
                                    onChange={e => setGuestForm({ ...guestForm, courtNumber: e.target.value })}
                                    className="h-12 w-full rounded-2xl border border-border bg-muted/30 px-4 text-sm font-bold focus:border-navy focus:outline-none"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Payment Details</label>
                                <input
                                    type="text"
                                    placeholder="Payment information"
                                    value={guestForm.paymentDetails}
                                    onChange={e => setGuestForm({ ...guestForm, paymentDetails: e.target.value })}
                                    className="h-12 w-full rounded-2xl border border-border bg-muted/30 px-4 text-sm font-bold focus:border-navy focus:outline-none"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Visit Time</label>
                                <input
                                    type="datetime-local"
                                    placeholder="Visit time"
                                    value={guestForm.visitTime}
                                    onChange={e => setGuestForm({ ...guestForm, visitTime: e.target.value })}
                                    className="h-12 w-full rounded-2xl border border-border bg-muted/30 px-4 text-sm font-bold focus:border-navy focus:outline-none"
                                />
                            </div>
                            <div className="flex gap-2 pt-2">
                                <button
                                    type="submit"
                                    disabled={isSavingGuest}
                                    className="flex-1 rounded-xl bg-navy py-3 text-xs font-black uppercase tracking-widest text-white hover:bg-navy-dark shadow-lg shadow-navy/20 disabled:opacity-50"
                                >
                                    {isSavingGuest ? <Loader2 className="h-4 w-4 animate-spin mx-auto" /> : "Add Guest"}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => { setShowGuestModal(false); setGuestForm({ name: "", data: "", courtNumber: "", paymentDetails: "", visitTime: "" }); }}
                                    disabled={isSavingGuest}
                                    className="flex-1 rounded-xl bg-muted py-3 text-xs font-black uppercase tracking-widest text-muted-foreground hover:bg-border transition-colors disabled:opacity-50"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Manage Guests Modal */}
            {showManageGuestsModal && (
                <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
                    <div className="w-full max-w-4xl overflow-hidden rounded-3xl border border-border bg-card shadow-2xl">
                        <div className="bg-gradient-to-r from-navy to-navy-dark p-6 text-white flex justify-between items-center">
                            <div>
                                <h2 className="text-xl font-black uppercase tracking-widest">Manage Guests</h2>
                                <p className="text-[10px] text-white/50 font-bold uppercase tracking-tight">Guest Records & Court Assignments</p>
                            </div>
                            <button
                                onClick={() => { setShowManageGuestsModal(false); setEditingGuest(null); }}
                                className="rounded-full bg-white/10 p-2 hover:bg-white/20 transition-colors"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>
                        <div className="p-6">
                            {editingGuest ? (
                                <form onSubmit={handleUpdateGuest} className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1.5 px-1">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Name <span className="text-destructive">*</span></label>
                                            <input
                                                type="text"
                                                value={editingGuest.name}
                                                onChange={(e) => setEditingGuest({ ...editingGuest, name: e.target.value })}
                                                className="h-10 w-full rounded-xl border border-border bg-muted/30 px-4 text-xs font-bold focus:border-navy focus:outline-none"
                                                required
                                            />
                                        </div>
                                        <div className="space-y-1.5 px-1">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Court Number</label>
                                            <input
                                                type="text"
                                                value={editingGuest.courtNumber || ""}
                                                onChange={(e) => setEditingGuest({ ...editingGuest, courtNumber: e.target.value })}
                                                className="h-10 w-full rounded-xl border border-border bg-muted/30 px-4 text-xs font-bold focus:border-navy focus:outline-none"
                                            />
                                        </div>
                                        <div className="space-y-1.5 px-1">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Payment Details</label>
                                            <input
                                                type="text"
                                                value={editingGuest.paymentDetails || ""}
                                                onChange={(e) => setEditingGuest({ ...editingGuest, paymentDetails: e.target.value })}
                                                className="h-10 w-full rounded-xl border border-border bg-muted/30 px-4 text-xs font-bold focus:border-navy focus:outline-none"
                                            />
                                        </div>
                                        <div className="space-y-1.5 px-1">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Visit Time</label>
                                            <input
                                                type="datetime-local"
                                                value={editingGuest.visitTime ? editingGuest.visitTime.slice(0, 16) : ""}
                                                onChange={(e) => setEditingGuest({ ...editingGuest, visitTime: e.target.value })}
                                                className="h-10 w-full rounded-xl border border-border bg-muted/30 px-4 text-xs font-bold focus:border-navy focus:outline-none"
                                            />
                                        </div>
                                        <div className="col-span-2 space-y-1.5 px-1">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Data / Notes</label>
                                            <textarea
                                                value={editingGuest.data || ""}
                                                onChange={(e) => setEditingGuest({ ...editingGuest, data: e.target.value })}
                                                className="h-20 w-full rounded-xl border border-border bg-muted/30 px-4 py-2 text-xs font-bold focus:border-navy focus:outline-none resize-none"
                                            />
                                        </div>
                                    </div>
                                    <div className="flex gap-2 pt-2">
                                        <button
                                            type="submit"
                                            disabled={isSavingGuest}
                                            className="flex-1 rounded-xl bg-navy py-3 text-xs font-black uppercase tracking-widest text-white hover:bg-navy-dark shadow-lg shadow-navy/20 disabled:opacity-50"
                                        >
                                            {isSavingGuest ? <Loader2 className="h-4 w-4 animate-spin mx-auto" /> : "Save Updates"}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setEditingGuest(null)}
                                            disabled={isSavingGuest}
                                            className="flex-1 rounded-xl bg-muted py-3 text-xs font-black uppercase tracking-widest text-muted-foreground hover:bg-border transition-colors disabled:opacity-50"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </form>
                            ) : (
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <div className="h-8 w-8 flex items-center justify-center rounded-lg bg-lime/10 text-lime-dark">
                                                <UserPlus className="h-4 w-4" />
                                            </div>
                                            <span className="text-xs font-black uppercase tracking-widest text-navy">Total Guests: {guests.length}</span>
                                        </div>
                                        <button
                                            onClick={() => { setShowManageGuestsModal(false); setShowGuestModal(true); }}
                                            className="flex items-center gap-2 rounded-lg bg-lime px-4 py-2 text-xs font-black uppercase tracking-widest text-secondary-foreground hover:bg-lime/90 transition-all shadow-md"
                                        >
                                            <Plus className="h-4 w-4" /> Add New
                                        </button>
                                    </div>
                                    <div className="max-h-[500px] overflow-y-auto space-y-2 pr-2 scrollbar-hide rounded-xl">
                                        {guests.length === 0 ? (
                                            <div className="text-center py-10">
                                                <User className="h-12 w-12 text-muted-foreground opacity-20 mx-auto mb-2" />
                                                <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">No guests found</p>
                                            </div>
                                        ) : (
                                            guests.map(guest => (
                                                <div key={guest.id} className="group flex items-center justify-between rounded-2xl border border-border bg-muted/20 p-4 transition-all hover:bg-card hover:shadow-md">
                                                    <div className="flex items-center gap-4">
                                                        <div className="h-12 w-12 flex items-center justify-center rounded-xl bg-gradient-to-br from-lime to-lime-dark text-white uppercase font-black text-lg">
                                                            {guest.name.charAt(0).toUpperCase()}
                                                        </div>
                                                        <div>
                                                            <h4 className="text-sm font-black text-navy">{guest.name}</h4>
                                                            <div className="flex flex-wrap items-center gap-2 mt-1">
                                                                {guest.courtNumber && (
                                                                    <span className="flex items-center gap-1 text-[9px] font-bold text-muted-foreground bg-navy/5 px-2 py-0.5 rounded-full">
                                                                        <Hash className="h-3 w-3" /> {guest.courtNumber}
                                                                    </span>
                                                                )}
                                                                {guest.visitTime && (
                                                                    <span className="flex items-center gap-1 text-[9px] font-bold text-navy bg-navy/5 px-2 py-0.5 rounded-full">
                                                                        <Calendar className="h-3 w-3" /> {new Date(guest.visitTime).toLocaleString()}
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <p className="text-[9px] font-medium text-muted-foreground mt-1 flex items-center gap-1">
                                                                <Calendar className="h-3 w-3" /> Added {new Date(guest.createdAt).toLocaleDateString()}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <button
                                                            onClick={() => setEditingGuest(guest)}
                                                            className="p-2 rounded-lg bg-navy/5 text-navy hover:bg-navy hover:text-white transition-all"
                                                            title="Edit Guest"
                                                        >
                                                            <Edit2 className="h-4 w-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteGuest(guest.id)}
                                                            className="p-2 rounded-lg bg-destructive/5 text-destructive hover:bg-destructive hover:text-white transition-all"
                                                            title="Delete Guest"
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </button>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
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
