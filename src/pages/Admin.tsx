import { useState, useEffect } from "react";
import { CheckCircle, User, Users, Briefcase, FileText, Download, Eye, ExternalLink } from "lucide-react";

interface Registration {
    id: number;
    type: string;
    studentName: string;
    dob: string;
    age: string;
    sex: string;
    area: string;
    fatherName: string;
    fatherContact: string;
    motherName: string;
    motherContact: string;
    squadLevel: string;
    photoUrl: string;
    proofUrl: string;
    createdAt: string;
}

export default function AdminPortal() {
    const [registrations, setRegistrations] = useState<Registration[]>([]);
    const [loading, setLoading] = useState(true);
    const [selected, setSelected] = useState<Registration | null>(null);

    useEffect(() => {
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
    }, []);

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-navy border-t-transparent" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-muted/30 p-4 sm:p-8">
            <div className="mx-auto max-w-7xl">
                <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-navy">Admin Portal</h1>
                        <p className="text-muted-foreground">Manage academy registrations and memberships</p>
                    </div>
                    <div className="flex items-center gap-4 bg-card px-4 py-2 rounded-xl border border-border">
                        <div className="text-center">
                            <p className="text-xs font-semibold uppercase text-muted-foreground">Total</p>
                            <p className="text-xl font-bold">{registrations.length}</p>
                        </div>
                        <div className="h-8 w-px bg-border" />
                        <div className="text-center">
                            <p className="text-xs font-semibold uppercase text-muted-foreground">Students</p>
                            <p className="text-xl font-bold text-navy">
                                {registrations.filter((r) => r.type === "student").length}
                            </p>
                        </div>
                        <div className="h-8 w-px bg-border" />
                        <div className="text-center">
                            <p className="text-xs font-semibold uppercase text-muted-foreground">Members</p>
                            <p className="text-xl font-bold text-lime-dark">
                                {registrations.filter((r) => r.type === "member").length}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* List */}
                    <div className="lg:col-span-2 space-y-4">
                        {registrations.map((reg) => (
                            <div
                                key={reg.id}
                                onClick={() => setSelected(reg)}
                                className={`cursor-pointer rounded-2xl border bg-card p-4 transition-all hover:shadow-md ${selected?.id === reg.id ? "border-navy ring-2 ring-navy/10" : "border-border"
                                    }`}
                            >
                                <div className="flex items-center gap-4">
                                    <div className="h-14 w-14 overflow-hidden rounded-xl bg-muted">
                                        {reg.photoUrl ? (
                                            <img src={reg.photoUrl} alt="" className="h-full w-full object-cover" />
                                        ) : (
                                            <div className="flex h-full w-full items-center justify-center">
                                                <User className="text-muted-foreground" />
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                            <h3 className="font-bold text-navy">{reg.studentName}</h3>
                                            <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${reg.type === "student" ? "bg-navy/10 text-navy" : "bg-lime/20 text-lime-dark"
                                                }`}>
                                                {reg.type}
                                            </span>
                                        </div>
                                        <p className="text-xs text-muted-foreground">{reg.area || "No area specified"}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs font-bold text-navy uppercase">{reg.squadLevel || "N/A"}</p>
                                        <p className="text-[10px] text-muted-foreground">
                                            {new Date(reg.createdAt).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Details */}
                    <div className="lg:col-span-1">
                        {selected ? (
                            <div className="sticky top-8 rounded-2xl border border-border bg-card p-6 shadow-sm overflow-hidden">
                                <div className="mb-6 flex flex-col items-center text-center">
                                    <div className="mb-4 h-32 w-28 overflow-hidden rounded-2xl border-4 border-background shadow-lg">
                                        {selected.photoUrl ? (
                                            <img src={selected.photoUrl} alt="" className="h-full w-full object-cover" />
                                        ) : (
                                            <div className="flex h-full w-full items-center justify-center bg-muted">
                                                <User className="h-10 w-10 text-muted-foreground" />
                                            </div>
                                        )}
                                    </div>
                                    <h2 className="text-xl font-bold text-navy">{selected.studentName}</h2>
                                    <p className="text-sm text-muted-foreground capitalize">{selected.type} Enrollment</p>
                                </div>

                                <div className="space-y-6">
                                    <DetailSection title="Personal Info">
                                        <DetailItem label="DOB" value={selected.dob} />
                                        <DetailItem label="Age" value={selected.age} />
                                        <DetailItem label="Sex" value={selected.sex} />
                                        <DetailItem label="Area" value={selected.area} />
                                    </DetailSection>

                                    {selected.type === "student" && (
                                        <DetailSection title="Parental Info">
                                            <DetailItem label="Father" value={selected.fatherName} />
                                            <DetailItem label="F. Contact" value={selected.fatherContact} />
                                            <DetailItem label="Mother" value={selected.motherName} />
                                            <DetailItem label="M. Contact" value={selected.motherContact} />
                                        </DetailSection>
                                    )}

                                    <DetailSection title="Documents">
                                        <div className="flex gap-2 mt-2">
                                            {selected.photoUrl && (
                                                <a href={selected.photoUrl} target="_blank" rel="noreferrer" className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-muted py-2 text-xs font-semibold hover:bg-muted/80">
                                                    <Eye className="h-3 w-3" /> Photo
                                                </a>
                                            )}
                                            {selected.proofUrl && (
                                                <a href={selected.proofUrl} target="_blank" rel="noreferrer" className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-navy text-primary-foreground py-2 text-xs font-semibold hover:opacity-90">
                                                    <Eye className="h-3 w-3" /> ID Proof
                                                </a>
                                            )}
                                        </div>
                                    </DetailSection>
                                </div>
                            </div>
                        ) : (
                            <div className="flex h-64 flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border bg-card/50 text-center p-6">
                                <User className="mb-2 h-8 w-8 text-muted-foreground opacity-20" />
                                <p className="text-sm text-muted-foreground">Select a registration to view full details</p>
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
