import AdaptableCard from '@/components/shared/AdaptableCard'
import CategoryTable from './components/CategoryTable'
import CategoryTableTools from './components/CategoryTableTools'

const CategoryList = () => {
    return (
        <AdaptableCard className="h-full" bodyClass="h-full">
            <div className="lg:flex items-center justify-between mb-4">
                <h3 className="mb-4 lg:mb-0">Categories</h3>
                <CategoryTableTools
                    to="/app/new-gen-bill"
                    title="Add Category"
                />
            </div>
            <CategoryTable />
        </AdaptableCard>
    )
}

export default CategoryList
