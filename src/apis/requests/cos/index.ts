import { request } from "@/lib/request";
import axios from "axios";
import z from "zod";

type progressCallback = (progress: number) => void;

interface UploadRequest {
  signedUrl: string;
  file: Blob;
  onProgress?: progressCallback;
}

const upload = (request: UploadRequest) =>
  axios.put(request.signedUrl, request.file, {
    method: "PUT",
    onUploadProgress: (progress) => {
      if (!progress.total){
        request.onProgress?.(0);
        return;
      }
      const percentCompleted = Math.round((progress.loaded * 100) / progress.total);
      request.onProgress?.(percentCompleted);
    },
    headers: {
      "Content-Type": request.file.type ?? "application/octet-stream",
    },
  });

const requestSchema = z.object({
  prefix: z.string(),
  suffix: z.string(),
});

const responseSchema = z.object({
  accessURL: z.string(),
  presignedURL: z.string(),
});

const getSignedUrl = (data: z.infer<typeof requestSchema>) =>
  request({
    url: "/system/gen_signed_url",
    method: "POST",
    data,
    dataValidator: requestSchema,
    responseValidator: responseSchema,
  });

export const uploadCosFile = async (
  request: z.infer<typeof requestSchema> & { file: Blob } & { onProgress?: progressCallback }
) => {
  const { presignedURL: signedUrl, accessURL: AccessURL } = await getSignedUrl(
    request
  );
  await upload({ signedUrl, file: request.file, onProgress: request.onProgress });
  return {
    url: AccessURL,
  };
};
