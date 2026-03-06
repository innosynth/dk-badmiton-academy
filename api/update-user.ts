import { VercelRequest, VercelResponse } from '@vercel/node';
import { db } from '../src/db/index.js';
import { users } from '../src/db/schema.js';
import { eq, and } from 'drizzle-orm';

export default async function handler(
    request: VercelRequest,
    response: VercelResponse,
) {
    if (request.method !== 'POST' && request.method !== 'PUT') {
        return response.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { adminPhone, userId, name, phone, password, role } = request.body;

        if (!adminPhone || !userId) {
            return response.status(400).json({ error: 'Missing required fields' });
        }

        // 1. Verify requester
        const adminCheck = await db.select().from(users).where(and(eq(users.phone, adminPhone), eq(users.role, 'admin'))).limit(1);
        if (adminCheck.length === 0) {
            return response.status(403).json({ error: 'Unauthorized' });
        }

        // 2. Prepare update data
        const updateData: any = {};
        if (name) updateData.name = name;
        if (phone) updateData.phone = phone;
        if (password) updateData.password = password;
        if (role) updateData.role = role;

        if (Object.keys(updateData).length === 0) {
            return response.status(400).json({ error: 'Nothing to update' });
        }

        // 3. Update the user
        const result = await db.update(users).set(updateData).where(eq(users.id, userId)).returning();

        if (result.length === 0) {
            return response.status(404).json({ error: 'User not found' });
        }

        const { password: _, ...sanitizedResult } = result[0];
        return response.status(200).json(sanitizedResult);
    } catch (error: any) {
        console.error('Update user error:', error);
        return response.status(500).json({ error: error.message });
    }
}
