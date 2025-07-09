'use client';
import styles from '@/styles/LiveGuide.module.css';
import { useState, useCallback } from 'react';


type Meta = { title: string; tags: string[]; description: string };

export default function LiveGuide({ meta }: { meta: Meta }) {
  const [guides, setGuides] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [modal, setModal] = useState<null | { text: string; liked: boolean }>(null);
  const [reason, setReason] = useState('');

  /* GPT 가이드 받아오기 */
  const fetchGuide = useCallback(async () => {
    setLoading(true);
    const res = await fetch('/api/guide', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(meta),
    });
    const reader = res.body!.getReader();
    const dec = new TextDecoder();
    let acc = '';
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      acc += dec.decode(value);
    }
    setGuides((p) => [acc.trim(), ...p]);
    setLoading(false);
  }, [meta]);

  /* 피드백 저장 */
  const submit = async () => {
    if (!modal) return;
    await fetch('/api/save_guide', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...meta,
        text: modal.text,
        liked: modal.liked,
        reason,
      }),
    });
    setModal(null);
    setReason('');
    alert('저장 완료!');
  };

  return (
    <section className={styles.wrapper}>
      <button className={styles.fetchBtn} onClick={fetchGuide} disabled={loading}>
        {loading ? '가이드 생성 중…' : '새 가이드 받기'}
      </button>

      {/* 가이드 카드 */}
      {guides.map((g) => (
        <div key={g} className={styles.card}>
          <p className={styles.cardText}>{g}</p>
          <button
            className={styles.iconBtn}
            aria-label="좋아요"
            onClick={() => setModal({ text: g, liked: true })}
          >
            👍
          </button>
          <button
            className={styles.iconBtn}
            aria-label="싫어요"
            onClick={() => setModal({ text: g, liked: false })}
          >
            👎
          </button>
        </div>
      ))}

      {/* ----- 모달 ----- */}
      {modal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalBox}>
            <p>{modal.liked ? '왜 좋았나요?' : '왜 별로였나요?'}</p>
            <textarea
              className={styles.modalTextarea}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
            <div className={styles.modalActions}>
              <button className={styles.secondaryBtn} onClick={() => setModal(null)}>
                취소
              </button>
              <button
                className={styles.primaryBtn}
                onClick={submit}
                disabled={!reason.trim()}
              >
                저장
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
