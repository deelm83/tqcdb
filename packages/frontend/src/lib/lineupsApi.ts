const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export interface GeneralConflict {
  generalId: string;
  generalName: string;
  formationIds: string[];
}

export interface SkillConflict {
  skillId: number;
  skillName: string;
  formationIds: string[];
  resolved: boolean;
}

export interface LineUpFormation {
  id: string;
  name: string;
  description?: string;
  armyType: string;
  position: number;
  user?: {
    id: string;
    displayName: string;
    avatarUrl?: string;
  };
  generals: Array<{
    id: string;
    position: number;
    general: {
      id: string;
      name: string;
      image?: string;
      cost: number;
    };
    skill1?: {
      id: number;
      name: string;
    } | null;
    skill2?: {
      id: number;
      name: string;
    } | null;
  }>;
  totalCost: number;
}

export interface LineUpDetail {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  formations: LineUpFormation[];
  generalConflicts: GeneralConflict[];
  skillConflicts: SkillConflict[];
  skillResolutions: Array<{
    skillId: number;
    skillName: string;
    resolved: boolean;
    note?: string;
  }>;
}

export interface LineUpSummary {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  formationCount: number;
  generalConflicts: number;
  skillConflicts: number;
  unresolvedSkillConflicts: number;
}

export interface CreateLineUpData {
  name: string;
  formationIds: string[];
}

export interface UpdateLineUpData {
  name?: string;
  formationIds?: string[];
}

// Get all line-ups for the authenticated user
export async function getLineups(): Promise<{ lineups: LineUpSummary[] }> {
  const response = await fetch(`${API_BASE_URL}/lineups`, {
    credentials: 'include',
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Không thể tải danh sách dàn trận' }));
    throw new Error(error.error || 'Không thể tải danh sách dàn trận');
  }

  return response.json();
}

// Get single line-up by ID with full details
export async function getLineup(id: string): Promise<LineUpDetail> {
  const response = await fetch(`${API_BASE_URL}/lineups/${id}`, {
    credentials: 'include',
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Không tìm thấy dàn trận' }));
    throw new Error(error.error || 'Không tìm thấy dàn trận');
  }

  return response.json();
}

// Create new line-up
export async function createLineup(data: CreateLineUpData): Promise<{
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  formationCount: number;
  skillConflicts: SkillConflict[];
  message: string;
}> {
  const response = await fetch(`${API_BASE_URL}/lineups`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Không thể tạo dàn trận' }));
    throw new Error(error.error || 'Không thể tạo dàn trận');
  }

  return response.json();
}

// Update existing line-up
export async function updateLineup(id: string, data: UpdateLineUpData): Promise<{
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  formationCount: number;
  skillConflicts: SkillConflict[];
  message: string;
}> {
  const response = await fetch(`${API_BASE_URL}/lineups/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Không thể cập nhật dàn trận' }));
    throw new Error(error.error || 'Không thể cập nhật dàn trận');
  }

  return response.json();
}

// Delete line-up
export async function deleteLineup(id: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/lineups/${id}`, {
    method: 'DELETE',
    credentials: 'include',
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Không thể xóa dàn trận' }));
    throw new Error(error.error || 'Không thể xóa dàn trận');
  }
}

// Mark skill conflict as resolved
export async function resolveSkillConflict(
  lineupId: string,
  skillId: number,
  note?: string
): Promise<{ message: string }> {
  const response = await fetch(`${API_BASE_URL}/lineups/${lineupId}/resolve`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify({ skillId, note }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Không thể giải quyết xung đột' }));
    throw new Error(error.error || 'Không thể giải quyết xung đột');
  }

  return response.json();
}

// Unresolve skill conflict
export async function unresolveSkillConflict(
  lineupId: string,
  skillId: number
): Promise<{ message: string }> {
  const response = await fetch(`${API_BASE_URL}/lineups/${lineupId}/resolve/${skillId}`, {
    method: 'DELETE',
    credentials: 'include',
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Không thể bỏ đánh dấu giải quyết' }));
    throw new Error(error.error || 'Không thể bỏ đánh dấu giải quyết');
  }

  return response.json();
}
