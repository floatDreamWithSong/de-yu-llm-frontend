"use client";

import AgentCard from "@/app/chat/components/AgentCard";
import UserPromptTextarea from "@/app/chat/components/UserPromptTextarea";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import SplitText from "gsap/SplitText";
gsap.registerPlugin(SplitText);

const cardList = [
  {
    name: "德育班主任",
    description: "Agent 1 description",
    imgUrl: "/chat/master-agent.png",
  },
  {
    name: "Agent 2",
    description: "Agent 2 description",
    imgUrl: "/chat/teacher-agent.png",
  },
  {
    name: "Agent 3",
    description: "Agent 3 description",
    imgUrl: "/chat/tutor-agent.png",
  },
  {
    name: "Agent 4",
    description: "Agent 4 description",
    imgUrl: "/chat/deyu-agent.png",
  },
  {
    name: "Agent 5",
    description: "Agent 5 description",
    imgUrl: "/chat/heart-agent.png",
  },
  {
    name: "Agent 6",
    description:
      "Agent 6 description 阿萨的表空间方便的吗使得按时间八十九海边酒店房卡氨甲环酸的金山词霸叫阿三的放假啊士大夫就喀什地方尽快SHD发哈士大夫v就卡还是v",
    imgUrl: "/chat/home-agent.png",
  },
];

export default function ChatPage() {
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
    <div className="flex flex-col items-start @container px-6 flex-1">
      <h1 className="model-title text-4xl font-bold text-primary pb-6 whitespace-pre">
        {/* 张江高科 · 高科芯 德育大模型 */}
        <img src="/chat/fake-title.png" alt="张江高科 · 高科芯 德育大模型" className="max-h-16" />
      </h1>
      <UserPromptTextarea className="min-h-[300px] max-h-[400px]" onSubmit={() => {}} />
      <div className="grid gap-6 w-full mt-6 items-stretch max-w-[1200px]" 
           style={{gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))'}}>
        {cardList.map((card) => (
            <AgentCard className="agent-card aspect-[7/3]" key={card.name} {...card} />
        ))}
      </div>
    </div>
  );
}
