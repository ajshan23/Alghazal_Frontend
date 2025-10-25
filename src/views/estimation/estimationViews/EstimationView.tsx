import Container from '@/components/shared/Container'
import Card from '@/components/ui/Card'
import EstimationContent from './components/EstimationContent'

const EstimationView = () => {
    return (
        <Container className="h-full">
            <Card className="h-full" bodyClass="h-full">
                <EstimationContent />
            </Card>
        </Container>
    )
}

export default EstimationView
