import { useState, useEffect } from 'react'
import Button from '@/components/ui/Button'
import Dialog from '@/components/ui/Dialog'
import Input from '@/components/ui/Input'
import type { MouseEvent } from 'react'
import { Notification, toast } from '@/components/ui'
import { addGrnNumber } from '../../api/api'

type GrnModalProps = {
    isOpen: boolean
    onClose: () => void
    onSave?: (grnNumber: string) => void
    projectId: string
    refetch: () => void
    number?: string  // Add this prop for existing GRN number
}

const GrnModal = ({ 
    isOpen, 
    onClose, 
    onSave, 
    projectId, 
    refetch,
    number  // Destructure the number prop
}: GrnModalProps) => {
    const [grnNumber, setGrnNumber] = useState(number || '')  // Initialize with passed number
    const [error, setError] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)

    // Reset form when modal opens/closes or when number prop changes
    useEffect(() => {
        setGrnNumber(number || '')
        setError('')
    }, [isOpen, number])

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setGrnNumber(e.target.value)
        if (error) setError('')
    }

    const handleSubmit = async (e: MouseEvent) => {
        e.preventDefault()
        
        if (!grnNumber.trim()) {
            setError('GRN number is required')
            return
        }

        // Check if the number is the same as existing
        if (number && grnNumber === number) {
            toast.push(
                <Notification 
                    title="Info" 
                    type="info"
                    duration={2500}
                >
                    GRN number hasn't changed
                </Notification>,
                { placement: 'top-center' }
            )
            onClose()
            return
        }

        try {
            setIsSubmitting(true)
            setError('')
            
            await addGrnNumber(projectId, grnNumber)
            refetch()
            onSave?.(grnNumber)

            toast.push(
                <Notification 
                    title="Success" 
                    type="success"
                    duration={2500}
                >
                    {number ? 'GRN number updated' : 'GRN number saved'} successfully
                </Notification>,
                { placement: 'top-center' }
            )

            onClose()
        } catch (error: any) {
            const errorMessage = error?.response?.data?.message || 
                               error?.data?.message || 
                               error.message || 
                               'Failed to save GRN number'
            
            setError(errorMessage)
            toast.push(
                <Notification 
                    title="Error" 
                    type="danger"
                    duration={2500}
                >
                    {errorMessage}
                </Notification>,
                { placement: 'top-center' }
            )
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <Dialog
            isOpen={isOpen}
            onClose={onClose}
            onRequestClose={onClose}
            width={500}
        >
            <h5 className="mb-4">{number ? 'Update GRN Number' : 'Add GRN Number'}</h5>
            <div className="mb-4">
                <label htmlFor="grnNumber" className="block mb-2">
                    GRN Number <span className="text-red-500">*</span>
                </label>
               
                <Input
                    id="grnNumber"
                    placeholder="Enter GRN number"
                    value={grnNumber}
                    onChange={handleInputChange}
                    disabled={isSubmitting}
                />
                {error && <p className="mt-1 text-red-500">{error}</p>}
            </div>
            <div className="text-right mt-6">
                <Button
                    className="ltr:mr-2 rtl:ml-2"
                    variant="plain"
                    onClick={onClose}
                    disabled={isSubmitting}
                >
                    Cancel
                </Button>
                <Button 
                    variant="solid" 
                    onClick={handleSubmit}
                    loading={isSubmitting}
                >
                    {isSubmitting 
                        ? 'Processing...' 
                        : number ? 'Update' : 'Save'}
                </Button>
            </div>
        </Dialog>
    )
}

export default GrnModal