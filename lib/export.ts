import type { Seed } from './types'

function slug(str: string) {
  return (str || 'seed')
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .substring(0, 60)
}

function triggerDownload(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

export function exportSeed(seed: Seed, format: 'md' | 'txt' | 'html' | 'json') {
  const date = new Date(seed.updatedAt).toLocaleDateString('en-GB', {
    day: '2-digit', month: 'long', year: 'numeric',
  })
  const tagsStr = seed.tags.join(', ') || '—'
  const s = slug(seed.title)

  if (format === 'md') {
    triggerDownload(
      `# ${seed.title}\n\n**Phase:** ${seed.phase}  \n**Tags:** ${tagsStr}  \n**Date:** ${date}\n\n---\n\n${seed.content}`,
      `${s}.md`, 'text/markdown',
    )
  } else if (format === 'txt') {
    const bar = '─'.repeat(40)
    triggerDownload(
      [seed.title.toUpperCase(), '='.repeat(Math.min(seed.title.length, 60) || 20), '',
       `Phase: ${seed.phase}`, `Tags:  ${tagsStr}`, `Date:  ${date}`, '', bar, '', seed.content].join('\n'),
      `${s}.txt`, 'text/plain',
    )
  } else if (format === 'html') {
    const body = seed.content.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
    triggerDownload(`<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>${seed.title} — Quaternuli</title>
<style>
  body{font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;max-width:720px;margin:60px auto;padding:0 24px;color:#111;line-height:1.7}
  h1{font-size:32px;font-weight:700;letter-spacing:-0.02em;margin-bottom:8px}
  .meta{font-size:12px;letter-spacing:0.1em;text-transform:uppercase;color:#999;margin-bottom:32px;display:flex;gap:24px}
  .meta b{color:#E8001D}
  hr{border:none;border-top:2px solid #111;margin:32px 0}
  .body{font-size:16px;white-space:pre-wrap}
  .tag{display:inline-block;border:1.5px solid #e8e8e8;font-size:10px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;padding:2px 8px;margin-right:6px;color:#555}
  footer{margin-top:64px;font-size:11px;color:#ccc;letter-spacing:0.08em;text-transform:uppercase}
</style>
</head>
<body>
<h1>${seed.title}</h1>
<div class="meta"><span>Phase: <b>${seed.phase}</b></span><span>${date}</span></div>
<div>${seed.tags.map(t=>`<span class="tag">${t}</span>`).join('')}</div>
<hr>
<div class="body">${body}</div>
<footer>Exported from Quaternuli</footer>
</body></html>`,
      `${s}.html`, 'text/html',
    )
  } else if (format === 'json') {
    triggerDownload(
      JSON.stringify({ ...seed, exportedAt: new Date().toISOString(), source: 'quaternuli' }, null, 2),
      `${s}.json`, 'application/json',
    )
  }
}

export function downloadFile(name: string, content: string) {
  triggerDownload(content, name, 'text/plain')
}
