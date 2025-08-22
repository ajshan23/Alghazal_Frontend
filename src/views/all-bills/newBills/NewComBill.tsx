import toast from '@/components/ui/toast'
import Notification from '@/components/ui/Notification'
import { useNavigate, useParams } from 'react-router-dom'
import { useEffect, useState } from 'react'
import CommissionBillForm from '../billForms/CommissionBillForm'
import { addBill, editBill, fetchBillById } from '../api/api'

const defaultBillData = {
    billType: 'commission',
    billDate: new Date().toISOString().split('T')[0], // Default to today's date
    amount: ''
}

const NewCommissionBill = () => {
    const navigate = useNavigate()
    const { id } = useParams()
    const [initialData, setInitialData] = useState(defaultBillData)
    const [loading, setLoading] = useState(!!id)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        if (!id) {
            // If no ID, reset to default data for new bill
            setInitialData(defaultBillData)
            setLoading(false)
            return
        }

        const fetchData = async () => {
            try {
                setLoading(true)
                const response = await fetchBillById(id)

                if (!response?.data) {
                    throw new Error('Invalid bill data received')
                }

                setInitialData({
                    billType: response.data.billType || 'commission',
                    billDate: response.data.billDate || defaultBillData.billDate,
                    amount: response.data.amount || ''
                })
                setError(null)
            } catch (error: any) {
                console.error('Error fetching bill:', error)
                setError(error.message || 'Failed to load bill data')
                toast.push(
                    <Notification
                        title="Failed to fetch commission data"
                        type="danger"
                        duration={2500}
                    >
                        {error.message || 'Something went wrong'}
                    </Notification>,
                    { placement: 'top-center' }
                )
                // Redirect to commission view after showing error
                setTimeout(() => navigate('/app/commission-bill-view'), 2500)
            } finally {
                setLoading(false)
            }
        }

        fetchData()
    }, [id, navigate])

    const handleFormSubmit = async (
        formData: FormData,
        setSubmitting: (isSubmitting: boolean) => void
    ) => {
        try {
            setSubmitting(true)
            const response = id ? await editBill(id, formData) : await addBill(formData)

            if ([200, 201].includes(response.status)) {
                toast.push(
                    <Notification
                        title={`Successfully ${id ? 'updated' : 'added'} commission bill`}
                        type="success"
                        duration={2500}
                    >
                        Commission bill {id ? 'updated' : 'added'} successfully
                    </Notification>,
                    { placement: 'top-center' }
                )
                // Navigate to commission bill view after successful submission
                navigate('/app/commission-bill-view')
            } else {
                throw new Error(response?.response?.data?.message || 'Unexpected status code')
            }
        } catch (error: any) {
            console.error('Error during form submission:', error)
            toast.push(
                <Notification
                    title={`Error ${id ? 'updating' : 'adding'} commission bill`}
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
        // Confirm before discarding changes
        if (JSON.stringify(initialData) !== JSON.stringify(defaultBillData)) {
            if (window.confirm('Are you sure you want to discard changes?')) {
                navigate('/app/commission-bill-view')
            }
        } else {
            navigate('/app/commission-bill-view')
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
                    title="Error loading commission"
                    type="danger"
                >
                    {error}
                </Notification>
            </div>
        )
    }

    return (
        <CommissionBillForm
            type={id ? 'edit' : 'new'}
            initialData={initialData}
            onFormSubmit={handleFormSubmit}
            onDiscard={handleDiscard}
        />
    )
}

export default NewCommissionBill