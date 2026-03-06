import { VercelRequest, VercelResponse } from '@vercel/node';
import { db } from '../src/db/index.js';
import { sql } from 'drizzle-orm';

export default async function handler(
    request: VercelRequest,
    response: VercelResponse,
) {
    try {
        // Create users table
        await db.execute(sql`
            CREATE TABLE IF NOT EXISTS users (
                phone TEXT PRIMARY KEY,
                password TEXT NOT NULL,
                name TEXT NOT NULL,
                role TEXT NOT NULL DEFAULT 'coach',
                "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        // Create purchases table
        await db.execute(sql`
            CREATE TABLE IF NOT EXISTS purchases (
                id SERIAL PRIMARY KEY,
                "registrationId" INTEGER NOT NULL REFERENCES registrations(id),
                "item" TEXT NOT NULL,
                "quantity" INTEGER NOT NULL,
                "totalPrice" NUMERIC NOT NULL,
                "purchaseDate" DATE NOT NULL DEFAULT CURRENT_DATE,
                "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        // Insert default admin if not exists
        await db.execute(sql`
            INSERT INTO users (phone, password, name, role) 
            VALUES ('9363141888', 'Admin@2025$', 'Academy Admin', 'admin')
            ON CONFLICT (phone) DO NOTHING;
        `);

        // Add remarks column to registrations if it doesn't exist
        try {
            await db.execute(sql`ALTER TABLE registrations ADD COLUMN remarks TEXT;`);
        } catch (e) {
            // Probably already exists
        }

        return response.status(200).json({ message: 'Migration successful' });
    } catch (error: any) {
        console.error('Migration error:', error);
        return response.status(500).json({ error: error.message });
    }
}
