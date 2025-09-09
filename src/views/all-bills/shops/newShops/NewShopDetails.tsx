import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import toast from '@/components/ui/toast'
import Notification from '@/components/ui/Notification'
import ShopDetailsForm, { SetSubmitting } from '../shopForm/ShopDetailsForm'
import { addShop, editShop, fetchShopsById } from '../api/api'

const defaultShopData = {
    shopName: '',
    shopNo: '',
    address: '',
    vat: '',
    ownerName: '',
    ownerEmail: '',
    contact: '',
    shopAttachments: [],
}

const NewShopDetails = () => {
    const navigate = useNavigate()
    const { id } = useParams()
    const [initialData, setInitialData] = useState<any>(defaultShopData)
                        console.log('initialData:', initialData)

    const [loading, setLoading] = useState(!!id)

    useEffect(() => {
        if (id) {
            const fetchData = async () => {
                try {
                    const response = await fetchShopsById(id)
                    if (!response || !response.data) {
                        throw new Error('Invalid shop data')
                    }


                    setInitialData({
                        shopName: response.data.shopName || '',
                        shopNo: response.data.shopNo || '',
                        address: response.data.address || '',
                        vat: response.data.vat || '',
                        ownerName: response.data.ownerName || '',
                        ownerEmail: response.data.ownerEmail || '',
                        contact: response.data.contact || '',
                        shopAttachments: response.data.shopAttachments || [],
                    })

                    setLoading(false)
                } catch (error: any) {
                    console.error('Error fetching shop:', error)
                    setLoading(false)

                    toast.push(
                        <Notification
                            title="Failed to fetch shop data"
                            type="danger"
                            duration={2500}
                        >
                            {error.message || 'Something went wrong'}
                        </Notification>,
                        { placement: 'top-center' }
                    )

                    navigate('/app/user-list')
                }
            }

            fetchData()
        }
    }, [id, navigate])

    const handleFormSubmit = async (
        formData: FormData,
        setSubmitting: SetSubmitting
    ) => {
        setSubmitting(true)

        try {
            let response: any

            if (id) {
                response = await editShop(id, formData)
            } else {
                response = await addShop(formData)
            }

            if (response.status === (id ? 200 : 201)) {
                setSubmitting(false)
                toast.push(
                    <Notification
                        title={`Successfully ${id ? 'updated' : 'added'} shop`}
                        type="success"
                        duration={2500}
                    >
                        Shop {id ? 'updated' : 'added'} successfully
                    </Notification>,
                    { placement: 'top-center' }
                )

                navigate('/app/shop-view')
            } else {
                throw new Error(
                    response?.response?.data?.message ||
                        'Unexpected status code'
                )
            }
        } catch (error: any) {
            console.error('Error during form submission:', error)
            setSubmitting(false)

            toast.push(
                <Notification
                    title={`Error ${id ? 'updating' : 'adding'} shop`}
                    type="danger"
                    duration={2500}
                >
                    {error?.response?.data?.message || error.message}
                </Notification>,
                { placement: 'top-center' }
            )
        }
    }

    const handleDiscard = () => {
        navigate('/app/shop-view')
    }

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        )
    }

    return (
        <ShopDetailsForm
            type={id ? 'edit' : 'new'}
            initialData={initialData}
            onFormSubmit={handleFormSubmit}
            onDiscard={handleDiscard}
        />
    )
}

export default NewShopDetails
