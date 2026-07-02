import React from 'react';
import { VercelProject } from '../types';
import { FolderGit2 } from 'lucide-react';

interface Props {
  projects: VercelProject[];
  selectedProjectId: string | null;
  onSelect: (projectId: string) => void;
}

export function ProjectSelector({ projects, selectedProjectId, onSelect }: Props) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
      <h2 className="text-xl font-display font-semibold text-gray-900 mb-2 flex items-center gap-2">
        <FolderGit2 className="w-5 h-5 text-indigo-500" />
        Proje Seçimi
      </h2>
      <p className="text-sm text-gray-500 mb-6">
        Deployment'larını yönetmek istediğiniz projeyi seçin.
      </p>
      
      <select
        value={selectedProjectId || ''}
        onChange={(e) => onSelect(e.target.value)}
        className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none bg-white transition-all cursor-pointer"
      >
        <option value="" disabled>Bir proje seçin...</option>
        {projects.map((project) => (
          <option key={project.id} value={project.id}>
            {project.name}
          </option>
        ))}
      </select>
    </div>
  );
}
