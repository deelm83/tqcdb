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
