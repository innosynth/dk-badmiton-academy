import { put } from '@vercel/blob';
import { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(
    request: VercelRequest,
    response: VercelResponse,
) {
    if (request.method !== 'POST') {
        return response.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const filename = request.query.filename as string;
        if (!filename) {
            return response.status(400).json({ error: 'Filename is required' });
        }

        const blob = await put(filename, request, {
            access: 'public',
            token: process.env.BLOB_READ_WRITE_TOKEN,
        });

        return response.status(200).json(blob);
    } catch (error: any) {
        console.error('Upload error:', error);
        return response.status(500).json({ error: error.message });
    }
}

export const config = {
    api: {
        bodyParser: false,
    },
};
