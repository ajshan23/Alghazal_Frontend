import Card from '@/components/ui/Card'
import Segment from '@/components/ui/Segment'
import Badge from '@/components/ui/Badge'
import Loading from '@/components/shared/Loading'
import Chart from '@/components/shared/Chart'
import { COLORS } from '@/constants/chart.constant'
import isEmpty from 'lodash/isEmpty'

type ProjectOverviewChart = {
    onGoing: number
    finished: number
    total: number
    series: {
        name: string
        data: number[]
    }[]
    range: string[]
}

type TaskOverviewProps = {
    data?: {
        chart?: Record<string, ProjectOverviewChart>
    }
    className?: string
    timeRange?: string
    onTimeRangeChange?: (range: string) => void
    loading?: boolean
}

type ChartLegendProps = {
    label: string
    value: number
    badgeClass?: string
    showBadge?: boolean
}

const ChartLegend = ({
    label,
    value,
    badgeClass,
    showBadge = true,
}: ChartLegendProps) => {
    return (
        <div className="flex gap-2">
            {showBadge && <Badge className="mt-2.5" innerClass={badgeClass} />}
            <div>
                <h5 className="font-bold">{value}</h5>
                <p>{label}</p>
            </div>
        </div>
    )
}

const TaskOverview = ({ 
    data = {}, 
    className, 
    timeRange = 'weekly',
    onTimeRangeChange,
    loading = false
}: TaskOverviewProps) => {
    const handleTimeRangeChange = (newRange: string[]) => {
        if (onTimeRangeChange && newRange.length > 0) {
            onTimeRangeChange(newRange[0])
        }
    }

    return (
        <Card className={className}>
            <div className="flex sm:flex-row flex-col md:items-center justify-between mb-6 gap-4">
                <h4>Task Overview</h4>
                <Segment
                    value={[timeRange]}
                    size="sm"
                    onChange={handleTimeRangeChange}
                >
                    <Segment.Item value="monthly">Monthly</Segment.Item>
                    <Segment.Item value="weekly">Weekly</Segment.Item>
                    <Segment.Item value="daily">Daily</Segment.Item>
                </Segment>
            </div>
            {!isEmpty(data) && !loading && data.chart && data.chart[timeRange] && (
                <>
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <ChartLegend
                                showBadge={false}
                                label="Total Tasks"
                                value={data.chart[timeRange].total}
                            />
                        </div>
                        <div className="flex gap-x-6">
                            <ChartLegend
                                badgeClass="bg-indigo-600"
                                label={data.chart[timeRange].series[0].name}
                                value={data.chart[timeRange].onGoing}
                            />
                            <ChartLegend
                                badgeClass="bg-emerald-500"
                                label={data.chart[timeRange].series[1].name}
                                value={data.chart[timeRange].finished}
                            />
                        </div>
                    </div>
                    <div>
                        <Chart
                            series={data.chart[timeRange].series}
                            xAxis={data.chart[timeRange].range}
                            type="bar"
                            customOptions={{
                                colors: [COLORS[0], COLORS[2]],
                                legend: { show: false },
                            }}
                        />
                    </div>
                </>
            )}
            <Loading loading={loading} type="cover">
                {loading && <div className="h-[300px]" />}
            </Loading>
        </Card>
    )
}

export default TaskOverview