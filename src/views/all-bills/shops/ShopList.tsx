import AdaptableCard from '@/components/shared/AdaptableCard'
import ShopTableTools from './components/ShopTableTools'
import ShopTables from './components/ShopTables'

const ShopList = () => {
    return (
        <AdaptableCard className="h-full" bodyClass="h-full">
            <div className="lg:flex items-center justify-between mb-4">
                <h3 className="mb-4 lg:mb-0">Shops </h3>
                <ShopTableTools />
            </div>
            <ShopTables />
        </AdaptableCard>
    )
}

export default ShopList
