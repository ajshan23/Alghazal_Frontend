import AdaptableCard from '@/components/shared/AdaptableCard'
import { useState } from 'react'
import ReportTables from './components/ReportTables'
import BillTableTools from './components/BillTableTools'

const LabourExpensesReport = () => {
    const [selectedDropdownMonth, setSelectedDropdownMonth] = useState('')

    const handleDropdownSelect = (value: string) => {
        setSelectedDropdownMonth(value)
    }

    return (
        <AdaptableCard className="h-full" bodyClass="h-full">
            <div className="lg:flex items-center justify-between mb-4">
                <h3 className="mb-4 lg:mb-0">Labour Expenses Report {selectedDropdownMonth}</h3>
                <BillTableTools 
                    to="/app/new-labour-expenses-report" 
                    title="Add Report" 
                />
            </div>
            <ReportTables   onDropdownSelect={handleDropdownSelect}  />
        </AdaptableCard>    
    )
}

export default LabourExpensesReport