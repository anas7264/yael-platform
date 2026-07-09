export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-bg-primary relative overflow-hidden p-4">
      <div className="absolute inset-0 opacity-[0.03] bg-[linear-gradient(var(--border-subtle)_1px,transparent_1px),linear-gradient(90deg,var(--border-subtle)_1px,transparent_1px)] bg-[size:32px_32px]" />
      <div className="w-full max-w-md relative z-10">
        {children}
      </div>
    </div>
  );
}
