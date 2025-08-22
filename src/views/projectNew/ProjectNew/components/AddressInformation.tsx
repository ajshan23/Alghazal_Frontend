import { useCallback, useState, useEffect } from 'react';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { FormItem, FormContainer } from '@/components/ui/Form';
import { Field, Form, Formik } from 'formik';
import get from 'lodash/get';
import * as Yup from 'yup';
import type { FieldProps, FormikTouched, FormikErrors } from 'formik';

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

  // Initialize buildings and apartments based on incoming data
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
    <div className="mb-8">
      <h3 className="mb-2">Address Information</h3>
      <p>Select the project location details</p>

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
              <FormItem
                label="Location"
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
                  className="block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="">Select Location</option>
                  {data.clientData.locations.map((location, index) => (
                    <option 
                      key={index} 
                      value={location.name}
                    >
                      {location.name}
                    </option>
                  ))}
                </Field>
              </FormItem>

              <FormItem
                label="Building"
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
                  className="block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="">Select Building</option>
                  {buildings.map((building, index) => (
                    <option 
                      key={index} 
                      value={building.name}
                    >
                      {building.name}
                    </option>
                  ))}
                </Field>
              </FormItem>

              <FormItem
                label="Apartment"
                invalid={!!getError(errors, 'apartment') && !!getTouched(touched, 'apartment')}
                errorMessage={getError(errors, 'apartment')}
              >
                <Field
                  as="select"
                  name="apartment"
                  disabled={!values.building}
                  className="block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="">Select Apartment</option>
                  {apartments.map((apartment, index) => (
                    <option 
                      key={index} 
                      value={apartment.number}
                    >
                      {apartment.number}
                    </option>
                  ))}
                </Field>
              </FormItem>

              <div className="flex justify-end gap-2 mt-4">
                <Button type="button" onClick={onBack}>
                  Back
                </Button>
                <Button
                  loading={isSubmitting}
                  variant="solid"
                  type="submit"
                >
                  {currentStepStatus === 'complete' ? 'Save' : 'Next'}
                </Button>
              </div>
            </FormContainer>
          </Form>
        )}
      </Formik>
    </div>
  );
};

export default AddressInformation;