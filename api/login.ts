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
        const { phone, password } = request.body;

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
    } catch (error: any) {
        console.error('Login error:', error);
        return response.status(500).json({ error: error.message });
    }
}
