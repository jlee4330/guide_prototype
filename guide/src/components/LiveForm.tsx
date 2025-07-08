'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from '@/styles/LiveForm.module.css';

const CATEGORY_OPTIONS = ['게임', '음악', '교육', '스포츠', '토크'];

export default function LiveForm() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selected, setSelected] = useState<string[]>([]);

  const toggleTag = (tag: string) =>
    setSelected((prev) =>
      prev.includes(tag)
        ? prev.filter((t) => t !== tag)
        : prev.length < 5
        ? [...prev, tag]
        : prev
    );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams({
      title,
      description,
      tags: selected.join(','),
    });
    router.push(`/live?${params.toString()}`);
  };

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      {/* ── 방송 제목 입력 ─────────────────────────── */}
      <label className={styles.label}>
        방송 제목
        <input
          type="text"
          required
          maxLength={60}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className={styles.input}
          placeholder="예: 아무 이야기나 할 사람?"
        />
      </label>

      {/* ── 카테고리 태그 ─────────────────────────── */}
      <fieldset className={styles.fieldset}>
        <legend>카테고리 태그 (최대 5개)</legend>
        <ul className={styles.checkboxList}>
          {CATEGORY_OPTIONS.map((tag) => (
            <li key={tag}>
              <label className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={selected.includes(tag)}
                  onChange={() => toggleTag(tag)}
                />
                {tag}
              </label>
            </li>
          ))}
        </ul>
      </fieldset>

      {/* ── 방송 설명 입력 ─────────────────────────── */}
      <label className={styles.label}>
        방송 설명
        <textarea
          rows={6}
          required
          maxLength={500}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className={styles.textarea}
          placeholder="방송에서 다룰 내용이나 간단한 소개를 적어주세요."
        />
      </label>

      {/* ── 제출 버튼 ─────────────────────────────── */}
      <button type="submit" className={styles.submitBtn}>
        라이브 시작하기
      </button>
    </form>
  );
}
