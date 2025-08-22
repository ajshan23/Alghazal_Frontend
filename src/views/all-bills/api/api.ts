import BaseService from '@/services/BaseService'

export const fetchUser = async () => {
    try {
        const response = await BaseService.get(`/user`)
        return response.data
    } catch (error) {
        console.error('Error fetching user:', error)
        throw error
    }
}

export const fetchShops = async () => {
    try {
        const response = await BaseService.get(`/shops`)
        return response.data
    } catch (error) {
        console.error('Error fetching shops:', error)
        throw error
    }
}

export const fetchCategories = async () => {
    try {
        const response = await BaseService.get(`/categories`)
        return response.data
    } catch (error) {
        console.error('Error fetching categories:', error)
        throw error
    }
}

export const fetchVehicles = async () => {
    try {
        const response = await BaseService.get(`/vehicles`)
        return response.data
    } catch (error) {
        console.error('Error fetching categories:', error)
        throw error
    }
}

export const getBills = async ({
    page,
    limit,
    search,
    billType,
    month,
    year,
    startDate,
    endDate,
    category,
    shop,
    vehicle,
    paymentMethod,
}) => {
    try {
        const response = await BaseService.get(`/bills`, {
            params: {
                page,
                limit,
                search,
                billType,
                month,
                year,
                startDate,
                endDate,
                category,
                shop,
                vehicle,
                paymentMethod,
            },
        })
        return response.data
    } catch (error) {
        console.error('Error fetching bills:', error)
        throw error
    }
}

export const addBill = async (formData: FormData) => {
    try {
        const response = await BaseService.post('/bills/', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        })
        return response
    } catch (error) {
        console.error('Error adding user:', error)
        throw error
    }
}

export const editBill = async (id: string, formData: FormData) => {
    try {
        const response = await BaseService.put(`/bills/${id}`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        })
        return response
    } catch (error) {
        console.error('Error editing user:', error)
        throw error
    }
}

export const fetchBillById = async (id: string) => {
    try {
        const response = await BaseService.get(`/bills/${id}`)
        return {
            ...response.data,
            attachments: Array.isArray(response.data.attachments)
                ? response.data.attachments
                : response.data.attachments
                  ? [response.data.attachments]
                  : [],
            category: response.data.category || { _id: '', name: '' },
            shop: response.data.shop || { _id: '', shopName: '' },
            billDate:
                response.data.billDate ||
                new Date().toISOString().split('T')[0],
            amount: Number(response.data.amount) || 0,
            invoiceNo: response.data.invoiceNo || '',
            remarks: response.data.remarks || '',
            paymentMethod: response.data.paymentMethod || '',
        }
    } catch (error) {
        console.error('Error fetching bill:', error)
        throw error
    }
}
export const deleteBill = async (id: string) => {
    try {
        const response = await BaseService.delete(`/bills/${id}`)
        return response
    } catch (error) {
        console.error('Error deleting bill:', error)
        throw error
    }
}
export const exportBillToExcel = async ({
    search,
    billType,
    month,
    year,
    startDate,
    endDate,
    category,
    shop,
    vehicle,
    paymentMethod,
}: {
    search?: string
    billType?: string
    month?: number
    year?: number
    startDate?: string
    endDate?: string
    category?: string
    shop?: string
    vehicle?: string
    paymentMethod?: string
}) => {
    try {
        // Prepare params object with proper typing
        const params: Record<string, any> = {
            search,
            billType,
            month,
            year,
            startDate: startDate
                ? new Date(startDate).toISOString()
                : undefined,
            endDate: endDate ? new Date(endDate).toISOString() : undefined,
            category,
            shop,
            vehicle,
            paymentMethod,
        }

        // Clean up undefined parameters
        Object.keys(params).forEach(
            (key) => params[key] === undefined && delete params[key],
        )

        const response = await BaseService.get('/bills/export/excel', {
            params,
            responseType: 'blob',
        })

        // Validate response
        if (!response.data) {
            throw new Error('No data received from server')
        }

        // Create filename with current date and bill type
        const filename = `bills_export_${billType || 'all'}_${new Date()
            .toISOString()
            .slice(0, 10)}.xlsx`

        // Create download link
        const url = window.URL.createObjectURL(
            new Blob([response.data], {
                type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            }),
        )

        const link = document.createElement('a')
        link.href = url
        link.setAttribute('download', filename)
        document.body.appendChild(link)
        link.click()

        // Clean up
        setTimeout(() => {
            document.body.removeChild(link)
            window.URL.revokeObjectURL(url)
        }, 100)

        return true
    } catch (error) {
        console.error('Error exporting bills:', error)

        // Enhanced error handling
        let errorMessage = 'Failed to export bills'
        if (error instanceof Error) {
            errorMessage = error.message
        } else if (typeof error === 'string') {
            errorMessage = error
        }

        throw new Error(errorMessage)
    }
}
//Report Sections and Expenses --- [ADIB REPORT & EXPENSES]
export const getAdibReportAndExpenses = async ({
    page,
    limit,
    search,
    reportType,
    month,
    year,
    startDate,
    endDate,
    category,
    shop,
}) => {
    try {
        const response = await BaseService.get(`/bank`, {
            params: {
                page,
                limit,
                search,
                reportType,
                month,
                year,
                startDate,
                endDate,
                category,
                shop,
            },
        })
        return response.data
    } catch (error) {
        console.error('Error fetching reports:', error)
        throw error
    }
}

export const addAdibReportAndExpenses = async (formData: FormData) => {
    try {
        const response = await BaseService.post('/bank/', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        })
        return response
    } catch (error) {
        console.error('Error adding Aadib report:', error)
        throw error
    }
}

export const editAdibReportAndExpenses = async (
    id: string,
    formData: FormData,
) => {
    try {
        const response = await BaseService.put(`/bank/${id}`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        })
        return response
    } catch (error) {
        console.error('Error editing Aadib report:', error)
        throw error
    }
}

export const fetchAdibReportAndExpensesById = async (id: string) => {
    try {
        const response = await BaseService.get(`/bank/${id}`)
        return {
            ...response.data,
            reportDate:
                response.data.reportDate ||
                new Date().toISOString().split('T')[0],
            amount: Number(response.data.amount) || 0,
            category: response.data.category || { _id: '', name: '' },
            shop: response.data.shop || { _id: '', shopName: '' },
            remarks: response.data.remarks || '',
        }
    } catch (error) {
        console.error('Error fetching Aadib report:', error)
        throw error
    }
}

export const deleteAdibReportAndExpenses = async (id: string) => {
    try {
        const response = await BaseService.delete(`/bank/${id}`)
        return response
    } catch (error) {
        console.error('Error deleting Aadib report:', error)
        throw error
    }
}
export const exportReportToExcel = async ({
    search,
    reportType,
    month,
    year,
    startDate,
    endDate,
    category,
    shop,
    employee,
}: {
    search?: string
    reportType?: string
    month?: number
    year?: number
    startDate?: string
    endDate?: string
    category?: string
    shop?: string
    employee?: string
}) => {
    try {
        // Prepare params object with proper typing
        const params: Record<string, any> = {
            search,
            reportType,
            month,
            year,
            startDate: startDate
                ? new Date(startDate).toISOString()
                : undefined,
            endDate: endDate ? new Date(endDate).toISOString() : undefined,
            category,
            shop,
            employee,
        }

        // Clean up undefined parameters
        Object.keys(params).forEach(
            (key) => params[key] === undefined && delete params[key],
        )

        const response = await BaseService.get('/bank/export/excel', {
            params,
            responseType: 'blob',
        })

        // Validate response
        if (!response.data) {
            throw new Error('No data received from server')
        }

        // Create filename with current date and bill type
        const filename = `${reportType || 'Report'}_${new Date()
            .toISOString()
            .slice(0, 10)}.xlsx`

        // Create download link
        const url = window.URL.createObjectURL(
            new Blob([response.data], {
                type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            }),
        )

        const link = document.createElement('a')
        link.href = url
        link.setAttribute('download', filename)
        document.body.appendChild(link)
        link.click()

        // Clean up
        setTimeout(() => {
            document.body.removeChild(link)
            window.URL.revokeObjectURL(url)
        }, 100)

        return true
    } catch (error) {
        console.error('Error exporting bills:', error)

        // Enhanced error handling
        let errorMessage = 'Failed to export bills'
        if (error instanceof Error) {
            errorMessage = error.message
        } else if (typeof error === 'string') {
            errorMessage = error
        }

        throw new Error(errorMessage)
    }
}
//---------------------Project Profit Report
export const getProfitReport = async ({
    page,
    limit,
    search,
    month,
    year,
    startDate,
    endDate,
}) => {
    try {
        const response = await BaseService.get(`/project-profit`, {
            params: {
                page,
                limit,
                search,
                month,
                year,
                startDate,
                endDate,
            },
        })
        return response.data
    } catch (error) {
        console.error('Error fetching reports:', error)
        throw error
    }
}
export const addProjectProfitReport = async (formData: FormData) => {
    try {
        const response = await BaseService.post('/project-profit/', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        })
        return response
    } catch (error) {
        console.error('Error adding Aadib report:', error)
        throw error
    }
}
export const editProjectProfitReport = async (
    id: string,
    formData: FormData,
) => {
    try {
        const response = await BaseService.put(
            `/project-profit/${id}`,
            formData,
            {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            },
        )
        return response
    } catch (error) {
        console.error('Error editing Aadib report:', error)
        throw error
    }
}
export const fetchProjectProfitReportById = async (id: string) => {
    try {
        const response = await BaseService.get(`/project-profit/${id}`)
        return {
            ...response.data,
            reportDate:
                response.data.reportDate ||
                new Date().toISOString().split('T')[0],
            amount: Number(response.data.amount) || 0,
            category: response.data.category || { _id: '', name: '' },
            shop: response.data.shop || { _id: '', shopName: '' },
            remarks: response.data.remarks || '',
        }
    } catch (error) {
        console.error('Error fetching Aadib report:', error)
        throw error
    }
}
export const deleteProjectProfitReport = async (id: string) => {
    try {
        const response = await BaseService.delete(`/project-profit/${id}`)
        return response
    } catch (error) {
        console.error('Error deleting Aadib report:', error)
        throw error
    }
}
export const exportProfitReportToExcel = async ({
    search,
    month,
    year,
    startDate,
    endDate,
    page,
    limit,
}: {
    search?: string
    month?: number
    year?: number
    startDate?: string
    endDate?: string
    page?: number
    limit?: number
}) => {
    try {
        // Prepare params object with proper typing
        const params: {
            search?: string
            month?: number
            year?: number
            startDate?: string
            endDate?: string
            page?: number
            limit?: number
        } = {
            search,
            month,
            year,
            page,
            limit,
        }

        // Add date params only if they exist
        if (startDate) {
            params.startDate = new Date(startDate).toISOString()
        }
        if (endDate) {
            params.endDate = new Date(endDate).toISOString()
        }

        // Clean up undefined parameters
        Object.keys(params).forEach(
            (key) =>
                params[key as keyof typeof params] === undefined &&
                delete params[key as keyof typeof params],
        )

        const response = await BaseService.get('/project-profit/export/excel', {
            params,
            responseType: 'blob',
        })

        // Validate response
        if (!response.data) {
            throw new Error('No data received from server')
        }

        // Create filename with current date
        const now = new Date()
        const formattedDate = `${now.getFullYear()}-${String(
            now.getMonth() + 1,
        ).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
        const filename = `profit_report_${formattedDate}.xlsx`

        // Create download link
        const url = window.URL.createObjectURL(
            new Blob([response.data], {
                type:
                    response.headers['content-type'] ||
                    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            }),
        )

        const link = document.createElement('a')
        link.href = url
        link.setAttribute('download', filename)
        document.body.appendChild(link)
        link.click()

        // Clean up
        setTimeout(() => {
            document.body.removeChild(link)
            window.URL.revokeObjectURL(url)
        }, 100)

        return true
    } catch (error) {
        console.error('Error exporting profit report:', error)

        // Enhanced error handling
        let errorMessage = 'Failed to export profit report'
        if (error instanceof Error) {
            errorMessage = error.message
        } else if (typeof error === 'string') {
            errorMessage = error
        } else if (error && typeof error === 'object' && 'message' in error) {
            errorMessage = (error as { message: string }).message
        }

        throw new Error(errorMessage)
    }
}
//---------------------Payroll Report
export const getPayrollReport = async ({
    page,
    limit,
    search,
    startDate,
    endDate,
    month,
    year,
    employee,
}: {
    page?: number
    limit?: number
    search?: string
    startDate?: string
    endDate?: string
    month?: number
    year?: number
    employee?: string
}) => {
    try {
        const response = await BaseService.get(`/payroll`, {
            params: {
                page,
                limit,
                search,
                startDate,
                endDate,
                month,
                year,
                employee,
            },
        })
        return response.data
    } catch (error) {
        console.error('Error fetching payroll reports:', error)
        throw error
    }
}

export const addPayrollReport = async (payrollData: any) => {
    try {
        const response = await BaseService.post('/payroll/', payrollData);
        return response;
    } catch (error) {
        console.error('Error adding payroll report:', error);
        throw error;
    }
};

export const editPayrollReport = async (id: string, payrollData: any) => {
    try {
        const response = await BaseService.put(`/payroll/${id}`, payrollData);
        return response;
    } catch (error) {
        console.error('Error editing payroll report:', error);
        throw error;
    }
};

export const fetchPayrollReportById = async (id: string) => {
    try {
        const response = await BaseService.get(`/payroll/${id}`)
        return {
            ...response.data,
            paymentDate:
                response.data.paymentDate ||
                new Date().toISOString().split('T')[0],
            basicSalary: Number(response.data.basicSalary) || 0,
            allowances: Number(response.data.allowances) || 0,
            deductions: Number(response.data.deductions) || 0,
            netSalary: Number(response.data.netSalary) || 0,
            status: response.data.status || 'pending',
            employee: response.data.employee || {
                _id: '',
                name: '',
                designation: '',
            },
        }
    } catch (error) {
        console.error('Error fetching payroll report:', error)
        throw error
    }
}

export const deletePayrollReport = async (id: string) => {
    try {
        const response = await BaseService.delete(`/payroll/${id}`)
        return response
    } catch (error) {
        console.error('Error deleting payroll report:', error)
        throw error
    }
}

export const exportPayrollReportToExcel = async ({
    search,
    month,
    year,
    startDate,
    endDate,
    status,
    page,
    limit,
    employee,
}: {
    search?: string
    month?: number
    year?: number
    startDate?: string
    endDate?: string
    status?: string
    page?: number
    limit?: number
    employee?: string
}) => {
    try {
        // Prepare params object with proper typing
        const params: {
            page?: number
            limit?: number
            search?: string
            month?: number
            year?: number
            startDate?: string
            endDate?: string
            status?: string
            employee?: string
        } = {
            search,
            month,
            year,
            status,
            page,
            limit,
            employee,
        }

        // Add date params only if they exist
        if (startDate) {
            params.startDate = new Date(startDate).toISOString()
        }
        if (endDate) {
            params.endDate = new Date(endDate).toISOString()
        }

        // Clean up undefined parameters
        Object.keys(params).forEach(
            (key) =>
                params[key as keyof typeof params] === undefined &&
                delete params[key as keyof typeof params],
        )

        const response = await BaseService.get('/payroll/export/excel', {
            params,
            responseType: 'blob',
        })

        // Validate response
        if (!response.data) {
            throw new Error('No data received from server')
        }

        // Create filename with current date
        const now = new Date()
        const formattedDate = `${now.getFullYear()}-${String(
            now.getMonth() + 1,
        ).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
        const filename = `payroll_report_${formattedDate}.xlsx`

        // Create download link
        const url = window.URL.createObjectURL(
            new Blob([response.data], {
                type:
                    response.headers['content-type'] ||
                    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            }),
        )

        const link = document.createElement('a')
        link.href = url
        link.setAttribute('download', filename)
        document.body.appendChild(link)
        link.click()

        // Clean up
        setTimeout(() => {
            document.body.removeChild(link)
            window.URL.revokeObjectURL(url)
        }, 100)

        return true
    } catch (error) {
        console.error('Error exporting payroll report:', error)

        // Enhanced error handling
        let errorMessage = 'Failed to export payroll report'
        if (error instanceof Error) {
            errorMessage = error.message
        } else if (typeof error === 'string') {
            errorMessage = error
        } else if (error && typeof error === 'object' && 'message' in error) {
            errorMessage = (error as { message: string }).message
        }

        throw new Error(errorMessage)
    }
}

//------------Labour Expenses Report

export const getLabourExpensesReport = async ({
    page,
    limit,
    search,
    startDate,
    month,
    year,
    endDate,
    employee,
}: {
    page?: number
    limit?: number
    search?: string
    month?: number
    year?: number
    startDate?: string
    endDate?: string
    employee?: string
}) => {
    try {
        const response = await BaseService.get(`/employee-expenses/`, {
            params: {
                page,
                limit,
                search,
                month,
                year,
                employee,
                startDate,
                endDate,
            },
        })
        return response.data
    } catch (error) {
        console.error('Error fetching payroll reports:', error)
        throw error
    }
}

export const addLabourExpensesReport = async (data: any) => {
    try {
        const response = await BaseService.post('/employee-expenses/', data)
        return response
    } catch (error) {
        console.error('Error adding labour expenses report:', error)
        throw error
    }
}
export const editLabourExpensesReport = async (
    id: string,
    data: {
        reportType: string
        expenses: LabourExpenseItem[]
    },
) => {
    try {
        const response = await BaseService.put(`/employee-expenses/${id}`, data)
        return response
    } catch (error) {
        console.error('Error editing labour expenses report:', error)
        throw error
    }
}
export const deleteLabourExpensesReport = async (id: string) => {
    try {
        const response = await BaseService.delete(`/employee-expenses/${id}`)
        return response
    } catch (error) {
        console.error('Error deleting labour expenses report:', error)
        throw error
    }
}
export const fetchLabourExpensesById = async (id: string) => {
    try {
        const response = await BaseService.get(`/employee-expenses/${id}`)
        return {
            ...response.data,
            expenses:
                response.data.expenses?.map((expense: any) => ({
                    employee: expense.employee || '',
                    designation: expense.designation || '',
                    country: expense.country || '',
                    basicSalary: Number(expense.basicSalary) || 0,
                    allowance: Number(expense.allowance) || 0,
                    total: Number(expense.total) || 0,
                    twoYearSalary: Number(expense.twoYearSalary) || 0,
                    visaExpenses: Number(expense.visaExpenses) || 0,
                    twoYearUniform: Number(expense.twoYearUniform) || 0,
                    shoes: Number(expense.shoes) || 0,
                    twoYearAccommodation:
                        Number(expense.twoYearAccommodation) || 0,
                    sewaBills: Number(expense.sewaBills) || 0,
                    dewaBills: Number(expense.dewaBills) || 0,
                    insurance: Number(expense.insurance) || 0,
                    transport: Number(expense.transport) || 0,
                    water: Number(expense.water) || 0,
                    thirdPartyLiabilities:
                        Number(expense.thirdPartyLiabilities) || 0,
                    fairmontCertificate:
                        Number(expense.fairmontCertificate) || 0,
                    leaveSalary: Number(expense.leaveSalary) || 0,
                    ticket: Number(expense.ticket) || 0,
                    gratuity: Number(expense.gratuity) || 0,
                })) || [],
        }
    } catch (error) {
        console.error('Error fetching labour expenses report:', error)
        throw error
    }
}
export const exportEmployeeExpensesToExcel = async ({
    search,
    startDate,
    endDate,
    page,
    limit,
    employee,
    month,
    year,
}: {
    search?: string;
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
    employee?: string;
    month?: number;
    year?: number;
}): Promise<boolean> => {
    try {
        // Prepare params object
        const params: Record<string, string | number> = {
            ...(search && { search }),
            ...(page && { page }),
            ...(limit && { limit }),
            ...(month && { month }),
            ...(year && { year }),
            ...(employee && { employee }),
        };

        // Handle date formatting
        if (startDate) {
            params.startDate = new Date(startDate).toISOString();
        }
        if (endDate) {
            params.endDate = new Date(endDate).toISOString();
        }

        // Make the API request
        const response = await BaseService.get('/employee-expenses/export/excel', {
            params,
            responseType: 'blob',
        });

        if (!response.data) {
            throw new Error('No data received from server');
        }

        // Create filename with current date
        const now = new Date();
        const formattedDate = [
            now.getFullYear(),
            String(now.getMonth() + 1).padStart(2, '0'),
            String(now.getDate()).padStart(2, '0'),
        ].join('-');
        const filename = `Employee_Expenses_Report_${formattedDate}.xlsx`;

        // Create and trigger download
        const blob = new Blob([response.data], {
            type: response.headers['content-type'] || 
                 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        });

        const downloadUrl = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.setAttribute('download', filename);
        document.body.appendChild(link);
        link.click();

        // Cleanup
        setTimeout(() => {
            document.body.removeChild(link);
            URL.revokeObjectURL(downloadUrl);
        }, 100);

        return true;
    } catch (error: unknown) {
        console.error('Error exporting employee expenses:', error);

        let errorMessage = 'Failed to export employee expenses report';
        if (error instanceof Error) {
            errorMessage = error.message;
        } else if (typeof error === 'string') {
            errorMessage = error;
        }

        throw new Error(errorMessage);
    }
};
//--------------Visa Expenses Report

export const getVisaExpensesReport = async ({
    page,
    limit,
    search,
    startDate,
    month,
    year,
    endDate,
    employee,
}: {
    page?: number
    limit?: number
    search?: string
    startDate?: string
    endDate?: string
    employee?: string
    month?: number
    year?: number
}) => {
    try {
        const response = await BaseService.get(`/visa-expenses/`, {
            params: {
                page,
                limit,
                search,
                startDate,
                endDate,
                employee,
                month,
                year,
            },
        })
        return response.data
    } catch (error) {
        console.error('Error fetching visa expenses reports:', error)
        throw error
    }
}

export const addVisaExpensesReport = async (data: any) => {
    try {
        const response = await BaseService.post('/visa-expenses/', data)
        return response
    } catch (error) {
        console.error('Error adding visa expenses report:', error)
        throw error
    }
}

export const editVisaExpensesReport = async (
    id: string,
    data: {
        employee: string
        iBan: string
        passportNumber: string
        passportExpireDate: string
        emirateIdNumber: string
        emirateIdExpireDate: string
        labourCardPersonalNumber: string
        workPermitNumber: string
        labourExpireDate: string
        offerLetterTyping: number
        labourInsurance: number
        labourCardPayment: number
        statusChangeInOut: number
        insideEntry: number
        medicalSharjah: number
        tajweehSubmission: number
        iloeInsurance: number
        healthInsurance: number
        emirateId: number
        residenceStamping: number
        srilankaCouncilHead: number
        upscoding: number
        labourFinePayment: number
        labourCardRenewalPayment: number
        servicePayment: number
        visaStamping: number
        twoMonthVisitingVisa: number
        finePayment: number
        entryPermitOutside: number
        complaintEmployee: number
        arabicLetter: number
        violationCommittee: number
        quotaModification: number
        others: number
        total: number
    },
) => {
    try {
        const response = await BaseService.put(`/visa-expenses/${id}`, data)
        return response
    } catch (error) {
        console.error('Error editing visa expenses report:', error)
        throw error
    }
}

export const deleteVisaExpensesReport = async (id: string) => {
    try {
        const response = await BaseService.delete(`/visa-expenses/${id}`)
        return response
    } catch (error) {
        console.error('Error deleting visa expenses report:', error)
        throw error
    }
}

export const fetchVisaExpensesById = async (id: string) => {
    try {
        const response = await BaseService.get(`/visa-expenses/${id}`)
        return {
            ...response.data,
            employee: response.data.employee || '',
            iBan: response.data.iBan || '',
            passportNumber: response.data.passportNumber || '',
            passportExpireDate: response.data.passportExpireDate || '',
            emirateIdNumber: response.data.emirateIdNumber || '',
            emirateIdExpireDate: response.data.emirateIdExpireDate || '',
            labourCardPersonalNumber: response.data.labourCardPersonalNumber || '',
            workPermitNumber: response.data.workPermitNumber || '',
            labourExpireDate: response.data.labourExpireDate || '',
            offerLetterTyping: Number(response.data.offerLetterTyping) || 0,
            labourInsurance: Number(response.data.labourInsurance) || 0,
            labourCardPayment: Number(response.data.labourCardPayment) || 0,
            statusChangeInOut: Number(response.data.statusChangeInOut) || 0,
            insideEntry: Number(response.data.insideEntry) || 0,
            medicalSharjah: Number(response.data.medicalSharjah) || 0,
            tajweehSubmission: Number(response.data.tajweehSubmission) || 0,
            iloeInsurance: Number(response.data.iloeInsurance) || 0,
            healthInsurance: Number(response.data.healthInsurance) || 0,
            emirateId: Number(response.data.emirateId) || 0,
            residenceStamping: Number(response.data.residenceStamping) || 0,
            srilankaCouncilHead: Number(response.data.srilankaCouncilHead) || 0,
            upscoding: Number(response.data.upscoding) || 0,
            labourFinePayment: Number(response.data.labourFinePayment) || 0,
            labourCardRenewalPayment: Number(response.data.labourCardRenewalPayment) || 0,
            servicePayment: Number(response.data.servicePayment) || 0,
            visaStamping: Number(response.data.visaStamping) || 0,
            twoMonthVisitingVisa: Number(response.data.twoMonthVisitingVisa) || 0,
            finePayment: Number(response.data.finePayment) || 0,
            entryPermitOutside: Number(response.data.entryPermitOutside) || 0,
            complaintEmployee: Number(response.data.complaintEmployee) || 0,
            arabicLetter: Number(response.data.arabicLetter) || 0,
            violationCommittee: Number(response.data.violationCommittee) || 0,
            quotaModification: Number(response.data.quotaModification) || 0,
            others: Number(response.data.others) || 0,
            total: Number(response.data.total) || 0,
        }
    } catch (error) {
        console.error('Error fetching visa expenses report:', error)
        throw error
    }
}

export const exportVisaExpensesToExcel = async ({
    search,
    startDate,
    endDate,
    page,
    limit,
    employee,
    month,
    year,
}: {
    search?: string
    startDate?: string
    endDate?: string
    page?: number
    limit?: number
    employee?: string
    month?: number
    year?: number
}) => {
    try {
        const params: {
            search?: string
            startDate?: string
            endDate?: string
            page?: number
            limit?: number
            employee?: string
            month?: number
            year?: number
        } = {
            search,
            page,
            limit,
            startDate,
            endDate,
            month,
            year,
            employee,
        }

        if (startDate) {
            params.startDate = new Date(startDate).toISOString()
        }
        if (endDate) {
            params.endDate = new Date(endDate).toISOString()
        }

        Object.keys(params).forEach(
            (key) =>
                params[key as keyof typeof params] === undefined &&
                delete params[key as keyof typeof params],
        )

        const response = await BaseService.get(
            '/visa-expenses/export/excel',
            {
                params,
                responseType: 'blob',
            },
        )

        if (!response.data) {
            throw new Error('No data received from server')
        }

        const now = new Date()
        const formattedDate = `${now.getFullYear()}-${String(
            now.getMonth() + 1,
        ).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
        const filename = `Visa_expense_report_${formattedDate}.xlsx`

        const url = window.URL.createObjectURL(
            new Blob([response.data], {
                type:
                    response.headers['content-type'] ||
                    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            }),
        )

        const link = document.createElement('a')
        link.href = url
        link.setAttribute('download', filename)
        document.body.appendChild(link)
        link.click()

        setTimeout(() => {
            document.body.removeChild(link)
            window.URL.revokeObjectURL(url)
        }, 100)

        return true
    } catch (error) {
        console.error('Error exporting visa expense report:', error)

        let errorMessage = 'Failed to export visa expense report'
        if (error instanceof Error) {
            errorMessage = error.message
        } else if (typeof error === 'string') {
            errorMessage = error
        } else if (error && typeof error === 'object' && 'message' in error) {
            errorMessage = (error as { message: string }).message
        }

        throw new Error(errorMessage)
    }
}
export const getMonthlyReports = async ({ year, month }) => {
    try {
        const response = await BaseService.get(`/reports/monthly`, {
            params: { year, month },
            responseType: 'blob', // 👈 important for Excel file
        })
        return response
    } catch (error) {
        console.error('Error downloading monthly report:', error)
        throw error
    }
}

export const getYearlyReports = async ({ year }) => {
    try {
        const response = await BaseService.get(`/reports/yearly`, {
            params: { year },
            responseType: 'blob', // 👈 important for Excel file
        })
        return response
    } catch (error) {
        console.error('Error downloading yearly report:', error)
        throw error
    }
}
