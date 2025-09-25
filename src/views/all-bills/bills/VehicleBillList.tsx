import AdaptableCard from '@/components/shared/AdaptableCard'
import BillTable from './components/BillTables'
import BillTableTools from './components/BillTableTools'
import { useState } from 'react'




const FuelBillList = () => {
    const [selectedDropdownMonth, setSelectedDropdownMonth] = useState('')
    const handleDropdownSelect = (value: string) => {
        setSelectedDropdownMonth(value)
    }
    return (
        <AdaptableCard className="h-full" bodyClass="h-full">
            <div className="lg:flex items-center justify-between mb-4">
                <h3 className="mb-4 lg:mb-0">Vehicle Bills {selectedDropdownMonth}</h3>
                <BillTableTools to="/app/new-vehicle-bill" title="Add  Bill" />
            </div>
            <BillTable onDropdownSelect={handleDropdownSelect} />
        </AdaptableCard>
    )
}

export default FuelBillList
