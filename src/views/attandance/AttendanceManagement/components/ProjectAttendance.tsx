// src/views/AttendanceDashboard/components/ProjectAttendance.tsx
import Card from '@/components/ui/Card'
import Chart from '@/components/shared/Chart'
import Table from '@/components/ui/Table'
import { useState } from 'react'
import { Button } from '@/components/ui'
import { COLORS } from '@/constants/chart.constant'
import { NumericFormat } from 'react-number-format'

interface ProjectAttendanceProps {
    data: {
        projectStats: Array<{
            projectId: string
            projectName: string
            attendanceRate: number
            present: number
            total: number
        }>
    }
}

const { Tr, Th, Td, THead, TBody } = Table

const ProjectAttendance = ({ data }: ProjectAttendanceProps) => {
    const [selectedProject, setSelectedProject] = useState<string | null>(null)
    
    // Prepare data for chart
    const chartData = {
        series: [{
            name: 'Attendance Rate',
            data: data.projectStats.map(project => project.attendanceRate)
        }],
        categories: data.projectStats.map(project => project.projectName)
    }

    return (
        <Card>
            <h4 className="mb-4">Project Attendance</h4>
            
            {/* Project Attendance Chart */}
            <div className="mb-6">
                <Chart
                    series={chartData.series}
                    xAxis={chartData.categories}
                    height="300px"
                    customOptions={{
                        plotOptions: {
                            bar: {
                                borderRadius: 4,
                                horizontal: true,
                            }
                        },
                        colors: [COLORS[0]],
                        yaxis: {
                            labels: {
                                formatter: (value: number) => `${value}%`
                            },
                            min: 0,
                            max: 100
                        },
                        tooltip: {
                            y: {
                                formatter: (value: number) => `${value}%`
                            }
                        }
                    }}
                />
            </div>
            
            {/* Project Attendance Table */}
            <Table>
                <THead>
                    <Tr>
                        <Th>Project</Th>
                        <Th>Present Days</Th>
                        <Th>Total Days</Th>
                        <Th>Attendance Rate</Th>
                        <Th>Actions</Th>
                    </Tr>
                </THead>
                <TBody>
                    {data.projectStats.map((project, index) => (
                        <Tr key={project.projectId}>
                            <Td>{project.projectName}</Td>
                            <Td>{project.present}</Td>
                            <Td>{project.total}</Td>
                            <Td>
                                <NumericFormat
                                    displayType="text"
                                    value={project.attendanceRate}
                                    decimalScale={1}
                                    suffix="%"
                                />
                            </Td>
                            <Td>
                                <Button
                                    size="xs"
                                    variant="solid"
                                    onClick={() => setSelectedProject(project.projectId)}
                                >
                                    Details
                                </Button>
                            </Td>
                        </Tr>
                    ))}
                </TBody>
            </Table>
        </Card>
    )
}

export default ProjectAttendance