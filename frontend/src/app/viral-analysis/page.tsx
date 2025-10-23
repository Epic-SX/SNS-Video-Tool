'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  BarChart, 
  TrendingUp, 
  Users, 
  Heart, 
  MessageCircle, 
  Clock,
  Target,
  Zap,
  ArrowRight,
  Play,
  Sparkles,
  Search
} from 'lucide-react';

interface VideoAnalysis {
  video_id: string;
  title: string;
  channel_name: string;
  thumbnail_url: string;
  url: string;
  statistics: {
    views: number;
    likes: number;
    comments: number;
  };
  viral_score: number;
  engagement_rate: number;
  growth_potential: number;
  target_audience: string[];
  trending_keywords: string[];
  competitor_analysis: {
    similar_videos: number;
    market_saturation: number;
  };
  recommendations: string[];
}

export default function ViralAnalysisPage() {
  const [videos, setVideos] = useState<VideoAnalysis[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('US');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [activeTab, setActiveTab] = useState('analysis');

  const regions = [
    { code: 'US', name: 'アメリカ' },
    { code: 'GB', name: 'イギリス' },
    { code: 'JP', name: '日本' },
    { code: 'KR', name: '韓国' },
    { code: 'IN', name: 'インド' },
  ];

  const categories = [
    { id: 'all', name: 'すべてのカテゴリ' },
    { id: '10', name: '音楽' },
    { id: '20', name: 'ゲーム' },
    { id: '23', name: 'コメディ' },
    { id: '24', name: 'エンターテイメント' },
    { id: '28', name: '科学技術' },
  ];

  const loadViralAnalysis = async () => {
    setLoading(true);
    try {
      // Mock data for development when backend is not available
      const mockVideos = [
        {
          video_id: 'dQw4w9WgXcQ',
          title: 'Sample Trending Video 1',
          channel_name: 'Sample Channel',
          thumbnail_url: 'https://via.placeholder.com/320x180?text=Video+1',
          url: 'https://youtube.com/watch?v=dQw4w9WgXcQ',
          statistics: {
            views: Math.floor(Math.random() * 1000000) + 100000,
            likes: Math.floor(Math.random() * 50000) + 5000,
            comments: Math.floor(Math.random() * 5000) + 500
          }
        },
        {
          video_id: 'jNQXAC9IVRw',
          title: 'Sample Trending Video 2',
          channel_name: 'Another Channel',
          thumbnail_url: 'https://via.placeholder.com/320x180?text=Video+2',
          url: 'https://youtube.com/watch?v=jNQXAC9IVRw',
          statistics: {
            views: Math.floor(Math.random() * 1000000) + 100000,
            likes: Math.floor(Math.random() * 50000) + 5000,
            comments: Math.floor(Math.random() * 5000) + 500
          }
        },
        {
          video_id: 'M7lc1UVf-VE',
          title: 'Sample Trending Video 3',
          channel_name: 'Third Channel',
          thumbnail_url: 'https://via.placeholder.com/320x180?text=Video+3',
          url: 'https://youtube.com/watch?v=M7lc1UVf-VE',
          statistics: {
            views: Math.floor(Math.random() * 1000000) + 100000,
            likes: Math.floor(Math.random() * 50000) + 5000,
            comments: Math.floor(Math.random() * 5000) + 500
          }
        }
      ];

      let data;
      try {
        const response = await fetch(`http://localhost:8000/api/v1/trending/videos?region=${selectedRegion}&category=${selectedCategory}&max_results=20`);
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }
        data = await response.json();
        // Handle case where API returns empty array or different structure
        if (!data || !Array.isArray(data)) {
          data = { videos: mockVideos };
        } else if (data.length === 0) {
          data = { videos: mockVideos };
        } else {
          data = { videos: data };
        }
      } catch (error) {
        console.log('Backend not available, using mock data');
        data = { videos: mockVideos };
      }
      
      // Simulate viral analysis data
      const analyzedVideos = data.videos.map((video: any) => ({
        ...video,
        viral_score: Math.floor(Math.random() * 40) + 60, // 60-100
        engagement_rate: Math.floor(Math.random() * 5) + 3, // 3-8%
        growth_potential: Math.floor(Math.random() * 30) + 70, // 70-100
        target_audience: ['18-24歳', '25-34歳', '学生', 'クリエイター'],
        trending_keywords: ['バイラル', 'トレンド', '話題', '人気'],
        competitor_analysis: {
          similar_videos: Math.floor(Math.random() * 1000) + 100,
          market_saturation: Math.floor(Math.random() * 30) + 20
        },
        recommendations: [
          'より魅力的なサムネイルを作成',
          'タイトルにトレンドキーワードを含める',
          '最初の3秒で視聴者の注意を引く'
        ]
      }));
      
      setVideos(analyzedVideos);
    } catch (error) {
      console.error('Error loading viral analysis:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setLoading(true);
    try {
      let data;
      try {
        const response = await fetch(`http://localhost:8000/api/v1/trending/search?keyword=${encodeURIComponent(searchQuery)}&max_results=20`);
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }
        data = await response.json();
        // Handle case where API returns empty array or different structure
        if (!data || !Array.isArray(data)) {
          data = { videos: [
            {
              video_id: 'search1',
              title: `Search Result for "${searchQuery}"`,
              channel_name: 'Search Channel',
              thumbnail_url: 'https://via.placeholder.com/320x180?text=Search+Result',
              url: 'https://youtube.com/watch?v=search1',
              statistics: {
                views: Math.floor(Math.random() * 1000000) + 100000,
                likes: Math.floor(Math.random() * 50000) + 5000,
                comments: Math.floor(Math.random() * 5000) + 500
              }
            }
          ]};
        } else if (data.length === 0) {
          data = { videos: [
            {
              video_id: 'search1',
              title: `Search Result for "${searchQuery}"`,
              channel_name: 'Search Channel',
              thumbnail_url: 'https://via.placeholder.com/320x180?text=Search+Result',
              url: 'https://youtube.com/watch?v=search1',
              statistics: {
                views: Math.floor(Math.random() * 1000000) + 100000,
                likes: Math.floor(Math.random() * 50000) + 5000,
                comments: Math.floor(Math.random() * 5000) + 500
              }
            }
          ]};
        } else {
          data = { videos: data };
        }
      } catch (error) {
        console.log('Backend not available, using mock search data');
        data = { videos: [
          {
            video_id: 'search1',
            title: `Search Result for "${searchQuery}"`,
            channel_name: 'Search Channel',
            thumbnail_url: 'https://via.placeholder.com/320x180?text=Search+Result',
            url: 'https://youtube.com/watch?v=search1',
            statistics: {
              views: Math.floor(Math.random() * 1000000) + 100000,
              likes: Math.floor(Math.random() * 50000) + 5000,
              comments: Math.floor(Math.random() * 5000) + 500
            }
          }
        ]};
      }
      
      // Simulate viral analysis for search results
      const analyzedVideos = data.videos.map((video: any) => ({
        ...video,
        viral_score: Math.floor(Math.random() * 40) + 60,
        engagement_rate: Math.floor(Math.random() * 5) + 3,
        growth_potential: Math.floor(Math.random() * 30) + 70,
        target_audience: ['18-24歳', '25-34歳', '学生', 'クリエイター'],
        trending_keywords: searchQuery.split(' '),
        competitor_analysis: {
          similar_videos: Math.floor(Math.random() * 1000) + 100,
          market_saturation: Math.floor(Math.random() * 30) + 20
        },
        recommendations: [
          'より魅力的なサムネイルを作成',
          'タイトルにトレンドキーワードを含める',
          '最初の3秒で視聴者の注意を引く'
        ]
      }));
      
      setVideos(analyzedVideos);
    } catch (error) {
      console.error('Error searching videos:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadViralAnalysis();
  }, [selectedRegion, selectedCategory]);

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const getViralScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 80) return 'text-yellow-600';
    if (score >= 70) return 'text-orange-600';
    return 'text-red-600';
  };

  const getViralScoreBg = (score: number) => {
    if (score >= 90) return 'bg-green-100 dark:bg-green-900/20';
    if (score >= 80) return 'bg-yellow-100 dark:bg-yellow-900/20';
    if (score >= 70) return 'bg-orange-100 dark:bg-orange-900/20';
    return 'bg-red-100 dark:bg-red-900/20';
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-green-600 to-green-700 p-3 rounded-xl">
              <BarChart className="text-white" size={28} />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-green-700 bg-clip-text text-transparent">
                バイラル可能性分析
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                AIによる動画のバイラル可能性、エンゲージメント指標、成長予測の分析
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-white dark:bg-gray-800 border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4 mb-4">
            <Select value={selectedRegion} onValueChange={setSelectedRegion}>
              <SelectTrigger className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {regions.map((region) => (
                  <SelectItem key={region.code} value={region.code}>
                    {region.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-[200px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Search Bar */}
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <Input
                type="text"
                placeholder="キーワードで動画を検索..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="pl-10"
              />
            </div>
            <Button onClick={handleSearch} className="bg-gradient-to-r from-green-600 to-green-700">
              <Search size={16} className="mr-2" />
              分析
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <div className="flex items-center justify-between mb-6">
            <TabsList>
              <TabsTrigger value="analysis">
                <BarChart size={16} className="mr-2" />
                バイラル分析
              </TabsTrigger>
              <TabsTrigger value="insights">
                <Target size={16} className="mr-2" />
                インサイト
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="analysis">
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <CardContent className="p-6">
                      <div className="h-4 bg-gray-200 rounded mb-4"></div>
                      <div className="h-3 bg-gray-200 rounded mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : videos.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {videos.map((video) => (
                  <Card key={video.video_id} className="hover:shadow-xl transition-shadow">
                    <CardHeader className="p-0">
                      <div className="relative">
                        <img
                          src={video.thumbnail_url}
                          alt={video.title}
                          className="w-full h-48 object-cover rounded-t-lg"
                        />
                        <div className="absolute top-2 right-2">
                          <Badge className={`${getViralScoreBg(video.viral_score)} ${getViralScoreColor(video.viral_score)} border-0`}>
                            {video.viral_score}% バイラル
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="p-4">
                      <h3 className="font-semibold text-sm mb-2 line-clamp-2">
                        {video.title}
                      </h3>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mb-3">
                        {video.channel_name}
                      </p>

                      {/* Viral Score */}
                      <div className="mb-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium">バイラルスコア</span>
                          <span className={`text-sm font-bold ${getViralScoreColor(video.viral_score)}`}>
                            {video.viral_score}%
                          </span>
                        </div>
                        <Progress value={video.viral_score} className="h-2" />
                      </div>

                      {/* Engagement Rate */}
                      <div className="mb-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium">エンゲージメント率</span>
                          <span className="text-sm font-bold text-blue-600">
                            {video.engagement_rate}%
                          </span>
                        </div>
                        <Progress value={video.engagement_rate * 10} className="h-2" />
                      </div>

                      {/* Growth Potential */}
                      <div className="mb-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium">成長可能性</span>
                          <span className="text-sm font-bold text-green-600">
                            {video.growth_potential}%
                          </span>
                        </div>
                        <Progress value={video.growth_potential} className="h-2" />
                      </div>

                      {/* Statistics */}
                      <div className="grid grid-cols-3 gap-2 text-xs text-gray-600 dark:text-gray-400 mb-4">
                        <div className="flex items-center gap-1">
                          <Play size={12} />
                          <span>{formatNumber(video.statistics.views)}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Heart size={12} />
                          <span>{formatNumber(video.statistics.likes)}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <MessageCircle size={12} />
                          <span>{formatNumber(video.statistics.comments)}</span>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          className="flex-1 bg-gradient-to-r from-green-600 to-green-700"
                          onClick={() => window.open(video.url, '_blank')}
                        >
                          <Play size={14} className="mr-1" />
                          視聴
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="flex-1"
                          onClick={() => window.location.href = `/script-generator?videoId=${video.video_id}`}
                        >
                          <Sparkles size={14} className="mr-1" />
                          台本生成
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="p-12 text-center">
                <BarChart size={48} className="mx-auto text-gray-400 mb-4" />
                <p className="text-gray-600 dark:text-gray-400">分析可能な動画が見つかりませんでした</p>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="insights">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Market Insights */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="text-green-600" size={20} />
                    市場インサイト
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold mb-2">トレンドキーワード</h4>
                      <div className="flex flex-wrap gap-2">
                        {['バイラル', '話題', '人気', 'トレンド', '注目'].map((keyword, i) => (
                          <Badge key={i} variant="secondary">{keyword}</Badge>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">ターゲットオーディエンス</h4>
                      <div className="flex flex-wrap gap-2">
                        {['18-24歳', '25-34歳', '学生', 'クリエイター'].map((audience, i) => (
                          <Badge key={i} variant="outline">{audience}</Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Recommendations */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="text-blue-600" size={20} />
                    改善提案
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[
                      'より魅力的なサムネイルを作成',
                      'タイトルにトレンドキーワードを含める',
                      '最初の3秒で視聴者の注意を引く',
                      'エンゲージメントを促進する要素を追加'
                    ].map((recommendation, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{recommendation}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
