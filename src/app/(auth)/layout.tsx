type AuthLayoutProps = { children: React.ReactNode };

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <main id="main" tabIndex={-1} className="flex min-h-dvh flex-col focus:outline-none">
      {children}
    </main>
  );
}
