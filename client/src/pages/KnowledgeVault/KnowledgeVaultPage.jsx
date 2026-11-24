import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  FolderGit2,
  Upload,
  Plus,
  FileText,
  StickyNote,
  Search,
  Trash2,
  Eye,
  FileCode,
  Tag,
  CheckCircle,
  Clock,
  Layers,
  Edit2,
  AlertTriangle,
} from 'lucide-react';
import { toast } from 'sonner';
import { vaultService } from '../../services/vault.service';
import { Card, CardHeader, CardTitle } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { EmptyState } from '../../components/common/EmptyState';
import { Skeleton } from '../../components/common/Skeleton';
import { formatDate } from '../../utils/dateUtils';
import { formatBytes } from '../../utils/formatters';

export const KnowledgeVaultPage = () => {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('documents'); // 'documents' | 'notes'
  const [search, setSearch] = useState('');

  // Modals state
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadTitle, setUploadTitle] = useState('');

  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  const [editingNote, setEditingNote] = useState(null);
  const [noteForm, setNoteForm] = useState({
    title: '',
    content: '',
    tags: '',
  });

  const [previewDoc, setPreviewDoc] = useState(null);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);

  // Queries
  const { data: docsData, isLoading: isDocsLoading } = useQuery({
    queryKey: ['vault-documents', { search }],
    queryFn: () => vaultService.getDocuments({ search: search || undefined }),
  });

  const { data: notesData, isLoading: isNotesLoading } = useQuery({
    queryKey: ['vault-notes', { search }],
    queryFn: () => vaultService.getNotes({ search: search || undefined }),
  });

  const documents = docsData?.data || [];
  const notes = notesData?.data || [];

  // Mutations
  const uploadMutation = useMutation({
    mutationFn: (formData) => vaultService.uploadDocument(formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vault-documents'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-summary'] });
      toast.success('Document uploaded and chunked into Knowledge Vault');
      setIsUploadModalOpen(false);
      setUploadFile(null);
      setUploadTitle('');
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Document upload failed');
    },
  });

  const deleteDocMutation = useMutation({
    mutationFn: (id) => vaultService.deleteDocument(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vault-documents'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-summary'] });
      toast.success('Document removed from vault');
    },
    onError: () => toast.error('Failed to delete document'),
  });

  const saveNoteMutation = useMutation({
    mutationFn: (payload) => {
      if (editingNote) {
        return vaultService.updateNote(editingNote._id, payload);
      }
      return vaultService.createNote(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vault-notes'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-summary'] });
      toast.success(editingNote ? 'Note updated' : 'Note created');
      setIsNoteModalOpen(false);
      setEditingNote(null);
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to save note');
    },
  });

  const deleteNoteMutation = useMutation({
    mutationFn: (id) => vaultService.deleteNote(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vault-notes'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-summary'] });
      toast.success('Note removed');
    },
    onError: () => toast.error('Failed to delete note'),
  });

  const handleUploadSubmit = (e) => {
    e.preventDefault();
    if (!uploadFile) {
      toast.error('Please select a file to upload');
      return;
    }
    const formData = new FormData();
    formData.append('file', uploadFile);
    if (uploadTitle.trim()) {
      formData.append('title', uploadTitle.trim());
    }
    uploadMutation.mutate(formData);
  };

  const handleOpenNoteModal = (note = null) => {
    if (note) {
      setEditingNote(note);
      setNoteForm({
        title: note.title,
        content: note.content || '',
        tags: (note.tags || []).join(', '),
      });
    } else {
      setEditingNote(null);
      setNoteForm({ title: '', content: '', tags: '' });
    }
    setIsNoteModalOpen(true);
  };

  const handleNoteSubmit = (e) => {
    e.preventDefault();
    if (!noteForm.title.trim()) {
      toast.error('Note title is required');
      return;
    }
    const tagsArray = noteForm.tags
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    saveNoteMutation.mutate({
      title: noteForm.title.trim(),
      content: noteForm.content,
      tags: tagsArray,
    });
  };

  const handlePreviewDoc = async (doc) => {
    try {
      const res = await vaultService.getDocumentById(doc._id);
      setPreviewDoc(res.data);
      setIsPreviewModalOpen(true);
    } catch {
      toast.error('Failed to load document details');
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <FolderGit2 className="w-6 h-6 text-primary-400" />
            Knowledge Vault
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Store, chunk, and index your documents, notes, and research for instant retrieval.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="secondary"
            size="md"
            leftIcon={<Upload className="w-4 h-4" />}
            onClick={() => setIsUploadModalOpen(true)}
          >
            Upload Document
          </Button>
          <Button
            variant="primary"
            size="md"
            leftIcon={<Plus className="w-4 h-4" />}
            onClick={() => handleOpenNoteModal()}
          >
            New Note
          </Button>
        </div>
      </div>

      {/* Tabs and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#233054] pb-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('documents')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'documents'
                ? 'bg-primary-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-[#161F36]'
            }`}
          >
            <FileText className="w-4 h-4" />
            Documents
            <span className="text-xs px-2 py-0.5 rounded-full bg-[#111726] border border-[#233054]">
              {documents.length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('notes')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'notes'
                ? 'bg-primary-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-[#161F36]'
            }`}
          >
            <StickyNote className="w-4 h-4" />
            Notes & Thoughts
            <span className="text-xs px-2 py-0.5 rounded-full bg-[#111726] border border-[#233054]">
              {notes.length}
            </span>
          </button>
        </div>

        <div className="w-full sm:w-72">
          <Input
            placeholder={activeTab === 'documents' ? 'Search documents...' : 'Search notes...'}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            leftIcon={<Search className="w-4 h-4 text-slate-400" />}
          />
        </div>
      </div>

      {/* Documents Tab */}
      {activeTab === 'documents' && (
        <div>
          {isDocsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-44 w-full rounded-xl" />
              ))}
            </div>
          ) : documents.length === 0 ? (
            <EmptyState
              icon={<Upload className="w-6 h-6 text-primary-400" />}
              title="No documents uploaded yet"
              description="Upload PDF, TXT, or Markdown documents to chunk and index them for grounded AI question answering."
              actionLabel="Upload First Document"
              onAction={() => setIsUploadModalOpen(true)}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {documents.map((doc) => (
                <Card key={doc._id} className="relative group hover:border-slate-500 transition-all">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="w-10 h-10 rounded-xl bg-primary-950/60 border border-primary-800/50 flex items-center justify-center text-primary-400 shrink-0">
                      {doc.mimeType?.includes('pdf') ? (
                        <FileText className="w-5 h-5 text-rose-400" />
                      ) : (
                        <FileCode className="w-5 h-5 text-indigo-400" />
                      )}
                    </div>

                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => handlePreviewDoc(doc)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#233054]"
                        title="View extracted chunks"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => deleteDocMutation.mutate(doc._id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-950/30"
                        title="Delete document"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <h3 className="text-sm font-semibold text-slate-100 truncate mb-1" title={doc.title}>
                    {doc.title}
                  </h3>
                  <p className="text-xs text-slate-400 truncate mb-3" title={doc.originalFilename}>
                    {doc.originalFilename}
                  </p>

                  <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-[#233054] text-[11px] text-slate-400">
                    <Badge
                      variant={
                        doc.status === 'READY'
                          ? 'success'
                          : doc.status === 'FAILED'
                          ? 'danger'
                          : 'primary'
                      }
                    >
                      {doc.status}
                    </Badge>
                    <span className="flex items-center gap-1">
                      <Layers className="w-3.5 h-3.5 text-slate-500" />
                      {doc.chunkCount || 0} chunks
                    </span>
                    <span>•</span>
                    <span>{formatBytes(doc.fileSize)}</span>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Notes Tab */}
      {activeTab === 'notes' && (
        <div>
          {isNotesLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-44 w-full rounded-xl" />
              ))}
            </div>
          ) : notes.length === 0 ? (
            <EmptyState
              icon={<StickyNote className="w-6 h-6 text-violet-400" />}
              title="No notes recorded yet"
              description="Capture key insights, thoughts, and research findings."
              actionLabel="Create First Note"
              onAction={() => handleOpenNoteModal()}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {notes.map((note) => (
                <Card key={note._id} className="relative group hover:border-slate-500 transition-all flex flex-col justify-between">
                  <div>
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <h3 className="text-sm font-semibold text-slate-100 line-clamp-1">
                        {note.title}
                      </h3>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                        <button
                          onClick={() => handleOpenNoteModal(note)}
                          className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-[#233054]"
                          title="Edit note"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => deleteNoteMutation.mutate(note._id)}
                          className="p-1 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-950/30"
                          title="Delete note"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {note.content && (
                      <p className="text-xs text-slate-400 line-clamp-3 mb-3 whitespace-pre-wrap">
                        {note.content}
                      </p>
                    )}
                  </div>

                  <div className="pt-3 border-t border-[#233054] space-y-2">
                    {note.tags && note.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {note.tags.map((t, idx) => (
                          <span
                            key={idx}
                            className="text-[10px] bg-[#111726] border border-[#233054] text-slate-400 px-2 py-0.5 rounded-md"
                          >
                            #{t}
                          </span>
                        ))}
                      </div>
                    )}
                    <span className="text-[10px] text-slate-500 block">
                      Updated {formatDate(note.updatedAt)}
                    </span>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Upload Document Modal */}
      <Modal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        title="Upload Document to Vault"
      >
        <form onSubmit={handleUploadSubmit} className="space-y-4">
          <Input
            label="Document Title (Optional)"
            placeholder="Defaults to filename"
            value={uploadTitle}
            onChange={(e) => setUploadTitle(e.target.value)}
          />

          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-slate-300">File (PDF, TXT, MD) *</label>
            <div className="border-2 border-dashed border-[#233054] hover:border-primary-500/50 rounded-xl p-6 text-center bg-[#111726]/40 transition-colors">
              <input
                type="file"
                accept=".pdf,.txt,.md"
                id="doc-upload-input"
                className="hidden"
                onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
              />
              <label htmlFor="doc-upload-input" className="cursor-pointer block space-y-2">
                <Upload className="w-8 h-8 text-primary-400 mx-auto" />
                <p className="text-sm font-medium text-slate-200">
                  {uploadFile ? uploadFile.name : 'Click to select or drag and drop file'}
                </p>
                <p className="text-xs text-slate-500">
                  {uploadFile ? formatBytes(uploadFile.size) : 'Supports PDF, TXT, Markdown up to 10MB'}
                </p>
              </label>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#233054]">
            <Button
              variant="secondary"
              size="md"
              type="button"
              onClick={() => setIsUploadModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="md"
              type="submit"
              disabled={!uploadFile}
              isLoading={uploadMutation.isPending}
            >
              Upload & Extract Chunks
            </Button>
          </div>
        </form>
      </Modal>

      {/* Note Modal */}
      <Modal
        isOpen={isNoteModalOpen}
        onClose={() => setIsNoteModalOpen(false)}
        title={editingNote ? 'Edit Note' : 'Create New Note'}
      >
        <form onSubmit={handleNoteSubmit} className="space-y-4">
          <Input
            label="Title *"
            placeholder="e.g. Key Takeaways from Research Paper"
            value={noteForm.title}
            onChange={(e) => setNoteForm({ ...noteForm, title: e.target.value })}
            autoFocus
          />

          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-slate-300">Content (Markdown)</label>
            <textarea
              className="w-full bg-[#111726] border border-[#233054] rounded-lg p-3 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-primary-500 min-h-[120px]"
              placeholder="Write your note, synthesis, or thoughts..."
              value={noteForm.content}
              onChange={(e) => setNoteForm({ ...noteForm, content: e.target.value })}
            />
          </div>

          <Input
            label="Tags (Comma separated)"
            placeholder="ai, architecture, thesis"
            value={noteForm.tags}
            onChange={(e) => setNoteForm({ ...noteForm, tags: e.target.value })}
          />

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#233054]">
            <Button
              variant="secondary"
              size="md"
              type="button"
              onClick={() => setIsNoteModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="md"
              type="submit"
              isLoading={saveNoteMutation.isPending}
            >
              {editingNote ? 'Save Changes' : 'Create Note'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Chunks Preview Modal */}
      <Modal
        isOpen={isPreviewModalOpen}
        onClose={() => setIsPreviewModalOpen(false)}
        title={`Extracted Chunks: ${previewDoc?.title || ''}`}
        maxWidth="max-w-2xl"
      >
        <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
          <div className="flex items-center justify-between text-xs text-slate-400 bg-[#111726] p-3 rounded-lg border border-[#233054]">
            <span>Total Chunks: {previewDoc?.chunkCount || 0}</span>
            <span>File size: {formatBytes(previewDoc?.fileSize)}</span>
          </div>

          {previewDoc?.previewChunks && previewDoc.previewChunks.length > 0 ? (
            previewDoc.previewChunks.map((c) => (
              <div
                key={c._id}
                className="p-3.5 bg-[#111726] border border-[#233054] rounded-lg space-y-1.5 text-xs"
              >
                <div className="flex items-center justify-between text-slate-400 font-mono text-[11px]">
                  <span>Chunk #{c.chunkIndex + 1}</span>
                  <span>~{c.metadata?.tokenEstimate || 0} tokens (page {c.metadata?.page || 1})</span>
                </div>
                <p className="text-slate-300 font-sans leading-relaxed whitespace-pre-wrap">
                  {c.content}
                </p>
              </div>
            ))
          ) : (
            <p className="text-xs text-slate-400 text-center py-6">
              No text chunks could be extracted from this document.
            </p>
          )}
        </div>
      </Modal>
    </div>
  );
};
