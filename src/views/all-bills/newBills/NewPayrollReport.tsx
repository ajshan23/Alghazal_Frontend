import toast from '@/components/ui/toast'
import Notification from '@/components/ui/notification'
import { useNavigate, useParams } from 'react-router-dom'
import { useEffect, useState } from 'react'
import {
    addPayrollReport,
    editPayrollReport,
    fetchPayrollReportById,
} from '../api/api'
import PayrollForm from '../billForms/PayrollForm'

const defaultReportData = {
    name: '',
    labourCard: '',
    labourCardPersonalNo: '',
    period: '',
    allowance: '',
    deduction: '',
    mess: '',
    advance: '',
    net: '',
    remark: '',
}

const NewPayrollReport = () => {
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
                const response = await fetchPayrollReportById(id)

                if (!response?.data) {
                    throw new Error('Invalid payroll data received')
                }

                // Extract only the fields we need
                const {
                    employee,
                    labourCard,
                    labourCardPersonalNo,
                    period,
                    allowance,
                    deduction,
                    mess,
                    advance,
                    net,
                    remark,
                } = response.data

                setInitialData({
                    employee: employee?._id || '',
                    labourCard: labourCard || '',
                    labourCardPersonalNo: labourCardPersonalNo || '',
                    period: period || '',
                    allowance: allowance || '',
                    deduction: deduction || '',
                    mess: mess || '',
                    advance: advance || '',
                    net: net || '',
                    remark: remark || '',
                })
                setError(null)
            } catch (error: any) {
                console.error('Error fetching payroll report:', error)
                setError(error.message || 'Failed to load payroll data')
                toast.push(
                    <Notification
                        title="Failed to fetch payroll report data"
                        type="danger"
                        duration={2500}
                    >
                        {error.message || 'Something went wrong'}
                    </Notification>,
                    { placement: 'top-center' },
                )
                setTimeout(() => navigate('/app/payroll-view'), 2500)
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
            setSubmitting(true);
            
            // Prepare the clean data object
            const payload = {
                employee: formData.employee, // This is the _id
                labourCard: formData.labourCard,
                labourCardPersonalNo: formData.labourCardPersonalNo,
                period: formData.period,
                allowance: formData.allowance,
                deduction: formData.deduction,
                mess: formData.mess,
                advance: formData.advance,
                net: formData.net,
                remark: formData.remark,
                // Add any date formatting if needed:
                // reportDate: formData.reportDate?.toISOString() 
            };
    
            const response = id
                ? await editPayrollReport(id, payload)
                : await addPayrollReport(payload);
    
            if ([200, 201].includes(response.status)) {
                toast.push(
                    <Notification
                        title={`Successfully ${id ? 'updated' : 'added'} payroll report`}
                        type="success"
                        duration={2500}
                    >
                        Payroll report {id ? 'updated' : 'added'} successfully
                    </Notification>,
                    { placement: 'top-center' }
                );
                navigate('/app/payroll-report-view');
            } else {
                throw new Error(response?.response?.data?.message || 'Unexpected status code');
            }
        } catch (error: any) {
            console.error('Form submission error:', error);
            toast.push(
                <Notification
                    title={`Error ${id ? 'updating' : 'adding'} payroll report`}
                    type="danger"
                    duration={2500}
                >
                    {error?.response?.data?.message || error.message}
                </Notification>,
                { placement: 'top-center' }
            );
        } finally {
            setSubmitting(false);
        }
    };

    const handleDiscard = () => {
        if (JSON.stringify(initialData) !== JSON.stringify(defaultReportData)) {
            if (window.confirm('Are you sure you want to discard changes?')) {
                navigate('/app/payroll-view')
            }
        } else {
            navigate('/app/payroll-view')
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
                    title="Error loading payroll report"
                    type="danger"
                >
                    {error}
                </Notification>
            </div>
        )
    }

    return (
        <PayrollForm
            type={id ? 'edit' : 'new'}
            initialData={initialData}
            onFormSubmit={handleFormSubmit}
            onDiscard={handleDiscard}
        />
    )
}

export default NewPayrollReport
