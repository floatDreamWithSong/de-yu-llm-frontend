import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Alert, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AlertCircleIcon, ArrowLeftIcon } from "lucide-react";
import { useRouter } from "@tanstack/react-router";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useMutation } from "@tanstack/react-query";
import { setPassword } from "@/apis/requests/user/set-password";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import z from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

export default function AccountManagePage() {
  const router = useRouter();
  return (
    <div className="max-w-[800px] mx-auto px-12 my-12">
      <nav className="flex items-center justify-center gap-2 relative">
        <Button
          variant="ghost"
          size="icon"
          className="absolute left-0"
          onClick={() => router.history.back()}
        >
          <ArrowLeftIcon />
        </Button>
        <h2 className="text-xl font-bold">系统设置</h2>
      </nav>
      <Accordion
        type="multiple"
        className="w-full mt-8 px-4"
        defaultValue={["item-1", "item-2"]}
      >
        <AccordionItem value="item-1">
          <AccordionTrigger>更改密码</AccordionTrigger>
          <AccordionContent className="flex flex-col gap-4 text-balance">
            <ResetPasswordForm />
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="item-2">
          <AccordionTrigger>注销账号</AccordionTrigger>
          <AccordionContent className="flex flex-col gap-4 text-balance">
            <Alert variant="destructive">
              <AlertCircleIcon />
              <AlertTitle>账号注销后无法找回</AlertTitle>
            </Alert>
            <div>
              <AlertDialog>
                <Button variant="destructive" asChild>
                  <AlertDialogTrigger>确认注销</AlertDialogTrigger>
                </Button>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>确认注销</AlertDialogTitle>
                  </AlertDialogHeader>
                  <AlertDialogDescription>
                    <Alert variant="destructive">
                      <AlertCircleIcon />
                      <AlertTitle>账号注销后无法找回</AlertTitle>
                    </Alert>
                  </AlertDialogDescription>
                  <AlertDialogFooter>
                    <AlertDialogCancel>取消</AlertDialogCancel>
                    <Button variant="destructive" asChild>
                      <AlertDialogAction>确认</AlertDialogAction>
                    </Button>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
const passwordSchema = z.string().min(6, "密码至少6位").max(20, "密码最多20位");
const formSchema = z
  .object({
    newPassword: passwordSchema,
    confirmPassword: passwordSchema,
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "两次输入的密码不一致",
    path: ["confirmPassword"],
  });
const ResetPasswordForm = () => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      newPassword: "",
      confirmPassword: "",
    },
  });
  const resetPasswordMutation = useMutation({
    mutationFn: setPassword,
    onSuccess: () => {
      toast.success("密码更改成功");
    },
    onError: () => {
      toast.error("密码更改失败");
    },
  });
  const handleResetPassword = (newPassword: string) => {
    resetPasswordMutation.mutate({ newPassword });
  };
  return (
    <Form {...form}>
      <form
        className="space-y-4"
        onSubmit={form.handleSubmit((data) =>
          handleResetPassword(data.newPassword),
        )}
      >
        <FormField
          control={form.control}
          name="newPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>新密码</FormLabel>
              <FormControl>
                <Input
                  placeholder="请输入新密码"
                  className="max-w-[300px]"
                  type="password"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="confirmPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>确认密码</FormLabel>
              <FormControl>
                <Input
                  placeholder="请确认新密码"
                  className="max-w-[300px]"
                  type="password"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">确认更改</Button>
      </form>
    </Form>
  );
};
