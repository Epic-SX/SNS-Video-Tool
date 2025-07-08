"use client";

import { useState } from "react";
import { Brain, TrendingUp, Lightbulb, Target, Clock, Users, Zap, AlertCircle, CheckCircle, ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";

// Mock AI insights data
const insights = [
  {
    id: "1",
    type: "optimization",
    title: "最適な投稿時間を検出",
    description: "あなたのオーディエンスは午後7時〜9時（EST）に最も活発です。この時間帯に投稿をスケジュールすることで、エンゲージメントが23%向上する可能性があります。",
    impact: "high",
    confidence: 87,
    category: "タイミング",
    actionable: true,
    implemented: false
  },
  {
    id: "2",
    type: "content",
    title: "トレンドハッシュタグの機会",
    description: "#サステナブルファッション があなたのニッチで340%の成長でトレンドになっています。これを取り入れることで、リーチが45%向上する可能性があります。",
    impact: "medium",
    confidence: 92,
    category: "コンテンツ",
    actionable: true,
    implemented: false
  },
  {
    id: "3",
    type: "competitor",
    title: "競合戦略分析",
    description: "あなたの主要競合他社は先月、動画頻度を40%増加させ、28%のエンゲージメント成長を達成しました。",
    impact: "medium",
    confidence: 78,
    category: "競合",
    actionable: true,
    implemented: false
  },
  {
    id: "4",
    type: "performance",
    title: "動画長の最適化",
    description: "あなたのコンテンツカテゴリーでは、15〜30秒の動画が35%高い完了率を示しています。",
    impact: "high",
    confidence: 94,
    category: "パフォーマンス",
    actionable: true,
    implemented: true
  }
];

const recommendations = [
  {
    title: "動画頻度を増やす",
    description: "オーディエンスのエンゲージメントを維持するため、週1回ではなく週2〜3回投稿する",
    priority: "high",
    effort: "medium",
    expectedImpact: "+25% エンゲージメント",
    timeframe: "2週間"
  },
  {
    title: "動画サムネイルを最適化",
    description: "クリック率を向上させるため、明るい色と明確なテキストオーバーレイを使用する",
    priority: "medium",
    effort: "low",
    expectedImpact: "+15% CTR",
    timeframe: "1週間"
  },
  {
    title: "マイクロインフルエンサーとのコラボレーション",
    description: "クロスプロモーションのため、あなたのニッチで3〜5人のマイクロインフルエンサーと提携する",
    priority: "medium",
    effort: "high",
    expectedImpact: "+40% リーチ",
    timeframe: "1ヶ月"
  },
  {
    title: "ユーザー生成コンテンツの実装",
    description: "フォロワーにあなたの製品/ブランドでコンテンツを作成するよう促す",
    priority: "low",
    effort: "medium",
    expectedImpact: "+20% 信頼性",
    timeframe: "3週間"
  }
];

const trendingTopics = [
  { topic: "サステナブルファッション", growth: 340, relevance: 95 },
  { topic: "AIテクノロジー", growth: 280, relevance: 78 },
  { topic: "ウェルネスのヒント", growth: 220, relevance: 89 },
  { topic: "リモートワーク", growth: 180, relevance: 65 },
  { topic: "植物ベースレシピ", growth: 160, relevance: 72 }
];

const contentSuggestions = [
  {
    title: "舞台裏コンテンツ",
    description: "あなたの創作プロセスや日常を見せる",
    engagement: "高",
    difficulty: "簡単"
  },
  {
    title: "チュートリアルシリーズ",
    description: "あなたの専門分野でステップバイステップガイドを作成する",
    engagement: "非常に高",
    difficulty: "中程度"
  },
  {
    title: "ユーザーの声",
    description: "満足した顧客や成功事例を紹介する",
    engagement: "中程度",
    difficulty: "簡単"
  },
  {
    title: "トレンドリアクション",
    description: "現在のトレンドに反応したり参加したりする",
    engagement: "高",
    difficulty: "低"
  }
];

export function AIInsights() {
  const [selectedInsight, setSelectedInsight] = useState<string | null>(null);

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case "high": return "text-red-600 bg-red-100";
      case "medium": return "text-yellow-600 bg-yellow-100";
      case "low": return "text-green-600 bg-green-100";
      default: return "text-gray-600 bg-gray-100";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "text-red-600";
      case "medium": return "text-yellow-600";
      case "low": return "text-green-600";
      default: return "text-gray-600";
    }
  };

  const getEngagementColor = (engagement: string) => {
    switch (engagement) {
      case "非常に高": return "text-green-700 bg-green-100";
      case "高": return "text-green-600 bg-green-50";
      case "中程度": return "text-yellow-600 bg-yellow-50";
      default: return "text-gray-600 bg-gray-50";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center">
            <Brain className="h-6 w-6 mr-2 text-purple-600" />
            AI洞察
          </h1>
          <p className="text-gray-600">機械学習によるインテリジェントな推奨事項</p>
        </div>
        
        <div className="flex items-center space-x-4">
          <Button variant="outline">
            <Zap className="h-4 w-4 mr-2" />
            レポート生成
          </Button>
        </div>
      </div>

      {/* Key Insights Alert */}
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          <strong>3つの高インパクト機会</strong>が検出されました。エンゲージメントを最大45%向上させる可能性があります。
          以下の推奨事項を確認して開始してください。
        </AlertDescription>
      </Alert>

      {/* Main Content */}
      <Tabs defaultValue="insights" className="w-full">
        <TabsList>
          <TabsTrigger value="insights">スマート洞察</TabsTrigger>
          <TabsTrigger value="recommendations">推奨事項</TabsTrigger>
          <TabsTrigger value="trends">トレンドトピック</TabsTrigger>
          <TabsTrigger value="content">コンテンツアイデア</TabsTrigger>
        </TabsList>

        <TabsContent value="insights" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {insights.map((insight) => (
              <Card 
                key={insight.id} 
                className={`cursor-pointer transition-all hover:shadow-lg ${
                  selectedInsight === insight.id ? 'ring-2 ring-purple-500' : ''
                }`}
                onClick={() => setSelectedInsight(insight.id)}
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-2">
                      {insight.type === "optimization" && <Target className="h-5 w-5 text-blue-600" />}
                      {insight.type === "content" && <Lightbulb className="h-5 w-5 text-yellow-600" />}
                      {insight.type === "competitor" && <Users className="h-5 w-5 text-purple-600" />}
                      {insight.type === "performance" && <TrendingUp className="h-5 w-5 text-green-600" />}
                      <Badge className={getImpactColor(insight.impact)}>
                        {insight.impact === "high" ? "高" : insight.impact === "medium" ? "中" : "低"}インパクト
                      </Badge>
                    </div>
                    {insight.implemented && (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    )}
                  </div>

                  <h3 className="font-semibold text-lg mb-2">{insight.title}</h3>
                  <p className="text-gray-600 mb-4">{insight.description}</p>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">信頼度レベル</span>
                      <span className="font-medium">{insight.confidence}%</span>
                    </div>
                    <Progress value={insight.confidence} className="h-2" />
                    
                    <div className="flex items-center justify-between">
                      <Badge variant="outline">{insight.category}</Badge>
                      {insight.actionable && !insight.implemented && (
                        <Button size="sm">
                          実装する
                          <ArrowRight className="h-3 w-3 ml-1" />
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="recommendations" className="mt-6">
          <div className="space-y-4">
            {recommendations.map((rec, index) => (
              <Card key={index} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="font-semibold text-lg">{rec.title}</h3>
                        <Badge className={`${getPriorityColor(rec.priority)} bg-transparent border`}>
                          {rec.priority === "high" ? "高" : rec.priority === "medium" ? "中" : "低"}優先度
                        </Badge>
                      </div>
                      <p className="text-gray-600 mb-4">{rec.description}</p>
                      
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="text-gray-500">必要な労力</span>
                          <p className="font-medium capitalize">{rec.effort === "high" ? "高" : rec.effort === "medium" ? "中" : "低"}</p>
                        </div>
                        <div>
                          <span className="text-gray-500">期待される効果</span>
                          <p className="font-medium text-green-600">{rec.expectedImpact}</p>
                        </div>
                        <div>
                          <span className="text-gray-500">期間</span>
                          <p className="font-medium">{rec.timeframe}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="ml-4">
                      <Button>
                        今すぐ開始
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="trends" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>あなたのニッチでのトレンドトピック</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {trendingTopics.map((trend, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <h4 className="font-medium">{trend.topic}</h4>
                        <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                          <span>成長: +{trend.growth}%</span>
                          <span>関連性: {trend.relevance}%</span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <TrendingUp className="h-4 w-4 text-green-500" />
                        <Button size="sm" variant="outline">
                          トピックを使用
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>機会スコア</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center mb-6">
                  <div className="text-4xl font-bold text-purple-600 mb-2">8.7/10</div>
                  <p className="text-gray-600">現在の市場機会</p>
                </div>
                
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">市場飽和度</span>
                    <div className="flex items-center space-x-2">
                      <Progress value={35} className="w-20 h-2" />
                      <span className="text-sm text-green-600">低</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">オーディエンス関心</span>
                    <div className="flex items-center space-x-2">
                      <Progress value={87} className="w-20 h-2" />
                      <span className="text-sm text-green-600">高</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">競合レベル</span>
                    <div className="flex items-center space-x-2">
                      <Progress value={45} className="w-20 h-2" />
                      <span className="text-sm text-yellow-600">中</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="content" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {contentSuggestions.map((suggestion, index) => (
              <Card key={index} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="font-semibold text-lg">{suggestion.title}</h3>
                    <Badge className={getEngagementColor(suggestion.engagement)}>
                      {suggestion.engagement}
                    </Badge>
                  </div>
                  
                  <p className="text-gray-600 mb-4">{suggestion.description}</p>
                  
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-500">
                      難易度: <span className="font-medium">{suggestion.difficulty}</span>
                    </div>
                    <Button size="sm">
                      コンテンツ作成
                      <ArrowRight className="h-3 w-3 ml-1" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
} 