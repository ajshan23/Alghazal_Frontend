import Card from '@/components/ui/Card'
import { motion } from 'framer-motion'
import { HiChartBar } from 'react-icons/hi' // graph icon
// or use: import { FiBarChart2 } from 'react-icons/fi'

type ListItemProps = {
    range: 'monthly' | 'yearly'
    onDownload: (range: 'monthly' | 'yearly') => void
}

const ListItem = ({ range ,onDownload}: ListItemProps) => {
    const reportName = range === 'monthly' ? 'Monthly Report' : 'Yearly Report'

    const cardColor = range === 'monthly' ? 'bg-blue-50' : 'bg-yellow-50'
    const buttonColor =
        range === 'monthly' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-yellow-500 hover:bg-yellow-600'

    return (
        <motion.div
            className={`mb-4 transition-all duration-500 ease-in-out`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            key={range}
        >
            <Card className={`${cardColor} transition-colors duration-300`} bordered>
                <div className="grid gap-x-4 grid-cols-12">
                    {/* Title with Icon */}
                    <div className="col-span-12 sm:col-span-6 flex items-center gap-2">
                        <HiChartBar className="text-2xl text-gray-700" />
                        <h6 className="font-bold capitalize text-gray-800">{reportName}</h6>
                    </div>

                    {/* Download Button */}
                    <div className="col-span-12 sm:col-span-6 flex items-center justify-end">
                        <button
                            className={`text-white px-4 py-2 rounded ${buttonColor} transition duration-300 flex items-center gap-2`}
                            onClick={() => onDownload(range)}
                        >
                            <HiChartBar className="text-lg" />
                            Download
                        </button>
                    </div>
                </div>
            </Card>
        </motion.div>
    )
}


export default ListItem
