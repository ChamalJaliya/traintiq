# 🚀 TraintiQ AI Chat System - Complete Setup Guide

## 📋 Table of Contents
1. [Prerequisites](#prerequisites)
2. [Project Structure](#project-structure)
3. [Backend Setup](#backend-setup)
4. [Frontend Setup](#frontend-setup)
5. [Configuration](#configuration)
6. [Running the System](#running-the-system)
7. [Testing](#testing)
8. [Troubleshooting](#troubleshooting)
9. [API Documentation](#api-documentation)
10. [Knowledge Base](#knowledge-base)

## 🔧 Prerequisites

### Required Software
- **Python 3.10+** ([Download](https://www.python.org/downloads/))
- **Node.js 18+** ([Download](https://nodejs.org/))
- **Angular CLI 17+** (`npm install -g @angular/cli`)
- **MySQL 8.0+** (XAMPP/LARAGON recommended)
- **Git** ([Download](https://git-scm.com/))

### Required Accounts
- **OpenAI Account** with API access ([OpenAI Platform](https://platform.openai.com/))
- **GPT-4 Access** (Required for advanced responses)

## 📁 Project Structure
```
TraintiQ/
├── traintiq/                          # Angular Frontend
│   ├── src/
│   │   ├── app/
│   │   │   ├── shared/
│   │   │   │   ├── components/
│   │   │   │   │   └── chat-bot/      # Chat Component
│   │   │   │   └── services/
│   │   │   │       └── chat-bot.service.ts
│   │   │   └── main-layout/           # Layout Integration
│   │   └── environments/
│   └── COMPLETE_SETUP_GUIDE.md        # This file
└── traintiq_scrapping_backend/        # Flask Backend
    ├── app/
    │   ├── api/
    │   │   └── chat_routes.py          # Chat API Routes
    │   ├── services/
    │   │   ├── chat_service.py         # Core Chat Logic
    │   │   ├── prompt_engine.py        # Prompt Templates
    │   │   └── knowledge_base.py       # Q&A Knowledge
    │   └── models/
    │       └── chat.py                 # Database Models
    ├── config.env                     # Environment Variables
    ├── requirements.txt               # Python Dependencies
    └── run.py                         # Server Entry Point
```

## 🔙 Backend Setup

### Step 1: Navigate to Backend Directory
```bash
cd traintiq_scrapping_backend
```

### Step 2: Create Virtual Environment
```bash
python -m venv venv
```

### Step 3: Activate Virtual Environment
**Windows:**
```bash
venv\Scripts\activate
```

**macOS/Linux:**
```bash
source venv/bin/activate
```

### Step 4: Install Dependencies
```bash
pip install -r requirements.txt
```

### Step 5: Database Setup
1. **Start MySQL Server** (XAMPP/LARAGON)
2. **Create Database:**
   ```sql
   CREATE DATABASE traintiq;
   ```
3. **Run Database Setup:**
   ```bash
   python create_chat_tables.py
   ```

### Step 6: Environment Configuration
Edit `config.env` file:
```env
# Database Configuration
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_DATABASE=traintiq
MYSQL_USERNAME=root
MYSQL_PASSWORD=your_mysql_password

# OpenAI Configuration
OPENAI_API_KEY=sk-proj-YOUR-ACTUAL-OPENAI-API-KEY-HERE

# Flask Configuration
FLASK_ENV=development
SECRET_KEY=dev-secret-key-change-in-production

# CORS Configuration
CORS_ORIGINS=http://localhost:4200
```

## 🔄 Frontend Setup

### Step 1: Navigate to Frontend Directory
```bash
cd traintiq
```

### Step 2: Install Dependencies
```bash
npm install
```

### Step 3: Environment Configuration
Edit `src/environments/environment.ts`:
```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:5000/api'
};
```

## ⚙️ Configuration

### API Key Setup
1. Go to [OpenAI Platform](https://platform.openai.com/api-keys)
2. Create a new API key
3. Copy the key starting with `sk-proj-...`
4. Add it to `config.env` file in backend directory

### Database Configuration
1. Ensure MySQL is running on port 3306
2. Database `traintiq` should be created
3. Update credentials in `config.env` if needed

## 🏃‍♂️ Running the System

### Method 1: Automatic Startup (Recommended)

**Start Backend:**
```bash
cd traintiq_scrapping_backend
.\start_backend.bat
```

**Start Frontend (New Terminal):**
```bash
cd traintiq
ng serve
```

### Method 2: Manual Startup

**Backend Server:**
```bash
cd traintiq_scrapping_backend
venv\Scripts\activate  # Windows
# source venv/bin/activate  # macOS/Linux
python run.py
```

**Frontend Server:**
```bash
cd traintiq
ng serve
```

### Verification
- **Backend:** http://localhost:5000/api/chat/health
- **Frontend:** http://localhost:4200
- **Chat Button:** Should appear in bottom-right corner

## 🧪 Testing

### Automated Testing
```bash
cd traintiq_scrapping_backend
.\run_test.bat
```

### Manual Testing
1. Open http://localhost:4200
2. Click the floating chat button
3. Try these test messages:
   - "Hello!"
   - "What services does TraintiQ offer?"
   - "Tell me about your pricing plans"
   - "How can I contact support?"

## 🔍 Troubleshooting

### Common Issues & Solutions

#### 1. OpenAI Package Error
```
TypeError: Client.__init__() got an unexpected keyword argument 'proxies'
```
**Solution:**
```bash
cd traintiq_scrapping_backend
venv\Scripts\activate
pip uninstall openai
pip install openai==1.40.0
```

#### 2. Database Connection Error
```
ModuleNotFoundError: No module named 'MySQLdb'
```
**Solution:**
```bash
pip install PyMySQL cryptography
```

#### 3. Chat Button Not Appearing
- Check browser console for errors
- Verify both servers are running
- Check CORS configuration

#### 4. API Key Not Working
- Ensure key starts with `sk-proj-`
- Check OpenAI account has credits
- Verify GPT-4 access

#### 5. Port Already in Use
**Backend (Port 5000):**
```bash
taskkill /F /IM python.exe
```

**Frontend (Port 4200):**
```bash
ng serve --port 4201
```

### Debug Commands

**Check Backend Health:**
```bash
curl http://localhost:5000/api/chat/health
```

**Check Database Connection:**
```bash
cd traintiq_scrapping_backend
python check_mysql.py
```

**View Chat Tables:**
```bash
python view_db.py
```

## 📚 API Documentation

### Chat Endpoints

#### POST `/api/chat/message`
Send a message to the AI assistant.

**Request:**
```json
{
  "message": "Hello! What services does TraintiQ offer?",
  "session_id": "unique_session_id"
}
```

**Response:**
```json
{
  "success": true,
  "response": "Hello! TraintiQ offers AI-powered CV analysis...",
  "quick_replies": ["Our Services", "Pricing Plans", "Contact Info"],
  "session_id": "unique_session_id",
  "tokens_used": 150,
  "model_used": "gpt-4-turbo-preview"
}
```

#### GET `/api/chat/health`
Check system health and configuration.

**Response:**
```json
{
  "success": true,
  "openai_configured": true,
  "service_status": "operational"
}
```

## 🧠 Knowledge Base

### Sample Questions & Answers

The bot can answer these 10 key questions:

1. **"What services does TraintiQ offer?"**
   - AI-Powered CV Analysis
   - Employee Profile Generation
   - Skills Assessment & Matching
   - Training Program Optimization

2. **"Tell me about your pricing plans"**
   - Starter: $29/month
   - Professional: $99/month
   - Enterprise: Custom pricing

3. **"How can I contact support?"**
   - Email: support@traintiq.com
   - Phone: 1-800-TRAINTIQ

4. **"What makes TraintiQ different?"**
   - Advanced AI technology
   - GPT-4 powered analysis
   - Comprehensive HR solutions

5. **"Can I get a demo?"**
   - Schedule through contact form
   - Free trial available

6. **"What industries do you serve?"**
   - Technology companies
   - Healthcare organizations
   - Financial services
   - Manufacturing

7. **"How does your AI work?"**
   - GPT-4 powered analysis
   - Machine learning algorithms
   - Natural language processing

8. **"What are your company values?"**
   - Innovation & Excellence
   - Collaboration & Teamwork
   - Continuous Learning

9. **"Do you offer custom integrations?"**
   - Yes, with Enterprise plan
   - API access available
   - Dedicated support

10. **"How secure is my data?"**
    - Enterprise-grade security
    - GDPR compliant
    - Data encryption

## 🚀 Next Steps

### Production Deployment
1. Update environment variables for production
2. Configure SSL certificates
3. Set up monitoring and logging
4. Configure backup strategies

### Feature Enhancements
- Voice chat integration
- Multi-language support
- Advanced analytics dashboard
- Custom AI training

## 🎉 Success Indicators

You'll know everything is working when:
- ✅ Backend starts without errors on port 5000
- ✅ Frontend serves successfully on port 4200
- ✅ Chat button appears in bottom-right corner
- ✅ AI responds with TraintiQ-specific information
- ✅ Quick replies work correctly
- ✅ No console errors in browser

## 📞 Support

If you need help:
1. Check this guide first
2. Review error messages in console
3. Test with provided sample questions
4. Verify all prerequisites are installed

---

**🎊 Congratulations!** You now have a fully functional AI-powered chat system for TraintiQ! 🚀 