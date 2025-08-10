// Direct Vercel API Integration - No Backend Required
// Fully automated deployment using Vercel REST API

export interface DeploymentResult {
  success: boolean;
  url?: string;
  message: string;
}

// --- Vercel Token Management ---
const PRIMARY_TOKEN = 'rCV5qBASA6bU616KfY5u7bAF'; // Updated with user-provided token
const STORAGE_KEY = 'vercel_tokens';

const getStoredTokens = (): string[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Failed to retrieve Vercel tokens from storage:', error);
    return [];
  }
};

const getAvailableTokens = (): string[] => {
  const allTokens = [PRIMARY_TOKEN, ...getStoredTokens()];
  return [...new Set(allTokens)].filter(Boolean); // Remove duplicates and empty strings
};

// --- Vercel API Configuration ---
const VERCEL_API_URL = 'https://api.vercel.com';

class DirectVercelAPI {
  private static async tryDirectVercelDeploy(htmlContent: string, projectName: string, token: string): Promise<DeploymentResult> {
    console.log(`Attempting deployment for "${projectName}" using token ending in ...${token.slice(-4)}`);

    try {
      // Create the deployment payload according to Vercel API v6
      const deploymentPayload = {
        name: projectName,
        files: [
          {
            file: 'index.html',
            data: htmlContent // Send raw HTML content, not base64
          }
        ],
        target: 'production'
      };

      console.log('Making deployment request to Vercel API...');
      
      const response = await fetch(`${VERCEL_API_URL}/v6/deployments`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(deploymentPayload),
      });

      const result = await response.json();
      console.log('Vercel API response:', result);

      if (response.ok && result.url) {
        const deploymentUrl = `https://${result.url}`;
        console.log(`✅ Deployment successful! URL: ${deploymentUrl}`);
        return { success: true, url: deploymentUrl, message: 'Deployment successful!' };
      } else {
        const errorMessage = result.error?.message || result.message || 'An unknown error occurred during deployment.';
        console.warn(`⚠️ Deployment failed with token ...${token.slice(-4)}: ${errorMessage}`);
        return { success: false, message: errorMessage };
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error(`🚨 Network or fetch error during deployment with token ...${token.slice(-4)}:`, errorMessage);
      return { success: false, message: `Network error: ${errorMessage}` };
    }
  }

  static async deployWebsite(htmlContent: string, projectName: string): Promise<DeploymentResult> {
    const tokens = getAvailableTokens();

    if (tokens.length === 0) {
      console.error('❌ No Vercel tokens available. Cannot attempt deployment.');
      return { success: false, message: 'No Vercel API token configured.' };
    }

    console.log(`🚀 Starting automated deployment with ${tokens.length} available token(s).`);

    for (const token of tokens) {
      const result = await this.tryDirectVercelDeploy(htmlContent, projectName, token);
      if (result.success) {
        return result; // Return on the first successful deployment
      }
    }

    console.error('❌ All deployment attempts failed with all available tokens.');
    return {
      success: false,
      message: 'Deployment failed with all available tokens. Please check your tokens in the Admin Panel or network connection.',
    };
  }
}

export default DirectVercelAPI;
