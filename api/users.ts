import { VercelRequest, VercelResponse } from '@vercel/node';
import { db } from '../src/db/index.js';
import { users } from '../src/db/schema.js';
import { eq, and, desc } from 'drizzle-orm';

export default async function handler(
    request: VercelRequest,
    response: VercelResponse,
) {
    const method = request.method;

    // GET - List all users
    if (method === 'GET') {
        try {
            const allUsers = await db.select().from(users).orderBy(desc(users.createdAt));
            // Remove passwords before sending
            const sanitizedUsers = allUsers.map(({ password: _, ...u }) => u);
            return response.status(200).json(sanitizedUsers);
        } catch (error: any) {
            console.error('Fetch users error:', error);
            return response.status(500).json({ error: error.message });
        }
    }

    // POST - Create new user (coach)
    if (method === 'POST') {
        try {
            const { adminPhone, phone, password, name } = request.body;

            if (!adminPhone || !phone || !password || !name) {
                return response.status(400).json({ error: 'All fields are required' });
            }

            // Check if admin is valid
            const adminCheck = await db.select().from(users).where(eq(users.phone, adminPhone)).limit(1);
            if (adminCheck.length === 0 || adminCheck[0].role !== 'admin') {
                return response.status(403).json({ error: 'Unauthorized: Admin access required' });
            }

            const valuesToInsert: any = { phone, password, name, role: 'coach' };
            const newUser = await db
                .insert(users)
                .values(valuesToInsert)
                .returning();

            return response.status(200).json(newUser[0]);
        } catch (error: any) {
            console.error('Create user error:', error);
            if (error.code === '23505') {
                return response.status(400).json({ error: 'Phone number already exists' });
            }
            return response.status(500).json({ error: error.message });
        }
    }

    // PUT/PATCH - Update user
    if (method === 'PUT' || method === 'PATCH') {
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

    // DELETE - Delete user
    if (method === 'DELETE') {
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

            // 2. Prevent self-deletion
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

    return response.status(405).json({ error: 'Method not allowed' });
}
