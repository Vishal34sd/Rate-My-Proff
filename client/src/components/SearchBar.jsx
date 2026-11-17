import { Search, X } from 'lucide-react'
import { cn } from '../lib/utils'

function SearchBar({
  value = '',
  onChange,
  placeholder = 'Search by professor name, subject, or department...',
  className,
}) {
  return (
    <div className={cn('relative w-full group', className)}>
      <Search
        className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-primary"
        size={18}
      />
      <input
        type="text"
        value={value}
        onChange={(event) => onChange?.(event.target.value)}
        placeholder={placeholder}
        className="flex h-11 w-full rounded-xl border border-border/80 bg-card/90 pl-10 pr-9 py-2 text-sm text-foreground shadow-xs placeholder:text-muted-foreground/60 transition-all duration-200 focus-visible:outline-none focus-visible:border-primary focus-visible:ring-3 focus-visible:ring-primary/20"
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange?.('')}
          className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer"
          aria-label="Clear search"
        >
          <X size={14} />
        </button>
      )}
    </div>
  )
}

export default SearchBar
