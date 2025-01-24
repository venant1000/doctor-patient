import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserRole } from '../../types';
import { useApp } from '../../context/AppContext';
import { Lock, Mail, User, UserCircle } from 'lucide-react';

interface AuthFormProps {
  type: 'login' | 'signup';
}

export default function AuthForm({ type }: AuthFormProps) {
  const navigate = useNavigate();
  const { state, dispatch } = useApp();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<UserRole>('patient');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (type === 'signup') {
      const newUser = {
        id: crypto.randomUUID(),
        email,
        password,
        name,
        role,
        createdAt: new Date(),
      };

      dispatch({ type: 'ADD_USER', payload: newUser });
      if (role === 'doctor') {
        dispatch({
          type: 'ADD_DOCTOR',
          payload: {
            ...newUser,
            speciality: '',
            location: '',
            bio: '',
            minFee: 10,
            maxFee: 30,
            rating: 0,
            isApproved: false,
          },
        });
      } else if (role === 'patient') {
        dispatch({
          type: 'ADD_PATIENT',
          payload: {
            ...newUser,
            medicalHistory: '',
          },
        });
      }
      navigate('/login');
    } else {
      const user = state.users.find(
        (u) => u.email === email && u.password === password
      );
      if (user) {
        dispatch({ type: 'SET_CURRENT_USER', payload: user });
        navigate(`/${user.role}/dashboard`);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        <div className="text-center mb-8">
          <UserCircle className="w-16 h-16 mx-auto text-blue-600" />
          <h2 className="mt-4 text-3xl font-bold text-gray-900">
            {type === 'login' ? 'Welcome Back' : 'Create Account'}
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {type === 'signup' && (
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Name
              </label>
              <div className="mt-1 relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <div className="mt-1 relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <div className="mt-1 relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
          </div>

          {type === 'signup' && (
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Role
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as UserRole)}
                className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="patient">Patient</option>
                <option value="doctor">Doctor</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            {type === 'login' ? 'Sign In' : 'Sign Up'}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-gray-600">
          {type === 'login' ? (
            <>
              Don't have an account?{' '}
              <a
                href="/signup"
                className="font-medium text-blue-600 hover:text-blue-500"
              >
                Sign up
              </a>
            </>
          ) : (
            <>
              Already have an account?{' '}
              <a
                href="/login"
                className="font-medium text-blue-600 hover:text-blue-500"
              >
                Sign in
              </a>
            </>
          )}
        </p>
      </div>
    </div>
  );
}