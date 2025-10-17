import { Fragment } from 'react'
import Table from '@/components/ui/Table'
import {
    useReactTable,
    getCoreRowModel,
    flexRender,
    createColumnHelper,
} from '@tanstack/react-table'
import { NumericFormat } from 'react-number-format'
import isLastChild from '@/utils/isLastChild'

export type Product = {
    id: string
    sno: number
    description: string
    uom: string
    qty: number
    unitPrice: number
    total: number
    details: {
        color: string[]
        size: string[]
    }
}

export type Summary = {
    subTotal: number
    vat: number
    netAmount: number
}

type ContentTableProps = {
    products?: Product[]
    summary?: Partial<Summary>
}

type TFootRowsProps = {
    label: string
    value?: number
}

const { Tr, Th, Td, THead, TBody, TFoot } = Table

const TFootRows = ({ label, value }: TFootRowsProps) => {
    return (
        <Tr>
            <Td className="!border-t-0" colSpan={4}></Td>
            <Td className="font-semibold !border-t-0 text-right">{label}</Td>
            <Td className="!py-3 !border-t-0">
                <PriceAmount amount={value} />
            </Td>
        </Tr>
    )
}

const PriceAmount = ({ amount = 0 }: { amount?: number }) => {
    return (
        <NumericFormat
            displayType="text"
            value={(Math.round(amount * 100) / 100).toFixed(2)}
            suffix={' AED'}
            thousandSeparator={true}
        />
    )
}

const columnHelper = createColumnHelper<Product>()

const columns = [
    columnHelper.accessor('sno', {
        header: 'S.No',
        cell: (props) => props.getValue()
    }),
    columnHelper.accessor('description', {
        header: 'Description',
    }),
    columnHelper.accessor('uom', {
        header: 'U.O.M',
    }),
    columnHelper.accessor('qty', {
        header: 'Qty',
    }),
    columnHelper.accessor('unitPrice', {
        header: 'Unit Price (AED)',
        cell: (props) => <PriceAmount amount={props.getValue()} />
    }),
    columnHelper.accessor('total', {
        header: 'Total (AED)',
        cell: (props) => <PriceAmount amount={props.getValue()} />
    }),
]

const ContentTable = ({ products = [], summary = {} }: ContentTableProps) => {
    const table = useReactTable({
        data: products,
        columns,
        getCoreRowModel: getCoreRowModel(),
    })

    return (
        <Table>
            <THead>
                {table.getHeaderGroups().map((headerGroup) => (
                    <Tr key={headerGroup.id}>
                        {headerGroup.headers.map((header) => {
                            return (
                                <Th key={header.id} colSpan={header.colSpan}>
                                    {flexRender(
                                        header.column.columnDef.header,
                                        header.getContext(),
                                    )}
                                </Th>
                            )
                        })}
                    </Tr>
                ))}
            </THead>
            <TBody>
                {table.getRowModel().rows.map((row) => {
                    return (
                        <Tr key={row.id}>
                            {row.getVisibleCells().map((cell) => {
                                return (
                                    <Td key={cell.id}>
                                        {flexRender(
                                            cell.column.columnDef.cell,
                                            cell.getContext(),
                                        )}
                                    </Td>
                                )
                            })}
                        </Tr>
                    )
                })}
            </TBody>
            <TFoot>
                <TFootRows label="Total (AED)" value={summary.subTotal} />
                <TFootRows label="VAT 5% (AED)" value={summary.vat} />
                <Tr>
                    <Td className="!border-t-0" colSpan={4}></Td>
                    <Td className="font-semibold text-base text-right">Net Amount (AED)</Td>
                    <Td className="font-semibold text-base !py-3">
                        <PriceAmount amount={summary.netAmount} />
                    </Td>
                </Tr>
            </TFoot>
        </Table>
    )
}

export default ContentTable