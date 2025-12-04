"use client";
import AuthButton from "@/app/auth/components/AuthButton";
import { AuthInput } from "@/app/auth/components/AuthInput";

import { Link } from "@tanstack/react-router";
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
import AuthWrapper from "@/app/auth/components/AuthWrapper";
import { toast } from "sonner";
import { useMutation } from "@tanstack/react-query";
import { RequestVerify } from "@/apis/requests/user/verifiy";
import { useNavigate, useSearch } from "@tanstack/react-router";
import { tokenStore } from "@/lib/request";
import { passwordSchema } from "@/apis/requests/user/schema";
import ServicePolicy from "./components/ServicePolicy";
import { useState } from "react";
const formSchema = z.object({
  phone: mobileSchema,
  password: passwordSchema,
});

export default function PhonePasswordLoginPage() {
  const [isChecked, setIsChecked] = useState(true);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      phone: "",
      password: "",
    },
  });
  const navigate = useNavigate();
  const search = useSearch({
    from: "/auth/login/password",
  });
  const phonePasswordLoginMutation = useMutation({
    mutationFn: RequestVerify,
  });

  const handleSubmit = (data: z.infer<typeof formSchema>) => {
    if(!isChecked) {
      toast.info("请勾选使用协议与隐私协议");
      return;
    }
    phonePasswordLoginMutation.mutate(
      {
        authId: data.phone,
        verify: data.password,
        authType: "phone-password",
      },
      {
        onError() {
          toast.error("登录失败");
        },
        onSuccess(data) {
          toast.success("登录成功");
          tokenStore.set(data.token);
          const redirectUrl = search.redirect || "/chat";
          navigate({
            to: redirectUrl,
          });
        },
      },
    );
  };

  return (
    <AuthWrapper>
      <div className="flex flex-col h-full items-center">
        <h3 className="text-2xl font-bold w-full h-fit my-8 text-center">
          密码登录
        </h3>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="w-full gap-4 flex-1 flex flex-col justify-center"
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
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <div className="relative">
                      <AuthInput password {...field} />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <ServicePolicy isChecked={isChecked} setIsChecked={setIsChecked} className="pb-6" />
            <div className="space-y-4">
              <AuthButton
                disabled={phonePasswordLoginMutation.isPending}
                type="submit"
              >
                下一步
              </AuthButton>
              <AuthButton variant={"secondary"} asChild>
                <Link
                  search={{
                    redirect: "/chat",
                  }}
                  to="/auth/login"
                >
                  验证码登录
                </Link>
              </AuthButton>
            </div>
          </form>
        </Form>
      </div>
    </AuthWrapper>
  );
}
