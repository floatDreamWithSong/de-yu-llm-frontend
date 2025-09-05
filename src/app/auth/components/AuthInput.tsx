import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";
import type * as React from "react";

function AuthInput({
  className,
  phone,
  type,
  ...props
}: React.ComponentProps<"input"> & { phone?: boolean }) {
  return (
    <div className="relative w-full">
      <Input
        type={type}
        placeholder={phone ? "请输入手机号" : "请输入内容"}
        className={cn(
          "h-12 rounded-full border-gray-200 bg-[#f6f6f6] pr-4 placeholder:text-gray-400 focus:bg-white focus:border-gray-300 focus:ring-0",
          phone ? "pl-24 md:text-lg border-0" : "pl-4",
          className
        )}
        {...props}
      />
      {phone && (
        <div className="absolute left-0 top-0 flex h-12 items-center">
          <Select defaultValue="+86">
            <SelectTrigger
              className="ml-4 border-0 bg-transparent shadow-none focus:ring-0 md:text-lg focus-visible:ring-0 "
              icon={<ChevronDown className="stroke-black" />}
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="+86">+86</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}
    </div>
  );
}

export { AuthInput };
