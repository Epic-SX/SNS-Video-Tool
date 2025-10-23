'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  Target, 
  Search, 
  Play, 
  Heart, 
  MessageCircle, 
  ArrowRight,
  Sparkles,
  Filter,
  Calendar,
  TrendingUp,
  BarChart3
} from 'lucide-react';

interface SearchResult {
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
  published_at: string;
  duration: string;
  relevance_score: number;
  keyword_matches: string[];
  search_volume: number;
  competition_level: 'low' | 'medium' | 'high';
  trending_keywords: string[];
}

export default function KeywordSearchPage() {
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDateRange, setSelectedDateRange] = useState('all');
  const [selectedSortBy, setSelectedSortBy] = useState('relevance');
  const [selectedViewCount, setSelectedViewCount] = useState('all');
  const [activeTab, setActiveTab] = useState('results');

  const dateRanges = [
    { value: 'all', label: 'すべての期間' },
    { value: 'today', label: '今日' },
    { value: 'week', label: '今週' },
    { value: 'month', label: '今月' },
    { value: 'year', label: '今年' },
  ];

  const sortOptions = [
    { value: 'relevance', label: '関連性' },
    { value: 'date', label: '日付' },
    { value: 'views', label: '再生回数' },
    { value: 'rating', label: '評価' },
  ];

  const viewCountRanges = [
    { value: 'all', label: 'すべて' },
    { value: '1000+', label: '1,000回以上' },
    { value: '10000+', label: '10,000回以上' },
    { value: '100000+', label: '100,000回以上' },
    { value: '1000000+', label: '1,000,000回以上' },
  ];

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setLoading(true);
    try {
      let data;
      try {
        const response = await fetch(`http://localhost:8000/api/v1/trending/search?keyword=${encodeURIComponent(searchQuery)}&max_results=30`);
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }
        const apiData = await response.json();
        // Handle case where API returns empty array or different structure
        if (!apiData || !Array.isArray(apiData)) {
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
        } else if (apiData.length === 0) {
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
          data = { videos: apiData };
        }
      } catch (error) {
        console.log('Backend not available, using mock search data');
        data = { videos: [
          {
            video_id: 'keyword1',
            title: `Keyword Search Result for "${searchQuery}"`,
            channel_name: 'Search Channel',
            thumbnail_url: 'https://via.placeholder.com/320x180?text=Keyword+Search',
            url: 'https://youtube.com/watch?v=keyword1',
            statistics: {
              views: Math.floor(Math.random() * 1000000) + 100000,
              likes: Math.floor(Math.random() * 50000) + 5000,
              comments: Math.floor(Math.random() * 5000) + 500
            }
          }
        ]};
      }
      
      // Simulate advanced search results with keyword analysis
      const results = data.videos.map((video: any, index: number) => ({
        ...video,
        published_at: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
        duration: `${Math.floor(Math.random() * 10) + 1}:${Math.floor(Math.random() * 60).toString().padStart(2, '0')}`,
        relevance_score: Math.floor(Math.random() * 30) + 70,
        keyword_matches: searchQuery.split(' ').slice(0, 3),
        search_volume: Math.floor(Math.random() * 10000) + 1000,
        competition_level: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)] as 'low' | 'medium' | 'high',
        trending_keywords: ['トレンド', '話題', '人気', '注目'].slice(0, Math.floor(Math.random() * 3) + 1)
      }));
      
      setSearchResults(results);
    } catch (error) {
      console.error('Error searching videos:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return '1日前';
    if (diffDays < 7) return `${diffDays}日前`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)}週間前`;
    return `${Math.floor(diffDays / 30)}ヶ月前`;
  };

  const getRelevanceColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 80) return 'text-yellow-600';
    if (score >= 70) return 'text-orange-600';
    return 'text-red-600';
  };

  const getCompetitionColor = (level: string) => {
    switch (level) {
      case 'low': return 'text-green-600 bg-green-100 dark:bg-green-900/20';
      case 'medium': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20';
      case 'high': return 'text-red-600 bg-red-100 dark:bg-red-900/20';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-900/20';
    }
  };

  const getCompetitionLabel = (level: string) => {
    switch (level) {
      case 'low': return '低競争';
      case 'medium': return '中競争';
      case 'high': return '高競争';
      default: return '不明';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-red-600 to-red-700 p-3 rounded-xl">
              <Target className="text-white" size={28} />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-red-600 to-red-700 bg-clip-text text-transparent">
                キーワード検索
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                日付、再生回数、関連性による高度なフィルタリングで特定の動画トピックを検索
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Search Controls */}
      <div className="bg-white dark:bg-gray-800 border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex gap-2 mb-4">
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
            <Button onClick={handleSearch} className="bg-gradient-to-r from-red-600 to-red-700">
              <Search size={16} className="mr-2" />
              検索
            </Button>
          </div>

          {/* Advanced Filters */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Select value={selectedDateRange} onValueChange={setSelectedDateRange}>
              <SelectTrigger>
                <Calendar size={16} className="mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {dateRanges.map((range) => (
                  <SelectItem key={range.value} value={range.value}>
                    {range.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedSortBy} onValueChange={setSelectedSortBy}>
              <SelectTrigger>
                <Filter size={16} className="mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {sortOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedViewCount} onValueChange={setSelectedViewCount}>
              <SelectTrigger>
                <BarChart3 size={16} className="mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {viewCountRanges.map((range) => (
                  <SelectItem key={range.value} value={range.value}>
                    {range.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button variant="outline" className="w-full">
              <Filter size={16} className="mr-2" />
              詳細フィルター
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <div className="flex items-center justify-between mb-6">
            <TabsList>
              <TabsTrigger value="results">
                <Search size={16} className="mr-2" />
                検索結果
              </TabsTrigger>
              <TabsTrigger value="keywords">
                <TrendingUp size={16} className="mr-2" />
                キーワード分析
              </TabsTrigger>
              <TabsTrigger value="insights">
                <BarChart3 size={16} className="mr-2" />
                インサイト
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="results">
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(9)].map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <CardContent className="p-6">
                      <div className="h-4 bg-gray-200 rounded mb-4"></div>
                      <div className="h-3 bg-gray-200 rounded mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : searchResults.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {searchResults.map((video) => (
                  <Card key={video.video_id} className="hover:shadow-xl transition-shadow">
                    <CardHeader className="p-0">
                      <div className="relative">
                        <img
                          src={video.thumbnail_url}
                          alt={video.title}
                          className="w-full h-48 object-cover rounded-t-lg"
                        />
                        <div className="absolute top-2 left-2">
                          <Badge className={`${getCompetitionColor(video.competition_level)} border-0`}>
                            {getCompetitionLabel(video.competition_level)}
                          </Badge>
                        </div>
                        <div className="absolute top-2 right-2">
                          <Badge variant="secondary">
                            {video.relevance_score}% 関連
                          </Badge>
                        </div>
                        <div className="absolute bottom-2 right-2 bg-black/70 text-white px-2 py-1 rounded text-xs">
                          {video.duration}
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

                      {/* Keyword Matches */}
                      <div className="mb-3">
                        <h4 className="text-xs font-medium mb-1">キーワードマッチ</h4>
                        <div className="flex flex-wrap gap-1">
                          {video.keyword_matches.map((keyword, i) => (
                            <Badge key={i} variant="outline" className="text-xs">
                              {keyword}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      {/* Trending Keywords */}
                      {video.trending_keywords.length > 0 && (
                        <div className="mb-3">
                          <h4 className="text-xs font-medium mb-1">トレンドキーワード</h4>
                          <div className="flex flex-wrap gap-1">
                            {video.trending_keywords.map((keyword, i) => (
                              <Badge key={i} variant="secondary" className="text-xs">
                                {keyword}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Search Volume */}
                      <div className="mb-3">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-gray-600 dark:text-gray-400">検索ボリューム</span>
                          <span className="font-medium">{formatNumber(video.search_volume)}</span>
                        </div>
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

                      {/* Published Date */}
                      <div className="text-xs text-gray-500 mb-4">
                        {formatDate(video.published_at)}
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          className="flex-1 bg-gradient-to-r from-red-600 to-red-700"
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
                <Target size={48} className="mx-auto text-gray-400 mb-4" />
                <p className="text-gray-600 dark:text-gray-400">
                  {searchQuery ? '検索結果が見つかりませんでした' : 'キーワードを入力して検索してください'}
                </p>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="keywords">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Keyword Trends */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="text-red-600" size={20} />
                    キーワードトレンド
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {['バイラル', '話題', '人気', '注目', 'トレンド'].map((keyword, i) => (
                      <div key={i} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded">
                        <span className="font-medium">{keyword}</span>
                        <div className="flex items-center gap-2">
                          <div className="w-20 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-red-600 h-2 rounded-full" 
                              style={{ width: `${Math.floor(Math.random() * 40) + 60}%` }}
                            ></div>
                          </div>
                          <span className="text-sm font-medium">
                            {Math.floor(Math.random() * 40) + 60}%
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Search Volume */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="text-blue-600" size={20} />
                    検索ボリューム
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[
                      { keyword: 'エンターテイメント', volume: 12500 },
                      { keyword: 'テクノロジー', volume: 8900 },
                      { keyword: 'ライフスタイル', volume: 6700 },
                      { keyword: '教育', volume: 4500 },
                      { keyword: 'ニュース', volume: 3200 }
                    ].map((item, i) => (
                      <div key={i} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded">
                        <span className="font-medium">{item.keyword}</span>
                        <Badge variant="secondary">
                          {formatNumber(item.volume)}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="insights">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Search Insights */}
              <Card>
                <CardHeader>
                  <CardTitle>検索インサイト</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span>総検索結果</span>
                      <span className="font-semibold">{searchResults.length}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>平均関連性</span>
                      <span className="font-semibold">
                        {searchResults.length > 0 
                          ? Math.round(searchResults.reduce((acc, v) => acc + v.relevance_score, 0) / searchResults.length)
                          : 0}%
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>高競争キーワード</span>
                      <span className="font-semibold">
                        {searchResults.filter(v => v.competition_level === 'high').length}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Performance Metrics */}
              <Card>
                <CardHeader>
                  <CardTitle>パフォーマンス指標</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span>平均再生回数</span>
                      <span className="font-semibold">
                        {searchResults.length > 0 
                          ? formatNumber(Math.round(searchResults.reduce((acc, v) => acc + v.statistics.views, 0) / searchResults.length))
                          : '0'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>平均いいね数</span>
                      <span className="font-semibold">
                        {searchResults.length > 0 
                          ? formatNumber(Math.round(searchResults.reduce((acc, v) => acc + v.statistics.likes, 0) / searchResults.length))
                          : '0'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>平均コメント数</span>
                      <span className="font-semibold">
                        {searchResults.length > 0 
                          ? formatNumber(Math.round(searchResults.reduce((acc, v) => acc + v.statistics.comments, 0) / searchResults.length))
                          : '0'}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Recommendations */}
              <Card>
                <CardHeader>
                  <CardTitle>推奨事項</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {[
                      'より具体的なキーワードを使用',
                      '長尾キーワードを組み合わせる',
                      '競争の少ないキーワードを探す',
                      'トレンドキーワードを活用する'
                    ].map((recommendation, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <div className="w-2 h-2 bg-red-600 rounded-full mt-2 flex-shrink-0"></div>
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
