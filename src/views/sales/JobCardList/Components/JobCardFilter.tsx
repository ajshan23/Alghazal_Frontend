// import { useState, useRef, forwardRef } from 'react';
// import { HiOutlineFilter, HiOutlineSearch } from 'react-icons/hi';
// import {
//     getJobCards,
//     setFilterData,
//     initialTableData,
//     useAppDispatch,
//     useAppSelector,
// } from '../store'; // Adjust the import path as needed
// import { FormItem, FormContainer } from '@/components/ui/Form';
// import Input from '@/components/ui/Input';
// import Button from '@/components/ui/Button';
// import Checkbox from '@/components/ui/Checkbox';
// import Radio from '@/components/ui/Radio';
// import Drawer from '@/components/ui/Drawer';
// import { Field, Form, Formik, FormikProps, FieldProps } from 'formik';
// import type { MouseEvent } from 'react';

// type FormModel = {
//     customerName: string;
//     jobCardStatus: string[];
//     warrantyStatus: number;
// };

// type FilterFormProps = {
//     onSubmitComplete?: () => void;
// };

// type DrawerFooterProps = {
//     onSaveClick: (event: MouseEvent<HTMLButtonElement>) => void;
//     onCancel: (event: MouseEvent<HTMLButtonElement>) => void;
// };

// const FilterForm = forwardRef<FormikProps<FormModel>, FilterFormProps>(
//     ({ onSubmitComplete }, ref) => {
//         const dispatch = useAppDispatch();

//         const filterData = useAppSelector(
//             (state) => state.jobCardList.data.filterData, // Adjust the Redux state path as needed
//         );

//         const handleSubmit = (values: FormModel) => {
//             onSubmitComplete?.();
//             dispatch(setFilterData(values));
//             dispatch(getJobCards(initialTableData)); // Adjust the action as needed
//         };

//         return (
//             <Formik
//                 enableReinitialize
//                 innerRef={ref}
//                 initialValues={filterData}
//                 onSubmit={(values) => {
//                     handleSubmit(values);
//                 }}
//             >
//                 {({ values, touched, errors }) => (
//                     <Form>
//                         <FormContainer>
//                             {/* Customer Name Search */}
//                             <FormItem
//                                 invalid={
//                                     errors.customerName && touched.customerName
//                                 }
//                                 errorMessage={errors.customerName}
//                             >
//                                 <h6 className="mb-4">Customer Name</h6>
//                                 <Field
//                                     type="text"
//                                     autoComplete="off"
//                                     name="customerName"
//                                     placeholder="Search by customer name"
//                                     component={Input}
//                                     prefix={
//                                         <HiOutlineSearch className="text-lg" />
//                                     }
//                                 />
//                             </FormItem>

//                             {/* Job Card Status Filter */}
//                             <FormItem
//                                 invalid={
//                                     errors.jobCardStatus &&
//                                     touched.jobCardStatus
//                                 }
//                                 errorMessage={errors.jobCardStatus as string}
//                             >
//                                 <h6 className="mb-4">Job Card Status</h6>
//                                 <Field name="jobCardStatus">
//                                     {({ field, form }: FieldProps) => (
//                                         <Checkbox.Group
//                                             vertical
//                                             value={values.jobCardStatus}
//                                             onChange={(options) =>
//                                                 form.setFieldValue(
//                                                     field.name,
//                                                     options,
//                                                 )
//                                             }
//                                         >
//                                             <Checkbox
//                                                 className="mb-3"
//                                                 name={field.name}
//                                                 value="Pending"
//                                             >
//                                                 Pending
//                                             </Checkbox>
//                                             <Checkbox
//                                                 className="mb-3"
//                                                 name={field.name}
//                                                 value="Completed"
//                                             >
//                                                 Completed
//                                             </Checkbox>
//                                             <Checkbox
//                                                 className="mb-3"
//                                                 name={field.name}
//                                                 value="Cancelled"
//                                             >
//                                                 Cancelled
//                                             </Checkbox>
//                                         </Checkbox.Group>
//                                     )}
//                                 </Field>
//                             </FormItem>

//                             {/* Warranty Status Filter */}
//                             <FormItem
//                                 invalid={
//                                     errors.warrantyStatus &&
//                                     touched.warrantyStatus
//                                 }
//                                 errorMessage={errors.warrantyStatus}
//                             >
//                                 <h6 className="mb-4">Warranty Status</h6>
//                                 <Field name="warrantyStatus">
//                                     {({ field, form }: FieldProps) => (
//                                         <Radio.Group
//                                             vertical
//                                             value={values.warrantyStatus}
//                                             onChange={(val) =>
//                                                 form.setFieldValue(
//                                                     field.name,
//                                                     val,
//                                                 )
//                                             }
//                                         >
//                                             <Radio value={1}>Under Warranty</Radio>
//                                             <Radio value={0}>Out of Warranty</Radio>
//                                         </Radio.Group>
//                                     )}
//                                 </Field>
//                             </FormItem>
//                         </FormContainer>
//                     </Form>
//                 )}
//             </Formik>
//         );
//     },
// );

// const DrawerFooter = ({ onSaveClick, onCancel }: DrawerFooterProps) => {
//     return (
//         <div className="text-right w-full">
//             <Button size="sm" className="mr-2" onClick={onCancel}>
//                 Cancel
//             </Button>
//             <Button size="sm" variant="solid" onClick={onSaveClick}>
//                 Apply Filters
//             </Button>
//         </div>
//     );
// };

// const JobCardFilter = () => {
//     const formikRef = useRef<FormikProps<FormModel>>(null);

//     const [isOpen, setIsOpen] = useState(false);

//     const openDrawer = () => {
//         setIsOpen(true);
//     };

//     const onDrawerClose = () => {
//         setIsOpen(false);
//     };

//     const formSubmit = () => {
//         formikRef.current?.submitForm();
//     };

//     return (
//         <>
//             <Button
//                 size="sm"
//                 className="block md:inline-block ltr:md:ml-2 rtl:md:mr-2 md:mb-0 mb-4"
//                 icon={<HiOutlineFilter />}
//                 onClick={() => openDrawer()}
//             >
//                 Filter
//             </Button>
//             <Drawer
//                 title="Filter Job Cards"
//                 isOpen={isOpen}
//                 footer={
//                     <DrawerFooter
//                         onCancel={onDrawerClose}
//                         onSaveClick={formSubmit}
//                     />
//                 }
//                 onClose={onDrawerClose}
//                 onRequestClose={onDrawerClose}
//             >
//                 <FilterForm ref={formikRef} onSubmitComplete={onDrawerClose} />
//             </Drawer>
//         </>
//     );
// };

// FilterForm.displayName = 'FilterForm';

// export default JobCardFilter;