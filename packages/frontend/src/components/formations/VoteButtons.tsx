'use client';

import { useState } from 'react';
import { voteFormation } from '@/lib/formationsApi';

interface VoteButtonsProps {
  formationId: number;
  initialRankScore: number;
  initialVoteCount: number;
  initialUserVote: number | null; // 1, -1, or null
  isCurated: boolean;
  onVoteSuccess?: (newRankScore: number, newVoteCount: number, newUserVote: number) => void;
}

export default function VoteButtons({
  formationId,
  initialRankScore,
  initialVoteCount,
  initialUserVote,
  isCurated,
  onVoteSuccess,
}: VoteButtonsProps) {
  const [rankScore, setRankScore] = useState(initialRankScore);
  const [voteCount, setVoteCount] = useState(initialVoteCount);
  const [userVote, setUserVote] = useState(initialUserVote);
  const [isVoting, setIsVoting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Only show for curated formations
  if (!isCurated) {
    return null;
  }

  const handleVote = async (value: number) => {
    if (isVoting) return;

    // If clicking the same vote, it's an unvote (not implemented in backend yet)
    // For now, just allow changing vote
    setIsVoting(true);
    setError(null);

    try {
      const response = await voteFormation(formationId, value);

      // Update local state
      const newRankScore = response.rankScore || rankScore;
      const newVoteCount = response.voteCount || voteCount;
      const newUserVote = response.userVote || value;

      setRankScore(newRankScore);
      setVoteCount(newVoteCount);
      setUserVote(newUserVote);

      if (onVoteSuccess) {
        onVoteSuccess(newRankScore, newVoteCount, newUserVote);
      }
    } catch (err) {
      console.error('Error voting:', err);
      const errorMessage = err instanceof Error ? err.message : 'Không thể bình chọn';
      setError(errorMessage);

      // Show error for 3 seconds
      setTimeout(() => setError(null), 3000);
    } finally {
      setIsVoting(false);
    }
  };

  const upvotes = Math.max(0, Math.floor((rankScore + voteCount) / 2));
  const downvotes = Math.max(0, Math.floor((voteCount - rankScore) / 2));

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        {/* Upvote button */}
        <button
          onClick={() => handleVote(1)}
          disabled={isVoting}
          className={`flex items-center gap-1 px-3 py-1.5 border transition-colors ${
            userVote === 1
              ? 'bg-green-500/20 border-green-500 text-green-400'
              : 'border-[var(--border)] text-[var(--text-secondary)] hover:border-green-500 hover:text-green-400'
          } ${isVoting ? 'opacity-50 cursor-not-allowed' : ''}`}
          title="Thích"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
          </svg>
          <span className="font-semibold">{upvotes}</span>
        </button>

        {/* Downvote button */}
        <button
          onClick={() => handleVote(-1)}
          disabled={isVoting}
          className={`flex items-center gap-1 px-3 py-1.5 border transition-colors ${
            userVote === -1
              ? 'bg-red-500/20 border-red-500 text-red-400'
              : 'border-[var(--border)] text-[var(--text-secondary)] hover:border-red-500 hover:text-red-400'
          } ${isVoting ? 'opacity-50 cursor-not-allowed' : ''}`}
          title="Không thích"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path d="M18 9.5a1.5 1.5 0 11-3 0v-6a1.5 1.5 0 013 0v6zM14 9.667v-5.43a2 2 0 00-1.105-1.79l-.05-.025A4 4 0 0011.055 2H5.64a2 2 0 00-1.962 1.608l-1.2 6A2 2 0 004.44 12H8v4a2 2 0 002 2 1 1 0 001-1v-.667a4 4 0 01.8-2.4l1.4-1.866a4 4 0 00.8-2.4z" />
          </svg>
          <span className="font-semibold">{downvotes}</span>
        </button>

        {/* Net score */}
        <div className="ml-2 text-sm text-[var(--text-tertiary)]">
          Điểm: <span className={`font-bold ${rankScore > 0 ? 'text-green-400' : rankScore < 0 ? 'text-red-400' : ''}`}>
            {rankScore > 0 ? '+' : ''}{rankScore}
          </span>
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div className="text-sm text-red-400 bg-red-500/10 border border-red-500/30 px-3 py-2">
          {error}
        </div>
      )}

      {/* Login prompt if not logged in */}
      {!userVote && !error && (
        <div className="text-xs text-[var(--text-tertiary)]">
          Đăng nhập để bình chọn
        </div>
      )}
    </div>
  );
}
