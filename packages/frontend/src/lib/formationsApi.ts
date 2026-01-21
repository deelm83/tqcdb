const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export type ArmyType = 'CAVALRY' | 'SHIELD' | 'ARCHER' | 'SPEAR' | 'SIEGE';

export interface FormationGeneral {
  generalId: string;
  generalName?: string;
  generalImage?: string;
  generalCost?: number;
  generalGrade?: string;
  innateSkillId?: number;
  innateSkillName?: string;
  skill1Id?: number | null;
  skill1Name?: string | null;
  skill2Id?: number | null;
  skill2Name?: string | null;
  position: number; // 0, 1, or 2
}

export interface Formation {
  id: number;
  name: string;
  description?: string;
  armyType: ArmyType;
  totalCost: number;
  userId: number;
  username?: string;
  isCurated: boolean;
  rank?: number;
  upvotes: number;
  downvotes: number;
  userVote?: number; // 1, -1, or null
  generals: FormationGeneral[];
  createdAt: string;
  updatedAt: string;
}

export interface FormationListParams {
  search?: string;
  armyType?: ArmyType;
  sort?: 'rank' | 'newest' | 'oldest';
  tab?: 'community' | 'curated' | 'mine';
  page?: number;
  limit?: number;
}

export interface FormationListResponse {
  formations: Formation[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface CreateFormationData {
  name: string;
  description?: string;
  armyType: ArmyType;
  generals: Array<{
    generalId: string;
    position: number;
    skill1Id?: number | null;
    skill2Id?: number | null;
  }>;
}

// Get formations list with filters and pagination
export async function getFormations(params: FormationListParams = {}): Promise<FormationListResponse> {
  const searchParams = new URLSearchParams();

  if (params.search) searchParams.append('search', params.search);
  if (params.armyType) searchParams.append('armyType', params.armyType);
  if (params.sort) searchParams.append('sort', params.sort);
  if (params.tab) searchParams.append('tab', params.tab);
  if (params.page) searchParams.append('page', String(params.page));
  if (params.limit) searchParams.append('limit', String(params.limit));

  const url = `${API_BASE_URL}/formations?${searchParams.toString()}`;
  const response = await fetch(url, {
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error('Không thể tải danh sách đội hình');
  }

  return response.json();
}

// Get single formation by ID
export async function getFormation(id: number): Promise<Formation> {
  const response = await fetch(`${API_BASE_URL}/formations/${id}`, {
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error('Không tìm thấy đội hình');
  }

  return response.json();
}

// Create new formation
export async function createFormation(data: CreateFormationData): Promise<Formation> {
  const response = await fetch(`${API_BASE_URL}/formations`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Không thể tạo đội hình');
  }

  return response.json();
}

// Update existing formation
export async function updateFormation(id: number, data: Partial<CreateFormationData>): Promise<Formation> {
  const response = await fetch(`${API_BASE_URL}/formations/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Không thể cập nhật đội hình');
  }

  return response.json();
}

// Delete formation
export async function deleteFormation(id: number): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/formations/${id}`, {
    method: 'DELETE',
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error('Không thể xóa đội hình');
  }
}

// Copy formation to user's account
export async function copyFormation(id: number): Promise<Formation> {
  const response = await fetch(`${API_BASE_URL}/formations/${id}/copy`, {
    method: 'POST',
    credentials: 'include',
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Không thể sao chép đội hình');
  }

  return response.json();
}

// Vote on formation (+1 or -1)
export async function voteFormation(id: number, value: number): Promise<{
  message: string;
  rankScore: number;
  voteCount: number;
  userVote: number;
}> {
  const response = await fetch(`${API_BASE_URL}/formations/${id}/vote`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify({ value }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Không thể bình chọn');
  }

  return response.json();
}
