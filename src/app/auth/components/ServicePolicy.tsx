import { cn } from "@/lib/utils";
import { EXTERNAL_LINKS } from "@/utils/constants/link";
import React from "react";

const ServicePolicy = ({
  className,
  ...props
}: React.ComponentProps<"div">) => {
  return (
    <div
      style={{
        fontSize: "12px",
      }}
      className={cn("block pb-4 text-center", className)}
      {...props}
    >
      注册登录即代表已阅读并同意我们的
      <a
        href={EXTERNAL_LINKS.SERVICE_PROTOCOL}
        target="_blank"
        rel="noreferrer"
        className="text-primary font-bold underline-offset-4 hover:underline"
      >
        用户协议
      </a>
      和
      <a
        href={EXTERNAL_LINKS.PRIVACY_POLICY}
        target="_blank"
        rel="noreferrer"
        className="text-primary font-bold underline-offset-4 hover:underline"
      >
        隐私协议
      </a>
      <br />
      未注册的手机号将自动注册
    </div>
  );
};

export default ServicePolicy;
