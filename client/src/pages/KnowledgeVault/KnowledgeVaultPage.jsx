import React from 'react';
import { Card, CardHeader, CardTitle } from '../../components/common/Card';
import { FolderGit2, Upload, Plus } from 'lucide-react';
import { Button } from '../../components/common/Button';

export const KnowledgeVaultPage = () => {
  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Knowledge Vault</h2>
          <p className="text-sm text-slate-400 mt-1">
            Store, chunk, and index your documents, notes, and research.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="secondary" size="sm" leftIcon={<Upload className="w-4 h-4" />}>
            Upload Document
          </Button>
          <Button variant="primary" size="sm" leftIcon={<Plus className="w-4 h-4" />}>
            New Note
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <FolderGit2 className="w-4 h-4 text-primary-400" />
            <CardTitle>Vault Ingestion & Notes</CardTitle>
          </div>
        </CardHeader>
        <p className="text-xs text-slate-400">
          Knowledge Vault module will connect file uploads, PDF chunking, notes, and full-text search.
        </p>
      </Card>
    </div>
  );
};
