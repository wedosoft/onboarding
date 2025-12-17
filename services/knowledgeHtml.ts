import { createSignedUrl, tryParseSupabaseSignedObjectUrl } from './knowledgeStorage';

function isProbablyHtml(input: string): boolean {
  const value = input.trim();
  if (!value) return false;
  // quick heuristic: tags like <p>, <div>, <br>, <img ...>
  return /<\/?[a-z][\s\S]*>/i.test(value);
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function plainTextToHtml(text: string): string {
  const normalized = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  // BlockNote는 <br> 기반 "소프트 줄바꿈"을 안정적으로 복원하지 못하는 경우가 있어,
  // 레거시 텍스트는 "한 줄 = 한 문단"으로 변환해 편집 시 줄바꿈이 보존되도록 한다.
  const lines = normalized.split('\n');
  const html = lines
    .map((line) => `<p>${escapeHtml(line)}</p>`)
    .join('');
  return html.length > 0 ? html : '<p></p>';
}

export function normalizeLegacyContentToHtml(content: string): string {
  if (isProbablyHtml(content)) return content;
  return plainTextToHtml(content);
}

export function extractTextFromHtml(html: string): string {
  const doc = new DOMParser().parseFromString(html, 'text/html');
  const images = Array.from(doc.querySelectorAll('img'));
  for (const image of images) {
    const alt = image.getAttribute('alt') || image.getAttribute('title') || '이미지';
    image.replaceWith(doc.createTextNode(`\n[${alt}]\n`));
  }
  const text = (doc.body.textContent || '').replace(/\n{3,}/g, '\n\n').trim();
  return text;
}

async function refreshUrl(url: string): Promise<string> {
  const ref = tryParseSupabaseSignedObjectUrl(url);
  if (!ref) return url;
  return createSignedUrl(ref);
}

export async function refreshSupabaseSignedUrlsInHtml(html: string): Promise<string> {
  const doc = new DOMParser().parseFromString(html, 'text/html');
  const images = Array.from(doc.querySelectorAll('img'));
  const links = Array.from(doc.querySelectorAll('a'));

  await Promise.all([
    ...images.map(async (img) => {
      const src = img.getAttribute('src');
      if (!src) return;
      const updated = await refreshUrl(src);
      img.setAttribute('src', updated);
    }),
    ...links.map(async (link) => {
      const href = link.getAttribute('href');
      if (!href) return;
      const updated = await refreshUrl(href);
      link.setAttribute('href', updated);
    }),
  ]);

  return doc.body.innerHTML;
}
