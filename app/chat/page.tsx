"use client"

import { UserIcon } from "lucide-react";
import UserPromptTextarea from "./components/user-prompt-textarea";
import AgentCard from "./components/agent-card";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import SplitText from "gsap/SplitText";
gsap.registerPlugin(SplitText);
const cardList = [
  {
    name: "Agent 1",
    description: "Agent 1 description",
    icon: UserIcon,
  },
  {
    name: "Agent 2",
    description: "Agent 2 description",
    icon: UserIcon,
  },
  {
    name: "Agent 3",
    description: "Agent 3 description",
    icon: UserIcon,
  },
  {
    name: "Agent 4",
    description: "Agent 4 description",
    icon: UserIcon,
  },
  {
    name: "Agent 5",
    description: "Agent 5 description",
    icon: UserIcon,
  },
  {
    name: "Agent 6",
    description:
      "Agent 6 description 阿萨的表空间方便的吗使得按时间八十九海边酒店房卡氨甲环酸的金山词霸叫阿三的放假啊士大夫就喀什地方尽快SHD发哈士大夫v就卡还是v",
    icon: UserIcon,
  },
];
export default function Home() {
  useGSAP(() => {
    const modelTitle = new SplitText(".model-title", {
      type: "chars",
    });
    gsap.from(modelTitle.chars, {
      duration: 1,
      opacity: 0,
      y: 40,
      ease: "power3.out",
      stagger: 0.01,
    });
    gsap.from(".agent-card", {
      duration: 1,
      opacity: 0,
      y: 40,
      ease: "power3.out",
      stagger: 0.05,
      delay: 0.2,
    });
  }, []);
  return (
    <div className="flex flex-col items-center">
      <h1 className="model-title text-4xl font-bold text-primary py-10 whitespace-pre">
        张江高科·高科芯 德育大模型
      </h1>
      <UserPromptTextarea />
      <div className="grid grid-cols-3 gap-6 w-full mt-10 items-stretch px-6 max-w-[1200px]">
        {cardList.map((card) => (
          <AgentCard className="agent-card" key={card.name} {...card} />
        ))}
      </div>
    </div>
  );
}
