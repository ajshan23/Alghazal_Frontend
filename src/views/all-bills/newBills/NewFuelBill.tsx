import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import toast from '@/components/ui/toast'
import Notification from '@/components/ui/Notification'
import { addBill, editBill, fetchBillById } from '../api/api'
import FuelBillForm from '../billForms/FuelBillForm'

const defaultBillData = {
    billType: 'fuel',
    billDate: new Date().toISOString().split('T')[0],
    paymentMethod: '',
    amount: 0,
    description: '',
    vehicleNo: '',
    kilometer: 0,
    liter: 0,
    remarks: '',
    attachments: []
}

const NewFuelBill = () => {
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
                    billType: response.data.billType || 'fuel',
                    billDate: response.data.billDate || new Date().toISOString().split('T')[0],
                    paymentMethod: response.data.paymentMethod || '',
                    amount: response.data.amount || 0,
                    description: response.data.description || '',
                    vehicleNo: response.data.vehicle?.vehicleNumber || '',
                    vehicleId: response.data.vehicle?._id||'',

                    kilometer: response.data.kilometer || 0,
                    liter: response.data.liter || 0,
                    remarks: response.data.remarks || '',
                    attachments: response.data.attachments || []
                })
                setError(null)
            } catch (error: any) {
                console.error('Error fetching bill:', error)
                setError(error.message || 'Failed to load bill data')
                toast.push(
                    <Notification
                        title="Failed to fetch bill data"
                        type="danger"
                        duration={2500}
                    >
                        {error.message || 'Something went wrong'}
                    </Notification>,
                    { placement: 'top-center' }
                )
                // Redirect to bills view after showing error
                setTimeout(() => navigate('/app/fuel-bill-view'), 2500)
            } finally {
                setLoading(false)
            }
        }

        fetchData()
    }, [id, navigate])

    const handleFormSubmit = async (
        values: typeof defaultBillData,
        setSubmitting: (isSubmitting: boolean) => void
    ) => {
        try {
            setSubmitting(true)
            const response = id ? await editBill(id, values) : await addBill(values)

            if ([200, 201].includes(response.status)) {
                toast.push(
                    <Notification
                        title={`Successfully ${id ? 'updated' : 'added'} fuel bill`}
                        type="success"
                        duration={2500}
                    >
                        Fuel bill {id ? 'updated' : 'added'} successfully
                    </Notification>,
                    { placement: 'top-center' }
                )
                // Navigate to fuel bill view after successful submission
                navigate('/app/fuel-bill-view')
            } else {
                throw new Error(response?.response?.data?.message || 'Unexpected status code')
            }
        } catch (error: any) {
            console.error('Error during form submission:', error)
            toast.push(
                <Notification
                    title={`Error ${id ? 'updating' : 'adding'} fuel bill`}
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
        if (JSON.stringify(initialData) !== JSON.stringify(defaultBillData)) {
            if (window.confirm('Are you sure you want to discard changes?')) {
                navigate('/app/fuel-bill-view')
            }
        } else {
            navigate('/app/fuel-bill-view')
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
                    title="Error loading fuel bill"
                    type="danger"
                >
                    {error}
                </Notification>
            </div>
        )
    }

    return (
        <FuelBillForm
            type={id ? 'edit' : 'new'}
            initialData={initialData}
            onFormSubmit={handleFormSubmit}
            onDiscard={handleDiscard}
            // Make sure your GenBillForm component is updated to handle fuel-specific fields
        />
    )
}

export default NewFuelBill