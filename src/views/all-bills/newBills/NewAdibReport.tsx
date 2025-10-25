import toast from '@/components/ui/toast'
import Notification from '@/components/ui/Notification'
import { useNavigate, useParams } from 'react-router-dom'
import { useEffect, useState } from 'react'
import AdibReportForm from '../billForms/AdibReportForm'
import { addAdibReportAndExpenses, editAdibReportAndExpenses, fetchAdibReportAndExpensesById } from '../api/api'

const defaultReportData = {
    reportDate: new Date().toISOString().split('T')[0], // Default to today's date
    amount: '',
    category: '',
    shop: '',
    remarks: '',
    attachments: []
}

const NewAadibReport = () => {
    const navigate = useNavigate()
    const { id } = useParams()
    const [initialData, setInitialData] = useState(defaultReportData)
    const [loading, setLoading] = useState(!!id)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        if (!id) {
            setInitialData(defaultReportData)
            setLoading(false)
            return
        }

        const fetchData = async () => {
            try {
                setLoading(true)
                const response = await fetchAdibReportAndExpensesById(id)

                if (!response?.data) {
                    throw new Error('Invalid report data received')
                }

                setInitialData({
                    reportDate: response.data.reportDate || defaultReportData.reportDate,
                    amount: response.data.amount || '',
                    category: response.data.category?._id || response.data.category || '',
                    shop: response.data.shop?._id || response.data.shop || '',
                    remarks: response.data.remarks || '',
                    attachments: response.data.attachments || []
                })
                setError(null)
            } catch (error: any) {
                console.error('Error fetching report:', error)
                setError(error.message || 'Failed to load report data')
                toast.push(
                    <Notification
                        title="Failed to fetch Aadib report data"
                        type="danger"
                        duration={2500}
                    >
                        {error.message || 'Something went wrong'}
                    </Notification>,
                    { placement: 'top-center' }
                )
                setTimeout(() => navigate('/app/aadib-report-view'), 2500)
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
            
            const formDataToSend = new FormData()
            
            // Add the reportType to the form data
            formDataToSend.append('reportType', 'adib')
            
            // Append all other form fields
            Object.keys(formData).forEach(key => {
                if (key !== 'attachments') {
                    formDataToSend.append(key, formData[key])
                }
            })
            
            // Handle attachments
            if (formData.attachments && formData.attachments.length > 0) {
                formData.attachments.forEach((file: File, index: number) => {
                    if (file instanceof File) {
                        formDataToSend.append(`attachments`, file)
                    }
                })
            }
            
            // Format reportDate if it's a Date object
            if (formData.reportDate instanceof Date) {
                formDataToSend.set('reportDate', formData.reportDate.toISOString())
            }

            const response = id 
                ? await editAdibReportAndExpenses(id, formDataToSend) 
                : await addAdibReportAndExpenses(formDataToSend)

            if ([200, 201].includes(response.status)) {
                toast.push(
                    <Notification
                        title={`Successfully ${id ? 'updated' : 'added'} Aadib report`}
                        type="success"
                        duration={2500}
                    >
                        Aadib report {id ? 'updated' : 'added'} successfully
                    </Notification>,
                    { placement: 'top-center' }
                )
                navigate('/app/adib-report-view')
            } else {
                throw new Error(response?.response?.data?.message || 'Unexpected status code')
            }
        } catch (error: any) {
            console.error('Error during form submission:', error)
            toast.push(
                <Notification
                    title={`Error ${id ? 'updating' : 'adding'} Aadib report`}
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
        if (JSON.stringify(initialData) !== JSON.stringify(defaultReportData)) {
            if (window.confirm('Are you sure you want to discard changes?')) {
                navigate('/app/aadib-report-view')
            }
        } else {
            navigate('/app/aadib-report-view')
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
                    title="Error loading Aadib report"
                    type="danger"
                >
                    {error}
                </Notification>
            </div>
        )
    }

    return (
        <AdibReportForm
            type={id ? 'edit' : 'new'}
            initialData={initialData}
            onFormSubmit={handleFormSubmit}
            onDiscard={handleDiscard}
        />
    )
}

export default NewAadibReport