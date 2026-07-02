import React, { useState } from 'react';
import { VercelDeployment } from '../types';
import { Trash2, AlertCircle, ExternalLink, Filter } from 'lucide-react';

interface Props {
  deployments: VercelDeployment[];
  onDeleteSelected: (uids: string[]) => void;
  isDeleting: boolean;
}

export function DeploymentList({ deployments, onDeleteSelected, isDeleting }: Props) {
  const [selectedUids, setSelectedUids] = useState<Set<string>>(new Set());

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedUids(new Set(deployments.map(d => d.uid)));
    } else {
      setSelectedUids(new Set());
    }
  };

  const handleSelectFailed = () => {
    const failedUids = deployments.filter(d => d.state === 'ERROR' || d.state === 'CANCELED').map(d => d.uid);
    setSelectedUids(new Set([...selectedUids, ...failedUids]));
  };

  const toggleSelect = (uid: string) => {
    const newSet = new Set(selectedUids);
    if (newSet.has(uid)) {
      newSet.delete(uid);
    } else {
      newSet.add(uid);
    }
    setSelectedUids(newSet);
  };

  const handleDelete = () => {
    if (selectedUids.size > 0 && window.confirm(`Seçili ${selectedUids.size} deployment'ı silmek istediğinize emin misiniz?`)) {
      onDeleteSelected(Array.from(selectedUids));
      setSelectedUids(new Set());
    }
  };

  const getStateBadge = (state: string) => {
    switch (state) {
      case 'READY':
        return <span className="px-2 py-1 bg-green-100 text-green-700 rounded-md text-xs font-medium">READY</span>;
      case 'ERROR':
      case 'CANCELED':
        return <span className="px-2 py-1 bg-red-100 text-red-700 rounded-md text-xs font-medium">{state}</span>;
      default:
        return <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-md text-xs font-medium">{state}</span>;
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
      <div className="p-6 border-b border-gray-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-display font-semibold text-gray-900 mb-1 flex items-center gap-2">
            Deployment'lar
            <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-xs">{deployments.length}</span>
          </h2>
          <p className="text-sm text-gray-500">
            Silmek istediğiniz deployment'ları seçin.
          </p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handleSelectFailed}
            className="text-sm px-3 py-1.5 border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-700 font-medium flex items-center gap-1.5 transition-colors"
          >
            <Filter className="w-4 h-4" />
            Hatalıları Seç
          </button>
          
          <button
            onClick={handleDelete}
            disabled={selectedUids.size === 0 || isDeleting}
            className="text-sm px-4 py-1.5 bg-red-600 hover:bg-red-700 disabled:bg-red-300 disabled:cursor-not-allowed text-white rounded-lg font-medium flex items-center gap-2 transition-colors"
          >
            {isDeleting ? (
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
            ) : (
              <Trash2 className="w-4 h-4" />
            )}
            Seçilileri Sil ({selectedUids.size})
          </button>
        </div>
      </div>

      <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
        <table className="w-full text-left text-sm text-gray-600">
          <thead className="bg-gray-50 text-gray-700 sticky top-0 border-b border-gray-200 shadow-sm z-10">
            <tr>
              <th className="px-6 py-3 w-12">
                <input 
                  type="checkbox"
                  className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                  checked={deployments.length > 0 && selectedUids.size === deployments.length}
                  onChange={handleSelectAll}
                />
              </th>
              <th className="px-6 py-3 font-semibold">URL</th>
              <th className="px-6 py-3 font-semibold">Durum</th>
              <th className="px-6 py-3 font-semibold">Oluşturan</th>
              <th className="px-6 py-3 font-semibold">Tarih</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {deployments.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                  <AlertCircle className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p>Bu projede deployment bulunamadı.</p>
                </td>
              </tr>
            ) : (
              deployments.map((dep) => (
                <tr 
                  key={dep.uid} 
                  className={`hover:bg-gray-50 transition-colors ${selectedUids.has(dep.uid) ? 'bg-indigo-50/30' : ''}`}
                >
                  <td className="px-6 py-3">
                    <input 
                      type="checkbox"
                      className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                      checked={selectedUids.has(dep.uid)}
                      onChange={() => toggleSelect(dep.uid)}
                    />
                  </td>
                  <td className="px-6 py-3 font-medium text-gray-900">
                    <div className="flex items-center gap-2">
                      <a href={`https://${dep.url}`} target="_blank" rel="noopener noreferrer" className="hover:text-indigo-600 hover:underline truncate max-w-[250px] inline-block">
                        {dep.url}
                      </a>
                      <a href={`https://${dep.url}`} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-indigo-500">
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </td>
                  <td className="px-6 py-3">
                    {getStateBadge(dep.state)}
                  </td>
                  <td className="px-6 py-3">
                    {dep.creator?.username || '-'}
                  </td>
                  <td className="px-6 py-3 whitespace-nowrap text-gray-500">
                    {new Date(dep.created).toLocaleString('tr-TR')}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
