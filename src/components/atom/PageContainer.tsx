const PageContainer = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="h-screen w-screen bg-gradient-to-br from-blue-500 via-blue-400 to-blue-200 pt-16 overflow-auto">
      <div className="max-w-screen mx-auto h-fit">{children}</div>
    </div>
  );
};

export default PageContainer;
