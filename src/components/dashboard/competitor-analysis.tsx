"use client";

import { useState } from "react";
import { Search, TrendingUp, TrendingDown, Plus, Filter, MoreHorizontal } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

// Mock competitor data
const competitors = [
  {
    id: "1",
    name: "ファッションフォワード",
    handle: "@fashionforward",
    avatar: "/api/placeholder/40/40",
    platform: "Instagram",
    followers: 2400000,
    avgViews: 125000,
    avgEngagement: 6.8,
    totalVideos: 245,
    growth: 12.5,
    category: "ファッション",
    status: "tracking"
  },
  {
    id: "2",
    name: "テックレビュープロ",
    handle: "@techreviewerpro",
    avatar: "/api/placeholder/40/40",
    platform: "YouTube",
    followers: 1800000,
    avgViews: 89000,
    avgEngagement: 4.2,
    totalVideos: 189,
    growth: -2.1,
    category: "テクノロジー",
    status: "tracking"
  },
  {
    id: "3",
    name: "クッキングマスター",
    handle: "@cookingmaster",
    avatar: "/api/placeholder/40/40",
    platform: "TikTok",
    followers: 3200000,
    avgViews: 234000,
    avgEngagement: 8.1,
    totalVideos: 156,
    growth: 18.7,
    category: "料理",
    status: "tracking"
  },
  {
    id: "4",
    name: "フィットネスグル",
    handle: "@fitnessguru",
    avatar: "/api/placeholder/40/40",
    platform: "Instagram",
    followers: 1500000,
    avgViews: 78000,
    avgEngagement: 7.3,
    totalVideos: 298,
    growth: 8.9,
    category: "フィットネス",
    status: "tracking"
  }
];

const competitorPerformance = [
  { month: "1月", fashionForward: 125000, techReviewer: 89000, cookingMaster: 234000, fitnessGuru: 78000 },
  { month: "2月", fashionForward: 132000, techReviewer: 92000, cookingMaster: 245000, fitnessGuru: 82000 },
  { month: "3月", fashionForward: 128000, techReviewer: 87000, cookingMaster: 251000, fitnessGuru: 79000 },
  { month: "4月", fashionForward: 145000, techReviewer: 95000, cookingMaster: 267000, fitnessGuru: 85000 },
  { month: "5月", fashionForward: 138000, techReviewer: 91000, cookingMaster: 278000, fitnessGuru: 88000 },
  { month: "6月", fashionForward: 152000, techReviewer: 98000, cookingMaster: 289000, fitnessGuru: 92000 },
];

const topCompetitorVideos = [
  {
    title: "夏コレクション発表",
    competitor: "ファッションフォワード",
    platform: "Instagram",
    views: 456000,
    engagement: 9.2,
    publishedAt: "2024-01-15"
  },
  {
    title: "iPhone 15 Pro レビュー",
    competitor: "テックレビュープロ",
    platform: "YouTube",
    views: 234000,
    engagement: 6.8,
    publishedAt: "2024-01-14"
  },
  {
    title: "5分間パスタレシピ",
    competitor: "クッキングマスター",
    platform: "TikTok",
    views: 789000,
    engagement: 12.4,
    publishedAt: "2024-01-13"
  }
];

export function CompetitorAnalysis() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedPlatform, setSelectedPlatform] = useState("all");

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const getPlatformColor = (platform: string) => {
    switch (platform) {
      case "Instagram": return "bg-pink-100 text-pink-800";
      case "YouTube": return "bg-red-100 text-red-800";
      case "TikTok": return "bg-gray-100 text-gray-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getGrowthIcon = (growth: number) => {
    return growth > 0 ? (
      <TrendingUp className="h-4 w-4 text-green-500" />
    ) : (
      <TrendingDown className="h-4 w-4 text-red-500" />
    );
  };

  const getGrowthColor = (growth: number) => {
    return growth > 0 ? "text-green-500" : "text-red-500";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">競合分析</h1>
          <p className="text-gray-600">プラットフォーム全体で競合他社のパフォーマンスを監視・分析</p>
        </div>
        
        <div className="flex items-center space-x-4">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            競合を追加
          </Button>
          
          <Button variant="outline">
            <Filter className="h-4 w-4 mr-2" />
            フィルター
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex items-center space-x-4 p-4 bg-white rounded-lg border">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="競合他社を検索..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="カテゴリー" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">全カテゴリー</SelectItem>
            <SelectItem value="fashion">ファッション</SelectItem>
            <SelectItem value="technology">テクノロジー</SelectItem>
            <SelectItem value="food">料理</SelectItem>
            <SelectItem value="fitness">フィットネス</SelectItem>
          </SelectContent>
        </Select>

        <Select value={selectedPlatform} onValueChange={setSelectedPlatform}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="プラットフォーム" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">全プラットフォーム</SelectItem>
            <SelectItem value="instagram">Instagram</SelectItem>
            <SelectItem value="youtube">YouTube</SelectItem>
            <SelectItem value="tiktok">TikTok</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Competitor Overview */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList>
          <TabsTrigger value="overview">概要</TabsTrigger>
          <TabsTrigger value="performance">パフォーマンス比較</TabsTrigger>
          <TabsTrigger value="content">コンテンツ分析</TabsTrigger>
          <TabsTrigger value="trends">トレンドコンテンツ</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {competitors.map((competitor) => (
              <Card key={competitor.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <Avatar>
                        <AvatarImage src={competitor.avatar} />
                        <AvatarFallback>{competitor.name.slice(0, 2)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-medium">{competitor.name}</h3>
                        <p className="text-sm text-gray-500">{competitor.handle}</p>
                      </div>
                    </div>
                    
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem>プロフィールを表示</DropdownMenuItem>
                        <DropdownMenuItem>データをエクスポート</DropdownMenuItem>
                        <DropdownMenuItem>削除</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Badge className={getPlatformColor(competitor.platform)}>
                        {competitor.platform}
                      </Badge>
                      <Badge variant="outline">{competitor.category}</Badge>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-500">フォロワー</p>
                        <p className="font-medium">{formatNumber(competitor.followers)}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">平均再生数</p>
                        <p className="font-medium">{formatNumber(competitor.avgViews)}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">エンゲージメント</p>
                        <p className="font-medium">{competitor.avgEngagement}%</p>
                      </div>
                      <div>
                        <p className="text-gray-500">動画数</p>
                        <p className="font-medium">{competitor.totalVideos}</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t">
                      <div className="flex items-center space-x-2">
                        {getGrowthIcon(competitor.growth)}
                        <span className={`text-sm font-medium ${getGrowthColor(competitor.growth)}`}>
                          {competitor.growth > 0 ? '+' : ''}{competitor.growth}%
                        </span>
                      </div>
                      <span className="text-xs text-gray-500">前月比</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="performance" className="mt-6">
          <div className="space-y-6">
            {/* Performance Chart */}
            <Card>
              <CardHeader>
                <CardTitle>パフォーマンス比較</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart data={competitorPerformance}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value) => formatNumber(Number(value))} />
                    <Legend />
                    <Line type="monotone" dataKey="fashionForward" stroke="#E1306C" strokeWidth={2} name="ファッションフォワード" />
                    <Line type="monotone" dataKey="techReviewer" stroke="#FF0000" strokeWidth={2} name="テックレビュープロ" />
                    <Line type="monotone" dataKey="cookingMaster" stroke="#000000" strokeWidth={2} name="クッキングマスター" />
                    <Line type="monotone" dataKey="fitnessGuru" stroke="#10B981" strokeWidth={2} name="フィットネスグル" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Engagement Comparison */}
            <Card>
              <CardHeader>
                <CardTitle>エンゲージメント率比較</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={competitors}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="avgEngagement" fill="#3B82F6" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="content" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top Performing Content */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>競合他社のトップパフォーマンスコンテンツ</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {topCompetitorVideos.map((video, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="w-8 h-8 bg-gray-200 rounded flex items-center justify-center font-medium">
                          {index + 1}
                        </div>
                        <div>
                          <h4 className="font-medium">{video.title}</h4>
                          <div className="flex items-center space-x-2 mt-1">
                            <span className="text-sm text-gray-500">{video.competitor}</span>
                            <Badge variant="outline" className="text-xs">
                              {video.platform}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{formatNumber(video.views)} 回再生</p>
                        <p className="text-sm text-green-600">{video.engagement}% エンゲージメント</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="trends" className="mt-6">
          <div className="text-center py-12 text-gray-500">
            トレンドコンテンツ分析がここに表示されます
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
} 