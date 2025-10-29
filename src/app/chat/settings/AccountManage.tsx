import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Alert, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertCircleIcon } from "lucide-react";

const AccountManage = () => {
  return (
    <div className="max-w-[1000px] mx-auto px-4">
      <Accordion
        type="single"
        collapsible
        className="w-full"
        defaultValue="item-1"
      >
        <AccordionItem value="item-1">
          <AccordionTrigger>更改电话号码</AccordionTrigger>
          <AccordionContent className="flex flex-col gap-4 text-balance">
            <ItemWrapper label="电话号码">
              <Input placeholder="请输入电话号码" className="max-w-[300px]" />
            </ItemWrapper>
            <ItemWrapper label="验证码">
              <Input placeholder="请输入验证码" className="max-w-[300px]" />
              <Button>发送验证码</Button>
            </ItemWrapper>
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="item-2">
          <AccordionTrigger>更改密码</AccordionTrigger>
          <AccordionContent className="flex flex-col gap-4 text-balance">
            <ItemWrapper label="当前电话">
              <Input
                disabled={true}
                placeholder="请输入电话号码"
                className="max-w-[300px]"
              />
            </ItemWrapper>
            <ItemWrapper label="验证码">
              <Input placeholder="请输入验证码" className="max-w-[300px]" />
              <Button>发送验证码</Button>
            </ItemWrapper>
            <ItemWrapper label="新密码">
              <Input placeholder="请输入新密码" className="max-w-[300px]" />
            </ItemWrapper>
            <ItemWrapper label="确认密码">
              <Input placeholder="请确认新密码" className="max-w-[300px]" />
              <Button>确认更改</Button>
            </ItemWrapper>
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="item-3">
          <AccordionTrigger>注销账号</AccordionTrigger>
          <AccordionContent className="flex flex-col gap-4 text-balance">
            <Alert variant="destructive">
              <AlertCircleIcon />
              <AlertTitle>是否确认注销账号，账号注销后无法找回</AlertTitle>
            </Alert>
            <div>
              <Button variant="destructive">确认注销</Button>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
};

const ItemWrapper = ({
  label,
  children,
}: { label: string; children: React.ReactNode }) => {
  return (
    <div className="flex items-center gap-2">
      <Label className="w-20">{label}：</Label>
      {children}
    </div>
  );
};

export default AccountManage;
