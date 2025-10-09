import { AnimatedShinyText } from "@/components/ui/animated-shiny-text";
import { Button } from "@/components/ui/button";
import { TextAnimate } from "@/components/ui/text-animate";
import type { ChatMessage } from "@/hooks/use-stream-completion";
const MessageCiteButton = ({
  message,
  onClick,
}: { message: ChatMessage; onClick: () => unknown }) => {
  if (message.isSearching === undefined) {
    return;
  }
  const Core =       message.choiceSearch &&
    message.searchRes?.length === message.choiceSearch ? (
      <TextAnimate
        once={true}
        animation="blurIn"
        by="character"
      >{`引用${message.choiceSearch}篇资料作为参考 >`}</TextAnimate>
    ) : message.choiceSearch ? (
      <AnimatedShinyText>选择{message.choiceSearch}篇资料</AnimatedShinyText>
    ) : message.totalSearch ? (
      <AnimatedShinyText>搜索到{message.totalSearch}篇资料</AnimatedShinyText>
    ) : message.isSearching ? (
      <AnimatedShinyText>正在搜索...</AnimatedShinyText>
    ) : null
  return (
    Core !== null && <Button variant={"link"} onClick={onClick}>
      {Core}
    </Button>
  );
};

export default MessageCiteButton;
