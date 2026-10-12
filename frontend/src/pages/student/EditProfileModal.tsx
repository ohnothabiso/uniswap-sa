import React, { useState } from 'react';
import { User } from '@/types';
import { Modal } from '@/components/common/Modal';
import { Button } from '@/components/common/Button';
import { authService } from '@/services/authService';
import { extractErrorMessage } from '@/services/apiClient';
import { Upload, AlertCircle, Save } from 'lucide-react';

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User;
  onProfileUpdated: () => void;
}

export const EditProfileModal: React.FC<EditProfileModalProps> = ({
  isOpen,
  onClose,
  user,
  onProfileUpdated,
}) => {
  const [fullName, setFullName] = useState(user.full_name);
  const [residence, setResidence] = useState(user.campus_residence || 'Moroka Res');
  const [faculty, setFaculty] = useState(user.faculty || 'Faculty of Humanities');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append('full_name', fullName.trim());
      formData.append('campus_residence', residence);
      formData.append('faculty', faculty);
      if (avatarFile) {
        formData.append('avatar', avatarFile);
      }

      await authService.updateProfile(formData);
      onProfileUpdated();
      onClose();
    } catch (err) {
      setErrorMessage(extractErrorMessage(err, 'Failed to update profile.'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Edit Student Profile"
      description="Update your display name, residence, or profile avatar."
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {errorMessage && (
          <div className="p-3 rounded-xl bg-red-50 text-red-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <div className="space-y-1">
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
            Display Name
          </label>
          <input
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
            className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white"
          />
        </div>

        <div className="space-y-1">
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
            Campus Residence
          </label>
          <select
            value={residence}
            onChange={(e) => setResidence(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white"
          >
            <option value="Moroka Res">Moroka Residence</option>
            <option value="Luka Jantjie Hall">Luka Jantjie Hall</option>
            <option value="SPU North Campus">SPU North Campus</option>
            <option value="Central Campus">Central Campus</option>
            <option value="Off-Campus Private">Off-Campus / Private Accommodation</option>
          </select>
        </div>

        <div className="space-y-1">
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
            Faculty
          </label>
          <select
            value={faculty}
            onChange={(e) => setFaculty(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white"
          >
            <option value="Faculty of Humanities">Faculty of Humanities</option>
            <option value="Faculty of Education">Faculty of Education</option>
            <option value="Faculty of Natural & Applied Sciences">Natural & Applied Sciences</option>
            <option value="Faculty of Economic & Management Sciences">Economic & Management Sciences</option>
          </select>
        </div>

        <div className="space-y-1">
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
            Update Avatar Photo
          </label>
          <div className="flex items-center gap-3">
            <label className="cursor-pointer inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100">
              <Upload className="w-4 h-4" />
              <span>{avatarFile ? avatarFile.name : 'Choose new photo...'}</span>
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
                Clear
              </button>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
          <Button type="button" variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="sm"
            isLoading={isLoading}
            leftIcon={<Save className="w-4 h-4" />}
          >
            Save Profile
          </Button>
        </div>
      </form>
    </Modal>
  );
};
