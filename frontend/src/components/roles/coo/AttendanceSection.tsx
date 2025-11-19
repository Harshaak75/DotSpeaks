import React, { useState, useEffect } from 'react';
import { Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { api } from '../../../utils/api/Employees/api';
import { useDispatch, useSelector } from 'react-redux';
import { selectAccessToken } from '../../../redux/slice/authSlice';


interface AttendanceRecord {
  date: string;
  loginTime: string;
  logoutTime: string;
  status: 'Present' | 'Absent' | 'Late' | 'Half Day';
  hoursWorked: number;
}


interface LeaveRecord {
  type: string;
  taken: number;
  remaining: number;
  total: number;
}


const AttendanceSection: React.FC = () => {
  const [attendanceData, setAttendanceData] = useState<AttendanceRecord[]>([]);
  const [leaveData, setLeaveData] = useState<LeaveRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const accessToken = useSelector(selectAccessToken);
  const dispatch = useDispatch();

  useEffect(() => {
    fetchAttendanceData();
  }, []);

  const fetchAttendanceData = async () => {
    try {
      setLoading(true);
      const attendanceResponse = await api.coo.attendance.get(accessToken, dispatch);

      const formattedAttendance: AttendanceRecord[] = attendanceResponse.dailyAttendance.map((record: any) => ({
        date: record.date,
        loginTime: record.login,
        logoutTime: record.logout,
        status: record.status as 'Present' | 'Absent' | 'Late' | 'Half Day',
        hoursWorked: record.hours
      }));

      const formattedLeave: LeaveRecord[] = [
        { type: 'Annual Leave', taken: attendanceResponse.leaveSummary.usedLeaves, remaining: attendanceResponse.leaveSummary.remainingLeaves, total: attendanceResponse.leaveSummary.totalLeaves },
        { type: 'Sick Leave', taken: 2, remaining: 8, total: 10 },
        { type: 'Personal Leave', taken: 1, remaining: 4, total: 5 },
        { type: 'Maternity/Paternity', taken: 0, remaining: 90, total: 90 }
      ];

      setAttendanceData(formattedAttendance);
      setLeaveData(formattedLeave);
    } catch (error) {
      console.error('Error fetching attendance data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Present':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'Absent':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'Late':
        return <AlertCircle className="h-5 w-5 text-yellow-500" />;
      case 'Half Day':
        return <Clock className="h-5 w-5 text-blue-500" />;
      default:
        return <Clock className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Present':
        return 'bg-green-100 text-green-800';
      case 'Absent':
        return 'bg-red-100 text-red-800';
      case 'Late':
        return 'bg-yellow-100 text-yellow-800';
      case 'Half Day':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div 
          className="animate-spin rounded-full h-12 w-12 border-b-2"
          style={{ borderColor: '#0000CC' }}
        ></div>
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen p-6 space-y-6"
      style={{ backgroundColor: '#FEF9F5' }}
    >
      <h1 
        className="text-3xl mb-6"
        style={{ 
          fontFamily: 'Inter, sans-serif', 
          fontWeight: 'bold', 
          color: '#0000CC' 
        }}
      >
        HR Attendance
      </h1>

      {/* Leave Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {leaveData.map((leave, index) => (
          <div 
            key={index} 
            className="rounded-xl shadow-lg overflow-hidden"
            style={{ backgroundColor: '#0000CC' }}
          >
            {/* Card Header */}
            <div className="p-4 pb-3">
              <h3 
                className="text-white text-lg"
                style={{ fontFamily: 'Inter, sans-serif', fontWeight: 'bold' }}
              >
                {leave.type}
              </h3>
            </div>
            
            {/* Card Content */}
            <div className="bg-white p-4 space-y-3">
              <div className="flex justify-between">
                <span 
                  className="text-gray-600"
                  style={{ fontFamily: 'Roboto, sans-serif', fontSize: '14px' }}
                >
                  Total:
                </span>
                <span 
                  className="font-semibold"
                  style={{ fontFamily: 'Inter, sans-serif', fontWeight: 'bold', color: '#333' }}
                >
                  {leave.total}
                </span>
              </div>
              <div className="flex justify-between">
                <span 
                  className="text-gray-600"
                  style={{ fontFamily: 'Roboto, sans-serif', fontSize: '14px' }}
                >
                  Used:
                </span>
                <span 
                  className="font-semibold text-red-600"
                  style={{ fontFamily: 'Inter, sans-serif', fontWeight: 'bold' }}
                >
                  {leave.taken}
                </span>
              </div>
              <div className="flex justify-between">
                <span 
                  className="text-gray-600"
                  style={{ fontFamily: 'Roboto, sans-serif', fontSize: '14px' }}
                >
                  Remaining:
                </span>
                <span 
                  className="font-semibold text-green-600"
                  style={{ fontFamily: 'Inter, sans-serif', fontWeight: 'bold' }}
                >
                  {leave.remaining}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div
                  className="h-2 rounded-full"
                  style={{ 
                    width: `${(leave.taken / leave.total) * 100}%`,
                    backgroundColor: '#0000CC'
                  }}
                ></div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Daily Attendance Table */}
      <div 
        className="rounded-xl shadow-lg overflow-hidden"
        style={{ backgroundColor: '#0000CC' }}
      >
        {/* Table Header */}
        <div className="px-6 py-4">
          <h3 
            className="text-xl text-white"
            style={{ fontFamily: 'Inter, sans-serif', fontWeight: 'bold' }}
          >
            Daily Attendance Records
          </h3>
        </div>
        
        {/* Table Content */}
        <div className="bg-white overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead style={{ backgroundColor: '#f7f7f7ff' }}>
                <tr>
                  <th 
                    className="px-6 py-3 text-left text-xs uppercase tracking-wider"
                    style={{ 
                      fontFamily: 'Inter, sans-serif', 
                      fontWeight: 'bold',
                      color: '#0000CC'
                    }}
                  >
                    Date
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs uppercase tracking-wider"
                    style={{ 
                      fontFamily: 'Inter, sans-serif', 
                      fontWeight: 'bold',
                      color: '#0000CC'
                    }}
                  >
                    Login Time
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs uppercase tracking-wider"
                    style={{ 
                      fontFamily: 'Inter, sans-serif', 
                      fontWeight: 'bold',
                      color: '#0000CC'
                    }}
                  >
                    Logout Time
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs uppercase tracking-wider"
                    style={{ 
                      fontFamily: 'Inter, sans-serif', 
                      fontWeight: 'bold',
                      color: '#0000CC'
                    }}
                  >
                    Status
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs uppercase tracking-wider"
                    style={{ 
                      fontFamily: 'Inter, sans-serif', 
                      fontWeight: 'bold',
                      color: '#0000CC'
                    }}
                  >
                    Hours Worked
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {attendanceData.map((record, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td 
                      className="px-6 py-4 whitespace-nowrap"
                      style={{ fontFamily: 'Roboto, sans-serif', color: '#333' }}
                    >
                      {new Date(record.date).toLocaleDateString()}
                    </td>
                    <td 
                      className="px-6 py-4 whitespace-nowrap"
                      style={{ fontFamily: 'Roboto, sans-serif', color: '#333' }}
                    >
                      {record.loginTime}
                    </td>
                    <td 
                      className="px-6 py-4 whitespace-nowrap"
                      style={{ fontFamily: 'Roboto, sans-serif', color: '#333' }}
                    >
                      {record.logoutTime}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {getStatusIcon(record.status)}
                        <span 
                          className={`ml-2 inline-flex px-2 py-1 text-xs rounded-lg ${getStatusColor(record.status)}`}
                          style={{ fontFamily: 'Inter, sans-serif', fontWeight: 'bold' }}
                        >
                          {record.status}
                        </span>
                      </div>
                    </td>
                    <td 
                      className="px-6 py-4 whitespace-nowrap"
                      style={{ fontFamily: 'Roboto, sans-serif', color: '#333' }}
                    >
                      {record.hoursWorked}h
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AttendanceSection;
