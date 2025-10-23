# CREAFT Backend

**Creative & Growth Autopilot for Instagram / YouTube / TikTok**

A FastAPI backend implementing Route 1 methodology for collecting and analyzing social media content using official APIs only.

## 🚀 Features

- **Route 1 Data Collection**: Uses only official APIs (Instagram Graph, YouTube Data, Meta Ad Library, TikTok Commercial)
- **AI-Powered Analysis**: GPT-4o Vision for 9-axis buzz factor analysis
- **Unified Timeline**: Cross-platform content view (Instagram + YouTube + TikTok)
- **Hit Probability Scoring**: Predict viral potential before posting
- **Subscription-Based**: Starter/Growth/Enterprise tiers with feature gating
- **Secure & Compliant**: JWT authentication, rate limiting, audit logging

## 📁 Project Structure

```
backend/
├── app/
│   ├── api/v1/endpoints/     # API endpoints
│   ├── core/                 # Core configuration and utilities
│   ├── models/              # SQLAlchemy database models
│   ├── schemas/             # Pydantic validation schemas
│   ├── services/            # Business logic and external integrations
│   └── main.py              # FastAPI application entry point
├── requirements.txt         # Python dependencies
├── .env.example            # Environment variables template
└── README.md
```

## 🛠 Setup Instructions

### 1. Prerequisites

- Python 3.11+
- PostgreSQL 14+
- Redis 6+
- Google Cloud Project (for BigQuery/GCS)
- Social Media API Access:
  - Instagram Graph API access token
  - YouTube Data API key
  - Meta Ad Library token
  - OpenAI API key

### 2. Installation

1. **Clone and setup environment:**
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

2. **Configure environment:**
```bash
cp .env.example .env
# Edit .env with your API keys and configuration
```

3. **Setup database:**
```bash
# Create PostgreSQL database
createdb creaft_db

# Run initial migration (auto-created on startup)
python -c "from app.main import app; import uvicorn; uvicorn.run(app, host='127.0.0.1', port=8000)"
```

### 3. API Keys Setup

#### Instagram Graph API
1. Create a Facebook App at [developers.facebook.com](https://developers.facebook.com)
2. Add Instagram Graph API product
3. Get access token for Instagram Business accounts
4. Set in `.env`: `INSTAGRAM_ACCESS_TOKEN=your_token`

#### YouTube Data API  
1. Enable YouTube Data API v3 in Google Cloud Console
2. Create API key
3. Set in `.env`: `YOUTUBE_API_KEY=your_key`

#### Meta Ad Library
1. Get access token with `ads_read` permission
2. Set in `.env`: `META_AD_LIBRARY_TOKEN=your_token`

#### OpenAI
1. Get API key from [platform.openai.com](https://platform.openai.com)
2. Set in `.env`: `OPENAI_API_KEY=your_key`

### 4. Run the Application

```bash
# Development mode
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Production mode
uvicorn app.main:app --host 0.0.0.0 --port 8000
```

## 🔗 Frontend Integration

### API Base URL
```
Development: http://localhost:8000
Production: https://your-domain.com
```

### Key Endpoints for Frontend

#### Authentication
```javascript
// Register user
POST /api/v1/auth/register
{
  "email": "user@example.com",
  "username": "username",
  "password": "password123",
  "full_name": "Full Name",
  "company_name": "Company Inc."
}

// Login
POST /api/v1/auth/login
{
  "username": "user@example.com",
  "password": "password123"
}

// Response
{
  "access_token": "jwt_token",
  "refresh_token": "refresh_token",
  "token_type": "bearer",
  "expires_in": 1800
}
```

#### Get Unified Creative Timeline
```javascript
// Get creatives across all platforms
GET /api/v1/creatives?platform=instagram&days_back=7&limit=50

// Response
{
  "creatives": [
    {
      "id": 1,
      "platform_creative_id": "instagram_id",
      "platform_url": "https://instagram.com/p/...",
      "creative_type": "organic",
      "content_type": "video",
      "caption": "Caption text",
      "media_url": "https://scontent.cdninstagram.com/...",
      "thumbnail_url": "https://scontent.cdninstagram.com/...",
      "published_at": "2024-01-15T10:30:00Z",
      "latest_metrics": {
        "views": 10000,
        "likes": 500,
        "comments": 25,
        "engagement_rate": 5.25,
        "buzz_score": 78.5
      },
      "ai_labels": {
        "hook": {"value": "curiosity", "confidence": 0.85},
        "genre": {"value": "tutorial", "confidence": 0.92}
      }
    }
  ],
  "total_count": 150,
  "has_more": true
}
```

#### AI Buzz Analysis (Growth+ Feature)
```javascript
// Analyze content for viral potential
POST /api/v1/creatives/123/analyze

// Response
{
  "creative_id": 123,
  "hit_probability_score": 78.5,
  "viral_potential": "high",
  "analysis_details": {
    "hook": {"score": 8, "type": "curiosity"},
    "cta": {"score": 7, "type": "comment_prompt"},
    "emotion": {"score": 9, "primary": "surprise"},
    "top_factors": ["hook", "emotion", "timing"]
  },
  "success_factors": ["Strong curiosity hook", "High emotional impact"],
  "analyzed_at": "2024-01-15T11:00:00Z"
}
```

#### Trending Genres (Kataseru-like)
```javascript
// Get trending content categories
GET /api/v1/creatives/trending/genres?days_back=7

// Response
{
  "trending_genres": [
    {"genre": "tutorial", "count": 25, "trending_score": 250},
    {"genre": "before_after", "count": 18, "trending_score": 180}
  ],
  "period_days": 7,
  "total_high_performing_content": 150
}
```

### Frontend Implementation Example

```javascript
// utils/api.js
const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

class CreaftAPI {
  constructor() {
    this.baseURL = API_BASE;
    this.token = null;
  }

  setToken(token) {
    this.token = token;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}/api/v1${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...(this.token && { Authorization: `Bearer ${this.token}` })
      },
      ...options
    };

    const response = await fetch(url, config);
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }
    
    return response.json();
  }

  // Authentication
  async login(email, password) {
    const formData = new FormData();
    formData.append('username', email);
    formData.append('password', password);
    
    return this.request('/auth/login', {
      method: 'POST',
      body: formData,
      headers: {} // Remove Content-Type for FormData
    });
  }

  // Get unified creative timeline
  async getCreatives(filters = {}) {
    const params = new URLSearchParams(filters);
    return this.request(`/creatives?${params}`);
  }

  // Analyze content for buzz factors
  async analyzeCreative(creativeId) {
    return this.request(`/creatives/${creativeId}/analyze`, {
      method: 'POST'
    });
  }

  // Get trending genres
  async getTrendingGenres(daysBack = 7) {
    return this.request(`/creatives/trending/genres?days_back=${daysBack}`);
  }
}

export const api = new CreaftAPI();
```

## 🔧 Key Configuration

### Subscription Plan Limits
```python
# In app/models/user.py
STARTER_LIMITS = {
    "max_accounts": 3,
    "max_monthly_creatives": 500,
    "ai_analysis": False
}

GROWTH_LIMITS = {
    "max_accounts": 10, 
    "max_monthly_creatives": 10000,
    "ai_analysis": True
}

ENTERPRISE_LIMITS = {
    "max_accounts": "unlimited",
    "max_monthly_creatives": "unlimited", 
    "ai_analysis": True,
    "compliance_vault": True
}
```

### Rate Limiting
- Instagram Graph API: 200 calls/hour
- YouTube Data API: 10,000 quota/day
- TikTok Commercial API: 50 calls/minute
- OpenAI API: Based on your plan

## 📊 Monitoring & Health Checks

- **Health Check**: `GET /health`
- **Metrics**: `GET /metrics` (Prometheus format)
- **API Docs**: `GET /api/docs` (Swagger UI)

## 🚦 Development vs Production

### Development
- Detailed logging enabled
- Swagger UI available at `/api/docs`
- CORS allows localhost origins
- Database echo enabled

### Production
- Swagger UI disabled
- Error logging to files
- Strict CORS policy
- Performance monitoring enabled

## 📝 Next Steps

1. **Set up data collection workers**: Implement Celery tasks for periodic content collection
2. **Add YouTube collector**: Implement YouTube Data API service similar to Instagram
3. **TikTok integration**: Add TikTok Commercial Content API when available
4. **BigQuery integration**: Set up data warehouse for long-term analytics
5. **Frontend integration**: Connect React/Next.js frontend to these APIs

## 🔒 Security Notes

- All API tokens are encrypted at rest
- JWT tokens expire in 30 minutes (configurable)
- Rate limiting implemented per user
- Audit logging for all API calls
- CORS configured for production origins only

## 📞 Support

For questions about the backend implementation or API integration, refer to the detailed endpoint documentation at `/api/docs` when running in development mode. 