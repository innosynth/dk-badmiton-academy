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
        const { id, name, data, courtNumber, paymentDetails, earnings, adminPhone } = request.body;

        // Validate admin access
        if (!adminPhone) {
            return response.status(403).json({ error: 'Admin authentication required' });
        }

        // Verify admin exists
        const { users } = await import('../src/db/schema.js');
        const admin = await db.select().from(users).where(eq(users.phone, adminPhone)).limit(1);

        if (admin.length === 0 || admin[0].role !== 'admin') {
            return response.status(403).json({ error: 'Only administrators can update guests' });
        }

        // Validate guest ID
        if (!id) {
            return response.status(400).json({ error: 'Guest ID is required' });
        }

        // Validate required fields
        if (name !== undefined && (!name || name.trim() === '')) {
            return response.status(400).json({ error: 'Name is required' });
        }

        const updateData: any = {
            updatedAt: new Date(),
        };

        if (name !== undefined) updateData.name = name.trim();
        if (data !== undefined) updateData.data = data?.trim() || null;
        if (courtNumber !== undefined) updateData.courtNumber = courtNumber?.trim() || null;
        if (paymentDetails !== undefined) updateData.paymentDetails = paymentDetails?.trim() || null;
        if (earnings !== undefined) updateData.earnings = earnings?.trim() || null;

        const updatedGuest = await db.update(guests)
            .set(updateData)
            .where(eq(guests.id, id))
            .returning();

        if (updatedGuest.length === 0) {
            return response.status(404).json({ error: 'Guest not found' });
        }

        return response.status(200).json(updatedGuest[0]);
    } catch (error: any) {
        console.error('Update guest error:', error);
        return response.status(500).json({ error: error.message });
    }
}
