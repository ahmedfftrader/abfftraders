// Vercel Serverless Function for /api/store with Cloud Bin Sync
const PRIMARY_CLOUD_BIN = 'https://extendsclass.com/api/json-storage/bin/eedfddc';
let memoryStore: unknown = null;

export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'POST' || req.method === 'PUT') {
    try {
      const data = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
      memoryStore = data;

      // Forward to online cloud bin in background
      fetch(PRIMARY_CLOUD_BIN, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }).catch(() => {});

      return res.status(200).json({ success: true, store: memoryStore });
    } catch {
      return res.status(400).json({ error: 'Invalid JSON body' });
    }
  }

  if (req.method === 'GET') {
    if (memoryStore) {
      return res.status(200).json(memoryStore);
    }
    // Attempt fetch from cloud bin
    try {
      const cloudRes = await fetch(`${PRIMARY_CLOUD_BIN}?t=${Date.now()}`, {
        headers: { Accept: 'application/json' },
      });
      if (cloudRes.ok) {
        const cloudData = await cloudRes.json();
        let parsed = cloudData;
        if (typeof cloudData?.data === 'string') {
          try {
            parsed = JSON.parse(cloudData.data);
          } catch {}
        }
        memoryStore = parsed;
        return res.status(200).json(parsed);
      }
    } catch {}

    return res.status(200).json(null);
  }

  return res.status(405).json({ error: 'Method not allowed' });
}

