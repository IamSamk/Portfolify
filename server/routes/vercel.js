import express from 'express';
import axios from 'axios';
import { promises as fs } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const router = express.Router();

// Multiple Vercel account configuration
const VERCEL_ACCOUNTS = [
  {
    id: 'account1',
    token: process.env.VERCEL_TOKEN_1,
    teamId: process.env.VERCEL_TEAM_1,
    deploymentsUsed: 0,
    maxDeployments: 100,
    active: true
  },
  {
    id: 'account2', 
    token: process.env.VERCEL_TOKEN_2,
    teamId: process.env.VERCEL_TEAM_2,
    deploymentsUsed: 0,
    maxDeployments: 100,
    active: true
  },
  {
    id: 'account3',
    token: process.env.VERCEL_TOKEN_3,
    teamId: process.env.VERCEL_TEAM_3,
    deploymentsUsed: 0,
    maxDeployments: 100,
    active: true
  },
  {
    id: 'account4',
    token: process.env.VERCEL_TOKEN_4,
    teamId: process.env.VERCEL_TEAM_4,
    deploymentsUsed: 0,
    maxDeployments: 100,
    active: true
  },
  {
    id: 'account5',
    token: process.env.VERCEL_TOKEN_5,
    teamId: process.env.VERCEL_TEAM_5,
    deploymentsUsed: 0,
    maxDeployments: 100,
    active: true
  }
];

// Load deployment stats from persistent storage
async function loadDeploymentStats() {
  try {
    const statsPath = join(__dirname, '../data/deployment-stats.json');
    const stats = await fs.readFile(statsPath, 'utf8');
    const parsedStats = JSON.parse(stats);
    
    // Update VERCEL_ACCOUNTS with saved stats
    parsedStats.forEach(savedAccount => {
      const account = VERCEL_ACCOUNTS.find(acc => acc.id === savedAccount.id);
      if (account) {
        account.deploymentsUsed = savedAccount.deploymentsUsed;
        account.active = savedAccount.active;
      }
    });
  } catch (error) {
    console.log('No existing deployment stats found, starting fresh');
  }
}

// Save deployment stats to persistent storage
async function saveDeploymentStats() {
  try {
    const statsPath = join(__dirname, '../data/deployment-stats.json');
    const dataDir = dirname(statsPath);
    
    // Ensure data directory exists
    await fs.mkdir(dataDir, { recursive: true });
    
    const stats = VERCEL_ACCOUNTS.map(account => ({
      id: account.id,
      deploymentsUsed: account.deploymentsUsed,
      active: account.active
    }));
    
    await fs.writeFile(statsPath, JSON.stringify(stats, null, 2));
  } catch (error) {
    console.error('Error saving deployment stats:', error);
  }
}

// Get next available Vercel account
function getNextAvailableAccount() {
  // Find account with lowest usage that's still active
  const availableAccounts = VERCEL_ACCOUNTS.filter(account => 
    account.active && 
    account.token && 
    account.deploymentsUsed < account.maxDeployments
  );
  
  if (availableAccounts.length === 0) {
    throw new Error('All Vercel accounts have reached their deployment limit');
  }
  
  // Sort by usage and return least used account
  availableAccounts.sort((a, b) => a.deploymentsUsed - b.deploymentsUsed);
  return availableAccounts[0];
}

// Deploy to Vercel
async function deployToVercel(account, projectName, htmlContent) {
  try {
    // Create the deployment payload
    const files = {
      'index.html': htmlContent,
      'package.json': JSON.stringify({
        name: projectName,
        version: '1.0.0',
        description: 'AI-generated website from Portfolio Designer',
        scripts: {
          start: 'npx serve .'
        }
      }, null, 2)
    };
    
    const deploymentPayload = {
      name: projectName,
      files: Object.entries(files).map(([path, content]) => ({
        file: path,
        data: Buffer.from(content).toString('base64')
      })),
      projectSettings: {
        framework: 'vanilla'
      },
      meta: {
        source: 'ai-portfolio-designer',
        generator: 'client-side-ai'
      }
    };
    
    // Deploy to Vercel
    const response = await axios.post('https://api.vercel.com/v13/deployments', deploymentPayload, {
      headers: {
        'Authorization': `Bearer ${account.token}`,
        'Content-Type': 'application/json',
        ...(account.teamId && { 'Vercel-Team-Id': account.teamId })
      }
    });
    
    const deployment = response.data;
    
    // Wait for deployment to be ready
    let deploymentStatus = 'BUILDING';
    let attempts = 0;
    const maxAttempts = 30; // 5 minutes max wait
    
    while (deploymentStatus !== 'READY' && deploymentStatus !== 'ERROR' && attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 10000)); // Wait 10 seconds
      
      try {
        const statusResponse = await axios.get(`https://api.vercel.com/v13/deployments/${deployment.id}`, {
          headers: {
            'Authorization': `Bearer ${account.token}`,
            ...(account.teamId && { 'Vercel-Team-Id': account.teamId })
          }
        });
        
        deploymentStatus = statusResponse.data.readyState;
        attempts++;
      } catch (statusError) {
        console.warn('Error checking deployment status:', statusError.message);
        break;
      }
    }
    
    if (deploymentStatus === 'ERROR') {
      throw new Error('Deployment failed on Vercel');
    }
    
    // Update account usage
    account.deploymentsUsed++;
    await saveDeploymentStats();
    
    return {
      url: `https://${deployment.url}`,
      deploymentId: deployment.id,
      accountUsed: account.id,
      status: deploymentStatus
    };
    
  } catch (error) {
    console.error('Vercel deployment error:', error.response?.data || error.message);
    throw new Error(`Deployment failed: ${error.response?.data?.error?.message || error.message}`);
  }
}

// API endpoint for deploying to Vercel
router.post('/deploy-vercel', async (req, res) => {
  try {
    const { projectName, html } = req.body;
    
    if (!projectName || !html) {
      return res.status(400).json({ 
        error: 'Project name and HTML content are required' 
      });
    }
    
    // Load current deployment stats
    await loadDeploymentStats();
    
    // Get next available account
    const account = getNextAvailableAccount();
    
    console.log(`🚀 Deploying "${projectName}" using account: ${account.id} (${account.deploymentsUsed}/${account.maxDeployments} used)`);
    
    // Deploy to Vercel
    const result = await deployToVercel(account, projectName, html);
    
    res.json({
      success: true,
      url: result.url,
      deploymentId: result.deploymentId,
      accountUsed: result.accountUsed,
      accountUsage: `${account.deploymentsUsed}/${account.maxDeployments}`,
      status: result.status
    });
    
  } catch (error) {
    console.error('Deployment error:', error);
    res.status(500).json({ 
      error: error.message,
      suggestion: 'Try again or check if all Vercel accounts are properly configured'
    });
  }
});

// API endpoint to get account status
router.get('/deployment-stats', async (req, res) => {
  try {
    await loadDeploymentStats();
    
    const stats = VERCEL_ACCOUNTS.map(account => ({
      id: account.id,
      deploymentsUsed: account.deploymentsUsed,
      maxDeployments: account.maxDeployments,
      active: account.active && !!account.token,
      usage: `${account.deploymentsUsed}/${account.maxDeployments}`,
      percentage: Math.round((account.deploymentsUsed / account.maxDeployments) * 100)
    }));
    
    const totalDeployments = stats.reduce((sum, account) => sum + account.deploymentsUsed, 0);
    const totalCapacity = stats.reduce((sum, account) => sum + account.maxDeployments, 0);
    const activeAccounts = stats.filter(account => account.active).length;
    
    res.json({
      accounts: stats,
      summary: {
        totalDeployments,
        totalCapacity,
        activeAccounts,
        overallUsage: `${totalDeployments}/${totalCapacity}`,
        overallPercentage: Math.round((totalDeployments / totalCapacity) * 100)
      }
    });
    
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// API endpoint to reset account stats (admin only)
router.post('/reset-stats', async (req, res) => {
  try {
    const { adminKey, accountId } = req.body;
    
    // Simple admin authentication
    if (adminKey !== process.env.ADMIN_KEY) {
      return res.status(401).json({ error: 'Invalid admin key' });
    }
    
    if (accountId) {
      // Reset specific account
      const account = VERCEL_ACCOUNTS.find(acc => acc.id === accountId);
      if (account) {
        account.deploymentsUsed = 0;
        account.active = true;
        await saveDeploymentStats();
        res.json({ message: `Account ${accountId} reset successfully` });
      } else {
        res.status(404).json({ error: 'Account not found' });
      }
    } else {
      // Reset all accounts
      VERCEL_ACCOUNTS.forEach(account => {
        account.deploymentsUsed = 0;
        account.active = true;
      });
      await saveDeploymentStats();
      res.json({ message: 'All accounts reset successfully' });
    }
    
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
