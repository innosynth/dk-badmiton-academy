import { VercelRequest, VercelResponse } from '@vercel/node';
import { db } from '../src/db/index.js';
import { users } from '../src/db/schema.js';
import { eq, and } from 'drizzle-orm';

export default async function handler(
    request: VercelRequest,
    response: VercelResponse,
) {
    if (request.method !== 'POST' && request.method !== 'DELETE') {
        return response.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { adminPhone, userId } = request.body;

        if (!adminPhone || !userId) {
            return response.status(400).json({ error: 'Missing required fields' });
        }

        // 1. Verify that the requester is an admin
        const adminCheck = await db.select().from(users).where(and(eq(users.phone, adminPhone), eq(users.role, 'admin'))).limit(1);
        if (adminCheck.length === 0) {
            return response.status(403).json({ error: 'Unauthorized: Admin access required' });
        }

        // 2. Prevent self-deletion (last admin check could be added, but this is basic)
        if (adminCheck[0].id === userId) {
            return response.status(400).json({ error: 'Self-deletion is not permitted' });
        }

        // 3. Delete the user
        const result = await db.delete(users).where(eq(users.id, userId)).returning();

        if (result.length === 0) {
            return response.status(404).json({ error: 'User not found' });
        }

        return response.status(200).json({ message: 'User deleted successfully', deletedUser: result[0].name });
    } catch (error: any) {
        console.error('Delete user error:', error);
        return response.status(500).json({ error: error.message });
    }
}
