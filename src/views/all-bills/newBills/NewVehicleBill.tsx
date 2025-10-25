import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import toast from '@/components/ui/toast'
import Notification from '@/components/ui/Notification'
import { addBill, editBill, fetchBillById } from '../api/api'
import VehicleBillForm from '../billForms/VehicleBillForm'

interface Vehicle {
    _id: string
    vehicleNumber: string
    make: string
    model: string
}

interface Shop {
    _id: string
    shopName: string
    shopNo: string
}

interface BillData {
    billType: string
    billDate: string
    purpose: string
    vehicles: Vehicle[]
    invoiceNo: string
    paymentMethod: string
    amount: number
    shop: Shop
    remarks: string
    attachments: any[]
}

const defaultBillData: BillData = {
    billType: 'vehicle',
    billDate: new Date().toISOString().split('T')[0],
    purpose: '',
    vehicles: [],
    invoiceNo: '',
    paymentMethod: '',
    amount: 0,
    shop: {
        _id: '',
        shopName: '',
        shopNo: ''
    },
    remarks: '',
    attachments: []
}

const NewVehicleBill = () => {
    const navigate = useNavigate()
    const { id } = useParams()
    const [initialData, setInitialData] = useState<BillData>(defaultBillData)
    const [loading, setLoading] = useState(!!id)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        if (!id) {
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

                const { data } = response
                
                setInitialData({
                    billType: data.billType || 'vehicle',
                    billDate: data.billDate ? data.billDate.split('T')[0] : new Date().toISOString().split('T')[0],
                    purpose: data.purpose || '',
                    vehicles: data.vehicles || [],
                    invoiceNo: data.invoiceNo || '',
                    paymentMethod: data.paymentMethod || '',
                    amount: data.amount || 0,
                    shop: data.shop || {
                        _id: '',
                        shopName: '',
                        shopNo: ''
                    },
                    remarks: data.remarks || '',
                    attachments: data.attachments || []
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
                setTimeout(() => navigate('/app/vehicle-bill-view'), 2500)
            } finally {
                setLoading(false)
            }
        }

        fetchData()
    }, [id, navigate])

    const handleFormSubmit = async (
        values: BillData,
        setSubmitting: (isSubmitting: boolean) => void
    ) => {
        try {
            setSubmitting(true)
            const response = id ? await editBill(id, values) : await addBill(values)

            if ([200, 201].includes(response.status)) {
                toast.push(
                    <Notification
                        title={`Successfully ${id ? 'updated' : 'added'} vehicle bill`}
                        type="success"
                        duration={2500}
                    >
                        Vehicle bill {id ? 'updated' : 'added'} successfully
                    </Notification>,
                    { placement: 'top-center' }
                )
                navigate('/app/vehicle-bill-view')
            } else {
                throw new Error(response?.response?.data?.message || 'Unexpected status code')
            }
        } catch (error: any) {
            console.error('Error during form submission:', error)
            toast.push(
                <Notification
                    title={`Error ${id ? 'updating' : 'adding'} vehicle bill`}
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
                navigate('/app/vehicle-bill-view')
            }
        } else {
            navigate('/app/vehicle-bill-view')
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
                    title="Error loading vehicle bill"
                    type="danger"
                >
                    {error}
                </Notification>
            </div>
        )
    }

    return (
        <VehicleBillForm
            type={id ? 'edit' : 'new'}
            initialData={initialData}
            onFormSubmit={handleFormSubmit}
            onDiscard={handleDiscard}
        />
    )
}

export default NewVehicleBill