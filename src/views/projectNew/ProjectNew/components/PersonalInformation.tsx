import { useState, useEffect } from 'react'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import { FormItem, FormContainer } from '@/components/ui/Form'
import { Field, Form, Formik } from 'formik'
import * as Yup from 'yup'
import type { FormikProps } from 'formik'
import { IoMdAddCircleOutline } from 'react-icons/io'
import { HiOutlineUser, HiOutlineSearch, HiOutlineCheckCircle } from 'react-icons/hi'
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
  clientData: ClientData
}

type PersonalInformationProps = {
  data: FormModel
  onNext: (values: FormModel) => void
}

const PersonalInformation = ({ data, onNext }: PersonalInformationProps) => {
  const [clientSuggestions, setClientSuggestions] = useState<ClientData[]>([])
  const [isLoadingClients, setIsLoadingClients] = useState(false)
  const [isClientSelected, setIsClientSelected] = useState(data?.clientData._id ?? false)
  const [selectedClient, setSelectedClient] = useState<ClientData | null>(data?.clientData ?? null)
  const navigate = useNavigate()

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
    return () => {
      debouncedFetchClients.cancel()
    }
  }, [debouncedFetchClients])

  const handleClientSelect = (clientData: ClientData) => {
    setIsClientSelected(true)
    setSelectedClient(clientData)
    setClientSuggestions([])
  }

  const resetClientSelection = () => {
    setIsClientSelected(false)
    setSelectedClient(null)
    setClientSuggestions([])
  }

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="text-center">
        <div className="flex justify-center mb-4">
          <div className="p-4 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl shadow-lg">
            <HiOutlineUser className="text-3xl text-white" />
          </div>
        </div>
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Client Information
        </h3>
        <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
          Search and select an existing client or create a new one to proceed with your project setup
        </p>
      </div>

      <Formik
        initialValues={data}
        validationSchema={validationSchema}
        onSubmit={(values) => {
          if (isClientSelected && selectedClient) {
            onNext({ ...values, clientData: selectedClient })
          }
        }}
      >
        {({ values, touched, errors, handleChange, handleBlur, setFieldValue }: FormikProps<FormModel>) => (
          <Form>
            <FormContainer>
              <div className="bg-gradient-to-br from-white via-blue-50 to-indigo-50 dark:from-gray-800 dark:via-gray-850 dark:to-gray-900 rounded-2xl p-6 border border-blue-200 dark:border-gray-700 shadow-lg">
                
                {/* Search Section */}
                <div className="mb-6">
                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <FormItem
                        label={
                          <div className="flex items-center gap-2">
                            <HiOutlineSearch className="text-lg text-blue-600" />
                            <span className="font-semibold text-gray-800 dark:text-white">
                              Search Client
                            </span>
                          </div>
                        }
                        invalid={errors.clientName && touched.clientName}
                        errorMessage={errors.clientName}
                      >
                        <div className="relative">
                          <Input
                            name="clientName"
                            placeholder="Type client name to search..."
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
                            className="pr-10 text-lg py-3 border-2 border-blue-200 dark:border-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                          />
                          
                          {/* Loading indicator */}
                          {isLoadingClients && (
                            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                              <div className="animate-spin rounded-full h-5 w-5 border-2 border-blue-500 border-t-transparent"></div>
                            </div>
                          )}

                          {/* Success indicator */}
                          {isClientSelected && (
                            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                              <HiOutlineCheckCircle className="text-green-500 text-xl" />
                            </div>
                          )}

                          {/* Suggestions dropdown */}
                          {clientSuggestions.length > 0 && !isClientSelected && (
                            <div className="absolute z-20 mt-2 w-full bg-white dark:bg-gray-800 shadow-xl rounded-xl border border-gray-200 dark:border-gray-600 max-h-60 overflow-auto">
                              {clientSuggestions.map((suggestion, index) => (
                                <div
                                  key={index}
                                  className="px-4 py-3 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 dark:hover:from-gray-700 dark:hover:to-gray-650 cursor-pointer border-b border-gray-100 dark:border-gray-700 last:border-0 transition-all duration-200"
                                  onMouseDown={() => {
                                    setFieldValue('clientName', suggestion.clientName)
                                    values.clientData = {
                                      _id: suggestion._id,
                                      clientAddress: suggestion.clientAddress,
                                      clientName: suggestion.clientName,
                                      mobileNumber: suggestion.mobileNumber,
                                      pincode: suggestion.pincode,
                                      telephoneNumber: suggestion.telephoneNumber,
                                      trnNumber: suggestion.trnNumber
                                    }
                                    handleClientSelect(suggestion)
                                  }}
                                >
                                  <div className="flex items-center justify-between">
                                    <div>
                                      <div className="font-semibold text-gray-900 dark:text-white">
                                        {suggestion.clientName}
                                      </div>
                                      <div className="text-sm text-gray-600 dark:text-gray-400">
                                        {suggestion.mobileNumber}
                                      </div>
                                    </div>
                                    <div className="text-xs text-gray-500 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                                      TRN: {suggestion.trnNumber}
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </FormItem>
                    </div>

                    {/* Add Client Button */}
                    <div className="flex flex-col items-center">
                      <Button
                        type="button"
                        className="w-12 h-12 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 border-0 shadow-lg hover:shadow-xl transition-all duration-200"
                        icon={<IoMdAddCircleOutline className="text-xl" />}
                        onClick={() => navigate("/app/client-new")}
                      />
                      <span className="text-xs text-gray-500 mt-1 text-center">Add Client</span>
                    </div>
                  </div>
                </div>

                {/* Selected Client Details */}
                {isClientSelected && selectedClient && (
                  <div className="bg-gradient-to-r from-green-50 via-emerald-50 to-teal-50 dark:from-green-900/20 dark:via-emerald-900/20 dark:to-teal-900/20 border border-green-200 dark:border-green-800 rounded-xl p-6 shadow-inner">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg">
                          <HiOutlineCheckCircle className="text-white text-xl" />
                        </div>
                        <div>
                          <h4 className="text-lg font-bold text-gray-900 dark:text-white">
                            Selected Client
                          </h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Client details loaded successfully
                          </p>
                        </div>
                      </div>
                      <Button
                        type="button"
                        size="sm"
                        variant="plain"
                        onClick={resetClientSelection}
                        className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                      >
                        Change
                      </Button>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-3">
                        <div>
                          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Client Name
                          </label>
                          <p className="text-gray-900 dark:text-white font-semibold">
                            {selectedClient.clientName}
                          </p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Mobile Number
                          </label>
                          <p className="text-gray-900 dark:text-white font-semibold">
                            {selectedClient.mobileNumber}
                          </p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            TRN Number
                          </label>
                          <p className="text-gray-900 dark:text-white font-semibold">
                            {selectedClient.trnNumber}
                          </p>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <div>
                          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Address
                          </label>
                          <p className="text-gray-900 dark:text-white font-semibold">
                            {selectedClient.clientAddress}
                          </p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Pincode
                          </label>
                          <p className="text-gray-900 dark:text-white font-semibold">
                            {selectedClient.pincode}
                          </p>
                        </div>
                        {selectedClient.telephoneNumber && (
                          <div>
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                              Telephone
                            </label>
                            <p className="text-gray-900 dark:text-white font-semibold">
                              {selectedClient.telephoneNumber}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Action Button */}
                <div className="flex justify-end mt-8">
                  <Button
                    variant="solid"
                    type="submit"
                    disabled={!isClientSelected}
                    size="lg"
                    className={`px-8 py-3 font-semibold text-lg rounded-xl shadow-lg transition-all duration-200 ${
                      isClientSelected
                        ? 'bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 hover:shadow-xl hover:scale-105'
                        : 'bg-gray-400 cursor-not-allowed'
                    }`}
                  >
                    Continue to Project Details
                  </Button>
                </div>
              </div>
            </FormContainer>
          </Form>
        )}
      </Formik>
    </div>
  )
}

export { PersonalInformation }