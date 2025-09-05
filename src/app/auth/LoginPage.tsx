"use client";
import AuthButton from "@/app/auth/components/AuthButton";
import { AuthInput } from "@/app/auth/components/AuthInput";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Link } from "@tanstack/react-router";
import { useState } from "react";

export default function LoginPage() {
  const [isChecked, setIsChecked] = useState(false);
  return (
    <div className="grid grid-rows-3 h-full items-center gap-y-10">
      <h3 className="text-2xl font-bold row-span-1 w-full text-center">
        验证登录
      </h3>
      <form action="" className="row-span-1 w-full space-y-6">
        <AuthInput phone />
        <AuthButton
          onClick={() => {
            console.log("下一步");
          }}
        >
          下一步
        </AuthButton>
        <div className="flex items-center gap-2">
          <Checkbox
            checked={isChecked}
            onCheckedChange={(checked) =>
              setIsChecked(checked === "indeterminate" ? false : checked)
            }
          />
          <Label>
            已阅读并同意启创的
            <Link to="." className="text-black font-bold">
              使用协议
            </Link>
            和
            <Link to="." className="text-black font-bold">
              隐私协议
            </Link>
          </Label>
        </div>
      </form>
    </div>
  );
}
