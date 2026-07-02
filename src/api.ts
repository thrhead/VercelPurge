import { VercelProject, VercelDeployment } from './types';

export class VercelAPI {
  private token: string;

  constructor(token: string) {
    this.token = token;
  }

  private async fetch(path: string, options: RequestInit = {}) {
    const res = await fetch(`/api/vercel/${path}`, {
      ...options,
      headers: {
        ...options.headers,
        Authorization: `Bearer ${this.token}`,
      },
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error?.message || `Vercel API error: ${res.status}`);
    }

    return res.json();
  }

  async getProjects(): Promise<VercelProject[]> {
    const data = await this.fetch('v9/projects');
    return data.projects || [];
  }

  async getDeployments(projectId: string, limit: number = 100): Promise<VercelDeployment[]> {
    const data = await this.fetch(`v6/deployments?projectId=${projectId}&limit=${limit}`);
    return data.deployments || [];
  }

  async deleteDeployment(uid: string): Promise<void> {
    await this.fetch(`v13/deployments/${uid}`, {
      method: 'DELETE',
    });
  }
}
