import { VercelRequest, VercelResponse } from '@vercel/node';
import { db } from '../src/db/index.js';
import { users } from '../src/db/schema.js';
import { eq } from 'drizzle-orm';

export default async function handler(
    request: VercelRequest,
    response: VercelResponse,
) {
    if (request.method !== 'POST') {
        return response.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { adminPhone, phone, password, name } = request.body;

        if (!adminPhone || !phone || !password || !name) {
            return response.status(400).json({ error: 'All fields are required' });
        }

        // Check if admin is valid
        const adminCheck = await db.select().from(users).where(eq(users.phone, adminPhone)).limit(1);
        if (adminCheck.length === 0 || adminCheck[0].role !== 'admin') {
            return response.status(403).json({ error: 'Unauthorized: Admin access required' });
        }

        const newUser = await db
            .insert(users)
            .values({ phone, password, name, role: 'coach' })
            .returning();

        return response.status(200).json(newUser[0]);
    } catch (error: any) {
        console.error('Create coach error:', error);
        if (error.code === '23505') {
            return response.status(400).json({ error: 'Phone number already exists' });
        }
        return response.status(500).json({ error: error.message });
    }
}
