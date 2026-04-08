import type {
  IngestionResult,
  KnowledgeChunk,
  KnowledgeFilePrecheck,
  KnowledgeFileRecord,
  RetrievalHit
} from '@/types/workflow';
import {
  createId,
  normalizeText,
  splitByPunctuation
} from '@/utils/helpers';
import { BUNDLED_KNOWLEDGE_FILES } from '@/utils/constants';
import { parseUploadedFile } from './fileParser';

const CHUNK_SIZE = 280;
const CHUNK_OVERLAP = 48;

function makeChunks(content: string): KnowledgeChunk[] {
  const chunks: KnowledgeChunk[] = [];
  const normalized = content.replace(/\r/g, '').trim();
  if (!normalized) {
    return chunks;
  }

  let start = 0;
  let chunkIndex = 0;
  while (start < normalized.length) {
    const end = Math.min(start + CHUNK_SIZE, normalized.length);
    chunks.push({
      id: createId('chunk'),
      content: normalized.slice(start, end),
      chunkIndex
    });
    chunkIndex += 1;
    if (end === normalized.length) {
      break;
    }
    start = end - CHUNK_OVERLAP;
  }

  return chunks;
}

async function sha256(text: string): Promise<string> {
  const buffer = await crypto.subtle.digest(
    'SHA-256',
    new TextEncoder().encode(text)
  );
  return Array.from(new Uint8Array(buffer))
    .map((item) => item.toString(16).padStart(2, '0'))
    .join('');
}

export function createPrecheckFromText(
  filename: string,
  content: string
): KnowledgeFilePrecheck {
  const chunks = makeChunks(content);
  return {
    filename,
    documentCount: content.trim() ? 1 : 0,
    chunkCount: chunks.length,
    preview: content.replace(/\s+/g, ' ').slice(0, 180)
  };
}

export async function precheckUploadedFile(
  file: File
): Promise<KnowledgeFilePrecheck> {
  const parsed = await parseUploadedFile(file);
  return createPrecheckFromText(file.name, parsed.text);
}

export async function ingestTextDocument(
  existingRecords: KnowledgeFileRecord[],
  options: {
    filename: string;
    content: string;
    sourceType: 'bundled' | 'uploaded';
    sourcePath: string;
  }
): Promise<{ result: IngestionResult; record: KnowledgeFileRecord | null }> {
  const fileHash = await sha256(options.content);
  const duplicated = existingRecords.find((item) => item.fileHash === fileHash);
  if (duplicated) {
    return {
      result: {
        filename: options.filename,
        chunkCount: 0,
        fileHash,
        skipped: true
      },
      record: null
    };
  }

  const chunks = makeChunks(options.content);
  const record: KnowledgeFileRecord = {
    id: createId('kb'),
    filename: options.filename,
    fileHash,
    chunkCount: chunks.length,
    ingestedAt: new Date().toISOString(),
    sourcePath: options.sourcePath,
    preview: options.content.replace(/\s+/g, ' ').slice(0, 180),
    content: options.content,
    chunks,
    sourceType: options.sourceType
  };

  return {
    result: {
      filename: options.filename,
      chunkCount: chunks.length,
      fileHash,
      skipped: false
    },
    record
  };
}

export async function ingestUploadedFile(
  existingRecords: KnowledgeFileRecord[],
  file: File
) {
  const parsed = await parseUploadedFile(file);
  return ingestTextDocument(existingRecords, {
    filename: file.name,
    content: parsed.text,
    sourceType: 'uploaded',
    sourcePath: file.name
  });
}

export async function ingestBundledResources(existingRecords: KnowledgeFileRecord[]) {
  const results: IngestionResult[] = [];
  const records: KnowledgeFileRecord[] = [];

  for (const filePath of BUNDLED_KNOWLEDGE_FILES) {
    const response = await fetch(filePath);
    const content = await response.text();
    const filename = decodeURIComponent(filePath.split('/').pop() || 'bundled.txt');
    const output = await ingestTextDocument(existingRecords.concat(records), {
      filename,
      content,
      sourceType: 'bundled',
      sourcePath: filePath
    });
    results.push(output.result);
    if (output.record) {
      records.push(output.record);
    }
  }

  return { results, records };
}

function chunkScore(query: string, chunk: string): number {
  const tokens = splitByPunctuation(query);
  const normalizedChunk = normalizeText(chunk);
  let score = 0;

  for (const token of tokens) {
    if (token.length < 2) {
      continue;
    }
    const normalizedToken = normalizeText(token);
    if (normalizedChunk.includes(normalizedToken)) {
      score += normalizedToken.length * 5;
    }
  }

  if (
    normalizeText(query).length > 4 &&
    normalizedChunk.includes(normalizeText(query))
  ) {
    score += 24;
  }

  return score;
}

export function retrieveKnowledgeHits(
  query: string,
  documents: KnowledgeFileRecord[],
  topK: number
): RetrievalHit[] {
  return documents
    .flatMap((record) =>
      record.chunks.map((chunk) => ({
        source: record.filename,
        excerpt: chunk.content,
        score: chunkScore(query, chunk.content)
      }))
    )
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, topK)
    .map((item) => ({
      source: item.source,
      excerpt: item.excerpt
    }));
}
