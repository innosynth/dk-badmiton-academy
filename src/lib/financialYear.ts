export interface FinancialYear {
    fiscalYear: string;
    startDate: Date;
    endDate: Date;
}

export interface FinancialYearSetting {
    id: number;
    fiscalYear: string;
    startDate: string;
    endDate: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

export function getFinancialYearFromDate(date: Date): string {
    const month = date.getMonth();
    const year = date.getFullYear();
    if (month >= 3) {
        return `${year}-${year + 1}`;
    }
    return `${year - 1}-${year}`;
}

export function getFinancialYearForDate(dateStr: string | null): string | null {
    if (!dateStr) return null;
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return null;
    return getFinancialYearFromDate(date);
}

export function getFinancialYearDates(fiscalYear: string): FinancialYear {
    const [startYearStr, endYearStr] = fiscalYear.split('-');
    const startYear = parseInt(startYearStr, 10);
    const endYear = parseInt(endYearStr, 10);

    const startDate = new Date(startYear, 3, 1);
    const endDate = new Date(endYear, 2, 31);

    return {
        fiscalYear,
        startDate,
        endDate,
    };
}

export function isDateInFinancialYear(date: Date, fiscalYear: string): boolean {
    const { startDate, endDate } = getFinancialYearDates(fiscalYear);
    return date >= startDate && date <= endDate;
}

export function getCurrentFinancialYear(): string {
    return getFinancialYearFromDate(new Date());
}

export function generateFinancialYearOptions(startYear: number = 2020, endYear: number = 2030): string[] {
    const options: string[] = [];
    for (let year = startYear; year <= endYear; year++) {
        options.push(`${year}-${year + 1}`);
    }
    return options;
}

export function isCurrentFinancialYearStarted(): boolean {
    const today = new Date();
    const currentYear = today.getFullYear();
    const aprilFirst = new Date(currentYear, 3, 1);
    return today >= aprilFirst;
}

export function formatFinancialYearLabel(fiscalYear: string): string {
    const { startDate, endDate } = getFinancialYearDates(fiscalYear);
    return `${startDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })} - ${endDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: '2-digit' })}`;
}

export function getFinancialYearRangeQuery(fiscalYear: string) {
    const { startDate, endDate } = getFinancialYearDates(fiscalYear);
    return {
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0],
    };
}

export function isHistoricalFinancialYear(fiscalYear: string): boolean {
    const currentYear = getCurrentFinancialYear();
    return fiscalYear !== currentYear;
}
