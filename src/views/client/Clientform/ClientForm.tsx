import { forwardRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FormContainer, FormItem } from '@/components/ui/Form'
import Button from '@/components/ui/Button'
import StickyFooter from '@/components/shared/StickyFooter'
import { Field, Form, Formik, FormikProps } from 'formik'
import { AiOutlineSave, AiOutlinePlus, AiOutlineMinus, AiOutlineArrowLeft } from 'react-icons/ai'
import * as Yup from 'yup'
import { Input } from '@/components/ui'
import { AdaptableCard } from '@/components/shared'
import { HiOutlineOfficeBuilding, HiOutlineHome, HiOutlineLocationMarker, HiOutlineUser, HiOutlineMail, HiOutlineMap, HiOutlineHashtag, HiOutlinePhone, HiOutlineIdentification } from 'react-icons/hi'

// Types
type Apartment = {
  number: string
}

type Building = {
  name: string
  apartments: Apartment[]
}

type Location = {
  name: string
  buildings: Building[]
}

type FormikRef = FormikProps<any>

type InitialData = {
  id?: string
  clientName?: string
  email?: string
  clientAddress?: string
  pincode?: string
  mobileNumber?: string
  telephoneNumber?: string | null
  trnNumber?: string
  accountNumber?: string
  locations?: Location[]
}

export type FormModel = Omit<InitialData, 'locations'> & {
  locations: Location[]
}

export type SetSubmitting = (isSubmitting: boolean) => void

type ClientFormProps = {
  initialData?: InitialData
  type: 'edit' | 'new'
  onDiscard?: () => void
  onDelete?: () => void
  onFormSubmit: (formData: FormModel, setSubmitting: SetSubmitting) => Promise<{ id: string }>
}

// Updated Validation Schema - Only clientName is required
const validationSchema = Yup.object().shape({
  clientName: Yup.string().required('Client Name Required'),
  email: Yup.string()
    .email('Invalid email format')
    .nullable()
    .notRequired(), // Changed from required to optional
  clientAddress: Yup.string().nullable().notRequired(), // Changed from required to optional
  pincode: Yup.string()
    .matches(/^[0-9]*$/, 'Pincode must be numeric') // Allow empty string
    .nullable()
    .notRequired(), // Changed from required to optional
  mobileNumber: Yup.string()
    .matches(/^[0-9]*$/, 'Mobile number must be digits only') // Allow empty string
    .nullable()
    .notRequired(), // Changed from required to optional
  telephoneNumber: Yup.string()
    .matches(/^[0-9]*$/, 'Telephone number must be digits only') // Allow empty string
    .nullable()
    .notRequired(),
  trnNumber: Yup.string().nullable().notRequired(), // Changed from required to optional
  accountNumber: Yup.string().nullable().notRequired(), // Changed from required to optional
})

const ClientForm = forwardRef<FormikRef, ClientFormProps>((props, ref) => {
  const navigate = useNavigate()
  const {
    type,
    initialData = {
      clientName: '',
      email: '',
      clientAddress: '',
      pincode: '',
      mobileNumber: '',
      telephoneNumber: null,
      trnNumber: '',
      accountNumber: '',
      locations: [],
    },
    onFormSubmit,
    onDiscard,
    onDelete,
  } = props

  const [locations, setLocations] = useState<Location[]>(initialData.locations || [])

  // Helper function for Yup validation errors
  const yupToFormErrors = (yupError: any) => {
    const errors: Record<string, string> = {}
    yupError.inner.forEach((error: any) => {
      errors[error.path] = error.message
    })
    return errors
  }

  // Location-Building-Apartment CRUD operations
  const addLocation = () => {
    setLocations([...locations, { name: '', buildings: [] }])
  }

  const removeLocation = (index: number) => {
    const newLocations = [...locations]
    newLocations.splice(index, 1)
    setLocations(newLocations)
  }

  const addBuilding = (locationIndex: number) => {
    const newLocations = [...locations]
    newLocations[locationIndex].buildings.push({ name: '', apartments: [] })
    setLocations(newLocations)
  }

  const removeBuilding = (locationIndex: number, buildingIndex: number) => {
    const newLocations = [...locations]
    newLocations[locationIndex].buildings.splice(buildingIndex, 1)
    setLocations(newLocations)
  }

  const addApartment = (locationIndex: number, buildingIndex: number) => {
    const newLocations = [...locations]
    newLocations[locationIndex].buildings[buildingIndex].apartments.push({ number: '' })
    setLocations(newLocations)
  }

  const removeApartment = (locationIndex: number, buildingIndex: number, apartmentIndex: number) => {
    const newLocations = [...locations]
    newLocations[locationIndex].buildings[buildingIndex].apartments.splice(apartmentIndex, 1)
    setLocations(newLocations)
  }

  // Handle input changes
  const handleLocationChange = (index: number, value: string) => {
    const newLocations = [...locations]
    newLocations[index].name = value
    setLocations(newLocations)
  }

  const handleBuildingChange = (locationIndex: number, buildingIndex: number, value: string) => {
    const newLocations = [...locations]
    newLocations[locationIndex].buildings[buildingIndex].name = value
    setLocations(newLocations)
  }

  const handleApartmentChange = (
    locationIndex: number,
    buildingIndex: number,
    apartmentIndex: number,
    value: string
  ) => {
    const newLocations = [...locations]
    newLocations[locationIndex].buildings[buildingIndex].apartments[apartmentIndex].number = value
    setLocations(newLocations)
  }

  return (
    <Formik
      innerRef={ref}
      initialValues={{
        ...initialData,
        locations,
      }}
      validationSchema={validationSchema}
      onSubmit={async (values: Omit<InitialData, 'locations'>, { setSubmitting }) => {
        try {
          // Filter out empty string values and convert them to meaningful data
          const filteredValues = Object.entries(values).reduce((acc, [key, value]) => {
            // Always include clientName (required field)
            if (key === 'clientName') {
              acc[key] = value || '';
            } else {
              // For other fields, only include if they have meaningful values
              if (value && typeof value === 'string' && value.trim() !== '') {
                acc[key] = value.trim();
              } else if (value !== null && value !== undefined && value !== '') {
                acc[key] = value;
              }
              // Skip empty strings, null, undefined for optional fields
            }
            return acc;
          }, {} as any);

          // Structure the data exactly as required
          const formData: FormModel = {
            ...filteredValues,
            locations: locations
              .filter(location => location.name.trim() !== '') // Only include locations with names
              .map(location => ({
                name: location.name.trim(),
                buildings: location.buildings
                  .filter(building => building.name.trim() !== '') // Only include buildings with names
                  .map(building => ({
                    name: building.name.trim(),
                    apartments: building.apartments
                      .filter(apartment => apartment.number.trim() !== '') // Only include apartments with numbers
                      .map(apartment => ({
                        number: apartment.number.trim()
                      }))
                  }))
              }))
          }

          console.log('Form data to be submitted:', JSON.stringify(formData, null, 2))

          // Call the onFormSubmit prop with the structured data
          const response = await onFormSubmit(formData, setSubmitting)
          
          // After successful submission, navigate to the client view page
          if (response?.id) {
            navigate(`/client-view/${response.id}`)
          } else if (type === 'edit' && initialData.id) {
            navigate(`/client-view/${initialData.id}`)
          }
        } catch (error) {
          console.error('Form submission error:', error)
          // Error handling is done in the parent component through onFormSubmit
        }
      }}
      validateOnBlur={true}
      validateOnChange={false}
      validate={(values) => {
        try {
          validationSchema.validateSync(values, { abortEarly: false })
          return {}
        } catch (err) {
          return yupToFormErrors(err)
        }
      }}
    >
      {({ values, touched, errors, isSubmitting, handleSubmit }) => (
        <Form onSubmit={handleSubmit}>
          <FormContainer>
            {/* Client Information Section */}
            <div className="bg-gradient-to-br from-white via-blue-50 to-indigo-50 dark:from-gray-800 dark:via-gray-850 dark:to-gray-900 rounded-2xl p-8 border border-blue-200 dark:border-gray-700 shadow-lg mb-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl">
                  <HiOutlineUser className="text-2xl text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  Client Information
                </h3>
              </div>

              <div className="space-y-6">
                {/* Client Name Field */}
                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
                  <FormItem
                    label={
                      <div className="flex items-center gap-2 mb-3">
                        <HiOutlineUser className="text-lg text-blue-600" />
                        <span className="font-semibold text-gray-800 dark:text-white text-lg">
                          Client Name
                        </span>
                        <span className="text-red-500">*</span>
                      </div>
                    }
                    invalid={!!(errors.clientName && touched.clientName)}
                    errorMessage={errors.clientName}
                  >
                    <Field
                      type="text"
                      autoComplete="off"
                      name="clientName"
                      placeholder="Enter client name..."
                      component={Input}
                      className="text-lg py-3 border-2 border-blue-200 dark:border-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 rounded-lg"
                    />
                  </FormItem>
                </div>

                {/* Email Field */}
                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
                  <FormItem
                    label={
                      <div className="flex items-center gap-2 mb-3">
                        <HiOutlineMail className="text-lg text-blue-600" />
                        <span className="font-semibold text-gray-800 dark:text-white text-lg">
                          Email Address
                        </span>
                      </div>
                    }
                    invalid={!!(errors.email && touched.email)}
                    errorMessage={errors.email}
                  >
                    <Field
                      type="text"
                      autoComplete="off"
                      name="email"
                      placeholder="Enter email address (optional)..."
                      component={Input}
                      className="text-lg py-3 border-2 border-blue-200 dark:border-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 rounded-lg"
                    />
                  </FormItem>
                </div>

                {/* Client Address Field */}
                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
                  <FormItem
                    label={
                      <div className="flex items-center gap-2 mb-3">
                        <HiOutlineMap className="text-lg text-blue-600" />
                        <span className="font-semibold text-gray-800 dark:text-white text-lg">
                          Client Address
                        </span>
                      </div>
                    }
                    invalid={!!(errors.clientAddress && touched.clientAddress)}
                    errorMessage={errors.clientAddress}
                  >
                    <Field
                      as="textarea"
                      autoComplete="off"
                      name="clientAddress"
                      placeholder="Enter client address (optional)..."
                      component={Input}
                      textArea
                      rows={3}
                      className="text-lg py-3 border-2 border-blue-200 dark:border-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 rounded-lg resize-none"
                    />
                  </FormItem>
                </div>

                {/* Pincode and TRN Number Fields */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
                    <FormItem
                      label={
                        <div className="flex items-center gap-2 mb-3">
                          <HiOutlineHashtag className="text-lg text-blue-600" />
                          <span className="font-semibold text-gray-800 dark:text-white text-lg">
                            Pincode
                          </span>
                        </div>
                      }
                      invalid={!!(errors.pincode && touched.pincode)}
                      errorMessage={errors.pincode}
                    >
                      <Field
                        type="text"
                        autoComplete="off"
                        name="pincode"
                        placeholder="Enter pincode (optional)..."
                        component={Input}
                        className="text-lg py-3 border-2 border-blue-200 dark:border-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 rounded-lg"
                      />
                    </FormItem>
                  </div>

                  <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
                    <FormItem
                      label={
                        <div className="flex items-center gap-2 mb-3">
                          <HiOutlineIdentification className="text-lg text-blue-600" />
                          <span className="font-semibold text-gray-800 dark:text-white text-lg">
                            TRN Number
                          </span>
                        </div>
                      }
                      invalid={!!(errors.trnNumber && touched.trnNumber)}
                      errorMessage={errors.trnNumber}
                    >
                      <Field
                        type="text"
                        autoComplete="off"
                        name="trnNumber"
                        placeholder="Enter TRN number (optional)..."
                        component={Input}
                        className="text-lg py-3 border-2 border-blue-200 dark:border-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 rounded-lg"
                      />
                    </FormItem>
                  </div>
                </div>

                {/* Account Number Field */}
                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
                  <FormItem
                    label={
                      <div className="flex items-center gap-2 mb-3">
                        <HiOutlineHashtag className="text-lg text-blue-600" />
                        <span className="font-semibold text-gray-800 dark:text-white text-lg">
                          Account Number
                        </span>
                      </div>
                    }
                    invalid={!!(errors.accountNumber && touched.accountNumber)}
                    errorMessage={errors.accountNumber}
                  >
                    <Field
                      type="text"
                      autoComplete="off"
                      name="accountNumber"
                      placeholder="Enter account number (optional)..."
                      component={Input}
                      className="text-lg py-3 border-2 border-blue-200 dark:border-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 rounded-lg"
                    />
                  </FormItem>
                </div>

                {/* Mobile and Telephone Number Fields */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
                    <FormItem
                      label={
                        <div className="flex items-center gap-2 mb-3">
                          <HiOutlinePhone className="text-lg text-blue-600" />
                          <span className="font-semibold text-gray-800 dark:text-white text-lg">
                            Mobile Number
                          </span>
                        </div>
                      }
                      invalid={!!(errors.mobileNumber && touched.mobileNumber)}
                      errorMessage={errors.mobileNumber}
                    >
                      <Field
                        type="text"
                        autoComplete="off"
                        name="mobileNumber"
                        placeholder="Enter mobile number (optional)..."
                        component={Input}
                        className="text-lg py-3 border-2 border-blue-200 dark:border-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 rounded-lg"
                      />
                    </FormItem>
                  </div>

                  <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
                    <FormItem
                      label={
                        <div className="flex items-center gap-2 mb-3">
                          <HiOutlinePhone className="text-lg text-blue-600" />
                          <span className="font-semibold text-gray-800 dark:text-white text-lg">
                            Telephone Number
                          </span>
                        </div>
                      }
                      invalid={!!(errors.telephoneNumber && touched.telephoneNumber)}
                      errorMessage={errors.telephoneNumber}
                    >
                      <Field
                        type="text"
                        autoComplete="off"
                        name="telephoneNumber"
                        placeholder="Enter telephone number (optional)..."
                        component={Input}
                        className="text-lg py-3 border-2 border-blue-200 dark:border-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 rounded-lg"
                      />
                    </FormItem>
                  </div>
                </div>
              </div>
            </div>

            {/* Location-Building-Apartment Section */}
            <div className="bg-gradient-to-br from-white via-green-50 to-teal-50 dark:from-gray-800 dark:via-gray-850 dark:to-gray-900 rounded-2xl p-8 border border-green-200 dark:border-gray-700 shadow-lg">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-gradient-to-r from-green-500 to-teal-600 rounded-xl">
                    <HiOutlineLocationMarker className="text-2xl text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                    Location - Building - Apartment Structure
                  </h3>
                </div>
                <Button
                  size="lg"
                  variant="solid"
                  icon={<AiOutlinePlus />}
                  onClick={addLocation}
                  type="button"
                  className="px-6 py-3 bg-gradient-to-r from-green-600 to-teal-700 hover:from-green-700 hover:to-teal-800 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  Add Location
                </Button>
              </div>

              {locations.length === 0 && (
                <div className="text-center py-12 text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 rounded-xl border border-dashed border-gray-300 dark:border-gray-600">
                  <HiOutlineOfficeBuilding className="mx-auto text-4xl mb-4 text-gray-300 dark:text-gray-600" />
                  <p className="text-lg mb-1">No locations added yet</p>
                  <p className="text-sm">Click "Add Location" to get started (Optional)</p>
                </div>
              )}

              <div className="space-y-6">
                {locations.map((location, locationIndex) => (
                  <div 
                    key={`location-${locationIndex}`} 
                    className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden"
                  >
                    <div className="flex items-center p-6 border-b dark:border-gray-600 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800">
                      <HiOutlineLocationMarker className="mr-3 text-xl text-green-600" />
                      <Field
                        type="text"
                        autoComplete="off"
                        value={location.name}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                          handleLocationChange(locationIndex, e.target.value)
                        }
                        placeholder="Enter location name..."
                        component={Input}
                        className="flex-grow mr-4 text-lg py-3 border-2 border-green-200 dark:border-gray-600 focus:border-green-500 focus:ring-2 focus:ring-green-200 rounded-lg"
                      />
                      <Button
                        size="sm"
                        variant="plain"
                        color="red"
                        icon={<AiOutlineMinus />}
                        onClick={() => removeLocation(locationIndex)}
                        className="hover:bg-red-50 dark:hover:bg-red-900/20 px-3 py-2 rounded-lg"
                        type="button"
                      />
                    </div>

                    <div className="p-6">
                      {location.buildings.length === 0 && (
                        <div className="text-center py-8 text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-700/30 rounded-lg mb-6">
                          <HiOutlineOfficeBuilding className="mx-auto text-3xl mb-2 text-gray-300 dark:text-gray-600" />
                          <p>No buildings in this location</p>
                        </div>
                      )}

                      <div className="space-y-4">
                        {location.buildings.map((building, buildingIndex) => (
                          <div 
                            key={`building-${buildingIndex}`} 
                            className="bg-gray-50 dark:bg-gray-700/30 rounded-lg border border-gray-200 dark:border-gray-600 overflow-hidden"
                          >
                            <div className="flex items-center p-4 border-b dark:border-gray-600 bg-white dark:bg-gray-800">
                              <HiOutlineOfficeBuilding className="mr-3 text-lg text-green-600" />
                              <Field
                                type="text"
                                autoComplete="off"
                                value={building.name}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                  handleBuildingChange(locationIndex, buildingIndex, e.target.value)
                                }
                                placeholder="Enter building name..."
                                component={Input}
                                className="flex-grow mr-4 text-lg py-3 border-2 border-green-200 dark:border-gray-600 focus:border-green-500 focus:ring-2 focus:ring-green-200 rounded-lg"
                              />
                              <Button
                                size="sm"
                                variant="plain"
                                color="red"
                                icon={<AiOutlineMinus />}
                                onClick={() => removeBuilding(locationIndex, buildingIndex)}
                                className="hover:bg-red-50 dark:hover:bg-red-900/20 px-3 py-2 rounded-lg"
                                type="button"
                              />
                            </div>

                            <div className="p-4">
                              {building.apartments.length === 0 && (
                                <div className="text-center py-4 text-gray-500 dark:text-gray-400 text-sm bg-white dark:bg-gray-800 rounded mb-4">
                                  No apartments in this building
                                </div>
                              )}

                              <div className="space-y-3">
                                {building.apartments.map((apartment, apartmentIndex) => (
                                  <div
                                    key={`apartment-${apartmentIndex}`}
                                    className="flex items-center p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-600"
                                  >
                                    <HiOutlineHome className="mr-3 text-green-600" />
                                    <Field
                                      type="text"
                                      autoComplete="off"
                                      value={apartment.number}
                                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                        handleApartmentChange(
                                          locationIndex,
                                          buildingIndex,
                                          apartmentIndex,
                                          e.target.value
                                        )
                                      }
                                      placeholder="Enter apartment number..."
                                      component={Input}
                                      className="flex-grow mr-4 text-lg py-3 border-2 border-green-200 dark:border-gray-600 focus:border-green-500 focus:ring-2 focus:ring-green-200 rounded-lg"
                                    />
                                    <Button
                                      size="sm"
                                      variant="plain"
                                      color="red"
                                      icon={<AiOutlineMinus />}
                                      onClick={() =>
                                        removeApartment(locationIndex, buildingIndex, apartmentIndex)
                                      }
                                      className="hover:bg-red-50 dark:hover:bg-red-900/20 px-3 py-2 rounded-lg"
                                      type="button"
                                    />
                                  </div>
                                ))}
                              </div>
                              <Button
                                size="sm"
                                variant="plain"
                                icon={<AiOutlinePlus />}
                                onClick={() => addApartment(locationIndex, buildingIndex)}
                                className="mt-3 w-full justify-center bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 py-2 rounded-lg"
                                type="button"
                              >
                                Add Apartment
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                      <Button
                        size="sm"
                        variant="plain"
                        icon={<AiOutlinePlus />}
                        onClick={() => addBuilding(locationIndex)}
                        className="mt-4 w-full justify-center bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 py-2 rounded-lg"
                        type="button"
                      >
                        Add Building
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <StickyFooter
              className="-mx-8 px-8 flex items-center justify-between py-6 mt-8"
              stickyClass="border-t bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"
            >
              <Button
                size="lg"
                className="px-6 py-3 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl font-semibold transition-all duration-200"
                type="button"
                onClick={onDiscard}
                icon={<AiOutlineArrowLeft />}
              >
                Discard
              </Button>
              <Button
                size="lg"
                variant="solid"
                loading={isSubmitting}
                disabled={isSubmitting}
                icon={<AiOutlineSave />}
                type="submit"
                className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200"
              >
                {type === 'edit' ? 'Update Client' : 'Create Client'}
              </Button>
            </StickyFooter>
          </FormContainer>
        </Form>
      )}
    </Formik>
  )
})

ClientForm.displayName = 'ClientForm'

export default ClientForm