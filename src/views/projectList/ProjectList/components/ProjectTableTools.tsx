import Button from '@/components/ui/Button'
import { HiDownload, HiPlusCircle } from 'react-icons/hi'
import UserTableSearch from './ProjectTableSearch'
import UserFilter from './ProjectFilter'
import { Link } from 'react-router-dom'

const ProjectTableTools = () => {
    return (
        <div className="flex flex-col lg:flex-row lg:items-center">
            <UserFilter />
            <Link
                download
                className="block lg:inline-block md:mx-2 md:mb-0 mb-4"
                to="/data/product-list.csv"
                target="_blank"
            >
                <Button block size="sm" icon={<HiDownload />}>
                    Export
                </Button>
            </Link>
            <Link
                className="block lg:inline-block md:mb-0 mb-4"
                to="/app/sales/product-new"
            >
                <Button block variant="solid" size="sm" icon={<HiPlusCircle />}>
                    Add User
                </Button>
            </Link>
        </div>
    )
}

export default ProjectTableTools
