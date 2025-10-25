import BaseService from "@/services/BaseService";

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

interface ImageUploadData {
  projectId: string;
  images: File[];
  titles: string[];
  descriptions?: string[];
}

export const apiGetCompletionData = async (projectId: string): Promise<{ data: CompletionData }> => {
  try {
    const response = await BaseService.get(`/work-completion/project/${projectId}/work-comp`);
    console.log(response.data);
    
    return response.data;
  } catch (error) {
    console.error("Error fetching completion data:", error);
    throw error;
  }
}

export const apiUploadCompletionImages = async (data: {
    projectId: string;
    images: File[];
    titles: string[];
    descriptions?: string[];
  }): Promise<{ data: CompletionData }> => {
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
  };

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

// Add send email function
export const apiSendWorkCompletionEmail = async (projectId: string, ccEmails: string[] = []): Promise<void> => {
  try {
    const response = await BaseService.post(
      `/work-completion/project/${projectId}/send-email`,
      { cc: ccEmails }
    );
    return response.data;
  } catch (error) {
    console.error("Error sending work completion email:", error);
    throw error;
  }
};

export type { CompletionData };