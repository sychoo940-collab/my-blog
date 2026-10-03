import { fetchIndex, fetchPost, formatDate } from './posts.js';

const content = document.getElementById('content');
const page = document.body.dataset.page;

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

function tagList(tags = []) {
  const ul = el('ul', 'tags');
  tags.forEach((t) => ul.append(el('li', 'tag', `#${t}`)));
  return ul;
}

function setMeta(title, description) {
  document.title = title ? `${title} · 내 블로그` : '내 블로그';
  const meta = document.querySelector('meta[name="description"]');
  if (meta && description) meta.setAttribute('content', description);
}

function showMessage(title, text) {
  content.replaceChildren();
  const box = el('div', 'message');
  box.append(el('h1', null, title), el('p', null, text));
  const back = el('a', 'back-link', '← 목록으로');
  back.href = 'index.html';
  box.append(back);
  content.append(box);
}

async function renderList() {
  const posts = await fetchIndex();
  const heading = content.querySelector('.page-heading');
  content.replaceChildren(...(heading ? [heading] : []));
  if (!posts.length) {
    showMessage('아직 글이 없어요', 'posts/ 폴더에 마크다운 글을 추가해 보세요.');
    return;
  }
  const list = el('ul', 'post-list');
  posts.forEach((p) => {
    const li = el('li', 'post-card');
    const a = el('a', 'post-card__link');
    a.href = `post.html?slug=${encodeURIComponent(p.slug)}`;
    const time = el('time', 'post-card__date', formatDate(p.date));
    time.dateTime = p.date;
    a.append(el('h2', 'post-card__title', p.title), time);
    if (p.summary) a.append(el('p', 'post-card__summary', p.summary));
    li.append(a, tagList(p.tags));
    list.append(li);
  });
  content.append(list);
}

async function renderPost() {
  const slug = new URLSearchParams(location.search).get('slug');
  const post = slug ? await fetchPost(slug) : null;
  if (!post) {
    setMeta('글을 찾을 수 없음');
    showMessage('글을 찾을 수 없어요', '주소가 잘못되었거나 삭제된 글입니다.');
    return;
  }
  const { meta, body } = post;
  setMeta(meta.title, meta.summary);

  const article = el('article', 'article');
  const header = el('header', 'article__header');
  const time = el('time', 'article__date', formatDate(meta.date));
  time.dateTime = meta.date;
  header.append(el('h1', 'article__title', meta.title), time, tagList(meta.tags));

  const prose = el('div', 'prose');
  prose.innerHTML = marked.parse(body);
  prose.querySelectorAll('a[href^="http"]').forEach((a) => {
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
  });
  prose.querySelectorAll('pre code').forEach((block) => window.hljs?.highlightElement(block));
  // 표는 좁은 화면에서 가로 스크롤되도록 감싼다.
  prose.querySelectorAll('table').forEach((table) => {
    const wrap = el('div', 'table-wrap');
    table.replaceWith(wrap);
    wrap.append(table);
  });

  const back = el('a', 'back-link', '← 목록으로');
  back.href = 'index.html';
  article.append(header, prose);
  content.replaceChildren(article, back);
}

(page === 'post' ? renderPost() : renderList()).catch((err) => {
  console.error(err);
  showMessage('불러오지 못했어요', '로컬 서버(예: python -m http.server)로 실행 중인지 확인해 주세요.');
});
