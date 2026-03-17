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
        const { adminPhone, guestId } = request.body;

        // Validate admin access
        if (!adminPhone) {
            return response.status(403).json({ error: 'Admin authentication required' });
        }

        // Verify admin exists
        const { users } = await import('../src/db/schema.js');
        const admin = await db.select().from(users).where(eq(users.phone, adminPhone)).limit(1);

        if (admin.length === 0 || admin[0].role !== 'admin') {
            return response.status(403).json({ error: 'Only administrators can delete guests' });
        }

        // Validate guest ID
        if (!guestId) {
            return response.status(400).json({ error: 'Guest ID is required' });
        }

        // Soft delete: set isActive to false instead of deleting
        const updatedGuest = await db.update(guests)
            .set({ isActive: false, updatedAt: new Date() })
            .where(eq(guests.id, guestId))
            .returning();

        if (updatedGuest.length === 0) {
            return response.status(404).json({ error: 'Guest not found' });
        }

        return response.status(200).json({ message: 'Guest deleted successfully' });
    } catch (error: any) {
        console.error('Delete guest error:', error);
        return response.status(500).json({ error: error.message });
    }
}
