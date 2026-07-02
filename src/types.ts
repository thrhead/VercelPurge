export interface VercelProject {
  id: string;
  name: string;
}

export interface VercelDeployment {
  uid: string;
  name: string;
  url: string;
  created: number;
  state: 'BUILDING' | 'ERROR' | 'INITIALIZING' | 'QUEUED' | 'READY' | 'CANCELED';
  creator?: {
    username: string;
  };
}
