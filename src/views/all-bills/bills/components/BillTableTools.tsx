import Button from '@/components/ui/Button'
import { HiPlusCircle } from 'react-icons/hi'
import { Link } from 'react-router-dom'

const BillTableTools = ({ to, title }) => {
    return (
        <div className="flex flex-col lg:flex-row lg:items-center gap-2">
            
            <Link className="block lg:inline-block md:mb-0 mb-4" to={to}>
                <Button block variant="solid" size="sm" icon={<HiPlusCircle />}>
                    {title}
                </Button>
            </Link>
        </div>
    )
}

export default BillTableTools
