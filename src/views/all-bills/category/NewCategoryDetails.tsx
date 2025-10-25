import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import toast from '@/components/ui/toast'
import Notification from '@/components/ui/Notification'
import { addCategory, editCategory, fetchCategoryById } from './api/api'
import CategoryDetailsForm from './CategoryForm'

const defaultCategoryData = {
    name: '',
    description: ''
}

const NewCategoryDetails = () => {
    const navigate = useNavigate()
    const { id } = useParams()
    const [initialData, setInitialData] = useState(defaultCategoryData)
    const [loading, setLoading] = useState(!!id)

    useEffect(() => {
        if (id) {
            const fetchData = async () => {
                try {
                    const response = await fetchCategoryById(id)
                    if (!response || !response.data) {
                        throw new Error('Invalid category data')
                    }

                    setInitialData({
                        name: response.data.name || '',
                        description: response.data.description || ''
                    })

                    setLoading(false)
                } catch (error: any) {
                    console.error('Error fetching category:', error)
                    setLoading(false)

                    toast.push(
                        <Notification
                            title="Failed to fetch category data"
                            type="danger"
                            duration={2500}
                        >
                            {error.message || 'Something went wrong'}
                        </Notification>,
                        { placement: 'top-center' }
                    )

                    navigate('/app/categories')
                }
            }

            fetchData()
        }
    }, [id, navigate])

    const handleFormSubmit = async (
        values: { name: string; description: string },
        setSubmitting: (isSubmitting: boolean) => void
    ) => {
        setSubmitting(true)

        try {
            let response: any

            if (id) {
                response = await editCategory(id, values)
            } else {
                response = await addCategory(values)
            }


            if (response.status === 200||201) {
                setSubmitting(false)
                toast.push(
                    <Notification
                        title={`Successfully ${id ? 'updated' : 'added'} category`}
                        type="success"
                        duration={2500}
                    >
                        Category {id ? 'updated' : 'added'} successfully
                    </Notification>,
                    { placement: 'top-center' }
                )

                navigate('/app/cat-view')
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
                    title={`Error ${id ? 'updating' : 'adding'} category`}
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
        navigate('/app/categories')
    }

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        )
    }

    return (
        <CategoryDetailsForm
            type={id ? 'edit' : 'new'}
            initialData={initialData}
            onFormSubmit={handleFormSubmit}
            onDiscard={handleDiscard}
        />
    )
}

export default NewCategoryDetails