import BaseService from "@/services/BaseService"
import type { VehicleFormValues } from '@/views/vehicles/VehicleForm'

export const fetchVehicles = async ({ page, limit, search }: { page: number, limit: number, search?: string }) => {
    try {
        const response = await BaseService.get('/vehicles', {
            params: {
                page,
                limit,
                search,
            },
        })
        return response.data
    } catch (error) {
        console.error('Error fetching vehicles:', error)
        throw error
    }
}

export const fetchVehicleById = async (id: string) => {
    try {
        const response = await BaseService.get(`/vehicles/${id}`)
        return response.data
    } catch (error) {
        console.error('Error fetching vehicle:', error)
        throw error
    }
}

export const addVehicle = async (vehicleData: VehicleFormValues) => {
    try {
        const response = await BaseService.post("/vehicles", vehicleData)
        return response.data
    } catch (error) {
        console.error('Error adding vehicle:', error)
        throw error
    }
}

export const editVehicle = async (id: string, vehicleData: VehicleFormValues) => {
    try {
        const response = await BaseService.put(`/vehicles/${id}`, vehicleData)
        return response.data
    } catch (error) {
        console.error('Error editing vehicle:', error)
        throw error
    }
}

export const deleteVehicle = async (vehicleId: string) => {
    try {
        const response = await BaseService.delete(`/vehicles/${vehicleId}`)
        return response.data
    } catch (error) {
        console.error('Error deleting vehicle:', error)
        throw error
    }
}

