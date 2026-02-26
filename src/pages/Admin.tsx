import { useState, useEffect } from "react";
import { CheckCircle, User, Users, Briefcase, FileText, Download, Eye, ExternalLink, LogOut, Lock, Phone } from "lucide-react";
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
    createdAt: string;
}

export default function AdminPortal() {
    const [registrations, setRegistrations] = useState<Registration[]>([]);
    const [loading, setLoading] = useState(true);
    const [selected, setSelected] = useState<Registration | null>(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loginData, setLoginData] = useState({ phone: "", password: "" });

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

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        if (loginData.phone === "93631 41888" && loginData.password === "Admin@2025$") {
            setIsAuthenticated(true);
            localStorage.setItem("adminAuth", "true");
            toast.success("Welcome back, Admin!");
        } else {
            toast.error("Invalid credentials. Please try again.");
        }
    };

    const handleLogout = () => {
        setIsAuthenticated(false);
        localStorage.removeItem("adminAuth");
        toast.info("Logged out successfully");
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
                            <p className="text-xl font-black text-navy">{registrations.length}</p>
                        </div>
                        <div className="h-8 w-px bg-border/60" />
                        <div className="text-center">
                            <p className="text-[10px] font-bold uppercase text-muted-foreground tracking-tighter">Students</p>
                            <p className="text-xl font-black text-navy">
                                {registrations.filter((r) => r.type === "student").length}
                            </p>
                        </div>
                        <div className="h-8 w-px bg-border/60" />
                        <div className="text-center">
                            <p className="text-[10px] font-bold uppercase text-muted-foreground tracking-tighter">Members</p>
                            <p className="text-xl font-black text-lime-dark">
                                {registrations.filter((r) => r.type === "member").length}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* List */}
                    <div className="lg:col-span-2 space-y-3">
                        {registrations.length === 0 ? (
                            <div className="flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-border bg-card/50 p-20 text-center">
                                <Users className="mb-4 h-12 w-12 text-muted-foreground opacity-20" />
                                <h3 className="text-xl font-bold text-navy">No registrations yet</h3>
                                <p className="text-sm text-muted-foreground">New entries will appear here as they come in.</p>
                            </div>
                        ) : (
                            registrations.map((reg) => (
                                <div
                                    key={reg.id}
                                    onClick={() => setSelected(reg)}
                                    className={`group relative overflow-hidden rounded-2xl border bg-card p-5 transition-all hover:scale-[1.01] hover:shadow-lg ${selected?.id === reg.id ? "border-navy ring-4 ring-navy/5 shadow-md" : "border-border shadow-sm"
                                        }`}
                                >
                                    <div className="flex items-center gap-5">
                                        <div className="h-16 w-16 overflow-hidden rounded-2xl bg-muted ring-2 ring-background shadow-inner">
                                            {reg.photoUrl ? (
                                                <img src={reg.photoUrl} alt="" className="h-full w-full object-cover" />
                                            ) : (
                                                <div className="flex h-full w-full items-center justify-center">
                                                    <User className="text-muted-foreground h-6 w-6" />
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3">
                                                <h3 className="text-lg font-bold text-navy leading-tight">{reg.studentName}</h3>
                                                <span className={`rounded-full px-2.5 py-0.5 text-[9px] font-black uppercase tracking-widest ${reg.type === "student" ? "bg-navy/10 text-navy" : "bg-lime/20 text-lime-dark"
                                                    }`}>
                                                    {reg.type}
                                                </span>
                                            </div>
                                            <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
                                                <span className="flex items-center gap-1 font-medium"><CheckCircle className="h-3 w-3 text-lime-dark" /> {reg.area || "General"}</span>
                                                <span className="h-1 w-1 rounded-full bg-border" />
                                                <span>Joined {new Date(reg.createdAt).toLocaleDateString()}</span>
                                            </div>
                                        </div>
                                        <div className="text-right">
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
                            ))
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
                                    <p className="mt-1 text-xs font-bold uppercase tracking-widest text-muted-foreground">{selected.type} Enrollment</p>
                                </div>

                                <div className="flex-1 overflow-y-auto p-8 space-y-8 scrollbar-hide">
                                    <DetailSection title="Personal Information">
                                        <DetailItem label="DOB" value={selected.dob} />
                                        <DetailItem label="Age" value={selected.age} />
                                        <DetailItem label="Sex" value={selected.sex} />
                                        <DetailItem label="Nationality" value={selected.nationality} />
                                        <DetailItem label="Area" value={selected.area} />
                                        <DetailItem label={selected.type === "student" ? "School" : "Occupation"} value={selected.type === "student" ? selected.schoolName : selected.occupation} />
                                    </DetailSection>

                                    {selected.type === "student" && (
                                        <DetailSection title="Parental Information">
                                            <DetailItem label="Father Name" value={selected.fatherName} />
                                            <DetailItem label="Father Contact" value={selected.fatherContact} />
                                            <DetailItem label="Father Email" value={selected.fatherEmail} />
                                            <div className="col-span-2 h-px bg-border/30 my-1" />
                                            <DetailItem label="Mother Name" value={selected.motherName} />
                                            <DetailItem label="Mother Contact" value={selected.motherContact} />
                                            <DetailItem label="Mother Email" value={selected.motherEmail} />
                                        </DetailSection>
                                    )}

                                    <DetailSection title="Academy Details">
                                        <DetailItem label="Squad/Level" value={selected.squadLevel} />
                                        <DetailItem label="T-Shirt Size" value={selected.tshirtSize} />
                                        <DetailItem label="Sessions/Month" value={selected.sessionsPerMonth} />
                                        <DetailItem label="Fees/Month" value={selected.feesPerMonth ? `₹${selected.feesPerMonth}` : null} />
                                        <DetailItem label="Enrollment Date" value={selected.enrollmentDate} />
                                        <DetailItem label="Registration Link" value={selected.regNo} />
                                    </DetailSection>

                                    <DetailSection title="Declaration">
                                        <DetailItem label="Signed By" value={selected.studentSignature} />
                                        <DetailItem label="Date" value={selected.declarationDate} />
                                        <DetailItem label="Proof Type" value={selected.proofType} />
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

function DetailItem({ label, value }: { label: string; value: string | null | undefined }) {
    return (
        <div>
            <p className="text-[10px] text-muted-foreground">{label}</p>
            <p className="text-xs font-bold text-navy truncate">{value || "—"}</p>
        </div>
    );
}
