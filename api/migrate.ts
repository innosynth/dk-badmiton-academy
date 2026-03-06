import { VercelRequest, VercelResponse } from '@vercel/node';
import { db } from '../src/db/index.js';
import { sql } from 'drizzle-orm';

export default async function handler(
    request: VercelRequest,
    response: VercelResponse,
) {
    try {
        // Drop tables if they exist to recreate them correctly from schema.ts
        await db.execute(sql`DROP TABLE IF EXISTS purchases;`);
        await db.execute(sql`DROP TABLE IF EXISTS users;`);

        // Create users table EXACTLY as per schema.ts
        await db.execute(sql`
            CREATE TABLE users (
                id SERIAL PRIMARY KEY,
                phone TEXT NOT NULL UNIQUE,
                password TEXT NOT NULL,
                name TEXT NOT NULL,
                role TEXT NOT NULL DEFAULT 'coach',
                "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        // Create purchases table EXACTLY as per schema.ts
        await db.execute(sql`
            CREATE TABLE purchases (
                id SERIAL PRIMARY KEY,
                "registrationId" INTEGER NOT NULL REFERENCES registrations(id),
                "item" TEXT NOT NULL,
                "quantity" INTEGER NOT NULL,
                "totalPrice" NUMERIC NOT NULL,
                "purchaseDate" DATE NOT NULL DEFAULT CURRENT_DATE,
                "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        // Insert default admin
        await db.execute(sql`
            INSERT INTO users (phone, password, name, role) 
            VALUES ('9363141888', 'Admin@2025$', 'Academy Admin', 'admin');
        `);

        return response.status(200).json({ message: 'Re-Migration successful - Tables recreated' });
    } catch (error: any) {
        console.error('Migration error:', error);
        return response.status(500).json({ error: error.message });
    }
}
