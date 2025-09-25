import { useEffect, useState } from 'react'
import Button from '@/components/ui/Button'
import Loading from '@/components/shared/Loading'
import Logo from '@/components/template/Logo'
import ContentTable from './ContentTable'
import { useParams } from 'react-router-dom'
import { HiLocationMarker, HiPhone, HiUser } from 'react-icons/hi'
import useThemeClass from '@/utils/hooks/useThemeClass'
import { useAppSelector } from '@/store'
import dayjs from 'dayjs'
import type { Product, Summary } from './ContentTable'
import { downloadQuotationnPdf, getQuotationByProject } from '../../api/api'
import { Notification, toast } from '@/components/ui'

type QuotationItem = {
    _id: string
    description: string
    image?: {
        url: string
        key: string
        mimetype: string
    }
    quantity: number
    totalPrice: number
    unitPrice: number
    uom: string
}

type QuotationData = {
    _id: string
    quotationNumber: string
    date: string
    validUntil: string
    project: {
        _id: string
        projectName: string
    }
    preparedBy: {
        _id: string
        firstName: string
        lastName: string
    }
    items: QuotationItem[]
    subtotal: number
    vatPercentage: number
    vatAmount: number
    netAmount: number
    scopeOfWork: string[]
    termsAndConditions: string[]
    createdAt: string
    updatedAt: string
}

const QuotationContent = () => {
    const { textTheme } = useThemeClass()
    const { projectId } = useParams()
    const [loading, setLoading] = useState(true)
    const [data, setData] = useState<QuotationData | null>(null)
    const mode = useAppSelector((state) => state.theme.mode)
    const [error, setError] = useState<string | null>(null)
        const [pdfLoading, setPdfLoading] = useState(false) // Local state for PDF loading
    

    useEffect(() => {
        const fetchQuotationData = async () => {
            try {
                setLoading(true)
                if (!projectId) {
                    throw new Error('Project ID is missing')
                }
                
                const response = await getQuotationByProject(projectId)
                setData(response.data)
            } catch (err) {
                console.error('Error fetching quotation:', err)
                setError('Failed to load quotation data')
            } finally {
                setLoading(false)
            }
        }

        fetchQuotationData()
    }, [projectId])

    if (error) {
        return (
            <div className="p-4 text-center text-red-500">
                {error}
                <Button className="mt-4" onClick={() => window.location.reload()}>
                    Retry
                </Button>
            </div>
        )
    }

    if (!data) {
        return <Loading loading={loading} />
    }

    // Transform items to match ContentTable's Product type
    const products: Product[] = data.items.map((item, index) => ({
        id: item._id,
        sno: index + 1,
        description: item.description,
        uom: item.uom,
        qty: item.quantity,
        unitPrice: item.unitPrice,
        total: item.totalPrice,
        details: { 
            image: item.image?.url 
        }
    }))

    // Create payment summary
    const paymentSummary: Summary = {
        subTotal: data.subtotal,
        vat: data.vatAmount,
        netAmount: data.netAmount
    }


        const handleDownloadPdf = async () => {
            if (!data) return
            
            setPdfLoading(true)
            setError('')
            
            try {
                await downloadQuotationnPdf(data._id, data.quotationNumber)
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
            <div className="flex flex-col md:flex-row justify-between gap-4 mb-10">
                <div>
                    <Logo className="mb-3" mode={mode} />
                    <address className="not-italic">
                        <div>
                            <h5>{data.project.projectName}</h5>
                            <br />
                            {/* <span>Company Address Line 1</span>
                            <br />
                            <span>Dubai, UAE</span>
                            <br />
                            <abbr title="Phone">Phone:</abbr>
                            <span> +971 4 123 4567</span> */}
                        </div>
                    </address>
                </div>
                <div className="my-4">
                    <div className="mb-2">
                        <h4>Quotation {data.quotationNumber}</h4>
                        <div className="flex flex-col space-y-1">
                            <span>
                                Date: {dayjs(data.date).format('dddd, DD MMMM, YYYY')}
                            </span>
                            <span>
                                Valid Until: {dayjs(data.validUntil).format('dddd, DD MMMM, YYYY')}
                            </span>
                        </div>
                    </div>
                    <div className="mt-4 flex">
                        <HiUser className={`text-xl ${textTheme}`} />
                        <div className="ltr:ml-3 rtl:mr-3">
                            Prepared By: {data.preparedBy.firstName} {data.preparedBy.lastName}
                        </div>
                    </div>
                    <div className="mt-4 flex">
                        <HiLocationMarker className={`text-xl ${textTheme}`} />
                        <div className="ltr:ml-3 rtl:mr-3">
                            <h6>Project: {data.project.projectName}</h6>
                        </div>
                    </div>
                </div>
            </div>
            
            <ContentTable
                products={products}
                summary={paymentSummary}
                vatPercentage={data.vatPercentage}
            />
            
            {data.scopeOfWork.length > 0 && (
                <div className="mt-8">
                    <h5 className="mb-3">Scope of Work:</h5>
                    <ul className="list-disc pl-5 space-y-2">
                        {data.scopeOfWork.map((item, index) => (
                            <li key={`scope-${index}`}>{item}</li>
                        ))}
                    </ul>
                </div>
            )}

            <div className="mt-8">
                <h5 className="mb-3">Terms & Conditions:</h5>
                <ol className="list-decimal pl-5 space-y-2">
                    {data.termsAndConditions.map((term, index) => (
                        <li key={`term-${index}`}>{term}</li>
                    ))}
                </ol>
            </div>

            <div className="print:hidden mt-6 flex items-center justify-between">
                <small className="italic">
                    Quotation is valid until {dayjs(data.validUntil).format('DD MMMM, YYYY')}
                </small>
                <Button 
                                variant="solid" 
                                loading={pdfLoading}
                                onClick={handleDownloadPdf}
                            >
                                {pdfLoading ? 'Generating PDF...' : 'Download PDF'}
                            </Button>
            </div>
        </Loading>
    )
}

export default QuotationContent