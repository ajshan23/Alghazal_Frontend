import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { AdaptableCard } from '@/components/shared'
import type { Shop } from '@/@types/shop'
import {
    HiOutlineOfficeBuilding,
    HiOutlineUser,
    HiOutlinePaperClip,
} from 'react-icons/hi'
import { fetchShopsById } from './api/api'
import { Card } from '@/components/ui'

const ShopDetails = () => {
    const { id } = useParams()
    const [shop, setShop] = useState<Shop | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const fetchShopDetails = async () => {
            try {
                setLoading(true)
                const response = await fetchShopsById(id as string)
                setShop(response.data)
                setError(null)
            } catch (err: any) {
                setError(err.message || 'Failed to fetch shop details')
                setShop(null)
            } finally {
                setLoading(false)
            }
        }

        if (id) {
            fetchShopDetails()
        }
    }, [id])

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <p>Loading shop details...</p>
            </div>
        )
    }

    if (error) {
        return (
            <div className="flex justify-center items-center h-64">
                <p className="text-red-500">{error}</p>
            </div>
        )
    }

    if (!shop) {
        return (
            <div className="flex justify-center items-center h-64">
                <p>No shop data available</p>
            </div>
        )
    }

    return (
        <div className="container mx-auto p-4">
            <AdaptableCard>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Shop Info Card */}
                    <Card className="lg:col-span-2">
                        <div className="flex items-center gap-3 mb-6">
                            <HiOutlineOfficeBuilding className="text-2xl text-emerald-500" />
                            <h3 className="text-xl font-semibold">
                                Shop Information
                            </h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <DetailCardItem
                                label="Shop Name"
                                value={shop.shopName}
                                className="bg-blue-50 dark:bg-blue-900/20"
                            />
                            <DetailCardItem
                                label="Shop Number"
                                value={shop.shopNo}
                                className="bg-indigo-50 dark:bg-indigo-900/20"
                            />
                            <DetailCardItem
                                label="Address"
                                value={shop.address}
                                className="md:col-span-2 bg-purple-50 dark:bg-purple-900/20"
                            />
                            <DetailCardItem
                                label="VAT Number"
                                value={shop.vat}
                                className="bg-amber-50 dark:bg-amber-900/20"
                            />
                        </div>
                    </Card>

                    {/* Owner Info Card */}
                    <Card>
                        <div className="flex items-center gap-3 mb-6">
                            <HiOutlineUser className="text-2xl text-rose-500" />
                            <h3 className="text-xl font-semibold">
                                Owner Information
                            </h3>
                        </div>

                        <div className="space-y-4">
                            <DetailCardItem
                                label="Owner Name"
                                value={shop.ownerName}
                                className="bg-green-50 dark:bg-green-900/20"
                            />
                            <DetailCardItem
                                label="Owner Email"
                                value={shop.ownerEmail}
                                className="bg-cyan-50 dark:bg-cyan-900/20"
                            />
                            <DetailCardItem
                                label="Contact Number"
                                value={shop.contact}
                                className="bg-violet-50 dark:bg-violet-900/20"
                            />
                        </div>
                    </Card>
                </div>

                {/* Attachments Card */}
                {shop.shopAttachments && shop.shopAttachments.length > 0 && (
                    <AdaptableCard className="mt-6">
                        <div className="flex items-center gap-3 mb-6">
                            <HiOutlinePaperClip className="text-2xl text-amber-500" />
                            <h3 className="text-xl font-semibold">
                                Shop Attachments
                            </h3>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {shop.shopAttachments.map((attachment, index) => (
                                <AttachmentCard
                                    key={index}
                                    attachment={attachment}
                                />
                            ))}
                        </div>
                    </AdaptableCard>
                )}
            </AdaptableCard>
        </div>
    )
}

const DetailCardItem = ({
    label,
    value,
    className = '',
}: {
    label: string
    value?: string
    className?: string
}) => (
    <div className={`p-4 rounded-lg ${className}`}>
        <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
            {label}
        </p>
        <p className="font-medium mt-1 text-gray-800 dark:text-gray-100">
            {value || 'Not provided'}
        </p>
    </div>
)

const AttachmentCard = ({ attachment }: { attachment: any }) => {
    const isFileInstance = attachment instanceof File
    const displayName = isFileInstance ? attachment.name : attachment.fileName
    const fileUrl = isFileInstance ? undefined : attachment.filePath
    const fileType = isFileInstance ? attachment.type : attachment.fileType

  const getFileIcon = () => {
    if (fileType?.includes('image')) return '🖼️'
    if (fileType?.includes('pdf')) return '📄'
    if (fileType?.includes('word')) return '📝'
    if (fileType?.includes('excel') || 
        fileType === 'application/vnd.ms-excel' || 
        fileType === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
        return '📊'
    }
    return '📁'
}


    return (
        <div className="border rounded-lg p-4 hover:shadow-md transition-shadow bg-white dark:bg-gray-800">
            <div className="flex items-start gap-3">
                <span className="text-2xl">{getFileIcon()}</span>
                <div className="flex-1 min-w-0">
                    {fileUrl ? (
                        <a
                            href={fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block font-medium text-blue-600 hover:text-blue-800 dark:text-blue-300 dark:hover:text-blue-200 truncate"
                            title={displayName}
                        >
                            {displayName}
                        </a>
                    ) : (
                        <p
                            className="font-medium text-gray-800 dark:text-gray-200 truncate"
                            title={displayName}
                        >
                            {displayName}
                        </p>
                    )}
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {fileType || 'Unknown file type'}
                    </p>
                </div>
            </div>
        </div>
    )
}

export default ShopDetails
