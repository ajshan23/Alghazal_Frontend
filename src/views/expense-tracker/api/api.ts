import BaseService from "@/services/BaseService";

export const getProjectLaborData = async (projectId: string) => {
  try {
    const response = await BaseService.get(`/expense/project/${projectId}/labor-data`);
    return response.data;
  } catch (error) {
    console.error("Error fetching labor data:", error);
    throw error;
  }
};

export const createExpense = async (projectId: string, formData: FormData) => {
  return BaseService.post(`/expense/project/${projectId}`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
};

export const fetchExpense = async (expenseId: string) => {
  try {
    const response = await BaseService.get(`/expense/${expenseId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching expense:", error);
    throw error;
  }
};

export const updateExpense = async (expenseId: string, formData: FormData) => {
  try {
    const response = await BaseService.put(`/expense/${expenseId}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  } catch (error) {
    console.error("Error updating expense:", error);
    throw error;
  }
};

export const getProjectExpenses = async (projectId: string, page = 1, limit = 10) => {
  try {
    const response = await BaseService.get(`/expense/project/${projectId}`, {
      params: { page, limit }
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching project expenses:", error);
    throw error;
  }
};

export const getExpenseSummary = async (projectId: string) => {
  try {
    const response = await BaseService.get(`/expense/project/${projectId}/summary`);
    return response.data;
  } catch (error) {
    console.error("Error fetching expense summary:", error);
    throw error;
  }
};

export const deleteExpense = async (expenseId: string) => {
  try {
    const response = await BaseService.delete(`/expense/${expenseId}`);
    return response.data;
  } catch (error) {
    console.error("Error deleting expense:", error);
    throw error;
  }
};

export const downloadPdf = async (id: string, fileName: string) => {
  try {
    const response = await BaseService.get(`/expense/${id}/pdf`, {
      responseType: 'blob',
      headers: {
        'Accept': 'application/pdf'
      }
    });

    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', fileName || `expense-${id}.pdf`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error('PDF Download Error:', error);
    throw error;
  }
};