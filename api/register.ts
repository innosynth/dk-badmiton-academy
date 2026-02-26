import { VercelRequest, VercelResponse } from '@vercel/node';
import { db } from '../src/db';
import { registrations } from '../src/db/schema';

export default async function handler(
    request: VercelRequest,
    response: VercelResponse,
) {
    if (request.method !== 'POST') {
        return response.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const data = request.body;
        const result = await db.insert(registrations).values(data).returning();
        return response.status(200).json(result[0]);
    } catch (error: any) {
        console.error('Registration error:', error);
        return response.status(500).json({ error: error.message });
    }
}
