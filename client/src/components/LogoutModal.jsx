import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { LogOut, X } from 'lucide-react'
import { Button } from './ui/button'

export default function LogoutModal({ isOpen, onClose, onConfirm }) {
  if (!isOpen) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/60 backdrop-blur-xs cursor-pointer"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 12 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className="relative z-10 w-full max-w-sm rounded-3xl border border-border/80 bg-card p-6 shadow-2xl space-y-4"
        >
          {/* Top Close Button */}
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 flex h-8 w-8 items-center justify-center rounded-xl text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer"
            aria-label="Close dialog"
          >
            <X size={16} />
          </button>

          <div className="flex items-center gap-3.5">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
              <LogOut size={22} />
            </div>
            <div>
              <h3 className="text-base font-bold text-foreground">Confirm Logout</h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Are you sure you want to log out?
              </p>
            </div>
          </div>

          <p className="text-xs text-muted-foreground leading-relaxed">
            You will be logged out of your session. You can sign back in anytime using your institutional credentials.
          </p>

          {/* Yes / No Actions */}
          <div className="flex items-center justify-end gap-2.5 pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              className="flex-1 font-semibold"
            >
              No, Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={onConfirm}
              className="flex-1 font-semibold gap-1.5 shadow-sm"
            >
              <LogOut size={14} />
              Yes, Log Out
            </Button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
