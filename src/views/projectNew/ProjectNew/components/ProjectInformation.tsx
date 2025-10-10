import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import { FormItem, FormContainer } from '@/components/ui/Form'
import { Field, Form, Formik } from 'formik'
import * as Yup from 'yup'
import { HiOutlineDocumentText, HiOutlinePencilAlt, HiOutlineClipboardList, HiOutlineExclamationCircle } from 'react-icons/hi'

type FormModel = {
  projectName: string
  projectDescription: string
  attention: string
}

type ProjectInformationProps = {
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
  attention: Yup.string().required('Attention field is Required'),
})

const ProjectInformation = ({
  data = {
    projectName: '',
    projectDescription: '',
    attention: '',
  },
  onNextChange,
  onBackChange,
  currentStepStatus,
}: ProjectInformationProps) => {
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
    <div className="space-y-8">
      {/* Header Section */}
      <div className="text-center">
        <div className="flex justify-center mb-4">
          <div className="p-4 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-2xl shadow-lg">
            <HiOutlineDocumentText className="text-3xl text-white" />
          </div>
        </div>
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Project Information
        </h3>
        <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
          Fill in your project information to help us speed up the verification process
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
                <div className="bg-gradient-to-br from-white via-purple-50 to-indigo-50 dark:from-gray-800 dark:via-gray-850 dark:to-gray-900 rounded-2xl p-8 border border-purple-200 dark:border-gray-700 shadow-lg">
                  {/* Project Details Section */}
                  <div className="mb-8">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="p-3 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-xl">
                        <HiOutlineClipboardList className="text-2xl text-white" />
                      </div>
                      <h5 className="text-xl font-bold text-gray-900 dark:text-white">
                        Project Details
                      </h5>
                    </div>

                    <div className="space-y-6">
                      {/* Project Name Field */}
                      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
                        <FormItem
                          label={
                            <div className="flex items-center gap-2 mb-3">
                              <HiOutlinePencilAlt className="text-lg text-purple-600" />
                              <span className="font-semibold text-gray-800 dark:text-white text-lg">
                                Project Name
                              </span>
                            </div>
                          }
                          invalid={!!(errors.projectName && touched.projectName)}
                          errorMessage={errors.projectName}
                        >
                          <Field
                            type="text"
                            autoComplete="off"
                            name="projectName"
                            placeholder="Enter your project name..."
                            component={Input}
                            className="text-lg py-3 border-2 border-purple-200 dark:border-gray-600 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 rounded-lg"
                          />
                        </FormItem>
                      </div>

                      {/* Project Description Field */}
                      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
                        <FormItem
                          label={
                            <div className="flex items-center gap-2 mb-3">
                              <HiOutlineDocumentText className="text-lg text-purple-600" />
                              <span className="font-semibold text-gray-800 dark:text-white text-lg">
                                Project Description
                              </span>
                            </div>
                          }
                          invalid={!!(errors.projectDescription && touched.projectDescription)}
                          errorMessage={errors.projectDescription}
                        >
                          <Field
                            as="textarea"
                            autoComplete="off"
                            name="projectDescription"
                            placeholder="Describe your project in detail..."
                            component={Input}
                            textArea
                            rows={3}
                            className="text-lg py-3 border-2 border-purple-200 dark:border-gray-600 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 rounded-lg resize-none"
                          />
                          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                            Provide a detailed description of your project goals, requirements, and scope.
                          </p>
                        </FormItem>
                      </div>

                      {/* Attention Field */}
                      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
                        <FormItem
                          label={
                            <div className="flex items-center gap-2 mb-3">
                              <HiOutlineExclamationCircle className="text-lg text-purple-600" />
                              <span className="font-semibold text-gray-800 dark:text-white text-lg">
                                Attention
                              </span>
                            </div>
                          }
                          invalid={!!(errors.attention && touched.attention)}
                          errorMessage={errors.attention}
                        >
                          <Field
                            type="text"
                            autoComplete="off"
                            name="attention"
                            placeholder="Enter attention details..."
                            component={Input}
                            className="text-lg py-3 border-2 border-purple-200 dark:border-gray-600 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 rounded-lg"
                          />
                          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                            Important notes or special instructions for this project.
                          </p>
                        </FormItem>
                      </div>
                    </div>
                  </div>

                  {/* Progress Indicator */}
                  <div className="mb-8">
                    <div className="bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 rounded-xl p-4 border border-purple-200 dark:border-purple-800">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Form Completion
                        </span>
                        <span className="text-sm font-bold text-purple-600 dark:text-purple-400">
                          50% Complete
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div className="bg-gradient-to-r from-purple-500 to-indigo-600 h-2 rounded-full w-1/2 transition-all duration-300"></div>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex justify-between gap-4">
                    <Button 
                      type="button" 
                      onClick={onBack}
                      variant="plain"
                      size="lg"
                      className="px-6 py-3 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl font-semibold transition-all duration-200"
                    >
                      Back to Client Details
                    </Button>
                    <Button
                      loading={isSubmitting}
                      variant="solid"
                      type="submit"
                      size="lg"
                      className="px-8 py-3 bg-gradient-to-r from-purple-600 to-indigo-700 hover:from-purple-700 hover:to-indigo-800 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200"
                    >
                      {currentStepStatus === 'complete' ? 'Save Changes' : 'Continue to Address'}
                    </Button>
                  </div>
                </div>
              </FormContainer>
            </Form>
          )
        }}
      </Formik>
    </div>
  )
}

export default ProjectInformation