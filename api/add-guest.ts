import { VercelRequest, VercelResponse } from '@vercel/node';
import { db } from '../src/db/index.js';
import { guests } from '../src/db/schema.js';
import { eq } from 'drizzle-orm';

export default async function handler(
    request: VercelRequest,
    response: VercelResponse,
) {
    if (request.method !== 'POST') {
        return response.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { name, data, courtNumber, paymentDetails, earnings, adminPhone } = request.body;

        // Validate admin access
        if (!adminPhone) {
            return response.status(403).json({ error: 'Admin authentication required' });
        }

        // Verify admin exists
        const { users } = await import('../src/db/schema.js');
        const admin = await db.select().from(users).where(eq(users.phone, adminPhone)).limit(1);

        if (admin.length === 0 || admin[0].role !== 'admin') {
            return response.status(403).json({ error: 'Only administrators can add guests' });
        }

        // Validate required fields
        if (!name || name.trim() === '') {
            return response.status(400).json({ error: 'Name is required' });
        }

        const newGuest = await db.insert(guests).values({
            name: name.trim(),
            data: data?.trim() || null,
            courtNumber: courtNumber?.trim() || null,
            paymentDetails: paymentDetails?.trim() || null,
            earnings: earnings?.trim() || null,
        }).returning();

        return response.status(201).json(newGuest[0]);
    } catch (error: any) {
        console.error('Add guest error:', error);
        return response.status(500).json({ error: error.message });
    }
}
