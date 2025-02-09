interface TooltipProps {
    text: string;
    children: React.ReactNode;
    position?: 'top' | 'bottom' | 'left' | 'right';
  }
  
  export function Tooltip({ text, children, position = 'top' }: TooltipProps) {
    const positionClasses = {
      top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
      bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
      left: 'right-full top-1/2 -translate-y-1/2 mr-2',
      right: 'left-full top-1/2 -translate-y-1/2 ml-2',
    };
  
    const arrowClasses = {
      top: 'bottom-[-4px] left-1/2 -translate-x-1/2',
      bottom: 'top-[-4px] left-1/2 -translate-x-1/2',
      left: 'right-[-4px] top-1/2 -translate-y-1/2',
      right: 'left-[-4px] top-1/2 -translate-y-1/2',
    };
  
    return (
      <div className="relative group inline-block">
        {children}
        <div
          className={`absolute ${positionClasses[position]} scale-0 group-hover:scale-100 
            opacity-0 group-hover:opacity-100 transition-all duration-200 z-50
            whitespace-nowrap rounded bg-gray-800 px-2 py-1 text-s text-white shadow-lg`}
        >
          {text}
          {/* Tooltip Arrow */}
          <div
            className={`absolute w-2 h-2 bg-gray-800 rotate-45 ${arrowClasses[position]}`}
          />
        </div>      
      </div>
    );
  }
  
  export default Tooltip;
  