import BaseService from "@/services/BaseService"

// services/InvoiceService.ts
export const fetchInvoiceData = async (projectId: string) => {
    try {
      const response = await BaseService.get(`/project/${projectId}/invoice`);
      if (!response.data) {
        throw new Error('No data received from server');
      }
      return response.data.data;
    } catch (error) {
      console.error('API Error:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch invoice data');
    }
  };

export const downloadInvoicePdf = async (projectId: string) => {
    try {
        console.log("Downloading invoice PDF for project:", projectId);
        const response = await BaseService.get(`/project/${projectId}/invoice/pdf`, {
            responseType: 'blob' // Important for file downloads
        })
        return response.data
    } catch (error) {
        console.error("Error downloading invoice PDF:", error)
        throw error
    }
}
export const addGrnNumber = async (projectId: string, grnNumber: string) => {
    try {
        const response = await BaseService.put(`/project/${projectId}/grn-number`, { grnNumber })
        return response.data
    } catch (error) {
        console.error("Error adding GRN number:", error)
        throw error
    }
}

// services/InvoiceService.ts
export const setWorkStartDate = async (projectId: string, workStartDate: string) => {
    try {
        const response = await BaseService.patch(`/project/${projectId}/work-start-date`, { 
            workStartDate: new Date(workStartDate).toISOString() 
        });
        return response.data;
    } catch (error) {
        console.error("Error setting work start date:", error);
        throw error;
    }
}

export const setWorkEndDate = async (projectId: string, workEndDate: string) => {
    try {
        const response = await BaseService.patch(`/project/${projectId}/work-end-date`, { 
            workEndDate: new Date(workEndDate).toISOString() 
        });
        return response.data;
    } catch (error) {
        console.error("Error setting work end date:", error);
        throw error;
    }
}

export const getWorkDuration = async (projectId: string) => {
    try {
        const response = await BaseService.get(`/project/${projectId}/work-duration`);
        return response.data;
    } catch (error) {
        console.error("Error getting work duration:", error);
        throw error;
    }
}