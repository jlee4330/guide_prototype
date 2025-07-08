// src/app/live/page.tsx
import LiveGuide from '@/components/LiveGuide';

type Params = { title?: string; description?: string; tags?: string };

export default async function LivePage({
  searchParams,
}: {
  searchParams: Promise<Params>;   // ⬅️ Promise 타입!
}) {
  // 1️⃣ 반드시 await 해준다
  const { title = '', description = '', tags = '' } = await searchParams;

  // 2️⃣ 가공
  const tagList = tags ? tags.split(',') : [];

  return (
    <main style={{ padding: '3rem 1.5rem' }}>
      <h1>가이드</h1>

      {/* GPT 가이드 스트림 클라이언트 컴포넌트 */}
      <LiveGuide meta={{ title, description, tags: tagList }} />
    </main>
  );
}
