import AdaptableCard from '@/components/shared/AdaptableCard'
import VehicleTableTools from './components/VehicleTableTools'
import VehicleTable from './components/VehicleTable'

const VehicleList = () => {
    return (
        <AdaptableCard className="h-full" bodyClass="h-full">
            <div className="lg:flex items-center justify-between mb-4">
                <h3 className="mb-4 lg:mb-0">Vehicles</h3>
                <VehicleTableTools to="/app/vehicle-view" title="Add Vehicle" />
            </div>
            <VehicleTable />
        </AdaptableCard>
    )
}

export default VehicleList
