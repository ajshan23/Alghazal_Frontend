import Button from '@/components/ui/Button'
import { HiDownload, HiPlusCircle } from 'react-icons/hi'
import UserTableSearch from './UserTableSearch'
import UserFilter from './UserFilter'
import { Link } from 'react-router-dom'
import { exportUsersToCSV } from '../../api/api'
import { saveAs } from 'file-saver'
import { useState } from 'react'
import toast from '@/components/ui/toast'
import Notification from '@/components/ui/Notification'

const UserTableTools = () => {
    const [isExporting, setIsExporting] = useState(false)

    const handleExport = async () => {
        setIsExporting(true)
        try {
            const blob = await exportUsersToCSV()
            saveAs(blob, `users_export_${new Date().toISOString().slice(0, 10)}.csv`)
            
            toast.push(
                <Notification title="Export Successful" type="success">
                    User data has been exported successfully
                </Notification>,
                {
                    placement: 'top-center',
                }
            )
        } catch (error) {
            console.error('Export failed:', error)
            toast.push(
                <Notification title="Export Failed" type="danger">
                    Failed to export user data. Please try again.
                </Notification>,
                {
                    placement: 'top-center',
                }
            )
        } finally {
            setIsExporting(false)
        }
    }

    return (
        <div className="flex flex-col lg:flex-row lg:items-center gap-2">
            <UserTableSearch />
            <UserFilter />
            
            <Button
                className="md:mb-0 mb-4"
                size="sm"
                icon={<HiDownload />}
                loading={isExporting}
                onClick={handleExport}
            >
                {isExporting ? 'Exporting...' : 'Export'}
            </Button>
            
            <Link
                className="block lg:inline-block md:mb-0 mb-4"
                to="/app/user-new"
            >
                <Button 
                    block 
                    variant="solid" 
                    size="sm" 
                    icon={<HiPlusCircle />}
                >
                    Add Staff
                </Button>
            </Link>
        </div>
    )
}

export default UserTableTools