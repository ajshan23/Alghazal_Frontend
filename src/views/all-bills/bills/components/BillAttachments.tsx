import { HiOutlinePaperClip } from 'react-icons/hi'
import { AdaptableCard } from '@/components/shared'
import { useLocation } from 'react-router-dom'

interface Attachment {
    fileName: string
    filePath: string
    fileType: string
}

const BillAttachments = () => {
    const location = useLocation()
    const attachments = location.state?.data || []
    const type = location.state?.type || ''
    if (attachments.length === 0) {
        return (
            <div className="flex justify-center items-center h-64">
                <p>No attachments available for this bill</p>
            </div>
        )
    }

    return (
        <div className="container mx-auto p-4">
            <AdaptableCard>
                <div className="flex items-center gap-3 mb-6">
                    <HiOutlinePaperClip className="text-2xl text-amber-500" />
                    <h3 className="text-xl font-semibold">{type === 'bill' ? 'Bill Attachments' : 'Report Attachments'}</h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {attachments.map(
                        (attachment: Attachment, index: number) => (
                            <AttachmentCard
                                key={index}
                                attachment={attachment}
                            />
                        ),
                    )}
                </div>
            </AdaptableCard>
        </div>
    )
}

const AttachmentCard = ({ attachment }: { attachment: Attachment }) => {
    const getFileIcon = () => {
        if (!attachment.fileType) return '📁'
        if (attachment.fileType.includes('image')) return '🖼️'
        if (attachment.fileType.includes('pdf')) return '📄'
        if (attachment.fileType.includes('word')) return '📝'
        if (
            attachment.fileType.includes('excel') ||
            attachment.fileType === 'application/vnd.ms-excel' ||
            attachment.fileType ===
                'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        ) {
            return '📊'
        }
        return '📁'
    }

    return (
        <div className="border rounded-lg p-4 hover:shadow-md transition-shadow bg-white dark:bg-gray-800">
            <div className="flex items-start gap-3">
                <span className="text-2xl">{getFileIcon()}</span>
                <div className="flex-1 min-w-0">
                    <a
                        href={attachment.filePath}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block font-medium text-blue-600 hover:text-blue-800 dark:text-blue-300 dark:hover:text-blue-200 truncate"
                        title={attachment.fileName}
                    >
                        {attachment.fileName}
                    </a>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {attachment.fileType || 'File'}
                    </p>
                </div>
            </div>
        </div>
    )
}

export default BillAttachments
