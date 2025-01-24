import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import ChatInterface from '../chat/ChatInterface';
import { Calendar, MessageSquare, User, LogOut, Upload, CheckCircle, History, Clock, Bell } from 'lucide-react';

export default function DoctorDashboard() {
  const navigate = useNavigate();
  const { state, dispatch } = useApp();
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState('');
  const [selectedChat, setSelectedChat] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'pending' | 'active' | 'completed'>('pending');
  const [profile, setProfile] = useState(() => {
    const doctor = state.doctors.find((d) => d.id === state.currentUser?.id);
    return {
      speciality: doctor?.speciality || '',
      location: doctor?.location || '',
      bio: doctor?.bio || '',
      minFee: doctor?.minFee || 10,
      maxFee: doctor?.maxFee || 30,
      avatarUrl: doctor?.avatarUrl || '',
    };
  });

  const activeAppointments = state.appointments.filter(
    (apt) => apt.doctorId === state.currentUser?.id && apt.status === 'accepted'
  );

  const completedAppointments = state.appointments.filter(
    (apt) => apt.doctorId === state.currentUser?.id && apt.status === 'completed'
  );

  const pendingAppointments = state.appointments.filter(
    (apt) => apt.doctorId === state.currentUser?.id && apt.status === 'pending'
  );

  const handleLogout = () => {
    dispatch({ type: 'SET_CURRENT_USER', payload: null });
    navigate('/login');
  };

  const handleAppointmentAction = (appointmentId: string, status: 'accepted' | 'rejected') => {
    const appointment = state.appointments.find((apt) => apt.id === appointmentId);
    if (appointment) {
      const patient = state.users.find((u) => u.id === appointment.patientId);
      
      dispatch({
        type: 'UPDATE_APPOINTMENT',
        payload: { ...appointment, status },
      });

      // Add notification for the patient
      dispatch({
        type: 'ADD_NOTIFICATION',
        payload: {
          id: crypto.randomUUID(),
          userId: appointment.patientId,
          message: `Your appointment with Dr. ${state.currentUser?.name} has been ${status}. ${
            status === 'accepted' 
              ? 'You can now chat with the doctor.'
              : ''
          }`,
          createdAt: new Date(),
          read: false,
        },
      });

      // If accepted, create initial chat message
      if (status === 'accepted') {
        dispatch({
          type: 'ADD_MESSAGE',
          payload: {
            id: crypto.randomUUID(),
            senderId: state.currentUser!.id,
            receiverId: appointment.patientId,
            content: `Hello ${patient?.name}, I've accepted your appointment. How can I help you today?`,
            createdAt: new Date(),
          },
        });
      }
    }
  };

  const handleCompleteAppointment = (appointmentId: string) => {
    const appointment = state.appointments.find((apt) => apt.id === appointmentId);
    if (appointment) {
      dispatch({
        type: 'UPDATE_APPOINTMENT',
        payload: { ...appointment, status: 'completed' },
      });

      // Notify patient about completed appointment and request review
      dispatch({
        type: 'ADD_NOTIFICATION',
        payload: {
          id: crypto.randomUUID(),
          userId: appointment.patientId,
          message: `Your appointment with Dr. ${state.currentUser?.name} has been completed. Please leave a review of your experience.`,
          createdAt: new Date(),
          read: false,
        },
      });
    }
  };

  const handleUpdateProfile = () => {
    const doctor = state.doctors.find((d) => d.id === state.currentUser?.id);
    if (doctor) {
      dispatch({
        type: 'UPDATE_DOCTOR',
        payload: { ...doctor, ...profile, avatarUrl },
      });
      setIsEditingProfile(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarUrl(reader.result as string);
        setProfile({ ...profile, avatarUrl: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-end mb-4">
        <button
          onClick={handleLogout}
          className="flex items-center bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700"
        >
          <LogOut className="w-4 h-4 mr-2" />
          Logout
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Doctor Profile</h2>
          <button
            onClick={() => setIsEditingProfile(!isEditingProfile)}
            className="bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700"
          >
            {isEditingProfile ? 'Cancel' : 'Edit Profile'}
          </button>
        </div>

        <div className="mb-6">
          <div className="flex items-center justify-center mb-4">
            {profile.avatarUrl ? (
              <img
                src={profile.avatarUrl}
                alt="Profile"
                className="w-32 h-32 rounded-full object-cover"
              />
            ) : (
              <User className="w-32 h-32 text-gray-400" />
            )}
          </div>
          {isEditingProfile && (
            <div className="flex justify-center">
              <label className="cursor-pointer bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700">
                <Upload className="w-4 h-4 inline-block mr-2" />
                Upload Photo
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageUpload}
                />
              </label>
            </div>
          )}
        </div>

        {isEditingProfile ? (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Speciality
              </label>
              <input
                type="text"
                value={profile.speciality}
                onChange={(e) =>
                  setProfile({ ...profile, speciality: e.target.value })
                }
                className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Location
              </label>
              <input
                type="text"
                value={profile.location}
                onChange={(e) =>
                  setProfile({ ...profile, location: e.target.value })
                }
                className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Bio
              </label>
              <textarea
                value={profile.bio}
                onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Minimum Fee
                </label>
                <input
                  type="number"
                  value={profile.minFee}
                  onChange={(e) =>
                    setProfile({ ...profile, minFee: Number(e.target.value) })
                  }
                  min={10}
                  max={30}
                  className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Maximum Fee
                </label>
                <input
                  type="number"
                  value={profile.maxFee}
                  onChange={(e) =>
                    setProfile({ ...profile, maxFee: Number(e.target.value) })
                  }
                  min={10}
                  max={30}
                  className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            </div>
            <button
              onClick={handleUpdateProfile}
              className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700"
            >
              Save Changes
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <p>
              <span className="font-semibold">Speciality:</span>{' '}
              {profile.speciality || 'Not specified'}
            </p>
            <p>
              <span className="font-semibold">Location:</span>{' '}
              {profile.location || 'Not specified'}
            </p>
            <p>
              <span className="font-semibold">Bio:</span>{' '}
              {profile.bio || 'No bio provided'}
            </p>
            <p>
              <span className="font-semibold">Fee Range:</span> ${profile.minFee} -
              ${profile.maxFee}
            </p>
          </div>
        )}
      </div>

      <div className="mt-8">
        <div className="flex space-x-4 mb-6">
          <button
            onClick={() => setActiveTab('pending')}
            className={`px-4 py-2 rounded-md flex items-center ${
              activeTab === 'pending'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Pending
            {pendingAppointments.length > 0 && (
              <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                activeTab === 'pending' ? 'bg-white text-blue-600' : 'bg-blue-600 text-white'
              }`}>
                {pendingAppointments.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('active')}
            className={`px-4 py-2 rounded-md ${
              activeTab === 'active'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Active Appointments
          </button>
          <button
            onClick={() => setActiveTab('completed')}
            className={`px-4 py-2 rounded-md ${
              activeTab === 'completed'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Completed
          </button>
        </div>

        <div className="space-y-4">
          {activeTab === 'pending' ? (
            pendingAppointments.length === 0 ? (
              <p className="text-gray-600">No pending appointments.</p>
            ) : (
              pendingAppointments.map((appointment) => {
                const patient = state.patients.find(
                  (p) => p.id === appointment.patientId
                );
                return (
                  <div
                    key={appointment.id}
                    className="bg-white p-6 rounded-lg shadow-md"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center">
                          <User className="w-5 h-5 mr-2" />
                          <span className="font-semibold">{patient?.name}</span>
                        </div>
                        <div className="flex items-center mt-2">
                          <Clock className="w-5 h-5 mr-2" />
                          <span>
                            {new Date(appointment.date).toLocaleString()}
                          </span>
                        </div>
                        <p className="mt-2">Proposed Fee: ${appointment.proposedFee}</p>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleAppointmentAction(appointment.id, 'accepted')}
                          className="bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700"
                        >
                          Accept
                        </button>
                        <button
                          onClick={() => handleAppointmentAction(appointment.id, 'rejected')}
                          className="bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700"
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )
          ) : activeTab === 'active' ? (
            activeAppointments.map((appointment) => {
              const patient = state.patients.find(
                (p) => p.id === appointment.patientId
              );
              return (
                <div
                  key={appointment.id}
                  className="bg-white p-6 rounded-lg shadow-md"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center">
                        <User className="w-5 h-5 mr-2" />
                        <span className="font-semibold">{patient?.name}</span>
                      </div>
                      <div className="flex items-center mt-2">
                        <Calendar className="w-5 h-5 mr-2" />
                        <span>
                          {new Date(appointment.date).toLocaleString()}
                        </span>
                      </div>
                      <p className="mt-2">Fee: ${appointment.proposedFee}</p>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleCompleteAppointment(appointment.id)}
                        className="flex items-center bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700"
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Complete
                      </button>
                      <button
                        onClick={() => setSelectedChat(appointment.patientId)}
                        className="flex items-center bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
                      >
                        <MessageSquare className="w-4 h-4 mr-2" />
                        Chat
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="space-y-4">
              {completedAppointments.map((appointment) => {
                const patient = state.patients.find(
                  (p) => p.id === appointment.patientId
                );
                const review = state.reviews.find(
                  (r) => r.appointmentId === appointment.id
                );
                return (
                  <div
                    key={appointment.id}
                    className="bg-white p-6 rounded-lg shadow-md"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center">
                          <User className="w-5 h-5 mr-2" />
                          <span className="font-semibold">{patient?.name}</span>
                        </div>
                        <div className="flex items-center mt-2">
                          <History className="w-5 h-5 mr-2" />
                          <span>
                            {new Date(appointment.date).toLocaleString()}
                          </span>
                        </div>
                        <p className="mt-2">Fee: ${appointment.proposedFee}</p>
                        {review && (
                          <div className="mt-4 p-4 bg-gray-50 rounded-md">
                            <div className="flex items-center mb-2">
                              <span className="font-semibold mr-2">Rating:</span>
                              <div className="flex">
                                {[...Array(5)].map((_, i) => (
                                  <span
                                    key={i}
                                    className={`text-lg ${
                                      i < review.rating
                                        ? 'text-yellow-400'
                                        : 'text-gray-300'
                                    }`}
                                  >
                                    ★
                                  </span>
                                ))}
                              </div>
                            </div>
                            <p className="text-gray-600">{review.comment}</p>
                          </div>
                        )}
                      </div>
                      <button
                        onClick={() => setSelectedChat(appointment.patientId)}
                        className="flex items-center bg-gray-100 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-200"
                      >
                        <MessageSquare className="w-4 h-4 mr-2" />
                        View Chat
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {selectedChat && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg w-full max-w-2xl">
            <div className="flex justify-between items-center p-4 border-b">
              <h3 className="text-lg font-semibold">Chat History</h3>
              <button 
                onClick={() => setSelectedChat(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                ×
              </button>
            </div>
            <ChatInterface recipientId={selectedChat} />
          </div>
        </div>
      )}
    </div>
  );
}