export interface TxtProcessingOutput {
  metadata: {
    lineCount: number;
    wordCount: number;
    characterCount: number;
  };
  textContent: string;
}

export class TxtHandler {
  public static async process(buffer: Buffer): Promise<TxtProcessingOutput> {
    const textContent = buffer.toString('utf-8');

    const lines = textContent.split(/\r\n|\r|\n/);
    const words = textContent.trim().split(/\s+/).filter(Boolean);

    const lineCount = lines.length;
    const wordCount = words.length;
    const characterCount = textContent.length;

    const metadata = {
      lineCount,
      wordCount,
      characterCount,
    };

    console.log(`📝 [TXT HANDLER] Text processed | Lines: ${lineCount} | Words: ${wordCount} | Chars: ${characterCount}`);

    return {
      metadata,
      textContent,
    };
  }
}
