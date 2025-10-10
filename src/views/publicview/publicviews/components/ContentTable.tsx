import { useState } from 'react'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Dialog from '@/components/ui/Dialog'
import Textarea from '@/views/ui-components/forms/Input/Textarea'

type ProjectDetails = {
    projectName: string
    projectDescription: string
    location: string
    clientName: string
    startDate: string
    endDate: string
    status: string
}

const ProjectDetailsView = () => {
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [comments, setComments] = useState('')
    const [isChecked, setIsChecked] = useState(false)

    // Dummy project data
    const projectDetails: ProjectDetails = {
        projectName: 'Office Building Construction',
        projectDescription: 'Construction of a 10-story office building with parking facilities',
        location: 'Dubai Marina, Dubai, UAE',
        clientName: 'ABC Development LLC',
        startDate: '2023-06-15',
        endDate: '2024-12-31',
        status: 'In Progress'
    }

    const openModal = () => {
        setIsModalOpen(true)
    }

    const closeModal = () => {
        setIsModalOpen(false)
    }

    const handleCheck = () => {
        openModal()
    }

    const handleReject = () => {
        setIsChecked(false)
        closeModal()
        // Add your rejection logic here
    }

    const handleApprove = () => {
        setIsChecked(true)
        closeModal()
        // Add your approval logic here
    }

    return (
        <div className="space-y-4">
            {/* Project Details Card */}
            <Card className="border border-gray-200 dark:border-gray-600">
                <div className="p-6 space-y-4">
                    <h3 className="text-lg font-semibold mb-4">Project Details</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <p className="text-gray-500 dark:text-gray-400">Project Name</p>
                            <p className="font-medium">{projectDetails.projectName}</p>
                        </div>
                        <div>
                            <p className="text-gray-500 dark:text-gray-400">Location</p>
                            <p className="font-medium">{projectDetails.location}</p>
                        </div>
                        <div>
                            <p className="text-gray-500 dark:text-gray-400">Client Name</p>
                            <p className="font-medium">{projectDetails.clientName}</p>
                        </div>
                        <div>
                            <p className="text-gray-500 dark:text-gray-400">Status</p>
                            <p className="font-medium">{projectDetails.status}</p>
                        </div>
                        <div>
                            <p className="text-gray-500 dark:text-gray-400">Start Date</p>
                            <p className="font-medium">{projectDetails.startDate}</p>
                        </div>
                        <div>
                            <p className="text-gray-500 dark:text-gray-400">End Date</p>
                            <p className="font-medium">{projectDetails.endDate}</p>
                        </div>
                    </div>
                    
                    <div className="pt-2">
                        <p className="text-gray-500 dark:text-gray-400">Project Description</p>
                        <p className="font-medium">{projectDetails.projectDescription}</p>
                    </div>
                </div>
            </Card>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-3">
                <Button variant="solid" onClick={() => alert('Download functionality')}>
                    Download
                </Button>
                <Button 
                    variant={isChecked ? 'solid' : 'default'} 
                    onClick={handleCheck}
                >
                    {isChecked ? 'Checked' : 'Check'}
                </Button>
            </div>

            {/* Check Modal */}
            <Dialog
                isOpen={isModalOpen}
                onClose={closeModal}
                width={500}
                className="dark:bg-gray-800"
            >
                <h5 className="mb-4 dark:text-white">Project Verification</h5>

                <div className="mb-4">
                    <label className="block mb-2 dark:text-gray-300">
                        Comments
                    </label>
                    <Textarea
                        rows={4}
                        value={comments}
                        onChange={(e) => setComments(e.target.value)}
                        placeholder="Enter your comments here..."
                    />
                </div>

                <div className="flex justify-end space-x-2">
                    <Button
                        variant="plain"
                        onClick={handleReject}
                        className="text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/30"
                    >
                        Reject
                    </Button>
                    <Button
                        variant="solid"
                        onClick={handleApprove}
                        className="bg-blue-600 hover:bg-blue-700 text-white dark:bg-blue-500 dark:hover:bg-blue-600"
                    >
                        Approve
                    </Button>
                </div>
            </Dialog>
        </div>
    )
}

export default ProjectDetailsView