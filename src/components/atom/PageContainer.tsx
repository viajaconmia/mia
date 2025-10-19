import useAuth from "../../hooks/useAuth";

const PageContainer = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  return (
    <div className={`h-screen w-screen`}>
      <div
        className={`max-w-screen mx-auto h-[100dvh] md:h-[100vh] overflow-auto bg-gradient-to-br from-blue-600 via-blue-500 to-blue-300 ${
          user ? "pb-6 md:pt-16 md:pb-0" : "pt-16"
        }`}
      >
        {children}
      </div>
    </div>
  );
};

export default PageContainer;
