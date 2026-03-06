import { VercelRequest, VercelResponse } from '@vercel/node';
import { db } from '../src/db/index.js';
import { purchases } from '../src/db/schema.js';
import { eq, desc } from 'drizzle-orm';

export default async function handler(
    request: VercelRequest,
    response: VercelResponse,
) {
    if (request.method !== 'GET') {
        return response.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { registrationId } = request.query;

        if (!registrationId) {
            return response.status(400).json({ error: 'Registration ID is required' });
        }

        const data = await db
            .select()
            .from(purchases)
            .where(eq(purchases.registrationId, Number(registrationId)))
            .orderBy(desc(purchases.purchaseDate));

        return response.status(200).json(data);
    } catch (error: any) {
        console.error('Fetch purchases error:', error);
        return response.status(500).json({ error: error.message });
    }
}
