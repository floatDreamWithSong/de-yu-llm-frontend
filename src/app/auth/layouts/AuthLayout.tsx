import { Outlet } from '@tanstack/react-router';

export default function AuthLayout() {
  return (
    <div
      className="min-h-screen bg-cover bg-center bg-no-repeat bg-fixed relative grid grid-cols-2"
      style={{ backgroundImage: "url(/brand.png)" }}
    >
      {/* 左侧品牌名 */}
      <div className="flex items-center justify-center">
          <div className="space-y-4 transform -translate-y-10">
            <h1 className="text-[#1677ff] text-shadow-2xs text-shadow-white text-6xl">
            张江高科·高科芯
            </h1>
            <h2 className="text-[#5a5c72] text-4xl">
            以智育慧，"芯" 航程点亮孩子未来
            </h2>
          </div>
      </div>
      {/* 右侧内容区域 */}
      <div className="flex items-center">
        <div className="bg-white w-1/2 max-w-[500px] aspect-[5/6] rounded-4xl p-12 min-w-[400px]">
          <div className="w-full h-full">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
}
