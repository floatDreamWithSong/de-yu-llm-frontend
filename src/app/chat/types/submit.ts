import type { CoteaConfigType } from "@/apis/requests/conversation/schema/cotea";

export type SubmitArgType = {
  value: string;
  onSuccess?: () => void;
  attachesUrl: string[];
  coteaConfig?: CoteaConfigType;
}
export type SubmitFunctionType = (args: SubmitArgType) => void;