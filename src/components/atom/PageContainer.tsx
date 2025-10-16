import useAuth from "../../hooks/useAuth";

const PageContainer = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  return (
    <div className={`h-screen w-screen`}>
      <div
        className={`max-w-screen mx-auto h-screen overflow-auto bg-gradient-to-br from-blue-600 via-blue-500 to-blue-300 ${
          user ? "pb-18 md:pt-16 md:pb-0" : ""
        }`}
      >
        {children}
      </div>
    </div>
  );
};

export default PageContainer;
