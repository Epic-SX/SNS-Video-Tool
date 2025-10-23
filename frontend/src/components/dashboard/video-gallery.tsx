"use client";

import { useState } from "react";
import { Filter, Grid, List, Play, Heart, MessageCircle, Share, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Mock data for demonstration
const mockVideos = [
  {
    id: "1",
    title: "2024年夏ファッションコレクション",
    platform: "YouTube",
    brand: "ファッションブランド株式会社",
    thumbnail: "/api/placeholder/300/400",
    duration: "0:30",
    views: 125000,
    likes: 8500,
    comments: 234,
    shares: 156,
    publishedAt: "2024-01-15",
    tags: ["ファッション", "夏", "コレクション"],
    type: "リール",
    engagement: 6.8
  },
  {
    id: "2",
    title: "テクノロジー製品発表",
    platform: "YouTube",
    brand: "テックコープ",
    thumbnail: "/api/placeholder/300/400",
    duration: "1:45",
    views: 89000,
    likes: 3200,
    comments: 89,
    shares: 45,
    publishedAt: "2024-01-14",
    tags: ["テクノロジー", "製品", "発表"],
    type: "ショート",
    engagement: 3.6
  },
  {
    id: "3",
    title: "料理レシピチュートリアル",
    platform: "YouTube",
    brand: "クッキングチャンネル",
    thumbnail: "/api/placeholder/300/400",
    duration: "0:45",
    views: 234000,
    likes: 15600,
    comments: 567,
    shares: 890,
    publishedAt: "2024-01-13",
    tags: ["料理", "レシピ", "チュートリアル"],
    type: "動画",
    engagement: 7.2
  },
  // Add more mock videos...
];

export function VideoGallery() {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [sortBy, setSortBy] = useState("publishedAt");
  const [filterPlatform, setFilterPlatform] = useState("all");

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const getPlatformColor = (platform: string) => {
    switch (platform) {
      case "YouTube": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">動画ギャラリー</h1>
          <p className="text-gray-600">全プラットフォームから収集した動画を閲覧・分析</p>
        </div>
        
        <div className="flex items-center space-x-4">
          {/* View Mode Toggle */}
          <div className="flex items-center border rounded-lg">
            <Button
              variant={viewMode === "grid" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("grid")}
            >
              <Grid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === "list" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("list")}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>

          {/* Filters */}
          <Button variant="outline">
            <Filter className="h-4 w-4 mr-2" />
            フィルター
          </Button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex items-center space-x-4 p-4 bg-white rounded-lg border">
        <Select value={filterPlatform} onValueChange={setFilterPlatform}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="プラットフォーム" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">全プラットフォーム</SelectItem>
            <SelectItem value="youtube">YouTube</SelectItem>
          </SelectContent>
        </Select>

        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="並び替え" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="publishedAt">最新</SelectItem>
            <SelectItem value="views">再生数順</SelectItem>
            <SelectItem value="engagement">エンゲージメント順</SelectItem>
            <SelectItem value="likes">いいね数順</SelectItem>
          </SelectContent>
        </Select>

        <div className="flex-1" />
        
        <div className="text-sm text-gray-500">
          {mockVideos.length} 件の動画が見つかりました
        </div>
      </div>

      {/* Content Tabs */}
      <Tabs defaultValue="all" className="w-full">
        <TabsList>
          <TabsTrigger value="all">全動画</TabsTrigger>
          <TabsTrigger value="ads">広告のみ</TabsTrigger>
          <TabsTrigger value="organic">オーガニック</TabsTrigger>
          <TabsTrigger value="trending">トレンド</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-6">
          {/* Video Grid/List */}
          {viewMode === "grid" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {mockVideos.map((video) => (
                <Card key={video.id} className="group hover:shadow-lg transition-shadow cursor-pointer">
                  <CardContent className="p-0">
                    {/* Thumbnail */}
                    <div className="relative aspect-[3/4] bg-gray-200 rounded-t-lg overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                      <div className="absolute top-2 left-2">
                        <Badge className={getPlatformColor(video.platform)}>
                          {video.platform}
                        </Badge>
                      </div>
                      <div className="absolute top-2 right-2">
                        <Badge variant="secondary">{video.type}</Badge>
                      </div>
                      <div className="absolute bottom-2 right-2 bg-black/70 text-white px-2 py-1 rounded text-xs">
                        {video.duration}
                      </div>
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button size="icon" className="rounded-full">
                          <Play className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-4">
                      <h3 className="font-medium text-sm line-clamp-2 mb-2">{video.title}</h3>
                      <p className="text-xs text-gray-500 mb-3">{video.brand}</p>
                      
                      {/* Stats */}
                      <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                        <div className="flex items-center space-x-3">
                          <div className="flex items-center">
                            <Eye className="h-3 w-3 mr-1" />
                            {formatNumber(video.views)}
                          </div>
                          <div className="flex items-center">
                            <Heart className="h-3 w-3 mr-1" />
                            {formatNumber(video.likes)}
                          </div>
                        </div>
                        <div className="text-green-600 font-medium">
                          {video.engagement}%
                        </div>
                      </div>

                      {/* Tags */}
                      <div className="flex flex-wrap gap-1">
                        {video.tags.slice(0, 2).map((tag) => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                        {video.tags.length > 2 && (
                          <Badge variant="outline" className="text-xs">
                            +{video.tags.length - 2}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            // List View
            <div className="space-y-4">
              {mockVideos.map((video) => (
                <Card key={video.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-4">
                      {/* Thumbnail */}
                      <div className="relative w-24 h-32 bg-gray-200 rounded overflow-hidden flex-shrink-0">
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                        <div className="absolute bottom-1 right-1 bg-black/70 text-white px-1 py-0.5 rounded text-xs">
                          {video.duration}
                        </div>
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <h3 className="font-medium text-lg mb-1 truncate">{video.title}</h3>
                            <p className="text-gray-600 mb-2">{video.brand}</p>
                            
                            <div className="flex items-center space-x-4 text-sm text-gray-500 mb-2">
                              <Badge className={getPlatformColor(video.platform)}>
                                {video.platform}
                              </Badge>
                              <span>{video.publishedAt}</span>
                              <span className="text-green-600 font-medium">{video.engagement}% engagement</span>
                            </div>

                            <div className="flex flex-wrap gap-1">
                              {video.tags.map((tag) => (
                                <Badge key={tag} variant="outline" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          </div>

                          {/* Stats */}
                          <div className="flex items-center space-x-6 text-sm text-gray-500 ml-4">
                            <div className="flex items-center">
                              <Eye className="h-4 w-4 mr-1" />
                              {formatNumber(video.views)}
                            </div>
                            <div className="flex items-center">
                              <Heart className="h-4 w-4 mr-1" />
                              {formatNumber(video.likes)}
                            </div>
                            <div className="flex items-center">
                              <MessageCircle className="h-4 w-4 mr-1" />
                              {formatNumber(video.comments)}
                            </div>
                            <div className="flex items-center">
                              <Share className="h-4 w-4 mr-1" />
                              {formatNumber(video.shares)}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="ads">
          <div className="text-center py-12 text-gray-500">
            広告専用コンテンツがここに表示されます
          </div>
        </TabsContent>

        <TabsContent value="organic">
          <div className="text-center py-12 text-gray-500">
            オーガニックコンテンツがここに表示されます
          </div>
        </TabsContent>

        <TabsContent value="trending">
          <div className="text-center py-12 text-gray-500">
            トレンドコンテンツがここに表示されます
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
} 