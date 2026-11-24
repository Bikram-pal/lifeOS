import { Groq } from 'groq-sdk';
import { DocumentChunk } from '../models/DocumentChunk.js';
import { Document } from '../models/Document.js';
import { Task } from '../models/Task.js';
import { Project } from '../models/Project.js';
import { Goal } from '../models/Goal.js';

export class AIService {
  static getGroqClient() {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey || apiKey.trim() === '' || apiKey === 'your_groq_api_key_here') {
      return null;
    }
    return new Groq({ apiKey });
  }

  /**
   * Retrieve relevant document chunks for RAG grounding
   */
  static async retrieveRelevantChunks(userId, query, documentId = null, limit = 5) {
    const filter = { user: userId };
    if (documentId) {
      filter.document = documentId;
    }

    // Extract keywords (filter out short words)
    const keywords = query
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter((w) => w.length > 3)
      .slice(0, 6);

    let chunks = [];

    // Attempt text search or regex matching
    if (keywords.length > 0) {
      const regexPattern = keywords.join('|');
      chunks = await DocumentChunk.find({
        ...filter,
        content: { $regex: regexPattern, $options: 'i' },
      })
        .populate('document', 'title originalFilename')
        .limit(limit)
        .lean();
    }

    // Fallback: If no keyword matches, fetch recent chunks from target document
    if (chunks.length === 0 && documentId) {
      chunks = await DocumentChunk.find(filter)
        .populate('document', 'title originalFilename')
        .limit(limit)
        .lean();
    }

    return chunks;
  }

  /**
   * Run chat with Groq and grounded RAG context
   */
  static async chat({ userId, conversationHistory, prompt, documentId = null }) {
    const groq = this.getGroqClient();
    const model = process.env.GROQ_MODEL || 'llama-3.3-70b-versatile';

    // Parallel fetch: RAG context chunks + User Workspace State (Projects, Tasks, Deadlines, Goals)
    const [chunks, activeProjects, pendingTasks, activeGoals] = await Promise.all([
      this.retrieveRelevantChunks(userId, prompt, documentId, 4),
      Project.find({ user: userId }).lean(),
      Task.find({ user: userId, status: { $ne: 'COMPLETED' } })
        .populate('project', 'title')
        .sort({ dueDate: 1 })
        .limit(10)
        .lean(),
      Goal.find({ user: userId }).lean(),
    ]);

    const sources = chunks.map((c) => ({
      documentId: c.document?._id,
      title: c.document?.title || 'Document',
      chunkIndex: c.chunkIndex,
      excerpt: c.content.slice(0, 200) + '...',
    }));

    // Format workspace context for intelligent reasoning
    const todayStr = new Intl.DateTimeFormat('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(new Date());

    let workspaceText = `CURRENT DATE: ${todayStr}\n\nUSER WORKSPACE & PROJECT DEADLINES:\n`;

    if (activeProjects.length > 0) {
      workspaceText += 'Active Projects:\n' + activeProjects.map((p) => {
        const milestones = p.milestones?.length
          ? ' | Milestones: ' + p.milestones.map((m) => `"${m.title}" (Due: ${m.dueDate ? new Date(m.dueDate).toLocaleDateString() : 'None'}, Done: ${m.completed})`).join('; ')
          : '';
        return `• Project: "${p.title}" (Status: ${p.status})${milestones}`;
      }).join('\n') + '\n\n';
    } else {
      workspaceText += 'Active Projects: None registered in database yet.\n\n';
    }

    if (pendingTasks.length > 0) {
      workspaceText += 'Pending Tasks & Upcoming Deadlines:\n' + pendingTasks.map((t) => {
        const due = t.dueDate ? new Date(t.dueDate).toLocaleDateString() : 'No deadline set';
        return `• Task: "${t.title}" | Priority: ${t.priority} | Due Date: ${due} | Project: ${t.project?.title || 'Unassigned'}`;
      }).join('\n') + '\n\n';
    } else {
      workspaceText += 'Pending Tasks: No pending tasks registered in database yet.\n\n';
    }

    if (activeGoals.length > 0) {
      workspaceText += 'Strategic Goals:\n' + activeGoals.map((g) => {
        const deadline = g.deadline ? new Date(g.deadline).toLocaleDateString() : 'No deadline';
        return `• Goal: "${g.title}" | Target: ${g.currentValue}/${g.targetValue} ${g.unit} | Status: ${g.status} | Deadline: ${deadline}`;
      }).join('\n') + '\n\n';
    }

    // If Groq API Key is not provided, return helpful grounded fallback
    if (!groq) {
      let responseContent = `**Groq API Key Not Configured**\n\nTo enable ultra-fast inference with \`${model}\`, add your free API key to \`server/.env\`:\n\`\`\`env\nGROQ_API_KEY=gsk_...\n\`\`\`\n\n`;

      if (chunks.length > 0) {
        responseContent += `### Grounded Document Insights (Extracted from your Vault):\n`;
        chunks.forEach((c, idx) => {
          responseContent += `**[Source ${idx + 1}: ${c.document?.title || 'Document'}]**\n> "${c.content.slice(0, 240)}..."\n\n`;
        });
      } else {
        responseContent += `*Tip: Upload documents in the Knowledge Vault to test grounded question answering.*`;
      }

      return {
        content: responseContent,
        sources,
        model: 'offline-preview',
      };
    }

    // Build context prompt
    let contextText = '';
    if (chunks.length > 0) {
      contextText = chunks
        .map(
          (c, idx) =>
            `[Source ${idx + 1} - ${c.document?.title}]:\n${c.content}\n`
        )
        .join('\n---\n');
    }

    const systemPrompt = `You are LifeOS Intelligence, an elite personal AI operating system.
Your mission is to provide concise, accurate, actionable answers.
You have direct, real-time access to the user's LifeOS workspace data below, including their Projects, Milestones, Tasks, Deadlines, Goals, and Knowledge Vault documents.
When the user asks about their projects, upcoming deadlines, or pending tasks, ALWAYS check and directly answer using this workspace context.
Ground your response heavily on the provided document context where relevant, citing sources clearly (e.g. [Source 1]).

${workspaceText}

DOCUMENT CONTEXT:
${contextText || 'No specific document context found.'}`;

    const messages = [
      { role: 'system', content: systemPrompt },
      ...conversationHistory.slice(-8).map((m) => ({
        role: m.role,
        content: m.content,
      })),
      { role: 'user', content: prompt },
    ];

    try {
      const completion = await groq.chat.completions.create({
        model,
        messages,
        temperature: 0.3,
        max_tokens: 1024,
      });

      const responseContent = completion.choices[0]?.message?.content || 'No response generated.';

      return {
        content: responseContent,
        sources,
        model,
      };
    } catch (err) {
      console.error('[Groq API Error]', err);
      return {
        content: `Error connecting to Groq AI: ${err.message}. Please verify your GROQ_API_KEY in server/.env.`,
        sources,
        model,
      };
    }
  }

  /**
   * Context-to-Action Engine: Extract structured tasks from text/document
   */
  static async extractTasksFromContext({ userId, text, documentId = null }) {
    const groq = this.getGroqClient();

    let contextSource = text || '';
    if (!contextSource && documentId) {
      const chunks = await DocumentChunk.find({ document: documentId, user: userId })
        .limit(6)
        .lean();
      contextSource = chunks.map((c) => c.content).join('\n\n');
    }

    if (!contextSource.trim()) {
      return [];
    }

    // If Groq is available, ask for JSON structured tasks
    if (groq) {
      try {
        const completion = await groq.chat.completions.create({
          model: process.env.GROQ_MODEL || 'llama-3.3-70b-versatile',
          messages: [
            {
              role: 'system',
              content: `You are the LifeOS Context-to-Action Engine.
Extract 2 to 5 actionable tasks from the user's document/notes.
Respond ONLY with a valid JSON array of objects with the following schema:
[
  {
    "title": "Clear imperative task title (max 80 chars)",
    "description": "Short description of why and what to do",
    "priority": "LOW" | "MEDIUM" | "HIGH" | "URGENT",
    "aiReason": "One sentence explaining why this task was synthesized"
  }
]`,
            },
            {
              role: 'user',
              content: contextSource.slice(0, 4000),
            },
          ],
          response_format: { type: 'json_object' },
          temperature: 0.2,
        });

        const raw = completion.choices[0]?.message?.content || '{}';
        const parsed = JSON.parse(raw);
        const tasks = Array.isArray(parsed) ? parsed : parsed.tasks || [];
        return tasks;
      } catch (err) {
        console.warn('[Task Extraction with Groq failed, using fallback]', err.message);
      }
    }

    // Heuristic Fallback Extractor
    const sentences = contextSource
      .split(/(?<=[.?!])\s+|\n+/)
      .map((s) => s.trim())
      .filter((s) => s.length > 15 && s.length < 150);

    const actionKeywords = ['implement', 'build', 'review', 'create', 'setup', 'prepare', 'test', 'design', 'update', 'verify'];
    const candidates = sentences.filter((s) =>
      actionKeywords.some((kw) => s.toLowerCase().includes(kw))
    );

    const selectedSentences = candidates.length > 0 ? candidates.slice(0, 4) : sentences.slice(0, 3);

    return selectedSentences.map((s, idx) => ({
      title: s.length > 60 ? `${s.slice(0, 57)}...` : s,
      description: `Synthesized from knowledge context: "${s}"`,
      priority: idx === 0 ? 'HIGH' : 'MEDIUM',
      aiReason: 'Automatically derived from relevant notes and documentation.',
    }));
  }
}
