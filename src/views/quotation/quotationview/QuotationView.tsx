import Container from '@/components/shared/Container'
import Card from '@/components/ui/Card'
import QuotationContent from './components/QuotationContent'

const QuotationView = () => {
    return (
        <Container className="h-full">
            <Card className="h-full" bodyClass="h-full">
                <QuotationContent />
            </Card>
        </Container>
    )
}

export default QuotationView
