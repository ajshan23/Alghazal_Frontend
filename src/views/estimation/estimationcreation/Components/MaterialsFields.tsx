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

const MaterialsFields = ({ values, setFieldValue }) => {
  return (
    <AdaptableCard divider className="mb-4">
      <h5>Materials</h5>
      <FieldArray name="materials">
        {({ push, remove }) => (
          <div className="space-y-4">
            {values.materials.map((item, index) => (
              <div key={index} className="grid grid-cols-12 gap-2 items-end">
                <div className="col-span-3">
                  <FormItem label={`Subject ${index + 1}`}>
                    <Field
                      type="text"
                      autoComplete="off"
                      name={`materials.${index}.subject`}
                      placeholder="Subject"
                      component={Input}
                    />
                  </FormItem>
                </div>
                
                <div className="col-span-3">
                  <FormItem label="Material">
                    <Field
                      type="text"
                      autoComplete="off"
                      name={`materials.${index}.material`}
                      placeholder="Material"
                      component={Input}
                    />
                  </FormItem>
                </div>
                
                <div className="col-span-2">
                  <FormItem label="Quantity">
                    <Field name={`materials.${index}.quantity`}>
                      {({ field, form }: any) => (
                        <NumericFormatInput
                          form={form}
                          field={field}
                          placeholder="Quantity"
                          onValueChange={(e) => {
                            form.setFieldValue(field.name, e.value)
                            // Calculate total
                            const unitPrice = values.materials[index].unitPrice || 0
                            form.setFieldValue(`materials.${index}.total`, e.value * unitPrice)
                          }}
                        />
                      )}
                    </Field>
                  </FormItem>
                </div>
                
                <div className="col-span-2">
                  <FormItem label="Unit Price">
                    <Field name={`materials.${index}.unitPrice`}>
                      {({ field, form }: any) => (
                        <NumericFormatInput
                          form={form}
                          field={field}
                          placeholder="Unit Price"
                          onValueChange={(e) => {
                            form.setFieldValue(field.name, e.value)
                            // Calculate total
                            const quantity = values.materials[index].quantity || 0
                            form.setFieldValue(`materials.${index}.total`, quantity * e.value)
                          }}
                        />
                      )}
                    </Field>
                  </FormItem>
                </div>
                
                <div className="col-span-1">
                  <FormItem label="Total">
                    <Field name={`materials.${index}.total`}>
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
                Total Materials: {values.materials.reduce((sum, item) => sum + (item.total || 0), 0)}
              </div>
              <button
                type="button"
                className="btn btn-sm btn-primary"
                onClick={() => push({
                  subject: '',
                  material: '',
                  quantity: 0,
                  unitPrice: 0,
                  total: 0
                })}
              >
                <HiOutlinePlus className="mr-1" /> Add Material
              </button>
            </div>
          </div>
        )}
      </FieldArray>
    </AdaptableCard>
  )
}

export default MaterialsFields