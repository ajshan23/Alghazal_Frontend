import DoubleSidedImage from '@/components/shared/DoubleSidedImage'
import Button from '@/components/ui/Button'
import type { CallbackSetSkip } from '../types'

type Step1Props = CallbackSetSkip

const Step1 = ({ onNext, onSkip }: Step1Props) => {
    return (
        <div className="text-center">
            <DoubleSidedImage
                className="mx-auto mb-8"
                src="/img/others/welcome.png"
                darkModeSrc="/img/others/welcome-dark.png"
                alt="Welcome"
            />
            <h3 className="mb-2">
                New Feature is coming soooon....
            </h3>
            <p className="text-base">
            We're excited to let you know that a brand-new feature is currently in the works! Our team is working hard to bring you more value and enhance your experience.<br/> Stay tuned — it’s just around the corner!
            </p>
            {/* <div className="mt-8 max-w-[350px] mx-auto">
                <Button block className="mb-2" variant="solid" onClick={onNext}>
                    Get started
                </Button>
                <Button block variant="plain" onClick={onSkip}>
                    Skip now
                </Button>
            </div> */}
        </div>
    )
}

export default Step1
