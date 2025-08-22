import { useState, useEffect } from 'react'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import { FormItem, FormContainer } from '@/components/ui/Form'
import { Field, Form, Formik } from 'formik'
import * as Yup from 'yup'
import type { FormikProps } from 'formik'
import { IoMdAddCircleOutline } from 'react-icons/io'
import { fetchClients } from '../../api/api'
import debounce from 'lodash/debounce'
import { useNavigate } from 'react-router-dom'

type ClientData = {
  _id: string
  clientName: string
  clientAddress: string
  pincode: string
  mobileNumber: string
  telephoneNumber: string | null
  trnNumber: string
}
type FormModel = {
  clientName: string,
  clientData:ClientData
}

type PersonalInformationProps = {
  data: FormModel
  onNext: (values: FormModel) => void // Update to pass full client data
}


const PersonalInformation = ({ data, onNext }: PersonalInformationProps) => {
  console.log("daaataaaaa",data);
  
  const [clientSuggestions, setClientSuggestions] = useState<ClientData[]>([])
  const [isLoadingClients, setIsLoadingClients] = useState(false)
  const [isClientSelected, setIsClientSelected] = useState(data?.clientData._id??false)
  const [selectedClient, setSelectedClient] = useState<ClientData | null>(data?.clientData??null) // Store selected client data
const navigate=useNavigate();
  const validationSchema = Yup.object().shape({
    clientName: Yup.string().required('Client Name is required'),
  })

  const fetchClientSuggestions = async (searchTerm: string) => {
    try {
      setIsLoadingClients(true)
      const response = await fetchClients({ search: searchTerm })
      setClientSuggestions(response?.data?.clients || [])
    } catch (error) {
      console.error('Failed to fetch clients:', error)
      setClientSuggestions([])
    } finally {
      setIsLoadingClients(false)
    }
  }

  const debouncedFetchClients = debounce(fetchClientSuggestions, 300)

  useEffect(() => {
    console.log("component mounted");

    return () => {
      debouncedFetchClients.cancel()
      console.log("component unmounted");
      
    }
  }, [debouncedFetchClients])

  const handleClientSelect = (clientData: ClientData) => {
    setIsClientSelected(true)
    setSelectedClient(clientData) // Store the selected client data
    setClientSuggestions([])
  }

  const resetClientSelection = () => {
    setIsClientSelected(false)
    setSelectedClient(null)
    setClientSuggestions([])
  }

  return (
    <>
      <div className="mb-8">
        <h3 className="mb-2">Client Information</h3>
        <p>Basic information for an project opening</p>
      </div>
      <Formik
        initialValues={data}
        validationSchema={validationSchema}
        onSubmit={(values) => {
          if (isClientSelected && selectedClient) {
            onNext({...values,clientData:selectedClient}) // Pass both form values and client data
          }
        }}
      >
        {({ values, touched, errors, handleChange, handleBlur, setFieldValue }: FormikProps<FormModel>) => (
          <Form>
            <FormContainer>
              <div className="flex flex-col md:flex-row items-center gap-2">
                <FormItem
                  label="Client Name"
                  invalid={errors.clientName && touched.clientName}
                  errorMessage={errors.clientName}
                  style={{ minWidth: '300px' }}
                >
                  <div className="relative">
                    <Input
                      name="clientName"
                      placeholder="Client Name"
                      value={values.clientName}
                      onChange={(e) => {
                        handleChange(e)
                        setIsClientSelected(false)
                          if (e.target.value.length > 0) {
                            debouncedFetchClients(e.target.value)
                          } else {
                            setClientSuggestions([])
                          }
                        
                      }}
                      onBlur={() => {
                        handleBlur('clientName')
                        setTimeout(() => setClientSuggestions([]), 200)
                      }}
                      // disabled={isClientSelected} // Disable input after selection
                    />
                    {isLoadingClients && (
                      <div className="absolute right-2 top-2">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-900"></div>
                      </div>
                    )}
                    {clientSuggestions.length > 0 && !isClientSelected && (
                      <div className="absolute z-10 mt-1 w-full bg-white dark:bg-gray-800 shadow-lg rounded-md py-1 max-h-60 overflow-auto">
                        {clientSuggestions.map((suggestion, index) => (
                          <div
                            key={index}
                            className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                            onMouseDown={() => {
                              setFieldValue('clientName', suggestion.clientName)
                              values.clientData={
                                _id:suggestion._id,
                                clientAddress:suggestion.clientAddress,
                                clientName:suggestion.clientName,
                                mobileNumber:suggestion.mobileNumber,
                                pincode:suggestion.pincode,
                                telephoneNumber:suggestion.telephoneNumber,
                                trnNumber:suggestion.trnNumber
                              }
                              handleClientSelect(suggestion)
                            }}
                          >
                            {suggestion.clientName}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </FormItem>
                {isClientSelected ? (
                  <Button
                    shape="circle"
                    size="m"
                    onClick={(e) => {
                      e.preventDefault()
                      resetClientSelection()
                      navigate("/app/create-client")
                    }}
                    icon={<IoMdAddCircleOutline />}
                  />
                ) : (
                  <Button
                    shape="circle"
                    size="m"
                    icon={<IoMdAddCircleOutline />}
                    onClick={()=> navigate("/app/client-new")}
                  />
                )}
              </div>

              {isClientSelected && selectedClient && (
                <div className="mt-4 p-4 border rounded-lg bg-gray-50 dark:bg-gray-700">
                  <h4 className="mb-2">Selected Client Details</h4>
                  <p>Address: {selectedClient.clientAddress}</p>
                  <p>Mobile: {selectedClient.mobileNumber}</p>
                  <p>TRN: {selectedClient.trnNumber}</p>
                </div>
              )}

              <div className="flex justify-end gap-2 mt-4">
                <Button 
                  variant="solid" 
                  type="submit"
                  disabled={!isClientSelected}
                >
                  Next
                </Button>
              </div>
            </FormContainer>
          </Form>
        )}
      </Formik>
    </>
  )
}

export { PersonalInformation }