import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './ui/table';

type ContentBlock = { type: 'markdown'; text: string } | { type: 'table'; rows: string[][] };

/**
 * Split content into alternating markdown and table blocks.
 * Table: consecutive lines that look like markdown table rows (| ... |).
 */
function splitContentBlocks(content: string): ContentBlock[] {
  const lines = content.split(/\r?\n/);
  const blocks: ContentBlock[] = [];
  let markdownBuffer: string[] = [];
  let tableRows: string[][] = [];

  const isTableRow = (line: string): boolean => {
    const t = line.trim();
    return t.startsWith('|') && t.includes('|', 1);
  };

  const flushMarkdown = () => {
    if (markdownBuffer.length > 0) {
      blocks.push({ type: 'markdown', text: markdownBuffer.join('\n') });
      markdownBuffer = [];
    }
  };

  const flushTable = () => {
    if (tableRows.length > 0) {
      blocks.push({ type: 'table', rows: tableRows });
      tableRows = [];
    }
  };

  const parseTableRow = (line: string): string[] => {
    const cells = line.split('|').map((s) => s.trim());
    if (cells.length > 0 && cells[0] === '') cells.shift();
    if (cells.length > 0 && cells[cells.length - 1] === '') cells.pop();
    return cells;
  };

  const isSeparatorRow = (cells: string[]): boolean =>
    cells.length > 0 && cells.every((c) => /^:?-+:?$/.test(c));

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (isTableRow(line)) {
      flushMarkdown();
      const cells = parseTableRow(line);
      if (!isSeparatorRow(cells)) {
        tableRows.push(cells);
      }
    } else {
      flushTable();
      markdownBuffer.push(line);
    }
  }
  flushMarkdown();
  flushTable();

  return blocks;
}

/**
 * Parse markdown and convert to React elements (links, bold, italic, code, headers, URLs).
 */
function parseMarkdown(text: string, keyPrefix: string): React.ReactNode[] {
  const parts: React.ReactNode[] = [];
  let keyIndex = 0;
  let i = 0;

  const key = (name: string) => `${keyPrefix}-${name}-${keyIndex++}`;

  while (i < text.length) {
    const linkMatch = text.substring(i).match(/^\[([^\]]+)\]\(([^)]+)\)/);
    if (linkMatch) {
      parts.push(
        <a
          key={key('link')}
          href={linkMatch[2]}
          target="_blank"
          rel="noopener noreferrer"
          className="!text-blue-600 hover:!text-blue-800 underline font-medium"
          style={{ color: '#2563eb' }}
        >
          {linkMatch[1]}
        </a>
      );
      i += linkMatch[0].length;
      continue;
    }

    const boldMatch = text.substring(i).match(/^\*\*([^*]+)\*\*/);
    if (boldMatch) {
      parts.push(<strong key={key('bold')}>{boldMatch[1]}</strong>);
      i += boldMatch[0].length;
      continue;
    }

    if (text[i] === '*' && (i === 0 || text[i - 1] !== '*') && (i + 1 < text.length && text[i + 1] !== '*')) {
      const italicMatch = text.substring(i).match(/^\*([^*\n]+?)\*/);
      if (italicMatch) {
        parts.push(<em key={key('italic')}>{italicMatch[1]}</em>);
        i += italicMatch[0].length;
        continue;
      }
    }

    const codeMatch = text.substring(i).match(/^`([^`]+)`/);
    if (codeMatch) {
      parts.push(
        <code key={key('code')} className="bg-gray-200 px-1 py-0.5 rounded text-sm font-mono">
          {codeMatch[1]}
        </code>
      );
      i += codeMatch[0].length;
      continue;
    }

    const headerMatch = text.substring(i).match(/^(#{1,6})\s+(.+?)(?=\n|$)/);
    if (headerMatch && (i === 0 || text[i - 1] === '\n')) {
      const level = headerMatch[1].length;
      const headerText = headerMatch[2];
      const className = `font-bold ${level === 1 ? 'text-2xl' : level === 2 ? 'text-xl' : 'text-lg'} mt-4 mb-2`;
      const Tag = (`h${level}`) as keyof JSX.IntrinsicElements;
      parts.push(
        <Tag key={key('header')} className={className}>
          {headerText}
        </Tag>
      );
      i += headerMatch[0].length;
      continue;
    }

    if (text[i] === '\\' && i + 1 < text.length) {
      const nextChar = text[i + 1];
      if (nextChar === 'n' || nextChar === 'r') {
        parts.push(<br key={key('br')} />);
        i += 2;
        continue;
      }
      if (nextChar === 't') {
        parts.push(<span key={key('tab')} style={{ display: 'inline-block', width: '2em' }} />);
        i += 2;
        continue;
      }
    }

    if (text[i] === '\n' || text[i] === '\r') {
      parts.push(<br key={key('br')} />);
      i++;
      continue;
    }
    if (text[i] === '\t') {
      parts.push(<span key={key('tab')} style={{ display: 'inline-block', width: '2em' }} />);
      i++;
      continue;
    }

    const urlMatch = text.substring(i).match(/^(https?:\/\/[^\s\)]+|www\.[^\s\)]+)/);
    if (urlMatch) {
      const url = urlMatch[0];
      const fullUrl = url.startsWith('www.') ? `https://${url}` : url;
      parts.push(
        <a
          key={key('url')}
          href={fullUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="!text-blue-600 hover:!text-blue-800 underline break-all font-medium"
          style={{ color: '#2563eb' }}
        >
          {url}
        </a>
      );
      i += url.length;
      continue;
    }

    let regularText = text[i];
    let j = i + 1;
    while (j < text.length) {
      const remaining = text.substring(j);
      if (
        remaining.match(/^\[/) ||
        remaining.match(/^\*\*/) ||
        (remaining[0] === '*' && remaining[1] !== '*') ||
        remaining.match(/^`/) ||
        remaining.match(/^#/) ||
        remaining.match(/^\\[nrt]/) ||
        remaining.match(/^[\n\r\t]/) ||
        remaining.match(/^(https?:\/\/|www\.)/)
      ) {
        break;
      }
      regularText += text[j];
      j++;
    }
    parts.push(<span key={key('text')}>{regularText}</span>);
    i = j;
  }

  return parts.length > 0 ? parts : [<span key={key('text')}>{text}</span>];
}

function renderTable(rows: string[][], keyPrefix: string): React.ReactNode {
  if (rows.length === 0) return null;
  const headerRow = rows[0];
  const bodyRows = rows.slice(1);
  return (
    <Table key={keyPrefix} className="my-3 border border-gray-200 rounded-lg overflow-hidden">
      <TableHeader>
        <TableRow className="bg-gray-50 border-b border-gray-200">
          {headerRow.map((cell, cidx) => (
            <TableHead key={cidx} className="font-semibold text-gray-700 whitespace-normal">
              {cell}
            </TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {bodyRows.map((row, ridx) => (
          <TableRow key={ridx} className="border-b border-gray-100 last:border-0">
            {row.map((cell, cidx) => (
              <TableCell key={cidx} className="text-gray-800 whitespace-normal">
                {cell}
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

/**
 * Renders message content with markdown (bold, links, code, headers, URLs) and markdown tables.
 */
export function FormattedMessageContent({
  content,
  isStreaming = false,
}: {
  content: string;
  isStreaming?: boolean;
}) {
  const blocks = splitContentBlocks(content);
  const segmentKey = (idx: number) => `seg-${idx}`;

  return (
    <div className="whitespace-pre-wrap prose prose-sm max-w-none">
      {blocks.map((block, idx) =>
        block.type === 'table' ? (
          renderTable(block.rows, segmentKey(idx))
        ) : (
          <React.Fragment key={segmentKey(idx)}>{parseMarkdown(block.text, segmentKey(idx))}</React.Fragment>
        )
      )}
      {isStreaming && <span className="inline-block w-2 h-4 bg-gray-600 ml-1 animate-pulse" />}
    </div>
  );
}
