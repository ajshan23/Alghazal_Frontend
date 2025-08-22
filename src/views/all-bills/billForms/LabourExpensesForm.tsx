import { forwardRef, useEffect, useState } from 'react';
import { FormContainer, FormItem } from '@/components/ui/Form';
import Button from '@/components/ui/Button';
import StickyFooter from '@/components/shared/StickyFooter';
import { Form, Formik, FormikProps } from 'formik';
import { AiOutlineSave, AiOutlinePlus } from 'react-icons/ai';
import { HiOutlineTrash } from 'react-icons/hi';
import * as Yup from 'yup';
import { Input } from '@/components/ui';
import { AdaptableCard } from '@/components/shared';
import Select from '@/components/ui/Select';
import { fetchUser } from '../api/api';

type FormikRef = FormikProps<any>;

type CustomExpense = {
  name: string;
  amount: number;
};

type LabourExpenseItem = {
  employee: string;
  designation: string;
  country: string;
  basicSalary: number;
  allowance: number;
  totalSalary: number;
  twoYearSalary: number;
  perYearExpenses: number;
  perMonthExpenses: number;
  perDayExpenses: number;
  totalExpensesPerPerson: number;
  visaExpenses: number;
  twoYearUniform: number;
  shoes: number;
  twoYearAccommodation: number;
  sewaBills: number;
  dewaBills: number;
  insurance: number;
  transport: number;
  water: number;
  thirdPartyLiabilities: number;
  fairmontCertificate: number;
  leaveSalary: number;
  ticket: number;
  gratuity: number;
  customExpenses: CustomExpense[];
};

export type FormModel = LabourExpenseItem;

type LabourExpensesFormProps = {
  initialData?: FormModel;
  type: 'edit' | 'new';
  onDiscard?: () => void;
  onDelete?: (callback: React.Dispatch<React.SetStateAction<boolean>>) => void;
  onFormSubmit: (
    formData: FormModel,
    setSubmitting: (isSubmitting: boolean) => void
  ) => Promise<any>;
};

type UserOption = {
  value: string;
  label: string;
  role: string;
};

const LabourExpensesForm = forwardRef<FormikRef, LabourExpensesFormProps>((props, ref) => {
  const {
    type,
    initialData = {
      employee: '',
      designation: '',
      country: '',
      basicSalary: 0,
      allowance: 0,
      totalSalary: 0,
      twoYearSalary: 0,
      perYearExpenses: 0,
      perMonthExpenses: 0,
      perDayExpenses: 0,
      totalExpensesPerPerson: 0,
      visaExpenses: 0,
      twoYearUniform: 0,
      shoes: 0,
      twoYearAccommodation: 0,
      sewaBills: 0,
      dewaBills: 0,
      insurance: 0,
      transport: 0,
      water: 0,
      thirdPartyLiabilities: 0,
      fairmontCertificate: 0,
      leaveSalary: 0,
      ticket: 0,
      gratuity: 0,
      customExpenses: []
    },
    onFormSubmit,
    onDiscard,
    onDelete,
  } = props;

  const validationSchema = Yup.object().shape({
    employee: Yup.string().required('Employee is required'),
    designation: Yup.string().required('Designation is required'),
    country: Yup.string().required('Country is required'),
    basicSalary: Yup.number()
      .required('Basic salary is required')
      .min(0, 'Basic salary cannot be negative'),
    allowance: Yup.number()
      .required('Allowance is required')
      .min(0, 'Allowance cannot be negative'),
    totalSalary: Yup.number()
      .required('Total salary is required')
      .min(0, 'Total salary cannot be negative'),
    twoYearSalary: Yup.number()
      .required('Two year salary is required')
      .min(0, 'Two year salary cannot be negative'),
    perYearExpenses: Yup.number()
      .required('Per year expenses are required')
      .min(0, 'Expenses cannot be negative'),
    perMonthExpenses: Yup.number()
      .required('Per month expenses are required')
      .min(0, 'Expenses cannot be negative'),
    perDayExpenses: Yup.number()
      .required('Per day expenses are required')
      .min(0, 'Expenses cannot be negative'),
    totalExpensesPerPerson: Yup.number()
      .required('Total expenses per person are required')
      .min(0, 'Expenses cannot be negative'),
    visaExpenses: Yup.number()
      .required('Visa expenses are required')
      .min(0, 'Expenses cannot be negative'),
    twoYearUniform: Yup.number()
      .required('Two year uniform cost is required')
      .min(0, 'Cost cannot be negative'),
    shoes: Yup.number()
      .required('Shoes cost is required')
      .min(0, 'Cost cannot be negative'),
    twoYearAccommodation: Yup.number()
      .required('Two year accommodation cost is required')
      .min(0, 'Cost cannot be negative'),
    sewaBills: Yup.number()
      .required('SEWA bills are required')
      .min(0, 'Bills cannot be negative'),
    dewaBills: Yup.number()
      .required('DEWA bills are required')
      .min(0, 'Bills cannot be negative'),
    insurance: Yup.number()
      .required('Insurance cost is required')
      .min(0, 'Cost cannot be negative'),
    transport: Yup.number()
      .required('Transport cost is required')
      .min(0, 'Cost cannot be negative'),
    water: Yup.number()
      .required('Water cost is required')
      .min(0, 'Cost cannot be negative'),
    thirdPartyLiabilities: Yup.number()
      .required('Third party liabilities are required')
      .min(0, 'Amount cannot be negative'),
    fairmontCertificate: Yup.number()
      .required('Fairmont certificate cost is required')
      .min(0, 'Cost cannot be negative'),
    leaveSalary: Yup.number()
      .required('Leave salary is required')
      .min(0, 'Amount cannot be negative'),
    ticket: Yup.number()
      .required('Ticket cost is required')
      .min(0, 'Cost cannot be negative'),
    gratuity: Yup.number()
      .required('Gratuity amount is required')
      .min(0, 'Amount cannot be negative'),
    customExpenses: Yup.array().of(
      Yup.object().shape({
        name: Yup.string().required('Custom expense name is required'),
        amount: Yup.number()
          .required('Custom expense amount is required')
          .min(0, 'Amount cannot be negative')
      })
    )
  });

  const countryOptions = [
    { value: "Aruba", label: "Aruba" },
    { value: "Afghanistan", label: "Afghanistan" },
    { value: "Angola", label: "Angola" },
    { value: "Anguilla", label: "Anguilla" },
    { value: "Åland Islands", label: "Åland Islands" },
    { value: "Albania", label: "Albania" },
    { value: "Andorra", label: "Andorra" },
    { value: "United Arab Emirates", label: "United Arab Emirates" },
    { value: "Argentina", label: "Argentina" },
    { value: "Armenia", label: "Armenia" },
    { value: "American Samoa", label: "American Samoa" },
    { value: "Antarctica", label: "Antarctica" },
    { value: "French Southern Territories", label: "French Southern Territories" },
    { value: "Antigua and Barbuda", label: "Antigua and Barbuda" },
    { value: "Australia", label: "Australia" },
    { value: "Austria", label: "Austria" },
    { value: "Azerbaijan", label: "Azerbaijan" },
    { value: "Burundi", label: "Burundi" },
    { value: "Belgium", label: "Belgium" },
    { value: "Benin", label: "Benin" },
    { value: "Bonaire, Sint Eustatius and Saba", label: "Bonaire, Sint Eustatius and Saba" },
    { value: "Burkina Faso", label: "Burkina Faso" },
    { value: "Bangladesh", label: "Bangladesh" },
    { value: "Bulgaria", label: "Bulgaria" },
    { value: "Bahrain", label: "Bahrain" },
    { value: "Bahamas", label: "Bahamas" },
    { value: "Bosnia and Herzegovina", label: "Bosnia and Herzegovina" },
    { value: "Saint Barthélemy", label: "Saint Barthélemy" },
    { value: "Belarus", label: "Belarus" },
    { value: "Belize", label: "Belize" },
    { value: "Bermuda", label: "Bermuda" },
    { value: "Bolivia, Plurinational State of", label: "Bolivia, Plurinational State of" },
    { value: "Brazil", label: "Brazil" },
    { value: "Barbados", label: "Barbados" },
    { value: "Brunei Darussalam", label: "Brunei Darussalam" },
    { value: "Bhutan", label: "Bhutan" },
    { value: "Bouvet Island", label: "Bouvet Island" },
    { value: "Botswana", label: "Botswana" },
    { value: "Central African Republic", label: "Central African Republic" },
    { value: "Canada", label: "Canada" },
    { value: "Cocos (Keeling) Islands", label: "Cocos (Keeling) Islands" },
    { value: "Switzerland", label: "Switzerland" },
    { value: "Chile", label: "Chile" },
    { value: "China", label: "China" },
    { value: "Côte d'Ivoire", label: "Côte d'Ivoire" },
    { value: "Cameroon", label: "Cameroon" },
    { value: "Congo, The Democratic Republic of the", label: "Congo, The Democratic Republic of the" },
    { value: "Congo", label: "Congo" },
    { value: "Cook Islands", label: "Cook Islands" },
    { value: "Colombia", label: "Colombia" },
    { value: "Comoros", label: "Comoros" },
    { value: "Cabo Verde", label: "Cabo Verde" },
    { value: "Costa Rica", label: "Costa Rica" },
    { value: "Cuba", label: "Cuba" },
    { value: "Curaçao", label: "Curaçao" },
    { value: "Christmas Island", label: "Christmas Island" },
    { value: "Cayman Islands", label: "Cayman Islands" },
    { value: "Cyprus", label: "Cyprus" },
    { value: "Czechia", label: "Czechia" },
    { value: "Germany", label: "Germany" },
    { value: "Djibouti", label: "Djibouti" },
    { value: "Dominica", label: "Dominica" },
    { value: "Denmark", label: "Denmark" },
    { value: "Dominican Republic", label: "Dominican Republic" },
    { value: "Algeria", label: "Algeria" },
    { value: "Ecuador", label: "Ecuador" },
    { value: "Egypt", label: "Egypt" },
    { value: "Eritrea", label: "Eritrea" },
    { value: "Western Sahara", label: "Western Sahara" },
    { value: "Spain", label: "Spain" },
    { value: "Estonia", label: "Estonia" },
    { value: "Ethiopia", label: "Ethiopia" },
    { value: "Finland", label: "Finland" },
    { value: "Fiji", label: "Fiji" },
    { value: "Falkland Islands (Malvinas)", label: "Falkland Islands (Malvinas)" },
    { value: "France", label: "France" },
    { value: "Faroe Islands", label: "Faroe Islands" },
    { value: "Micronesia, Federated States of", label: "Micronesia, Federated States of" },
    { value: "Gabon", label: "Gabon" },
    { value: "United Kingdom", label: "United Kingdom" },
    { value: "Georgia", label: "Georgia" },
    { value: "Guernsey", label: "Guernsey" },
    { value: "Ghana", label: "Ghana" },
    { value: "Gibraltar", label: "Gibraltar" },
    { value: "Guinea", label: "Guinea" },
    { value: "Guadeloupe", label: "Guadeloupe" },
    { value: "Gambia", label: "Gambia" },
    { value: "Guinea-Bissau", label: "Guinea-Bissau" },
    { value: "Equatorial Guinea", label: "Equatorial Guinea" },
    { value: "Greece", label: "Greece" },
    { value: "Grenada", label: "Grenada" },
    { value: "Greenland", label: "Greenland" },
    { value: "Guatemala", label: "Guatemala" },
    { value: "French Guiana", label: "French Guiana" },
    { value: "Guam", label: "Guam" },
    { value: "Guyana", label: "Guyana" },
    { value: "Hong Kong", label: "Hong Kong" },
    { value: "Heard Island and McDonald Islands", label: "Heard Island and McDonald Islands" },
    { value: "Honduras", label: "Honduras" },
    { value: "Croatia", label: "Croatia" },
    { value: "Haiti", label: "Haiti" },
    { value: "Hungary", label: "Hungary" },
    { value: "Indonesia", label: "Indonesia" },
    { value: "Isle of Man", label: "Isle of Man" },
    { value: "India", label: "India" },
    { value: "British Indian Ocean Territory", label: "British Indian Ocean Territory" },
    { value: "Ireland", label: "Ireland" },
    { value: "Iran, Islamic Republic of", label: "Iran, Islamic Republic of" },
    { value: "Iraq", label: "Iraq" },
    { value: "Iceland", label: "Iceland" },
    { value: "Israel", label: "Israel" },
    { value: "Italy", label: "Italy" },
    { value: "Jamaica", label: "Jamaica" },
    { value: "Jersey", label: "Jersey" },
    { value: "Jordan", label: "Jordan" },
    { value: "Japan", label: "Japan" },
    { value: "Kazakhstan", label: "Kazakhstan" },
    { value: "Kenya", label: "Kenya" },
    { value: "Kyrgyzstan", label: "Kyrgyzstan" },
    { value: "Cambodia", label: "Cambodia" },
    { value: "Kiribati", label: "Kiribati" },
    { value: "Saint Kitts and Nevis", label: "Saint Kitts and Nevis" },
    { value: "Korea, Republic of", label: "Korea, Republic of" },
    { value: "Kuwait", label: "Kuwait" },
    { value: "Lao People's Democratic Republic", label: "Lao People's Democratic Republic" },
    { value: "Lebanon", label: "Lebanon" },
    { value: "Liberia", label: "Liberia" },
    { value: "Libya", label: "Libya" },
    { value: "Saint Lucia", label: "Saint Lucia" },
    { value: "Liechtenstein", label: "Liechtenstein" },
    { value: "Sri Lanka", label: "Sri Lanka" },
    { value: "Lesotho", label: "Lesotho" },
    { value: "Lithuania", label: "Lithuania" },
    { value: "Luxembourg", label: "Luxembourg" },
    { value: "Latvia", label: "Latvia" },
    { value: "Macao", label: "Macao" },
    { value: "Saint Martin (French part)", label: "Saint Martin (French part)" },
    { value: "Morocco", label: "Morocco" },
    { value: "Monaco", label: "Monaco" },
    { value: "Moldova, Republic of", label: "Moldova, Republic of" },
    { value: "Madagascar", label: "Madagascar" },
    { value: "Maldives", label: "Maldives" },
    { value: "Mexico", label: "Mexico" },
    { value: "Marshall Islands", label: "Marshall Islands" },
    { value: "North Macedonia", label: "North Macedonia" },
    { value: "Mali", label: "Mali" },
    { value: "Malta", label: "Malta" },
    { value: "Myanmar", label: "Myanmar" },
    { value: "Montenegro", label: "Montenegro" },
    { value: "Mongolia", label: "Mongolia" },
    { value: "Northern Mariana Islands", label: "Northern Mariana Islands" },
    { value: "Mozambique", label: "Mozambique" },
    { value: "Mauritania", label: "Mauritania" },
    { value: "Montserrat", label: "Montserrat" },
    { value: "Martinique", label: "Martinique" },
    { value: "Mauritius", label: "Mauritius" },
    { value: "Malawi", label: "Malawi" },
    { value: "Malaysia", label: "Malaysia" },
    { value: "Mayotte", label: "Mayotte" },
    { value: "Namibia", label: "Namibia" },
    { value: "New Caledonia", label: "New Caledonia" },
    { value: "Niger", label: "Niger" },
    { value: "Norfolk Island", label: "Norfolk Island" },
    { value: "Nigeria", label: "Nigeria" },
    { value: "Nicaragua", label: "Nicaragua" },
    { value: "Niue", label: "Niue" },
    { value: "Netherlands", label: "Netherlands" },
    { value: "Norway", label: "Norway" },
    { value: "Nepal", label: "Nepal" },
    { value: "Nauru", label: "Nauru" },
    { value: "New Zealand", label: "New Zealand" },
    { value: "Oman", label: "Oman" },
    { value: "Pakistan", label: "Pakistan" },
    { value: "Panama", label: "Panama" },
    { value: "Pitcairn", label: "Pitcairn" },
    { value: "Peru", label: "Peru" },
    { value: "Philippines", label: "Philippines" },
    { value: "Palau", label: "Palau" },
    { value: "Papua New Guinea", label: "Papua New Guinea" },
    { value: "Poland", label: "Poland" },
    { value: "Puerto Rico", label: "Puerto Rico" },
    { value: "Korea, Democratic People's Republic of", label: "Korea, Democratic People's Republic of" },
    { value: "Portugal", label: "Portugal" },
    { value: "Paraguay", label: "Paraguay" },
    { value: "Palestine, State of", label: "Palestine, State of" },
    { value: "French Polynesia", label: "French Polynesia" },
    { value: "Qatar", label: "Qatar" },
    { value: "Réunion", label: "Réunion" },
    { value: "Romania", label: "Romania" },
    { value: "Russian Federation", label: "Russian Federation" },
    { value: "Rwanda", label: "Rwanda" },
    { value: "Saudi Arabia", label: "Saudi Arabia" },
    { value: "Sudan", label: "Sudan" },
    { value: "Senegal", label: "Senegal" },
    { value: "Singapore", label: "Singapore" },
    { value: "South Georgia and the South Sandwich Islands", label: "South Georgia and the South Sandwich Islands" },
    { value: "Saint Helena, Ascension and Tristan da Cunha", label: "Saint Helena, Ascension and Tristan da Cunha" },
    { value: "Svalbard and Jan Mayen", label: "Svalbard and Jan Mayen" },
    { value: "Solomon Islands", label: "Solomon Islands" },
    { value: "Sierra Leone", label: "Sierra Leone" },
    { value: "El Salvador", label: "El Salvador" },
    { value: "San Marino", label: "San Marino" },
    { value: "Somalia", label: "Somalia" },
    { value: "Saint Pierre and Miquelon", label: "Saint Pierre and Miquelon" },
    { value: "Serbia", label: "Serbia" },
    { value: "South Sudan", label: "South Sudan" },
    { value: "Sao Tome and Principe", label: "Sao Tome and Principe" },
    { value: "Suriname", label: "Suriname" },
    { value: "Slovakia", label: "Slovakia" },
    { value: "Slovenia", label: "Slovenia" },
    { value: "Sweden", label: "Sweden" },
    { value: "Eswatini", label: "Eswatini" },
    { value: "Sint Maarten (Dutch part)", label: "Sint Maarten (Dutch part)" },
    { value: "Seychelles", label: "Seychelles" },
    { value: "Syrian Arab Republic", label: "Syrian Arab Republic" },
    { value: "Turks and Caicos Islands", label: "Turks and Caicos Islands" },
    { value: "Chad", label: "Chad" },
    { value: "Togo", label: "Togo" },
    { value: "Thailand", label: "Thailand" },
    { value: "Tajikistan", label: "Tajikistan" },
    { value: "Tokelau", label: "Tokelau" },
    { value: "Turkmenistan", label: "Turkmenistan" },
    { value: "Timor-Leste", label: "Timor-Leste" },
    { value: "Tonga", label: "Tonga" },
    { value: "Trinidad and Tobago", label: "Trinidad and Tobago" },
    { value: "Tunisia", label: "Tunisia" },
    { value: "Turkey", label: "Turkey" },
    { value: "Tuvalu", label: "Tuvalu" },
    { value: "Taiwan, Province of China", label: "Taiwan, Province of China" },
    { value: "Tanzania, United Republic of", label: "Tanzania, United Republic of" },
    { value: "Uganda", label: "Uganda" },
    { value: "Ukraine", label: "Ukraine" },
    { value: "United States Minor Outlying Islands", label: "United States Minor Outlying Islands" },
    { value: "Uruguay", label: "Uruguay" },
    { value: "United States", label: "United States" },
    { value: "Uzbekistan", label: "Uzbekistan" },
    { value: "Holy See (Vatican City State)", label: "Holy See (Vatican City State)" },
    { value: "Saint Vincent and the Grenadines", label: "Saint Vincent and the Grenadines" },
    { value: "Venezuela, Bolivarian Republic of", label: "Venezuela, Bolivarian Republic of" },
    { value: "Virgin Islands, British", label: "Virgin Islands, British" },
    { value: "Virgin Islands, U.S.", label: "Virgin Islands, U.S." },
    { value: "Viet Nam", label: "Viet Nam" },
    { value: "Vanuatu", label: "Vanuatu" },
    { value: "Wallis and Futuna", label: "Wallis and Futuna" },
    { value: "Samoa", label: "Samoa" },
    { value: "Yemen", label: "Yemen" },
    { value: "South Africa", label: "South Africa" },
    { value: "Zambia", label: "Zambia" },
    { value: "Zimbabwe", label: "Zimbabwe" }
  ];

  const [userOptions, setUserOptions] = useState<UserOption[]>([]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetchUser();
        const options = response.data?.users.map((user: any) => ({
          value: user._id,
          label: `${user.firstName} ${user.lastName}`,
          role: user.role
        }));
        setUserOptions(options);
      } catch (error) {
        console.error('Failed to fetch users', error);
      }
    };

    fetchUsers();
  }, []);

  const handleAddCustomExpense = (values: FormModel, setFieldValue: any) => {
    const currentExpenses = values.customExpenses || [];
    const customExpenses = [...currentExpenses, { name: '', amount: 0 }];
    setFieldValue('customExpenses', customExpenses);
  };

  const handleRemoveCustomExpense = (customIndex: number, values: FormModel, setFieldValue: any) => {
    const currentExpenses = values.customExpenses || [];
    const customExpenses = [...currentExpenses];
    customExpenses.splice(customIndex, 1);
    setFieldValue('customExpenses', customExpenses);
  };

  const handleCustomExpenseChange = (
    customIndex: number,
    field: string,
    value: any,
    values: FormModel,
    setFieldValue: any
  ) => {
    const currentExpenses = values.customExpenses || [];
    const customExpenses = [...currentExpenses];
    customExpenses[customIndex] = {
      ...customExpenses[customIndex],
      [field]: field === 'amount' ? Number(value) || 0 : value
    };
    setFieldValue('customExpenses', customExpenses);
  };

  return (
    <Formik
      innerRef={ref}
      initialValues={initialData}
      validationSchema={validationSchema}
      onSubmit={async (values, { setSubmitting }) => {
        try {
          await onFormSubmit(values, setSubmitting);
        } catch (error) {
          setSubmitting(false);
          console.error('Form submission error:', error);
        }
      }}
      enableReinitialize={true}
    >
      {({ values, touched, errors, isSubmitting, setFieldValue, handleBlur }) => {
        useEffect(() => {
          // Calculate salary fields
          const basicSalary = Number(values.basicSalary) || 0;
          const allowance = Number(values.allowance) || 0;
          const totalSalary = basicSalary + allowance;
          const twoYearSalary = totalSalary * 24;

          // Calculate detailed expenses
          const detailedExpenses = [
            'visaExpenses',
            'twoYearUniform',
            'shoes',
            'twoYearAccommodation',
            'sewaBills',
            'dewaBills',
            'insurance',
            'transport',
            'water',
            'thirdPartyLiabilities',
            'fairmontCertificate',
            'leaveSalary',
            'ticket',
            'gratuity'
          ].reduce((sum, field) => sum + (Number(values[field as keyof FormModel]) || 0), 0);

          // Calculate custom expenses
          const customExpensesTotal = (values.customExpenses || [])
            .reduce((sum, expense) => sum + (Number(expense.amount) || 0), 0);

          // Calculate all totals
          const totalTwoYearExpenses = twoYearSalary + detailedExpenses + customExpensesTotal;
          const perYearExpenses = totalTwoYearExpenses / 2;
          const perMonthExpenses = totalTwoYearExpenses / 24;
          const perDayExpenses = perMonthExpenses / 30;

          // Update all calculated fields
          setFieldValue('totalSalary', totalSalary);
          setFieldValue('twoYearSalary', twoYearSalary);
          setFieldValue('totalExpensesPerPerson', totalTwoYearExpenses.toFixed(2));
          setFieldValue('perYearExpenses', perYearExpenses.toFixed(2));
          setFieldValue('perMonthExpenses', perMonthExpenses.toFixed(2));
          setFieldValue('perDayExpenses', perDayExpenses.toFixed(2));

        }, [
          values.basicSalary,
          values.allowance,
          values.visaExpenses,
          values.twoYearUniform,
          values.shoes,
          values.twoYearAccommodation,
          values.sewaBills,
          values.dewaBills,
          values.insurance,
          values.transport,
          values.water,
          values.thirdPartyLiabilities,
          values.fairmontCertificate,
          values.leaveSalary,
          values.ticket,
          values.gratuity,
          values.customExpenses,
          setFieldValue
        ]);

        return (
          <Form>
            <FormContainer>
              <div className="grid grid-cols-1 gap-4">
                <AdaptableCard divider className="mb-4">
                  {/* Basic Information Section */}
                  <div className="mb-8">
                    <h5 className="text-lg font-semibold mb-4 border-b pb-2">
                      Basic Information
                    </h5>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <FormItem
                        label="EMPLOYEE"
                        invalid={!!errors.employee}
                        errorMessage={errors.employee as string}
                      >
                        <Select
                          name="employee"
                          placeholder="Select employee"
                          value={userOptions.find(opt => opt.value === values.employee)}
                          options={userOptions}
                          onChange={(option) => {
                            setFieldValue('employee', option?.value);
                            setFieldValue('designation', option?.role);
                          }}
                          onBlur={handleBlur}
                        />
                      </FormItem>

                      <FormItem
                        label="DESIGNATION"
                        invalid={!!errors.designation}
                        errorMessage={errors.designation as string}
                      >
                        <Input
                          name="designation"
                          value={values.designation}
                          readOnly
                          onBlur={handleBlur}
                        />
                      </FormItem>

                      <FormItem
                        label="COUNTRY"
                        invalid={!!errors.country}
                        errorMessage={errors.country as string}
                      >
                        <Select
                          name="country"
                          value={countryOptions.find(opt => opt.value === values.country)}
                          options={countryOptions}
                          onChange={(option) => setFieldValue('country', option?.value)}
                          onBlur={handleBlur}
                        />
                      </FormItem>
                    </div>
                  </div>

                  {/* Salary Information Section */}
                  <div className="mb-8">
                    <h5 className="text-lg font-semibold mb-4 border-b pb-2">
                      Salary Information
                    </h5>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <FormItem
                        label="BASIC SALARY"
                        invalid={!!errors.basicSalary}
                        errorMessage={errors.basicSalary as string}
                      >
                        <Input
                          type="number"
                          name="basicSalary"
                          value={values.basicSalary}
                          onChange={(e) => {
                            const value = Number(e.target.value) || 0;
                            setFieldValue('basicSalary', value);
                          }}
                          onBlur={handleBlur}
                        />
                      </FormItem>

                      <FormItem
                        label="ALLOWANCE"
                        invalid={!!errors.allowance}
                        errorMessage={errors.allowance as string}
                      >
                        <Input
                          type="number"
                          name="allowance"
                          value={values.allowance}
                          onChange={(e) => {
                            const value = Number(e.target.value) || 0;
                            setFieldValue('allowance', value);
                          }}
                          onBlur={handleBlur}
                        />
                      </FormItem>

                      <FormItem
                        label="TOTAL SALARY"
                        invalid={!!errors.totalSalary}
                        errorMessage={errors.totalSalary as string}
                      >
                        <Input
                          type="number"
                          name="totalSalary"
                          value={values.totalSalary}
                          disabled
                          onBlur={handleBlur}
                        />
                      </FormItem>

                      <FormItem
                        label="2 YEARS SALARY"
                        invalid={!!errors.twoYearSalary}
                        errorMessage={errors.twoYearSalary as string}
                      >
                        <Input
                          type="number"
                          name="twoYearSalary"
                          value={values.twoYearSalary}
                          disabled
                          onBlur={handleBlur}
                        />
                      </FormItem>
                    </div>
                  </div>

                  {/* Expenses Breakdown Section */}
                  <div className="mb-8">
                    <h5 className="text-lg font-semibold mb-4 border-b pb-2">
                      Expenses Breakdown
                    </h5>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <FormItem
                        label="PER YEAR EXPENSES"
                        invalid={!!errors.perYearExpenses}
                        errorMessage={errors.perYearExpenses as string}
                      >
                        <Input
                          type="number"
                          name="perYearExpenses"
                          value={values.perYearExpenses}
                          disabled
                          onBlur={handleBlur}
                        />
                      </FormItem>

                      <FormItem
                        label="PER MONTH EXPENSES"
                        invalid={!!errors.perMonthExpenses}
                        errorMessage={errors.perMonthExpenses as string}
                      >
                        <Input
                          type="number"
                          name="perMonthExpenses"
                          value={values.perMonthExpenses}
                          disabled
                          onBlur={handleBlur}
                        />
                      </FormItem>

                      <FormItem
                        label="PER DAY EXPENSES"
                        invalid={!!errors.perDayExpenses}
                        errorMessage={errors.perDayExpenses as string}
                      >
                        <Input
                          type="number"
                          name="perDayExpenses"
                          value={values.perDayExpenses}
                          disabled
                          onBlur={handleBlur}
                        />
                      </FormItem>

                      <FormItem
                        label="TOTAL EXPENSES PER PERSON (2 YEAR)"
                        invalid={!!errors.totalExpensesPerPerson}
                        errorMessage={errors.totalExpensesPerPerson as string}
                      >
                        <Input
                          type="number"
                          name="totalExpensesPerPerson"
                          value={values.totalExpensesPerPerson}
                          disabled
                          onBlur={handleBlur}
                        />
                      </FormItem>
                    </div>
                  </div>

                  {/* Detailed Expenses Section */}
                  <div className="mb-8">
                    <h5 className="text-lg font-semibold mb-4 border-b pb-2">
                      Detailed Expenses
                    </h5>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <FormItem
                        label="VISA EXPENSES"
                        invalid={!!errors.visaExpenses}
                        errorMessage={errors.visaExpenses as string}
                      >
                        <Input
                          type="number"
                          name="visaExpenses"
                          value={values.visaExpenses}
                          onChange={(e) => setFieldValue('visaExpenses', Number(e.target.value) || 0)}
                          onBlur={handleBlur}
                        />
                      </FormItem>

                      <FormItem
                        label="2 YEAR UNIFORM (3 SET PER 6 MONTH)"
                        invalid={!!errors.twoYearUniform}
                        errorMessage={errors.twoYearUniform as string}
                      >
                        <Input
                          type="number"
                          name="twoYearUniform"
                          value={values.twoYearUniform}
                          onChange={(e) => setFieldValue('twoYearUniform', Number(e.target.value) || 0)}
                          onBlur={handleBlur}
                        />
                      </FormItem>

                      <FormItem
                        label="SHOES"
                        invalid={!!errors.shoes}
                        errorMessage={errors.shoes as string}
                      >
                        <Input
                          type="number"
                          name="shoes"
                          value={values.shoes}
                          onChange={(e) => setFieldValue('shoes', Number(e.target.value) || 0)}
                          onBlur={handleBlur}
                        />
                      </FormItem>

                      <FormItem
                        label="2 YEAR ACCOMMODATION + OFFICE RENT"
                        invalid={!!errors.twoYearAccommodation}
                        errorMessage={errors.twoYearAccommodation as string}
                      >
                        <Input
                          type="number"
                          name="twoYearAccommodation"
                          value={values.twoYearAccommodation}
                          onChange={(e) => setFieldValue('twoYearAccommodation', Number(e.target.value) || 0)}
                          onBlur={handleBlur}
                        />
                      </FormItem>

                      <FormItem
                        label="SEWA BILLS 2 YEAR"
                        invalid={!!errors.sewaBills}
                        errorMessage={errors.sewaBills as string}
                      >
                        <Input
                          type="number"
                          name="sewaBills"
                          value={values.sewaBills}
                          onChange={(e) => setFieldValue('sewaBills', Number(e.target.value) || 0)}
                          onBlur={handleBlur}
                        />
                      </FormItem>

                      <FormItem
                        label="DEWA BILLS 2 YEAR"
                        invalid={!!errors.dewaBills}
                        errorMessage={errors.dewaBills as string}
                      >
                        <Input
                          type="number"
                          name="dewaBills"
                          value={values.dewaBills}
                          onChange={(e) => setFieldValue('dewaBills', Number(e.target.value) || 0)}
                          onBlur={handleBlur}
                        />
                      </FormItem>

                      <FormItem
                        label="WORKMAN COMPENSATION INSURANCE"
                        invalid={!!errors.insurance}
                        errorMessage={errors.insurance as string}
                      >
                        <Input
                          type="number"
                          name="insurance"
                          value={values.insurance}
                          onChange={(e) => setFieldValue('insurance', Number(e.target.value) || 0)}
                          onBlur={handleBlur}
                        />
                      </FormItem>

                      <FormItem
                        label="TRANSPORT"
                        invalid={!!errors.transport}
                        errorMessage={errors.transport as string}
                      >
                        <Input
                          type="number"
                          name="transport"
                          value={values.transport}
                          onChange={(e) => setFieldValue('transport', Number(e.target.value) || 0)}
                          onBlur={handleBlur}
                        />
                      </FormItem>

                      <FormItem
                        label="WATER"
                        invalid={!!errors.water}
                        errorMessage={errors.water as string}
                      >
                        <Input
                          type="number"
                          name="water"
                          value={values.water}
                          onChange={(e) => setFieldValue('water', Number(e.target.value) || 0)}
                          onBlur={handleBlur}
                        />
                      </FormItem>

                      <FormItem
                        label="THIRD PARTY LIABILITIES"
                        invalid={!!errors.thirdPartyLiabilities}
                        errorMessage={errors.thirdPartyLiabilities as string}
                      >
                        <Input
                          type="number"
                          name="thirdPartyLiabilities"
                          value={values.thirdPartyLiabilities}
                          onChange={(e) => setFieldValue('thirdPartyLiabilities', Number(e.target.value) || 0)}
                          onBlur={handleBlur}
                        />
                      </FormItem>

                      <FormItem
                        label="FAIRMONT CERTIFICATE"
                        invalid={!!errors.fairmontCertificate}
                        errorMessage={errors.fairmontCertificate as string}
                      >
                        <Input
                          type="number"
                          name="fairmontCertificate"
                          value={values.fairmontCertificate}
                          onChange={(e) => setFieldValue('fairmontCertificate', Number(e.target.value) || 0)}
                          onBlur={handleBlur}
                        />
                      </FormItem>

                      <FormItem
                        label="LEAVE SALARY"
                        invalid={!!errors.leaveSalary}
                        errorMessage={errors.leaveSalary as string}
                      >
                        <Input
                          type="number"
                          name="leaveSalary"
                          value={values.leaveSalary}
                          onChange={(e) => setFieldValue('leaveSalary', Number(e.target.value) || 0)}
                          onBlur={handleBlur}
                        />
                      </FormItem>

                      <FormItem
                        label="TICKET (UP AND DOWN)"
                        invalid={!!errors.ticket}
                        errorMessage={errors.ticket as string}
                      >
                        <Input
                          type="number"
                          name="ticket"
                          value={values.ticket}
                          onChange={(e) => setFieldValue('ticket', Number(e.target.value) || 0)}
                          onBlur={handleBlur}
                        />
                      </FormItem>

                      <FormItem
                        label="GRATUITY"
                        invalid={!!errors.gratuity}
                        errorMessage={errors.gratuity as string}
                      >
                        <Input
                          type="number"
                          name="gratuity"
                          value={values.gratuity}
                          onChange={(e) => setFieldValue('gratuity', Number(e.target.value) || 0)}
                          onBlur={handleBlur}
                        />
                      </FormItem>
                    </div>
                  </div>

                  {/* Custom Expenses Section */}
                  <div className="mb-8">
                    <div className="flex justify-between items-center mb-4 border-b pb-2">
                      <h5 className="text-lg font-semibold">
                        {values?.customExpenses?.length > 0 ? 'Additional Custom Expenses' : ''}
                      </h5>
                      <Button
                        size="sm"
                        variant="plain"
                        icon={<AiOutlinePlus />}
                        onClick={() => handleAddCustomExpense(values, setFieldValue)}
                      >
                        Add Custom Expense
                      </Button>
                    </div>
                    
                    {(values.customExpenses || []).map((customExpense: any, customIndex: any) => (
                      <div key={customIndex} className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 items-end">
                        <FormItem
                          label="Expense Name"
                          invalid={!!errors.customExpenses?.[customIndex]?.name}
                          errorMessage={errors.customExpenses?.[customIndex]?.name as string}
                        >
                          <Input
                            value={customExpense.name}
                            onChange={(e) => handleCustomExpenseChange(
                              customIndex,
                              'name',
                              e.target.value,
                              values,
                              setFieldValue
                            )}
                          />
                        </FormItem>
                        <FormItem
                          label="Amount"
                          invalid={!!errors.customExpenses?.[customIndex]?.amount}
                          errorMessage={errors.customExpenses?.[customIndex]?.amount as string}
                        >
                          <Input
                            type="number"
                            value={customExpense.amount}
                            onChange={(e) => handleCustomExpenseChange(
                              customIndex,
                              'amount',
                              e.target.value,
                              values,
                              setFieldValue
                            )}
                          />
                        </FormItem>
                        <Button
                          type="button"
                          variant="plain"
                          color="red"
                          icon={<HiOutlineTrash />}
                          onClick={() => handleRemoveCustomExpense(
                            customIndex,
                            values,
                            setFieldValue
                          )}
                        >
                          Remove
                        </Button>
                      </div>
                    ))}
                  </div>
                </AdaptableCard>
              </div>

              <StickyFooter
                className="-mx-8 px-8 flex items-center justify-between py-4"
                stickyClass="border-t bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"
              >
                <div>
                  {type === 'edit' && onDelete && (
                    <Button
                      size="sm"
                      variant="plain"
                      color="red"
                      icon={<HiOutlineTrash />}
                      type="button"
                      onClick={() => onDelete(() => {})}
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
                    onClick={() => onDiscard?.()}
                  >
                    Discard
                  </Button>
                  <Button
                    size="sm"
                    variant="solid"
                    loading={isSubmitting}
                    icon={<AiOutlineSave />}
                    type="submit"
                  >
                    Save
                  </Button>
                </div>
              </StickyFooter>
            </FormContainer>
          </Form>
        );
      }}
    </Formik>
  );
});

LabourExpensesForm.displayName = 'LabourExpensesForm';

export default LabourExpensesForm;