import BaseService from "@/services/BaseService";

// Quotation Types
interface IQuotationItem {
    description: string;
    uom: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
}

interface QuotationData {
    _id: string;
    quotationNumber: string;
    date: string;
    validUntil: string;
    project: {
        _id: string;
        projectName: string;
        location:string;
    };
    preparedBy: {
        _id: string;
        firstName: string;
        lastName: string;
    };
    items: IQuotationItem[];
    images: QuotationImage[];
    subtotal: number;
    vatPercentage: number;
    vatAmount: number;
    netAmount: number;
    scopeOfWork: string[];
    termsAndConditions: string[];
    createdAt: string;
    updatedAt: string;
}

interface QuotationImage {
    _id: string;
    title: string;
    imageUrl: string;
    uploadedAt: string;
}

interface CreateQuotationData {
    project: string;
    estimation: string;
    validUntil: Date;
    scopeOfWork: string[];
    termsAndConditions: string[];
    items: IQuotationItem[];
    vatPercentage?: number;
}

interface ImageUploadData {
    quotationId: string;
    images: File[];
    titles: string[];
    // Remove descriptions
}

interface QuotationApprovalData {
    isApproved: boolean;
    comment?: string;
}

// Quotation API Functions
export const createQuotation = async (data: CreateQuotationData): Promise<{ data: QuotationData }> => {
    try {
        const response = await BaseService.post("/quotation", data);
        return response.data;
    } catch (error) {
        console.error("Error creating quotation:", error);
        throw error;
    }
}

export const updateQuotation = async (id: string, data: Partial<CreateQuotationData>): Promise<{ data: QuotationData }> => {
    try {
        const response = await BaseService.put(`/quotation/${id}`, data);
        return response.data;
    } catch (error) {
        console.error("Error updating quotation:", error);
        throw error;
    }
}

export const getQuotationByProject = async (projectId: string): Promise<{ data: QuotationData }> => {
    try {
        const response = await BaseService.get(`/quotation/project/${projectId}`);
        return response.data;
    } catch (error) {
        console.error("Error fetching quotation:", error);
        throw error;
    }
}

export const approveQuotation = async (id: string, data: QuotationApprovalData): Promise<{ data: QuotationData }> => {
    try {
        const response = await BaseService.patch(`/quotation/${id}/approval`, data);
        return response.data;
    } catch (error) {
        console.error("Error approving/rejecting quotation:", error);
        throw error;
    }
}

export const deleteQuotation = async (id: string): Promise<void> => {
    try {
        const response = await BaseService.delete(`/quotation/${id}`);
        return response.data;
    } catch (error) {
        console.error("Error deleting quotation:", error);
        throw error;
    }
}

export const uploadQuotationImages = async (data: ImageUploadData): Promise<{ data: QuotationData }> => {
    try {
        const formData = new FormData();
        
        // Append each image
        data.images.forEach((image) => {
            formData.append('images', image);
        });
        
        // Append titles only
        data.titles.forEach((title) => {
            formData.append('titles', title);
        });

        const response = await BaseService.post(
            `/quotation/${data.quotationId}/images`,
            formData,
            {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            }
        );
        return response.data;
    } catch (error) {
        console.error("Error uploading quotation images:", error);
        throw error;
    }
}

export const getQuotationImages = async (quotationId: string): Promise<{ data: QuotationImage[] }> => {
    try {
        const response = await BaseService.get(`/quotation/${quotationId}/images`);
        return response.data;
    } catch (error) {
        console.error("Error fetching quotation images:", error);
        throw error;
    }
}

export const deleteQuotationImage = async (quotationId: string, imageId: string): Promise<{ data: QuotationData }> => {
    try {
        const response = await BaseService.delete(`/quotation/${quotationId}/images/${imageId}`);
        return response.data;
    } catch (error) {
        console.error("Error deleting quotation image:", error);
        throw error;
    }
}

export const downloadQuotationPdf = async ({id, quotationNumber, projectName,location}: {id: string, quotationNumber: string, projectName: string,location:string}): Promise<void> => {
    try {
        const response = await BaseService.get(
            `/quotation/${id}/generate-pdf`,
            { 
                responseType: 'blob',
                headers: {
                    'Accept': 'application/pdf'
                }
            }
        );

        // Verify response contains data
        if (!response.data || response.data.byteLength === 0) {
            throw new Error('Received empty PDF data');
        }

        const blob = new Blob([response.data], { type: 'application/pdf' });
        const url = window.URL.createObjectURL(blob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = `${quotationNumber} ${projectName} -${location}.pdf`;
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
}
export const sendQuotationEmail = async (id: string, ccEmails: string[] = []): Promise<void> => {
    try {
        const response = await BaseService.post(`/quotation/${id}/send-email`, {
            cc: ccEmails
        });
        return response.data;
    } catch (error) {
        console.error("Error sending quotation email:", error);
        throw error;
    }
}

export const updateQuotationImage = async (
  quotationId: string, 
  imageId: string, 
  data: {
    title?: string;
    // Remove description
  }
): Promise<{ data: QuotationData }> => {
  try {
    const response = await BaseService.patch(
      `/quotation/${quotationId}/images/${imageId}`,
      data
    );
    return response.data;
  } catch (error) {
    console.error("Error updating quotation image:", error);
    throw error;
  }
}

export const replaceQuotationImage = async (
  quotationId: string,
  imageId: string,
  imageFile: File
): Promise<{ data: QuotationData }> => {
  try {
    const formData = new FormData();
    formData.append('image', imageFile);

    const response = await BaseService.put(
      `/quotation/${quotationId}/images/${imageId}/replace`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error replacing quotation image:", error);
    throw error;
  }
}

// Work Completion API Functions
interface CompletionData {
    _id: string;
    referenceNumber: string;
    fmContractor: string;
    subContractor: string;
    projectDescription: string;
    location: string;
    completionDate: string;
    lpoNumber: string;
    lpoDate: string;
    handover: {
        company: string;
        name: string;
        signature: string;
        date: string;
    };
    acceptance: {
        company: string;
        name: string;
        signature: string;
        date: string;
    };
    sitePictures: Array<{
        url: string;
        caption?: string;
    }>;
    project: {
        _id: string;
        projectName: string;
    };
    preparedBy: {
        _id: string;
        firstName: string;
        lastName: string;
    };
    createdAt: string;
    updatedAt: string;
}

interface CompletionImageUploadData {
    projectId: string;
    images: File[];
    titles: string[];
    descriptions?: string[];
}

export const apiGetCompletionData = async (projectId: string): Promise<{ data: CompletionData }> => {
    try {
        const response = await BaseService.get(`/work-completion/project/${projectId}/work-comp`);
        return response.data;
    } catch (error) {
        console.error("Error fetching completion data:", error);
        throw error;
    }
}

export const apiUploadCompletionImages = async (data: CompletionImageUploadData): Promise<{ data: CompletionData }> => {
    try {
        const formData = new FormData();
        
        data.images.forEach((image) => {
            formData.append('images', image);
        });
        
        data.titles.forEach((title) => {
            formData.append('titles', title);
        });
        
        if (data.descriptions) {
            data.descriptions.forEach((desc) => {
                formData.append('descriptions', desc);
            });
        }

        const response = await BaseService.post(
            `/work-completion/project/${data.projectId}/images`,
            formData,
            {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            }
        );
        return response.data;
    } catch (error) {
        console.error("Error uploading completion images:", error);
        throw error;
    }
}

export const apiCreateWorkCompletion = async (projectId: string): Promise<{ data: CompletionData }> => {
    try {
        const response = await BaseService.post('/work-completion', { projectId });
        return response.data;
    } catch (error) {
        console.error("Error creating work completion:", error);
        throw error;
    }
}

export const apiDownloadCompletionCertificate = async (projectId: string): Promise<void> => {
    try {
        const response = await BaseService.get(
            `/work-completion/project/${projectId}/certificate`,
            { responseType: 'blob' }
        );
        
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `completion-certificate.pdf`);
        document.body.appendChild(link);
        link.click();
        
        link.parentNode?.removeChild(link);
        window.URL.revokeObjectURL(url);
        
        return response.data;
    } catch (error) {
        console.error("Error downloading completion certificate:", error);
        throw error;
    }
}

export const apiUpdateCompletionDate = async (projectId: string, date: string): Promise<{ data: CompletionData }> => {
    try {
        const response = await BaseService.put(
            `/work-completion/project/${projectId}/completion-date`,
            { date }
        );
        return response.data;
    } catch (error) {
        console.error("Error updating completion date:", error);
        throw error;
    }
};

export const apiUpdateHandoverDate = async (projectId: string, date: string): Promise<{ data: CompletionData }> => {
    try {
        const response = await BaseService.put(
            `/work-completion/project/${projectId}/handover-date`,
            { date }
        );
        return response.data;
    } catch (error) {
        console.error("Error updating handover date:", error);
        throw error;
    }
};

export const apiUpdateAcceptanceDate = async (projectId: string, date: string): Promise<{ data: CompletionData }> => {
    try {
        const response = await BaseService.put(
            `/work-completion/project/${projectId}/acceptance-date`,
            { date }
        );
        return response.data;
    } catch (error) {
        console.error("Error updating acceptance date:", error);
        throw error;
    }
};

// Export types
export type {
    QuotationData,
    QuotationImage,
    CreateQuotationData,
    CompletionData
};