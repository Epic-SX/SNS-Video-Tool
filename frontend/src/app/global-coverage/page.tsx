'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  Globe, 
  TrendingUp, 
  Play, 
  Heart, 
  MessageCircle, 
  ArrowRight,
  Sparkles,
  MapPin,
  Users,
  Clock
} from 'lucide-react';

interface GlobalVideo {
  video_id: string;
  title: string;
  channel_name: string;
  thumbnail_url: string;
  url: string;
  region: string;
  region_name: string;
  language: string;
  statistics: {
    views: number;
    likes: number;
    comments: number;
  };
  trending_position: number;
  cultural_insights: {
    local_trends: string[];
    cultural_relevance: number;
    language_adaptation: string;
  };
}

export default function GlobalCoveragePage() {
  const [videos, setVideos] = useState<GlobalVideo[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedRegion, setSelectedRegion] = useState('all');
  const [selectedLanguage, setSelectedLanguage] = useState('all');
  const [activeTab, setActiveTab] = useState('trending');

  const regions = [
    { code: 'all', name: 'すべての地域', flag: '🌍' },
    // North America
    { code: 'US', name: 'アメリカ', flag: '🇺🇸' },
    { code: 'CA', name: 'カナダ', flag: '🇨🇦' },
    { code: 'MX', name: 'メキシコ', flag: '🇲🇽' },
    // Europe
    { code: 'GB', name: 'イギリス', flag: '🇬🇧' },
    { code: 'DE', name: 'ドイツ', flag: '🇩🇪' },
    { code: 'FR', name: 'フランス', flag: '🇫🇷' },
    { code: 'ES', name: 'スペイン', flag: '🇪🇸' },
    { code: 'IT', name: 'イタリア', flag: '🇮🇹' },
    { code: 'NL', name: 'オランダ', flag: '🇳🇱' },
    { code: 'PL', name: 'ポーランド', flag: '🇵🇱' },
    { code: 'RU', name: 'ロシア', flag: '🇷🇺' },
    { code: 'SE', name: 'スウェーデン', flag: '🇸🇪' },
    { code: 'NO', name: 'ノルウェー', flag: '🇳🇴' },
    { code: 'DK', name: 'デンマーク', flag: '🇩🇰' },
    { code: 'FI', name: 'フィンランド', flag: '🇫🇮' },
    { code: 'CH', name: 'スイス', flag: '🇨🇭' },
    { code: 'AT', name: 'オーストリア', flag: '🇦🇹' },
    { code: 'BE', name: 'ベルギー', flag: '🇧🇪' },
    { code: 'PT', name: 'ポルトガル', flag: '🇵🇹' },
    { code: 'IE', name: 'アイルランド', flag: '🇮🇪' },
    { code: 'CZ', name: 'チェコ', flag: '🇨🇿' },
    { code: 'HU', name: 'ハンガリー', flag: '🇭🇺' },
    { code: 'RO', name: 'ルーマニア', flag: '🇷🇴' },
    { code: 'BG', name: 'ブルガリア', flag: '🇧🇬' },
    { code: 'HR', name: 'クロアチア', flag: '🇭🇷' },
    { code: 'GR', name: 'ギリシャ', flag: '🇬🇷' },
    { code: 'IS', name: 'アイスランド', flag: '🇮🇸' },
    { code: 'MT', name: 'マルタ', flag: '🇲🇹' },
    { code: 'CY', name: 'キプロス', flag: '🇨🇾' },
    { code: 'LU', name: 'ルクセンブルク', flag: '🇱🇺' },
    { code: 'SK', name: 'スロバキア', flag: '🇸🇰' },
    { code: 'SI', name: 'スロベニア', flag: '🇸🇮' },
    { code: 'EE', name: 'エストニア', flag: '🇪🇪' },
    { code: 'LV', name: 'ラトビア', flag: '🇱🇻' },
    { code: 'LT', name: 'リトアニア', flag: '🇱🇹' },
    { code: 'MD', name: 'モルドバ', flag: '🇲🇩' },
    { code: 'UA', name: 'ウクライナ', flag: '🇺🇦' },
    { code: 'BY', name: 'ベラルーシ', flag: '🇧🇾' },
    { code: 'AL', name: 'アルバニア', flag: '🇦🇱' },
    { code: 'MK', name: '北マケドニア', flag: '🇲🇰' },
    { code: 'ME', name: 'モンテネグロ', flag: '🇲🇪' },
    { code: 'RS', name: 'セルビア', flag: '🇷🇸' },
    { code: 'BA', name: 'ボスニア・ヘルツェゴビナ', flag: '🇧🇦' },
    // Asia Pacific
    { code: 'JP', name: '日本', flag: '🇯🇵' },
    { code: 'KR', name: '韓国', flag: '🇰🇷' },
    { code: 'CN', name: '中国', flag: '🇨🇳' },
    { code: 'IN', name: 'インド', flag: '🇮🇳' },
    { code: 'AU', name: 'オーストラリア', flag: '🇦🇺' },
    { code: 'NZ', name: 'ニュージーランド', flag: '🇳🇿' },
    { code: 'SG', name: 'シンガポール', flag: '🇸🇬' },
    { code: 'TH', name: 'タイ', flag: '🇹🇭' },
    { code: 'VN', name: 'ベトナム', flag: '🇻🇳' },
    { code: 'PH', name: 'フィリピン', flag: '🇵🇭' },
    { code: 'ID', name: 'インドネシア', flag: '🇮🇩' },
    { code: 'MY', name: 'マレーシア', flag: '🇲🇾' },
    { code: 'TW', name: '台湾', flag: '🇹🇼' },
    { code: 'HK', name: '香港', flag: '🇭🇰' },
    { code: 'BD', name: 'バングラデシュ', flag: '🇧🇩' },
    { code: 'PK', name: 'パキスタン', flag: '🇵🇰' },
    { code: 'LK', name: 'スリランカ', flag: '🇱🇰' },
    { code: 'MM', name: 'ミャンマー', flag: '🇲🇲' },
    { code: 'KH', name: 'カンボジア', flag: '🇰🇭' },
    { code: 'LA', name: 'ラオス', flag: '🇱🇦' },
    { code: 'BN', name: 'ブルネイ', flag: '🇧🇳' },
    { code: 'MN', name: 'モンゴル', flag: '🇲🇳' },
    { code: 'KZ', name: 'カザフスタン', flag: '🇰🇿' },
    { code: 'UZ', name: 'ウズベキスタン', flag: '🇺🇿' },
    { code: 'KG', name: 'キルギス', flag: '🇰🇬' },
    { code: 'TJ', name: 'タジキスタン', flag: '🇹🇯' },
    { code: 'TM', name: 'トルクメニスタン', flag: '🇹🇲' },
    { code: 'AF', name: 'アフガニスタン', flag: '🇦🇫' },
    { code: 'NP', name: 'ネパール', flag: '🇳🇵' },
    { code: 'BT', name: 'ブータン', flag: '🇧🇹' },
    { code: 'MV', name: 'モルディブ', flag: '🇲🇻' },
    { code: 'TL', name: '東ティモール', flag: '🇹🇱' },
    { code: 'FJ', name: 'フィジー', flag: '🇫🇯' },
    { code: 'PG', name: 'パプアニューギニア', flag: '🇵🇬' },
    { code: 'SB', name: 'ソロモン諸島', flag: '🇸🇧' },
    { code: 'VU', name: 'バヌアツ', flag: '🇻🇺' },
    { code: 'WS', name: 'サモア', flag: '🇼🇸' },
    { code: 'TO', name: 'トンガ', flag: '🇹🇴' },
    { code: 'KI', name: 'キリバス', flag: '🇰🇮' },
    { code: 'TV', name: 'ツバル', flag: '🇹🇻' },
    { code: 'NR', name: 'ナウル', flag: '🇳🇷' },
    { code: 'PW', name: 'パラオ', flag: '🇵🇼' },
    { code: 'FM', name: 'ミクロネシア', flag: '🇫🇲' },
    { code: 'MH', name: 'マーシャル諸島', flag: '🇲🇭' },
    // Middle East & Africa
    { code: 'SA', name: 'サウジアラビア', flag: '🇸🇦' },
    { code: 'AE', name: 'UAE', flag: '🇦🇪' },
    { code: 'EG', name: 'エジプト', flag: '🇪🇬' },
    { code: 'IL', name: 'イスラエル', flag: '🇮🇱' },
    { code: 'JO', name: 'ヨルダン', flag: '🇯🇴' },
    { code: 'LB', name: 'レバノン', flag: '🇱🇧' },
    { code: 'KW', name: 'クウェート', flag: '🇰🇼' },
    { code: 'QA', name: 'カタール', flag: '🇶🇦' },
    { code: 'BH', name: 'バーレーン', flag: '🇧🇭' },
    { code: 'OM', name: 'オマーン', flag: '🇴🇲' },
    { code: 'IQ', name: 'イラク', flag: '🇮🇶' },
    { code: 'IR', name: 'イラン', flag: '🇮🇷' },
    { code: 'TR', name: 'トルコ', flag: '🇹🇷' },
    { code: 'ZA', name: '南アフリカ', flag: '🇿🇦' },
    { code: 'NG', name: 'ナイジェリア', flag: '🇳🇬' },
    { code: 'KE', name: 'ケニア', flag: '🇰🇪' },
    { code: 'GH', name: 'ガーナ', flag: '🇬🇭' },
    { code: 'MA', name: 'モロッコ', flag: '🇲🇦' },
    { code: 'TN', name: 'チュニジア', flag: '🇹🇳' },
    { code: 'DZ', name: 'アルジェリア', flag: '🇩🇿' },
    { code: 'LY', name: 'リビア', flag: '🇱🇾' },
    { code: 'ET', name: 'エチオピア', flag: '🇪🇹' },
    { code: 'UG', name: 'ウガンダ', flag: '🇺🇬' },
    { code: 'TZ', name: 'タンザニア', flag: '🇹🇿' },
    { code: 'ZW', name: 'ジンバブエ', flag: '🇿🇼' },
    { code: 'BW', name: 'ボツワナ', flag: '🇧🇼' },
    { code: 'NA', name: 'ナミビア', flag: '🇳🇦' },
    { code: 'ZM', name: 'ザンビア', flag: '🇿🇲' },
    { code: 'MW', name: 'マラウィ', flag: '🇲🇼' },
    { code: 'MZ', name: 'モザンビーク', flag: '🇲🇿' },
    { code: 'MG', name: 'マダガスカル', flag: '🇲🇬' },
    { code: 'MU', name: 'モーリシャス', flag: '🇲🇺' },
    { code: 'SC', name: 'セイシェル', flag: '🇸🇨' },
    // South America
    { code: 'BR', name: 'ブラジル', flag: '🇧🇷' },
    { code: 'AR', name: 'アルゼンチン', flag: '🇦🇷' },
    { code: 'CL', name: 'チリ', flag: '🇨🇱' },
    { code: 'CO', name: 'コロンビア', flag: '🇨🇴' },
    { code: 'PE', name: 'ペルー', flag: '🇵🇪' },
    { code: 'VE', name: 'ベネズエラ', flag: '🇻🇪' },
    { code: 'EC', name: 'エクアドル', flag: '🇪🇨' },
    { code: 'BO', name: 'ボリビア', flag: '🇧🇴' },
    { code: 'PY', name: 'パラグアイ', flag: '🇵🇾' },
    { code: 'UY', name: 'ウルグアイ', flag: '🇺🇾' },
    { code: 'GY', name: 'ガイアナ', flag: '🇬🇾' },
    { code: 'SR', name: 'スリナム', flag: '🇸🇷' },
    // Central America & Caribbean
    { code: 'GT', name: 'グアテマラ', flag: '🇬🇹' },
    { code: 'HN', name: 'ホンジュラス', flag: '🇭🇳' },
    { code: 'SV', name: 'エルサルバドル', flag: '🇸🇻' },
    { code: 'NI', name: 'ニカラグア', flag: '🇳🇮' },
    { code: 'CR', name: 'コスタリカ', flag: '🇨🇷' },
    { code: 'PA', name: 'パナマ', flag: '🇵🇦' },
    { code: 'CU', name: 'キューバ', flag: '🇨🇺' },
    { code: 'JM', name: 'ジャマイカ', flag: '🇯🇲' },
    { code: 'HT', name: 'ハイチ', flag: '🇭🇹' },
    { code: 'DO', name: 'ドミニカ共和国', flag: '🇩🇴' },
    { code: 'PR', name: 'プエルトリコ', flag: '🇵🇷' },
    { code: 'TT', name: 'トリニダード・トバゴ', flag: '🇹🇹' },
    { code: 'BB', name: 'バルバドス', flag: '🇧🇧' },
    { code: 'BS', name: 'バハマ', flag: '🇧🇸' },
    { code: 'BZ', name: 'ベリーズ', flag: '🇧🇿' },
    { code: 'AG', name: 'アンティグア・バーブーダ', flag: '🇦🇬' },
    { code: 'DM', name: 'ドミニカ', flag: '🇩🇲' },
    { code: 'GD', name: 'グレナダ', flag: '🇬🇩' },
    { code: 'KN', name: 'セントキッツ・ネイビス', flag: '🇰🇳' },
    { code: 'LC', name: 'セントルシア', flag: '🇱🇨' },
    { code: 'VC', name: 'セントビンセント・グレナディーン', flag: '🇻🇨' },
  ];

  const languages = [
    { code: 'all', name: 'すべての言語' },
    { code: 'en', name: '英語' },
    { code: 'ja', name: '日本語' },
    { code: 'ko', name: '韓国語' },
    { code: 'zh', name: '中国語' },
    { code: 'es', name: 'スペイン語' },
    { code: 'fr', name: 'フランス語' },
    { code: 'de', name: 'ドイツ語' },
    { code: 'pt', name: 'ポルトガル語' },
    { code: 'hi', name: 'ヒンディー語' },
  ];

  const loadGlobalTrending = async () => {
    setLoading(true);
    try {
      // Mock data for development when backend is not available
      const mockVideos = [
        {
          video_id: 'global1',
          title: 'Global Trending Video 1',
          channel_name: 'Global Channel',
          thumbnail_url: 'https://via.placeholder.com/320x180?text=Global+1',
          url: 'https://youtube.com/watch?v=global1',
          statistics: {
            views: Math.floor(Math.random() * 1000000) + 100000,
            likes: Math.floor(Math.random() * 50000) + 5000,
            comments: Math.floor(Math.random() * 5000) + 500
          }
        },
        {
          video_id: 'global2',
          title: 'Global Trending Video 2',
          channel_name: 'International Channel',
          thumbnail_url: 'https://via.placeholder.com/320x180?text=Global+2',
          url: 'https://youtube.com/watch?v=global2',
          statistics: {
            views: Math.floor(Math.random() * 1000000) + 100000,
            likes: Math.floor(Math.random() * 50000) + 5000,
            comments: Math.floor(Math.random() * 5000) + 500
          }
        }
      ];

      let allVideos: any[] = [];
      
      if (selectedRegion === 'all') {
        // Fetch from multiple regions to get truly global coverage
        const regionsToFetch = regions.filter(r => r.code !== 'all').map(r => r.code);
        
        try {
          // Fetch from all regions in parallel
          const promises = regionsToFetch.map(async (region) => {
            try {
              const response = await fetch(`http://localhost:8000/api/v1/trending/videos?region=${region}&max_results=5`);
              if (response.ok) {
                const data = await response.json();
                return data.map((video: any) => ({ ...video, source_region: region }));
              }
            } catch (error) {
              console.log(`Failed to fetch from ${region}:`, error);
            }
            return [];
          });
          
          const results = await Promise.all(promises);
          allVideos = results.flat();
          
          // Remove duplicates based on video_id
          const uniqueVideos = new Map();
          allVideos.forEach(video => {
            if (!uniqueVideos.has(video.video_id)) {
              uniqueVideos.set(video.video_id, video);
            }
          });
          allVideos = Array.from(uniqueVideos.values());
          
        } catch (error) {
          console.log('Error fetching from multiple regions, using mock data');
          allVideos = mockVideos;
        }
      } else {
        // Fetch from single region
        try {
          const response = await fetch(`http://localhost:8000/api/v1/trending/videos?region=${selectedRegion}&max_results=30`);
          if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
          }
          const apiData = await response.json();
          if (!apiData || !Array.isArray(apiData)) {
            allVideos = mockVideos;
          } else if (apiData.length === 0) {
            allVideos = mockVideos;
          } else {
            allVideos = apiData.map((video: any) => ({ ...video, source_region: selectedRegion }));
          }
        } catch (error) {
          console.log('Backend not available, using mock data');
          allVideos = mockVideos;
        }
      }
      
      const data = { videos: allVideos };
      
      // Simulate global data with cultural insights
      const globalVideos = data.videos.map((video: any, index: number) => {
        // Use the actual source region if available, otherwise fallback to selected region
        const sourceRegion = video.source_region || selectedRegion;
        const regionData = regions.find(r => r.code === sourceRegion) || regions.find(r => r.code === 'all') || regions[0];
        return {
          ...video,
          region: regionData.code,
          region_name: regionData.name,
          language: languages[Math.floor(Math.random() * languages.length)].code,
          trending_position: index + 1,
          cultural_insights: {
            local_trends: ['地域トレンド1', '地域トレンド2', '地域トレンド3'],
            cultural_relevance: Math.floor(Math.random() * 30) + 70,
            language_adaptation: '現地語に適応済み'
          }
        };
      });
      
      setVideos(globalVideos);
    } catch (error) {
      console.error('Error loading global trending:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGlobalTrending();
  }, [selectedRegion, selectedLanguage]);

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const getRegionFlag = (regionCode: string) => {
    const region = regions.find(r => r.code === regionCode);
    return region?.flag || '🌍';
  };

  const getCulturalRelevanceColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 80) return 'text-yellow-600';
    if (score >= 70) return 'text-orange-600';
    return 'text-red-600';
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-yellow-600 to-yellow-700 p-3 rounded-xl">
              <Globe className="text-white" size={28} />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-yellow-600 to-yellow-700 bg-clip-text text-transparent">
                グローバル対応
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                世界中のすべての国・地域のトレンドコンテンツにアクセス
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-white dark:bg-gray-800 border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Select value={selectedRegion} onValueChange={setSelectedRegion}>
              <SelectTrigger className="w-[200px]">
                <Globe size={16} className="mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {regions.map((region) => (
                  <SelectItem key={region.code} value={region.code}>
                    <span className="flex items-center gap-2">
                      <span>{region.flag}</span>
                      <span>{region.name}</span>
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
              <SelectTrigger className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {languages.map((language) => (
                  <SelectItem key={language.code} value={language.code}>
                    {language.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
                グローバルトレンド
              </TabsTrigger>
              <TabsTrigger value="cultural">
                <MapPin size={16} className="mr-2" />
                文化的インサイト
              </TabsTrigger>
              <TabsTrigger value="comparison">
                <Users size={16} className="mr-2" />
                地域比較
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="trending">
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
                        <div className="absolute top-2 left-2">
                          <Badge className="bg-white/90 text-gray-800">
                            #{video.trending_position}
                          </Badge>
                        </div>
                        <div className="absolute top-2 right-2">
                          <Badge variant="secondary" className="flex items-center gap-1">
                            <span>{getRegionFlag(video.region)}</span>
                            <span>{video.region_name}</span>
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

                      {/* Cultural Relevance */}
                      <div className="mb-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium">文化的関連性</span>
                          <span className={`text-sm font-bold ${getCulturalRelevanceColor(video.cultural_insights.cultural_relevance)}`}>
                            {video.cultural_insights.cultural_relevance}%
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-yellow-600 h-2 rounded-full" 
                            style={{ width: `${video.cultural_insights.cultural_relevance}%` }}
                          ></div>
                        </div>
                      </div>

                      {/* Local Trends */}
                      <div className="mb-4">
                        <h4 className="text-sm font-medium mb-2">地域トレンド</h4>
                        <div className="flex flex-wrap gap-1">
                          {video.cultural_insights.local_trends.slice(0, 2).map((trend, i) => (
                            <Badge key={i} variant="outline" className="text-xs">
                              {trend}
                            </Badge>
                          ))}
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

                      {/* Action Buttons */}
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          className="flex-1 bg-gradient-to-r from-yellow-600 to-yellow-700"
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
                <Globe size={48} className="mx-auto text-gray-400 mb-4" />
                <p className="text-gray-600 dark:text-gray-400">グローバルトレンドが見つかりませんでした</p>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="cultural">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Cultural Insights */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="text-yellow-600" size={20} />
                    文化的インサイト
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold mb-2">地域別トレンド</h4>
                      <div className="space-y-2">
                        {regions.slice(1, 6).map((region, i) => (
                          <div key={i} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded">
                            <span className="flex items-center gap-2">
                              <span>{region.flag}</span>
                              <span>{region.name}</span>
                            </span>
                            <Badge variant="secondary">
                              {Math.floor(Math.random() * 20) + 80}% 関連性
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Language Adaptation */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="text-blue-600" size={20} />
                    言語適応
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {languages.slice(1, 6).map((language, i) => (
                      <div key={i} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded">
                        <span>{language.name}</span>
                        <Badge variant="outline">
                          {Math.floor(Math.random() * 30) + 70}% 適応
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="comparison">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Region Comparison */}
              <Card>
                <CardHeader>
                  <CardTitle>地域別パフォーマンス</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {regions.slice(1, 4).map((region, i) => (
                      <div key={i} className="flex items-center justify-between">
                        <span className="flex items-center gap-2">
                          <span>{region.flag}</span>
                          <span>{region.name}</span>
                        </span>
                        <div className="flex items-center gap-2">
                          <div className="w-20 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-yellow-600 h-2 rounded-full" 
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

              {/* Trending Topics */}
              <Card>
                <CardHeader>
                  <CardTitle>トレンドトピック</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {['エンターテイメント', 'テクノロジー', 'ライフスタイル', '教育', 'ニュース'].map((topic, i) => (
                      <div key={i} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded">
                        <span>{topic}</span>
                        <Badge variant="secondary">
                          {Math.floor(Math.random() * 50) + 50}%
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Engagement Metrics */}
              <Card>
                <CardHeader>
                  <CardTitle>エンゲージメント指標</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span>平均視聴時間</span>
                      <span className="font-semibold">4:32</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>いいね率</span>
                      <span className="font-semibold">8.5%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>コメント率</span>
                      <span className="font-semibold">2.1%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>シェア率</span>
                      <span className="font-semibold">1.8%</span>
                    </div>
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
