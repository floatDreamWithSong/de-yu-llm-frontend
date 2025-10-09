import { Button } from "@/components/ui/button";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuList,
} from "@/components/ui/navigation-menu";
import { Link, Outlet } from "@tanstack/react-router";

const navLinks = [
  {
    to: (
      <a
        href={"https://innospark.aiecnu.cn/innospark/docs"}
        target="_blank"
        rel="noreferrer"
      >
        产品介绍
      </a>
    ),
  },
  {
    to: (
      <a
        href={
          "https://innospark.aiecnu.cn/innospark/docs/category/%E4%BD%BF%E7%94%A8%E6%8C%87%E5%8D%97"
        }
        target="_blank"
        rel="noreferrer"
      >
        说明文档
      </a>
    ),
  },
  {
    to: (
      <a href={"https://new-api.aiecnu.net/"} target="_blank" rel="noreferrer">
        开放平台
      </a>
    ),
  },
  {
    to: <a href=".">关于我们</a>,
  },
];
const HomeLayout = () => {

  return (
    <div id="smooth-wrapper" className="h-screen">
      <NavigationMenu className="w-full flex justify-around h-16 sticky top-0 left-0 z-50 bg-chat">
        <h1 className="items-center flex justify-center">
          <img src="/logo.svg" className="h-8 mx-2" alt="logo" />
          <span className="text-primary font-semibold text-3xl">
            启创·
            <span className="text-2xl">
              InnoSpark
              {import.meta.env.VITE_ENV === "test" && "（内测版）"}
            </span>
          </span>
        </h1>
        <NavigationMenuList>
          {navLinks.map((link, ind) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: 链接固定
            <NavigationMenuItem key={ind}>
              <Button variant="link" className="w-full text-base text-foreground hover:text-primary">
                {link.to}
              </Button>
            </NavigationMenuItem>
          ))}
          <NavigationMenuItem className="ml-6">
            <Link to="/auth/login" search={{ redirect: "/" }}>
              <Button
                variant="default"
                className="w-full text-base rounded-full px-6"
              >
                登录
              </Button>
            </Link>
          </NavigationMenuItem>
          {/* <NavigationMenuItem>
        <NavigationMenuTrigger>Item One</NavigationMenuTrigger>
        <NavigationMenuContent>
          <NavigationMenuLink>Link</NavigationMenuLink>
        </NavigationMenuContent>
      </NavigationMenuItem> */}
        </NavigationMenuList>
      </NavigationMenu>
      <Outlet />
    </div>
  );
};

export default HomeLayout;
