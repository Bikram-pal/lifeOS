import React, { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
  BotMessageSquare,
  Sparkles,
  Send,
  Plus,
  Trash2,
  FileText,
  CheckCircle2,
  Clock,
  ArrowRight,
  Layers,
  ChevronDown,
  ChevronUp,
  Cpu,
  MessageSquare,
  Wand2,
} from 'lucide-react';
import { toast } from 'sonner';
import { aiService } from '../../services/ai.service';
import { vaultService } from '../../services/vault.service';
import { Card, CardHeader, CardTitle } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Badge } from '../../components/common/Badge';
import { Skeleton } from '../../components/common/Skeleton';
import { formatDate } from '../../utils/dateUtils';

const QUICK_PROMPTS = [
  'Summarize the core concepts in my uploaded documents.',
  'What are the key technical risks and trade-offs?',
  'Extract top priorities and actionable milestones.',
];

const MarkdownRenderer = ({ content }) => {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        table: ({ node, ...props }) => (
          <div className="overflow-x-auto my-3 border border-[#233054] rounded-lg">
            <table className="min-w-full text-xs divide-y divide-[#233054]" {...props} />
          </div>
        ),
        thead: ({ node, ...props }) => (
          <thead className="bg-[#111726] text-slate-200 uppercase tracking-wider text-[10px]" {...props} />
        ),
        tbody: ({ node, ...props }) => (
          <tbody className="divide-y divide-[#1F2B4D] bg-[#161F36]/80" {...props} />
        ),
        tr: ({ node, ...props }) => (
          <tr className="hover:bg-[#1E294B]/50 transition-colors" {...props} />
        ),
        th: ({ node, ...props }) => (
          <th className="px-3 py-2 text-left font-semibold text-slate-300 border-r border-[#233054] last:border-r-0 whitespace-nowrap" {...props} />
        ),
        td: ({ node, ...props }) => (
          <td className="px-3 py-2 text-slate-300 border-r border-[#233054] last:border-r-0 whitespace-nowrap" {...props} />
        ),
        h1: ({ node, ...props }) => <h1 className="text-base font-bold text-slate-100 mt-3 mb-1" {...props} />,
        h2: ({ node, ...props }) => <h2 className="text-sm font-bold text-slate-100 mt-2.5 mb-1" {...props} />,
        h3: ({ node, ...props }) => <h3 className="text-xs font-bold text-slate-200 mt-2 mb-0.5" {...props} />,
        p: ({ node, ...props }) => <p className="mb-2 last:mb-0 leading-relaxed text-xs" {...props} />,
        ul: ({ node, ...props }) => <ul className="list-disc pl-4 space-y-1 my-2 text-slate-300" {...props} />,
        ol: ({ node, ...props }) => <ol className="list-decimal pl-4 space-y-1 my-2 text-slate-300" {...props} />,
        li: ({ node, ...props }) => <li className="text-xs leading-relaxed" {...props} />,
        blockquote: ({ node, ...props }) => (
          <blockquote className="border-l-2 border-violet-500 pl-3 my-2 text-slate-300 italic bg-violet-950/20 py-1 rounded-r text-xs" {...props} />
        ),
        code: ({ node, inline, className, children, ...props }) =>
          inline ? (
            <code className="bg-[#111726] text-violet-300 px-1.5 py-0.5 rounded text-[11px] font-mono border border-[#233054]" {...props}>
              {children}
            </code>
          ) : (
            <pre className="bg-[#111726] border border-[#233054] rounded-lg p-3 overflow-x-auto my-2 text-[11px] font-mono text-slate-200 leading-normal">
              <code {...props}>{children}</code>
            </pre>
          ),
      }}
    >
      {content}
    </ReactMarkdown>
  );
};

export const AIWorkspacePage = () => {
  const queryClient = useQueryClient();
  const messagesEndRef = useRef(null);

  const [activeMode, setActiveMode] = useState('chat'); // 'chat' | 'extractor'
  const [selectedConversationId, setSelectedConversationId] = useState(null);
  const [selectedDocId, setSelectedDocId] = useState('');
  const [inputPrompt, setInputPrompt] = useState('');

  // Context-to-Action state
  const [extractText, setExtractText] = useState('');
  const [extractDocId, setExtractDocId] = useState('');
  const [extractedTasks, setExtractedTasks] = useState([]);
  const [approvedTasks, setApprovedTasks] = useState(new Set());

  // Queries
  const { data: convsData, isLoading: isConvsLoading } = useQuery({
    queryKey: ['ai-conversations'],
    queryFn: aiService.getConversations,
  });

  const { data: docsData } = useQuery({
    queryKey: ['vault-documents'],
    queryFn: () => vaultService.getDocuments(),
  });

  const conversations = convsData?.data || [];
  const documents = docsData?.data || [];

  // Fetch messages for active conversation
  const { data: msgData, isLoading: isMsgsLoading } = useQuery({
    queryKey: ['ai-messages', selectedConversationId],
    queryFn: () => aiService.getConversationMessages(selectedConversationId),
    enabled: !!selectedConversationId,
  });

  const messages = msgData?.data?.messages || [];

  // Auto-select latest conversation on load if none selected
  useEffect(() => {
    if (!selectedConversationId && conversations.length > 0) {
      setSelectedConversationId(conversations[0]._id);
    }
  }, [conversations, selectedConversationId]);

  // Scroll to bottom on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isMsgsLoading]);

  // Chat Mutation
  const chatMutation = useMutation({
    mutationFn: (payload) => aiService.chat(payload),
    onSuccess: (res) => {
      setInputPrompt('');
      if (!selectedConversationId && res.data?.conversationId) {
        setSelectedConversationId(res.data.conversationId);
      }
      queryClient.invalidateQueries({ queryKey: ['ai-conversations'] });
      queryClient.invalidateQueries({ queryKey: ['ai-messages', selectedConversationId || res.data?.conversationId] });
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'AI request failed');
    },
  });

  // New conversation mutation
  const newConvMutation = useMutation({
    mutationFn: (data) => aiService.createConversation(data),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['ai-conversations'] });
      setSelectedConversationId(res.data._id);
    },
  });

  // Delete conversation mutation
  const deleteConvMutation = useMutation({
    mutationFn: (id) => aiService.deleteConversation(id),
    onSuccess: (_, deletedId) => {
      queryClient.invalidateQueries({ queryKey: ['ai-conversations'] });
      if (selectedConversationId === deletedId) {
        setSelectedConversationId(null);
      }
      toast.success('Session removed');
    },
  });

  // Extract Tasks Mutation
  const extractMutation = useMutation({
    mutationFn: (data) => aiService.extractTasks(data),
    onSuccess: (res) => {
      setExtractedTasks(res.data || []);
      toast.success(`Synthesized ${res.data?.length || 0} actionable tasks!`);
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Task extraction failed');
    },
  });

  // Approve Task Mutation
  const approveMutation = useMutation({
    mutationFn: (task) => aiService.approveTask(task),
    onSuccess: (_, task) => {
      setApprovedTasks((prev) => new Set([...prev, task.title]));
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-summary'] });
      toast.success('Task approved and added to your Actionable Tasks!');
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to approve task');
    },
  });

  const handleSendMessage = (e) => {
    e?.preventDefault();
    if (!inputPrompt.trim() || chatMutation.isPending) return;

    chatMutation.mutate({
      conversationId: selectedConversationId || undefined,
      prompt: inputPrompt.trim(),
      documentId: selectedDocId || undefined,
    });
  };

  const handleStartNewChat = () => {
    newConvMutation.mutate({
      title: 'New Intelligence Session',
      pinnedDocument: selectedDocId || null,
    });
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <BotMessageSquare className="w-6 h-6 text-violet-400" />
            AI Command Center
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Grounded intelligence engine powered by Groq AI and your Knowledge Vault.
          </p>
        </div>

        {/* Mode Switcher */}
        <div className="flex items-center p-1 bg-[#111726] border border-[#233054] rounded-lg self-start sm:self-auto">
          <button
            onClick={() => setActiveMode('chat')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
              activeMode === 'chat'
                ? 'bg-violet-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            Grounded Chat (RAG)
          </button>
          <button
            onClick={() => setActiveMode('extractor')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
              activeMode === 'extractor'
                ? 'bg-violet-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            Context to Action
          </button>
        </div>
      </div>

      {/* Mode 1: Grounded RAG Chat */}
      {activeMode === 'chat' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[720px]">
          {/* Left: Sessions Sidebar */}
          <div className="lg:col-span-4 flex flex-col bg-[#0F162A]/90 border border-[#233054] rounded-2xl p-4 overflow-hidden h-full">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#233054]">
              <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Intelligence Sessions
              </span>
              <Button
                variant="primary"
                size="sm"
                leftIcon={<Plus className="w-3.5 h-3.5" />}
                onClick={handleStartNewChat}
              >
                New Chat
              </Button>
            </div>

            {/* Target Document Selector */}
            <div className="mb-3 space-y-1">
              <label className="block text-[11px] text-slate-400 font-medium">
                Lock Context to Document:
              </label>
              <select
                value={selectedDocId}
                onChange={(e) => setSelectedDocId(e.target.value)}
                className="w-full bg-[#161F36] border border-[#233054] text-slate-200 rounded-lg p-2 text-xs focus:outline-none focus:border-violet-500"
              >
                <option value="">All Vault Documents</option>
                {documents.map((d) => (
                  <option key={d._id} value={d._id}>
                    {d.title} ({d.chunkCount} chunks)
                  </option>
                ))}
              </select>
            </div>

            {/* Conversation List */}
            <div className="space-y-1.5 flex-1 overflow-y-auto pr-1">
              {isConvsLoading ? (
                [1, 2, 3].map((i) => <Skeleton key={i} className="h-14 w-full rounded-xl" />)
              ) : conversations.length === 0 ? (
                <div className="text-center py-8 text-xs text-slate-500">
                  No previous sessions. Start your first chat!
                </div>
              ) : (
                conversations.map((c) => (
                  <div
                    key={c._id}
                    onClick={() => setSelectedConversationId(c._id)}
                    className={`group flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all border ${
                      selectedConversationId === c._id
                        ? 'bg-violet-950/40 border-violet-700/60 text-white'
                        : 'bg-[#161F36]/60 border-transparent text-slate-300 hover:bg-[#1D2847] hover:border-[#233054]'
                    }`}
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-medium truncate">{c.title}</p>
                      <span className="text-[10px] text-slate-500">
                        {formatDate(c.updatedAt)}
                      </span>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteConvMutation.mutate(c._id);
                      }}
                      className="opacity-0 group-hover:opacity-100 p-1 text-slate-500 hover:text-rose-400 transition-opacity"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Right: Messages & Input Canvas */}
          <div className="lg:col-span-8 flex flex-col bg-[#0F162A]/90 border border-[#233054] rounded-2xl overflow-hidden h-full">
            {/* Top Bar */}
            <div className="flex items-center justify-between px-5 py-3 border-b border-[#233054] bg-[#12192E]">
              <div className="flex items-center gap-2">
                <Cpu className="w-4 h-4 text-violet-400" />
                <span className="text-xs font-semibold text-slate-200">
                  Model: <span className="font-mono text-violet-300">openai/gpt-oss-120b</span>
                </span>
              </div>
              <Badge variant="accent">Groq Inference</Badge>
            </div>

            {/* Messages Stream */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-violet-600 to-indigo-500 flex items-center justify-center text-white shadow-glow-accent">
                    <Sparkles className="w-6 h-6" />
                  </div>
                  <h3 className="text-base font-semibold text-slate-100">
                    How can LifeOS Intelligence assist you?
                  </h3>
                  <p className="text-xs text-slate-400 max-w-sm">
                    Ask questions grounded on your uploaded documents, synthesize research, or plan architectures.
                  </p>

                  <div className="grid grid-cols-1 gap-2 w-full max-w-md pt-2">
                    {QUICK_PROMPTS.map((prompt, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          setInputPrompt(prompt);
                        }}
                        className="text-left text-xs p-2.5 rounded-lg bg-[#161F36] hover:bg-[#1E294B] border border-[#233054] text-slate-300 hover:text-white transition-colors"
                      >
                        "{prompt}"
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                messages.map((m) => {
                  const isUser = m.role === 'user';

                  return (
                    <div
                      key={m._id}
                      className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
                    >
                      {!isUser && (
                        <div className="w-8 h-8 rounded-lg bg-violet-900/60 border border-violet-700/60 flex items-center justify-center text-violet-300 shrink-0 mt-0.5">
                          <BotMessageSquare className="w-4 h-4" />
                        </div>
                      )}

                      <div
                        className={`max-w-[85%] rounded-2xl p-4 text-xs leading-relaxed space-y-2 ${
                          isUser
                            ? 'bg-primary-600 text-white rounded-tr-none'
                            : 'bg-[#161F36] border border-[#233054] text-slate-200 rounded-tl-none'
                        }`}
                      >
                        <div className="w-full">
                          <MarkdownRenderer content={m.content} />
                        </div>

                        {/* Grounded Sources */}
                        {m.sources && m.sources.length > 0 && (
                          <div className="pt-2 mt-2 border-t border-[#233054]/80 space-y-1">
                            <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block">
                              Grounded Sources:
                            </span>
                            <div className="flex flex-wrap gap-1.5">
                              {m.sources.map((s, idx) => (
                                <span
                                  key={idx}
                                  className="text-[10px] bg-[#111726] border border-[#233054] text-violet-300 px-2 py-0.5 rounded-md flex items-center gap-1"
                                  title={s.excerpt}
                                >
                                  <FileText className="w-3 h-3 text-violet-400" />
                                  {s.title}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
              {chatMutation.isPending && (
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-lg bg-violet-900/60 border border-violet-700/60 flex items-center justify-center text-violet-300 shrink-0">
                    <BotMessageSquare className="w-4 h-4" />
                  </div>
                  <div className="p-4 rounded-2xl bg-[#161F36] border border-[#233054] text-xs text-slate-400 flex items-center gap-2">
                    <span className="animate-pulse">Synthesizing grounded answer via Groq...</span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Prompt Input Box */}
            <form onSubmit={handleSendMessage} className="p-4 border-t border-[#233054] bg-[#12192E]">
              <div className="relative flex items-center">
                <input
                  type="text"
                  placeholder="Ask LifeOS Intelligence or query your documents..."
                  value={inputPrompt}
                  onChange={(e) => setInputPrompt(e.target.value)}
                  className="w-full bg-[#161F36] border border-[#233054] text-slate-100 rounded-xl px-4 py-3 pr-12 text-xs focus:outline-none focus:border-violet-500 placeholder:text-slate-500"
                />
                <button
                  type="submit"
                  disabled={!inputPrompt.trim() || chatMutation.isPending}
                  className="absolute right-2.5 p-2 rounded-lg bg-violet-600 hover:bg-violet-500 text-white disabled:opacity-40 transition-colors"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Mode 2: Context-to-Action Engine */}
      {activeMode === 'extractor' && (
        <div className="space-y-6">
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-2">
              <Wand2 className="w-5 h-5 text-violet-400" />
              <CardTitle>Context-to-Action Task Extraction</CardTitle>
            </div>
            <p className="text-xs text-slate-400 mb-6 max-w-2xl">
              Select an ingested document from your Knowledge Vault or paste research/notes below.
              The AI engine analyzes the context, finds implied deliverables, and formats them into actionable tasks.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Option A: Select Document */}
              <div className="space-y-2">
                <label className="block text-xs font-medium text-slate-300">
                  Select Target Document from Vault:
                </label>
                <select
                  value={extractDocId}
                  onChange={(e) => setExtractDocId(e.target.value)}
                  className="w-full bg-[#111726] border border-[#233054] text-slate-100 rounded-lg p-2.5 text-xs focus:outline-none focus:border-violet-500"
                >
                  <option value="">-- Choose a Document --</option>
                  {documents.map((d) => (
                    <option key={d._id} value={d._id}>
                      {d.title} ({d.chunkCount} chunks)
                    </option>
                  ))}
                </select>
              </div>

              {/* Option B: Freeform text */}
              <div className="space-y-2">
                <label className="block text-xs font-medium text-slate-300">
                  Or Paste Text / Specs / Notes:
                </label>
                <textarea
                  className="w-full bg-[#111726] border border-[#233054] rounded-lg p-3 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-violet-500 min-h-[90px]"
                  placeholder="Paste meeting transcript, research draft, or project roadmap..."
                  value={extractText}
                  onChange={(e) => setExtractText(e.target.value)}
                />
              </div>
            </div>

            <div className="flex justify-end pt-4 mt-4 border-t border-[#233054]">
              <Button
                variant="accent"
                size="md"
                leftIcon={<Sparkles className="w-4 h-4" />}
                onClick={() =>
                  extractMutation.mutate({
                    documentId: extractDocId || undefined,
                    text: extractText || undefined,
                  })
                }
                isLoading={extractMutation.isPending}
                disabled={!extractDocId && !extractText.trim()}
              >
                Synthesize Actionable Tasks
              </Button>
            </div>
          </Card>

          {/* Extracted Tasks Workbench */}
          {extractedTasks.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-violet-400" />
                Synthesized Action Items ({extractedTasks.length})
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {extractedTasks.map((task, idx) => {
                  const isApproved = approvedTasks.has(task.title);

                  return (
                    <Card
                      key={idx}
                      className={`p-4 border transition-all ${
                        isApproved
                          ? 'border-emerald-700/60 bg-emerald-950/20'
                          : 'border-[#233054] hover:border-violet-700/60'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <h4 className="text-sm font-semibold text-slate-100">{task.title}</h4>
                        <Badge
                          variant={
                            task.priority === 'HIGH' || task.priority === 'URGENT'
                              ? 'warning'
                              : 'primary'
                          }
                        >
                          {task.priority || 'MEDIUM'}
                        </Badge>
                      </div>

                      {task.description && (
                        <p className="text-xs text-slate-400 mb-2">{task.description}</p>
                      )}

                      {task.aiReason && (
                        <p className="text-[11px] text-violet-300 italic mb-4">
                          "{task.aiReason}"
                        </p>
                      )}

                      <div className="flex items-center justify-between pt-3 border-t border-[#233054]">
                        <span className="text-[10px] text-slate-500">
                          {isApproved ? 'Added to Tasks' : 'Ready for approval'}
                        </span>

                        <Button
                          variant={isApproved ? 'secondary' : 'primary'}
                          size="sm"
                          leftIcon={
                            isApproved ? (
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                            ) : (
                              <Plus className="w-3.5 h-3.5" />
                            )
                          }
                          disabled={isApproved || approveMutation.isPending}
                          onClick={() => approveMutation.mutate(task)}
                        >
                          {isApproved ? 'Approved' : 'Approve & Add'}
                        </Button>
                      </div>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
