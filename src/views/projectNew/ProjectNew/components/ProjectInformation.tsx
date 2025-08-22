import Input from '@/components/ui/Input'
import Checkbox from '@/components/ui/Checkbox'
import Button from '@/components/ui/Button'
import Select from '@/components/ui/Select'
import { FormItem, FormContainer } from '@/components/ui/Form'
import { Field, Form, Formik, getIn, FieldInputProps, FieldProps } from 'formik'
import { NumericFormat, NumericFormatProps } from 'react-number-format'
import * as Yup from 'yup'
import type { ComponentType } from 'react'
import type { InputProps } from '@/components/ui/Input'

type FormModel = {
    projectName: string
    projectDescription: string
}

type FinancialInformationProps = {
    data: FormModel
    onNextChange?: (
        values: FormModel,
        formName: string,
        setSubmitting: (isSubmitting: boolean) => void
    ) => void
    onBackChange?: () => void
    currentStepStatus?: string
}

const validationSchema = Yup.object().shape({
    projectName: Yup.string().required('Project Name is Required'),
    projectDescription: Yup.string().required('Project Description is Required'),
})

const NumberInput = (props: InputProps) => {
    return <Input {...props} value={props.field.value} />
}

const NumericFormatInput = ({
    onValueChange,
    ...rest
}: Omit<NumericFormatProps, 'form'> & {
    form: any
    field: FieldInputProps<unknown>
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

const ProjectInformation = ({
    data = {
        projectName: '',
        projectDescription: '',
    },
    onNextChange,
    onBackChange,
    currentStepStatus,
}: FinancialInformationProps) => {
    const onNext = (
        values: FormModel,
        setSubmitting: (isSubmitting: boolean) => void
    ) => {
        onNextChange?.(values, 'ProjectInformation', setSubmitting)
    }

    const onBack = () => {
        onBackChange?.()
    }

    return (
        <>
            <div className="mb-8">
                <h3 className="mb-2">Project Information</h3>
                <p>
                    Fill in your project information to help us speed up the
                    verification process.
                </p>
            </div>
            <Formik
                enableReinitialize
                initialValues={data}
                validationSchema={validationSchema}
                onSubmit={(values, { setSubmitting }) => {
                    onNext(values, setSubmitting)
                }}
            >
                {({ values, touched, errors, isSubmitting }) => {
                    return (
                        <Form>
                            <FormContainer>
                                <div>
                                    <h5 className="mb-4">Project Details</h5>

                                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                                        <div className="lg:col-span-2">
                                            <FormItem
                                                label="Project Name"
                                                invalid={
                                                    !!(
                                                        errors.projectName &&
                                                        touched.projectName
                                                    )
                                                }
                                                errorMessage={errors.projectName}
                                            >
                                                <Field
                                                    type="text"
                                                    autoComplete="off"
                                                    name="projectName"
                                                    placeholder="Project Name"
                                                    component={Input}
                                                />
                                            </FormItem>

                                            <FormItem
                                                label="Project Description"
                                                invalid={
                                                    !!(
                                                        errors.projectDescription &&
                                                        touched.projectDescription
                                                    )
                                                }
                                                errorMessage={
                                                    errors.projectDescription
                                                }
                                            >
                                                <Field
                                                    as="textarea"
                                                    autoComplete="off"
                                                    name="projectDescription"
                                                    placeholder="Project Description"
                                                    component={Input}
                                                    textArea
                                                />
                                            </FormItem>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex justify-end gap-2">
                                    <Button type="button" onClick={onBack}>
                                        Back
                                    </Button>
                                    <Button
                                        loading={isSubmitting}
                                        variant="solid"
                                        type="submit"
                                    >
                                        {currentStepStatus === 'complete'
                                            ? 'Save'
                                            : 'Next'}
                                    </Button>
                                </div>
                            </FormContainer>
                        </Form>
                    )
                }}
            </Formik>
        </>
    )
}

export default ProjectInformation