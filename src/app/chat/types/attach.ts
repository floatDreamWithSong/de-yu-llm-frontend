export interface Attach {
  localId: string;
  localData: Blob;
  uploadUrl: string;
  progress: number;
  isUploading: boolean;
}