import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import { useNavigate } from 'react-router-dom'
import ListItem, { ListItemData } from '../../ProjectList/components/ListItem'
import { Segment } from '@/components/ui'
import { useEffect, useState } from 'react'
import { getMonthlyReports, getYearlyReports } from '@/views/all-bills/api/api'
import { HiOutlineDownload, HiOutlineRefresh } from 'react-icons/hi'
import { FiFilter } from 'react-icons/fi'

type ProjectsProps = {
    data?: ListItemData[]
}

const months = [
    { value: 1, label: 'January' },
    { value: 2, label: 'February' },
    { value: 3, label: 'March' },
    { value: 4, label: 'April' },
    { value: 5, label: 'May' },
    { value: 6, label: 'June' },
    { value: 7, label: 'July' },
    { value: 8, label: 'August' },
    { value: 9, label: 'September' },
    { value: 10, label: 'October' },
    { value: 11, label: 'November' },
    { value: 12, label: 'December' },
]

// Generate Years For Dropdown
const generateYears = () => {
    const currentYear = new Date().getFullYear()
    return Array.from({ length: 10 }, (_, i) => ({
        value: currentYear - i,
        label: (currentYear - i).toString(),
    }))
}

const Projects = ({ data = [] }: ProjectsProps) => {
    const [timeRange, setTimeRange] = useState(['monthly'])
    const [month, setMonth] = useState(new Date().getMonth() + 1)
    const [year, setYear] = useState(new Date().getFullYear())
  


    const onDropdownSelect = (label: string) => {
        console.log('Selected month label:', label)
    }

    const handleResetAll = () => {
        setMonth(new Date().getMonth() + 1)
        setYear(new Date().getFullYear())
    }

 

    const handleDownload = async (range: 'monthly' | 'yearly') => {
        try {
            let response
    
            if (range === 'monthly') {
                response = await getMonthlyReports({ year, month })
            } else {
                response = await getYearlyReports({ year })
            }
    
            const blob = new Blob([response.data], {
                type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            })
    
            const url = window.URL.createObjectURL(blob)
            const link = document.createElement('a')
    
            link.href = url
            link.download =
                range === 'monthly'
                    ? `monthly_report_${year}_${month}.xlsx`
                    : `yearly_report_${year}.xlsx`
    
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)
    
            console.log('Report downloaded successfully')
        } catch (error) {
            console.error('Download failed:', error)
        }
    }
    
    
    

    return (
        <Card>
            <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
                <h4>
                    {timeRange[0] === 'monthly' ? 'Monthly' : 'Yearly'} Reports
                </h4>

                <Segment
                    value={timeRange}
                    size="sm"
                    onChange={(val: string | string[]) =>
                        setTimeRange(val as string[])
                    }
                >
                    <Segment.Item value="monthly">Monthly</Segment.Item>
                    <Segment.Item value="yearly">Yearly</Segment.Item>
                </Segment>

                <div className="flex flex-wrap gap-2 items-center w-full md:w-auto">
                    {timeRange[0] === 'monthly' && (
                        <select
                            className="p-2 border rounded-md dark:bg-gray-800 dark:border-gray-700"
                            value={month}
                            onChange={(e) => {
                                const selectedValue = Number(e.target.value)
                                const selectedLabel =
                                    months.find((m) => m.value === selectedValue)?.label || ''
                                setMonth(selectedValue)
                                onDropdownSelect(selectedLabel)
                            }}
                        >
                            {months.map((m) => (
                                <option key={m.value} value={m.value}>
                                    {m.label}
                                </option>
                            ))}
                        </select>
                    )}

                    <select
                        className="p-2 border rounded-md dark:bg-gray-800 dark:border-gray-700"
                        value={year}
                        onChange={(e) => setYear(Number(e.target.value))}
                    >
                        {generateYears().map((y) => (
                            <option key={y.value} value={y.value}>
                                {y.label}
                            </option>
                        ))}
                    </select>

                    <button
                        onClick={handleResetAll}
                        className="p-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                        title="Reset filters"
                    >
                        <HiOutlineRefresh size={18} />
                    </button>


              
                </div>
            </div>

            <ListItem range={timeRange[0]} onDownload={handleDownload} />
            </Card>
    )
}

export default Projects
