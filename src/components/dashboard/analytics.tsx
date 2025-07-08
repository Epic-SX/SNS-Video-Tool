"use client";

import { useState } from "react";
import { TrendingUp, TrendingDown, Eye, Heart, MessageCircle, Share, Calendar, Filter } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

// Mock data for charts
const performanceData = [
  { date: "1月1日", views: 45000, likes: 2800, comments: 150, shares: 89 },
  { date: "1月2日", views: 52000, likes: 3200, comments: 180, shares: 95 },
  { date: "1月3日", views: 48000, likes: 2900, comments: 165, shares: 78 },
  { date: "1月4日", views: 61000, likes: 3800, comments: 220, shares: 112 },
  { date: "1月5日", views: 55000, likes: 3400, comments: 195, shares: 98 },
  { date: "1月6日", views: 67000, likes: 4100, comments: 245, shares: 125 },
  { date: "1月7日", views: 59000, likes: 3600, comments: 210, shares: 105 },
];

const platformData = [
  { name: "Instagram", value: 45, color: "#E1306C" },
  { name: "YouTube", value: 35, color: "#FF0000" },
  { name: "TikTok", value: 20, color: "#000000" },
];

const engagementData = [
  { platform: "Instagram", engagement: 6.8, videos: 245 },
  { platform: "YouTube", engagement: 4.2, videos: 189 },
  { platform: "TikTok", engagement: 8.1, videos: 156 },
];

const topPerformers = [
  { title: "夏ファッションコレクション", platform: "Instagram", views: 125000, engagement: 8.5 },
  { title: "テクノロジー製品発表", platform: "YouTube", views: 89000, engagement: 6.2 },
  { title: "料理レシピチュートリアル", platform: "TikTok", views: 234000, engagement: 9.1 },
  { title: "フィットネスチャレンジ", platform: "Instagram", views: 78000, engagement: 7.3 },
];

export function Analytics() {
  const [timeRange, setTimeRange] = useState("7d");
  const [selectedMetric, setSelectedMetric] = useState("views");

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const getMetricIcon = (metric: string) => {
    switch (metric) {
      case "views": return <Eye className="h-4 w-4" />;
      case "likes": return <Heart className="h-4 w-4" />;
      case "comments": return <MessageCircle className="h-4 w-4" />;
      case "shares": return <Share className="h-4 w-4" />;
      default: return <Eye className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">分析ダッシュボード</h1>
          <p className="text-gray-600">全プラットフォームとキャンペーンのパフォーマンスを追跡</p>
        </div>
        
        <div className="flex items-center space-x-4">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">過去7日間</SelectItem>
              <SelectItem value="30d">過去30日間</SelectItem>
              <SelectItem value="90d">過去90日間</SelectItem>
              <SelectItem value="1y">過去1年間</SelectItem>
            </SelectContent>
          </Select>
          
          <Button variant="outline">
            <Filter className="h-4 w-4 mr-2" />
            フィルター
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">総再生数</p>
                <p className="text-2xl font-bold">2.4M</p>
                <div className="flex items-center mt-1">
                  <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                  <span className="text-sm text-green-500">+12.5%</span>
                </div>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <Eye className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">エンゲージメント率</p>
                <p className="text-2xl font-bold">6.8%</p>
                <div className="flex items-center mt-1">
                  <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                  <span className="text-sm text-green-500">+2.1%</span>
                </div>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <Heart className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">総動画数</p>
                <p className="text-2xl font-bold">590</p>
                <div className="flex items-center mt-1">
                  <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                  <span className="text-sm text-green-500">+45</span>
                </div>
              </div>
              <div className="p-3 bg-purple-100 rounded-full">
                <Calendar className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">平均パフォーマンス</p>
                <p className="text-2xl font-bold">4.2K</p>
                <div className="flex items-center mt-1">
                  <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
                  <span className="text-sm text-red-500">-3.2%</span>
                </div>
              </div>
              <div className="p-3 bg-orange-100 rounded-full">
                <TrendingUp className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <Tabs defaultValue="performance" className="w-full">
        <TabsList>
          <TabsTrigger value="performance">パフォーマンストレンド</TabsTrigger>
          <TabsTrigger value="platforms">プラットフォーム分析</TabsTrigger>
          <TabsTrigger value="engagement">エンゲージメント指標</TabsTrigger>
          <TabsTrigger value="content">コンテンツ分析</TabsTrigger>
        </TabsList>

        <TabsContent value="performance" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Performance Chart */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>時系列パフォーマンス</CardTitle>
                  <Select value={selectedMetric} onValueChange={setSelectedMetric}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="views">再生数</SelectItem>
                      <SelectItem value="likes">いいね</SelectItem>
                      <SelectItem value="comments">コメント</SelectItem>
                      <SelectItem value="shares">シェア</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={performanceData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip formatter={(value) => formatNumber(Number(value))} />
                    <Area 
                      type="monotone" 
                      dataKey={selectedMetric} 
                      stroke="#3B82F6" 
                      fill="#3B82F6" 
                      fillOpacity={0.1}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Top Performers */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>トップパフォーマンス動画</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {topPerformers.map((video, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="w-8 h-8 bg-gray-200 rounded flex items-center justify-center font-medium">
                          {index + 1}
                        </div>
                        <div>
                          <h4 className="font-medium">{video.title}</h4>
                          <Badge variant="outline" className="mt-1">
                            {video.platform}
                          </Badge>
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

        <TabsContent value="platforms" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Platform Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>プラットフォーム分布</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={platformData}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      dataKey="value"
                      label={({ name, value }) => `${name}: ${value}%`}
                    >
                      {platformData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Platform Engagement */}
            <Card>
              <CardHeader>
                <CardTitle>プラットフォーム別エンゲージメント率</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={engagementData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="platform" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="engagement" fill="#10B981" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="engagement" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Engagement Trends */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>エンゲージメントトレンド</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={performanceData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="likes" stroke="#E1306C" strokeWidth={2} name="いいね" />
                    <Line type="monotone" dataKey="comments" stroke="#1DA1F2" strokeWidth={2} name="コメント" />
                    <Line type="monotone" dataKey="shares" stroke="#10B981" strokeWidth={2} name="シェア" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="content" className="mt-6">
          <div className="text-center py-12 text-gray-500">
            コンテンツ分析チャートがここに表示されます
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
} 