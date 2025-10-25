import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ClipLoader from 'react-spinners/ClipLoader';
import { 
  apiGetAvailableEngineers, 
  apiGetAvailableDrivers,
  apiAssignTeamToProject
} from '../../api/api';
import { 
  Button, 
  Checkbox, 
  Card,
  Avatar,
  Notification,
  toast
} from '@/components/ui';
import { 
  HiUserGroup, 
  HiTruck, 
  HiCheckCircle,
  HiDocumentReport
} from 'react-icons/hi';

interface TeamMember {
  _id: string;
  firstName: string;
  lastName: string;
  profileImage?: string;
}

const TeamAssignment = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [engineers, setEngineers] = useState<TeamMember[]>([]);
  const [drivers, setDrivers] = useState<TeamMember[]>([]);
  const [selectedWorkers, setSelectedWorkers] = useState<string[]>([]);
  const [selectedDriver, setSelectedDriver] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchTeamMembers = async () => {
      try {
        setLoading(true);
        const [engResponse, drvResponse] = await Promise.all([
          apiGetAvailableEngineers(),
          apiGetAvailableDrivers()
        ]);

        setEngineers(engResponse.data.data?.workers || []);
        setDrivers(drvResponse.data?.data?.drivers || []);
      } catch (error) {
        console.error('Error fetching team members:', error);
        toast.push(
          <Notification title="Error" type="danger">
            Failed to load team members
          </Notification>
        );
      } finally {
        setLoading(false);
      }
    };

    fetchTeamMembers();
  }, []);

  const handleSubmit = async () => {
    if (selectedWorkers.length === 0 || !selectedDriver) {
      toast.push(
        <Notification title="Warning" type="warning">
          Please select at least one worker and a driver
        </Notification>
      );
      return;
    }

    try {
      setSubmitting(true);
      await apiAssignTeamToProject(projectId, {
        workers: selectedWorkers,
        driverId: selectedDriver
      });
      
      toast.push(
        <Notification title="Success" type="success">
          Team assigned successfully
        </Notification>
      );
      
      navigate(`/app/project-view/${projectId}`);
    } catch (error) {
      console.error('Error assigning team:', error);
      toast.push(
        <Notification title="Error" type="danger">
          Failed to assign team
        </Notification>
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-850 dark:to-gray-900 flex items-center justify-center">
        <ClipLoader color="#4f46e5" size={50} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-850 dark:to-gray-900">
      <div className="container mx-auto p-6">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg">
              <HiDocumentReport className="text-2xl text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Assign Team</h1>
              <p className="text-gray-500 dark:text-gray-400">Select workers and driver for this project</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          {/* Workers Selection */}
          <Card className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-750 p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg">
                  <HiUserGroup className="text-2xl text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-800 dark:text-white">Select Workers</h3>
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {engineers.map(engineer => (
                  <div 
                    key={engineer._id} 
                    className={`flex items-center p-4 rounded-xl border transition-all duration-200 cursor-pointer ${
                      selectedWorkers.includes(engineer._id)
                        ? 'bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 border-indigo-200 dark:border-indigo-800 shadow-sm'
                        : 'bg-gradient-to-r from-gray-50 to-slate-50 dark:from-gray-700 dark:to-gray-600 border-gray-200 dark:border-gray-600 hover:shadow-md'
                    }`}
                    onClick={() => {
                      setSelectedWorkers(prev => 
                        prev.includes(engineer._id)
                          ? prev.filter(id => id !== engineer._id)
                          : [...prev, engineer._id]
                      );
                    }}
                  >
                    <Checkbox
                      checked={selectedWorkers.includes(engineer._id)}
                      onChange={() => {}}
                      className="mr-3"
                    />
                    <Avatar 
                      src={engineer.profileImage} 
                      size={40}
                      className="ring-2 ring-white dark:ring-gray-800"
                    />
                    <span className="ml-3 dark:text-gray-200 font-medium">
                      {engineer.firstName} {engineer.lastName}
                    </span>
                    {selectedWorkers.includes(engineer._id) && (
                      <HiCheckCircle className="ml-auto text-green-500 text-xl" />
                    )}
                  </div>
                ))}
                {engineers.length === 0 && (
                  <div className="text-center py-8">
                    <HiUserGroup className="text-4xl text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 dark:text-gray-400">No available engineers</p>
                  </div>
                )}
              </div>
            </div>
          </Card>

          {/* Driver Selection */}
          <Card className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden">
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-gray-800 dark:to-gray-750 p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg">
                  <HiTruck className="text-2xl text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-800 dark:text-white">Select Driver</h3>
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <select
                  value={selectedDriver}
                  onChange={(e) => setSelectedDriver(e.target.value)}
                  className="w-full p-4 bg-gradient-to-r from-gray-50 to-slate-50 dark:from-gray-700 dark:to-gray-600 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 dark:text-gray-200"
                >
                  <option value="" className="dark:bg-gray-700 dark:text-gray-200">Choose a driver</option>
                  {drivers.map(driver => (
                    <option 
                      key={driver._id} 
                      value={driver._id}
                      className="dark:bg-gray-700 dark:text-gray-200"
                    >
                      {driver.firstName} {driver.lastName}
                    </option>
                  ))}
                </select>

                {selectedDriver && (
                  <div className="flex items-center p-4 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-xl border border-indigo-200 dark:border-indigo-800">
                    <Avatar 
                      src={drivers.find(d => d._id === selectedDriver)?.profileImage} 
                      size={40}
                      className="ring-2 ring-white dark:ring-gray-800"
                    />
                    <span className="ml-3 dark:text-gray-200 font-medium">
                      {drivers.find(d => d._id === selectedDriver)?.firstName}{' '}
                      {drivers.find(d => d._id === selectedDriver)?.lastName}
                    </span>
                    <HiCheckCircle className="ml-auto text-green-500 text-xl" />
                  </div>
                )}

                {drivers.length === 0 && (
                  <div className="text-center py-8">
                    <HiTruck className="text-4xl text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 dark:text-gray-400">No available drivers</p>
                  </div>
                )}

                <div className="mt-8">
                  <Button
                    variant="solid"
                    loading={submitting}
                    onClick={handleSubmit}
                    className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-semibold py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
                    disabled={engineers.length === 0 || drivers.length === 0}
                    icon={!submitting && <HiCheckCircle />}
                  >
                    {submitting ? 'Assigning Team...' : 'Assign Team'}
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Summary Section */}
        {(selectedWorkers.length > 0 || selectedDriver) && (
          <Card className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden mt-8">
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-gray-800 dark:to-gray-750 p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg">
                  <HiCheckCircle className="text-2xl text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-800 dark:text-white">Team Summary</h3>
              </div>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-gray-700 dark:text-gray-300 mb-3">
                    Selected Workers ({selectedWorkers.length})
                  </h4>
                  <div className="space-y-2">
                    {selectedWorkers.map(workerId => {
                      const worker = engineers.find(e => e._id === workerId);
                      return worker ? (
                        <div key={workerId} className="flex items-center p-2 bg-gradient-to-r from-gray-50 to-slate-50 dark:from-gray-700 dark:to-gray-600 rounded-lg">
                          <Avatar src={worker.profileImage} size={30} />
                          <span className="ml-2 dark:text-gray-200 text-sm">
                            {worker.firstName} {worker.lastName}
                          </span>
                        </div>
                      ) : null;
                    })}
                  </div>
                </div>
                
                <div>
                  <h4 className="font-semibold text-gray-700 dark:text-gray-300 mb-3">Selected Driver</h4>
                  {selectedDriver && (
                    <div className="flex items-center p-3 bg-gradient-to-r from-gray-50 to-slate-50 dark:from-gray-700 dark:to-gray-600 rounded-lg">
                      <Avatar 
                        src={drivers.find(d => d._id === selectedDriver)?.profileImage} 
                        size={30}
                      />
                      <span className="ml-2 dark:text-gray-200">
                        {drivers.find(d => d._id === selectedDriver)?.firstName}{' '}
                        {drivers.find(d => d._id === selectedDriver)?.lastName}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

export default TeamAssignment;