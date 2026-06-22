const AuthLayout = ({ children }: { children: React.ReactNode }) => (
  <div className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center">
    {children}
  </div>
);

export default AuthLayout;
