const PageContainer = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="h-screen w-screen bg-gradient-to-br from-blue-600 via-blue-500 to-blue-300 pt-16 overflow-auto">
      <div className="max-w-screen mx-auto h-fit">{children}</div>
    </div>
  );
};

export default PageContainer;
