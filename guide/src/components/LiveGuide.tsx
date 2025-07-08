'use client';
import { useState, useCallback, useEffect } from 'react';

type Meta = { title: string; tags: string[]; description: string };

export default function LiveGuide({ meta }: { meta: Meta }) {
  const [guides, setGuides] = useState<string[]>([]); // 확정된 가이드
  const [current, setCurrent] = useState('');          // 진행 중 문장
  const [loading, setLoading] = useState(false);

  const fetchGuide = useCallback(async () => {
    setLoading(true);
    setCurrent('');            // 새 요청 전에 비우기

    try {
      const res = await fetch('/api/guide', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(meta),
      });
      if (!res.ok) throw new Error(await res.text());

      const reader = res.body!.getReader();
      const decoder = new TextDecoder();
      let acc = '';

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        acc += decoder.decode(value);
        setCurrent(acc);       // 실시간 업데이트(히스토리에 넣지 않음)
      }

      // ✅ 스트림 완료 → 히스토리에 추가 후 current 비움
      setGuides((prev) => [acc.trim(), ...prev]);
      setCurrent('');
    } catch (err: any) {
      setGuides((prev) => [`❌ 오류: ${err.message}`, ...prev]);
      setCurrent('');
    } finally {
      setLoading(false);
    }
  }, [meta]);

  useEffect(() => {
    fetchGuide();              // 첫 마운트 시 1회
  }, [fetchGuide]);

  return (
    <section style={{ marginTop: '2rem' }}>
      {/* 버튼 */}
      <div style={{ textAlign: 'right', marginBottom: '1rem' }}>
        <button
          onClick={fetchGuide}
          disabled={loading}
          style={{
            padding: '0.5rem 1rem',
            borderRadius: 6,
            border: '1px solid #cbd5e1',
            background: loading ? '#e2e8f0' : '#f8fafc',
            cursor: loading ? 'not-allowed' : 'pointer',
          }}
        >
          {loading ? '생성 중…' : '새 가이드 받기 ↻'}
        </button>
      </div>

      <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
        {/* 로딩 중 빈·스켈레톤 박스 */}
        {loading && (
          <li
            style={{
              marginBottom: '0.75rem',
              padding: '0.75rem 1rem',
              height: 24,
              border: '1px solid #e5e7eb',
              borderRadius: 8,
              background: '#f8fafc',
            }}
          />
        )}

        {/* 스트리밍 중 문장(있을 때) */}
        {current && !loading && (
          <li
            style={{
              marginBottom: '0.75rem',
              padding: '0.75rem 1rem',
              border: '1px solid #e5e7eb',
              borderRadius: 8,
              background: '#e8f4ff',
              whiteSpace: 'pre-wrap',
            }}
          >
            {current}
          </li>
        )}

        {/* 확정된 가이드 히스토리 */}
        {guides.map((g, i) => (
          <li
            key={i}
            style={{
              marginBottom: '0.75rem',
              padding: '0.75rem 1rem',
              border: '1px solid #e5e7eb',
              borderRadius: 8,
              background: '#e8f4ff',
              whiteSpace: 'pre-wrap',
            }}
          >
            {g}
          </li>
        ))}
      </ul>
    </section>
  );
}
