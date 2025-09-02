import Button from "../atom/Button";

interface TabsListProps {
  tabs: { tab: string; icon: React.ElementType }[];
  onChange: (tab: string) => void;
  activeTab: string;
}
const medidas = [
  "@xs:flex-row @xs:gap-2 @xs:text-sm",
  "@sm:flex-row @sm:gap-2 @sm:text-sm",
  "@md:flex-row @md:gap-2 @md:text-sm",
  "@lg:flex-row @lg:gap-2 @lg:text-sm",
  "@xl:flex-row @xl:gap-2 @xl:text-sm",
  "@2xl:flex-row @2xl:gap-2 @2xl:text-sm",
  "@3xl:flex-row @3xl:gap-2 @3xl:text-sm",
];

export const TabsList = ({ onChange, tabs, activeTab }: TabsListProps) => {
  return (
    <div className="border-b border-gray-200 rounded-t-md @container">
      <nav className={`-mb-px flex`}>
        {tabs.map(({ tab, icon }) => (
          <div className=" w-full">
            <Button
              key={tab}
              variant="ghost"
              size="full"
              onClick={() => onChange(tab)}
              icon={icon}
              className={`${
                activeTab !== tab && "text-gray-500"
              } py-4 text-xs flex-col gap-[2px] px-0  ${
                tabs.length < 3 ? "" : medidas[tabs.length - 1]
              }`}
            >
              {tab.slice(0, 1).toUpperCase() + tab.slice(1)}
            </Button>
          </div>
        ))}
      </nav>
    </div>
  );
};
