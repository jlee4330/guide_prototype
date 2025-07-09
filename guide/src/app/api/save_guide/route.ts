import { NextResponse } from 'next/server';
import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

const credentials = JSON.parse(
    process.env.FIREBASE_SERVICE_ACCOUNT_KEY as string
  );

if (!getApps().length) {
  initializeApp({ credential: cert(credentials as any) });
}
const db = getFirestore();

export async function POST(req: Request) {
  try {
    const { title, tags, description, text, liked, reason } = await req.json();
    if (!text || liked === undefined)
      return NextResponse.json({ error: 'payload missing' }, { status: 400 });

    const doc = await db.collection('guide_feedback').add({
      title,
      tags,
      description,
      text,            // 가이드 문장
      liked,           // true | false
      reason,          // 사용자가 쓴 이유
      createdAt: new Date(),
    });

    return NextResponse.json({ ok: true, id: doc.id });
  } catch (err: any) {
    console.error('save-guide 오류 →', err);
    return new NextResponse(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } },
    );
  }
}
