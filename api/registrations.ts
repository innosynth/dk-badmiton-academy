import { VercelRequest, VercelResponse } from '@vercel/node';
import { db } from '../src/db';
import { registrations } from '../src/db/schema';
import { desc } from 'drizzle-orm';

export default async function handler(
    request: VercelRequest,
    response: VercelResponse,
) {
    if (request.method !== 'GET') {
        return response.status(405).json({ error: 'Method not allowed' });
    }

    try {
        // In a real production app, add authentication here!
        const allRegistrations = await db.select().from(registrations).orderBy(desc(registrations.createdAt));
        return response.status(200).json(allRegistrations);
    } catch (error: any) {
        console.error('Fetch error:', error);
        return response.status(500).json({ error: error.message });
    }
}
