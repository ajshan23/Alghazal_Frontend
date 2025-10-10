import Container from '@/components/shared/Container'
import Card from '@/components/ui/Card'
import ViewContent from './components/ViewContent'

const PublicView = () => {
    return (
        <Container className="h-full">
            <Card className="h-full" bodyClass="h-full">
                <ViewContent />
            </Card>
        </Container>
    )
}

export default PublicView
