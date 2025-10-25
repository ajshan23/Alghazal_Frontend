import AdaptableCard from '@/components/shared/AdaptableCard'
import { FormItem } from '@/components/ui/Form'
import Input from '@/components/ui/Input'
import { Field, FieldArray } from 'formik'
import { HiOutlineTrash, HiOutlinePlus } from 'react-icons/hi'
import { NumericFormat, NumericFormatProps } from 'react-number-format'
import type { ComponentType } from 'react'

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

const TermsFields = ({ values, setFieldValue }) => {
  return (
    <AdaptableCard divider className="mb-4">
      <h5>Terms & Conditions</h5>
      <FieldArray name="termsAndConditions">
        {({ push, remove }) => (
          <div className="space-y-4">
            {values.termsAndConditions.map((item, index) => (
              <div key={index} className="grid grid-cols-12 gap-2 items-end">
                <div className="col-span-5">
                  <FormItem label={`Description ${index + 1}`}>
                    <Field
                      type="text"
                      autoComplete="off"
                      name={`termsAndConditions.${index}.description`}
                      placeholder="Description"
                      component={Input}
                    />
                  </FormItem>
                </div>
                
                <div className="col-span-2">
                  <FormItem label="Quantity">
                    <Field name={`termsAndConditions.${index}.quantity`}>
                      {({ field, form }: any) => (
                        <NumericFormatInput
                          form={form}
                          field={field}
                          placeholder="Qty"
                          onValueChange={(e) => {
                            form.setFieldValue(field.name, e.value)
                            // Calculate total
                            const price = values.termsAndConditions[index].price || 0
                            form.setFieldValue(`termsAndConditions.${index}.total`, e.value * price)
                          }}
                        />
                      )}
                    </Field>
                  </FormItem>
                </div>
                
                <div className="col-span-2">
                  <FormItem label="Price">
                    <Field name={`termsAndConditions.${index}.price`}>
                      {({ field, form }: any) => (
                        <NumericFormatInput
                          form={form}
                          field={field}
                          placeholder="Price"
                          onValueChange={(e) => {
                            form.setFieldValue(field.name, e.value)
                            // Calculate total
                            const quantity = values.termsAndConditions[index].quantity || 0
                            form.setFieldValue(`termsAndConditions.${index}.total`, quantity * e.value)
                          }}
                        />
                      )}
                    </Field>
                  </FormItem>
                </div>
                
                <div className="col-span-2">
                  <FormItem label="Total">
                    <Field name={`termsAndConditions.${index}.total`}>
                      {({ field, form }: any) => (
                        <NumericFormatInput
                          form={form}
                          field={field}
                          placeholder="Total"
                          readOnly
                        />
                      )}
                    </Field>
                  </FormItem>
                </div>
                
                <div className="col-span-1">
                  <button
                    type="button"
                    className="text-red-500 hover:text-red-700"
                    onClick={() => remove(index)}
                  >
                    <HiOutlineTrash className="text-xl" />
                  </button>
                </div>
              </div>
            ))}
            
            <div className="flex justify-between items-center">
              <div className="font-semibold">
                Total Terms: {values.termsAndConditions.reduce((sum, item) => sum + (item.total || 0), 0)}
              </div>
              <button
                type="button"
                className="btn btn-sm btn-primary"
                onClick={() => push({
                  description: '',
                  quantity: 0,
                  price: 0,
                  total: 0
                })}
              >
                <HiOutlinePlus className="mr-1" /> Add Term
              </button>
            </div>
          </div>
        )}
      </FieldArray>
    </AdaptableCard>
  )
}

export default TermsFields