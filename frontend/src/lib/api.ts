import { Persona, User, ChatMessage, DocumentItem, GraphData, ConflictItem } from './types';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api/v1';

export async function fetchPersonas(): Promise<Persona[]> {
  try {
    const res = await fetch(`${API_BASE}/auth/personas`);
    if (!res.ok) throw new Error('Failed to fetch personas');
    return await res.json();
  } catch (err) {
    console.error('Error fetching personas:', err);
    return [
      {
        id: 'dhwani',
        name: 'Dhwani Vyas',
        role: 'student',
        email: 'dhwani@pdeu.ac.in',
        password: 'pdeu2026',
        batch: '2027',
        semester: 7,
        program: 'B.Tech CSE',
        roll: '23BCSE101',
        description: 'Batch 2027 student (Has completed Data Structures & Algorithms, eligible for ML)'
      },
      {
        id: 'rohan',
        name: 'Rohan Patel',
        role: 'student',
        email: 'rohan@pdeu.ac.in',
        password: 'pdeu2026',
        batch: '2025',
        semester: 7,
        program: 'B.Tech CSE',
        roll: '21BCSE088',
        description: 'Batch 2025 student (Legacy 2025 curriculum, missing Algorithms prerequisite)'
      },
      {
        id: 'admin',
        name: 'Prof. A. K. Sharma',
        role: 'admin',
        email: 'admin@pdeu.ac.in',
        password: 'admin2026',
        batch: 'N/A',
        semester: 0,
        program: 'Dean Academics',
        roll: 'FAC-001',
        description: 'University Administrator (Can manage documents, resolve conflicts, inspect graph)'
      }
    ];
  }
}

export async function loginUser(email: string, password: string): Promise<{ token: string; user: User }> {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, organization_id: 'PDEU' })
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Login failed' }));
    throw new Error(err.detail || 'Login failed');
  }
  const data = await res.json();
  return { token: data.access_token, user: data.user };
}

export async function askAnveshanQuery(
  question: string,
  token?: string,
  batchOverride?: string,
  semesterOverride?: number
): Promise<any> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}/chat/query`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      question,
      organization_id: 'PDEU',
      batch_override: batchOverride,
      semester_override: semesterOverride
    })
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Failed to process query' }));
    throw new Error(err.detail || 'Query failed');
  }
  return await res.json();
}

export async function fetchSuggestedQuestions(): Promise<{ category: string; text: string; description: string }[]> {
  try {
    const res = await fetch(`${API_BASE}/chat/suggested-questions`);
    if (!res.ok) throw new Error();
    return await res.json();
  } catch {
    return [
      {
        category: 'Curriculum & Eligibility',
        text: 'Can I take Machine Learning next semester?',
        description: 'Evaluates prerequisites against your completed transcript and batch.'
      },
      {
        category: 'Semester Planning',
        text: 'Which courses can I take next semester?',
        description: 'Retrieves the semester 7 course distribution, core requirements, and elective groups.'
      },
      {
        category: 'Regulations & Conflict Detection',
        text: 'What are the attendance requirements?',
        description: 'Triggers conflict detection between general Regulation REG-ACAD-04 (80%) and Hackathon Circular (75%).'
      },
      {
        category: 'Cohort Version Awareness',
        text: 'Which regulations and curriculum apply to my batch?',
        description: 'Demonstrates version sensitivity across Batch 2027 vs Batch 2025 curriculum frameworks.'
      },
      {
        category: 'Reliability & Grounding',
        text: 'What is the hostel mess menu for next Sunday?',
        description: 'Demonstrates refusal to hallucinate when knowledge is absent (INSUFFICIENT_EVIDENCE state).'
      }
    ];
  }
}

export async function fetchDocuments(batch?: string): Promise<DocumentItem[]> {
  try {
    const url = batch ? `${API_BASE}/documents?batch=${batch}` : `${API_BASE}/documents`;
    const res = await fetch(url);
    if (!res.ok) throw new Error();
    return await res.json();
  } catch (err) {
    console.error('Error fetching documents:', err);
    return [];
  }
}

export async function fetchGraphData(): Promise<GraphData> {
  try {
    const res = await fetch(`${API_BASE}/knowledge/graph`);
    if (!res.ok) throw new Error();
    return await res.json();
  } catch (err) {
    console.error('Error fetching graph:', err);
    return { nodes: [], edges: [] };
  }
}

export async function fetchConflicts(): Promise<ConflictItem[]> {
  try {
    const res = await fetch(`${API_BASE}/admin/conflicts`);
    if (!res.ok) throw new Error();
    return await res.json();
  } catch (err) {
    console.error('Error fetching conflicts:', err);
    return [];
  }
}

export async function resolveConflict(conflictId: string, status: string, notes: string, token?: string) {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(`${API_BASE}/admin/conflicts/resolve`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ conflict_id: conflictId, resolution_status: status, notes })
  });
  return await res.json();
}

export async function verifyDocument(documentId: string, status: string, token?: string) {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(`${API_BASE}/admin/verify-document?document_id=${documentId}&status=${status}`, {
    method: 'POST',
    headers
  });
  return await res.json();
}
