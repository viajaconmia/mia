const PageContainer = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="h-screen w-screen pt-16">
      <div className="max-w-screen mx-auto h-full overflow-auto bg-gradient-to-br from-blue-600 via-blue-500 to-blue-300 ">
        {children}
      </div>
    </div>
  );
};

export default PageContainer;
