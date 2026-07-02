import React, { useState, useEffect } from 'react';
import { TokenInput } from './components/TokenInput';
import { ProjectSelector } from './components/ProjectSelector';
import { DeploymentList } from './components/DeploymentList';
import { VercelAPI } from './api';
import { VercelProject, VercelDeployment } from './types';
import { LayoutDashboard, AlertCircle, LogOut } from 'lucide-react';

export default function App() {
  const [token, setToken] = useState<string>('');
  const [projects, setProjects] = useState<VercelProject[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [deployments, setDeployments] = useState<VercelDeployment[]>([]);
  
  const [isLoadingProjects, setIsLoadingProjects] = useState(false);
  const [isLoadingDeployments, setIsLoadingDeployments] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Restore token from local storage if available
  useEffect(() => {
    const saved = localStorage.getItem('vercel_token');
    if (saved) {
      setToken(saved);
    }
  }, []);

  useEffect(() => {
    if (token) {
      loadProjects(token);
    }
  }, [token]);

  useEffect(() => {
    if (token && selectedProjectId) {
      loadDeployments(token, selectedProjectId);
    }
  }, [selectedProjectId]);

  const loadProjects = async (authToken: string) => {
    setIsLoadingProjects(true);
    setError(null);
    try {
      const api = new VercelAPI(authToken);
      const data = await api.getProjects();
      setProjects(data);
    } catch (err: any) {
      setError(err.message || 'Projeler yüklenirken hata oluştu.');
      if (err.message?.includes('401') || err.message?.includes('Unauthorized')) {
        handleLogout();
      }
    } finally {
      setIsLoadingProjects(false);
    }
  };

  const loadDeployments = async (authToken: string, projectId: string) => {
    setIsLoadingDeployments(true);
    setError(null);
    try {
      const api = new VercelAPI(authToken);
      const data = await api.getDeployments(projectId, 100);
      setDeployments(data);
    } catch (err: any) {
      setError(err.message || 'Deploymentlar yüklenirken hata oluştu.');
    } finally {
      setIsLoadingDeployments(false);
    }
  };

  const handleTokenSubmit = (newToken: string) => {
    setToken(newToken);
    localStorage.setItem('vercel_token', newToken);
  };

  const handleLogout = () => {
    setToken('');
    setProjects([]);
    setDeployments([]);
    setSelectedProjectId(null);
    localStorage.removeItem('vercel_token');
  };

  const handleDeleteDeployments = async (uids: string[]) => {
    if (!token) return;
    
    setIsDeleting(true);
    setError(null);
    
    const api = new VercelAPI(token);
    let successCount = 0;
    
    try {
      // Delete deployments sequentially to avoid rate limits
      for (const uid of uids) {
        await api.deleteDeployment(uid);
        successCount++;
        // Update UI progressively
        setDeployments(prev => prev.filter(d => d.uid !== uid));
      }
      
      alert(`${successCount} adet deployment başarıyla silindi.`);
    } catch (err: any) {
      setError(`Silme işlemi sırasında hata oluştu: ${err.message}. ${successCount} adet başarıyla silindi.`);
    } finally {
      setIsDeleting(false);
      // Reload deployments to get the latest state
      if (selectedProjectId) {
        loadDeployments(token, selectedProjectId);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans selection:bg-indigo-100 selection:text-indigo-900">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white">
              <LayoutDashboard className="w-5 h-5" />
            </div>
            <h1 className="text-lg font-display font-bold text-gray-900 tracking-tight">Vercel Bulk Deleter</h1>
          </div>
          
          {token && (
            <button 
              onClick={handleLogout}
              className="text-sm font-medium text-gray-500 hover:text-gray-900 flex items-center gap-1.5 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Çıkış Yap
            </button>
          )}
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8 space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-start gap-3">
            <AlertCircle className="w-5 h-5 mt-0.5 shrink-0" />
            <div className="text-sm">{error}</div>
          </div>
        )}

        {!token ? (
          <div className="max-w-xl mx-auto mt-12">
            <TokenInput onTokenSubmit={handleTokenSubmit} />
          </div>
        ) : (
          <div className="space-y-6">
            <div className="max-w-xl">
              {isLoadingProjects ? (
                <div className="bg-white rounded-xl border border-gray-200 p-6 flex justify-center items-center h-[120px]">
                  <span className="w-6 h-6 border-2 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></span>
                </div>
              ) : (
                <ProjectSelector 
                  projects={projects} 
                  selectedProjectId={selectedProjectId} 
                  onSelect={setSelectedProjectId} 
                />
              )}
            </div>

            {selectedProjectId && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                {isLoadingDeployments ? (
                  <div className="bg-white rounded-xl border border-gray-200 p-12 flex flex-col justify-center items-center text-gray-500 gap-4">
                    <span className="w-8 h-8 border-2 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></span>
                    <p className="text-sm">Deployment'lar yükleniyor...</p>
                  </div>
                ) : (
                  <DeploymentList 
                    deployments={deployments} 
                    onDeleteSelected={handleDeleteDeployments}
                    isDeleting={isDeleting}
                  />
                )}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
