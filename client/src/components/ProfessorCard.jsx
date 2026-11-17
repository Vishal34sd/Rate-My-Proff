import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Star,
  BookOpen,
  GraduationCap,
  Mail,
  Phone,
  Briefcase,
  Layers,
  ArrowUpRight,
} from 'lucide-react'

import { Card, CardContent } from './ui/card'
import RatingStars from './RatingStars'

function ProfessorCard({ professor, actions = null, clickable = true }) {
  const dept = professor?.department || 'Faculty'
  const section = professor?.sections || []
  const subjects = professor?.subjects || []
  const rating = Number(professor?.overallRating || 0)
  const totalReviews = Number(professor?.totalReviews || 0)

  const [imageFailed, setImageFailed] = useState(false)

  const imageUrl = (professor?.imageUrl || '').trim()
  const initials = (professor?.name || 'P').trim().slice(0, 1).toUpperCase()

  const apiBase = 'http://localhost:8080'
  const resolvedImageUrl =
    imageUrl && !imageFailed
      ? imageUrl.startsWith('http')
        ? imageUrl
        : `${apiBase}${imageUrl}`
      : ''

  const cardInner = (
    <Card className="group relative h-full overflow-hidden border-border/80 bg-card/90 backdrop-blur-sm transition-all duration-300 hover:border-primary/50 hover:shadow-xl hover:shadow-primary/5 flex flex-col justify-between">
      {/* Top Accent Gradient Line */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-500 via-amber-400 to-primary opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

      <CardContent className="p-5 flex-1 flex flex-col">
        {/* Top Header: Monogram/Image + Name + Department + Rating Badge */}
        <div className="flex items-start gap-4">
          {/* Avatar / Photo */}
          <div className="relative shrink-0">
            <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-2xl overflow-hidden border-2 border-border/70 bg-gradient-to-tr from-muted to-primary/10 shadow-sm transition-transform duration-300 group-hover:scale-105">
              {resolvedImageUrl ? (
                <img
                  src={resolvedImageUrl}
                  alt={professor?.name || 'Professor'}
                  className="h-full w-full object-cover"
                  loading="lazy"
                  onError={() => setImageFailed(true)}
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/20 via-orange-500/10 to-amber-500/20 text-2xl font-black text-primary">
                  {initials}
                </div>
              )}
            </div>

            {/* Micro rating badge on avatar */}
            {rating > 0 && (
              <span className="absolute -bottom-1.5 -right-1.5 flex items-center gap-0.5 rounded-full bg-amber-500 px-1.5 py-0.5 text-[10px] font-bold text-slate-950 shadow-md">
                <Star size={10} className="fill-slate-950" />
                {rating.toFixed(1)}
              </span>
            )}
          </div>

          {/* Details */}
          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-1">
              <div>
                <h3 className="text-base sm:text-lg font-bold tracking-tight text-foreground transition-colors group-hover:text-primary truncate">
                  {professor?.name || 'Unnamed Professor'}
                </h3>
                {professor?.post && (
                  <p className="text-xs font-medium text-muted-foreground truncate">
                    {professor.post}
                  </p>
                )}
              </div>

              {clickable && !actions && (
                <div className="rounded-lg p-1 text-muted-foreground opacity-0 transition-all duration-200 group-hover:opacity-100 group-hover:text-primary group-hover:translate-x-0.5 group-hover:-translate-y-0.5">
                  <ArrowUpRight size={18} />
                </div>
              )}
            </div>

            {/* Department Pill */}
            <div className="mt-2 flex flex-wrap items-center gap-1.5">
              <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-0.5 text-[11px] font-semibold text-primary border border-primary/20">
                <GraduationCap size={12} />
                {dept}
              </span>

              {professor?.experienceYears !== null &&
                professor?.experienceYears !== undefined &&
                professor?.experienceYears !== '' && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
                    <Briefcase size={11} />
                    {professor.experienceYears} yr{Number(professor.experienceYears) === 1 ? '' : 's'} exp
                  </span>
                )}
            </div>
          </div>
        </div>

        {/* Rating Breakdown Strip */}
        <div className="mt-4 flex items-center justify-between rounded-xl bg-muted/40 p-2.5 border border-border/50">
          <div className="flex items-center gap-2">
            <RatingStars value={Math.round(rating)} readOnly size={14} />
            <span className="text-xs font-bold text-foreground">
              {rating > 0 ? rating.toFixed(1) : 'Unrated'}
            </span>
          </div>

          <span className="text-[11px] font-medium text-muted-foreground">
            {totalReviews > 0 ? `${totalReviews} review${totalReviews === 1 ? '' : 's'}` : 'No reviews yet'}
          </span>
        </div>

        {/* Subjects & Sections */}
        <div className="mt-3 space-y-2 flex-1">
          {subjects.length > 0 && (
            <div className="flex flex-wrap items-center gap-1 pt-1">
              <span className="text-[11px] text-muted-foreground flex items-center gap-1 mr-1">
                <BookOpen size={11} /> Subjects:
              </span>
              {subjects.slice(0, 3).map((sub, idx) => (
                <span
                  key={idx}
                  className="rounded-md bg-secondary/80 px-2 py-0.5 text-[11px] font-medium text-foreground/80 border border-border/60"
                >
                  {sub}
                </span>
              ))}
              {subjects.length > 3 && (
                <span className="text-[10px] text-muted-foreground font-semibold">
                  +{subjects.length - 3} more
                </span>
              )}
            </div>
          )}

          {section.length > 0 && (
            <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
              <Layers size={11} />
              <span>Sections:</span>
              <span className="font-medium text-foreground/80">
                {section.join(', ')}
              </span>
            </div>
          )}
        </div>

        {/* Footer Contact Pills */}
        {(professor?.officialEmail || professor?.contactNumber) && (
          <div className="mt-4 pt-3 border-t border-border/60 flex flex-wrap gap-2 text-[11px] text-muted-foreground">
            {professor?.officialEmail && (
              <span className="inline-flex items-center gap-1 truncate max-w-[200px]" title={professor.officialEmail}>
                <Mail size={12} className="text-primary/70 shrink-0" />
                <span className="truncate">{professor.officialEmail}</span>
              </span>
            )}
            {professor?.contactNumber && (
              <span className="inline-flex items-center gap-1">
                <Phone size={12} className="text-primary/70 shrink-0" />
                <span>{professor.contactNumber}</span>
              </span>
            )}
          </div>
        )}

        {/* Actions slot for Admin mode */}
        {actions && (
          <div className="mt-4 pt-3 border-t border-border/60 flex flex-wrap gap-2 items-center justify-end">
            {actions}
          </div>
        )}
      </CardContent>
    </Card>
  )

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      className="h-full"
    >
      {clickable && !actions ? (
        <Link to={`/professor/${professor._id}`} className="block h-full">
          {cardInner}
        </Link>
      ) : (
        cardInner
      )}
    </motion.div>
  )
}

export default ProfessorCard
