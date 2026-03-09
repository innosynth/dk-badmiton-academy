import { VercelRequest, VercelResponse } from '@vercel/node';
import { db } from '../src/db/index.js';
import { registrations } from '../src/db/schema.js';
import { eq } from 'drizzle-orm';

export default async function handler(
    request: VercelRequest,
    response: VercelResponse,
) {
    if (request.method !== 'POST' && request.method !== 'PUT') {
        return response.status(405).json({ error: 'Method not allowed' });
    }

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
        console.error('Update error:', error);
        return response.status(500).json({ error: error.message });
    }
}
