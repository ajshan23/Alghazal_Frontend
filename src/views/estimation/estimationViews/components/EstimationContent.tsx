import { useEffect, useState } from 'react'
import Button from '@/components/ui/Button'
import Loading from '@/components/shared/Loading'
import Logo from '@/components/template/Logo'
import { useNavigate, useParams } from 'react-router-dom'
import isEmpty from 'lodash/isEmpty'
import { HiCalendar, HiPencil } from 'react-icons/hi'
import useThemeClass from '@/utils/hooks/useThemeClass'
import { useAppSelector } from '@/store'
import dayjs from 'dayjs'
import { downloadEstimationPdf, fetchEstimation, fetchEstimationPdf } from '../../api/api'
import { APP_PREFIX_PATH } from '@/constants/route.constant'
import { Notification, toast } from '@/components/ui'

type Estimation = {
    _id: string
    project: {
        _id: string
        projectName: string
        client: string
    }
    estimationNumber: string
    workStartDate: string
    workEndDate: string
    validUntil: string
    paymentDueBy: number
    materials: {
        description: string
        uom:string
        quantity: number
        unitPrice: number
        total: number
        _id: string
    }[]
    labour: {
        designation: string
        days: number
        price: number
        total: number
        _id: string
    }[]
    termsAndConditions: {
        description: string
        quantity: number
        unitPrice: number
        total: number
        _id: string
    }[]
    estimatedAmount: number
    quotationAmount: number
    commissionAmount: number
    preparedBy: {
        _id: string
        firstName: string
        lastName: string
    }
    client:{
        clientName:string
        clientAddress:string 
        mobileNumber:string
        pincode:string
    }
    profit: number
    createdAt: string
    updatedAt: string
}

const EstimationContent = () => {
    const { textTheme } = useThemeClass()
    const { id } = useParams()
    const [loading, setLoading] = useState(true)
    const [data, setData] = useState<Estimation | null>(null)
    const mode = useAppSelector((state) => state.theme.mode)
    const [pdfLoading, setPdfLoading] = useState(false) // Local state for PDF loading
    const [error, setError] = useState('') // Local state for error handling
    const navigate = useNavigate()


    const handleEdit = () => {
     
        
        if (data) {
            navigate(`${APP_PREFIX_PATH}/estimation/edit/${data.project._id}/${id}`, { state: { estimationId: id } })

        }
    }

    useEffect(() => {
        const fetchData = async () => {
            try {
                if (id) {
                    const response = await fetchEstimation(id)
                    setData(response.data)
                }
            } catch (error) {
                console.error('Error fetching estimation:', error)
            } finally {
                setLoading(false)
            }
        }

        fetchData()
    }, [id])

    const formatDate = (dateString: string | undefined) => {
        return dateString ? dayjs(dateString).format('DD/MM/YYYY') : 'N/A'
    }

    // Calculate totals
    const totalMaterials = data?.materials.reduce((sum, item) => sum + item.total, 0) || 0
    const totalLabour = data?.labour.reduce((sum, item) => sum + item.total, 0) || 0
    const totalTerms = data?.termsAndConditions.reduce((sum, item) => sum + item.total, 0) || 0
    const handleDownloadPdf = async () => {
        if (!data) return
        
        setPdfLoading(true)
        setError('')
        
        try {
            await downloadEstimationPdf(data._id, data.estimationNumber)
            toast.push(
                <Notification title="Success" type="success">
                    PDF downloaded successfully
                </Notification>
            )
        } catch (error) {
            setError('Failed to download PDF')
            toast.push(
                <Notification title="Error" type="danger">
                    {error.message || 'Failed to download PDF'}
                </Notification>
            )
        } finally {
            setPdfLoading(false)
        }
    }
    return (
        <Loading loading={loading}>
            {data && (
                <>
                    <div className="flex flex-col md:flex-row justify-between gap-4 mb-10">
                        <div>
                            <Logo className="mb-3" mode={mode} />
                            <address className="not-italic">
                                <div>
                                    <h5>{data?.client?.clientName}</h5>
                                    <br />
                                    <span>{data?.client?.clientAddress}</span>
                                    <br />
                                    <span>pin : {data?.client?.pincode}</span>
                                    <br />
                                    <abbr title="Phone">Phone : </abbr>
                                    <span> {data?.client?.mobileNumber}</span>
                                </div>
                            </address>
                        </div>
                        <div className="my-4">
                            <div className="mb-4">
                                <h4>Estimation #{data?.estimationNumber}</h4>
                                <p>Project: {data?.project?.projectName}</p>
                            </div>
                            
                            {/* Date Information Section */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                <div className="flex items-center">
                                    <HiCalendar className={`text-lg mr-2 ${textTheme}`} />
                                    <div>
                                        <div className="text-sm text-gray-500">Estimation Date</div>
                                        <div>{formatDate(data?.createdAt)}</div>
                                    </div>
                                </div>
                                <div className="flex items-center">
                                    <HiCalendar className={`text-lg mr-2 ${textTheme}`} />
                                    <div>
                                        <div className="text-sm text-gray-500">Work Start Date</div>
                                        <div>{formatDate(data?.workStartDate)}</div>
                                    </div>
                                </div>
                                <div className="flex items-center">
                                    <HiCalendar className={`text-lg mr-2 ${textTheme}`} />
                                    <div>
                                        <div className="text-sm text-gray-500">Work End Date</div>
                                        <div>{formatDate(data?.workEndDate)}</div>
                                    </div>
                                </div>
                                <div className="flex items-center">
                                    <HiCalendar className={`text-lg mr-2 ${textTheme}`} />
                                    <div>
                                        <div className="text-sm text-gray-500">Valid Until</div>
                                        <div>{formatDate(data?.validUntil)}</div>
                                    </div>
                                </div>
                                <div className="flex items-center">
                                    <HiCalendar className={`text-lg mr-2 ${textTheme}`} />
                                    <div>
                                        <div className="text-sm text-gray-500">Payment Due By</div>
                                        <div>{data?.paymentDueBy} days</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Materials Table */}
                    <div className="mb-8">
                        <h5 className="mb-4">Materials</h5>
                        <table className="w-full">
                            <thead>
                                <tr className="bg-gray-50 dark:bg-gray-700">
                                    <th className="px-4 py-3 text-left">Description</th>
                                    <th className="px-4 py-3 text-left">UOM</th>

                                    <th className="px-4 py-3 text-right">Quantity</th>
                                    <th className="px-4 py-3 text-right">Unit Price</th>
                                    <th className="px-4 py-3 text-right">Total</th>
                                </tr>   
                            </thead>
                            <tbody>
                                {data?.materials.map((item, index) => (
                                    <tr key={item._id} className={index % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-50 dark:bg-gray-700'}>
                                        <td className="px-4 py-3">{item.description}</td>
                                        <td className="px-4 py-3">{item.uom}</td>
                                        <td className="px-4 py-3 text-right">{item?.quantity}</td>
                                        <td className="px-4 py-3 text-right">{item?.unitPrice && item.unitPrice.toFixed(2)}</td>
                                        <td className="px-4 py-3 text-right">{item?.total && item.total.toFixed(2)}</td>
                                    </tr>
                                ))}
                                <tr className="font-semibold bg-gray-100 dark:bg-gray-600">
                                    <td colSpan={4} className="px-4 py-3 text-right">Total Materials</td>
                                    <td className="px-4 py-3 text-right">{totalMaterials && totalMaterials.toFixed(2)}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    {/* Labour Charges Table */}
                    <div className="mb-8">
                        <h5 className="mb-4">Labour Charges</h5>
                        <table className="w-full">
                            <thead>
                                <tr className="bg-gray-50 dark:bg-gray-700">
                                    <th className="px-4 py-3 text-left">Designation</th>
                                    <th className="px-4 py-3 text-right">Days</th>
                                    <th className="px-4 py-3 text-right">Price</th>
                                    <th className="px-4 py-3 text-right">Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data?.labour.map((item, index) => (
                                    <tr key={item._id} className={index % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-50 dark:bg-gray-700'}>
                                        <td className="px-4 py-3">{item?.designation}</td>
                                        <td className="px-4 py-3 text-right">{item?.days}</td>
                                        <td className="px-4 py-3 text-right">{item?.price &&item.price.toFixed(2)}</td>
                                        <td className="px-4 py-3 text-right">{item?.total && item.total.toFixed(2)}</td>
                                    </tr>
                                ))}
                                <tr className="font-semibold bg-gray-100 dark:bg-gray-600">
                                    <td colSpan={3} className="px-4 py-3 text-right">Total Labour</td>
                                    <td className="px-4 py-3 text-right">{totalLabour && totalLabour.toFixed(2)}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    {/* Terms & Conditions (Miscellaneous) Table */}
                    <div className="mb-8">
                        <h5 className="mb-4">Terms & Conditions (Miscellaneous)</h5>
                        <table className="w-full">
                            <thead>
                                <tr className="bg-gray-50 dark:bg-gray-700">
                                    <th className="px-4 py-3 text-left">Description</th>
                                    <th className="px-4 py-3 text-right">Qty</th>
                                    <th className="px-4 py-3 text-right">Unit Price</th>
                                    <th className="px-4 py-3 text-right">Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data?.termsAndConditions.map((item, index) => (
                                    <tr key={item._id} className={index % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-50 dark:bg-gray-700'}>
                                        <td className="px-4 py-3">{item?.description}</td>
                                        <td className="px-4 py-3 text-right">{item?.quantity}</td>
                                        <td className="px-4 py-3 text-right">{item?.unitPrice && item.unitPrice.toFixed(2)}</td>
                                        <td className="px-4 py-3 text-right">{item?.total && item.total.toFixed(2)}</td>
                                    </tr>
                                ))}
                                <tr className="font-semibold bg-gray-100 dark:bg-gray-600">
                                    <td colSpan={3} className="px-4 py-3 text-right">Total Miscellaneous</td>
                                    <td className="px-4 py-3 text-right">{totalTerms && totalTerms.toFixed(2)}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    {/* Estimation Summary */}
                    <div className="mb-8">
                        <h5 className="mb-4">Estimation Summary</h5>
                        <table className="w-full">
                            <tbody>
                                <tr className="bg-gray-50 dark:bg-gray-700">
                                    <td className="px-4 py-3 font-semibold">Estimated Amount</td>
                                    <td className="px-4 py-3 text-right">{data?.estimatedAmount && data?.estimatedAmount.toFixed(2)}</td>
                                </tr>
                                <tr className="bg-white dark:bg-gray-800">
                                    <td className="px-4 py-3 font-semibold">Quotation Amount</td>
                                    <td className="px-4 py-3 text-right">{data?.quotationAmount &&data?.quotationAmount.toFixed(2)}</td>
                                </tr>
                                <tr className="bg-gray-100 dark:bg-gray-600">
                                    <td className="px-4 py-3 font-semibold">Commission Amount</td>
                                    <td className="px-4 py-3 text-right">{data?.commissionAmount &&data?.commissionAmount.toFixed(2)}</td>
                                </tr>
                                <tr className="bg-gray-200 dark:bg-gray-500">
                                    <td className="px-4 py-3 font-semibold">Profit</td>
                                    <td className="px-4 py-3 text-right">{data?.profit &&data?.profit.toFixed(2)}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    <div className="print:hidden mt-6 flex items-center justify-between">
        <small className="italic">
            Estimation was created on a computer and is valid without the signature and seal.
        </small>
        <div className="flex gap-2">
        <Button 
                                variant="solid" 
                                loading={pdfLoading}
                                onClick={handleDownloadPdf}
                            >
                                {pdfLoading ? 'Generating PDF...' : 'Download PDF'}
                            </Button>
            <Button 
                variant="solid" 
                icon={<HiPencil />}
                onClick={handleEdit}
            >
                Edit
            </Button>
        </div>
    </div>

                    {/* <div className="print:hidden mt-6 flex items-center justify-between">
                        <small className="italic">
                            Estimation was created on a computer and is valid without the signature and seal.
                        </small>
                        <Button variant="solid" onClick={() => window.print()}>
                            Print
                        </Button>
                    </div> */}
                </>
            )}
        </Loading>
    )
}

export default EstimationContent