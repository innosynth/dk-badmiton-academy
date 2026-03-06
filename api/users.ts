import { VercelRequest, VercelResponse } from '@vercel/node';
import { db } from '../src/db/index.js';
import { users } from '../src/db/schema.js';
import { desc } from 'drizzle-orm';

export default async function handler(
    request: VercelRequest,
    response: VercelResponse,
) {
    if (request.method !== 'GET') {
        return response.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const allUsers = await db.select().from(users).orderBy(desc(users.createdAt));
        // Remove passwords before sending
        const sanitizedUsers = allUsers.map(({ password: _, ...u }) => u);
        return response.status(200).json(sanitizedUsers);
    } catch (error: any) {
        console.error('Fetch users error:', error);
        return response.status(500).json({ error: error.message });
    }
}
