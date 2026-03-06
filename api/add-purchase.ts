import { VercelRequest, VercelResponse } from '@vercel/node';
import { db } from '../src/db/index.js';
import { purchases, registrations } from '../src/db/schema.js';
import { eq } from 'drizzle-orm';

export default async function handler(
    request: VercelRequest,
    response: VercelResponse,
) {
    if (request.method !== 'POST') {
        return response.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { id, createdAt, registrationId, item, quantity, totalPrice, purchaseDate } = request.body;

        if (!registrationId || !item || !quantity || !totalPrice) {
            return response.status(400).json({ error: 'All fields are required' });
        }

        // Verify registration exists
        const regCheck = await db.select().from(registrations).where(eq(registrations.id, registrationId)).limit(1);
        if (regCheck.length === 0) {
            return response.status(404).json({ error: 'Registration not found' });
        }

        const dateToUse = purchaseDate || new Date().toISOString().split('T')[0];

        const newPurchase = await db
            .insert(purchases)
            .values({
                registrationId,
                item,
                quantity: Number(quantity),
                totalPrice: totalPrice.toString(),
                purchaseDate: dateToUse,
            })
            .returning();

        return response.status(200).json(newPurchase[0]);
    } catch (error: any) {
        console.error('Add purchase error:', error);
        return response.status(500).json({ error: error.message });
    }
}
