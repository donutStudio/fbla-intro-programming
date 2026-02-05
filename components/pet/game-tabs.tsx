import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Activity,
  BarChart3,
  HelpCircle,
  MessageSquare,
  Sparkles,
  Users,
  Wand2,
} from "lucide-react";
import { AnalyticsDashboard } from "./analytics-dashboard";
import { AskPetPal } from "./ask-petpal";
import { HelpPanel } from "./help-panel";
import { AboutPanel } from "./about-panel";
import { AICustomizer } from "./ai-customizer";
import { CareTab } from "./care-tab";
import { FriendsPanel } from "./friends-panel";

type GameTabsProps = {
  activeTab: string;
  onTabChange: (value: string) => void;
  isInteracting: boolean;
  onInteraction: () => void;
};

const TAB_ITEMS = [
  { value: "care", label: "Care", icon: Activity },
  { value: "analytics", label: "Analytics", icon: BarChart3 },
  { value: "ask", label: "Ask PetPal", icon: MessageSquare },
  { value: "customize", label: "Customize", icon: Wand2 },
  { value: "friends", label: "Friends", icon: Users },
  { value: "help", label: "Help", icon: HelpCircle },
  { value: "about", label: "About", icon: Sparkles },
] as const;

export function GameTabs({
  activeTab,
  onTabChange,
  isInteracting,
  onInteraction,
}: GameTabsProps) {
  return (
    <Tabs value={activeTab} onValueChange={onTabChange}>
      <TabsList className="w-full flex flex-wrap justify-start gap-2">
        {TAB_ITEMS.map((tab) => {
          const Icon = tab.icon;
          return (
            <TabsTrigger key={tab.value} value={tab.value} className="gap-2">
              <Icon className="h-4 w-4" />
              {tab.label}
            </TabsTrigger>
          );
        })}
      </TabsList>

      <TabsContent value="care" className="mt-6">
        <CareTab isInteracting={isInteracting} onInteraction={onInteraction} />
      </TabsContent>

      <TabsContent value="analytics" className="mt-6">
        <AnalyticsDashboard />
      </TabsContent>

      <TabsContent value="ask" className="mt-6">
        <AskPetPal />
      </TabsContent>

      <TabsContent value="customize" className="mt-6">
        <AICustomizer />
      </TabsContent>

      <TabsContent value="friends" className="mt-6">
        <FriendsPanel />
      </TabsContent>

      <TabsContent value="help" className="mt-6">
        <HelpPanel />
      </TabsContent>

      <TabsContent value="about" className="mt-6">
        <AboutPanel />
      </TabsContent>
    </Tabs>
  );
}
