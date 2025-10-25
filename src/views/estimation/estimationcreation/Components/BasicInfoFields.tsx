import AdaptableCard from '@/components/shared/AdaptableCard'
import { FormItem } from '@/components/ui/Form'
import Input from '@/components/ui/Input'
import { Field } from 'formik'
import DatePicker from '@/components/ui/DatePicker'

const BasicInfoFields = ({ values, errors, touched, setFieldValue }) => {
  return (
    <AdaptableCard divider className="mb-4">
        <h4>Estimation Form</h4>
        <br/>        <br/>


      <h5>Basic Information</h5>
      <br/>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormItem
          label="Client Name"
          invalid={!!errors.clientName && touched.clientName}
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
          label="Client Place"
          invalid={!!errors.clientPlace && touched.clientPlace}
          errorMessage={errors.clientPlace}
        >
          <Field
            type="text"
            autoComplete="off"
            name="clientPlace"
            placeholder="Client Place"
            component={Input}
          />
        </FormItem>
        
        <FormItem
          label="Engineer Name"
          invalid={!!errors.engineerName && touched.engineerName}
          errorMessage={errors.engineerName}
        >
          <Field
            type="text"
            autoComplete="off"
            name="engineerName"
            placeholder="Engineer Name"
            component={Input}
          />
        </FormItem>
        
        <FormItem
          label="Quotation Number"
          invalid={!!errors.qtnNo && touched.qtnNo}
          errorMessage={errors.qtnNo}
        >
          <Field
            type="text"
            autoComplete="off"
            name="qtnNo"
            placeholder="Quotation Number"
            component={Input}
          />
        </FormItem>
        
        <FormItem
          label="Date of Estimation"
          invalid={!!errors.dateOfEstimation && touched.dateOfEstimation}
          errorMessage={errors.dateOfEstimation}
        >
          <DatePicker
            value={values.dateOfEstimation}
            onChange={val => setFieldValue('dateOfEstimation', val)}
          />
        </FormItem>
        
        <FormItem
          label="Estimation Number"
          invalid={!!errors.estimationNumber && touched.estimationNumber}
          errorMessage={errors.estimationNumber}
        >
          <Field
            type="text"
            autoComplete="off"
            name="estimationNumber"
            placeholder="Estimation Number"
            component={Input}
          />
        </FormItem>
        
        <FormItem
          label="Work Start Date"
          invalid={!!errors.workStartDate && touched.workStartDate}
          errorMessage={errors.workStartDate}
        >
          <DatePicker
            value={values.workStartDate}
            onChange={val => setFieldValue('workStartDate', val)}
          />
        </FormItem>
        
        <FormItem
          label="Work End Date"
          invalid={!!errors.workEndDate && touched.workEndDate}
          errorMessage={errors.workEndDate}
        >
          <DatePicker
            value={values.workEndDate}
            onChange={val => setFieldValue('workEndDate', val)}
          />
        </FormItem>
        
        <FormItem
          label="Valid Until"
          invalid={!!errors.validUntil && touched.validUntil}
          errorMessage={errors.validUntil}
        >
          <DatePicker
            value={values.validUntil}
            onChange={val => setFieldValue('validUntil', val)}
          />
        </FormItem>
        
        <FormItem
          label="Payment Due By"
          invalid={!!errors.paymentDueBy && touched.paymentDueBy}
          errorMessage={errors.paymentDueBy}
        >
          <DatePicker
            value={values.paymentDueBy}
            onChange={val => setFieldValue('paymentDueBy', val)}
          />
        </FormItem>
      </div>
      
      <FormItem
        label="Description"
        invalid={!!errors.description && touched.description}
        errorMessage={errors.description}
      >
        <Field
          as="textarea"
          autoComplete="off"
          name="description"
          placeholder="Description"
          component={Input}
          textArea
        />
      </FormItem>
    </AdaptableCard>
  )
}

export default BasicInfoFields