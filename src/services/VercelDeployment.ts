// Vercel Deployment Service with Multi-Account Support
// Handles automated deployment with account rotation

interface VercelDeploymentResult {
  success: boolean;
  url?: string;
  deploymentId?: string;
  message: string;
  accountUsed?: string;
}

class VercelDeploymentService {
  private static instance: VercelDeploymentService;
  private baseUrl = window.location.origin; // Use same origin for backend

  static getInstance(): VercelDeploymentService {
    if (!VercelDeploymentService.instance) {
      VercelDeploymentService.instance = new VercelDeploymentService();
    }
    return VercelDeploymentService.instance;
  }

  async deployWebsite(html: string, projectName: string): Promise<VercelDeploymentResult> {
    try {
      console.log('🚀 Starting Vercel deployment...');
      
      // Clean project name for Vercel
      const cleanProjectName = projectName.toLowerCase().replace(/[^a-z0-9-]/g, '-');
      
      // Try automated deployment first
      const deploymentResult = await this.tryAutomatedDeployment(html, cleanProjectName);
      
      if (deploymentResult.success) {
        return deploymentResult;
      }
      
      // Fallback to manual deployment instructions
      return this.provideManulaDeploymentInstructions(html, cleanProjectName);
      
    } catch (error) {
      console.error('Deployment failed:', error);
      return this.provideManulaDeploymentInstructions(html, projectName);
    }
  }

  private async tryAutomatedDeployment(html: string, projectName: string): Promise<VercelDeploymentResult> {
    try {
      const response = await fetch(`${this.baseUrl}/api/vercel/deploy`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          html,
          projectName,
          timestamp: Date.now()
        })
      });

      if (!response.ok) {
        throw new Error(`Deployment failed: ${response.statusText}`);
      }

      const result = await response.json();
      
      return {
        success: true,
        url: result.url,
        deploymentId: result.deploymentId,
        message: `🎉 Successfully deployed to: ${result.url}`,
        accountUsed: result.accountUsed
      };

    } catch (error) {
      console.warn('Automated deployment failed, falling back to manual:', error);
      return {
        success: false,
        message: 'Automated deployment unavailable, providing manual instructions'
      };
    }
  }

  private provideManulaDeploymentInstructions(html: string, projectName: string): VercelDeploymentResult {
    // Download the HTML file
    this.downloadHtmlFile(html, projectName);
    
    // Show deployment instructions
    const instructions = this.getDeploymentInstructions(projectName);
    
    // Display instructions in a modal or alert
    this.showDeploymentInstructions(instructions);
    
    return {
      success: true,
      message: `📦 File downloaded: ${projectName}.html - Ready for manual Vercel deployment!`
    };
  }

  private downloadHtmlFile(html: string, projectName: string): void {
    const link = document.createElement('a');
    const file = new Blob([html], { type: 'text/html' });
    link.href = URL.createObjectURL(file);
    link.download = `${projectName}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  private getDeploymentInstructions(projectName: string): string {
    return `📦 Website downloaded as ${projectName}.html!

🚀 VERCEL DEPLOYMENT GUIDE:

🎯 QUICK DEPLOYMENT (30 seconds):
1️⃣ Go to vercel.com and sign in
2️⃣ Click "New Project" 
3️⃣ Drag & drop the ${projectName}.html file
4️⃣ Rename it to "index.html" 
5️⃣ Click "Deploy"
6️⃣ Your site will be live in seconds!

🔥 UNLIMITED DEPLOYMENTS STRATEGY:

Create multiple Vercel accounts for unlimited deployments:
• Account 1: your-email@gmail.com
• Account 2: your-email+v2@gmail.com  
• Account 3: your-email+v3@gmail.com
• Account 4: your-email+v4@gmail.com
• Account 5: your-email+v5@gmail.com

💡 PRO TIPS:
✅ Each account = 100 free deployments/month
✅ 5 accounts = 500 deployments/month  
✅ Use GitHub/Google sign-in for easy switching
✅ Vercel provides instant HTTPS and global CDN

🎯 RESULT: Professional website live in under 1 minute!

🔗 Your website will be available at:
https://${projectName}-[random].vercel.app`;
  }

  private showDeploymentInstructions(instructions: string): void {
    // Create a custom modal for better UX
    const modal = document.createElement('div');
    modal.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0,0,0,0.8);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 10000;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif;
    `;

    const content = document.createElement('div');
    content.style.cssText = `
      background: white;
      padding: 2rem;
      border-radius: 12px;
      max-width: 600px;
      max-height: 80vh;
      overflow-y: auto;
      box-shadow: 0 20px 40px rgba(0,0,0,0.3);
    `;

    const closeButton = document.createElement('button');
    closeButton.textContent = '✕ Close';
    closeButton.style.cssText = `
      float: right;
      background: #ff4757;
      color: white;
      border: none;
      padding: 0.5rem 1rem;
      border-radius: 6px;
      cursor: pointer;
      margin-bottom: 1rem;
    `;

    const instructionText = document.createElement('pre');
    instructionText.textContent = instructions;
    instructionText.style.cssText = `
      white-space: pre-wrap;
      font-family: inherit;
      margin: 0;
      line-height: 1.6;
    `;

    closeButton.onclick = () => document.body.removeChild(modal);
    modal.onclick = (e) => {
      if (e.target === modal) document.body.removeChild(modal);
    };

    content.appendChild(closeButton);
    content.appendChild(instructionText);
    modal.appendChild(content);
    document.body.appendChild(modal);
  }

  async checkDeploymentStatus(deploymentId: string): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/api/vercel/status/${deploymentId}`);
      return await response.json();
    } catch (error) {
      console.error('Failed to check deployment status:', error);
      return { status: 'unknown' };
    }
  }

  async getAccountStatus(): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/api/vercel/accounts`);
      return await response.json();
    } catch (error) {
      console.error('Failed to get account status:', error);
      return { accounts: [], error: 'Backend unavailable' };
    }
  }
}

export default VercelDeploymentService.getInstance();
