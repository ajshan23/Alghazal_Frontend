import { useState } from 'react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { HiX, HiMail } from 'react-icons/hi';
import { Dialog } from '@/components/ui';

interface CcEmailModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSend: (ccEmails: string[]) => void;
    loading?: boolean;
}

const CcEmailModal = ({ isOpen, onClose, onSend, loading = false }: CcEmailModalProps) => {
    const [ccEmails, setCcEmails] = useState<string[]>([]);
    const [inputValue, setInputValue] = useState('');
    const [error, setError] = useState('');

    const validateEmail = (email: string): boolean => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email.trim());
    };

    const handleAddEmail = () => {
        const email = inputValue.trim();
        
        if (!email) {
            return;
        }

        if (!validateEmail(email)) {
            setError('Please enter a valid email address');
            return;
        }

        if (ccEmails.includes(email)) {
            setError('This email is already added');
            return;
        }

        setCcEmails([...ccEmails, email]);
        setInputValue('');
        setError('');
    };

    const handleRemoveEmail = (emailToRemove: string) => {
        setCcEmails(ccEmails.filter(email => email !== emailToRemove));
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleAddEmail();
        }
    };

    const handleSend = () => {
        onSend(ccEmails);
        handleClose();
    };

    const handleClose = () => {
        setCcEmails([]);
        setInputValue('');
        setError('');
        onClose();
    };

    return (
        <Dialog
            isOpen={isOpen}
            onClose={handleClose}
            width={600}
        >
            <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-gradient-to-r from-blue-500 to-cyan-600 rounded-lg">
                            <HiMail className="text-2xl text-white" />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-gray-800 dark:text-white">
                                Send Quotation Email
                            </h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                Add CC recipients (optional)
                            </p>
                        </div>
                    </div>
                </div>

                <div className="mb-6">
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        CC Email Addresses
                    </label>
                    
                    {ccEmails.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
                            {ccEmails.map((email, index) => (
                                <div
                                    key={index}
                                    className="inline-flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-blue-500 to-cyan-600 text-white rounded-full text-sm font-medium shadow-sm hover:shadow-md transition-shadow"
                                >
                                    <span>{email}</span>
                                    <button
                                        onClick={() => handleRemoveEmail(email)}
                                        className="hover:bg-white/20 rounded-full p-0.5 transition-colors"
                                        type="button"
                                    >
                                        <HiX className="text-sm" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}

                    <div className="flex gap-2">
                        <Input
                            type="email"
                            placeholder="Enter email address and press Enter"
                            value={inputValue}
                            onChange={(e) => {
                                setInputValue(e.target.value);
                                setError('');
                            }}
                            onKeyDown={handleKeyDown}
                            className="flex-1"
                        />
                        <Button
                            variant="solid"
                            onClick={handleAddEmail}
                            className="bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700"
                        >
                            Add
                        </Button>
                    </div>

                    {error && (
                        <p className="text-red-500 text-sm mt-2">{error}</p>
                    )}

                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                        Press Enter or click Add to add an email address
                    </p>
                </div>

                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                        <strong>Note:</strong> The quotation will be sent to the client's email address. 
                        CC recipients will receive a copy of the email with the quotation PDF attached.
                    </p>
                </div>

                <div className="flex justify-end gap-3">
                    <Button
                        variant="plain"
                        onClick={handleClose}
                        disabled={loading}
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="solid"
                        loading={loading}
                        onClick={handleSend}
                        icon={<HiMail />}
                        className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
                    >
                        {loading ? 'Sending...' : ccEmails.length > 0 ? `Send to ${ccEmails.length} CC` : 'Send Email'}
                    </Button>
                </div>
            </div>
        </Dialog>
    );
};

export default CcEmailModal;