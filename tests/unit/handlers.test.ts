import { ImageHandler } from '../../src/handlers/image.handler';
import { TxtHandler } from '../../src/handlers/txt.handler';
import sharp from 'sharp';

describe('Milestone 5 Processing Handlers Unit Tests', () => {
  it('ImageHandler - should resize image and generate 300x300 thumbnail', async () => {
    // Generate valid 500x500 PNG buffer using Sharp
    const rawBuffer = await sharp({
      create: {
        width: 500,
        height: 500,
        channels: 4,
        background: { r: 255, g: 0, b: 0, alpha: 1 },
      },
    })
      .png()
      .toBuffer();

    const userId = 'user-123';
    const result = await ImageHandler.process(userId, rawBuffer);

    expect(result).toHaveProperty('metadata');
    expect(result.metadata.width).toBe(500);
    expect(result.metadata.height).toBe(500);
    expect(result.metadata.format).toBe('png');
    expect(result.thumbnailStorageKey).toContain(`thumbnails/${userId}/`);
  });

  it('TxtHandler - should extract line, word, and character counts', async () => {
    const textContent = 'Line one\nLine two with multiple words\nLine three';
    const buffer = Buffer.from(textContent, 'utf-8');

    const result = await TxtHandler.process(buffer);

    expect(result.metadata.lineCount).toBe(3);
    expect(result.metadata.wordCount).toBe(9);
    expect(result.metadata.characterCount).toBe(textContent.length);
    expect(result.textContent).toBe(textContent);
  });
});
