import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { authService } from '@/services/authService';
import { extractErrorMessage } from '@/services/apiClient';
import { University } from '@/types';
import {
  User as UserIcon,
  Mail,
  Lock,
  Building,
  Home,
  GraduationCap,
  Eye,
  EyeOff,
  ArrowRight,
  AlertCircle,
  Upload,
} from 'lucide-react';
import { Button } from '@/components/common/Button';

export const RegisterPage: React.FC = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [universities, setUniversities] = useState<University[]>([]);
  const [selectedUniversity, setSelectedUniversity] = useState<number | ''>('');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [residence, setResidence] = useState('Moroka Res');
  const [faculty, setFaculty] = useState('Faculty of Humanities');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    authService
      .getUniversities()
      .then((data) => {
        setUniversities(data);
        const spu = data.find((u) => u.email_domain === 'spu.ac.za') || data[0];
        if (spu) setSelectedUniversity(spu.university_id);
      })
      .catch((err) => {
        setErrorMessage(extractErrorMessage(err, 'Could not retrieve participating universities from backend. Please refresh.'));
      });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!selectedUniversity) {
      setErrorMessage('Please select your university.');
      return;
    }
    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }
    if (password !== passwordConfirm) {
      setErrorMessage('Passwords do not match.');
      return;
    }

    const currentUni = universities.find((u) => u.university_id === Number(selectedUniversity));
    const expectedDomain = currentUni ? currentUni.email_domain.toLowerCase() : 'spu.ac.za';
    if (!email.toLowerCase().endsWith(`@${expectedDomain}`)) {
      setErrorMessage(`Registration requires an authentic @${expectedDomain} student email.`);
      return;
    }

    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append('full_name', fullName.trim());
      formData.append('email', email.trim().toLowerCase());
      formData.append('university', String(selectedUniversity));
      formData.append('password', password);
      formData.append('password_confirm', passwordConfirm);
      formData.append('campus_residence', residence);
      formData.append('faculty', faculty);
      if (avatarFile) {
        formData.append('avatar', avatarFile);
      }

      await register(formData);
      navigate('/explore', { replace: true });
    } catch (err) {
      const msg = extractErrorMessage(err, 'Failed to complete student registration. Please check your details.');
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 py-12 max-w-2xl">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-10 shadow-xl space-y-8">
        <div className="space-y-2 text-center">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100 text-campus-primary dark:bg-blue-950 dark:text-blue-300 text-xs font-bold">
            <GraduationCap className="w-3.5 h-3.5" />
            <span>Sol Plaatje University Verified Registration</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            Create Student Account
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto">
            Join the peer-to-peer campus circular wardrobe collective at SPU.
          </p>
        </div>

        {errorMessage && (
          <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 text-red-700 dark:text-red-300 text-xs flex items-start gap-3">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-semibold">Registration Issue</p>
              <p>{errorMessage}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Full Name */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                Full Name
              </label>
              <div className="relative">
                <UserIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Katlego Mabasa"
                  required
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-campus-secondary transition-all"
                />
              </div>
            </div>

            {/* University Selection */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                University Institution
              </label>
              <div className="relative">
                <Building className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <select
                  value={selectedUniversity}
                  onChange={(e) => setSelectedUniversity(Number(e.target.value))}
                  required
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-campus-secondary transition-all"
                >
                  {universities.map((uni) => (
                    <option key={uni.university_id} value={uni.university_id}>
                      {uni.name} ({uni.email_domain})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Student Email */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
              Student University Email
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="student.number@spu.ac.za"
                required
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-campus-secondary transition-all"
              />
            </div>
            <p className="text-[11px] text-slate-500">
              Your official university email is verified to guarantee campus community trust.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Campus Residence */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                Residence / Campus Location
              </label>
              <div className="relative">
                <Home className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <select
                  value={residence}
                  onChange={(e) => setResidence(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-campus-secondary transition-all"
                >
                  <option value="Moroka Res">Moroka Residence</option>
                  <option value="Luka Jantjie Hall">Luka Jantjie Hall</option>
                  <option value="SPU North Campus">SPU North Campus</option>
                  <option value="Central Campus">Central Campus</option>
                  <option value="Off-Campus Private">Off-Campus / Private Accommodation</option>
                </select>
              </div>
            </div>

            {/* Faculty */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                Academic Faculty
              </label>
              <div className="relative">
                <GraduationCap className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <select
                  value={faculty}
                  onChange={(e) => setFaculty(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-campus-secondary transition-all"
                >
                  <option value="Faculty of Humanities">Faculty of Humanities</option>
                  <option value="Faculty of Education">Faculty of Education</option>
                  <option value="Faculty of Natural & Applied Sciences">Natural & Applied Sciences</option>
                  <option value="Faculty of Economic & Management Sciences">Economic & Management Sciences</option>
                </select>
              </div>
            </div>
          </div>

          {/* Passwords */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min 6 characters"
                  required
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-campus-secondary transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={passwordConfirm}
                  onChange={(e) => setPasswordConfirm(e.target.value)}
                  placeholder="Re-enter password"
                  required
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-campus-secondary transition-all"
                />
              </div>
            </div>
          </div>

          {/* Optional Avatar Upload */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
              Profile Photo (Optional)
            </label>
            <div className="flex items-center gap-3">
              <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 transition-colors">
                <Upload className="w-4 h-4" />
                <span>{avatarFile ? avatarFile.name : 'Choose student photo...'}</span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      setAvatarFile(e.target.files[0]);
                    }
                  }}
                />
              </label>
              {avatarFile && (
                <button
                  type="button"
                  onClick={() => setAvatarFile(null)}
                  className="text-xs text-red-600 hover:underline"
                >
                  Remove
                </button>
              )}
            </div>
          </div>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            className="w-full py-3 bg-campus-primary hover:bg-campus-primaryDark"
            isLoading={isLoading}
            rightIcon={<ArrowRight className="w-4 h-4" />}
          >
            Create Sol Plaatje Student Account
          </Button>
        </form>

        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 text-center text-xs text-slate-500">
          <span>Already registered with SPU? </span>
          <Link to="/login" className="font-bold text-campus-secondary hover:underline">
            Sign In here
          </Link>
        </div>
      </div>
    </div>
  );
};
