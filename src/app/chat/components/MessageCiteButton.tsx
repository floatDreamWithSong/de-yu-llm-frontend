import { Button } from "@/components/ui/button";
import type { ChatMessage } from "@/hooks/use-stream-completion";

const MessageCiteButton = ({
  message,
  onClick,
}: { message: ChatMessage; onClick: () => unknown }) => {
  return (
    message.isSearching !== undefined &&
    (message.searchRes && message.chooseSearch ? (
      <Button className="mb-2" variant={"link"} onClick={onClick}>
        引用{message.chooseSearch}篇资料作为参考 &gt;
      </Button>
    ) : message.totalSearch ? (
      <Button className="mb-2 decoration-0" variant={"link"}>
        搜索到{message.totalSearch}篇资料
      </Button>
    ) : message.isSearching ? (
      <Button className="mb-2 decoration-0" variant={"link"}>
        正在搜索...
      </Button>
    ) : null)
  );
};

export default MessageCiteButton;
