import BaseService from "@/services/BaseService"

interface ILPOItem {
    description: string
    quantity: number
    unitPrice: number
    totalPrice: number
}

interface ILPODocument {
    url: string
    key: string
    name: string
    mimetype: string
    size: number
}

type LPOApi = {
    project: string
    lpoNumber: string
    lpoDate: Date
    supplier: string
    items: ILPOItem[]
    documents: File[]
}

export const createLPO = async (data: FormData) => {
    try {
        const response = await BaseService.post("/lpo", data, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        })
        return response.data
    } catch (error) {
        console.error('Error creating LPO:', error)
        throw error
    }
}

// export const fetchLPOsByProject = async (projectId: string) => {
//     try {
//         const response = await BaseService.get(`/lpo/project/${projectId}`)
//         return response.data
//     } catch (error) {
//         console.error('Error fetching LPOs:', error)
//         throw error
//     }
// }

export const fetchLPODetails = async (id: string) => {
    try {
        const response = await BaseService.get(`/lpo/project/${id}`)
        return response.data
    } catch (error) {
        console.error('Error fetching LPO details:', error)
        throw error
    }
}

export const updateLPO = async (id: string, data: FormData) => {
    try {
        const response = await BaseService.put(`/lpo/${id}`, data, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        })
        return response.data
    } catch (error) {
        console.error('Error updating LPO:', error)
        throw error
    }
}

export const deleteLPO = async (id: string) => {
    try {
        const response = await BaseService.delete(`/lpo/${id}`)
        return response.data
    } catch (error) {
        console.error('Error deleting LPO:', error)
        throw error
    }
}

export const generateLpoPdf = async (id: string) => {
    try {
        const response = await BaseService.get(`/lpo/${id}/generate-pdf`)
        return response.data
    } catch (error) {
        console.error('Error generating LPO PDF:', error)
        throw error
    }
}

export const downloadLpoPdf = async (id: string, fileName: string) => {
    try {
        const response = await BaseService.get(`/lpo/${id}/generate-pdf`, {
            responseType: 'arraybuffer',
            headers: {
                'Accept': 'application/pdf'
            }
        })

        if (!response.data || response.data.byteLength === 0) {
            throw new Error('Received empty PDF data')
        }

        const blob = new Blob([response.data], { type: 'application/pdf' })
        const url = window.URL.createObjectURL(blob)
        
        const link = document.createElement('a')
        link.href = url
        link.download = fileName || `lpo-${id}.pdf`
        link.style.display = 'none'
        
        document.body.appendChild(link)
        link.click()
        
        setTimeout(() => {
            document.body.removeChild(link)
            window.URL.revokeObjectURL(url)
        }, 100)
        
    } catch (error) {
        console.error('LPO PDF Download Error:', error)
        throw error
    }
}

// Helper function to prepare FormData for LPO creation/update
export const prepareLPOFormData = (lpoData: {
    projectId: string
    lpoNumber: string
    lpoDate: string
    supplier: string
    items: Array<{
        description: string
        quantity: number
        unitPrice: number
    }>
    documents: File[]
}): FormData => {
    const formData = new FormData()
    
    formData.append('projectId', lpoData.projectId)
    formData.append('lpoNumber', lpoData.lpoNumber)
    formData.append('lpoDate', lpoData.lpoDate)
    formData.append('supplier', lpoData.supplier)
    formData.append('items', JSON.stringify(lpoData.items))
    
    lpoData.documents.forEach((file, index) => {
        formData.append(`documents`, file)
    })
    
    return formData
}


// Add these interfaces
export interface LPOSummary {
    _id: string;
    lpoNumber: string;
    lpoDate: string;
    supplier: string;
    totalAmount: number;
    project: {
      _id: string;
      projectName: string;
    };
    createdBy: {
      _id: string;
      firstName: string;
      lastName: string;
    };
  }
  
  // Add this function
  export const fetchLPOsByProjectId = async (projectId: string): Promise<LPOSummary[]> => {
    try {
      const response = await BaseService.get(`/lpo/project/${projectId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching project LPOs:', error);
      throw error;
    }
  };