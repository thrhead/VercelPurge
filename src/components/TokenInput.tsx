import React, { useState } from 'react';
import { KeyRound, ArrowRight } from 'lucide-react';

interface Props {
  onTokenSubmit: (token: string) => void;
}

export function TokenInput({ onTokenSubmit }: Props) {
  const [token, setToken] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (token.trim()) {
      onTokenSubmit(token.trim());
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
      <h2 className="text-xl font-display font-semibold text-gray-900 mb-2 flex items-center gap-2">
        <KeyRound className="w-5 h-5 text-indigo-500" />
        Vercel API Token
      </h2>
      <p className="text-sm text-gray-500 mb-6">
        Lütfen Vercel hesap ayarlarınızdan oluşturduğunuz Personal Access Token'ı girin. 
        Bu token sadece tarayıcınızda tutulur ve güvenle Vercel API'sine iletilir.
      </p>
      
      <form onSubmit={handleSubmit} className="flex gap-3">
        <input
          type="password"
          value={token}
          onChange={(e) => setToken(e.target.value)}
          placeholder="Token (ör. px1yZ...)"
          className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all"
        />
        <button
          type="submit"
          disabled={!token.trim()}
          className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors"
        >
          Devam Et
          <ArrowRight className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
