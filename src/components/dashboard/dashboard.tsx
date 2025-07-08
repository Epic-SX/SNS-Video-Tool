"use client";

import { useState } from "react";
import { Sidebar } from "./sidebar";
import { Header } from "./header";
import { VideoGallery } from "./video-gallery";
import { Analytics } from "./analytics";
import { CompetitorAnalysis } from "./competitor-analysis";
import { AIInsights } from "./ai-insights";

type ActiveTab = "gallery" | "analytics" | "competitors" | "insights";

export function Dashboard() {
  const [activeTab, setActiveTab] = useState<ActiveTab>("gallery");

  const renderContent = () => {
    switch (activeTab) {
      case "gallery":
        return <VideoGallery />;
      case "analytics":
        return <Analytics />;
      case "competitors":
        return <CompetitorAnalysis />;
      case "insights":
        return <AIInsights />;
      default:
        return <VideoGallery />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-auto p-6">
          {renderContent()}
        </main>
      </div>
    </div>
  );
} 