// components/LPOEditModal.tsx
import { useState } from 'react';
import { Button } from '@/components/ui';
import { HiOutlinePencil } from 'react-icons/hi';
import Dialog from '@/components/ui/Dialog';
import LpoForm from './LpoForm'; // Your existing LPO form component

interface LPOEditModalProps {
    lpoData: any;
    projectId: string;
    onSuccess?: () => void;
}

const LPOEditModal = ({ lpoData, projectId, onSuccess }: LPOEditModalProps) => {
    const [modalOpen, setModalOpen] = useState(false);

    const handleSuccess = () => {
        setModalOpen(false);
        onSuccess?.();
    };

    const handleDiscard = () => {
        setModalOpen(false);
    };

    return (
        <>
            <Button
                icon={<HiOutlinePencil />}
                size="sm"
                variant="solid"
                onClick={() => setModalOpen(true)}
            >
                Edit
            </Button>

            <Dialog
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                onRequestClose={() => setModalOpen(false)}
                width={1000}
                height={600}
            >
                <div className="p-6">
                    <h3 className="text-lg font-semibold mb-4">Edit LPO</h3>
                    <LpoForm
                        type="edit"
                        initialData={{
                            id: lpoData._id,
                            projectId: projectId,
                            lpoNumber: lpoData.lpoNumber,
                            lpoDate: new Date(lpoData.lpoDate).toISOString().split('T')[0],
                            supplier: lpoData.supplier,
                            items: lpoData.items.map((item: any) => ({
                                description: item.description,
                                quantity: item.quantity,
                                unitPrice: item.unitPrice
                            })),
                            existingDocuments: lpoData.documents
                        }}
                        onDiscard={handleDiscard}
                        onSuccess={handleSuccess}
                    />
                </div>
            </Dialog>
        </>
    );
};

export default LPOEditModal;