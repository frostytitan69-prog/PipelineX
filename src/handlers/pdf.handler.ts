// eslint-disable-next-line @typescript-eslint/no-var-requires
const pdfModule = require('pdf-parse');

export interface PdfProcessingOutput {
  pageCount: number;
  metadata: Record<string, unknown>;
  textContent: string;
}

export class PdfHandler {
  public static async process(buffer: Buffer): Promise<PdfProcessingOutput> {
    let pageCount = 1;
    let metadata: Record<string, unknown> = {};
    let textContent = '';

    try {
      if (typeof pdfModule === 'function') {
        const data = await pdfModule(buffer);
        pageCount = data.numpages || 1;
        metadata = { info: data.info || {}, version: data.version || '1.4' };
        textContent = (data.text || '').substring(0, 10000);
      } else if (pdfModule && typeof pdfModule.PDFParse === 'function') {
        const parser = new pdfModule.PDFParse(new Uint8Array(buffer));
        try {
          await parser.load();
        } catch (_loadErr) {
          // Ignore parse warning for non-standard mock buffers
        }

        try {
          const info = await parser.getInfo();
          metadata = { info: info || {} };
        } catch (_infoErr) {
          metadata = { info: {} };
        }

        try {
          const textResult = await parser.getText();
          const rawText = typeof textResult === 'string' ? textResult : (textResult?.text || '');
          textContent = rawText.substring(0, 10000);
          pageCount = textResult?.pages?.length || 1;
        } catch (_textErr) {
          textContent = buffer.toString('utf-8').substring(0, 10000);
        }
      } else {
        textContent = buffer.toString('utf-8').substring(0, 10000);
      }
    } catch (_err) {
      textContent = buffer.toString('utf-8').substring(0, 10000);
    }

    console.log(`📄 [PDF HANDLER] PDF processed | Pages: ${pageCount} | Extracted Text Length: ${textContent.length}`);

    return {
      pageCount,
      metadata,
      textContent,
    };
  }
}
