import * as mammoth from 'mammoth';
import * as pdfjsLib from 'pdfjs-dist';
import pdfWorker from 'pdfjs-dist/build/pdf.worker.mjs?url';

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

export interface ParsedFileContent {
  text: string;
  extension: string;
}

async function parsePdf(file: File): Promise<string> {
  const buffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: buffer }).promise;
  const pages: string[] = [];

  for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
    const page = await pdf.getPage(pageNumber);
    const content = await page.getTextContent();
    const lines = content.items
      .map((item) => ('str' in item ? item.str : ''))
      .join(' ');
    pages.push(lines);
  }

  return pages.join('\n');
}

async function parseDocx(file: File): Promise<string> {
  const buffer = await file.arrayBuffer();
  const result = await mammoth.extractRawText({ arrayBuffer: buffer });
  return result.value;
}

async function parseTxt(file: File): Promise<string> {
  return file.text();
}

export async function parseUploadedFile(file: File): Promise<ParsedFileContent> {
  const extension = file.name.split('.').pop()?.toLowerCase() || 'txt';

  if (extension === 'pdf') {
    return {
      text: await parsePdf(file),
      extension
    };
  }

  if (extension === 'docx') {
    return {
      text: await parseDocx(file),
      extension
    };
  }

  if (extension === 'txt') {
    return {
      text: await parseTxt(file),
      extension
    };
  }

  if (extension === 'doc') {
    throw new Error('前端纯浏览器模式暂不支持解析 .doc，建议转为 .docx 或 .txt 再上传。');
  }

  throw new Error(`暂不支持解析 ${extension} 格式文件。`);
}
