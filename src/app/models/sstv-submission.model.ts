export type SstvMode = 'Scottie 1' | 'Scottie 2' | 'Martin 1' | 'Martin 2' | 'Robot 36' | 'Robot 72' | 'PD120' | 'PD180' | 'PD290';

export type UploadStatus = 'pending' | 'validating' | 'uploading' | 'paused' | 'completed' | 'failed';

export type SignalReport = {
  rst: number;
  qrm: number;
  qrn: number;
  qsb: number;
};

export interface UploadFileEntry {
  id: string;
  file: File;
  localPreviewUrl: string;
  status: UploadStatus;
  progress: number;
  error: string | null;

  callsign: string;
  operatorName: string;
  gridSquare: string;
  captureTimestampUtc: string | null;
  missionId: string | null;

  imageHash: string;
  width: number;
  height: number;
  fileSizeBytes: number;

  sstvMode: SstvMode | null;
  signalReport: SignalReport | null;
  description: string;

  retryCount: number;
}

export interface SstvSubmission {
  id: string;
  imageUrl: string;
  thumbnailUrl: string;
  callsign: string;
  operatorName: string;
  gridSquare: string;
  captureTimestampUtc: string;
  missionId: string;
  missionName: string;
  sstvMode: SstvMode;
  signalReport: SignalReport;
  description: string;
  width: number;
  height: number;
  fileSizeBytes: number;
  imageHash: string;
  uploadedAt: string;
  certificateUrl: string | null;
  voteCount: number;
}

export interface ChunkedUploadPayload {
  submissionId: string;
  chunkIndex: number;
  totalChunks: number;
  data: string;
  checksum: string;
}

export interface BatchSubmitPayload {
  operatorProfile: {
    callsign: string;
    name: string;
    gridSquare: string;
    email: string;
  };
  submissions: Array<{
    file: string;
    filename: string;
    captureTimestampUtc: string;
    missionId: string;
    sstvMode: SstvMode;
    signalReport: SignalReport;
    description: string;
    imageHash: string;
    width: number;
    height: number;
  }>;
}
