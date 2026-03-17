import { VercelRequest, VercelResponse } from '@vercel/node';
import { db } from '../src/db/index.js';
import { guests, users } from '../src/db/schema.js';
import { eq, desc, and } from 'drizzle-orm';

export default async function handler(
    request: VercelRequest,
    response: VercelResponse,
) {
    const method = request.method;

    // GET - List all active guests
    if (method === 'GET') {
        try {
            const allGuests = await db.select().from(guests).where(eq(guests.isActive, true)).orderBy(desc(guests.createdAt));
            return response.status(200).json(allGuests);
        } catch (error: any) {
            console.error('Fetch guests error:', error);
            return response.status(500).json({ error: error.message });
        }
    }

    // POST - Add new guest
    if (method === 'POST') {
        try {
            const { name, data, courtNumber, paymentDetails, visitTime, adminPhone } = request.body;

            // Validate admin access
            if (!adminPhone) {
                return response.status(403).json({ error: 'Admin authentication required' });
            }

            // Verify admin exists
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
                visitTime: visitTime ? new Date(visitTime) : null,
            }).returning();

            return response.status(201).json(newGuest[0]);
        } catch (error: any) {
            console.error('Add guest error:', error);
            return response.status(500).json({ error: error.message });
        }
    }

    // PUT/PATCH - Update guest
    if (method === 'PUT' || method === 'PATCH') {
        try {
            const { id, name, data, courtNumber, paymentDetails, visitTime, adminPhone } = request.body;

            // Validate admin access
            if (!adminPhone) {
                return response.status(403).json({ error: 'Admin authentication required' });
            }

            // Verify admin exists
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
            if (visitTime !== undefined) updateData.visitTime = visitTime ? new Date(visitTime) : null;

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

    // DELETE - Soft delete guest
    if (method === 'DELETE') {
        try {
            const { adminPhone, guestId } = request.body;

            // Validate admin access
            if (!adminPhone) {
                return response.status(403).json({ error: 'Admin authentication required' });
            }

            // Verify admin exists
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

    return response.status(405).json({ error: 'Method not allowed' });
}
