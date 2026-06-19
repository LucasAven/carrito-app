const AuthLayout = ({ children }: { children: React.ReactNode }) => (
  <div className="mx-auto flex min-h-[80vh] w-full max-w-sm flex-col justify-center">
    {children}
  </div>
);

export default AuthLayout;
