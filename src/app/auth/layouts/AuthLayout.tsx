import { Outlet } from "@tanstack/react-router";
import {
  createContext,
  useState,
  type Dispatch,
  type SetStateAction,
} from "react";

export const AuthContext = createContext<{
  phone: string;
  verificationCode: string;
  setPhone: Dispatch<SetStateAction<string>>;
  setverificationCode: Dispatch<SetStateAction<string>>;
}>({
  phone: "",
  verificationCode: "",
  setPhone: () => {},
  setverificationCode: () => {},
});

export default function AuthLayout() {
  const [phone, setPhone] = useState("");
  const [verificationCode, setverificationCode] = useState("");
  return (
    <div
      className="min-h-screen bg-cover bg-center bg-no-repeat bg-fixed relative grid grid-cols-2"
      style={{ backgroundImage: "url(/chat/bg.png)" }}
    >
      {/* 左侧品牌名 */}
      <div className="flex items-center justify-center">
        <div className="space-y-4 transform -translate-y-10 w-full flex flex-col items-center">
            <img src="/fake-auth-title.png" className="w-2/3" alt="张江高科德育大模型" />
          {/* <h1 className="text-5xl font-bold bg-gradient-to-r pb-2 from-[#594eff] via-[#8667f1] to-[#5a73fd] bg-clip-text text-transparent">
          </h1> */}
          <h2 className="text-[#5a5c72] text-4xl">以智育慧， “芯” 航程点亮孩子未来</h2>
        </div>
      </div>
      {/* 右侧内容区域 */}
      <div className="flex items-center">
        <AuthContext.Provider
          value={{
            phone,
            verificationCode,
            setPhone,
            setverificationCode,
          }}
        >
          <Outlet />
        </AuthContext.Provider>
      </div>
    </div>
  );
}
