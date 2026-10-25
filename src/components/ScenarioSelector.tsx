import { Coffee, Briefcase, GraduationCap, Utensils, Flame, Plane, LucideIcon } from 'lucide-react';
import { Scenario } from '../types';

const ICON_MAP: Record<string, LucideIcon> = {
  Coffee: Coffee,
  Briefcase: Briefcase,
  GraduationCap: GraduationCap,
  Utensils: Utensils,
  Flame: Flame,
  Plane: Plane
};

interface ScenarioSelectorProps {
  scenarios: Scenario[];
  selectedScenarioId: string;
  onSelectScenario: (id: string) => void;
  onSelectStarter?: (starter: string) => void;
}

export default function ScenarioSelector({
  scenarios,
  selectedScenarioId,
  onSelectScenario,
}: ScenarioSelectorProps) {
  const activeScenario = scenarios.find(s => s.id === selectedScenarioId) || scenarios[0];

  return (
    <div className="flex flex-col gap-3.5">
      {/* Horizontal Scenarios Carousel / Selector */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1.5 scrollbar-thin">
        {scenarios.map((scenario) => {
          const isSelected = scenario.id === selectedScenarioId;
          const Icon = ICON_MAP[scenario.icon] || Coffee;

          return (
            <button
              key={scenario.id}
              onClick={() => onSelectScenario(scenario.id)}
              className={`flex-shrink-0 flex items-center gap-2.5 px-3.5 py-2 rounded-xl text-xs font-medium border transition-all text-left ${
                isSelected
                  ? 'bg-gradient-to-r from-blue-950/80 to-slate-900 border-blue-500/80 text-white shadow-[0_0_15px_rgba(59,130,246,0.3)] ring-1 ring-blue-400/50'
                  : 'bg-slate-900/40 border-slate-800/80 text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 hover:border-slate-700'
              }`}
            >
              <div className={`p-1.5 rounded-lg ${isSelected ? 'bg-blue-500 text-white' : 'bg-slate-800 text-slate-400'}`}>
                <Icon className="w-3.5 h-3.5" />
              </div>
              <div>
                <div className="font-semibold leading-tight">{scenario.title}</div>
                <div className="text-[10px] opacity-75 font-mono">{scenario.difficulty}</div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Active Scenario Details & Conversation Starters */}
      {activeScenario && (
        <div className="p-3.5 rounded-xl bg-slate-900/50 border border-slate-800 backdrop-blur-sm">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-200">
                Persona: <span className="text-rose-400 font-normal">{activeScenario.role}</span>
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-800 text-cyan-300 border border-slate-700">
                Target: {activeScenario.cefr_level}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
