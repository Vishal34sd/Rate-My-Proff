import { Select } from './ui/select'

function SortDropdown({ value, onChange }) {
  return (
    <Select value={value} onChange={(event) => onChange(event.target.value)}>
      <option value="highest-rated">Highest rated</option>
      <option value="most-reviewed">Most reviewed</option>
      <option value="name-asc">Name A-Z</option>
    </Select>
  )
}

export default SortDropdown
