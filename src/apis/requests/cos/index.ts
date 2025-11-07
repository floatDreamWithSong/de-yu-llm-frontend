import { request } from "@/lib/request";
import z from "zod";

interface UploadRequest {
  signedUrl: string;
  file: Blob;
}

const upload = (request: UploadRequest) =>
  fetch(request.signedUrl, {
    method: "PUT",
    body: request.file,
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
  request: z.infer<typeof requestSchema> & { file: Blob }
) => {
  const { presignedURL: signedUrl, accessURL: AccessURL } = await getSignedUrl(
    request
  );
  await upload({ signedUrl, file: request.file });
  return {
    url: AccessURL,
  };
};
