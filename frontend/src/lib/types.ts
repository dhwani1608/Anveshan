export interface StudentProfile {
  id: string;
  roll_number: string;
  program: string;
  department: string;
  batch: string;
  current_academic_year: string;
  current_semester: number;
  completed_courses: string[];
  cgpa: number;
}

export interface User {
  id: string;
  email: string;
  full_name: string;
  role: 'student' | 'faculty' | 'admin';
  organization_id: string;
  profile?: StudentProfile | null;
}

export interface Persona {
  id: string;
  name: string;
  role: string;
  email: string;
  password: string;
  batch: string;
  semester: number;
  program: string;
  roll: string;
  description: string;
}

export interface CitationItem {
  citation_id: number;
  document_id: string;
  document_title: string;
  version: string;
  page_number?: number;
  section?: string;
  verification_status: 'AUTHORITATIVE' | 'VERIFIED' | 'UNVERIFIED' | 'OUTDATED';
  snippet: string;
}

export interface GraphStep {
  source: string;
  relation: string;
  target: string;
}

export interface ConflictItem {
  id: string;
  title: string;
  source_a_title: string;
  source_a_snippet: string;
  source_b_title: string;
  source_b_snippet: string;
  description: string;
}

export interface UserContext {
  student_name: string;
  roll_number: string;
  program: string;
  department: string;
  batch: string;
  semester: number;
  completed_courses: string[];
  cgpa: number;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  content: string;
  timestamp: string;
  status?: 'ANSWERED' | 'PARTIALLY_ANSWERED' | 'INSUFFICIENT_EVIDENCE' | 'CONFLICT_DETECTED';
  direct_answer?: string;
  explanation?: string;
  user_context?: UserContext;
  citations?: CitationItem[];
  graph_traversal?: GraphStep[];
  conflicts?: ConflictItem[];
  related_actions?: string[];
  latency_ms?: number;
}

export interface DocumentItem {
  id: string;
  organization_id: string;
  title: string;
  category: string;
  department?: string;
  applicable_batch: string;
  current_version: string;
  verification_status: 'AUTHORITATIVE' | 'VERIFIED' | 'UNVERIFIED' | 'OUTDATED';
  source_url?: string;
  validity_period?: string;
  chunk_count?: number;
}

export interface GraphNode {
  id: string;
  name: string;
  entity_type: string;
  properties?: Record<string, any>;
}

export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  relation: string;
  properties?: Record<string, any>;
}

export interface GraphData {
  nodes: GraphNode[];
  edges: GraphEdge[];
}
