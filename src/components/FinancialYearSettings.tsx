import { useState, useEffect } from "react";
import { Calendar, Settings, ChevronDown, CheckCircle2, AlertCircle, History } from "lucide-react";
import { toast } from "sonner";
import { getCurrentFinancialYear, generateFinancialYearOptions, formatFinancialYearLabel, isCurrentFinancialYearStarted } from "../lib/financialYear";

interface FinancialYearSettingsProps {
    adminPhone: string | null;
    isAdmin: boolean;
    onYearChange: (year: string) => void;
}

export default function FinancialYearSettings({ adminPhone, isAdmin, onYearChange }: FinancialYearSettingsProps) {
    const [activeYear, setActiveYear] = useState<string>("");
    const [selectedYear, setSelectedYear] = useState<string>("");
    const [isLoading, setIsLoading] = useState(true);
    const [isChanging, setIsChanging] = useState(false);
    const [showDropdown, setShowDropdown] = useState(false);
    const [shouldClearData, setShouldClearData] = useState(false);

    const currentYear = getCurrentFinancialYear();
    const isAfterAprilFirst = isCurrentFinancialYearStarted();
    const yearOptions = generateFinancialYearOptions(2020, 2030);

    useEffect(() => {
        fetchActiveYear();
    }, []);

    const fetchActiveYear = async () => {
        try {
            const res = await fetch("/api/financial-year?active=true");
            if (res.ok) {
                const data = await res.json();
                setActiveYear(data.fiscalYear);
                setSelectedYear(data.fiscalYear);
            }
        } catch (error) {
            console.error("Failed to fetch active financial year:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleYearChange = async (year: string) => {
        if (!isAdmin || !adminPhone) {
            toast.error("Admin access required to change financial year");
            return;
        }

        if (year === activeYear) return;

        const isSwitchingToCurrent = year === currentYear;
        const willClearData = isSwitchingToCurrent && isAfterAprilFirst;

        if (willClearData) {
            const confirmed = confirm(
                `Switching to current financial year (${year}) will initialize the data view as empty for new entries.\n\nThis ensures a clean slate for the new financial year. Continue?`
            );
            if (!confirmed) return;
        }

        const isHistorical = year !== currentYear;
        if (isHistorical) {
            const confirmed = confirm(
                `You are selecting a historical financial year (${year}).\n\nYou will view archived data from this period. Continue?`
            );
            if (!confirmed) return;
        }

        setIsChanging(true);
        setShouldClearData(willClearData);

        try {
            const res = await fetch("/api/financial-year", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ fiscalYear: year, adminPhone }),
            });

            const data = await res.json();

            if (res.ok) {
                setActiveYear(year);
                setSelectedYear(year);
                onYearChange(year);
                toast.success(data.message || `Financial year changed to ${year}`);
            } else {
                toast.error(data.error || "Failed to change financial year");
            }
        } catch (error) {
            console.error("Failed to change financial year:", error);
            toast.error("Failed to change financial year");
        } finally {
            setIsChanging(false);
            setShowDropdown(false);
            setShouldClearData(false);
        }
    };

    if (!isAdmin) return null;

    return (
        <div className="relative">
            <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 rounded-xl bg-muted/50 px-4 py-2 border border-border">
                    <Calendar className="h-4 w-4 text-navy" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Financial Year:</span>
                </div>
                
                <button
                    onClick={() => setShowDropdown(!showDropdown)}
                    disabled={isChanging}
                    className="flex items-center gap-2 rounded-xl bg-navy px-4 py-2 text-white hover:bg-navy-dark transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-navy/20"
                >
                    {isLoading ? (
                        <span className="text-xs font-black uppercase tracking-widest">Loading...</span>
                    ) : (
                        <>
                            <span className="text-xs font-black uppercase tracking-widest">{selectedYear || currentYear}</span>
                            <ChevronDown className={`h-4 w-4 transition-transform ${showDropdown ? "rotate-180" : ""}`} />
                        </>
                    )}
                </button>

                {activeYear === currentYear && isAfterAprilFirst && (
                    <div className="flex items-center gap-1.5 rounded-lg bg-lime/10 px-3 py-1.5 border border-lime/20">
                        <CheckCircle2 className="h-3.5 w-3.5 text-lime-dark" />
                        <span className="text-[9px] font-black uppercase tracking-wider text-lime-dark">Current Active</span>
                    </div>
                )}

                {activeYear !== currentYear && (
                    <div className="flex items-center gap-1.5 rounded-lg bg-muted/50 px-3 py-1.5 border border-border">
                        <History className="h-3.5 w-3.5 text-muted-foreground" />
                        <span className="text-[9px] font-black uppercase tracking-wider text-muted-foreground">Historical View</span>
                    </div>
                )}
            </div>

            {showDropdown && (
                <>
                    <div className="fixed inset-0 z-40" onClick={() => setShowDropdown(false)} />
                    <div className="absolute top-full right-0 mt-2 z-50 min-w-[280px] rounded-2xl border border-border bg-card shadow-2xl overflow-hidden">
                        <div className="px-4 py-3 bg-muted/50 border-b border-border">
                            <div className="flex items-center gap-2">
                                <Settings className="h-4 w-4 text-navy" />
                                <h3 className="text-[10px] font-black uppercase tracking-widest text-navy">Select Financial Year</h3>
                            </div>
                            <p className="mt-1 text-[9px] text-muted-foreground leading-relaxed">
                                Financial years run from April 1st to March 31st
                            </p>
                        </div>

                        <div className="max-h-[400px] overflow-y-auto py-2">
                            {yearOptions.map((year) => {
                                const isActive = year === activeYear;
                                const IsCurrent = year === currentYear;
                                const isHistorical = !IsCurrent;
                                const isFuture = new Date(year.split('-')[1] + '-03-31') < new Date();

                                if (isFuture) return null;

                                return (
                                    <button
                                        key={year}
                                        onClick={() => handleYearChange(year)}
                                        disabled={isChanging || year === activeYear}
                                        className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-muted/50 transition-colors disabled:opacity-50 disabled:cursor-default"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={`flex items-center justify-center h-8 w-8 rounded-lg ${isActive ? "bg-navy text-white" : "bg-muted/50 text-muted-foreground"}`}>
                                                {isActive ? (
                                                    <CheckCircle2 className="h-4 w-4" />
                                                ) : (
                                                    <Calendar className="h-4 w-4" />
                                                )}
                                            </div>
                                            <div>
                                                <p className={`text-xs font-black uppercase tracking-widest ${isActive ? "text-navy" : "text-foreground"}`}>
                                                    {year}
                                                </p>
                                                <p className="text-[9px] text-muted-foreground">
                                                    {formatFinancialYearLabel(year)}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            {IsCurrent && (
                                                <span className="rounded-full bg-lime/10 px-2 py-0.5 text-[8px] font-black uppercase tracking-wider text-lime-dark border border-lime/20">
                                                    Current
                                                </span>
                                            )}
                                            {isHistorical && (
                                                <span className="rounded-full bg-muted px-2 py-0.5 text-[8px] font-black uppercase tracking-wider text-muted-foreground border border-border">
                                                    Archive
                                                </span>
                                            )}
                                        </div>
                                    </button>
                                );
                            })}
                        </div>

                        <div className="px-4 py-3 bg-muted/30 border-t border-border">
                            <div className="flex items-start gap-2">
                                <AlertCircle className="h-4 w-4 text-navy shrink-0 mt-0.5" />
                                <p className="text-[9px] text-muted-foreground leading-relaxed">
                                    {isAfterAprilFirst
                                        ? `Switching to ${currentYear} after April 1st will initialize an empty data view for new entries.`
                                        : `Select a previous year to view historical data. The current year (${currentYear}) will activate on April 1st.`}
                                </p>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
