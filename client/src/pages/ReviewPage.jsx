import ReviewForm from '../components/ReviewForm'
import { useAppData } from '../lib/app-context'

function ReviewPage() {
  const { professors, addReview } = useAppData()

  return (
    <div>
      <div className="mx-auto max-w-3xl">
        <ReviewForm professors={professors} onSubmit={addReview} />
      </div>
    </div>
  )
}

export default ReviewPage
