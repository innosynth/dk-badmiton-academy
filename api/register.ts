import { VercelRequest, VercelResponse } from '@vercel/node';
import { db } from '../src/db/index.js';
import { registrations } from '../src/db/schema.js';

export default async function handler(
    request: VercelRequest,
    response: VercelResponse,
) {
    if (request.method !== 'POST') {
        return response.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const body = request.body;

        // Sanitize data: convert empty strings to null
        const sanitizedData: any = {};
        for (const [key, value] of Object.entries(body)) {
            sanitizedData[key] = value === '' ? null : value;
        }

        console.log('Sanitized registration data:', sanitizedData);

        const result = await db.insert(registrations).values(sanitizedData).returning();

        if (!result || result.length === 0) {
            throw new Error('Failed to insert registration');
        }

        return response.status(200).json(result[0]);
    } catch (error: any) {
        console.error('Registration error details:', {
            message: error.message,
            stack: error.stack,
            body: request.body
        });
        return response.status(500).json({
            error: 'Internal Server Error',
            details: error.message
        });
    }
}
