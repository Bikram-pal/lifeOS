# LifeOS — Database Schema and Relationships

This document outlines the complete database architecture and relationship design for the **LifeOS** platform using MongoDB and Mongoose.

---

## 1. Core Principles

- **Tenant Isolation**: Every private resource collection stores an owner `user` (`ObjectId` referencing `User`), indexed for instant query resolution and complete cross-tenant isolation.
- **Auditing & Timestamps**: All schemas leverage Mongoose `{ timestamps: true }` to maintain `createdAt` and `updatedAt`.
- **Referential Integrity**: Cascading and relationship references connect documents to chunks, projects to tasks and milestones, and graph nodes to edges.
- **Text & Keyword Indexing**: Chunk and document collections maintain compound text indexes for RAG candidate retrieval.

---

## 2. Collection Schemas

### 2.1 User (`users`)
Stores user accounts, credentials, and configuration preferences.
- `_id`: ObjectId
- `name`: String (Required, trimmed, max: 100)
- `email`: String (Required, unique, indexed, lowercase)
- `password`: String (Required, bcrypt hash, `select: false`)
- `avatar`: String (URL)
- `role`: Enum (`'user'`, `'admin'`)
- `preferences`: Object
  - `theme`: Enum (`'dark'`, `'system'`)
  - `aiModel`: String (Default: `'llama-3.3-70b-versatile'`)
  - `autoSuggestActions`: Boolean (Default: `true`)
- `lastLoginAt`: Date
- `createdAt`: Date
- `updatedAt`: Date

### 2.2 Workspace (`workspaces`)
Represents an environment scope for files, projects, and custom AI behavior.
- `_id`: ObjectId
- `name`: String (Required)
- `owner`: ObjectId (Ref: `User`, indexed)
- `isDefault`: Boolean
- `settings`:
  - `defaultAiModel`: String
  - `ragChunkSize`: Number
  - `ragOverlap`: Number
- `createdAt` / `updatedAt`: Date

### 2.3 Document (`documents`)
Stores metadata and extraction status for uploaded files (PDF/TXT).
- `_id`: ObjectId
- `user`: ObjectId (Ref: `User`, indexed)
- `workspace`: ObjectId (Ref: `Workspace`)
- `title`: String (Required)
- `originalFilename`: String
- `filePath`: String (Server storage path)
- `fileSize`: Number (in bytes)
- `mimeType`: String (`application/pdf`, `text/plain`)
- `summary`: String (Generated AI summary)
- `keyTopics`: Array of Strings
- `chunkCount`: Number
- `status`: Enum (`'PENDING'`, `'PROCESSING'`, `'READY'`, `'FAILED'`)
- `createdAt` / `updatedAt`: Date

### 2.4 DocumentChunk (`document_chunks`)
Stores chunked text extracted from documents for RAG keyword & semantic retrieval.
- `_id`: ObjectId
- `user`: ObjectId (Ref: `User`, indexed)
- `document`: ObjectId (Ref: `Document`, indexed)
- `chunkIndex`: Number
- `content`: String (Chunk body)
- `metadata`:
  - `page`: Number
  - `charCount`: Number
  - `tokenEstimate`: Number
- Indexes:
  - `{ content: 'text' }` for MongoDB text search retrieval
  - Compound: `{ user: 1, document: 1 }`

### 2.5 Note (`notes`)
Rich notes captured by the user or synthesized from AI conversations.
- `_id`: ObjectId
- `user`: ObjectId (Ref: `User`, indexed)
- `title`: String
- `content`: String (Markdown supported)
- `tags`: Array of Strings (indexed)
- `sourceDocument`: ObjectId (Ref: `Document`, optional)
- `createdAt` / `updatedAt`: Date

### 2.6 Bookmark (`bookmarks`)
Web and external references saved into the knowledge system.
- `_id`: ObjectId
- `user`: ObjectId (Ref: `User`, indexed)
- `title`: String
- `url`: String
- `description`: String
- `tags`: Array of Strings
- `createdAt` / `updatedAt`: Date

### 2.7 Project (`projects`)
High-level work initiatives organizing tasks, milestones, and goals.
- `_id`: ObjectId
- `user`: ObjectId (Ref: `User`, indexed)
- `title`: String (Required)
- `description`: String
- `status`: Enum (`'PLANNING'`, `'ACTIVE'`, `'PAUSED'`, `'COMPLETED'`)
- `color`: String (Hex code)
- `milestones`: Array of `{ title: String, dueDate: Date, completed: Boolean }`
- `createdAt` / `updatedAt`: Date

### 2.8 Task (`tasks`)
Actionable tasks, either created manually or approved from the **Context-to-Action Engine**.
- `_id`: ObjectId
- `user`: ObjectId (Ref: `User`, indexed)
- `project`: ObjectId (Ref: `Project`, optional, indexed)
- `sourceDocument`: ObjectId (Ref: `Document`, optional)
- `title`: String (Required)
- `description`: String
- `status`: Enum (`'TODO'`, `'IN_PROGRESS'`, `'REVIEW'`, `'COMPLETED'`)
- `priority`: Enum (`'LOW'`, `'MEDIUM'`, `'HIGH'`, `'URGENT'`)
- `dueDate`: Date
- `aiGenerated`: Boolean
- `aiReason`: String (Explanation of why this task was suggested)
- `createdAt` / `updatedAt`: Date

### 2.9 Goal (`goals`)
Strategic OKRs and measurable targets.
- `_id`: ObjectId
- `user`: ObjectId (Ref: `User`, indexed)
- `title`: String
- `targetValue`: Number
- `currentValue`: Number
- `unit`: String (e.g., 'books', 'features', '%')
- `deadline`: Date
- `connectedProjects`: Array of ObjectIds (Ref: `Project`)
- `status`: Enum (`'NOT_STARTED'`, `'IN_PROGRESS'`, `'ACHIEVED'`, `'OVERDUE'`)
- `createdAt` / `updatedAt`: Date

### 2.10 GraphNode & GraphEdge (`graph_nodes`, `graph_edges`)
Persisted React Flow visual knowledge graph mapping cross-domain relations.
- **GraphNode**:
  - `user`: ObjectId (Ref: `User`, indexed)
  - `nodeId`: String (React Flow unique ID)
  - `type`: Enum (`'document'`, `'note'`, `'topic'`, `'project'`, `'task'`, `'goal'`)
  - `label`: String
  - `position`: `{ x: Number, y: Number }`
  - `resourceId`: ObjectId (Ref to actual target resource)
- **GraphEdge**:
  - `user`: ObjectId (Ref: `User`, indexed)
  - `edgeId`: String
  - `source`: String (Source nodeId)
  - `target`: String (Target nodeId)
  - `label`: String
  - `animated`: Boolean

### 2.11 Conversation & Message (`conversations`, `messages`)
Conversational history with the AI Command Center.
- **Conversation**:
  - `user`: ObjectId (Ref: `User`, indexed)
  - `title`: String
  - `model`: String
  - `pinnedDocument`: ObjectId (Ref: `Document`, optional)
- **Message**:
  - `conversation`: ObjectId (Ref: `Conversation`, indexed)
  - `user`: ObjectId (Ref: `User`, indexed)
  - `role`: Enum (`'user'`, `'assistant'`, `'system'`)
  - `content`: String
  - `sources`: Array of `{ documentId: ObjectId, chunkId: ObjectId, title: String, excerpt: String }`
  - `createdAt`: Date

### 2.12 AIUsage (`ai_usage`)
Tracks token usage, latency, and calls to Groq API.
- `user`: ObjectId (Ref: `User`, indexed)
- `promptTokens`: Number
- `completionTokens`: Number
- `totalTokens`: Number
- `model`: String
- `operation`: String (`'chat'`, `'summarize'`, `'extract_tasks'`, `'suggest_links'`)
- `createdAt`: Date
