import { toast } from "sonner" 
const message = {
  success: (message: string) => {
    toast.success(message)
  },
  error: (message: string) => {
    toast.error(message)
  },
  info: (message: string) => {
    toast.info(message)
  },
}
export default message