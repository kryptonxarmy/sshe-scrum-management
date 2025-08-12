import { List, Clock, Loader, CheckCircle } from "lucide-react";

const TabNavigation = ({ activeTab, setActiveTab }) => {
  const tabs = [
    { id: "all", name: "All Tasks", icon: List },
    { id: "todo", name: "To Do", icon: Clock },
    { id: "progress", name: "In Progress", icon: Loader },
    { id: "done", name: "Done", icon: CheckCircle },
  ];

  return (
    <nav className="bg-white px-6 md:px-8 shadow-sm border-b border-gray-200 sticky top-[89px] z-10">
      <ul className="flex gap-4 md:gap-8 overflow-x-auto">
        {tabs.map((tab) => {
          const IconComponent = tab.icon;
          return (
            <li
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                py-4 cursor-pointer font-medium border-b-3 transition-all duration-300 relative whitespace-nowrap
                hover:text-blue-600 hover:border-blue-600
                ${activeTab === tab.id ? "text-blue-600 border-blue-600" : "text-slate-600 border-transparent"}
              `}
            >
              <div className="flex items-center gap-2">
                <IconComponent size={16} />
                <span className="hidden sm:inline">{tab.name}</span>
                <span className="sm:hidden">{tab.name.split(" ")[0]}</span>
              </div>
            </li>
          );
        })}
      </ul>
    </nav>
  );
};

export default TabNavigation;
