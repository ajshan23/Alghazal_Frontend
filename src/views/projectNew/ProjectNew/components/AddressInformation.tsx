import { useCallback, useState, useEffect } from 'react';
import Button from '@/components/ui/Button';
import { FormItem, FormContainer } from '@/components/ui/Form';
import { Field, Form, Formik } from 'formik';
import get from 'lodash/get';
import * as Yup from 'yup';
import { HiOutlineLocationMarker, HiOutlineOfficeBuilding, HiOutlineHome } from 'react-icons/hi';
import type { FormikTouched, FormikErrors } from 'formik';

type Location = {
  name: string;
  buildings: Building[];
};

type Building = {
  name: string;
  apartments: Apartment[];
};

type Apartment = {
  number: string;
};

type FormModel = {
  location: string;
  building: string;
  apartment: string;
};

type AddressInformationProps = {
  data: {
    clientData: {
      locations: Location[];
    };
    location?: string;
    building?: string;
    apartment?: string;
  } & FormModel;
  onNextChange?: (
    values: FormModel,
    formName: string,
    setSubmitting: (isSubmitting: boolean) => void
  ) => void;
  onBackChange?: () => void;
  currentStepStatus?: string;
};

const validationSchema = Yup.object().shape({
  location: Yup.string().required('Location is required'),
  building: Yup.string().required('Building is required'),
  apartment: Yup.string().required('Apartment is required'),
});

const AddressInformation = ({
  data = {
    location: '',
    building: '',
    apartment: '',
    clientData: {
      locations: [],
    },
  },
  onNextChange,
  onBackChange,
  currentStepStatus,
}: AddressInformationProps) => {
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [apartments, setApartments] = useState<Apartment[]>([]);

  useEffect(() => {
    if (data.location && data.clientData.locations.length > 0) {
      const selectedLocation = data.clientData.locations.find(
        (loc) => loc.name === data.location
      );
      const newBuildings = selectedLocation?.buildings || [];
      setBuildings(newBuildings);

      if (data.building) {
        const selectedBuilding = newBuildings.find(
          (bld) => bld.name === data.building
        );
        setApartments(selectedBuilding?.apartments || []);
      }
    }
  }, [data.location, data.building, data.clientData.locations]);

  const onNext = (
    values: FormModel,
    setSubmitting: (isSubmitting: boolean) => void
  ) => {
    onNextChange?.(values, 'addressInformation', setSubmitting);
  };

  const onBack = () => {
    onBackChange?.();
  };

  const getError = useCallback(
    (errors: FormikErrors<FormModel>, name: string) => {
      return get(errors, name);
    },
    []
  );

  const getTouched = useCallback(
    (touched: FormikTouched<FormModel>, name: string) => {
      return get(touched, name);
    },
    []
  );

  const handleLocationChange = (
    value: string,
    setFieldValue: (field: string, value: any) => void
  ) => {
    setFieldValue('building', '');
    setFieldValue('apartment', '');
    const selectedLocation = data.clientData.locations.find(
      (loc) => loc.name === value
    );
    setBuildings(selectedLocation?.buildings || []);
    setApartments([]);
  };

  const handleBuildingChange = (
    value: string,
    setFieldValue: (field: string, value: any) => void
  ) => {
    setFieldValue('apartment', '');
    const selectedBuilding = buildings.find((bld) => bld.name === value);
    setApartments(selectedBuilding?.apartments || []);
  };

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="text-center">
        <div className="flex justify-center mb-4">
          <div className="p-4 bg-gradient-to-r from-green-500 to-teal-600 rounded-2xl shadow-lg">
            <HiOutlineLocationMarker className="text-3xl text-white" />
          </div>
        </div>
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Address Information
        </h3>
        <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
          Select the project location details from the client's registered properties
        </p>
      </div>

      <Formik
        enableReinitialize
        initialValues={{
          location: data.location || '',
          building: data.building || '',
          apartment: data.apartment || '',
        }}
        validationSchema={validationSchema}
        onSubmit={(values, { setSubmitting }) => {
          setSubmitting(true);
          setTimeout(() => {
            onNext(values, setSubmitting);
          }, 1000);
        }}
      >
        {({ values, touched, errors, isSubmitting, setFieldValue }) => (
          <Form>
            <FormContainer>
              <div className="bg-gradient-to-br from-white via-green-50 to-teal-50 dark:from-gray-800 dark:via-gray-850 dark:to-gray-900 rounded-2xl p-8 border border-green-200 dark:border-gray-700 shadow-lg">
                
                <div className="space-y-8">
                  {/* Location Selection */}
                  <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
                    <FormItem
                      label={
                        <div className="flex items-center gap-2 mb-4">
                          <HiOutlineLocationMarker className="text-xl text-green-600" />
                          <span className="font-semibold text-gray-800 dark:text-white text-lg">
                            Select Location
                          </span>
                        </div>
                      }
                      invalid={!!getError(errors, 'location') && !!getTouched(touched, 'location')}
                      errorMessage={getError(errors, 'location')}
                    >
                      <Field
                        as="select"
                        name="location"
                        onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                          setFieldValue('location', e.target.value);
                          handleLocationChange(e.target.value, setFieldValue);
                        }}
                        className="block w-full py-3 px-4 text-lg border-2 border-green-200 dark:border-gray-600 bg-white dark:bg-gray-700 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200"
                      >
                        <option value="">Choose a location...</option>
                        {data.clientData.locations.map((location, index) => (
                          <option key={index} value={location.name}>
                            {location.name}
                          </option>
                        ))}
                      </Field>
                      {data.clientData.locations.length === 0 && (
                        <p className="text-sm text-orange-600 mt-2">
                          No locations found for this client. Please contact support.
                        </p>
                      )}
                    </FormItem>
                  </div>

                  {/* Building Selection */}
                  <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
                    <FormItem
                      label={
                        <div className="flex items-center gap-2 mb-4">
                          <HiOutlineOfficeBuilding className="text-xl text-green-600" />
                          <span className="font-semibold text-gray-800 dark:text-white text-lg">
                            Select Building
                          </span>
                        </div>
                      }
                      invalid={!!getError(errors, 'building') && !!getTouched(touched, 'building')}
                      errorMessage={getError(errors, 'building')}
                    >
                      <Field
                        as="select"
                        name="building"
                        disabled={!values.location}
                        onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                          setFieldValue('building', e.target.value);
                          handleBuildingChange(e.target.value, setFieldValue);
                        }}
                        className={`block w-full py-3 px-4 text-lg border-2 bg-white dark:bg-gray-700 rounded-lg shadow-sm transition-all duration-200 ${
                          !values.location 
                            ? 'border-gray-300 dark:border-gray-600 text-gray-400 cursor-not-allowed' 
                            : 'border-green-200 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500'
                        }`}
                      >
                        <option value="">
                          {!values.location ? 'Select location first...' : 'Choose a building...'}
                        </option>
                        {buildings.map((building, index) => (
                          <option key={index} value={building.name}>
                            {building.name}
                          </option>
                        ))}
                      </Field>
                    </FormItem>
                  </div>

                  {/* Apartment Selection */}
                  <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
                    <FormItem
                      label={
                        <div className="flex items-center gap-2 mb-4">
                          <HiOutlineHome className="text-xl text-green-600" />
                          <span className="font-semibold text-gray-800 dark:text-white text-lg">
                            Select Apartment
                          </span>
                        </div>
                      }
                      invalid={!!getError(errors, 'apartment') && !!getTouched(touched, 'apartment')}
                      errorMessage={getError(errors, 'apartment')}
                    >
                      <Field
                        as="select"
                        name="apartment"
                        disabled={!values.building}
                        className={`block w-full py-3 px-4 text-lg border-2 bg-white dark:bg-gray-700 rounded-lg shadow-sm transition-all duration-200 ${
                          !values.building 
                            ? 'border-gray-300 dark:border-gray-600 text-gray-400 cursor-not-allowed' 
                            : 'border-green-200 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500'
                        }`}
                      >
                        <option value="">
                          {!values.building ? 'Select building first...' : 'Choose an apartment...'}
                        </option>
                        {apartments.map((apartment, index) => (
                          <option key={index} value={apartment.number}>
                            Apartment {apartment.number}
                          </option>
                        ))}
                      </Field>
                    </FormItem>
                  </div>
                </div>

                {/* Selection Summary */}
                {values.location && values.building && values.apartment && (
                  <div className="mt-8 bg-gradient-to-r from-green-50 to-teal-50 dark:from-green-900/20 dark:to-teal-900/20 border border-green-200 dark:border-green-800 rounded-xl p-6">
                    <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                      Selected Address
                    </h4>
                    <div className="grid md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600 dark:text-gray-400">Location:</span>
                        <p className="font-semibold text-gray-900 dark:text-white">{values.location}</p>
                      </div>
                      <div>
                        <span className="text-gray-600 dark:text-gray-400">Building:</span>
                        <p className="font-semibold text-gray-900 dark:text-white">{values.building}</p>
                      </div>
                      <div>
                        <span className="text-gray-600 dark:text-gray-400">Apartment:</span>
                        <p className="font-semibold text-gray-900 dark:text-white">{values.apartment}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Progress Indicator */}
                <div className="mt-8">
                  <div className="bg-gradient-to-r from-green-50 to-teal-50 dark:from-green-900/20 dark:to-teal-900/20 rounded-xl p-4 border border-green-200 dark:border-green-800">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Form Completion
                      </span>
                      <span className="text-sm font-bold text-green-600 dark:text-green-400">
                        75% Complete
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div className="bg-gradient-to-r from-green-500 to-teal-600 h-2 rounded-full w-3/4 transition-all duration-300"></div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-between gap-4 mt-8">
                  <Button 
                    type="button" 
                    onClick={onBack}
                    variant="plain"
                    size="lg"
                    className="px-6 py-3 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl font-semibold transition-all duration-200"
                  >
                    Back to Project Details
                  </Button>
                  <Button
                    loading={isSubmitting}
                    variant="solid"
                    type="submit"
                    size="lg"
                    className="px-8 py-3 bg-gradient-to-r from-green-600 to-teal-700 hover:from-green-700 hover:to-teal-800 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200"
                  >
                    {currentStepStatus === 'complete' ? 'Save Changes' : 'Continue to Review'}
                  </Button>
                </div>
              </div>
            </FormContainer>
          </Form>
        )}
      </Formik>
    </div>
  );
};

export default AddressInformation;