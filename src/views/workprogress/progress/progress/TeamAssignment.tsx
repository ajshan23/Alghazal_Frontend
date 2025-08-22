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
  Avatar
} from '@/components/ui';

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

        console.log("engResponse", engResponse.data.data.workers);
        console.log("drvResponse", drvResponse.data.data.drivers);

        setEngineers(engResponse.data.data?.workers || []);
        setDrivers(drvResponse.data?.data?.drivers || []);
      } catch (error) {
        console.error('Error fetching team members:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTeamMembers();
  }, []);

  const handleSubmit = async () => {
    if (selectedWorkers.length === 0 || !selectedDriver) {
      alert('Please select at least one worker and a driver');
      return;
    }

    try {
      setSubmitting(true);
      await apiAssignTeamToProject(projectId, {
        workers: selectedWorkers,
        driverId: selectedDriver
      });
      navigate(`/app/project-view/${projectId}`);
    } catch (error) {
      console.error('Error assigning team:', error);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <ClipLoader color="#3b82f6" size={50} />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 h-full">
      <Card header="Assign Team to Project" headerClass="text-lg font-bold">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium mb-4">Select Workers</h4>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {engineers.map(engineer => (
                <div key={engineer._id} className="flex items-center p-2 border rounded dark:border-gray-600">
                  <Checkbox
                    checked={selectedWorkers.includes(engineer._id)}
                    onChange={() => {
                      setSelectedWorkers(prev => 
                        prev.includes(engineer._id)
                          ? prev.filter(id => id !== engineer._id)
                          : [...prev, engineer._id]
                      );
                    }}
                  />
                  <Avatar className="ml-3" src={engineer.profileImage} />
                  <span className="ml-2 dark:text-gray-200">
                    {engineer.firstName} {engineer.lastName}
                  </span>
                </div>
              ))}
              {engineers.length === 0 && (
                <p className="text-gray-500 dark:text-gray-400 text-center py-4">No available engineers</p>
              )}
            </div>
          </div>

          <div>
            <h4 className="font-medium mb-4 dark:text-gray-200">Select Driver</h4>
            <select
              value={selectedDriver}
              onChange={(e) => setSelectedDriver(e.target.value)}
              className="w-full border border-gray-300 rounded p-2 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 dark:focus:ring-blue-500 dark:focus:border-blue-500"
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

            {drivers.length === 0 && (
              <p className="text-gray-500 dark:text-gray-400 text-sm mt-2">No available drivers</p>
            )}

            <div className="mt-8">
              <Button
                variant="solid"
                loading={submitting}
                onClick={handleSubmit}
                className="w-full"
                disabled={engineers.length === 0 || drivers.length === 0}
              >
                Assign Team
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default TeamAssignment;