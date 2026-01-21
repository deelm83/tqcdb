'use client';

import { GeneralConflict, SkillConflict } from '@/lib/lineupsApi';

interface ConflictIndicatorProps {
  generalConflicts: GeneralConflict[];
  skillConflicts: SkillConflict[];
  onResolveSkill?: (skillId: number) => void;
  onUnresolveSkill?: (skillId: number) => void;
}

export default function ConflictIndicator({
  generalConflicts,
  skillConflicts,
  onResolveSkill,
  onUnresolveSkill,
}: ConflictIndicatorProps) {
  const hasGeneralConflicts = generalConflicts.length > 0;
  const hasSkillConflicts = skillConflicts.length > 0;
  const unresolvedSkillConflicts = skillConflicts.filter(sc => !sc.resolved);

  if (!hasGeneralConflicts && !hasSkillConflicts) {
    return (
      <div className="rounded-lg border border-green-500/20 bg-green-500/5 p-4">
        <div className="flex items-center gap-2">
          <div className="rounded-full bg-green-500/20 p-1">
            <svg className="h-5 w-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <p className="text-sm text-green-400">Không có xung đột</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* General conflicts - HARD BLOCK */}
      {hasGeneralConflicts && (
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-4">
          <div className="flex items-start gap-3">
            <div className="rounded-full bg-red-500/20 p-1">
              <svg className="h-5 w-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-red-400">Xung đột võ tướng: Không thể lưu</h3>
              <ul className="mt-2 space-y-1 text-sm text-red-300">
                {generalConflicts.map((conflict) => (
                  <li key={conflict.generalId}>
                    • {conflict.generalName} đang ở {conflict.formationIds.length} đội hình
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Skill conflicts - WARNING with resolution */}
      {hasSkillConflicts && (
        <div className="rounded-lg border border-yellow-500/30 bg-yellow-500/10 p-4">
          <div className="flex items-start gap-3">
            <div className="rounded-full bg-yellow-500/20 p-1">
              <svg className="h-5 w-5 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-yellow-400">
                Xung đột chiến pháp: Có thể giải quyết
              </h3>
              <ul className="mt-2 space-y-2">
                {skillConflicts.map((conflict) => (
                  <li key={conflict.skillId} className="flex items-center justify-between text-sm">
                    <span className={conflict.resolved ? 'text-yellow-300/60' : 'text-yellow-300'}>
                      • &quot;{conflict.skillName}&quot; dùng ở {conflict.formationIds.length} đội hình
                    </span>
                    {onResolveSkill && onUnresolveSkill && (
                      <label className="flex items-center gap-2 text-xs">
                        <input
                          type="checkbox"
                          checked={conflict.resolved}
                          onChange={(e) => {
                            if (e.target.checked) {
                              onResolveSkill(conflict.skillId);
                            } else {
                              onUnresolveSkill(conflict.skillId);
                            }
                          }}
                          className="h-4 w-4 rounded border-yellow-500/30 bg-yellow-500/10 text-yellow-500 focus:ring-yellow-500/50"
                        />
                        <span className={conflict.resolved ? 'text-green-400' : 'text-yellow-300'}>
                          {conflict.resolved ? 'Đã giải quyết' : 'Đánh dấu đã có'}
                        </span>
                      </label>
                    )}
                  </li>
                ))}
              </ul>
              {unresolvedSkillConflicts.length > 0 && (
                <p className="mt-3 text-xs text-yellow-300/80">
                  Lưu ý: Hãy đảm bảo bạn có đủ bản sao chiến pháp (ví dụ: từ sự kiện mùa) trước khi đánh dấu đã giải quyết.
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
