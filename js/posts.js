// 글 목록/본문 로딩과 front matter 파싱
export async function fetchIndex() {
  const res = await fetch('posts/index.json');
  if (!res.ok) throw new Error('글 목록을 불러오지 못했습니다.');
  const list = await res.json();
  return list.sort((a, b) => b.date.localeCompare(a.date));
}

export async function fetchPost(slug) {
  const index = await fetchIndex();
  // 목록에 있는 slug만 허용 (경로 조작 방지)
  const meta = index.find((p) => p.slug === slug);
  if (!meta) return null;
  const res = await fetch(`posts/${encodeURIComponent(meta.slug)}.md`);
  if (!res.ok) return null;
  const { body } = parseFrontMatter(await res.text());
  return { meta, body };
}

export function parseFrontMatter(text) {
  const match = text.replace(/^﻿/, '').match(/^---\r?\n[\s\S]*?\r?\n---\r?\n?/);
  if (!match) return { body: text };
  return { body: text.slice(match[0].length) };
}

export function formatDate(iso) {
  const [y, m, d] = iso.split('-').map(Number);
  return `${y}년 ${m}월 ${d}일`;
}
