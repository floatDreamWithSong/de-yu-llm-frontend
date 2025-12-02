const MobileBanner = () => {
  return (
    <div className="space-y-3 p-10 pt-16">
      <div className="flex items-center justify-center gap-4">
        <img src="/logo.svg" alt="Logo" className="w-8 h-8" />
        <h1 className="text-3xl font-bold bg-gradient-to-r from-[#594eff] via-[#8667f1] to-[#5a73fd] bg-clip-text text-transparent">
          启创·<span className="text-2xl">InnoSpark</span>
        </h1>
      </div>
      <h2 className="text-center text-xl font-bold bg-gradient-to-r from-[#594eff] via-[#8667f1] to-[#5a73fd] bg-clip-text text-transparent">
        做有温度的教育大模型
      </h2>
    </div>
  );
};

export default MobileBanner;
