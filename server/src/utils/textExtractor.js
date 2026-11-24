import fs from 'fs';
import pdfParse from 'pdf-parse';

export const extractTextFromFile = async (filePath, mimeType) => {
  try {
    if (mimeType === 'application/pdf' || filePath.endsWith('.pdf')) {
      const dataBuffer = fs.readFileSync(filePath);
      const data = await pdfParse(dataBuffer);
      return {
        text: data.text || '',
        pages: data.numpages || 1,
      };
    } else {
      // Plain text or markdown
      const text = fs.readFileSync(filePath, 'utf-8');
      return {
        text,
        pages: 1,
      };
    }
  } catch (err) {
    console.error('[TextExtractor Error]', err);
    throw new Error(`Failed to extract text from file: ${err.message}`);
  }
};

export const chunkText = (text, chunkSize = 1500, overlap = 200) => {
  if (!text || text.trim().length === 0) return [];

  const cleanedText = text.replace(/\r\n/g, '\n').replace(/\n{3,}/g, '\n\n');
  const chunks = [];
  let startIndex = 0;

  while (startIndex < cleanedText.length) {
    let endIndex = startIndex + chunkSize;

    // Try to break at sentence or newline if not at the very end
    if (endIndex < cleanedText.length) {
      const lookahead = cleanedText.slice(endIndex - 100, endIndex + 100);
      const sentenceEnd = lookahead.search(/[.\n]/);
      if (sentenceEnd !== -1) {
        endIndex = endIndex - 100 + sentenceEnd + 1;
      }
    }

    const chunkContent = cleanedText.slice(startIndex, endIndex).trim();
    if (chunkContent.length > 20) {
      chunks.push({
        content: chunkContent,
        charCount: chunkContent.length,
        tokenEstimate: Math.ceil(chunkContent.length / 4),
      });
    }

    startIndex = endIndex - overlap;
    if (startIndex >= cleanedText.length - overlap) break;
  }

  return chunks;
};
