export default function NotFound() {
  return (
    <div className="flex min-h-[100dvh] items-center justify-center bg-[#05070a] px-4 text-center text-white">
      <div>
        <p className="mb-2 font-mono text-xs tracking-[0.2em] text-white/40">404</p>
        <h1 className="mb-3 font-serif text-3xl">Sayfa bulunamadı</h1>
        <p className="mb-6 text-sm text-white/55">Aradığınız adres mevcut değil.</p>
        <a href="/" className="text-sm text-cyan-300 underline-offset-4 hover:underline">
          Ana sayfaya dön
        </a>
      </div>
    </div>
  );
}
