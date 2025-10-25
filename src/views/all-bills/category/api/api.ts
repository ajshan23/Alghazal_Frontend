import BaseService from "@/services/BaseService"

export const fetchCategories = async ({ page, limit, search }) => {
    try {
        const response = await BaseService.get(`/categories`, {
            params: {
                page,
                limit,
                search,
            },
        })
        return response.data
    } catch (error) {
        console.error('Error fetching categories:', error)
        throw error
    }
}

export const fetchCategoryById = async (id: string) => {
    try {
        const response = await BaseService.get(`/categories/${id}`)

        console.log(response, "from single category")
        return {
            ...response.data,
            phoneNumbers: Array.isArray(response.data.phoneNumbers)
                ? response.data.phoneNumbers
                : [response.data.phoneNumbers || ''],
            profileImage: response.data.profileImage || '',
            signatureImage: response.data.signatureImage || '',
            emiratesIdDocument: response.data.emiratesIdDocument || '',
            passportDocument: response.data.passportDocument || ''
        }
    } catch (error) {
        console.error('Error fetching category:', error)
        throw error
    }
}

export const addCategory = async (categoryData: CategoryFormModel) => {
    try {
        const response = await BaseService.post("/categories/", categoryData)
        return response
    } catch (error) {
        console.error('Error adding category:', error)
        throw error
    }
}
export const editCategory = async (id: string, payload: {
    name: string;
    description?: string;
}) => {
    try {
        const response = await BaseService.put(`/categories/${id}`, payload)
        return response.data
    } catch (error) {
        console.error('Error editing category:', error)
        throw error
    }
}
export const deleteCategory = async (categoryId: string) => {
    try {
        const response = await BaseService.delete(`/categories/${categoryId}`)
        return response
    } catch (error) {
        console.error('Error deleting category:', error)
        throw error
    }
}
