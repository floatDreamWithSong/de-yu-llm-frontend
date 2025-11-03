import homeTop from "@/assets/imgs/home/top.png";
import pc from "@/assets/imgs/home/pc.svg";
import phone from "@/assets/imgs/home/phone.svg";
import pad from "@/assets/imgs/home/pad.svg";
import mid1 from "@/assets/imgs/home/mid-1.png";
import mid2 from "@/assets/imgs/home/mid-2.png";
import mid3 from "@/assets/imgs/home/mid-3.png";
import mid4 from "@/assets/imgs/home/mid-4.png";
import mid5 from "@/assets/imgs/home/mid-5.png";
import { Button } from "@/components/ui/button";
import { ChevronRightIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import gsap from "gsap";
import { ScrollSmoother, ScrollTrigger, SplitText } from "gsap/all";
import { useGSAP } from "@gsap/react";
import { Link } from "@tanstack/react-router";
gsap.registerPlugin(ScrollTrigger, ScrollSmoother, SplitText);

const midList = [
  {
    title: "自然语言理解能力",
    description: [
      "采用先进的深度学习技术",
      "准确理解用户意图",
      "支持多语言处理能力",
    ],
    img: mid1,
  },
  {
    title: "知识推理能力",
    description: ["强大的知识图谱和推理引擎", "可进行复杂的逻辑分析和决策能力"],
    img: mid2,
  },
  {
    title: "多模态交互能力",
    description: [
      "支持文本、图像、语音等多种形式的交互方式",
      "提供更自然的人机交互体验",
    ],
    img: mid3,
  },
  {
    title: "AI 模型能力",
    description: [
      "基于海量数据训练的 AI 模型",
      "具备优秀的理解能力和生成能力",
      "可应用于多个领域",
    ],
    img: mid4,
  },
  {
    title: "AI智能体服务，一键触达",
    description: [
      "基于海量数据训练的 AI 模型",
      "具备优秀的理解能力和生成能力",
      "可应用于多个领域",
    ],
    img: mid5,
  },
];

const HomePage = () => {
  useGSAP(() => {
    ScrollSmoother.create({
      smooth: 2,
      effects: true,
      normalizeScroll: true,
      smoothTouch: 0.2,
    });
    midList.forEach((_, index) => {
      const title = `.ani-title-${index}`;
      const p = `.ani-p-${index}>p`;
      const btn = `.ani-btn-${index}`;
      const img = `.ani-img-${index}`;
      gsap.from(title, {
        scrollTrigger: {
          trigger: title,
          start: "top 90%",
          end: "bottom 50%",
          scrub: true,
        },
        duration: 1,
        opacity: 0,
        translateY: -20,
        ease: "power2.out",
      });
      gsap.from(p, {
        scrollTrigger: {
          trigger: p,
          start: "top 90%",
          end: "bottom 70%",
          scrub: true,
        },
        duration: 1,
        stagger: 0.1,
        translateX: 40,
        opacity: 0,
        ease: "power2.out",
      });
      gsap.from(btn, {
        scrollTrigger: {
          trigger: btn,
          start: "top 90%",
          end: "bottom 70%",
          scrub: true,
        },
        duration: 1,
        translateX: -40,
        opacity: 0,
        ease: "power2.out",
      });
      gsap.from(img, {
        scrollTrigger: {
          trigger: img,
          start: "top 90%",
          end: "bottom 70%",
          scrub: true,
        },
        duration: 1,
        opacity: 0,
        ease: "power2.out",
      });
    });

    const modelSubtitle = new SplitText("#subtitle", {
      type: "chars",
    });
    const timeline = gsap.timeline();
    timeline.set("#btn-group", {
      opacity: 0,
      translateY: 10,
    });
    timeline.from(modelSubtitle.chars, {
      duration: 0.2,
      opacity: 0,
      x: 10,
      ease: "power3.out",
      stagger: 0.01,
      delay: 0.2,
    });

    timeline.from("#btn-group", {
      duration: 0.5,
      opacity: 0,
      translateY: 10,
      delay: -0.4,
      ease: "power3.out",
    });
  }, []);
  return (
    <main id="smooth-content">
      <section
        className="flex flex-col h-screen"
        style={{
          backgroundImage: `url(${homeTop})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      >
        <div className="items-center justify-center flex-1 w-full flex px-4">
          <div className="space-y-4 text-center max-w-6xl mx-auto">
            <div className="flex flex-col md:flex-row items-center justify-center gap-4">
              <img
                src="/logo.svg"
                alt="logo"
                fetchPriority="high"
                className="size-12 md:size-16 -translate-y-2"
              />
              <h1 className="text-3xl md:text-4xl lg:text-5xl align-text-bottom font-bold bg-gradient-to-r pb-2 from-[#594eff] via-[#8667f1] to-[#5a73fd] bg-clip-text text-transparent">
                启创·InnoSpark, 做有温度的教育大模型
              </h1>
            </div>
            <h2
              id="subtitle"
              className="text-foreground/70 text-sm md:text-xl lg:text-2xl leading-relaxed px-4"
            >
              <span className="font-semibold">InnoSpark</span>
              <br className="md:hidden" />
              致力于打造新一代人工智能技术，为教育行业提供智能化解决方案，助力教育行业数智化转型升级
            </h2>
            <div
              id="btn-group"
              className="flex flex-col sm:flex-row gap-4 sm:gap-8 justify-center mt-8 md:mt-16"
            >
              <Button
                variant={"default"}
                className="rounded-full text-lg px-16 py-7"
              >
                <Link to="/chat" preload="render" >开始对话</Link>
              </Button>
              <Button
                variant={"outline"}
                className="rounded-full text-lg px-16 py-7"
                size={"lg"}
              >
                <a
                  href="https://innospark.aiecnu.cn/innospark/docs"
                  target="_blank"
                  rel="noreferrer"
                >
                  了解更多
                </a>
              </Button>
            </div>
          </div>
        </div>
        <div className="w-full min-h-64 md:h-96 bg-chat flex flex-col justify-center items-center gap-4 md:gap-8 px-4">
          <h3 className="text-center text-xl md:text-2xl font-semibold text-foreground/80">
            多端设备体验
          </h3>
          <div className="flex">
            {[
              {
                text: "IOS/Android",
                img: phone,
              },
              {
                text: "iPad",
                img: pad,
              },
              {
                text: "PC",
                img: pc,
              },
            ].map((item) => (
              <div
                className="lg:shadow-[3px_3px_20px_#DAE9FF] lg:w-64 text-foreground/55 mx-4 flex justify-center flex-col items-center aspect-video rounded-4xl "
                key={item.text}
              >
                <img
                  src={item.img}
                  alt={item.text}
                  className="max-w-full max-h-16 md:max-h-20 object-contain"
                />
                <p className="mt-2 text-sm md:text-base">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      {midList.map((item, index) => (
        <section className="flex relative overflow-hidden" key={item.title}>
          <img
            src={item.img}
            alt={item.title}
            className={`w-full h-auto min-h-[300px] md:h-auto ani-img-${index} object-cover`}
          />
          <div
            className={cn([
              "absolute top-0 h-full w-1/2 flex justify-center items-center",
              (index & 1) === 0 ? "left-0" : "right-0",
            ])}
          >
            <div className="text-center md:text-left">
              <h3
                className={`transition-none md:text-4xl font-semibold ani-title-${index}`}
              >
                {item.title}
              </h3>
              <div className={`space-y-1 py-6 ani-p-${index}`}>
                {item.description.map((item) => (
                  <p
                    className="text-sm text-foreground/70 md:text-lg"
                    key={item}
                  >
                    {item}
                  </p>
                ))}
              </div>
              <Link to="/chat">
                <Button
                  variant="outline"
                  className={cn([
                    `ani-btn-${index} `,
                    "transition-colors border-primary text-primary rounded-full bg-transparent hover:bg-primary hover:text-primary-foreground py-3 md:py-5 px-6 md:px-8 text-sm md:text-base",
                  ])}
                >
                  <span className="ml-3">立刻体验</span>
                  <ChevronRightIcon className="size-4 mr-2" />
                </Button>
              </Link>
            </div>
          </div>
        </section>
      ))}
      <footer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 px-6 py-12 md:py-24">
        <FooterSection
          title="InnoSpark"
          icon="/logo.svg"
          links={[{ text: "引领 AI 技术创新\n为企业提供智能化解决方案" }]}
        />
        <FooterSection
          title="产品"
          links={[
            { text: "AI对话", href: "/chat" },
            { text: "智能助手", href: "/chat/agent" },
            // { text: "行业解决方案" },
          ]}
        />
        <FooterSection
          title="资源"
          links={[
            {
              text: "开发文档",
              href: "https://zcnvvrmhxi9w.feishu.cn/wiki/BUAAwhXK3i5dFGkdROKcpOYtnig",
            },
            {
              text: "API 参考",
              href: "https://zcnvvrmhxi9w.feishu.cn/wiki/P6onwPbqJi4bZqkZpedcaLkonUc",
            },
            // { text: "技术博客" },
          ]}
        />
        <FooterSection
          title="联系我们"
          links={[
            {
              text: "商务合作",
              href: "https://aiedu.ecnu.edu.cn/",
            },
            { text: "加入我们", href: "https://aiedu.ecnu.edu.cn/" },
            // { text: "媒体咨询" },
          ]}
        />
      </footer>
      <Separator />
      <footer className="text-foreground/55 text-center py-8 pb-24">
        © 2024 lnnoSpark. 保留所有权利
      </footer>
    </main>
  );
};

export default HomePage;

const FooterSection = ({
  title,
  icon,
  links,
}: {
  title: string;
  icon?: string;
  links: {
    text: string;
    href?: string;
  }[];
}) => {
  return (
    <section>
      <div className="flex items-center gap-2 mb-4">
        {icon && <img src={icon} alt="logo" className="w-6" />}
        <h5 className="text-foreground/80 font-bold text-lg">{title}</h5>
      </div>
      <div className="text-foreground/55 flex flex-col gap-2">
        {links.map((link) =>
          link.href ? (
            <a
              href={link.href}
              rel="noreferrer"
              className="hover:text-primary hover:underline"
              target="_blank"
              key={link.text}
            >
              {link.text}
            </a>
          ) : (
            <p className="whitespace-pre-wrap" key={link.text}>
              {link.text}
            </p>
          ),
        )}
      </div>
    </section>
  );
};
