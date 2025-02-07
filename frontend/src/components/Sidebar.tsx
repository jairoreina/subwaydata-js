interface SidebarProps {
  isSidebarOpen: boolean;
  setIsSidebarOpen: (isSidebarOpen: boolean) => void;
}

export function Sidebar({ isSidebarOpen, setIsSidebarOpen }: SidebarProps) {
  return (
    <div
      className={`bg-gray-50 hover:bg-gray-200 min-h-screen border-r border-gray-300 transition-all duration-300 ease-in-out
        shadow-[inset_-1px_0_5px_rgba(0,0,0,0.1)] ${isSidebarOpen ? 'w-96' : 'w-16'} 
        flex items-start cursor-pointer relative`}
      onClick={() => setIsSidebarOpen(!isSidebarOpen)}
    >
      {/* Sidebar Text */}
      {/* <div
        className={`absolute top-1/2 -translate-y-1/2 text-gray-600 select-none [writing-mode:vertical-lr] rotate-180 transition-all duration-300 ease-in-out
          ${isSidebarOpen ? 'right-4' : 'left-1/2 -translate-x-1/2'}`}
      >
        {isSidebarOpen ? 'Hide saved queries' : 'Show saved queries'}
      </div> */}
    </div>
  );
}

export default Sidebar;
