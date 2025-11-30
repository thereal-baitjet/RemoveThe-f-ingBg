const photoroomEndpoint = 'https://sdk.photoroom.com/v1/segment';

function readBody(req) {
    return new Promise((resolve, reject) => {
        const chunks = [];
        req.on('data', chunk => chunks.push(chunk));
        req.on('end', () => resolve(Buffer.concat(chunks)));
        req.on('error', reject);
    });
}

module.exports = async (req, res) => {
    if (req.method !== 'POST') {
        res.status(405).json({ error: 'Method not allowed' });
        return;
    }

    const apiKey = process.env.PHOTOROOM_KEY;
    if (!apiKey) {
        res.status(500).json({ error: 'Missing PHOTOROOM_KEY server environment variable' });
        return;
    }

    try {
        const buffer = await readBody(req);
        if (!buffer || buffer.length === 0) {
            res.status(400).json({ error: 'No image data received' });
            return;
        }

        const contentType = req.headers['content-type'] || 'application/octet-stream';
        const fileName = req.headers['x-file-name'] || 'upload';

        const formData = new FormData();
        formData.append('image_file', new Blob([buffer], { type: contentType }), fileName);

        const upstream = await fetch(photoroomEndpoint, {
            method: 'POST',
            headers: {
                'X-Api-Key': apiKey
            },
            body: formData
        });

        const upstreamBuffer = Buffer.from(await upstream.arrayBuffer());
        const upstreamType = upstream.headers.get('content-type') || 'application/octet-stream';

        if (!upstream.ok) {
            res.status(upstream.status).json({
                error: `PhotoRoom error ${upstream.status} ${upstream.statusText}`,
                body: upstreamBuffer.toString('utf8')
            });
            return;
        }

        res.setHeader('Content-Type', upstreamType);
        res.setHeader('Cache-Control', 'no-store');
        res.status(200).send(upstreamBuffer);
    } catch (err) {
        console.error('PhotoRoom proxy failed:', err);
        res.status(500).json({ error: 'PhotoRoom proxy failed', details: err.message });
    }
};
