import { Search } from 'lucide-react'

import { Input } from './ui/input'

function SearchBar({ value, onChange }) {
  return (
    <div className="relative w-full">
      <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-(--ui-muted-text)" size={16} />
      <Input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Search professors here..."
        className="pl-9 bg-(--ui-muted) border-(--ui-border)"
      />
    </div>
  )
}

export default SearchBar
