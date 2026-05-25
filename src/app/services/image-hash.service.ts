import { Injectable } from '@angular/core';
import { UploadFileEntry } from '../models/sstv-submission.model';

@Injectable({ providedIn: 'root' })
export class ImageHashService {
  findDuplicates(entries: UploadFileEntry[]): Map<string, UploadFileEntry[]> {
    const groups = new Map<string, UploadFileEntry[]>();
    for (const entry of entries) {
      const existing = groups.get(entry.imageHash) ?? [];
      existing.push(entry);
      groups.set(entry.imageHash, existing);
    }
    const dupes = new Map<string, UploadFileEntry[]>();
    for (const [hash, group] of groups) {
      if (group.length > 1) {
        dupes.set(hash, group);
      }
    }
    return dupes;
  }
}
