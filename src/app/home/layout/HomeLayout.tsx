import { Button } from "@/components/ui/button";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuList,
} from "@/components/ui/navigation-menu";
import { tokenStore } from "@/lib/request";
import { Link, Outlet } from "@tanstack/react-router";
import { motion } from "motion/react";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { EXTERNAL_LINKS } from "@/utils/constants/link";

const navLinks = [
  {
    to: (
      <a
        href={EXTERNAL_LINKS.INTRODUCTION}
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
        href={EXTERNAL_LINKS.USAGE_GUIDE}
        target="_blank"
        rel="noreferrer"
      >
        使用指南
      </a>
    ),
  },
  {
    to: (
      <a href={EXTERNAL_LINKS.OPEN_PLATFORM} target="_blank" rel="noreferrer">
        开放平台
      </a>
    ),
  },
  {
    to: <a href={EXTERNAL_LINKS.CONTACT_US}>关于我们</a>,
  },
];
const HomeLayout = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <motion.div id="smooth-wrapper" className="h-screen">
      {/* Desktop Navigation */}
      <NavigationMenu className="hidden md:flex w-full justify-around h-16 sticky top-0 left-0 z-50 bg-chat px-4">
        <motion.div
          dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
          drag="x"
          dragElastic={0.1}
          dragMomentum={false}
        >
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
        </motion.div>
        <NavigationMenuList className="flex items-center gap-2">
          {navLinks.map((link, ind) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: 链接固定
            <NavigationMenuItem key={ind}>
              <Button
                variant="link"
                className="text-base text-foreground hover:text-primary whitespace-nowrap"
              >
                {link.to}
              </Button>
            </NavigationMenuItem>
          ))}
          <NavigationMenuItem className="ml-4">
            {tokenStore.get() ? (
              <img
                className="rounded-full"
                src="/default-user.png"
                alt="avatar"
                width={40}
                height={40}
              />
            ) : (
              <Link to="/auth/login" search={{ redirect: "/" }}>
                <Button
                  variant="default"
                  className="text-base rounded-full px-6"
                >
                  登录
                </Button>
              </Link>
            )}
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>

      {/* Mobile Navigation */}
      <div className="md:hidden">
        <div className="flex items-center justify-between h-16 sticky top-0 left-0 z-50 bg-chat px-4">
            <h1 className="flex items-center">
              <img src="/logo.svg" className="h-6 mr-2" alt="logo" />
              <span className="text-primary font-semibold text-xl">
                启创·
                <span className="text-lg">
                  InnoSpark
                  {import.meta.env.VITE_ENV === "test" && (
                    <span className="text-xs">（内测版）</span>
                  )}
                </span>
              </span>
            </h1>

          <div className="flex items-center gap-3">
            {tokenStore.get() ? (
              <img
                className="rounded-full"
                src="/default-user.png"
                alt="avatar"
                width={32}
                height={32}
              />
            ) : (
              <Link to="/auth/login" search={{ redirect: "/" }}>
                <Button
                  variant="default"
                  className="text-sm rounded-full px-4 py-2"
                >
                  登录
                </Button>
              </Link>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="h-10 w-10"
            >
              {isMobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Menu Overlay */}
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="absolute top-16 left-0 right-0 z-40 bg-chat border-b border-border/50"
          >
            <div className="flex flex-col p-4 space-y-3">
              {navLinks.map((link, ind) => (
                // biome-ignore lint/suspicious/noArrayIndexKey: 链接固定
                <Button
                  key={ind}
                  variant="ghost"
                  className="justify-start text-base text-foreground hover:text-primary hover:bg-accent"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {link.to}
                </Button>
              ))}
            </div>
          </motion.div>
        )}
      </div>

      <Outlet />
    </motion.div>
  );
};

export default HomeLayout;
