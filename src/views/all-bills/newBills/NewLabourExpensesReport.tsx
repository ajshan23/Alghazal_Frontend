import toast from '@/components/ui/toast'
import Notification from '@/components/ui/notification'
import { useNavigate, useParams } from 'react-router-dom'
import { useEffect, useState } from 'react'
import LabourExpensesForm from '../billForms/LabourExpensesForm'
import {  
    editLabourExpensesReport, 
    addLabourExpensesReport, 
    fetchLabourExpensesById 
} from '../api/api'

// Changed to a single expense object instead of an array
const defaultExpenseData = {
    employee: '',
    designation: '',
    country: '',
    basicSalary: 0,
    allowance: 0,
    total: 0,
    twoYearSalary: 0,
    visaExpenses: 0,
    twoYearUniform: 0,
    shoes: 0,
    twoYearAccommodation: 0,
    sewaBills: 0,
    dewaBills: 0,
    insurance: 0,
    transport: 0,
    water: 0,
    thirdPartyLiabilities: 0,
    fairmontCertificate: 0,
    leaveSalary: 0,
    ticket: 0,
    gratuity: 0
}

const NewLabourExpensesReport = () => {
    const navigate = useNavigate()
    const { id } = useParams()
    const [initialData, setInitialData] = useState(defaultExpenseData)
    const [loading, setLoading] = useState(!!id)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        if (!id) {
            setInitialData(defaultExpenseData)
            setLoading(false)
            return
        }

        const fetchData = async () => {
            try {
                setLoading(true)
                const response = await fetchLabourExpensesById(id)

                if (!response?.data) {
                    throw new Error('Invalid labour expenses data received')
                }

                // Get the first expense if it's an array, or use the object directly
                const expenseData = Array.isArray(response.data.expenses) 
                    ? response.data.expenses[0] 
                    : response.data

                // Transform the data
                const transformedData = {
                    ...expenseData,
                    // Ensure all numeric fields are numbers
                    employee: expenseData.employee?._id || '',
                    designation: expenseData.designation || '',
                    country: expenseData.country || '',
                    basicSalary: Number(expenseData.basicSalary) || 0,
                    allowance: Number(expenseData.allowance) || 0,
                    total: Number(expenseData.total) || 0,
                    twoYearSalary: Number(expenseData.twoYearSalary) || 0,
                    visaExpenses: Number(expenseData.visaExpenses) || 0,
                    twoYearUniform: Number(expenseData.twoYearUniform) || 0,
                    shoes: Number(expenseData.shoes) || 0,
                    twoYearAccommodation: Number(expenseData.twoYearAccommodation) || 0,
                    sewaBills: Number(expenseData.sewaBills) || 0,
                    dewaBills: Number(expenseData.dewaBills) || 0,
                    insurance: Number(expenseData.insurance) || 0,
                    transport: Number(expenseData.transport) || 0,
                    water: Number(expenseData.water) || 0,
                    thirdPartyLiabilities: Number(expenseData.thirdPartyLiabilities) || 0,
                    fairmontCertificate: Number(expenseData.fairmontCertificate) || 0,
                    leaveSalary: Number(expenseData.leaveSalary) || 0,
                    ticket: Number(expenseData.ticket) || 0,
                    gratuity: Number(expenseData.gratuity) || 0
                }

                setInitialData(transformedData)
                setError(null)
            } catch (error: any) {
                console.error('Error fetching labour expenses report:', error)
                setError(error.message || 'Failed to load report data')
                toast.push(
                    <Notification
                        title="Failed to fetch labour expenses report data"
                        type="danger"
                        duration={2500}
                    >
                        {error.message || 'Something went wrong'}
                    </Notification>,
                    { placement: 'top-center' }
                )
                setTimeout(() => navigate('/app/labour-expenses-view'), 2500)
            } finally {
                setLoading(false)
            }
        }

        fetchData()
    }, [id, navigate])

    const handleFormSubmit = async (
        formData: any,
        setSubmitting: (isSubmitting: boolean) => void
    ) => {
        try {
            setSubmitting(true)
            
            // Prepare the data to send (now sending the expense object directly)
            const dataToSend = {
                reportType: 'labour-expenses',
                ...formData, 
                basicSalary: Number(formData.basicSalary),
                allowance: Number(formData.allowance),
                total: Number(formData.total),
                twoYearSalary: Number(formData.twoYearSalary),
                visaExpenses: Number(formData.visaExpenses),
                twoYearUniform: Number(formData.twoYearUniform),
                shoes: Number(formData.shoes),
                twoYearAccommodation: Number(formData.twoYearAccommodation),
                sewaBills: Number(formData.sewaBills),
                dewaBills: Number(formData.dewaBills),
                insurance: Number(formData.insurance),
                transport: Number(formData.transport),
                water: Number(formData.water),
                thirdPartyLiabilities: Number(formData.thirdPartyLiabilities),
                fairmontCertificate: Number(formData.fairmontCertificate),
                leaveSalary: Number(formData.leaveSalary),
                ticket: Number(formData.ticket),
                gratuity: Number(formData.gratuity)
            }

            const response = id 
                ? await editLabourExpensesReport(id, dataToSend) 
                : await addLabourExpensesReport(dataToSend)

            if ([200, 201].includes(response.status)) {
                toast.push(
                    <Notification
                        title={`Successfully ${id ? 'updated' : 'added'} labour expenses `}
                        type="success"
                        duration={2500}
                    >
                        Labour expenses {id ? 'updated' : 'added'} successfully
                    </Notification>,
                    { placement: 'top-center' }
                )
                navigate('/app/labour-expenses-report-view')
            } else {
                throw new Error(response?.response?.data?.message || 'Unexpected status code')
            }
        } catch (error: any) {
            console.error('Error during form submission:', error)
            toast.push(
                <Notification
                    title={`Error ${id ? 'updating' : 'adding'} labour expenses report`}
                    type="danger"
                    duration={2500}
                >
                    {error?.response?.data?.message || error.message}
                </Notification>,
                { placement: 'top-center' }
            )
        } finally {
            setSubmitting(false)
        }
    }

    const handleDiscard = () => {
        if (JSON.stringify(initialData) !== JSON.stringify(defaultExpenseData)) {
            if (window.confirm('Are you sure you want to discard changes?')) {
                navigate('/app/labour-expenses-view')
            }
        } else {
            navigate('/app/labour-expenses-view')
        }
    }

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="flex justify-center items-center h-64">
                <Notification
                    title="Error loading labour expenses report"
                    type="danger"
                >
                    {error}
                </Notification>
            </div>
        )
    }

    return (
        <LabourExpensesForm
            type={id ? 'edit' : 'new'}
            initialData={initialData}
            onFormSubmit={handleFormSubmit}
            onDiscard={handleDiscard}
        />
    )
}

export default NewLabourExpensesReport