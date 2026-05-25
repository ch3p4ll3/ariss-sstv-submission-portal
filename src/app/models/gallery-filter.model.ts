import { SstvMode, SignalReport } from './sstv-submission.model';

export interface GalleryFilterCriteria {
  callsign: string;
  gridSquare: string;
  missionId: string;
  sstvMode: SstvMode | '';
  dateFrom: string;
  dateTo: string;
  minRst: number | null;
  sortBy: GallerySortField;
  sortDirection: 'asc' | 'desc';
  page: number;
  pageSize: number;
}

export type GallerySortField = 'captureTimestampUtc' | 'uploadedAt' | 'voteCount' | 'callsign';

export const DEFAULT_GALLERY_FILTER: GalleryFilterCriteria = {
  callsign: '',
  gridSquare: '',
  missionId: '',
  sstvMode: '',
  dateFrom: '',
  dateTo: '',
  minRst: null,
  sortBy: 'captureTimestampUtc',
  sortDirection: 'desc',
  page: 1,
  pageSize: 48,
};

export interface GalleryPageResponse {
  items: import('./sstv-submission.model').SstvSubmission[];
  totalCount: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}
