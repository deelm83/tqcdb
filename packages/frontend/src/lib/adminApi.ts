import { General, Skill } from './api';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

// Helper for admin API calls with credentials
async function adminFetch(url: string, options: RequestInit = {}) {
  const response = await fetch(url, {
    ...options,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.error || 'Request failed');
  }

  return response.json();
}

// ============ Generals Admin API ============

export async function fetchAdminGenerals(): Promise<General[]> {
  return adminFetch(`${API_BASE_URL}/admin/generals`);
}

export async function fetchAdminGeneral(id: string): Promise<General> {
  return adminFetch(`${API_BASE_URL}/admin/generals/${encodeURIComponent(id)}`);
}

export async function createGeneral(data: Partial<General>): Promise<{ success: boolean; general: General }> {
  return adminFetch(`${API_BASE_URL}/admin/generals`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateGeneral(id: string, data: Partial<General>): Promise<{ success: boolean; general: General }> {
  return adminFetch(`${API_BASE_URL}/admin/generals/${encodeURIComponent(id)}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function deleteGeneral(id: string): Promise<{ success: boolean; message: string }> {
  return adminFetch(`${API_BASE_URL}/admin/generals/${encodeURIComponent(id)}`, {
    method: 'DELETE',
  });
}

export async function uploadGeneralImage(id: string, file: File): Promise<{ success: boolean; image: string }> {
  const formData = new FormData();
  formData.append('image', file);

  const response = await fetch(`${API_BASE_URL}/admin/generals/${encodeURIComponent(id)}/image`, {
    method: 'POST',
    credentials: 'include',
    body: formData,
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.error || 'Upload failed');
  }

  return response.json();
}

export interface SkillOption {
  id: number;
  name: string;
  type_id: string;
  quality: string | null;
}

export async function fetchSkillsList(): Promise<SkillOption[]> {
  return adminFetch(`${API_BASE_URL}/admin/generals/skills/list`);
}

export interface BulkGeneralInput {
  name: string;
  imageBase64: string;
}

export async function bulkCreateGenerals(generals: BulkGeneralInput[]): Promise<{ created: string[]; skipped: string[] }> {
  return adminFetch(`${API_BASE_URL}/admin/generals/bulk`, {
    method: 'POST',
    body: JSON.stringify({ generals }),
  });
}

// ============ Skills Admin API ============

export async function fetchAdminSkills(): Promise<Skill[]> {
  return adminFetch(`${API_BASE_URL}/admin/skills`);
}

export async function fetchAdminSkill(id: string): Promise<Skill> {
  return adminFetch(`${API_BASE_URL}/admin/skills/${encodeURIComponent(id)}`);
}

export async function createSkill(data: Partial<Skill>): Promise<{ success: boolean; skill: Skill }> {
  return adminFetch(`${API_BASE_URL}/admin/skills`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateSkill(id: string, data: Partial<Skill>): Promise<{ success: boolean; skill: Skill }> {
  return adminFetch(`${API_BASE_URL}/admin/skills/${encodeURIComponent(id)}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function deleteSkill(id: string): Promise<{ success: boolean; message: string }> {
  return adminFetch(`${API_BASE_URL}/admin/skills/${encodeURIComponent(id)}`, {
    method: 'DELETE',
  });
}

export interface ProcessedSkillData {
  name?: string;
  type?: { id: string; name: string };
  quality?: string;
  trigger_rate?: number;
  target?: string;
  army_types?: string[];
  effect?: string;
  innate_to?: string[];
  inheritance_from?: string[];
}

export async function processSkillImage(file: File): Promise<{ success: boolean; data: ProcessedSkillData }> {
  const formData = new FormData();
  formData.append('image', file);

  const response = await fetch(`${API_BASE_URL}/admin/skills/process-image`, {
    method: 'POST',
    credentials: 'include',
    body: formData,
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.error || 'Image processing failed');
  }

  return response.json();
}

export async function uploadSkillImage(id: string, file: File): Promise<{ success: boolean; filename: string; screenshots: string[] }> {
  const formData = new FormData();
  formData.append('image', file);

  const response = await fetch(`${API_BASE_URL}/admin/skills/${encodeURIComponent(id)}/image`, {
    method: 'POST',
    credentials: 'include',
    body: formData,
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.error || 'Upload failed');
  }

  return response.json();
}

// ============ Suggestions Admin API ============

export interface SuggestionUser {
  id: string;
  display_name: string;
  avatar_url?: string;
  email?: string;
}

export interface Suggestion {
  id: string;
  entity_type: 'general' | 'skill';
  entity_id: string;
  changes: Record<string, { old: unknown; new: unknown }>;
  reason?: string;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED';
  user: SuggestionUser;
  reviewed_by?: string;
  reviewed_at?: string;
  created_at: string;
  updated_at: string;
}

export interface SuggestionDetail extends Suggestion {
  entity?: unknown;
}

export interface SuggestionsListResponse {
  suggestions: Suggestion[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
  };
}

export interface SummarizeSuggestionsResponse {
  success: boolean;
  entity_type: string;
  entity_id: string;
  suggestions_count: number;
  summary: {
    recommended_changes: Record<string, {
      old: unknown;
      new: unknown;
      confidence: 'high' | 'medium' | 'low';
      reason: string;
    }>;
    conflicts: Array<{
      field: string;
      suggestions: Array<{
        value: unknown;
        count: number;
        users: string[];
      }>;
      recommendation: string;
    }>;
    summary: string;
  };
}

export async function fetchSuggestions(params?: {
  status?: string;
  entityType?: string;
  limit?: number;
  offset?: number;
}): Promise<SuggestionsListResponse> {
  const queryParams = new URLSearchParams();
  if (params?.status) queryParams.append('status', params.status);
  if (params?.entityType) queryParams.append('entityType', params.entityType);
  if (params?.limit) queryParams.append('limit', params.limit.toString());
  if (params?.offset) queryParams.append('offset', params.offset.toString());

  return adminFetch(`${API_BASE_URL}/admin/suggestions?${queryParams.toString()}`);
}

export async function fetchSuggestion(id: string): Promise<SuggestionDetail> {
  return adminFetch(`${API_BASE_URL}/admin/suggestions/${encodeURIComponent(id)}`);
}

export async function acceptSuggestion(id: string): Promise<{ success: boolean; suggestion: Suggestion }> {
  return adminFetch(`${API_BASE_URL}/admin/suggestions/${encodeURIComponent(id)}/accept`, {
    method: 'POST',
  });
}

export async function rejectSuggestion(id: string): Promise<{ success: boolean; suggestion: Suggestion }> {
  return adminFetch(`${API_BASE_URL}/admin/suggestions/${encodeURIComponent(id)}/reject`, {
    method: 'POST',
  });
}

export async function summarizeSuggestions(suggestionIds: string[]): Promise<SummarizeSuggestionsResponse> {
  return adminFetch(`${API_BASE_URL}/admin/suggestions/summarize`, {
    method: 'POST',
    body: JSON.stringify({ suggestionIds }),
  });
}

export async function fetchPendingSuggestionsCount(): Promise<number> {
  const response = await fetchSuggestions({ status: 'PENDING', limit: 0 });
  return response.pagination.total;
}

// ============ Formations Admin API ============

export interface AdminFormation {
  id: string;
  name: string;
  description?: string;
  armyType: string;
  isPublic: boolean;
  isCurated: boolean;
  rankScore: number;
  voteCount: number;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    displayName: string;
    avatarUrl?: string;
  } | null;
  generals: Array<{
    id: string;
    position: number;
    general: {
      id: string;
      name: string;
      image: string | null;
      cost: number;
    };
    skill1: {
      id: number;
      name: string;
    } | null;
    skill2: {
      id: number;
      name: string;
    } | null;
  }>;
  totalCost: number;
}

export interface AdminFormationsListResponse {
  formations: AdminFormation[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface CreateAdminFormationData {
  name: string;
  description?: string;
  armyType: string;
  isPublic?: boolean;
  isCurated?: boolean;
  userId?: string | null;
  generals: Array<{
    generalId: string;
    position: number;
    skill1Id?: number;
    skill2Id?: number;
  }>;
}

export async function getAdminFormations(params?: {
  search?: string;
  armyType?: string;
  curated?: string;
  userId?: string;
  sort?: string;
  page?: number;
  limit?: number;
}): Promise<AdminFormationsListResponse> {
  const queryParams = new URLSearchParams();
  if (params?.search) queryParams.append('search', params.search);
  if (params?.armyType) queryParams.append('armyType', params.armyType);
  if (params?.curated) queryParams.append('curated', params.curated);
  if (params?.userId) queryParams.append('userId', params.userId);
  if (params?.sort) queryParams.append('sort', params.sort);
  if (params?.page) queryParams.append('page', params.page.toString());
  if (params?.limit) queryParams.append('limit', params.limit.toString());

  return adminFetch(`${API_BASE_URL}/admin/formations?${queryParams.toString()}`);
}

export async function createAdminFormation(data: CreateAdminFormationData): Promise<AdminFormation> {
  return adminFetch(`${API_BASE_URL}/admin/formations`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateAdminFormation(id: string, data: Partial<CreateAdminFormationData>): Promise<AdminFormation> {
  return adminFetch(`${API_BASE_URL}/admin/formations/${encodeURIComponent(id)}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function deleteAdminFormation(id: string): Promise<{ success: boolean; message: string }> {
  return adminFetch(`${API_BASE_URL}/admin/formations/${encodeURIComponent(id)}`, {
    method: 'DELETE',
  });
}
