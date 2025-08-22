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

const LabourFields = ({ values, setFieldValue }) => {
  return (
    <AdaptableCard divider className="mb-4">
      <h5>Labour Charges</h5>
      <FieldArray name="labourCharges">
        {({ push, remove }) => (
          <div className="space-y-4">
            {values.labourCharges.map((item, index) => (
              <div key={index} className="grid grid-cols-12 gap-2 items-end">
                <div className="col-span-4">
                  <FormItem label={`Designation ${index + 1}`}>
                    <Field
                      type="text"
                      autoComplete="off"
                      name={`labourCharges.${index}.designation`}
                      placeholder="Designation"
                      component={Input}
                    />
                  </FormItem>
                </div>
                
                <div className="col-span-2">
                  <FormItem label="Quantity/Days">
                    <Field name={`labourCharges.${index}.quantity`}>
                      {({ field, form }: any) => (
                        <NumericFormatInput
                          form={form}
                          field={field}
                          placeholder="Qty"
                          onValueChange={(e) => {
                            form.setFieldValue(field.name, e.value)
                            // Calculate total
                            const price = values.labourCharges[index].price || 0
                            form.setFieldValue(`labourCharges.${index}.total`, e.value * price)
                          }}
                        />
                      )}
                    </Field>
                  </FormItem>
                </div>
                
                <div className="col-span-2">
                  <FormItem label="Price">
                    <Field name={`labourCharges.${index}.price`}>
                      {({ field, form }: any) => (
                        <NumericFormatInput
                          form={form}
                          field={field}
                          placeholder="Price"
                          onValueChange={(e) => {
                            form.setFieldValue(field.name, e.value)
                            // Calculate total
                            const quantity = values.labourCharges[index].quantity || 0
                            form.setFieldValue(`labourCharges.${index}.total`, quantity * e.value)
                          }}
                        />
                      )}
                    </Field>
                  </FormItem>
                </div>
                
                <div className="col-span-2">
                  <FormItem label="Total">
                    <Field name={`labourCharges.${index}.total`}>
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
                Total Labour: {values.labourCharges.reduce((sum, item) => sum + (item.total || 0), 0)}
              </div>
              <button
                type="button"
                className="btn btn-sm btn-primary"
                onClick={() => push({
                  designation: '',
                  quantity: 0,
                  price: 0,
                  total: 0
                })}
              >
                <HiOutlinePlus className="mr-1" /> Add Labour
              </button>
            </div>
          </div>
        )}
      </FieldArray>
    </AdaptableCard>
  )
}

export default LabourFields