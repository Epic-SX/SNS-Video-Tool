'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Sparkles, 
  Copy, 
  Download, 
  Video, 
  Lightbulb,
  Zap,
  Clock,
  Target,
  Check
} from 'lucide-react';

interface ScriptSection {
  hook: string;
  introduction: string;
  main_content: string;
  cta: string;
  visual_suggestions: string[];
  pacing_notes: string;
  estimated_duration: number;
  full_script: string;
}

function ScriptGeneratorContent() {
  const searchParams = useSearchParams();
  const videoId = searchParams.get('videoId');

  const [activeTab, setActiveTab] = useState('from-video');
  const [loading, setLoading] = useState(false);
  const [generatedScript, setGeneratedScript] = useState<ScriptSection | null>(null);
  const [copied, setCopied] = useState(false);

  // Form states
  const [videoIdInput, setVideoIdInput] = useState(videoId || '');
  const [scriptLength, setScriptLength] = useState('medium');
  const [scriptStyle, setScriptStyle] = useState('engaging');
  const [ideaInput, setIdeaInput] = useState('');
  const [targetPlatform, setTargetPlatform] = useState('youtube');
  const [targetDuration, setTargetDuration] = useState(60);

  const generateScriptFromVideo = async () => {
    if (!videoIdInput.trim()) {
      alert('Please enter a video ID or URL');
      return;
    }

    try {
      setLoading(true);
      const cleanVideoId = videoIdInput.includes('youtube.com') 
        ? videoIdInput.split('v=')[1]?.split('&')[0]
        : videoIdInput;

      const response = await fetch('http://localhost:8000/api/v1/scripts/generate-from-video', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          video_id: cleanVideoId,
          script_length: scriptLength,
          style: scriptStyle
        })
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      // Ensure visual_suggestions is always an array
      if (!data.visual_suggestions) {
        data.visual_suggestions = [];
      }
      
      setGeneratedScript(data);
    } catch (error) {
      console.error('Error generating script:', error);
      alert('Error generating script. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const generateScriptFromIdea = async () => {
    if (!ideaInput.trim()) {
      alert('Please enter a content idea');
      return;
    }

    try {
      setLoading(true);
      const response = await fetch('http://localhost:8000/api/v1/scripts/generate-from-idea', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          idea: ideaInput,
          target_platform: targetPlatform,
          target_duration: targetDuration,
          style: scriptStyle
        })
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      // Ensure visual_suggestions is always an array
      if (!data.visual_suggestions) {
        data.visual_suggestions = [];
      }
      
      setGeneratedScript(data);
    } catch (error) {
      console.error('Error generating script:', error);
      alert('Error generating script. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadScript = () => {
    if (!generatedScript) return;

    const scriptText = `
VIDEO SCRIPT
============

HOOK (0-5 seconds)
${generatedScript.hook}

INTRODUCTION (5-15 seconds)
${generatedScript.introduction}

MAIN CONTENT
${generatedScript.main_content}

CALL TO ACTION
${generatedScript.cta}

PACING NOTES
${generatedScript.pacing_notes}

VISUAL SUGGESTIONS
${generatedScript.visual_suggestions.join('\n')}

ESTIMATED DURATION: ${generatedScript.estimated_duration} seconds
    `;

    const blob = new Blob([scriptText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'video-script.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-purple-600 to-blue-600 p-3 rounded-xl">
              <Sparkles className="text-white" size={28} />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                SNS AI台本ジェネレーター
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                AIでバイラル動画の台本を生成 - SNS Video Toolで動作
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Input Section */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lightbulb className="text-yellow-500" size={24} />
                  台本を生成
                </CardTitle>
                <CardDescription>
                  台本の生成方法を選択してください
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="from-video">
                      <Video size={16} className="mr-2" />
                      動画から
                    </TabsTrigger>
                    <TabsTrigger value="from-idea">
                      <Zap size={16} className="mr-2" />
                      アイデアから
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="from-video" className="space-y-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">
                        YouTube動画IDまたはURL
                      </label>
                      <Input
                        placeholder="動画IDを入力またはYouTube URLを貼り付け..."
                        value={videoIdInput}
                        onChange={(e) => setVideoIdInput(e.target.value)}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium mb-2 block">
                          台本の長さ
                        </label>
                        <Select value={scriptLength} onValueChange={setScriptLength}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="short">短い (30秒)</SelectItem>
                            <SelectItem value="medium">中程度 (60秒)</SelectItem>
                            <SelectItem value="long">長い (120秒以上)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <label className="text-sm font-medium mb-2 block">
                          スタイル
                        </label>
                        <Select value={scriptStyle} onValueChange={setScriptStyle}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="engaging">魅力的</SelectItem>
                            <SelectItem value="educational">教育的</SelectItem>
                            <SelectItem value="entertaining">エンターテイメント</SelectItem>
                            <SelectItem value="professional">プロフェッショナル</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <Button 
                      className="w-full bg-gradient-to-r from-purple-600 to-blue-600"
                      onClick={generateScriptFromVideo}
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                          生成中...
                        </>
                      ) : (
                        <>
                          <Sparkles size={16} className="mr-2" />
                          台本を生成
                        </>
                      )}
                    </Button>
                  </TabsContent>

                  <TabsContent value="from-idea" className="space-y-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">
                        コンテンツアイデア
                      </label>
                      <Textarea
                        placeholder="動画のアイデアを説明してください...（例: 「学生向けの10の生産性向上のヒント」）"
                        value={ideaInput}
                        onChange={(e) => setIdeaInput(e.target.value)}
                        rows={4}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium mb-2 block">
                          プラットフォーム
                        </label>
                        <Select value={targetPlatform} onValueChange={setTargetPlatform}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="youtube">YouTube</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <label className="text-sm font-medium mb-2 block">
                          長さ（秒）
                        </label>
                        <Input
                          type="number"
                          value={targetDuration}
                          onChange={(e) => setTargetDuration(parseInt(e.target.value))}
                          min={15}
                          max={600}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-medium mb-2 block">
                        スタイル
                      </label>
                      <Select value={scriptStyle} onValueChange={setScriptStyle}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="engaging">魅力的</SelectItem>
                          <SelectItem value="educational">教育的</SelectItem>
                          <SelectItem value="entertaining">エンターテイメント</SelectItem>
                          <SelectItem value="professional">プロフェッショナル</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <Button 
                      className="w-full bg-gradient-to-r from-purple-600 to-blue-600"
                      onClick={generateScriptFromIdea}
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                          生成中...
                        </>
                      ) : (
                        <>
                          <Sparkles size={16} className="mr-2" />
                          台本を生成
                        </>
                      )}
                    </Button>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>

            {/* Quick Tips */}
            <Card className="mt-4">
              <CardHeader>
                <CardTitle className="text-sm">💡 プロのヒント</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-gray-600 dark:text-gray-400 space-y-2">
                <p>• より良い結果を得るには、動画のアイデアを具体的に</p>
                <p>• ターゲットオーディエンスに適したスタイルを選択</p>
                <p>• プラットフォームに基づいて長さを調整</p>
                <p>• 生成された台本をレビューしてカスタマイズ</p>
              </CardContent>
            </Card>
          </div>

          {/* Output Section */}
          <div>
            {loading ? (
              <Card>
                <CardHeader>
                  <Skeleton className="h-6 w-3/4" />
                </CardHeader>
                <CardContent className="space-y-4">
                  <Skeleton className="h-20 w-full" />
                  <Skeleton className="h-20 w-full" />
                  <Skeleton className="h-20 w-full" />
                </CardContent>
              </Card>
            ) : generatedScript ? (
              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2">
                        <Check className="text-green-500" size={24} />
                        生成された台本
                      </CardTitle>
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => copyToClipboard(generatedScript.full_script)}
                        >
                          {copied ? <Check size={16} /> : <Copy size={16} />}
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={downloadScript}
                        >
                          <Download size={16} />
                        </Button>
                      </div>
                    </div>
                    <CardDescription>
                      <Clock size={14} className="inline mr-1" />
                      推定時間: {generatedScript.estimated_duration}秒
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Hook */}
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="destructive">HOOK (0-5s)</Badge>
                      </div>
                      <div className="bg-red-50 dark:bg-red-950/20 p-4 rounded-lg">
                        <p className="text-sm">{generatedScript.hook}</p>
                      </div>
                    </div>

                    {/* Introduction */}
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Badge className="bg-blue-500">INTRODUCTION (5-15s)</Badge>
                      </div>
                      <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg">
                        <p className="text-sm">{generatedScript.introduction}</p>
                      </div>
                    </div>

                    {/* Main Content */}
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Badge className="bg-green-500">MAIN CONTENT</Badge>
                      </div>
                      <div className="bg-green-50 dark:bg-green-950/20 p-4 rounded-lg">
                        <p className="text-sm whitespace-pre-wrap">{generatedScript.main_content}</p>
                      </div>
                    </div>

                    {/* CTA */}
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Badge className="bg-purple-500">CALL TO ACTION</Badge>
                      </div>
                      <div className="bg-purple-50 dark:bg-purple-950/20 p-4 rounded-lg">
                        <p className="text-sm">{generatedScript.cta}</p>
                      </div>
                    </div>

                    {/* Visual Suggestions */}
                    {generatedScript.visual_suggestions && generatedScript.visual_suggestions.length > 0 && (
                      <div>
                        <h4 className="font-semibold mb-2 flex items-center gap-2">
                          <Target size={16} />
                          ビジュアル提案
                        </h4>
                        <ul className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                          {generatedScript.visual_suggestions.map((suggestion, i) => (
                            <li key={i} className="flex items-start gap-2">
                              <span className="text-purple-600 mt-1">•</span>
                              <span>{suggestion}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Pacing Notes */}
                    {generatedScript.pacing_notes && (
                      <div>
                        <h4 className="font-semibold mb-2">📝 ペーシングノート</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {generatedScript.pacing_notes}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            ) : (
              <Card className="h-full flex items-center justify-center p-12">
                <div className="text-center">
                  <Sparkles size={48} className="mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-600 dark:text-gray-400 mb-2">
                    まだ台本が生成されていません
                  </p>
                  <p className="text-sm text-gray-500">
                    フォームに入力して「台本を生成」をクリックして始めましょう
                  </p>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ScriptGeneratorPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ScriptGeneratorContent />
    </Suspense>
  );
}

