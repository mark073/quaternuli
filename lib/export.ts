import type { Seed } from './types'

function slug(str: string) {
  return (str || 'seed')
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .substring(0, 60)
}

function triggerDownload(content: string | Uint8Array, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

function formatDate(seed: Seed) {
  return new Date(seed.updatedAt).toLocaleDateString('en-GB', {
    day: '2-digit', month: 'long', year: 'numeric',
  })
}

function buildHtmlContent(seed: Seed): string {
  const date = formatDate(seed)
  const tagsStr = seed.tags.join(', ') || '—'
  const body = seed.content.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
  return `<!DOCTYPE html>
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
</body></html>`
}

// Fetch a same-origin font file and return as base64 string.
// Cached per session so subsequent exports are instant.
const fontCache: Record<string, string> = {}

async function fetchFontAsBase64(path: string): Promise<string> {
  if (fontCache[path]) return fontCache[path]
  const res = await fetch(path)
  if (!res.ok) throw new Error(`Failed to load font: ${path}`)
  const buf = await res.arrayBuffer()
  const bytes = new Uint8Array(buf)
  let binary = ''
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i])
  }
  const b64 = btoa(binary)
  fontCache[path] = b64
  return b64
}

async function exportAsPdf(seed: Seed) {
  const { jsPDF } = await import('jspdf')
  const date = formatDate(seed)
  const s = slug(seed.title)

  // Load Inter TTF from public/fonts — same origin, no CORS, works offline after first load
  const [regularB64, boldB64] = await Promise.all([
    fetchFontAsBase64('/fonts/Inter-Regular.ttf'),
    fetchFontAsBase64('/fonts/Inter-Bold.ttf'),
  ])

  const doc = new jsPDF({ unit: 'pt', format: 'a4' })
  const pageW = doc.internal.pageSize.getWidth()
  const pageH = doc.internal.pageSize.getHeight()
  const marginL = 56
  const marginR = 56
  const marginT = 60
  const contentW = pageW - marginL - marginR
  const red = '#E8001D'
  const black = '#111111'
  const gray = '#999999'
  const lightGray = '#CCCCCC'

  // Register Inter fonts
  doc.addFileToVFS('Inter-Regular.ttf', regularB64)
  doc.addFont('Inter-Regular.ttf', 'Inter', 'normal')
  doc.addFileToVFS('Inter-Bold.ttf', boldB64)
  doc.addFont('Inter-Bold.ttf', 'Inter', 'bold')

  let y = marginT

  // Title
  doc.setFont('Inter', 'bold')
  doc.setFontSize(26)
  doc.setTextColor(black)
  const titleLines = doc.splitTextToSize(seed.title, contentW)
  doc.text(titleLines, marginL, y)
  y += titleLines.length * 32 + 4

  // Meta row
  doc.setFontSize(9)
  doc.setFont('Inter', 'bold')
  doc.setTextColor(gray)
  const phaseLabel = 'PHASE: '
  const phaseValue = seed.phase.toUpperCase()
  const dateStr = date.toUpperCase()
  doc.text(phaseLabel, marginL, y)
  const phaseLabelW = doc.getTextWidth(phaseLabel)
  doc.setTextColor(red)
  doc.text(phaseValue, marginL + phaseLabelW, y)
  const phaseValueW = doc.getTextWidth(phaseValue)
  doc.setTextColor(gray)
  doc.text(`  ·  ${dateStr}`, marginL + phaseLabelW + phaseValueW, y)
  y += 20

  // Tags
  if (seed.tags.length > 0) {
    doc.setFontSize(8)
    doc.setFont('Inter', 'bold')
    doc.setTextColor('#555555')
    let tagX = marginL
    for (const tag of seed.tags) {
      const label = tag.toUpperCase()
      const tw = doc.getTextWidth(label)
      const padH = 5
      const padV = 3
      const tagW = tw + padH * 2
      const tagH = 14
      doc.setDrawColor(lightGray)
      doc.setLineWidth(1)
      doc.rect(tagX, y - tagH + padV + 1, tagW, tagH)
      doc.text(label, tagX + padH, y)
      tagX += tagW + 6
    }
    y += 20
  }

  // Divider
  y += 8
  doc.setDrawColor(black)
  doc.setLineWidth(1.5)
  doc.line(marginL, y, pageW - marginR, y)
  y += 20

  // Body
  doc.setFont('Inter', 'normal')
  doc.setFontSize(11)
  doc.setTextColor(black)

  const paragraphs = seed.content.split(/\n\n+/)
  for (const para of paragraphs) {
    const lines = doc.splitTextToSize(para.trim(), contentW)
    for (const line of lines) {
      if (y > pageH - 60) {
        doc.addPage()
        y = marginT
        doc.setFont('Inter', 'normal')
        doc.setFontSize(11)
        doc.setTextColor(black)
      }
      doc.text(line, marginL, y)
      y += 17
    }
    y += 8
  }

  // Footer
  doc.setFontSize(8)
  doc.setFont('Inter', 'normal')
  doc.setTextColor(lightGray)
  doc.text('EXPORTED FROM QUATERNULI', marginL, pageH - 28)

  doc.save(`${s}.pdf`)
}

async function exportAsDocx(seed: Seed) {
  const {
    Document, Packer, Paragraph, TextRun, BorderStyle, AlignmentType,
  } = await import('docx')

  const date = formatDate(seed)
  const s = slug(seed.title)
  const red = 'E8001D'
  const gray = '999999'
  const lightGray = 'E8E8E8'
  const black = '111111'

  const paragraphs = seed.content
    .split(/\n\n+/)
    .filter(p => p.trim())
    .map(p =>
      new Paragraph({
        children: [new TextRun({ text: p.trim(), font: 'Helvetica Neue', size: 22, color: black })],
        spacing: { after: 160, line: 340 },
      })
    )

  const doc = new Document({
    sections: [{
      properties: {
        page: {
          size: { width: 11906, height: 16838 },
          margin: { top: 1134, right: 1134, bottom: 1134, left: 1134 },
        },
      },
      children: [
        new Paragraph({
          children: [
            new TextRun({ text: seed.title, font: 'Helvetica Neue', size: 52, bold: true, color: black }),
          ],
          spacing: { after: 120 },
        }),

        new Paragraph({
          children: [
            new TextRun({ text: 'Phase: ', font: 'Helvetica Neue', size: 16, color: gray, allCaps: true }),
            new TextRun({ text: seed.phase, font: 'Helvetica Neue', size: 16, bold: true, color: red, allCaps: true }),
            new TextRun({ text: `   ·   ${date}`, font: 'Helvetica Neue', size: 16, color: gray, allCaps: true }),
          ],
          spacing: { after: 80 },
        }),

        ...(seed.tags.length > 0
          ? [new Paragraph({
              children: seed.tags.flatMap((tag, i) => [
                new TextRun({
                  text: tag,
                  font: 'Helvetica Neue',
                  size: 14,
                  bold: true,
                  color: '555555',
                  allCaps: true,
                  border: { type: BorderStyle.SINGLE, size: 6, space: 4, color: lightGray },
                }),
                ...(i < seed.tags.length - 1 ? [new TextRun({ text: '  ', size: 14 })] : []),
              ]),
              spacing: { after: 120 },
            })]
          : []),

        new Paragraph({
          children: [new TextRun({ text: '' })],
          border: { bottom: { style: BorderStyle.SINGLE, size: 12, color: black, space: 1 } },
          spacing: { after: 240 },
        }),

        ...paragraphs,

        new Paragraph({
          children: [
            new TextRun({ text: 'Exported from Quaternuli', font: 'Helvetica Neue', size: 14, color: 'CCCCCC', allCaps: true }),
          ],
          spacing: { before: 960 },
          alignment: AlignmentType.LEFT,
        }),
      ],
    }],
  })

  const buffer = await Packer.toBuffer(doc)
  triggerDownload(new Uint8Array(buffer), `${s}.docx`,
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document')
}

export type ExportFormat = 'md' | 'txt' | 'html' | 'json' | 'pdf' | 'docx'

export async function exportSeed(seed: Seed, format: ExportFormat) {
  const date = formatDate(seed)
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
    triggerDownload(buildHtmlContent(seed), `${s}.html`, 'text/html')
  } else if (format === 'json') {
    triggerDownload(
      JSON.stringify({ ...seed, exportedAt: new Date().toISOString(), source: 'quaternuli' }, null, 2),
      `${s}.json`, 'application/json',
    )
  } else if (format === 'pdf') {
    await exportAsPdf(seed)
  } else if (format === 'docx') {
    await exportAsDocx(seed)
  }
}

export function downloadFile(name: string, content: string) {
  triggerDownload(content, name, 'text/plain')
}
