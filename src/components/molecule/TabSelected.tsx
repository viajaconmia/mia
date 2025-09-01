export const TabSelected = ({
  tabs = {
    unknow: (
      <>
        <h1>No se encontro el Tab</h1>
      </>
    ),
  },
  selected = "unknow",
}: {
  tabs: Record<string, React.ReactNode>;
  selected?: string;
}) => {
  return <>{tabs[selected] && tabs[selected]}</>;
};
