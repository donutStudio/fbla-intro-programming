import { PetAvatar } from "./pet-avatar";
import { PetStats } from "./pet-stats";
import { PetActions } from "./pet-actions";
import { FinancePanel } from "./finance-panel";
import { PetInsights } from "./pet-insights";

type CareTabProps = {
  isInteracting: boolean;
  onInteraction: () => void;
};

export function CareTab({ isInteracting, onInteraction }: CareTabProps) {
  return (
    <div className="grid md:grid-cols-3 gap-6">
      <div className="md:col-span-2 space-y-6">
        <div className="bg-card rounded-2xl p-6 md:p-8 shadow-sm border border-border">
          <PetAvatar isInteracting={isInteracting} />
        </div>
        <div className="grid lg:grid-cols-2 gap-4">
          <PetStats />
          <PetActions onInteraction={onInteraction} />
          <PetInsights />
        </div>
      </div>

      <div className="hidden md:block">
        <div className="sticky top-24">
          <FinancePanel />
        </div>
      </div>
    </div>
  );
}
