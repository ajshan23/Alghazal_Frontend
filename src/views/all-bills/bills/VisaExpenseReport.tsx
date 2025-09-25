import AdaptableCard from '@/components/shared/AdaptableCard'
import BillTableTools from './components/BillTableTools'
import ReportTables from './components/ReportTables'




const VisaExpenseReport = () => {

    return (
        <AdaptableCard className="h-full" bodyClass="h-full">
            <div className="lg:flex items-center justify-between mb-4">
                <h3 className="mb-4 lg:mb-0">Visa Expense Report</h3>
                <BillTableTools to="/app/new-visa-expense-report" title="Add Expense" />
            </div>
            <ReportTables onDropdownSelect={() => { }} />
        </AdaptableCard>
    )
}

export default VisaExpenseReport
