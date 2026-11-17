import { GraduationCap, Heart, Shield, Sparkles } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="mt-20 border-t border-border/80 bg-card/60 backdrop-blur-sm">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Info */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-xl bg-gradient-to-tr from-orange-500 to-amber-500 flex items-center justify-center text-white shadow-sm">
                <GraduationCap size={18} />
              </div>
              <span className="text-base font-bold text-foreground">Rate My Proff</span>
            </div>
            <p className="text-xs text-muted-foreground max-w-sm leading-relaxed">
              An independent, transparent student-run academic feedback platform designed to help KIET students make informed decisions, understand faculty teaching styles, and prepare for semesters.
            </p>
            <div className="flex items-center gap-2 text-[11px] text-muted-foreground pt-1">
              <Shield size={13} className="text-emerald-500" />
              <span>100% Anonymous & Secure Student Reviews</span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-foreground">
              Quick Links
            </h4>
            <ul className="space-y-2 text-xs text-muted-foreground">
              <li>
                <Link to="/" className="hover:text-primary transition-colors">
                  Home & Overview
                </Link>
              </li>
              <li>
                <Link to="/login" className="hover:text-primary transition-colors">
                  Student Login
                </Link>
              </li>
              <li>
                <Link to="/register" className="hover:text-primary transition-colors">
                  Create Student Account
                </Link>
              </li>
              <li>
                <Link to="/student/reviews/new" className="hover:text-primary transition-colors">
                  Write Anonymous Review
                </Link>
              </li>
            </ul>
          </div>

          {/* Guidelines */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-foreground">
              Community & Safety
            </h4>
            <p className="text-xs text-muted-foreground leading-relaxed">
              We uphold academic integrity. Reviews should be constructive and focus on teaching methodologies, clarity, and subject depth.
            </p>
            <div className="rounded-xl bg-primary/10 border border-primary/20 p-2.5 text-[11px] text-primary">
              <span className="font-semibold">KIET Portal:</span> Only verified @kiet.edu student emails can participate.
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-8 pt-6 border-t border-border/60 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-foreground">
          <p>© {new Date().getFullYear()} Rate My Proff KIET. All rights reserved.</p>
          <p className="flex items-center gap-1">
            Built with transparency for the student community <Sparkles size={12} className="text-amber-500" />
          </p>
        </div>
      </div>
    </footer>
  )
}

