import { VercelRequest, VercelResponse } from '@vercel/node';
import { db } from '../src/db/index.js';
import { users } from '../src/db/schema.js';
import { eq, and } from 'drizzle-orm';

export default async function handler(
    request: VercelRequest,
    response: VercelResponse,
) {
    if (request.method !== 'POST') {
        return response.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { phone, currentPassword, newPassword } = request.body;

        if (!phone || !currentPassword || !newPassword) {
            return response.status(400).json({ error: 'All fields are required' });
        }

        const foundUser = await db
            .select()
            .from(users)
            .where(and(eq(users.phone, phone), eq(users.password, currentPassword)))
            .limit(1);

        if (foundUser.length === 0) {
            return response.status(401).json({ error: 'Invalid current password' });
        }

        const updated = await db
            .update(users)
            .set({ password: newPassword })
            .where(eq(users.phone, phone))
            .returning();

        return response.status(200).json({ message: 'Password reset successful' });
    } catch (error: any) {
        console.error('Reset password error:', error);
        return response.status(500).json({ error: error.message });
    }
}
