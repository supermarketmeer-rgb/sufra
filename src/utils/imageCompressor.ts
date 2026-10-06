/**
 * High-performance client-side image compression utility
 * Automatically scales down high-resolution smartphone/camera photos (e.g. 12MP/4K)
 * to lightweight, crisp JPEG images (~70KB - 120KB) for instant preview and fast database storage.
 */

export const compressImage = (
  file: File,
  maxWidth = 1000,
  maxHeight = 1000,
  quality = 0.82
): Promise<string> => {
  return new Promise((resolve, reject) => {
    // Basic validation
    if (!file.type.startsWith('image/')) {
      reject(new Error('الملف المحدد ليس صورة صالحة'));
      return;
    }

    const reader = new FileReader();
    reader.onerror = () => reject(new Error('فشل قراءة ملف الصورة'));
    reader.onload = () => {
      const src = reader.result as string;
      const img = new Image();
      img.onerror = () => {
        // Fallback to raw data if image parsing fails
        resolve(src);
      };
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        // Calculate aspect-ratio preserved dimensions
        if (width > maxWidth || height > maxHeight) {
          if (width / height > maxWidth / maxHeight) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = Math.max(1, width);
        canvas.height = Math.max(1, height);
        const ctx = canvas.getContext('2d');

        if (!ctx) {
          resolve(src);
          return;
        }

        // Draw image onto canvas
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        // Convert to high-efficiency JPEG
        try {
          const dataUrl = canvas.toDataURL('image/jpeg', quality);
          resolve(dataUrl);
        } catch {
          resolve(src);
        }
      };
      img.src = src;
    };
    reader.readAsDataURL(file);
  });
};

/**
 * Normalizes direct image input from user
 * If user pastes raw base64 string without 'data:image/...;base64,', auto-prepends prefix.
 */
export const normalizeImageUrl = (input: string): string => {
  const trimmed = input.trim();
  if (!trimmed) return '';
  if (
    !trimmed.startsWith('http://') &&
    !trimmed.startsWith('https://') &&
    !trimmed.startsWith('data:') &&
    !trimmed.startsWith('/')
  ) {
    if (trimmed.length > 50) {
      return `data:image/jpeg;base64,${trimmed}`;
    }
  }
  return trimmed;
};
