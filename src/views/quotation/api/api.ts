import BaseService from "@/services/BaseService";

interface IQuotationItem {
    description: string;
    uom: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    image?: {
        url: string;
        key: string;
        mimetype: string;
    };
}

type QuotationApi = {
    projectId: string;
    estimationId: string;
    validUntil: Date;
    scopeOfWork: string[];
    termsAndConditions: string[];
    items: IQuotationItem[];
    vatPercentage?: number;
    subtotal?: number;
    vatAmount?: number;
    netAmount?: number;
}

type QuotationApprovalApi = {
    isApproved: boolean;
    comment?: string;
}

export const createQuotation = async (data: QuotationApi, files?: File[]) => {
    try {
        const formData = new FormData();
        
        // Prepare data without files for proper stringification
        const { items, ...dataWithoutItems } = data;
        const itemsWithoutImages = items.map(item => {
            const { image, ...itemWithoutImage } = item;
            return itemWithoutImage;
        });

        // Append JSON data with proper structure
        formData.append('data', JSON.stringify({
            ...dataWithoutItems,
            items: itemsWithoutImages,
            project: data.projectId,  // Map projectId to project
            estimation: data.estimationId  // Map estimationId to estimation
        }));
        
        // Append files with correct field names
        if (files && files.length > 0) {
            files.forEach((file, index) => {
                if (file) {
                    formData.append(`items[${index}][image]`, file);
                }
            });
        }

        const response = await BaseService.post("/quotation", formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
        return response.data;
    } catch (error) {
        console.error("Error creating quotation:", error);
        throw error;
    }
}

export const updateQuotation = async (id: string, data: Partial<QuotationApi>, files?: File[]) => {
    try {
        const formData = new FormData();
        
        // Prepare data without files
        const { items, ...dataWithoutItems } = data;
        const itemsWithoutImages = items?.map(item => {
            const { image, ...itemWithoutImage } = item;
            return itemWithoutImage;
        }) || [];

        // Append JSON data
        formData.append('data', JSON.stringify({
            ...dataWithoutItems,
            items: itemsWithoutImages,
            project: data.projectId,
            estimation: data.estimationId
        }));
        
        // Append files
        if (files && files.length > 0) {
            files.forEach((file, index) => {
                if (file) {
                    formData.append(`items[${index}][image]`, file);
                }
            });
        }

        const response = await BaseService.put(`/quotation/${id}`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
        return response.data;
    } catch (error) {
        console.error("Error updating quotation:", error);
        throw error;
    }
}

// Rest of your API functions remain the same...
export const getQuotationByProject = async (projectId: string) => {
    try {
        const response = await BaseService.get(`/quotation/project/${projectId}`);
        return response.data;
    } catch (error) {
        console.error("Error fetching quotation:", error);
        throw error;
    }
}

export const approveQuotation = async (id: string, data: QuotationApprovalApi) => {
    try {
        const response = await BaseService.patch(`/quotation/${id}/approval`, data);
        return response.data;
    } catch (error) {
        console.error("Error approving/rejecting quotation:", error);
        throw error;
    }
}

export const deleteQuotation = async (id: string) => {
    try {
        const response = await BaseService.delete(`/quotation/${id}`);
        return response.data;
    } catch (error) {
        console.error("Error deleting quotation:", error);
        throw error;
    }
}

export const generateQuotationPdf = async (id: string) => {
    try {
        const response = await BaseService.get(`/quotation/${id}/quotation-pdf`, {
            responseType: 'arraybuffer',
            headers: {
                'Accept': 'application/pdf'
            }
        });
        return response.data;
    } catch (error) {
        console.error("Error generating quotation PDF:", error);
        throw error;
    }
}



export const uploadQuotationItemImage = async (quotationId: string, itemIndex: number, file: File) => {
    try {
        const formData = new FormData();
        formData.append('image', file);
        
        const response = await BaseService.post(
            `/quotation/${quotationId}/items/${itemIndex}/image`,
            formData,
            {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            }
        );
        return response.data;
    } catch (error) {
        console.error("Error uploading item image:", error);
        throw error;
    }
}




export const downloadQuotationnPdf = async (id: string, fileName: string) => {
    try {
      const response = await BaseService.get(`/quotation/${id}/generate-pdf`, {
        responseType: 'arraybuffer',
        headers: {
          'Accept': 'application/pdf'
        }
      });
  
      // Verify response contains data
      if (!response.data || response.data.byteLength === 0) {
        throw new Error('Received empty PDF data');
      }
  
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName || `estimation-${id}.pdf`;
      link.style.display = 'none';
      
      document.body.appendChild(link);
      link.click();
      
      // Cleanup
      setTimeout(() => {
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      }, 100);
      
    } catch (error) {
      console.error('PDF Download Error:', error);
      throw error;
    }
  };