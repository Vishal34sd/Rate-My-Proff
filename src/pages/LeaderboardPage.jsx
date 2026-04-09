import { Link } from 'react-router-dom'
import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  Tooltip,
} from 'chart.js'
import { Bar } from 'react-chartjs-2'

import { Button } from '../components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { useAppData } from '../lib/app-context'
import { formatScore, getProfessorStats } from '../lib/utils'

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend)

const BAR_COLORS = [
  'rgba(14, 165, 233, 0.85)',
  'rgba(59, 130, 246, 0.85)',
  'rgba(99, 102, 241, 0.85)',
  'rgba(139, 92, 246, 0.85)',
  'rgba(236, 72, 153, 0.85)',
  'rgba(244, 63, 94, 0.85)',
  'rgba(251, 146, 60, 0.85)',
  'rgba(34, 197, 94, 0.85)',
]

const BAR_BORDERS = [
  'rgb(14, 165, 233)',
  'rgb(59, 130, 246)',
  'rgb(99, 102, 241)',
  'rgb(139, 92, 246)',
  'rgb(236, 72, 153)',
  'rgb(244, 63, 94)',
  'rgb(251, 146, 60)',
  'rgb(34, 197, 94)',
]

function toLeaderboardData(professors) {
  return professors.map((professor) => {
    const stats = getProfessorStats(professor)

    return {
      id: professor.id,
      name: professor.name,
      totalReviews: stats.totalReviews,
      averageOverall: stats.averageOverall,
      averageExamChecking: stats.averageExamChecking,
    }
  })
}

function rankData(items, metric, limit = 8) {
  return [...items]
    .sort((a, b) => b[metric] - a[metric])
    .slice(0, limit)
}

function buildChartData(rows, metric, label) {
  return {
    labels: rows.map((row) => row.name),
    datasets: [
      {
        label,
        data: rows.map((row) => row[metric]),
        backgroundColor: rows.map((_, index) => BAR_COLORS[index % BAR_COLORS.length]),
        borderColor: rows.map((_, index) => BAR_BORDERS[index % BAR_BORDERS.length]),
        borderWidth: 2,
        borderRadius: 10,
      },
    ],
  }
}

function buildChartOptions(maxValue, valueFormatter) {
  return {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: (context) => valueFormatter(context.parsed.y),
        },
      },
    },
    scales: {
      x: {
        ticks: {
          color: '#cbd5e1',
          maxRotation: 35,
          minRotation: 20,
        },
        grid: {
          color: 'rgba(148, 163, 184, 0.22)',
        },
      },
      y: {
        beginAtZero: true,
        suggestedMax: maxValue ? Math.ceil(maxValue + 1) : 5,
        ticks: {
          color: '#cbd5e1',
        },
        grid: {
          color: 'rgba(148, 163, 184, 0.22)',
        },
      },
    },
  }
}

function LeaderboardSection({ title, caption, rows, metric, maxValue, valueFormatter }) {
  const data = buildChartData(rows, metric, title)
  const options = buildChartOptions(maxValue, valueFormatter)

  return (
    <Card className="border-(--ui-border)">
      <CardHeader>
        <CardTitle className="text-xl">{title}</CardTitle>
        <p className="text-sm text-(--ui-muted-text)">{caption}</p>
      </CardHeader>
      <CardContent className="space-y-4">
        {rows.length ? (
          <div className="h-72">
            <Bar data={data} options={options} />
          </div>
        ) : (
          <p className="rounded-xl border border-(--ui-border) bg-(--ui-muted) p-3 text-sm text-(--ui-muted-text)">
            No ratings yet. Add some professor reviews to populate the leaderboard.
          </p>
        )}
      </CardContent>
    </Card>
  )
}

function LeaderboardPage() {
  const { professors } = useAppData()
  const leaderboardData = toLeaderboardData(professors)

  const mostReviewed = rankData(leaderboardData, 'totalReviews')
  const highestRated = rankData(leaderboardData, 'averageOverall').filter((row) => row.totalReviews > 0)
  const bestExamChecking = rankData(leaderboardData, 'averageExamChecking').filter((row) => row.totalReviews > 0)

  const maxReviews = mostReviewed.length ? mostReviewed[0].totalReviews : 0
  const maxOverall = highestRated.length ? highestRated[0].averageOverall : 0
  const maxExamChecking = bestExamChecking.length ? bestExamChecking[0].averageExamChecking : 0

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-(--ui-border) bg-(--ui-surface) p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-2xl font-semibold text-(--ui-strong)">Professor Leaderboard</h2>
            <p className="mt-1 text-sm text-(--ui-muted-text)">
              Compare top performers by reviews, overall rating, and exam checking quality.
            </p>
          </div>
          <Link to="/review">
            <Button>Write a Review</Button>
          </Link>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        <LeaderboardSection
          title="Most Reviewed"
          caption="Based on total number of submitted reviews"
          rows={mostReviewed}
          metric="totalReviews"
          maxValue={maxReviews}
          valueFormatter={(value) => `${value} reviews`}
        />

        <LeaderboardSection
          title="Highly Rated Professors"
          caption="Average of teaching, leniency, attendance, and exam checking"
          rows={highestRated}
          metric="averageOverall"
          maxValue={maxOverall}
          valueFormatter={(value) => `${formatScore(value)}/5`}
        />

        <LeaderboardSection
          title="Best Exam Checking"
          caption="Professors with the strongest exam checking scores"
          rows={bestExamChecking}
          metric="averageExamChecking"
          maxValue={maxExamChecking}
          valueFormatter={(value) => `${formatScore(value)}/5`}
        />
      </section>
    </div>
  )
}

export default LeaderboardPage
