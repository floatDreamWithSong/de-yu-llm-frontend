"use client";
import AuthButton from "@/app/auth/components/AuthButton";
import { AuthInput } from "@/app/auth/components/AuthInput";
import { Link, useNavigate, useSearch } from "@tanstack/react-router";
import { useCallback, useContext, useEffect, useMemo, useState } from "react";
import { AuthContext } from "@/app/auth/contexts";
import z from "zod";
import { mobileSchema } from "@/utils/schemas";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import VerificationCodeTab from "@/app/auth/components/VerificationCodeTab";
import AuthWrapper from "@/app/auth/components/AuthWrapper";
import { toast } from "sonner";
import { useMutation } from "@tanstack/react-query";
import { sendVerificationCode } from "@/apis/requests/user/code";
import { RequestVerify } from "@/apis/requests/user/verifiy";
import ServicePolicy from "./components/ServicePolicy";
import { useIsMobile } from "@/hooks/use-mobile";
import { tokenStore } from "@/lib/request";

const createFormSchema = (isMobile: boolean) =>
  z.object({
    phone: mobileSchema,
    pin: isMobile
      ? z
          .string()
          .min(1, { message: "请输入验证码" })
          .length(6, { message: "验证码必须为 6 位" })
          .refine((v) => /^\d{6}$/.test(v), {
            message: "验证码只能包含数字",
          })
      : z
          .string()
          .optional(),
  });

export default function LoginPage() {
  const isMobile = useIsMobile();
  const formSchema = useMemo(() => createFormSchema(isMobile), [isMobile]);
  const navigate = useNavigate();
  const search = useSearch({
    from: "/auth/login",
  });
  const [isVerificationStage, setVerificationStage] = useState(false);
  const [countDown, setCountDown] = useState<number>(0);
  const handleSwitchBack = useCallback(() => {
    setVerificationStage(false);
  }, []);
  const authContext = useContext(AuthContext);
  const sendCodeMutation = useMutation({
    mutationFn: sendVerificationCode,
  });
  const loginMutation = useMutation({
    mutationFn: RequestVerify,
  });
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      phone: "",
      pin: "",
    },
  });
  const [isChecked, setIsChecked] = useState(true);
  useEffect(() => {
    if (countDown <= 0) return;
    const timeout = setTimeout(() => {
      setCountDown(countDown - 1);
    }, 1000);
    return () => clearTimeout(timeout);
  }, [countDown]);

  const handleSendCode = useCallback(() => {
    const phone = form.getValues("phone");
    if (!phone) {
      form.setError("phone", {
        message: "请先输入手机号",
      });
      return;
    }
    sendCodeMutation.mutate(
      {
        authId: phone,
        authType: "phone-verify",
        cause: "passport",
      },
      {
        onError() {
          toast.error("验证码发送失败");
        },
        onSuccess() {
          setCountDown(60);
          toast("验证码已发送");
        },
      },
    );
  }, [sendCodeMutation, form]);

  const handleSubmit = (data: z.infer<typeof formSchema>) => {
    if(!isChecked) {
      toast.info("请勾选使用协议与隐私协议");
      return;
    }
    if (isMobile) {
      // 移动端：直接进行登录验证
      if (!data.pin) {
        form.setError("pin", {
          message: "请输入验证码",
        });
        return;
      }
      loginMutation.mutate(
        {
          verify: data.pin,
          authId: data.phone,
          authType: "phone-verify",
        },
        {
          onError() {
            form.setError("pin", {
              message: "验证码错误",
            });
          },
          onSuccess(data) {
            toast.success("登录成功");
            tokenStore.set(data.token);
            const redirectUrl = search.redirect || "/chat";
            if (data.new) {
              toast.success("请设置密码");
              navigate({
                to: "/auth/login/password/set",
                search: {
                  redirect: redirectUrl,
                },
              });
              return;
            }
            navigate({
              to: redirectUrl,
            });
          },
        },
      );
    } else {
      // 桌面端：先发送验证码，然后跳转到验证码页面
      authContext.setPhone(data.phone);
      sendCodeMutation.mutate(
        {
          authId: data.phone,
          authType: "phone-verify",
          cause: "passport",
        },
        {
          onError() {
            toast.error("验证码发送失败");
          },
          onSuccess() {
            setVerificationStage(true);
            toast("验证码已发送");
          },
        },
      );
    }
  };
  return (
    <>
      {(!isVerificationStage || isMobile) ? (
        <AuthWrapper>
          <div className="flex flex-col h-full items-center">
            <h3 className="text-2xl font-bold w-full h-fit my-8 text-center">
              验证登录
            </h3>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(handleSubmit)}
                className="w-full space-y-6 flex-1 flex flex-col justify-center"
              >
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <AuthInput phone {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {isMobile && (
                  <FormField
                    control={form.control}
                    name="pin"
                    render={({ field }) => (
                      <FormItem>
                        <div className="relative w-full">
                          <FormControl>
                            <AuthInput
                              placeholder="请输入验证码"
                              maxLength={6}
                              className="pr-24"
                              {...field}
                            />
                          </FormControl>
                          <button
                            type="button"
                            disabled={countDown > 0 || sendCodeMutation.isPending}
                            onClick={handleSendCode}
                            className="absolute right-2 top-1/2 -translate-y-1/2 text-primary text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {countDown > 0 ? `${countDown}s` : "获取验证码"}
                          </button>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
                <ServicePolicy isChecked={isChecked} setIsChecked={setIsChecked} />
                <AuthButton
                  disabled={
                    sendCodeMutation.isPending || loginMutation.isPending
                  }
                  type="submit"
                >
                  下一步
                </AuthButton>
                <AuthButton variant={"secondary"} asChild>
                  <Link
                    search={{
                      redirect: "/chat",
                    }}
                    to="/auth/login/password"
                  >
                    密码登录
                  </Link>
                </AuthButton>
              </form>
            </Form>
            {/* <div className="[&>button]:rounded-full flex justify-between px-4 items-end h-full">
              <Outline>
                <AppleCompany size={iconSize} />
              </Outline>
              <Outline>
                <WeChat size={iconSize} />
              </Outline>
              <Outline>
                <Sina size={iconSize} />
              </Outline>
            </div> */}
          </div>
        </AuthWrapper>
      ) : (
        <VerificationCodeTab onBack={handleSwitchBack} />
      )}
    </>
  );
}

// const Outline = ({ children, ...props }: React.ComponentProps<"button">) => {
//   return (
//     <button
//       {...props}
//       className="p-5 cursor-pointer border border-[#c1c1c9] bg-background shadow-xs hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50"
//     >
//       {children}
//     </button>
//   );
// };
