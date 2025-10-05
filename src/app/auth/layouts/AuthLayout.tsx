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
  password: string;
  setPhone: Dispatch<SetStateAction<string>>;
  setverificationCode: Dispatch<SetStateAction<string>>;
  setPassword: Dispatch<SetStateAction<string>>;
}>({
  phone: "",
  verificationCode: "",
  password: "",
  setPhone: () => {},
  setverificationCode: () => {},
  setPassword: () => {},
});

export default function AuthLayout() {
  const [phone, setPhone] = useState("");
  const [verificationCode, setverificationCode] = useState("");
  const [password, setPassword] = useState("");
  return (
    <div
      className="min-h-screen bg-cover bg-center bg-no-repeat bg-fixed relative grid grid-cols-2"
      style={{ backgroundImage: "url(/brand.png)" }}
    >
      {/* 左侧品牌名 */}
      <div className="flex items-center justify-center">
        <div className="space-y-4 transform -translate-y-10">
          <h1 className="text-5xl font-bold bg-gradient-to-r pb-2 from-[#594eff] via-[#8667f1] to-[#5a73fd] bg-clip-text text-transparent">
            启创·InnoSpark
          </h1>
          <h2 className="text-[#5a5c72] text-4xl">做有温度的教育大模型</h2>
        </div>
      </div>
      {/* 右侧内容区域 */}
      <div className="flex items-center">
        <AuthContext.Provider
          value={{
            phone,
            verificationCode,
            password,
            setPhone,
            setverificationCode,
            setPassword,
          }}
        >
          <Outlet />
        </AuthContext.Provider>
      </div>
    </div>
  );
}
