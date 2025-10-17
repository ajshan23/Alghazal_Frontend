import AdaptableCard from "@/components/shared/AdaptableCard";
import { FormItem } from "@/components/ui/Form";
import { Field, FormikErrors, FormikTouched, useFormikContext } from "formik";
import { useEffect, useRef } from "react";

type FormFieldsName = {
  works?: string;
  spares?: string;
  industrialworks?: string;
  others?: string;
  attachments: string[];
};

type JobCardWorkDetailsFieldsProps = {
  touched: FormikTouched<FormFieldsName>;
  errors: FormikErrors<FormFieldsName>;
};

const JobCardWorkDetailsFields = (props: JobCardWorkDetailsFieldsProps) => {
  const { touched, errors } = props;
  const { values, setFieldValue } = useFormikContext<FormFieldsName>();

  useEffect(() => {
    if (!values.attachments) {
      setFieldValue("attachments", []);
    }
  }, [values.attachments, setFieldValue]);

  const worksTextareaRef = useRef<HTMLTextAreaElement | null>(null);
  const sparesTextareaRef = useRef<HTMLTextAreaElement | null>(null);
  const industrialworksTextareaRef = useRef<HTMLTextAreaElement | null>(null);
  const othersTextareaRef = useRef<HTMLTextAreaElement | null>(null);

  const handleTextareaKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>, nextFieldName?: string) => {
    if (e.key === "Enter") {
      if (e.shiftKey) {
        return;
      } else {
        e.preventDefault();
        if (nextFieldName) {
          const nextField = document.querySelector(`[name="${nextFieldName}"]`) as HTMLElement;
          nextField?.focus();
        }
      }
    }
  };

  const autoResizeTextarea = (ref: React.RefObject<HTMLTextAreaElement | null>) => {
    if (ref.current) {
      ref.current.style.height = "auto";
      ref.current.style.height = `${ref.current.scrollHeight}px`;
    }
  };

  useEffect(() => autoResizeTextarea(worksTextareaRef), [values.works]);
  useEffect(() => autoResizeTextarea(sparesTextareaRef), [values.spares]);
  useEffect(() => autoResizeTextarea(industrialworksTextareaRef), [values.industrialworks]);
  useEffect(() => autoResizeTextarea(othersTextareaRef), [values.others]);

  const handleAttachmentChange = (value: string, checked: boolean) => {
    const updatedAttachments = checked
      ? [...(values.attachments || []), value]
      : (values.attachments || []).filter((item) => item !== value);
    setFieldValue("attachments", updatedAttachments);
  };

  return (
    <AdaptableCard divider className="mb-4">
      <h5>Work Details</h5>
      <p className="mb-6">Section to configure work information</p>

      <FormItem
        label="Works"
        invalid={!!errors.works && touched.works}
        errorMessage={errors.works}
      >
        <Field
          as="textarea"
          name="works"
          placeholder="Describe the works to be done"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 dark:bg-[#1f2937] dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
          rows={1}
          innerRef={worksTextareaRef}
          onKeyDown={(e: React.KeyboardEvent<HTMLTextAreaElement>) => handleTextareaKeyDown(e, "spares")}
          style={{ overflow: "hidden", resize: "none" }}
        />
      </FormItem>

      <FormItem
        label="Spares"
        invalid={!!errors.spares && touched.spares}
        errorMessage={errors.spares}
      >
        <Field
          as="textarea"
          name="spares"
          placeholder="List the spares required"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 dark:bg-[#1f2937] dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
          rows={1}
          innerRef={sparesTextareaRef}
          onKeyDown={(e: React.KeyboardEvent<HTMLTextAreaElement>) => handleTextareaKeyDown(e, "industrialworks")}
          style={{ overflow: "hidden", resize: "none" }}
        />
      </FormItem>

      <FormItem
        label="Industrial Works"
        invalid={!!errors.industrialworks && touched.industrialworks}
        errorMessage={errors.industrialworks}
      >
        <Field
          as="textarea"
          name="industrialworks"
          placeholder="Describe any industrial works"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 dark:bg-[#1f2937] dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
          rows={1}
          innerRef={industrialworksTextareaRef}
          onKeyDown={(e: React.KeyboardEvent<HTMLTextAreaElement>) => handleTextareaKeyDown(e, "others")}
          style={{ overflow: "hidden", resize: "none" }}
        />
      </FormItem>

      <FormItem
        label="Others"
        invalid={!!errors.others && touched.others}
        errorMessage={errors.others}
      >
        <Field
          as="textarea"
          name="others"
          placeholder="Any other details"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 dark:bg-[#1f2937] dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
          rows={1}
          innerRef={othersTextareaRef}
          onKeyDown={(e: React.KeyboardEvent<HTMLTextAreaElement>) => handleTextareaKeyDown(e)}
          style={{ overflow: "hidden", resize: "none" }}
        />
      </FormItem>

      <FormItem label="Select Additional Fittings">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* Fan */}
          <div className="flex items-center">
            <Field
              type="checkbox"
              id="fan"
              name="attachments"
              value="fan"
              checked={values.attachments?.includes("fan")}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                handleAttachmentChange(e.target.value, e.target.checked);
              }}
              className="mr-2"
            />
            <label htmlFor="fan" className="text-gray-800 dark:text-white">Fan</label>
          </div>

          {/* Fan Cover */}
          <div className="flex items-center">
            <Field
              type="checkbox"
              id="fan_cover"
              name="attachments"
              value="fan cover"
              checked={values.attachments?.includes("fan cover")}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                handleAttachmentChange(e.target.value, e.target.checked);
              }}
              className="mr-2"
            />
            <label htmlFor="fan_cover" className="text-gray-800 dark:text-white">Fan Cover</label>
          </div>

          {/* Terminal */}
          <div className="flex items-center">
            <Field
              type="checkbox"
              id="terminal"
              name="attachments"
              value="terminal"
              checked={values.attachments?.includes("terminal")}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                handleAttachmentChange(e.target.value, e.target.checked);
              }}
              className="mr-2"
            />
            <label htmlFor="terminal" className="text-gray-800 dark:text-white">Terminal</label>
          </div>

          {/* Terminal Box */}
          <div className="flex items-center">
            <Field
              type="checkbox"
              id="terminal_box"
              name="attachments"
              value="terminal box"
              checked={values.attachments?.includes("terminal box")}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                handleAttachmentChange(e.target.value, e.target.checked);
              }}
              className="mr-2"
            />
            <label htmlFor="terminal_box" className="text-gray-800 dark:text-white">Terminal Box</label>
          </div>

          {/* Pulli */}
          <div className="flex items-center">
            <Field
              type="checkbox"
              id="pulli"
              name="attachments"
              value="pulli"
              checked={values.attachments?.includes("pulli")}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                handleAttachmentChange(e.target.value, e.target.checked);
              }}
              className="mr-2"
            />
            <label htmlFor="pulli" className="text-gray-800 dark:text-white">Pulli</label>
          </div>

          {/* AVR */}
          <div className="flex items-center">
            <Field
              type="checkbox"
              id="avr"
              name="attachments"
              value="AVR"
              checked={values.attachments?.includes("AVR")}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                handleAttachmentChange(e.target.value, e.target.checked);
              }}
              className="mr-2"
            />
            <label htmlFor="avr" className="text-gray-800 dark:text-white">AVR</label>
          </div>

          {/* Diode */}
          <div className="flex items-center">
            <Field
              type="checkbox"
              id="diode"
              name="attachments"
              value="diode"
              checked={values.attachments?.includes("diode")}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                handleAttachmentChange(e.target.value, e.target.checked);
              }}
              className="mr-2"
            />
            <label htmlFor="diode" className="text-gray-800 dark:text-white">Diode</label>
          </div>

          {/* Grill */}
          <div className="flex items-center">
            <Field
              type="checkbox"
              id="grill"
              name="attachments"
              value="grill"
              checked={values.attachments?.includes("grill")}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                handleAttachmentChange(e.target.value, e.target.checked);
              }}
              className="mr-2"
            />
            <label htmlFor="grill" className="text-gray-800 dark:text-white">Grill</label>
          </div>
        </div>
      </FormItem>
    </AdaptableCard>
  );
};

export default JobCardWorkDetailsFields;