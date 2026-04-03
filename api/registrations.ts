import { VercelRequest, VercelResponse } from '@vercel/node';
import { db } from '../src/db/index.js';
import { registrations, financialYearSettings } from '../src/db/schema.js';
import { eq, desc, gte, lte, and } from 'drizzle-orm';
import { getFinancialYearRangeQuery, getCurrentFinancialYear } from '../src/lib/financialYear.js';

export default async function handler(
    request: VercelRequest,
    response: VercelResponse,
) {
    const method = request.method;

    // GET - List all registrations with optional financial year filtering
    if (method === 'GET') {
        try {
            const { financialYear: requestedYear } = request.query;
            
            let query = db.select().from(registrations);
            
            if (requestedYear) {
                const { startDate, endDate } = getFinancialYearRangeQuery(requestedYear as string);
                query = db.select()
                    .from(registrations)
                    .where(and(
                        gte(registrations.enrollmentDate, startDate),
                        lte(registrations.enrollmentDate, endDate)
                    ));
            }
            
            const allRegistrations = await query.orderBy(desc(registrations.createdAt));
            return response.status(200).json(allRegistrations);
        } catch (error: any) {
            console.error('Fetch registrations error:', error);
            return response.status(500).json({ error: error.message });
        }
    }

    // POST - Create new registration
    if (method === 'POST') {
        try {
            const { id, createdAt, ...body } = request.body;

            // Sanitize data: convert empty strings to null
            const sanitizedData: any = {};

            for (const [key, value] of Object.entries(body)) {
                sanitizedData[key] = value === '' ? null : value;
            }

            if (sanitizedData.paidMonthsCount) {
                sanitizedData.paidMonthsCount = parseInt(sanitizedData.paidMonthsCount.toString(), 10) || 0;

                if (sanitizedData.paidMonthsCount > 0 && !sanitizedData.lastPaidMonth) {
                    const today = new Date();
                    const targetDate = new Date(today.getFullYear(), today.getMonth() + sanitizedData.paidMonthsCount - 1, 1);
                    sanitizedData.lastPaidMonth = targetDate.toISOString().slice(0, 7);
                }
            }

            console.log('Sanitized registration data:', sanitizedData);

            const result = await db.insert(registrations).values(sanitizedData).returning();

            if (!result || result.length === 0) {
                throw new Error('Failed to insert registration');
            }

            return response.status(200).json(result[0]);
        } catch (error: any) {
            console.error('Registration error details:', {
                message: error.message,
                stack: error.stack,
                body: request.body
            });
            return response.status(500).json({
                error: error.message || 'Internal Server Error'
            });
        }
    }

    // PUT/PATCH - Update registration
    if (method === 'PUT' || method === 'PATCH') {
        try {
            const { id, createdAt, ...body } = request.body;

            if (!id) {
                return response.status(400).json({ error: 'Registration ID is required' });
            }

            // Sanitize data: convert empty strings to null
            const updateData: any = {};
            for (const [key, value] of Object.entries(body)) {
                updateData[key] = value === '' ? null : value;
            }

            if (updateData.paidMonthsCount !== undefined && updateData.paidMonthsCount !== null) {
                updateData.paidMonthsCount = parseInt(updateData.paidMonthsCount.toString(), 10) || 0;
            }

            const updated = await db
                .update(registrations)
                .set(updateData)
                .where(eq(registrations.id, id))
                .returning();

            if (updated.length === 0) {
                return response.status(404).json({ error: 'Registration not found' });
            }

            return response.status(200).json(updated[0]);
        } catch (error: any) {
            console.error('Update registration error:', error);
            return response.status(500).json({ error: error.message });
        }
    }

    return response.status(405).json({ error: 'Method not allowed' });
}
