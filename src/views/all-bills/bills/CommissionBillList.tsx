import AdaptableCard from '@/components/shared/AdaptableCard'
import { useState } from 'react'
import BillTableTools from './components/BillTableTools'
import BillTable from './components/BillTables'

const CommissionBillList = () => {
    const [selectedDropdownMonth, setSelectedDropdownMonth] = useState('')

    const handleDropdownSelect = (value: string) => {
        setSelectedDropdownMonth(value)
    }
    
    return (
        <AdaptableCard className="h-full" bodyClass="h-full">
            <div className="lg:flex items-center justify-between mb-4">
                <h3 className="mb-4 lg:mb-0">Commission Bills {selectedDropdownMonth}</h3>
                <BillTableTools to="/app/new-commission-bill" title="Add Commission Bill" />
            </div>
            <BillTable onDropdownSelect={handleDropdownSelect} />
        </AdaptableCard>
    )
}

export default CommissionBillList