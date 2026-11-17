import { ArrowUpDown } from 'lucide-react'
import { Select } from './ui/select'
import { cn } from '../lib/utils'

function SortDropdown({ value, onChange, className }) {
  return (
    <div className={cn('relative flex items-center min-w-[170px]', className)}>
      <Select
        value={value}
        onChange={(event) => onChange?.(event.target.value)}
        className="pl-3 pr-8 py-2 text-xs font-medium cursor-pointer"
      >
        <option value="highest-rated">Highest Rated ⭐</option>
        <option value="most-reviewed">Most Reviewed 💬</option>
        <option value="name-asc">Name (A-Z)</option>
      </Select>
    </div>
  )
}

export default SortDropdown
