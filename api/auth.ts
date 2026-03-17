import { VercelRequest, VercelResponse } from '@vercel/node';
import { db } from '../src/db/index.js';
import { users } from '../src/db/schema.js';
import { eq, and } from 'drizzle-orm';

export default async function handler(
    request: VercelRequest,
    response: VercelResponse,
) {
    const method = request.method;

    if (method !== 'POST') {
        return response.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { action, phone, password, currentPassword, newPassword } = request.body;

        // Handle login
        if (action === 'login' || (!action && phone && password && !currentPassword)) {
            if (!phone || !password) {
                return response.status(400).json({ error: 'Phone and password are required' });
            }

            const foundUser = await db
                .select()
                .from(users)
                .where(and(eq(users.phone, phone), eq(users.password, password)))
                .limit(1);

            if (foundUser.length === 0) {
                return response.status(401).json({ error: 'Invalid credentials' });
            }

            const { password: _, ...userWithoutPass } = foundUser[0];
            return response.status(200).json(userWithoutPass);
        }

        // Handle password reset
        if (action === 'resetPassword' || currentPassword) {
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

            await db
                .update(users)
                .set({ password: newPassword })
                .where(eq(users.phone, phone))
                .returning();

            return response.status(200).json({ message: 'Password reset successful' });
        }

        return response.status(400).json({ error: 'Invalid action or missing required fields' });
    } catch (error: any) {
        console.error('Auth error:', error);
        return response.status(500).json({ error: error.message });
    }
}
