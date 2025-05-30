import React from 'react';
import { Company } from '../types';
import { Bell } from 'lucide-react';

interface CompanyFormProps {
  onSubmit: (data: Partial<Company>) => void;
  onCancel: () => void;
  initialData?: Company;
}
  
export function CompanyForm({ tags }: CompanyFormProps) {

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead>
          <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                WhatsApp
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Mail
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                SMS
              </th>
          </tr>
        </thead>
      </table>
    </div>
  );
}