import { useEffect, useState } from 'react'
import Button from '@/components/ui/Button'
import Loading from '@/components/shared/Loading'
import Logo from '@/components/template/Logo'
import ContentTable from './ContentTable'
import { useLocation } from 'react-router-dom'
import isEmpty from 'lodash/isEmpty'
import { apiGetAccountInvoiceData } from '@/services/AccountServices'
import { HiLocationMarker, HiPhone } from 'react-icons/hi'
import useThemeClass from '@/utils/hooks/useThemeClass'
import { useAppSelector } from '@/store'
import dayjs from 'dayjs'
import type { Product, Summary } from './ContentTable'

type Invoice = {
    id: string
    recipient: string
    email: string
    address: string[]
    phoneNumber: string
    dateTime: number
    product: Product[]
    paymentSummary: Summary
}

type GetAccountInvoiceDataRequest = { id: string }

type GetAccountInvoiceDataResponse = Invoice

// ... (previous imports remain the same)

const ViewContent = () => {
    const { textTheme } = useThemeClass()
    const location = useLocation()
    const [loading, setLoading] = useState(false)
    const [data, setData] = useState<Partial<Invoice>>({})
    const mode = useAppSelector((state) => state.theme.mode)

    // Sample data - replace with your actual data fetching logic
    useEffect(() => {
        setData({
            id: 'QT-2023-001',
            recipient: 'Client Name',
            email: 'client@example.com',
            address: ['123 Client Street', 'Dubai, UAE'],
            phoneNumber: '+971 50 123 4567',
            dateTime: Date.now() / 1000,
            product: [
                {
                    id: '1',
                    sno: 1,
                    description: 'Product Description 1',
                    uom: 'PCS',
                    qty: 2,
                    unitPrice: 100,
                    total: 200,
                    details: { color: [], size: [] }
                },
                {
                    id: '2',
                    sno: 2,
                    description: 'Product Description 2',
                    uom: 'PCS',
                    qty: 3,
                    unitPrice: 150,
                    total: 450,
                    details: { color: [], size: [] }
                }
            ],
            paymentSummary: {
                subTotal: 650,
                vat: 32.5,
                netAmount: 682.5
            }
        })
    }, [])

    const termsAndConditions = [
        'Prices are valid for 30 days from the date of quotation.',
        'Delivery time will be confirmed upon order confirmation.',
        'Payment terms: 50% advance, 50% before delivery.',
        'All products are subject to availability.',
    ]

    return (
        <Loading loading={loading}>
            <div className="flex flex-col md:flex-row justify-between gap-4 mb-10">
                <div>
                    <Logo className="mb-3" mode={mode} />
                    <address className="not-italic">
                        <div>
                            <h5>Your Company Name</h5>
                            <br />
                            <span>Company Address Line 1</span>
                            <br />
                            <span>Dubai, UAE</span>
                            <br />
                            <abbr title="Phone">Phone:</abbr>
                            <span> +971 4 123 4567</span>
                        </div>
                    </address>
                </div>
                <div className="my-4">
                    <div className="mb-2">
                        <h4>Quotation #{data?.id}</h4>
                        <span>
                            Date:{' '}
                            {dayjs
                                .unix(data.dateTime as number)
                                .format('dddd, DD MMMM, YYYY')}
                        </span>
                    </div>
                    <h6>{data.recipient}</h6>
                    <div className="mt-4 flex">
                        <HiLocationMarker
                            className={`text-xl ${textTheme}`}
                        />
                        <div className="ltr:ml-3 rtl:mr-3">
                            {data?.address?.map((line) => (
                                <div key={line} className="mb-1">
                                    {line}
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="mt-4 flex">
                        <HiPhone className={`text-xl ${textTheme}`} />
                        <div className="ltr:ml-3 rtl:mr-3">
                            {data.phoneNumber}
                        </div>
                    </div>
                </div>
            </div>
            
            <ContentTable
                products={data?.product}
                summary={data.paymentSummary}
            />
            
           
            <div className="print:hidden mt-6 flex items-center justify-between">
               
                {/* <Button variant="solid" onClick={() => window.print()}>
                    Print
                </Button> */}
            </div>
        </Loading>
    )
}

export default ViewContent
