import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import SplitText from "gsap/SplitText";
gsap.registerPlugin(SplitText);

export const useTitleAni = ({title, subtitle}: {title: string, subtitle: string}) => {
  useGSAP(() => {
    const modelTitle = new SplitText(title, {
      type: "chars",
    });
    gsap.from(modelTitle.chars, {
      duration: 0.8,
      opacity: 0,
      x: 40,
      ease: "power3.out",
      stagger: 0.01,
      delay: 0.2,
    });
    const modelSubtitle = new SplitText(subtitle, {
      type: "chars",
    });
    gsap.from(modelSubtitle.chars, {
      duration: 0.3,
      opacity: 0,
      y: 10,
      ease: "power3.out",
      stagger: 0.01,
      delay: 0.6,
    });
  }, []);
}