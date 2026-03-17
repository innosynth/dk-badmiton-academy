import { VercelRequest, VercelResponse } from '@vercel/node';
import { db } from '../src/db/index.js';
import { guests } from '../src/db/schema.js';
import { desc, and, eq } from 'drizzle-orm';

export default async function handler(
    request: VercelRequest,
    response: VercelResponse,
) {
    if (request.method !== 'GET') {
        return response.status(405).json({ error: 'Method not allowed' });
    }

    try {
        // Only fetch active guests (soft delete filter)
        const allGuests = await db.select().from(guests).where(eq(guests.isActive, true)).orderBy(desc(guests.createdAt));
        return response.status(200).json(allGuests);
    } catch (error: any) {
        console.error('Fetch guests error:', error);
        return response.status(500).json({ error: error.message });
    }
}
