/**
 * CREAFT API Client
 * Frontend integration with CREAFT backend
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export interface User {
  id: number;
  email: string;
  username: string;
  full_name?: string;
  subscription_plan: 'starter' | 'growth' | 'enterprise';
  max_accounts: number;
  max_monthly_creatives: number;
}

export interface Creative {
  id: number;
  platform_creative_id: string;
  platform_url: string;
  creative_type: 'organic' | 'paid';
  content_type: 'image' | 'video' | 'carousel' | 'reel' | 'short';
  caption?: string;
  title?: string;
  media_url?: string;
  thumbnail_url?: string;
  published_at: string;
  account: {
    platform: 'instagram' | 'youtube' | 'tiktok';
    username: string;
  };
  latest_metrics?: {
    views: number;
    likes: number;
    comments: number;
    shares: number;
    engagement_rate: number;
    buzz_score: number;
  };
  ai_labels?: Record<string, { value: string; confidence: number }>;
}

export interface BuzzAnalysis {
  creative_id: number;
  hit_probability_score: number;
  viral_potential: 'low' | 'medium' | 'high';
  analysis_details: {
    hook: { score: number; type: string };
    cta: { score: number; type: string };
    emotion: { score: number; primary: string };
    top_factors: string[];
  };
  success_factors: string[];
  analyzed_at: string;
}

class CreaftAPI {
  private baseURL: string;
  private token: string | null = null;

  constructor() {
    this.baseURL = API_BASE;
    
    // Try to get token from localStorage if available
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('creaft_token');
    }
  }

  setToken(token: string) {
    this.token = token;
    if (typeof window !== 'undefined') {
      localStorage.setItem('creaft_token', token);
    }
  }

  clearToken() {
    this.token = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('creaft_token');
    }
  }

  private async request(endpoint: string, options: RequestInit = {}) {
    const url = `${this.baseURL}/api/v1${endpoint}`;
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...(this.token && { Authorization: `Bearer ${this.token}` }),
      },
      ...options,
    };

    const response = await fetch(url, config);

    if (!response.ok) {
      if (response.status === 401) {
        this.clearToken();
        throw new Error('Authentication required');
      }
      const errorData = await response.json().catch(() => ({ detail: 'Unknown error' }));
      throw new Error(errorData.detail || `API Error: ${response.status}`);
    }

    return response.json();
  }

  // Authentication
  async register(userData: {
    email: string;
    username: string;
    password: string;
    full_name?: string;
    company_name?: string;
    industry?: string;
  }): Promise<User> {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async login(email: string, password: string): Promise<{ access_token: string; user: User }> {
    const formData = new FormData();
    formData.append('username', email);
    formData.append('password', password);

    const tokenResponse = await this.request('/auth/login', {
      method: 'POST',
      body: formData,
      headers: {}, // Let browser set Content-Type for FormData
    });

    this.setToken(tokenResponse.access_token);

    // Get user info
    const user = await this.getCurrentUser();

    return { access_token: tokenResponse.access_token, user };
  }

  async getCurrentUser(): Promise<User> {
    return this.request('/auth/me');
  }

  async logout() {
    await this.request('/auth/logout', { method: 'POST' });
    this.clearToken();
  }

  // Creatives
  async getCreatives(filters: {
    platform?: 'instagram' | 'youtube' | 'tiktok';
    creative_type?: 'organic' | 'paid';
    content_type?: 'image' | 'video' | 'carousel' | 'reel' | 'short';
    days_back?: number;
    limit?: number;
    offset?: number;
    sort_by?: 'published_at' | 'engagement_rate' | 'views' | 'buzz_score';
    sort_order?: 'asc' | 'desc';
  } = {}): Promise<{
    creatives: Creative[];
    total_count: number;
    has_more: boolean;
  }> {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined) {
        params.append(key, value.toString());
      }
    });

    return this.request(`/creatives?${params}`);
  }

  async getCreative(id: number): Promise<Creative> {
    return this.request(`/creatives/${id}`);
  }

  async analyzeCreative(id: number): Promise<BuzzAnalysis> {
    return this.request(`/creatives/${id}/analyze`, {
      method: 'POST',
    });
  }

  async getTrendingGenres(daysBack: number = 7): Promise<{
    trending_genres: Array<{ genre: string; count: number; trending_score: number }>;
    period_days: number;
    total_high_performing_content: number;
  }> {
    return this.request(`/creatives/trending/genres?days_back=${daysBack}`);
  }

  async getBuzzTimeline(
    platform?: 'instagram' | 'youtube' | 'tiktok',
    daysBack: number = 30
  ): Promise<{
    timeline: Array<{
      date: string;
      organic: {
        count: number;
        views: number;
        engagement: number;
        avg_engagement_rate: number;
      };
      paid: {
        count: number;
        impressions: number;
        engagement: number;
        avg_engagement_rate: number;
      };
    }>;
    summary: {
      total_organic: number;
      total_paid: number;
      avg_organic_engagement_rate: number;
      avg_paid_engagement_rate: number;
    };
  }> {
    const params = new URLSearchParams({ days_back: daysBack.toString() });
    if (platform) {
      params.append('platform', platform);
    }
    return this.request(`/creatives/stats/buzz-timeline?${params}`);
  }

  // Accounts
  async getAccounts(): Promise<Array<{
    id: number;
    platform: 'instagram' | 'youtube' | 'tiktok';
    username: string;
    display_name?: string;
    follower_count: number;
    status: 'active' | 'inactive' | 'error' | 'pending';
  }>> {
    return this.request('/accounts');
  }

  async addAccount(platform: 'instagram' | 'youtube' | 'tiktok', credentials: any) {
    return this.request('/accounts', {
      method: 'POST',
      body: JSON.stringify({ platform, ...credentials }),
    });
  }

  // AI Content Generation
  async generateContentSuggestions(
    input: string,
    brandContext?: string
  ): Promise<{
    hooks: string[];
    ctas: string[];
    hashtags: string[];
    script: string;
    visual_suggestions: string[];
  }> {
    return this.request('/ai/content-suggestions', {
      method: 'POST',
      body: JSON.stringify({ input, brand_context: brandContext }),
    });
  }
}

// Export singleton instance
export const api = new CreaftAPI();

// Export utility hooks for React
export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        if (api.token) {
          const userData = await api.getCurrentUser();
          setUser(userData);
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        api.clearToken();
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    const { user } = await api.login(email, password);
    setUser(user);
    return user;
  };

  const logout = async () => {
    await api.logout();
    setUser(null);
  };

  const register = async (userData: Parameters<typeof api.register>[0]) => {
    const user = await api.register(userData);
    setUser(user);
    return user;
  };

  return {
    user,
    loading,
    login,
    logout,
    register,
    isAuthenticated: !!user,
  };
};

// Import React hooks
import { useState, useEffect } from 'react'; 