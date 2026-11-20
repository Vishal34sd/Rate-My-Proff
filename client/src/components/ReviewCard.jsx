import { useState } from 'react'
import axios from 'axios'
import { toast } from 'sonner'
import {
  Calendar,
  BookOpen,
  UserCheck,
  Star,
  ThumbsUp,
  ThumbsDown,
} from 'lucide-react'

import { Card, CardContent } from './ui/card'
import RatingStars from './RatingStars'
import { formatScore } from '../lib/utils'
import { getToken } from '../utils/auth'

function ReviewCard({ review }) {
  const rating = Number(review?.rating || 0)
  const createdAt = review?.createdAt ? new Date(review.createdAt) : null

  const [likesCount, setLikesCount] = useState(
    Number(review?.likesCount ?? review?.helpfulCount ?? 0)
  )
  const [dislikesCount, setDislikesCount] = useState(
    Number(review?.dislikesCount ?? 0)
  )
  const [userVote, setUserVote] = useState(
    review?.userVote ?? (review?.isHelpful ? 'like' : null)
  )
  const [loading, setLoading] = useState(false)

  const handleVote = async (type) => {
    if (!getToken()) {
      toast.info('Please sign in to like or dislike student feedback.')
      return
    }

    // Snapshot state for rollback on error
    const prevLikes = likesCount
    const prevDislikes = dislikesCount
    const prevVote = userVote

    // Optimistic UI updates
    if (userVote === type) {
      // Toggle off vote
      setUserVote(null)
      if (type === 'like') setLikesCount(Math.max(0, likesCount - 1))
      else setDislikesCount(Math.max(0, dislikesCount - 1))
    } else {
      // New or switched vote
      setUserVote(type)
      if (type === 'like') {
        setLikesCount(likesCount + 1)
        if (prevVote === 'dislike') setDislikesCount(Math.max(0, dislikesCount - 1))
      } else {
        setDislikesCount(dislikesCount + 1)
        if (prevVote === 'like') setLikesCount(Math.max(0, likesCount - 1))
      }
    }

    try {
      setLoading(true)
      const response = await axios.post(
        `http://localhost:8080/api/reviews/${review._id}/vote`,
        { type },
        {
          headers: {
            Authorization: `Bearer ${getToken()}`,
          },
        }
      )

      if (response.data) {
        setLikesCount(response.data.likesCount ?? 0)
        setDislikesCount(response.data.dislikesCount ?? 0)
        setUserVote(response.data.userVote)
      }
    } catch (error) {
      // Rollback to previous state
      setUserVote(prevVote)
      setLikesCount(prevLikes)
      setDislikesCount(prevDislikes)
      toast.error(error.response?.data?.message || 'Failed to submit vote.')
    } finally {
      setLoading(false)
    }
  }

  const hasDetailedRatings = Boolean(
    review?.teachingQuality ||
    review?.subjectKnowledge ||
    review?.doubtResolution ||
    review?.fairnessInGrading ||
    review?.classEngagement
  )

  return (
    <Card className="relative overflow-hidden border-border/80 bg-card/90 transition-all duration-200 hover:border-primary/40 hover:shadow-md">
      <CardContent className="p-5 space-y-3.5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary border border-primary/20">
              <UserCheck size={18} />
            </div>

            <div>
              <p className="text-sm font-semibold text-foreground">
                Verified Student
              </p>

              <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                {review?.reviewDate ? (
                  <span className="flex items-center gap-1 font-medium text-primary">
                    <Calendar size={11} />
                    Daily Lecture • {new Date(review.reviewDate + 'T00:00:00').toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </span>
                ) : createdAt ? (
                  <span className="flex items-center gap-1">
                    <Calendar size={11} />
                    {createdAt.toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </span>
                ) : (
                  <span>Recent</span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5 rounded-xl bg-amber-500/10 px-2.5 py-1 text-xs font-bold text-amber-500 border border-amber-500/20">
            <Star size={13} className="fill-amber-500" />
            <span>{formatScore(rating)}</span>
            <span className="text-muted-foreground/60 text-[10px]">/ 5</span>
          </div>
        </div>

        {review?.subject && (
          <div className="inline-flex items-center gap-1 rounded-md bg-secondary/80 px-2 py-0.5 text-xs font-medium text-foreground/80 border border-border/60">
            <BookOpen size={12} className="text-primary" />
            <span>Course: {review.subject}</span>
          </div>
        )}

        <div className="relative pt-0.5">
          <p className="text-sm text-foreground/90 leading-relaxed italic">
            &ldquo;{review?.comment || 'The student left no written comment for this review.'}&rdquo;
          </p>
        </div>

        {/* 5 Faculty Rating Parameters Breakdown */}
        {hasDetailedRatings && (
          <div className="rounded-xl border border-border/70 bg-muted/20 p-3 space-y-2 text-xs">
            <div className="flex items-center justify-between border-b border-border/50 pb-1.5">
              <span className="text-[11px] font-bold text-foreground uppercase tracking-wider">
                Parameter Ratings
              </span>
              <span className="text-[10px] font-medium text-muted-foreground">
                1 = Poor • 5 = Excellent
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 pt-0.5">
              {review.teachingQuality && (
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Teaching Quality:</span>
                  <div className="flex items-center gap-1.5">
                    <RatingStars value={review.teachingQuality} readOnly size={13} />
                    <span className="text-[10px] font-semibold text-primary">{review.teachingQuality}/5</span>
                  </div>
                </div>
              )}
              {review.subjectKnowledge && (
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Subject Knowledge:</span>
                  <div className="flex items-center gap-1.5">
                    <RatingStars value={review.subjectKnowledge} readOnly size={13} />
                    <span className="text-[10px] font-semibold text-primary">{review.subjectKnowledge}/5</span>
                  </div>
                </div>
              )}
              {review.doubtResolution && (
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Doubt Resolution:</span>
                  <div className="flex items-center gap-1.5">
                    <RatingStars value={review.doubtResolution} readOnly size={13} />
                    <span className="text-[10px] font-semibold text-primary">{review.doubtResolution}/5</span>
                  </div>
                </div>
              )}
              {review.fairnessInGrading && (
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Fairness in Grading:</span>
                  <div className="flex items-center gap-1.5">
                    <RatingStars value={review.fairnessInGrading} readOnly size={13} />
                    <span className="text-[10px] font-semibold text-primary">{review.fairnessInGrading}/5</span>
                  </div>
                </div>
              )}
              {review.classEngagement && (
                <div className="flex items-center justify-between sm:col-span-2">
                  <span className="text-muted-foreground">Class Engagement:</span>
                  <div className="flex items-center gap-1.5">
                    <RatingStars value={review.classEngagement} readOnly size={13} />
                    <span className="text-[10px] font-semibold text-primary">{review.classEngagement}/5</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="pt-2 border-t border-border/50 flex items-center justify-between text-xs text-muted-foreground">
          <span>Overall Experience</span>
          <RatingStars value={Math.round(rating)} readOnly size={14} />
        </div>

        {/* Like & Dislike Student Feedback Controls */}
        <div className="pt-3 border-t border-border/60 flex flex-wrap items-center justify-between gap-2.5">
          <div className="flex items-center gap-1.5 bg-muted/40 rounded-xl p-1 border border-border/50">
            {/* Like Button */}
            <button
              type="button"
              onClick={() => handleVote('like')}
              disabled={loading}
              title={userVote === 'like' ? 'Remove Like' : 'Like this feedback'}
              className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold transition-all cursor-pointer ${
                userVote === 'like'
                  ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 shadow-xs'
                  : 'text-muted-foreground hover:bg-muted/80 hover:text-foreground'
              } disabled:opacity-50`}
            >
              <ThumbsUp
                size={13}
                className={userVote === 'like' ? 'fill-current' : ''}
              />
              <span>{likesCount}</span>
              <span className="hidden sm:inline font-normal text-[11px]">Like</span>
            </button>

            {/* Dislike Button */}
            <button
              type="button"
              onClick={() => handleVote('dislike')}
              disabled={loading}
              title={userVote === 'dislike' ? 'Remove Dislike' : 'Dislike this feedback'}
              className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold transition-all cursor-pointer ${
                userVote === 'dislike'
                  ? 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30 shadow-xs'
                  : 'text-muted-foreground hover:bg-muted/80 hover:text-foreground'
              } disabled:opacity-50`}
            >
              <ThumbsDown
                size={13}
                className={userVote === 'dislike' ? 'fill-current' : ''}
              />
              <span>{dislikesCount}</span>
              <span className="hidden sm:inline font-normal text-[11px]">Dislike</span>
            </button>
          </div>

          {/* Social Feedback Indicator */}
          <div className="text-[11px] text-muted-foreground flex items-center gap-1">
            {likesCount + dislikesCount > 0 ? (
              <span>
                <strong className="text-foreground font-semibold">{likesCount}</strong> student{likesCount === 1 ? '' : 's'} liked • <strong className="text-foreground font-semibold">{dislikesCount}</strong> disliked
              </span>
            ) : (
              <span>Be the first student to like or dislike</span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default ReviewCard
