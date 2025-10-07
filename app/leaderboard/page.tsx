import { Leaderboard } from './leaderboard'
import { createClient } from '@/lib/supabase/server'

export default async function LeaderboardPage() {
	const supabase = await createClient()
	const scores = (await supabase.from('scores').select()).data
	const evaluations = (await supabase.from('evaluations').select()).data
	return (
		<div>
			<Leaderboard
				initialScores={scores ?? []}
				evaluations={evaluations ?? []}
			/>
		</div>
	)
}
