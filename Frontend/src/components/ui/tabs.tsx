import { cn } from "@/lib/utils";

interface TabsProps {
  tabs: string[];
  active: string;
  onChange: (value: string) => void;
}

export function Tabs({ tabs, active, onChange }: TabsProps) {
  return (
    <div className="inline-flex max-w-full overflow-x-auto rounded-md border border-white/10 bg-white/6 p-1">
      {tabs.map((tab) => (
        <button
          key={tab}
          type="button"
          onClick={() => onChange(tab)}
          className={cn(
            "min-h-9 whitespace-nowrap rounded px-4 text-sm font-medium text-slate-300 transition",
            active === tab ? "bg-white text-slate-950 shadow-sm" : "hover:bg-white/10 hover:text-white"
          )}
        >
          {tab}
        </button>
      ))}
    </div>
  );
}
