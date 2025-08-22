import { forwardRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FormContainer, FormItem } from '@/components/ui/Form'
import Button from '@/components/ui/Button'
import StickyFooter from '@/components/shared/StickyFooter'
import { Field, Form, Formik, FormikProps } from 'formik'
import cloneDeep from 'lodash/cloneDeep'
import { AiOutlineSave, AiOutlinePlus, AiOutlineMinus } from 'react-icons/ai'
import * as Yup from 'yup'
import { Input } from '@/components/ui'
import { AdaptableCard } from '@/components/shared'
import { HiOutlineOfficeBuilding, HiOutlineHome, HiOutlineLocationMarker } from 'react-icons/hi'

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

// Validation Schema
const validationSchema = Yup.object().shape({
  clientName: Yup.string().required('Client Name Required'),
  email: Yup.string()
    .required('Email Required')
    .email('Invalid email format'),
  clientAddress: Yup.string().required('Client Address Required'),
  pincode: Yup.string()
    .required('Pincode Required')
    .matches(/^[0-9]+$/, 'Pincode must be numeric')
    .min(6)
    .max(6),
  mobileNumber: Yup.string()
    .required('Mobile Number Required')
    .matches(/^[0-9]+$/, 'Mobile number must be digits only'),
  telephoneNumber: Yup.string()
    .matches(/^[0-9]+$/, 'Telephone number must be digits only')
    .nullable(),
  trnNumber: Yup.string().required('TRN Number Required'),
  accountNumber: Yup.string().required('Account Number Required'),
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
          // Structure the data exactly as required
          const formData: FormModel = {
            ...values,
            locations: locations.map(location => ({
              name: location.name,
              buildings: location.buildings.map(building => ({
                name: building.name,
                apartments: building.apartments.map(apartment => ({
                  number: apartment.number
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
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="lg:col-span-2">
                <AdaptableCard className="mb-4">
                  <h3 className="mb-6 text-lg font-semibold">Client Information</h3>
                  <FormItem
                    label="Client Name"
                    invalid={!!(errors.clientName && touched.clientName)}
                    errorMessage={errors.clientName}
                  >
                    <Field
                      type="text"
                      autoComplete="off"
                      name="clientName"
                      placeholder="Client Name"
                      component={Input}
                    />
                  </FormItem>
                  <FormItem
                    label="Email"
                    invalid={!!(errors.email && touched.email)}
                    errorMessage={errors.email}
                  >
                    <Field
                      type="text"
                      autoComplete="off"
                      name="email"
                      placeholder="Email"
                      component={Input}
                    />
                  </FormItem>

                  <FormItem
                    label="Client Address"
                    invalid={!!(errors.clientAddress && touched.clientAddress)}
                    errorMessage={errors.clientAddress}
                  >
                    <Field
                      as="textarea"
                      autoComplete="off"
                      name="clientAddress"
                      placeholder="Client Address"
                      component={Input}
                      textArea
                    />
                  </FormItem>

                  <div className="md:grid grid-cols-2 gap-4">
                    <FormItem
                      label="Pincode"
                      invalid={!!(errors.pincode && touched.pincode)}
                      errorMessage={errors.pincode}
                    >
                      <Field
                        type="text"
                        autoComplete="off"
                        name="pincode"
                        placeholder="Pincode"
                        component={Input}
                      />
                    </FormItem>

                    <FormItem
                      label="TRN Number"
                      invalid={!!(errors.trnNumber && touched.trnNumber)}
                      errorMessage={errors.trnNumber}
                    >
                      <Field
                        type="text"
                        autoComplete="off"
                        name="trnNumber"
                        placeholder="TRN Number"
                        component={Input}
                      />
                    </FormItem>
                    <FormItem
                      label="Account Number"
                      invalid={!!(errors.accountNumber && touched.accountNumber)}
                      errorMessage={errors.accountNumber}
                    >
                      <Field
                        type="text"
                        autoComplete="off"
                        name="accountNumber"
                        placeholder="Account Number"
                        component={Input}
                      />
                    </FormItem>
                  </div>

                  <div className="md:grid grid-cols-2 gap-4">
                    <FormItem
                      label="Mobile Number"
                      invalid={!!(errors.mobileNumber && touched.mobileNumber)}
                      errorMessage={errors.mobileNumber}
                    >
                      <Field
                        type="text"
                        autoComplete="off"
                        name="mobileNumber"
                        placeholder="Mobile Number"
                        component={Input}
                      />
                    </FormItem>

                    <FormItem
                      label="Telephone Number"
                      invalid={!!(errors.telephoneNumber && touched.telephoneNumber)}
                      errorMessage={errors.telephoneNumber}
                    >
                      <Field
                        type="text"
                        autoComplete="off"
                        name="telephoneNumber"
                        placeholder="Telephone Number"
                        component={Input}
                      />
                    </FormItem>
                  </div>
                </AdaptableCard>
              </div>
            </div>

            {/* Location-Building-Apartment Section */}
            <AdaptableCard className="mt-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold flex items-center">
                  <HiOutlineLocationMarker className="mr-2 text-xl" />
                  Location - Building - Apartment Structure
                </h3>
                <Button
                  size="sm"
                  variant="solid"
                  icon={<AiOutlinePlus />}
                  onClick={addLocation}
                  type="button"
                >
                  Add Location
                </Button>
              </div>

              {locations.length === 0 && (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <HiOutlineOfficeBuilding className="mx-auto text-4xl mb-2 text-gray-300 dark:text-gray-600" />
                  <p>No locations added yet</p>
                  <p className="text-sm mt-1">Click "Add Location" to get started</p>
                </div>
              )}

              <div className="space-y-4">
                {locations.map((location, locationIndex) => (
                  <div 
                    key={`location-${locationIndex}`} 
                    className="border rounded-lg dark:border-gray-600 bg-white dark:bg-gray-800"
                  >
                    <div className="flex items-center p-4 border-b dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50 rounded-t-lg">
                      <HiOutlineLocationMarker className="mr-2 text-lg text-gray-500 dark:text-gray-400" />
                      <Field
                        type="text"
                        autoComplete="off"
                        value={location.name}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                          handleLocationChange(locationIndex, e.target.value)
                        }
                        placeholder="Location Name"
                        component={Input}
                        className="flex-grow mr-2 bg-transparent px-0"
                      />
                      <Button
                        size="xs"
                        variant="plain"
                        color="red"
                        icon={<AiOutlineMinus />}
                        onClick={() => removeLocation(locationIndex)}
                        className="hover:bg-gray-200 dark:hover:bg-gray-600"
                        type="button"
                      />
                    </div>

                    <div className="p-4">
                      {location.buildings.length === 0 && (
                        <div className="text-center py-4 text-gray-500 dark:text-gray-400 text-sm bg-gray-50 dark:bg-gray-700/30 rounded mb-4">
                          No buildings in this location
                        </div>
                      )}

                      <div className="space-y-3">
                        {location.buildings.map((building, buildingIndex) => (
                          <div 
                            key={`building-${buildingIndex}`} 
                            className="border rounded dark:border-gray-600 bg-gray-50 dark:bg-gray-700/30"
                          >
                            <div className="flex items-center p-3 border-b dark:border-gray-600 bg-white dark:bg-gray-800/50 rounded-t">
                              <HiOutlineOfficeBuilding className="mr-2 text-gray-500 dark:text-gray-400" />
                              <Field
                                type="text"
                                autoComplete="off"
                                value={building.name}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                  handleBuildingChange(locationIndex, buildingIndex, e.target.value)
                                }
                                placeholder="Building Name"
                                component={Input}
                                className="flex-grow mr-2 bg-transparent px-0"
                              />
                              <Button
                                size="xs"
                                variant="plain"
                                color="red"
                                icon={<AiOutlineMinus />}
                                onClick={() => removeBuilding(locationIndex, buildingIndex)}
                                className="hover:bg-gray-200 dark:hover:bg-gray-600"
                                type="button"
                              />
                            </div>

                            <div className="p-3">
                              {building.apartments.length === 0 && (
                                <div className="text-center py-3 text-gray-500 dark:text-gray-400 text-xs bg-white dark:bg-gray-800/30 rounded mb-2">
                                  No apartments in this building
                                </div>
                              )}

                              <div className="space-y-2">
                                {building.apartments.map((apartment, apartmentIndex) => (
                                  <div
                                    key={`apartment-${apartmentIndex}`}
                                    className="flex items-center p-2 bg-white dark:bg-gray-800 rounded border dark:border-gray-600"
                                  >
                                    <HiOutlineHome className="mr-2 text-gray-500 dark:text-gray-400" />
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
                                      placeholder="Apartment Number"
                                      component={Input}
                                      className="flex-grow mr-2"
                                    />
                                    <Button
                                      size="xs"
                                      variant="plain"
                                      color="red"
                                      icon={<AiOutlineMinus />}
                                      onClick={() =>
                                        removeApartment(locationIndex, buildingIndex, apartmentIndex)
                                      }
                                      className="hover:bg-gray-200 dark:hover:bg-gray-600"
                                      type="button"
                                    />
                                  </div>
                                ))}
                              </div>
                              <Button
                                size="xs"
                                variant="plain"
                                icon={<AiOutlinePlus />}
                                onClick={() => addApartment(locationIndex, buildingIndex)}
                                className="mt-2 w-full justify-center"
                                type="button"
                              >
                                Add Apartment
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                      <Button
                        size="xs"
                        variant="plain"
                        icon={<AiOutlinePlus />}
                        onClick={() => addBuilding(locationIndex)}
                        className="mt-3 w-full justify-center"
                        type="button"
                      >
                        Add Building
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </AdaptableCard>

            <StickyFooter
              className="-mx-8 px-8 flex items-center justify-between py-4"
              stickyClass="border-t bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"
            >
              <div>
                {type === 'edit' && onDelete && (
                  <Button
                    size="sm"
                    variant="solid"
                    color="red"
                    type="button"
                    onClick={onDelete}
                  >
                    Delete
                  </Button>
                )}
              </div>
              <div className="md:flex items-center">
                <Button
                  size="sm"
                  className="ltr:mr-3 rtl:ml-3"
                  type="button"
                  onClick={onDiscard}
                >
                  Discard
                </Button>
                <Button
                  size="sm"
                  variant="solid"
                  loading={isSubmitting}
                  disabled={isSubmitting}
                  icon={<AiOutlineSave />}
                  type="submit"
                >
                  Save
                </Button>
              </div>
            </StickyFooter>
          </FormContainer>
        </Form>
      )}
    </Formik>
  )
})

ClientForm.displayName = 'ClientForm'

export default ClientForm