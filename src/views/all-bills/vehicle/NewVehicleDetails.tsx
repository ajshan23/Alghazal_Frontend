import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import toast from '@/components/ui/toast'
import Notification from '@/components/ui/Notification'
import VehicleForm from './VehicleForm'
import dayjs from 'dayjs'
import { addVehicle, editVehicle, fetchVehicleById } from './api/api'

const defaultVehicleData = {
    vehicleNumber: '',
    vehicleType: 'car',
    make: '',
    model: '',
    year: new Date().getFullYear(),
    color: '',
    registrationDate: new Date(),
    insuranceExpiry: new Date(),
    lastServiceDate: undefined,
    currentMileage: 0,
    status: 'active',
}

const NewVehicleDetails = () => {
    const navigate = useNavigate()
    const { id } = useParams()
    const [initialData, setInitialData] = useState(defaultVehicleData)
    const [loading, setLoading] = useState(!!id)

    useEffect(() => {
        if (id) {
            const fetchData = async () => {
                try {
                    const response = await fetchVehicleById(id)
                    if (!response || !response.data) {
                        throw new Error('Invalid vehicle data')
                    }

                    const vehicleData = {
                        ...response.data,
                        registrationDate: dayjs(
                            response.data.registrationDate,
                        ).toDate(),
                        insuranceExpiry: dayjs(
                            response.data.insuranceExpiry,
                        ).toDate(),
                        lastServiceDate: response.data.lastServiceDate
                            ? dayjs(response.data.lastServiceDate).toDate()
                            : undefined,
                    }

                    setInitialData(vehicleData)
                    setLoading(false)
                } catch (error: any) {
                    console.error('Error fetching vehicle:', error)
                    setLoading(false)

                    toast.push(
                        <Notification
                            title="Failed to fetch vehicle data"
                            type="danger"
                            duration={2500}
                        >
                            {error.message || 'Something went wrong'}
                        </Notification>,
                        { placement: 'top-center' },
                    )

                    navigate('/app/vehicles')
                }
            }

            fetchData()
        }
    }, [id, navigate])

    const handleFormSubmit = async (
        values: typeof defaultVehicleData,
        setSubmitting: (isSubmitting: boolean) => void,
    ) => {
        setSubmitting(true)

        try {
            let response: any

            // Prepare the payload with proper date formatting
            const payload = {
                ...values,
                registrationDate: dayjs(values.registrationDate).format(
                    'YYYY-MM-DD',
                ),
                insuranceExpiry: dayjs(values.insuranceExpiry).format(
                    'YYYY-MM-DD',
                ),
                lastServiceDate: values.lastServiceDate
                    ? dayjs(values.lastServiceDate).format('YYYY-MM-DD')
                    : undefined,
            }

            if (id) {
                response = await editVehicle(id, payload)
            } else {
                response = await addVehicle(payload)
            }


            if (response.statusCode === 200 || response.statusCode === 201) {
                setSubmitting(false)
                toast.push(
                    <Notification
                        title={`Successfully ${
                            id ? 'updated' : 'added'
                        } vehicle`}
                        type="success"
                        duration={2500}
                    >
                        Vehicle {id ? 'updated' : 'added'} successfully
                    </Notification>,
                    { placement: 'top-center' },
                )

                navigate('/app/vehicle-view')
            } else {
                throw new Error(
                    response?.response?.data?.message ||
                        'Unexpected status code',
                )
            }
        } catch (error: any) {
            console.error('Error during form submission:', error)
            setSubmitting(false)

            toast.push(
                <Notification
                    title={`Error ${id ? 'updating' : 'adding'} vehicle`}
                    type="danger"
                    duration={2500}
                >
                    {error?.response?.data?.message || error.message}
                </Notification>,
                { placement: 'top-center' },
            )
        }
    }

    const handleDiscard = () => {
        navigate('/app/vehicles')
    }

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        )
    }

    return (
        <VehicleForm
            type={id ? 'edit' : 'new'}
            initialData={initialData}
            onFormSubmit={handleFormSubmit}
            onDiscard={handleDiscard}
        />
    )
}

export default NewVehicleDetails
