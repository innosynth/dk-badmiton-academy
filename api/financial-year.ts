import { VercelRequest, VercelResponse } from '@vercel/node';
import { db } from '../src/db/index.js';
import { financialYearSettings } from '../src/db/schema.js';
import { users } from '../src/db/schema.js';
import { eq, desc, and } from 'drizzle-orm';
import { getFinancialYearDates, getCurrentFinancialYear, isCurrentFinancialYearStarted } from '../src/lib/financialYear.js';

export default async function handler(
    request: VercelRequest,
    response: VercelResponse,
) {
    const method = request.method;

    // GET - List all financial year settings or get active one
    if (method === 'GET') {
        try {
            const { active } = request.query;
            
            if (active === 'true') {
                const activeSettings = await db.select()
                    .from(financialYearSettings)
                    .where(eq(financialYearSettings.isActive, true))
                    .limit(1);
                
                if (activeSettings.length === 0) {
                    const currentYear = getCurrentFinancialYear();
                    const { startDate, endDate } = getFinancialYearDates(currentYear);
                    
                    const newSetting = await db.insert(financialYearSettings).values({
                        fiscalYear: currentYear,
                        startDate: startDate.toISOString().split('T')[0],
                        endDate: endDate.toISOString().split('T')[0],
                        isActive: true,
                    }).returning();
                    
                    return response.status(200).json(newSetting[0]);
                }
                
                return response.status(200).json(activeSettings[0]);
            }
            
            const allSettings = await db.select()
                .from(financialYearSettings)
                .orderBy(desc(financialYearSettings.fiscalYear));
            
            return response.status(200).json(allSettings);
        } catch (error: any) {
            console.error('Fetch financial year settings error:', error);
            return response.status(500).json({ error: error.message });
        }
    }

    // POST - Set active financial year
    if (method === 'POST') {
        try {
            const { fiscalYear, adminPhone } = request.body;

            if (!fiscalYear) {
                return response.status(400).json({ error: 'Fiscal year is required' });
            }

            if (!adminPhone) {
                return response.status(403).json({ error: 'Admin authentication required' });
            }

            const admin = await db.select().from(users).where(eq(users.phone, adminPhone)).limit(1);
            
            if (admin.length === 0 || admin[0].role !== 'admin') {
                return response.status(403).json({ error: 'Only administrators can change financial year settings' });
            }

            const { startDate, endDate } = getFinancialYearDates(fiscalYear);
            const today = new Date();
            const currentYear = getCurrentFinancialYear();
            const isSwitchingToCurrentYear = fiscalYear === currentYear;
            const isAfterAprilFirst = isCurrentFinancialYearStarted();

            await db.update(financialYearSettings)
                .set({ isActive: false })
                .where(eq(financialYearSettings.isActive, true));

            const existingSetting = await db.select()
                .from(financialYearSettings)
                .where(eq(financialYearSettings.fiscalYear, fiscalYear))
                .limit(1);

            let setting;
            if (existingSetting.length > 0) {
                setting = await db.update(financialYearSettings)
                    .set({ 
                        isActive: true,
                        updatedAt: new Date(),
                    })
                    .where(eq(financialYearSettings.fiscalYear, fiscalYear))
                    .returning();
            } else {
                setting = await db.insert(financialYearSettings).values({
                    fiscalYear,
                    startDate: startDate.toISOString().split('T')[0],
                    endDate: endDate.toISOString().split('T')[0],
                    isActive: true,
                }).returning();
            }

            const shouldClearData = isSwitchingToCurrentYear && isAfterAprilFirst;

            return response.status(200).json({
                setting: setting[0],
                shouldClearData,
                message: shouldClearData 
                    ? `Switched to current financial year ${fiscalYear}. Data view initialized as empty for new entries.`
                    : `Switched to financial year ${fiscalYear}.`,
            });
        } catch (error: any) {
            console.error('Set financial year error:', error);
            return response.status(500).json({ error: error.message });
        }
    }

    return response.status(405).json({ error: 'Method not allowed' });
}
