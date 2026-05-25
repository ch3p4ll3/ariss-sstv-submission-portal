import { Injectable } from '@angular/core';

export interface ParsedMetadata {
  captureTimestampUtc: string | null;
  width: number;
  height: number;
  fileSizeBytes: number;
  imageHash: string;
}

@Injectable({ providedIn: 'root' })
export class ExifParserService {

  async parse(file: File): Promise<ParsedMetadata> {
    const [width, height] = await this.getDimensions(file);
    const hash = await this.computeHash(file);
    const captureTimestampUtc = await this.extractDate(file);

    return {
      captureTimestampUtc,
      width,
      height,
      fileSizeBytes: file.size,
      imageHash: hash,
    };
  }

  private getDimensions(file: File): Promise<[number, number]> {
    return new Promise((resolve, reject) => {
      const url = URL.createObjectURL(file);
      const img = new Image();
      img.onload = () => {
        URL.revokeObjectURL(url);
        resolve([img.naturalWidth, img.naturalHeight]);
      };
      img.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error('Failed to decode image'));
      };
      img.src = url;
    });
  }

  private async computeHash(file: File): Promise<string> {
    const buffer = await file.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  private async extractDate(file: File): Promise<string | null> {
    try {
      const buffer = await file.slice(0, 65536).arrayBuffer();
      const view = new DataView(buffer);
      const text = new TextDecoder('latin-1').decode(buffer);

      const exifPattern = /(\d{4}:\d{2}:\d{2} \d{2}:\d{2}:\d{2})/;
      const match = text.match(exifPattern);
      if (match) {
        const cleaned = match[1].replace(/:/g, '-').replace(' ', 'T') + 'Z';
        return cleaned;
      }

      const rawPattern = /(20\d{2}[_-]\d{2}[_-]\d{2}[T ]\d{2}[-:]\d{2}[-:]\d{2})/;
      const rawMatch = text.match(rawPattern);
      if (rawMatch) {
        const cleaned = rawMatch[1].replace(/ /g, 'T').replace(/-/g, ':');
        const date = new Date(cleaned);
        if (!isNaN(date.getTime())) {
          return date.toISOString();
        }
      }

      if (file.lastModified) {
        return new Date(file.lastModified).toISOString();
      }

      return null;
    } catch {
      return file.lastModified ? new Date(file.lastModified).toISOString() : null;
    }
  }
}
