import { FC, useState } from 'react'
import ConfirmDialog from '@/components/shared/ConfirmDialog'
import toast from '@/components/ui/toast'
import Notification from '@/components/ui/Notification'
import { deleteAdibReportAndExpenses, deleteBill, deleteLabourExpensesReport, deletePayrollReport, deleteProjectProfitReport, deleteVisaExpensesReport } from '../../api/api';

type BillType = "general" | "fuel" | "mess" | "vehicle" | "accommodation" | "adib" | "expense" | "profit" | "labour"|"payroll"|"visaExpense";

type DeleteProps = {
    isOpen: boolean
    onClose: () => void
    bill: {
        _id: string
        invoiceNo?: string
        shop?: {
            shopName: string
        }
        vehicle?: {
            vehicleNumber: string
        }
        accommodation?: {
            location: string
        }
        billType: BillType
    } | null
    refetch: () => void
}

const BillDeleteConfirmation: FC<DeleteProps> = ({
    isOpen,
    onClose,
    bill,
    refetch,
    reportType
}) => {
    const [isDeleting, setIsDeleting] = useState(false)


    console.log(reportType,"123 reportType inn BillDeleteConfirmation")
    if (!isOpen || !bill) return null

    const getTitle = () => {
        switch (bill.billType||bill.reportType||reportType) {
            case 'general':
                return `Delete General Bill ${bill.invoiceNo ? `#${bill.invoiceNo}` : ''}`
            case 'fuel':
                return `Delete Fuel Bill`
            case 'mess':
                return `Delete Mess Bill`
            case 'vehicle':
                return `Delete Vehicle Bill ${bill.vehicle?.vehicleNumber ? `(Vehicle ${bill.vehicle.vehicleNumber})` : ''}`
            case 'accommodation':
                return `Delete Accommodation Bill ${bill.accommodation?.location ? `(${bill.accommodation.location})` : ''}`
            case 'adib':
                return `Delete Adib Report`
            case 'expense':
                return `Delete Expense Report`
            case 'profit':
                return `Delete Profit Report`
            case 'labour':
                return `Delete Labour Expenses Report`
            case 'payroll':
                return `Delete Payroll Report`
            case 'visaExpense':
                return `Delete Visa Expense Report`
            default:
                return 'Delete Bill'
        }
    }


    console.log(bill,"123 bill.billType inn BillDeleteConfirmation")
    const getDescription = () => {
        switch (bill.billType||bill.reportType||reportType) {
            case 'general':
                return `Are you sure you want to delete this general bill${bill.invoiceNo ? ` (Invoice #${bill.invoiceNo})` : ''}? This action cannot be undone.`
            case 'fuel':
                return `Are you sure you want to delete this fuel bill? This action cannot be undone.`
            case 'mess':
                return `Are you sure you want to delete this mess bill? This action cannot be undone.`
            case 'vehicle':
                return `Are you sure you want to delete this vehicle bill${bill.vehicle?.vehicleNumber ? ` for vehicle ${bill.vehicle.vehicleNumber}` : ''}? This action cannot be undone.`
            case 'accommodation':
                return `Are you sure you want to delete this accommodation bill${bill.accommodation?.location ? ` for ${bill.accommodation.location}` : ''}? This action cannot be undone.`
            case 'adib':
                return `Are you sure you want to delete this adib report? This action cannot be undone.`
            case 'expense':
                return `Are you sure you want to delete this expense report? This action cannot be undone.`
            case 'profit':
                return `Are you sure you want to delete this profit report? This action cannot be undone.`
            case 'labour':
                return `Are you sure you want to delete this labour expenses report? This action cannot be undone.`
            case 'payroll':
                return `Are you sure you want to delete this payroll report? This action cannot be undone.`
            case 'visaExpense':
                return `Are you sure you want to delete this visa expense report? This action cannot be undone.`
            default:
                return 'Are you sure you want to delete this bill? This action cannot be undone.'
        }
    }

    const handleDelete = async () => {
        setIsDeleting(true)
        try {
            await bill.billType ? deleteBill(bill._id) : reportType === 'profit' ? deleteProjectProfitReport(bill._id) : reportType === 'labour' ? deleteLabourExpensesReport(bill._id) : reportType === 'payroll' ? deletePayrollReport(bill._id) : reportType === 'visaExpense' ? deleteVisaExpensesReport(bill._id) : deleteAdibReportAndExpenses(bill._id)
            refetch()
            toast.push(
                <Notification
                    title={`${getTitle()} deleted successfully`}
                    type="success"
                    duration={2500}
                >
                   {bill.billType ? "The bill has been successfully deleted." : "The report has been successfully deleted."}
                </Notification>,
                { placement: 'top-center' }
            )
            onClose()
        } catch (error: any) {
            console.error('Delete failed:', error)
            toast.push(
                <Notification
                    title={`Failed to delete ${getTitle()}`}
                    type="danger"
                    duration={2500}
                >
                    {error?.response?.data?.message || error.message || 'Something went wrong'}
                </Notification>,
                { placement: 'top-center' }
            )
        } finally {
            setIsDeleting(false)
        }
    }

    return (
        <ConfirmDialog
            isOpen={isOpen}
            type="danger"
            title={getTitle()}
            confirmButtonColor="red-600"
            onClose={onClose}
            onRequestClose={onClose}
            onCancel={onClose}
            onConfirm={handleDelete}
            confirmButtonDisabled={isDeleting}
        >
            <p>{getDescription()}</p>
            {isDeleting && (
                <div className="mt-4 flex justify-center">
                    <div className="w-6 h-6 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
            )}
        </ConfirmDialog>
    )
}

export default BillDeleteConfirmation