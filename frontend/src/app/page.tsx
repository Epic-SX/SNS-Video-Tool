'use client';

import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  TrendingUp, 
  Sparkles, 
  Video, 
  Zap, 
  Globe,
  Target,
  BarChart,
  ArrowRight
} from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 py-16 sm:py-24">
          <div className="text-center">
            <div className="inline-flex items-center gap-3 mb-6">
              <div className="bg-gradient-to-br from-purple-600 to-blue-600 p-4 rounded-2xl shadow-lg">
                <TrendingUp className="text-white" size={40} />
              </div>
              <h1 className="text-6xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                SNS
              </h1>
            </div>
            
            <p className="text-2xl text-gray-600 dark:text-gray-300 mb-4 max-w-3xl mx-auto">
              ソーシャルネットワーク分析 - トレンド動画の発見とAI台本生成
            </p>
            
            <p className="text-lg text-gray-500 dark:text-gray-400 mb-12 max-w-2xl mx-auto">
              バイラルコンテンツを分析し、世界中のトレンド動画を追跡し、AIで魅力的な台本を数秒で作成
            </p>

            <div className="flex gap-4 justify-center">
              <Link href="/trending">
                <Button size="lg" className="bg-gradient-to-r from-purple-600 to-blue-600 text-lg px-8 py-6">
                  <TrendingUp size={20} className="mr-2" />
                  トレンド動画を見る
                  <ArrowRight size={20} className="ml-2" />
                </Button>
              </Link>
              
              <Link href="/script-generator">
                <Button size="lg" variant="outline" className="text-lg px-8 py-6">
                  <Sparkles size={20} className="mr-2" />
                  台本を生成する
                  <ArrowRight size={20} className="ml-2" />
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute top-20 left-10 opacity-20">
          <Video size={100} className="text-purple-600" />
        </div>
        <div className="absolute bottom-20 right-10 opacity-20">
          <Sparkles size={100} className="text-blue-600" />
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-12">
          コンテンツクリエイター向けの強力な機能
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Feature 1 */}
          <Card className="hover:shadow-xl transition-shadow cursor-pointer group">
            <CardHeader>
              <div className="bg-gradient-to-br from-purple-100 to-purple-200 dark:from-purple-900 dark:to-purple-800 p-3 rounded-xl w-fit mb-4 group-hover:scale-110 transition-transform">
                <TrendingUp className="text-purple-600 dark:text-purple-300" size={32} />
              </div>
              <CardTitle>トレンド動画の発見</CardTitle>
              <CardDescription>
                リアルタイムで世界中のYouTubeトレンド動画を地域別・カテゴリ別に探索
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/trending">
                <Button variant="outline" className="w-full">
                  今すぐ探索する
                  <ArrowRight size={16} className="ml-2" />
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Feature 2 */}
          <Card className="hover:shadow-xl transition-shadow cursor-pointer group">
            <CardHeader>
              <div className="bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900 dark:to-blue-800 p-3 rounded-xl w-fit mb-4 group-hover:scale-110 transition-transform">
                <Sparkles className="text-blue-600 dark:text-blue-300" size={32} />
              </div>
              <CardTitle>AI台本生成</CardTitle>
              <CardDescription>
                GPT-4oを使用して、YouTubeビデオやコンテンツアイデアからプロフェッショナルな台本を生成
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/script-generator">
                <Button variant="outline" className="w-full">
                  台本を生成する
                  <ArrowRight size={16} className="ml-2" />
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Feature 3 */}
          <Card className="hover:shadow-xl transition-shadow cursor-pointer group">
            <CardHeader>
              <div className="bg-gradient-to-br from-green-100 to-green-200 dark:from-green-900 dark:to-green-800 p-3 rounded-xl w-fit mb-4 group-hover:scale-110 transition-transform">
                <BarChart className="text-green-600 dark:text-green-300" size={32} />
              </div>
              <CardTitle>バイラル可能性分析</CardTitle>
              <CardDescription>
                AIによる動画のバイラル可能性、エンゲージメント指標、成長予測の分析を取得
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/viral-analysis">
                <Button variant="outline" className="w-full">
                  動画を分析する
                  <ArrowRight size={16} className="ml-2" />
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Feature 4 */}
          <Card className="hover:shadow-xl transition-shadow cursor-pointer group">
            <CardHeader>
              <div className="bg-gradient-to-br from-yellow-100 to-yellow-200 dark:from-yellow-900 dark:to-yellow-800 p-3 rounded-xl w-fit mb-4 group-hover:scale-110 transition-transform">
                <Globe className="text-yellow-600 dark:text-yellow-300" size={32} />
              </div>
              <CardTitle>グローバル対応</CardTitle>
              <CardDescription>
                アメリカ、日本、韓国など25カ国以上のトレンドコンテンツにアクセス
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/global-coverage">
                <Button variant="outline" className="w-full">
                  地域を探索する
                  <ArrowRight size={16} className="ml-2" />
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Feature 5 */}
          <Card className="hover:shadow-xl transition-shadow cursor-pointer group">
            <CardHeader>
              <div className="bg-gradient-to-br from-red-100 to-red-200 dark:from-red-900 dark:to-red-800 p-3 rounded-xl w-fit mb-4 group-hover:scale-110 transition-transform">
                <Target className="text-red-600 dark:text-red-300" size={32} />
              </div>
              <CardTitle>キーワード検索</CardTitle>
              <CardDescription>
                日付、再生回数、関連性による高度なフィルタリングで特定の動画トピックを検索
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/keyword-search">
                <Button variant="outline" className="w-full">
                  動画を検索する
                  <ArrowRight size={16} className="ml-2" />
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Feature 6 */}
          <Card className="hover:shadow-xl transition-shadow cursor-pointer group">
            <CardHeader>
              <div className="bg-gradient-to-br from-indigo-100 to-indigo-200 dark:from-indigo-900 dark:to-indigo-800 p-3 rounded-xl w-fit mb-4 group-hover:scale-110 transition-transform">
                <Zap className="text-indigo-600 dark:text-indigo-300" size={32} />
              </div>
              <CardTitle>即座に結果を表示</CardTitle>
              <CardDescription>
                強力なAPIで数秒でトレンド動画データとAI生成台本を取得
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/instant-results">
                <Button variant="outline" className="w-full">
                  今すぐ試す
                  <ArrowRight size={16} className="ml-2" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* How It Works Section */}
      <div className="bg-white dark:bg-gray-800 py-16">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">
            使い方
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-gradient-to-br from-purple-600 to-blue-600 text-white w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                1
              </div>
              <h3 className="text-xl font-semibold mb-2">トレンドコンテンツを発見</h3>
              <p className="text-gray-600 dark:text-gray-400">
                地域やカテゴリ別にYouTubeのトレンド動画を閲覧し、バイラルになっているコンテンツを発見
              </p>
            </div>

            <div className="text-center">
              <div className="bg-gradient-to-br from-purple-600 to-blue-600 text-white w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                2
              </div>
              <h3 className="text-xl font-semibold mb-2">分析と学習</h3>
              <p className="text-gray-600 dark:text-gray-400">
                動画がバイラルになる理由と成功要因についてAIによる洞察を取得
              </p>
            </div>

            <div className="text-center">
              <div className="bg-gradient-to-br from-purple-600 to-blue-600 text-white w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                3
              </div>
              <h3 className="text-xl font-semibold mb-2">台本を生成</h3>
              <p className="text-gray-600 dark:text-gray-400">
                トレンド動画や独自のアイデアに基づいて、AIを使用して魅力的な動画台本を作成
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="max-w-7xl mx-auto px-4 py-16">
        <Card className="bg-gradient-to-br from-purple-600 to-blue-600 border-none text-white">
          <CardContent className="p-12 text-center">
            <h2 className="text-4xl font-bold mb-4">
              バイラルコンテンツを作成する準備はできましたか？
            </h2>
            <p className="text-xl mb-8 opacity-90">
              今すぐトレンド動画の発見とAI台本生成を始めましょう
            </p>
            <div className="flex gap-4 justify-center">
              <Link href="/trending">
                <Button size="lg" variant="secondary" className="text-lg px-8 py-6">
                  <TrendingUp size={20} className="mr-2" />
                  始める
                </Button>
              </Link>
              <Button 
                size="lg" 
                variant="outline" 
                className="text-lg px-8 py-6 border-white text-white hover:bg-white/10"
                onClick={() => window.open('http://localhost:8000/docs', '_blank')}
              >
                APIドキュメント
                <ArrowRight size={20} className="ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="max-w-7xl mx-auto px-4 text-center text-gray-600 dark:text-gray-400">
          <p className="mb-2">
            <strong>SNS Video Tool</strong> - YouTube Data API & OpenAI GPT-4oで動作
          </p>
          <p className="text-sm">
            FastAPI、Next.js、Tailwind CSSで構築
          </p>
        </div>
      </footer>
    </div>
  );
}
