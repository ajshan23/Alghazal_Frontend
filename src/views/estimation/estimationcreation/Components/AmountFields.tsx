import AdaptableCard from '@/components/shared/AdaptableCard'
import { FormItem } from '@/components/ui/Form'
import { Field } from 'formik'
import { NumericFormat, NumericFormatProps } from 'react-number-format'
import type { ComponentType } from 'react'
import { Input } from '@/components/ui'

const NumericFormatInput = ({
  onValueChange,
  ...rest
}: Omit<NumericFormatProps, 'form'> & {
  form: any
  field: any
}) => {
  return (
    <NumericFormat
      customInput={Input as ComponentType}
      type="text"
      autoComplete="off"
      onValueChange={onValueChange}
      {...rest}
    />
  )
}

const AmountFields = ({ values, errors, touched, setFieldValue }) => {
  const totalMaterials = values.materials.reduce((sum, item) => sum + (item.total || 0), 0)
  const totalLabour = values.labourCharges.reduce((sum, item) => sum + (item.total || 0), 0)
  const totalTerms = values.termsAndConditions.reduce((sum, item) => sum + (item.total || 0), 0)
  const estimatedAmount = totalMaterials + totalLabour + totalTerms
  const profit = values.quotationAmount - estimatedAmount - (values.commissionAmount || 0)

  return (
    <AdaptableCard divider className="mb-4">
      <h5>Amount Details</h5>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormItem label="Estimated Amount">
          <Field name="estimatedAmount">
            {({ field, form }: any) => (
              <NumericFormatInput
                form={form}
                field={field}
                placeholder="Estimated Amount"
                value={estimatedAmount}
                readOnly
              />
            )}
          </Field>
        </FormItem>
        
        <FormItem
          label="Quotation Amount"
          invalid={!!errors.quotationAmount && touched.quotationAmount}
          errorMessage={errors.quotationAmount}
        >
          <Field name="quotationAmount">
            {({ field, form }: any) => (
              <NumericFormatInput
                form={form}
                field={field}
                placeholder="Quotation Amount"
                onValueChange={(e) => {
                  form.setFieldValue(field.name, e.value)
                  // Calculate profit
                  form.setFieldValue('profit', e.value - estimatedAmount - (values.commissionAmount || 0))
                }}
              />
            )}
          </Field>
        </FormItem>
        
        <FormItem
          label="Commission Amount"
          invalid={!!errors.commissionAmount && touched.commissionAmount}
          errorMessage={errors.commissionAmount}
        >
          <Field name="commissionAmount">
            {({ field, form }: any) => (
              <NumericFormatInput
                form={form}
                field={field}
                placeholder="Commission Amount"
                onValueChange={(e) => {
                  form.setFieldValue(field.name, e.value)
                  // Calculate profit
                  form.setFieldValue('profit', values.quotationAmount - estimatedAmount - e.value)
                }}
              />
            )}
          </Field>
        </FormItem>
        
        <FormItem label="Profit">
          <Field name="profit">
            {({ field, form }: any) => (
              <NumericFormatInput
                form={form}
                field={field}
                placeholder="Profit"
                value={profit}
                readOnly
              />
            )}
          </Field>
        </FormItem>
      </div>
    </AdaptableCard>
  )
}

export default AmountFields