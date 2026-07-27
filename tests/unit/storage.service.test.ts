import { StorageService } from '../../src/services/storage.service';

describe('StorageService Unit Tests', () => {
  let storageService: StorageService;

  beforeEach(() => {
    storageService = new StorageService();
  });

  it('should generate unique storage key formatted as uploads/{userId}/{uuid}.ext', () => {
    const userId = 'user-uuid-1234';
    const originalName = 'document.pdf';

    const key = storageService.generateStorageKey(userId, originalName);

    expect(key).toBeDefined();
    expect(key.startsWith(`uploads/${userId}/`)).toBe(true);
    expect(key.endsWith('.pdf')).toBe(true);
  });

  it('should preserve file extension in lowercase', () => {
    const userId = 'user-uuid-5678';
    const originalName = 'IMAGE.PNG';

    const key = storageService.generateStorageKey(userId, originalName);

    expect(key.endsWith('.png')).toBe(true);
  });
});
