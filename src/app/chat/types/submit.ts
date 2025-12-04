
export type SubmitArgType = {
  value: string;
  onSuccess?: () => void;
  attachesUrl: string[];
}
export type SubmitFunctionType = (args: SubmitArgType) => void;