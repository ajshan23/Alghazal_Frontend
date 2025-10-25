import toast from '@/components/ui/toast'
import Notification from '@/components/ui/notification'
import { useNavigate, useParams } from 'react-router-dom'
import { useEffect, useState } from 'react'

import VisaExpenseForm from '../billForms/VisaExpenseForm'
import { addVisaExpensesReport, editVisaExpensesReport, fetchVisaExpensesById } from '../api/api'

const defaultReportData = {
    employee: '',
    iBan: '',
    passportNumber: '',
    passportExpireDate: '',
    emirateIdNumber: '',
    emirateIdExpireDate: '',
    labourCardPersonalNumber: '',
    workPermitNumber: '',
    labourExpireDate: '',
    offerLetterTyping: '',
    labourInsurance: '',
    labourCardPayment: '',
    statusChangeInOut: '',
    insideEntry: '',
    medicalSharjah: '',
    tajweehSubmission: '',
    iloeInsurance: '',
    healthInsurance: '',
    emirateId: '',
    residenceStamping: '',
    srilankaCouncilHead: '',
    upscoding: '',
    labourFinePayment: '',
    labourCardRenewalPayment: '',
    servicePayment: '',
    visaStamping: '',
    twoMonthVisitingVisa: '',
    finePayment: '',
    entryPermitOutside: '',
    complaintEmployee: '',
    arabicLetter: '',
    violationCommittee: '',
    quotaModification: '',
    others: '',
    total: '',
}

const NewVisaExpenseReport = () => {
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
                const response = await fetchVisaExpensesById(id)

                if (!response?.data) {
                    throw new Error('Invalid visa expense data received')
                }

                // Extract only the fields we need
                const {
                    employee,
                    iBan,
                    passportNumber,
                    passportExpireDate,
                    emirateIdNumber,
                    emirateIdExpireDate,
                    labourCardPersonalNumber,
                    workPermitNumber,
                    labourExpireDate,
                    offerLetterTyping,
                    labourInsurance,
                    labourCardPayment,
                    statusChangeInOut,
                    insideEntry,
                    medicalSharjah,
                    tajweehSubmission,
                    iloeInsurance,
                    healthInsurance,
                    emirateId,
                    residenceStamping,
                    srilankaCouncilHead,
                    upscoding,
                    labourFinePayment,
                    labourCardRenewalPayment,
                    servicePayment,
                    visaStamping,
                    twoMonthVisitingVisa,
                    finePayment,
                    entryPermitOutside,
                    complaintEmployee,
                    arabicLetter,
                    violationCommittee,
                    quotaModification,
                    others,
                    total,
                } = response.data

                setInitialData({
                    employee: employee?._id || '',
                    iBan: iBan || '',
                    passportNumber: passportNumber || '',
                    passportExpireDate: passportExpireDate || '',
                    emirateIdNumber: emirateIdNumber || '',
                    emirateIdExpireDate: emirateIdExpireDate || '',
                    labourCardPersonalNumber: labourCardPersonalNumber || '',
                    workPermitNumber: workPermitNumber || '',
                    labourExpireDate: labourExpireDate || '',
                    offerLetterTyping: offerLetterTyping || '',
                    labourInsurance: labourInsurance || '',
                    labourCardPayment: labourCardPayment || '',
                    statusChangeInOut: statusChangeInOut || '',
                    insideEntry: insideEntry || '',
                    medicalSharjah: medicalSharjah || '',
                    tajweehSubmission: tajweehSubmission || '',
                    iloeInsurance: iloeInsurance || '',
                    healthInsurance: healthInsurance || '',
                    emirateId: emirateId || '',
                    residenceStamping: residenceStamping || '',
                    srilankaCouncilHead: srilankaCouncilHead || '',
                    upscoding: upscoding || '',
                    labourFinePayment: labourFinePayment || '',
                    labourCardRenewalPayment: labourCardRenewalPayment || '',
                    servicePayment: servicePayment || '',
                    visaStamping: visaStamping || '',
                    twoMonthVisitingVisa: twoMonthVisitingVisa || '',
                    finePayment: finePayment || '',
                    entryPermitOutside: entryPermitOutside || '',
                    complaintEmployee: complaintEmployee || '',
                    arabicLetter: arabicLetter || '',
                    violationCommittee: violationCommittee || '',
                    quotaModification: quotaModification || '',
                    others: others || '',
                    total: total || '',
                })
                setError(null)
            } catch (error: any) {
                console.error('Error fetching visa expense report:', error)
                setError(error.message || 'Failed to load visa expense data')
                toast.push(
                    <Notification
                        title="Failed to fetch visa expense report data"
                        type="danger"
                        duration={2500}
                    >
                        {error.message || 'Something went wrong'}
                    </Notification>,
                    { placement: 'top-center' },
                )
                setTimeout(() => navigate('/app/visa-expense-report-view'), 2500)
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
                employee: formData.employee,
                iBan: formData.iBan,
                passportNumber: formData.passportNumber,
                passportExpireDate: formData.passportExpireDate,
                emirateIdNumber: formData.emirateIdNumber,
                emirateIdExpireDate: formData.emirateIdExpireDate,
                labourCardPersonalNumber: formData.labourCardPersonalNumber,
                workPermitNumber: formData.workPermitNumber,
                labourExpireDate: formData.labourExpireDate,
                offerLetterTyping: formData.offerLetterTyping,
                labourInsurance: formData.labourInsurance,
                labourCardPayment: formData.labourCardPayment,
                statusChangeInOut: formData.statusChangeInOut,
                insideEntry: formData.insideEntry,
                medicalSharjah: formData.medicalSharjah,
                tajweehSubmission: formData.tajweehSubmission,
                iloeInsurance: formData.iloeInsurance,
                healthInsurance: formData.healthInsurance,
                emirateId: formData.emirateId,
                residenceStamping: formData.residenceStamping,
                srilankaCouncilHead: formData.srilankaCouncilHead,
                upscoding: formData.upscoding,
                labourFinePayment: formData.labourFinePayment,
                labourCardRenewalPayment: formData.labourCardRenewalPayment,
                servicePayment: formData.servicePayment,
                visaStamping: formData.visaStamping,
                twoMonthVisitingVisa: formData.twoMonthVisitingVisa,
                finePayment: formData.finePayment,
                entryPermitOutside: formData.entryPermitOutside,
                complaintEmployee: formData.complaintEmployee,
                arabicLetter: formData.arabicLetter,
                violationCommittee: formData.violationCommittee,
                quotaModification: formData.quotaModification,
                others: formData.others,
                total: formData.total,
            };
    
            const response = id
                ? await editVisaExpensesReport(id, payload)
                : await addVisaExpensesReport(payload);
    
            if ([200, 201].includes(response.status)) {
                toast.push(
                    <Notification
                        title={`Successfully ${id ? 'updated' : 'added'} visa expense report`}
                        type="success"
                        duration={2500}
                    >
                        Visa expense report {id ? 'updated' : 'added'} successfully
                    </Notification>,
                    { placement: 'top-center' }
                );
                navigate('/app/visa-expense-report-view');
            } else {
                throw new Error(response?.response?.data?.message || 'Unexpected status code');
            }
        } catch (error: any) {
            console.error('Form submission error:', error);
            toast.push(
                <Notification
                    title={`Error ${id ? 'updating' : 'adding'} visa expense report`}
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
                navigate('/app/visa-expense-report-view')
            }
        } else {
            navigate('/app/visa-expense-report-view')
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
                    title="Error loading visa expense report"
                    type="danger"
                >
                    {error}
                </Notification>
            </div>
        )
    }

    return (
        <VisaExpenseForm
            type={id ? 'edit' : 'new'}
            initialData={initialData}
            onFormSubmit={handleFormSubmit}
            onDiscard={handleDiscard}
        />
    )
}

export default NewVisaExpenseReport