'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  TrendingUp, 
  Search, 
  Play, 
  Eye, 
  ThumbsUp, 
  MessageCircle,
  Clock,
  Globe,
  Filter,
  Sparkles
} from 'lucide-react';

interface VideoStatistics {
  views: number;
  likes: number;
  comments: number;
}

interface TrendingVideo {
  video_id: string;
  url: string;
  title: string;
  description: string;
  channel_title: string;
  published_at: string;
  thumbnail_url: string;
  duration_formatted: string;
  statistics: VideoStatistics;
  tags: string[];
  category_id: string;
}

export default function TrendingPage() {
  const [videos, setVideos] = useState<TrendingVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('US');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [activeTab, setActiveTab] = useState('trending');

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

  useEffect(() => {
    loadTrendingVideos();
  }, [selectedRegion, selectedCategory]);

  const loadTrendingVideos = async () => {
    try {
      setLoading(true);
      const categoryParam = selectedCategory !== 'all' ? `&category=${selectedCategory}` : '';
      const url = `http://localhost:8000/api/v1/trending/videos?region=${selectedRegion}${categoryParam}&max_results=30`;
      console.log('Fetching from:', url);
      
      const response = await fetch(url);
      console.log('Response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('API error:', errorText);
        throw new Error(`API returned status ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Received videos:', data.length, 'videos');
      console.log('First video:', data[0]);
      
      setVideos(data);
    } catch (error) {
      console.error('Error loading trending videos:', error);
      alert(`Error loading videos: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    try {
      setLoading(true);
      const response = await fetch(
        `http://localhost:8000/api/v1/trending/search?keyword=${encodeURIComponent(searchQuery)}&max_results=30`
      );
      const data = await response.json();
      setVideos(data);
    } catch (error) {
      console.error('Error searching videos:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return `${Math.floor(diffDays / 30)} months ago`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-purple-600 to-blue-600 p-3 rounded-xl">
                <TrendingUp className="text-white" size={28} />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                  SNS Video Tool
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  トレンド動画の発見と台本生成
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Select value={selectedRegion} onValueChange={setSelectedRegion}>
                <SelectTrigger className="w-[180px]">
                  <Globe size={16} className="mr-2" />
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
            </div>
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
            <Button onClick={handleSearch} className="bg-gradient-to-r from-purple-600 to-blue-600">
              <Search size={16} className="mr-2" />
              検索
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <div className="flex items-center justify-between mb-6">
            <TabsList>
              <TabsTrigger value="trending">
                <TrendingUp size={16} className="mr-2" />
                トレンド
              </TabsTrigger>
              <TabsTrigger value="search">
                <Search size={16} className="mr-2" />
                検索結果
              </TabsTrigger>
            </TabsList>

            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-[200px]">
                <Filter size={16} className="mr-2" />
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

          <TabsContent value="trending" className="space-y-4">
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <Card key={i}>
                    <Skeleton className="h-48 w-full" />
                    <CardContent className="p-4">
                      <Skeleton className="h-4 w-full mb-2" />
                      <Skeleton className="h-4 w-2/3" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : videos.length > 0 ? (
              <>
                <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <p className="text-sm text-blue-600 dark:text-blue-400">
                    ✅ {videos.length} 件の動画を表示中
                  </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {videos.map((video) => (
                  <Card key={video.video_id} className="overflow-hidden hover:shadow-xl transition-shadow cursor-pointer group">
                    <div className="relative">
                      <img
                        src={video.thumbnail_url}
                        alt={video.title}
                        className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute bottom-2 right-2 bg-black/80 text-white px-2 py-1 rounded text-xs font-medium">
                        <Clock size={12} className="inline mr-1" />
                        {video.duration_formatted}
                      </div>
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                        <Play className="text-white opacity-0 group-hover:opacity-100 transition-opacity" size={48} />
                      </div>
                    </div>
                    <CardContent className="p-4">
                      <h3 className="font-semibold text-sm line-clamp-2 mb-2 group-hover:text-purple-600 transition-colors">
                        {video.title}
                      </h3>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                        {video.channel_title}
                      </p>
                      <p className="text-xs text-gray-500 mb-3">
                        {formatDate(video.published_at)}
                      </p>
                      
                      <div className="flex items-center gap-4 text-xs text-gray-600 dark:text-gray-400">
                        <div className="flex items-center gap-1">
                          <Eye size={14} />
                          <span>{formatNumber(video.statistics.views)}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <ThumbsUp size={14} />
                          <span>{formatNumber(video.statistics.likes)}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <MessageCircle size={14} />
                          <span>{formatNumber(video.statistics.comments)}</span>
                        </div>
                      </div>

                      <div className="mt-3 pt-3 border-t flex gap-2">
                        <Button 
                          size="sm" 
                          className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600"
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
              </>
            ) : (
              <Card className="p-12 text-center">
                <TrendingUp size={48} className="mx-auto text-gray-400 mb-4" />
                <p className="text-gray-600 dark:text-gray-400">トレンド動画が見つかりませんでした</p>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="search">
            <div className="text-center py-12">
              <Search size={48} className="mx-auto text-gray-400 mb-4" />
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                上部の検索バーを使用してキーワードで動画を検索してください
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

