"use client";
import AuthButton from "@/app/auth/components/AuthButton";
import { AuthInput } from "@/app/auth/components/AuthInput";
import AppleCompany from "@/components/icons/AppleCompany";
import Sina from "@/components/icons/Sina";
import WeChat from "@/components/icons/WeChat";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Link } from "@tanstack/react-router";
import { useCallback, useContext, useState } from "react";
import { AuthContext } from "@/app/auth/layouts/AuthLayout";
import z from "zod";
import { mobileSchema } from "@/utils/schema";
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
const iconSize = 26;

const formSchema = z.object({
  phone: mobileSchema,
});
export default function LoginPage() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      phone: "",
    },
  });
  const [isChecked, setIsChecked] = useState(false);
  const [isVerificationStage, setVerificationStage] = useState(true);
  const handleSwitchBack = useCallback(() => {
    setVerificationStage(false);
  }, []);
  const authContext = useContext(AuthContext);
  const handleSubmit = (data: z.infer<typeof formSchema>) => {
    if(!isChecked){
      toast('请勾选使用协议与隐私协议')
      return
    }
    authContext.setPhone(data.phone);
    setVerificationStage(true)
  };
  return (
    <>
      {!isVerificationStage ? (
        <AuthWrapper>
          <div className="grid grid-rows-3 h-full items-center gap-y-10">
            <h3 className="text-3xl font-bold text-primary row-span-1 w-full text-center">
              欢迎登录
            </h3>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(handleSubmit)}
                className="row-span-1 w-full space-y-6"
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
                <AuthButton type="submit">下一步</AuthButton>
                <div
                  className="justify-center flex items-center gap-2"
                  style={{
                    letterSpacing: "0.5px",
                  }}
                >
                  <Checkbox
                    checked={isChecked}
                    className="border-primary"
                    onCheckedChange={(checked) =>
                      setIsChecked(
                        checked === "indeterminate" ? false : checked,
                      )
                    }
                  />
                  <Label className="gap-0.5">
                    我已阅读并同意
                    <Link
                      to="."
                      className="text-black font-bold underline-offset-4 hover:underline"
                    >
                      使用协议
                    </Link>
                    和
                    <Link
                      to="."
                      className="text-black font-bold underline-offset-4 hover:underline"
                    >
                      隐私协议
                    </Link>
                  </Label>
                </div>
              </form>
            </Form>
            <div className="[&>button]:rounded-full flex justify-between px-4 items-end h-full">
              <Outline>
                <AppleCompany size={iconSize} />
              </Outline>
              <Outline>
                <WeChat size={iconSize} />
              </Outline>
              <Outline>
                <Sina size={iconSize} />
              </Outline>
            </div>
          </div>
        </AuthWrapper>
      ) : (
        <VerificationCodeTab onBack={handleSwitchBack} />
      )}
    </>
  );
}

const Outline = ({ children, ...props }: React.ComponentProps<"button">) => {
  return (
    <button
      {...props}
      className="p-5 cursor-pointer border border-[#c1c1c9] bg-background shadow-xs hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50"
    >
      {children}
    </button>
  );
};
