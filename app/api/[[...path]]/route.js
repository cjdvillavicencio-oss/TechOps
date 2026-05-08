import { NextResponse } from 'next/server';
import { MongoClient } from 'mongodb';
import { v4 as uuidv4 } from 'uuid';

const MONGO_URL = process.env.MONGO_URL;
const DB_NAME = process.env.DB_NAME || 'techops_desktop';

let cached = global.__mongo;
async function getDb() {
  if (cached?.db) return cached.db;
  const client = new MongoClient(MONGO_URL, { maxPoolSize: 10 });
  await client.connect();
  const db = client.db(DB_NAME);
  cached = global.__mongo = { client, db };
  return db;
}

function notFound() {
  return NextResponse.json({ error: 'Not found' }, { status: 404 });
}

export async function GET(request, { params }) {
  try {
    const resolvedParams = await params;
    const path = resolvedParams?.path || [];
    const route = path.join('/');

    if (!route || route === '') {
      return NextResponse.json({ message: 'TechOps Desktop API', version: '0.1.0' });
    }

    if (route === 'health') {
      return NextResponse.json({ status: 'ok' });
    }

    if (route === 'articles') {
      const db = await getDb();
      const items = await db
        .collection('articles')
        .find({ published: true })
        .sort({ date: -1 })
        .toArray();
      return NextResponse.json({ items });
    }

    if (path[0] === 'articles' && path[1]) {
      const db = await getDb();
      const item = await db.collection('articles').findOne({ slug: path[1] });
      if (!item) return notFound();
      return NextResponse.json({ item });
    }

    return notFound();
  } catch (err) {
    console.error('GET error:', err);
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}

export async function POST(request, { params }) {
  try {
    const resolvedParams = await params;
    const path = resolvedParams?.path || [];
    const route = path.join('/');
    const body = await request.json().catch(() => ({}));

    if (route === 'contact') {
      const db = await getDb();
      const doc = { id: uuidv4(), ...body, createdAt: new Date().toISOString() };
      await db.collection('contact_messages').insertOne(doc);
      return NextResponse.json({ ok: true, id: doc.id });
    }

    return notFound();
  } catch (err) {
    console.error('POST error:', err);
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}
