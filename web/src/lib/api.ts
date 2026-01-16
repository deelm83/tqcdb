const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export interface General {
  index?: number;
  id: string;
  slug: string;
  name: { cn: string; vi: string };
  faction_id: string;
  cost: number;
  wiki_url?: string;
  image?: string;
  image_full?: string;
  tags?: { cn: string[]; vi: string[] };
  troop_compatibility?: {
    cavalry?: { grade: string };
    shield?: { grade: string };
    archer?: { grade: string };
    spear?: { grade: string };
    siege?: { grade: string };
  };
  innate_skill?: {
    name: { cn: string; vi: string };
    type?: { id: string; name: { cn: string; vi: string } };
    quality?: string;
    trigger_rate?: number;
    effect?: { cn: string; vi: string };
    target?: string;
    target_vi?: string;
    army_types?: string[];
  };
  inherited_skill?: {
    name: { cn: string; vi: string };
    type?: { id: string; name: { cn: string; vi: string } };
    quality?: string;
    trigger_rate?: number;
    effect?: { cn: string; vi: string };
    target?: string;
    target_vi?: string;
    army_types?: string[];
  };
  // Admin fields
  innate_skill_name?: string;
  inherited_skill_name?: string;
  innate_skill_id?: number | null;
  inherited_skill_id?: number | null;
}

export interface Skill {
  id: number;
  slug?: string;
  name: { cn: string; vi: string };
  type: { id: string; name: { cn: string; vi: string } };
  quality?: string;
  trigger_rate?: number;
  source_type?: string;
  wiki_url?: string;
  effect?: { cn: string; vi?: string };
  target?: string;
  target_vi?: string;
  army_types?: string[];
  innate_to?: string[];
  inheritance_from?: string[];
  innate_general_ids?: string[];
  inherit_general_ids?: string[];
  acquisition_type?: 'inherit' | 'innate' | 'exchange';
  exchange_type?: 'exact' | 'any';
  exchange_generals?: string[];
  exchange_general_ids?: string[];
  exchange_count?: number;
}

export interface GeneralsFilter {
  search?: string;
  factions?: string[];
  costs?: number[];
  cavalry?: boolean;
  shield?: boolean;
  archer?: boolean;
  spear?: boolean;
  siege?: boolean;
}

// Fetch all generals with optional filters
export async function fetchGenerals(filters?: GeneralsFilter): Promise<General[]> {
  const params = new URLSearchParams();

  if (filters?.search) params.append('search', filters.search);
  if (filters?.factions?.length) params.append('factions', filters.factions.join(','));
  if (filters?.costs?.length) params.append('costs', filters.costs.join(','));
  if (filters?.cavalry) params.append('cavalry', 'true');
  if (filters?.shield) params.append('shield', 'true');
  if (filters?.archer) params.append('archer', 'true');
  if (filters?.spear) params.append('spear', 'true');
  if (filters?.siege) params.append('siege', 'true');

  const url = `${API_BASE_URL}/generals?${params.toString()}`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error('Không thể tải danh sách tướng');
  }

  return response.json();
}

// Fetch single general by ID
export async function fetchGeneral(id: string): Promise<General> {
  const response = await fetch(`${API_BASE_URL}/generals/${encodeURIComponent(id)}`);

  if (!response.ok) {
    throw new Error('Không tìm thấy tướng');
  }

  return response.json();
}

// Fetch all skills with optional filters
export async function fetchSkills(search?: string, type?: string): Promise<Skill[]> {
  const params = new URLSearchParams();

  if (search) params.append('search', search);
  if (type && type !== 'all') params.append('type', type);

  const url = `${API_BASE_URL}/skills?${params.toString()}`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error('Không thể tải danh sách chiến pháp');
  }

  return response.json();
}

// Fetch single skill by slug or id
export async function fetchSkill(identifier: string): Promise<Skill> {
  const response = await fetch(`${API_BASE_URL}/skills/${encodeURIComponent(identifier)}`);

  if (!response.ok) {
    throw new Error('Không tìm thấy chiến pháp');
  }

  return response.json();
}

// Fetch skill type counts
export async function fetchSkillTypeCounts(): Promise<Record<string, number>> {
  const response = await fetch(`${API_BASE_URL}/skills/stats/type-counts`);

  if (!response.ok) {
    throw new Error('Không thể tải thống kê chiến pháp');
  }

  return response.json();
}

// Fetch generals map for skill linking
export async function fetchGeneralsMap(): Promise<Record<string, { id: number; vi: string }>> {
  const response = await fetch(`${API_BASE_URL}/skills/generals-map`);

  if (!response.ok) {
    throw new Error('Không thể tải danh sách tướng');
  }

  return response.json();
}
