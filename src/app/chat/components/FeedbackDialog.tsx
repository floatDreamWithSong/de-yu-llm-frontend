import { feedbackContent } from "@/apis/requests/user/feedback";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { toast } from "sonner";

export function FeedbackDialog({
  open,
  onClose,
}: { open: boolean; onClose: () => void }) {
  const [feedback, setFeedback] = useState("");
  const onSubmit = () => {
    feedbackContent(feedback)
      .then(() => {
        toast.success("提交成功, 感谢您的反馈！");
        onClose();
        setFeedback("");
      })
      .catch(() => {
        toast.error("提交失败");
      });
  };
  return (
    <Dialog open={open}>
      <form>
        <DialogContent showCloseButton={false} className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>反馈投诉</DialogTitle>
            <DialogDescription>
              请填写反馈内容，我们会尽快处理
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4">
            <Textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="请填写反馈内容"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={onClose}>
              取消
            </Button>
            <Button type="submit" onClick={onSubmit}>
              提交
            </Button>
          </DialogFooter>
        </DialogContent>
      </form>
    </Dialog>
  );
}
