import Button from "../atom/Button";

interface TabsListProps {
  tabs: { tab: string; icon: React.ElementType }[];
  onChange: (tab: string) => void;
  activeTab: string;
}

export const TabsList = ({ onChange, tabs, activeTab }: TabsListProps) => {
  return (
    <div className="border-b border-gray-200 rounded-t-md">
      <nav className="-mb-px flex">
        {tabs.map(({ tab, icon }) => (
          <Button
            variant="ghost"
            size="full"
            onClick={() => onChange(tab)}
            icon={icon}
            className={`${
              activeTab === tab
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            } flex items-center w-1/5 py-4 px-1 border-b-2 text-sm`}
          >
            {tab.slice(0, 1).toUpperCase() + tab.slice(1)}
          </Button>
        ))}
      </nav>
    </div>
  );
};
