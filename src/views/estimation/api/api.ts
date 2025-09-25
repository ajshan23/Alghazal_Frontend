import BaseService from "@/services/BaseService"


interface IMaterialItem {
    subjectMaterial: string;
    uom: string;
    quantity: number;
    unitPrice: number;
    total: number;
}
interface ILabourItem {
    designation: string;
    quantityDays: number;
    price: number;
    total: number;
}

interface ITermsItem {
    miscellaneous: string;
    quantity: number;
    unitPrice: number;
    total: number;
}


type EstimationApi={
    project:string
    workStartDate:Date
    workEndDate:Date
    validUntil:Date
    paymentDueBy:Date
    materials:IMaterialItem[]
    labour:ILabourItem[]
    termsAndConditions:ITermsItem[]
    quotationAmount?:number|null
    commissionAmount?:number|null,
    subject?:string|null|undefined 
       
  }


  export const createEstimation = async (data:EstimationApi) => {
      try {
        console.log(data);
        
          const response = await BaseService.post("/estimation",data)
          return response
      } catch (error) {
          console.log(error)
          throw error
      }
  }



    export const fetchEstimation = async (id:string) => {
    try {
        console.log("id:",id);
        
        const response = await BaseService.get(`/estimation/${id}`)
        console.log(response)
        return response.data

    } catch (error) {
        console.log(error)
        throw error
    }
}

export const editEstimation = async (id: string, values: EstimationApi) => {
    try {
        const response = await BaseService.put(`/estimation/${id}`, values);
        return response.data;
    } catch (error) {
        console.error('Error editing Estimation:', error);
        throw error;
    }
}

export const fetchEstimationPdf  = async (id:string) => {
    try {
        console.log("id:",id);
        
        const response = await BaseService.get(`/estimation/${id}/estimation-pdf`)
        console.log(response)
        return response.data

    } catch (error) {
        console.log(error)
        throw error
    }
}

export const downloadEstimationPdf = async (id: string, fileName: string) => {
    try {
      const response = await BaseService.get(`/estimation/${id}/estimation-pdf`, {
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
