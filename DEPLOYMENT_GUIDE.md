# AI Portfolio Designer - Hybrid Deployment Setup

## Overview
This application uses a hybrid deployment strategy:
- **Main App**: Hosted on GitHub Pages (free static hosting)
- **Generated Websites**: Deployed to Vercel with multi-account rotation (unlimited deployments)

## Setup Instructions

### 1. Environment Configuration
1. Copy `.env.example` to `.env` in the server directory
2. Configure your 5 Vercel accounts:
   ```bash
   # Get Vercel tokens from: https://vercel.com/account/tokens
   VERCEL_TOKEN_1=your_vercel_token_1_here
   VERCEL_TOKEN_2=your_vercel_token_2_here
   VERCEL_TOKEN_3=your_vercel_token_3_here
   VERCEL_TOKEN_4=your_vercel_token_4_here
   VERCEL_TOKEN_5=your_vercel_token_5_here
   
   # Set admin credentials
   ADMIN_KEY=your_super_secret_admin_key
   ADMIN_PASSWORD=your_admin_password
   ```

### 2. Install Dependencies
```bash
# Install server dependencies
cd server
npm install

# Install frontend dependencies (if not already done)
cd ..
npm install
```

### 3. Start the Application

#### Development Mode
```bash
# Terminal 1: Start backend server
cd server
npm run dev

# Terminal 2: Start frontend development server
npm run dev
```

#### Production Mode (GitHub Pages + Vercel Backend)
```bash
# Build for GitHub Pages
npm run build

# Deploy backend to your preferred hosting service
# The frontend will be automatically deployed to GitHub Pages
```

## Multi-Account Vercel System

### Features
- **Account Rotation**: Automatically switches between 5 Vercel accounts
- **Usage Tracking**: Monitors deployment count per account (100 limit each)
- **Persistent Stats**: Saves usage statistics across server restarts
- **Admin Panel**: Manage account status and reset counters

### API Endpoints
- `POST /api/vercel/deploy-vercel` - Deploy website using next available account
- `GET /api/vercel/deployment-stats` - View account usage statistics
- `POST /api/vercel/reset-stats` - Reset account usage (admin only)

### Account Management
1. **Create 5 Vercel Accounts**: Sign up for 5 different Vercel accounts
2. **Generate Tokens**: Create API tokens for each account
3. **Configure Environment**: Add all tokens to your `.env` file
4. **Monitor Usage**: Use the stats endpoint to track deployments

### Usage Examples

#### Deploy a Website
```javascript
const response = await fetch('/api/vercel/deploy-vercel', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    projectName: 'my-portfolio-site',
    html: '<html>...</html>'
  })
});

const result = await response.json();
console.log('Live URL:', result.url);
console.log('Account Used:', result.accountUsed);
```

#### Check Account Status
```javascript
const response = await fetch('/api/vercel/deployment-stats');
const stats = await response.json();

console.log('Total Deployments:', stats.summary.totalDeployments);
console.log('Active Accounts:', stats.summary.activeAccounts);
```

## Deployment Strategy Benefits

### Main App on GitHub Pages
✅ **Free hosting** for the AI Portfolio Designer app  
✅ **Automatic deployments** via GitHub Actions  
✅ **Custom domain support** with SSL  
✅ **Fast global CDN** distribution  

### Generated Sites on Vercel
✅ **Unlimited deployments** through account rotation  
✅ **Instant deployments** and preview URLs  
✅ **Automatic HTTPS** and custom domains  
✅ **Edge network** for fast global access  
✅ **No cold starts** for static sites  

## File Structure
```
portfolio/
├── src/                    # Frontend React app
├── server/                 # Backend Node.js server
│   ├── routes/
│   │   └── vercel.js      # Multi-account Vercel deployment
│   ├── data/              # Persistent deployment stats
│   ├── .env.example       # Environment configuration template
│   └── index.js           # Main server file
├── dist/                  # Built frontend (GitHub Pages)
└── README.md              # This file
```

## Troubleshooting

### "No Vercel tokens available" Error
- Check that your `.env` file is properly configured
- Ensure at least one `VERCEL_TOKEN_X` is set
- Verify tokens are valid by testing them manually

### "All accounts reached deployment limit" Error
- Use the admin reset endpoint to clear usage counters
- Add more Vercel accounts to increase capacity
- Check account quotas on Vercel dashboard

### Deployment Timeout
- Check Vercel service status
- Verify account tokens are not expired
- Try with a smaller HTML file first

## Security Notes
- Keep your `.env` file secure and never commit it
- Use strong admin passwords
- Rotate Vercel tokens periodically
- Monitor deployment statistics regularly
