import { useNavigate, useParams } from 'react-router-dom'
// import ClientForm, { FormModel, SetSubmitting } from './ClientForm'
import { createClient, editClient, fetchClientById } from '../api/api'
import { useEffect, useState } from 'react'
import toast from '@/components/ui/toast'
import Notification from '@/components/ui/Notification'
import { FormModel } from '@/views/crypto/TradeForm'
import ClientForm, { SetSubmitting } from '../Clientform'

const ClientNew = () => {
    const navigate = useNavigate()
    const { id } = useParams()
    const [initialData, setInitialData] = useState<any>(null)
    const [loading, setLoading] = useState(!!id)

    useEffect(() => {
        if (id) {
            const fetchData = async () => {
                try {
                    const response = await fetchClientById(id)
                    setInitialData(response.data)
                    setLoading(false)
                } catch (error) {
                    setLoading(false)
                    toast.push(
                        <Notification
                            title="Failed to fetch client data"
                            type="danger"
                        />,
                        { placement: 'top-center' }
                    )
                    navigate(-1)
                }
            }
            fetchData()
        }
    }, [id, navigate])

    const handleFormSubmit = async (values: FormModel, setSubmitting: SetSubmitting) => {
        setSubmitting(true)
        try {
            let response
            if (id) {
                response = await editClient(id, values)
            } else {
                response = await createClient(values)
            }

            if (response.status === (id ? 200 : 201)) {
                toast.push(
                    <Notification
                        title={`Successfully ${id ? 'updated' : 'created'} client`}
                        type="success"
                    />,
                    { placement: 'top-center' }
                )
                navigate(-1)
            }
        } catch (error) {
            toast.push(
                <Notification
                    title={`Failed to ${id ? 'update' : 'create'} client`}
                    type="danger"
                />,
                { placement: 'top-center' }
            )
        } finally {
            setSubmitting(false)
        }
    }

    const handleDiscard = () => {
        navigate('/app/client-list')
    }

    if (loading) {
        return <div>Loading client data...</div>
    }

    return (
        <ClientForm
            type={id ? 'edit' : 'new'}
            initialData={initialData || {
                clientName: '',
                clientAddress: '',
                pincode: '',
                mobileNumber: '',
                telephoneNumber: null,
                trnNumber: '',
                accountNumber:'',
            }}
            onFormSubmit={handleFormSubmit}
            onDiscard={handleDiscard}
        />
    )
}

export default ClientNew