"use client";

import { cn } from "@/lib/utils";
import { 
  Video, 
  BarChart3, 
  Users, 
  Brain, 
  Settings,
  Instagram,
  Youtube,
  Music
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: "gallery" | "analytics" | "competitors" | "insights") => void;
}

const menuItems = [
  {
    id: "gallery" as const,
    label: "動画ギャラリー",
    icon: Video,
    description: "収集した動画を閲覧"
  },
  {
    id: "analytics" as const,
    label: "分析",
    icon: BarChart3,
    description: "パフォーマンス指標"
  },
  {
    id: "competitors" as const,
    label: "競合分析",
    icon: Users,
    description: "競合他社との比較"
  },
  {
    id: "insights" as const,
    label: "AI洞察",
    icon: Brain,
    description: "AI搭載の推奨事項"
  }
];

const platforms = [
  { name: "Instagram", icon: Instagram, color: "text-pink-600" },
  { name: "YouTube", icon: Youtube, color: "text-red-600" },
  { name: "TikTok", icon: Music, color: "text-black" }
];

export function Sidebar({ activeTab, onTabChange }: SidebarProps) {
  return (
    <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
      {/* Logo */}
      <div className="p-6">
        <h1 className="text-xl font-bold text-gray-900">SNS動画ツール</h1>
        <p className="text-sm text-gray-500 mt-1">分析プラットフォーム</p>
      </div>

      <Separator />

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <Button
              key={item.id}
              variant={activeTab === item.id ? "default" : "ghost"}
              className={cn(
                "w-full justify-start h-auto p-3",
                activeTab === item.id 
                  ? "bg-blue-50 text-blue-700 border-blue-200" 
                  : "text-gray-700 hover:bg-gray-50"
              )}
              onClick={() => onTabChange(item.id)}
            >
              <Icon className="h-5 w-5 mr-3" />
              <div className="text-left">
                <div className="font-medium">{item.label}</div>
                <div className="text-xs opacity-70">{item.description}</div>
              </div>
            </Button>
          );
        })}
      </nav>

      <Separator />

      {/* Platforms */}
      <div className="p-4">
        <h3 className="text-sm font-medium text-gray-900 mb-3">プラットフォーム</h3>
        <div className="space-y-2">
          {platforms.map((platform) => {
            const Icon = platform.icon;
            return (
              <div key={platform.name} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50">
                <Icon className={cn("h-4 w-4", platform.color)} />
                <span className="text-sm text-gray-700">{platform.name}</span>
              </div>
            );
          })}
        </div>
      </div>

      <Separator />

      {/* Settings */}
      <div className="p-4">
        <Button variant="ghost" className="w-full justify-start">
          <Settings className="h-4 w-4 mr-3" />
          設定
        </Button>
      </div>
    </div>
  );
} 