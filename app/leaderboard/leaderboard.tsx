'use client'
import { ChangeEvent, useState } from 'react'
import { Tables } from '@/lib/supabase/database.types'
import { calculateAverage } from '@/lib/utils'
import Form from 'react-bootstrap/Form'
import dynamic from 'next/dynamic'
import 'datatables.net-dt/css/dataTables.dataTables.css'

const categoryOptions = [
	{ value: 'Nutrition', label: 'Nutrition' },
	{ value: 'Weeds', label: 'Weeds' },
	{ value: 'Pests_and_Pest_management', label: 'Pests' },
	{ value: 'Climate_and_Weather_risk', label: 'Weather' },
	{ value: 'Sustainability', label: 'Sustainability' },
	{ value: 'Water', label: 'Water' },
	{ value: 'Crop_management_decisions', label: 'Crop Management' }
]

const DataTable = dynamic(
	async () => {
		const dtReact = import('datatables.net-react')
		const dtNet = import('datatables.net-dt')

		const [reactMod, dtNetMod] = await Promise.all([dtReact, dtNet])

		reactMod.default.use(dtNetMod.default)
		return reactMod.default
	},
	{ ssr: false }
)

interface LeaderboardProps {
	initialScores: Tables<'scores'>[] // Replace 'any[]' with the actual type if known
	evaluations: Tables<'evaluations'>[] // Replace 'any[]' with the actual type if known
}

function getDataFromScores(scores: Tables<'scores'>[], evaluations: Tables<'evaluations'>[]) {
	const data: string[][] = []
	const groupedScores = Object.groupBy(scores, (item) => item.evaluation_id)
	const groupedEvaluations = Object.groupBy(evaluations, (item) => item.id)

	for (const evaluationId in groupedScores) {
		const evaluationGroup = groupedEvaluations[evaluationId]
		const evaluationScores = groupedScores[evaluationId]

		if (!evaluationGroup || !evaluationScores || evaluationGroup.length === 0) continue

		const evaluation = evaluationGroup[0]
		const accuracy: number[] = []
		const completeness: number[] = []
		const conciseness: number[] = []
		const relevance: number[] = []

		if (evaluationScores) {
			evaluationScores.forEach((score) => {
				accuracy.push(score.accuracy)
				completeness.push(score.completeness)
				conciseness.push(score.conciseness)
				relevance.push(score.relevance)
			})
		}

		if (accuracy.length > 0) {
			data.push([
				evaluation.subject_model,
				calculateAverage(accuracy).toFixed(2),
				calculateAverage(completeness).toFixed(2),
				calculateAverage(conciseness).toFixed(2),
				calculateAverage(relevance).toFixed(2)
			])
		}
	}

	return data
}

export function Leaderboard({ initialScores, evaluations }: LeaderboardProps) {
	const [data, setData] = useState<string[][]>(getDataFromScores(initialScores, evaluations))
	const [selectedCategories, setSelectedCategories] = useState<string[]>(
		categoryOptions.map((option) => option.value)
	)

	async function handleCheckChange(
		e: ChangeEvent<HTMLInputElement>,
		option: { value: string; label?: string }
	) {
		const newSelectedCategories = e.target.checked
			? [...selectedCategories, option.value]
			: selectedCategories.filter((cat) => cat !== option.value)

		setSelectedCategories(newSelectedCategories)

		const newData = getDataFromScores(
			initialScores.filter((score) => {
				return score.categories.some((cat) => newSelectedCategories.includes(cat))
			}),
			evaluations
		)

		setData(newData)
	}

	function isOnlyCheckmark(option: { value: string; label?: string }) {
		return selectedCategories.length === 1 && selectedCategories[0] === option.value
	}

	return (
		<div
			className='h-full d-flex flex-column'
			style={{
				backgroundColor: '#D3CDC6',
				color: '#171717',
				borderRadius: '8px'
			}}>
			<span style={{ fontSize: '50px', color: 'red' }}>!!!Dummy Data!!!</span>

			<Form
				style={{ paddingTop: '4px', paddingBottom: '0' }}
				className='pl-2 d-flex flex-row'>
				{categoryOptions.map((option) => {
					return (
						<Form.Check
							disabled={isOnlyCheckmark(option)}
							className='pr-3'
							onChange={(e) => {
								handleCheckChange(e, option)
							}}
							style={{
								color: '#171717'
							}}
							key={option.value}
							defaultChecked={true}
							label={option.label}
							name={option.label}
							id={`lb-${option.value}`}
						/>
					)
				})}
			</Form>

			<style>
			</style>
			
			<DataTable
				data={data}
				options={{ searching: false, paging: false, info: false, ordering: true }}>
				<thead>
					<tr>
						<th>Subject Model</th>
						<th>Accuracy</th>
						<th>Completeness</th>
						<th>Conciseness</th>
						<th>Relevance</th>
					</tr>
				</thead>
			</DataTable>
		</div>
	)
}
