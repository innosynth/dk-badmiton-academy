import { VercelRequest, VercelResponse } from '@vercel/node';
import { db } from '../src/db/index.js';
import { purchases, registrations } from '../src/db/schema.js';
import { eq, desc } from 'drizzle-orm';

export default async function handler(
    request: VercelRequest,
    response: VercelResponse,
) {
    const method = request.method;

    // GET - List purchases by registration
    if (method === 'GET') {
        try {
            const { registrationId } = request.query;

            if (!registrationId) {
                return response.status(400).json({ error: 'Registration ID is required' });
            }

            const data = await db
                .select()
                .from(purchases)
                .where(eq(purchases.registrationId, Number(registrationId)))
                .orderBy(desc(purchases.purchaseDate));

            return response.status(200).json(data);
        } catch (error: any) {
            console.error('Fetch purchases error:', error);
            return response.status(500).json({ error: error.message });
        }
    }

    // POST - Add new purchase
    if (method === 'POST') {
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

            const purchaseData: any = {
                registrationId,
                item,
                quantity: Number(quantity),
                totalPrice: totalPrice.toString(),
                purchaseDate: dateToUse,
            };

            const newPurchase = await db
                .insert(purchases)
                .values(purchaseData)
                .returning();

            return response.status(200).json(newPurchase[0]);
        } catch (error: any) {
            console.error('Add purchase error:', error);
            return response.status(500).json({ error: error.message });
        }
    }

    return response.status(405).json({ error: 'Method not allowed' });
}
