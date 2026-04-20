export default function LoadingScreen() {
  return (
    <div className="w-full h-[100svh] md:max-w-[400px] md:h-[850px] md:max-h-[90svh] md:rounded-[2.5rem] md:border-[8px] md:border-gray-900 md:shadow-2xl bg-white flex flex-col items-center justify-center gap-4">
      <div className="text-5xl animate-bounce">💑</div>
      <p className="text-gray-400 font-bold text-sm">连接中...</p>
    </div>
  )
}
