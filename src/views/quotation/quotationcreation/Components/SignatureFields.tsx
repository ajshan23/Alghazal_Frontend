import AdaptableCard from '@/components/shared/AdaptableCard'
import { FormItem } from '@/components/ui/Form'
import Input from '@/components/ui/Input'
import { Field } from 'formik'

const SignatureFields = ({ values, errors, touched }) => {
  return (
    <AdaptableCard divider className="mb-4">
      <h5>Signatures</h5>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {values.signatures.map((sig, index) => (
          <div key={index}>
            <FormItem 
              label={sig.role}
              invalid={!!errors.signatures?.[index]?.name && touched.signatures?.[index]?.name}
              errorMessage={errors.signatures?.[index]?.name}
            >
              <Field
                type="text"
                autoComplete="off"
                name={`signatures.${index}.name`}
                placeholder={`Enter ${sig.role} name`}
                component={Input}
              />
            </FormItem>
          </div>
        ))}
      </div>
    </AdaptableCard>
  )
}

export default SignatureFields