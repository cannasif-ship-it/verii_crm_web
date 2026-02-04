import { api } from '@/lib/axios';
import type { ApiResponse } from '@/types/api';
import type { SmtpSettingsDto, UpdateSmtpSettingsDto } from '../types/smtpSettings';

const SMTP_SETTINGS_BASE = '/api/SmtpSettings';

function getErrorMessage(response: ApiResponse<unknown>, fallbackKey: string): string {
  if (response.message?.trim()) return response.message;
  if (response.errors?.length) return response.errors.join(' ');
  return fallbackKey;
}

export const smtpSettingsApi = {
  get: async (): Promise<SmtpSettingsDto> => {
    const response = await api.get<ApiResponse<SmtpSettingsDto>>(SMTP_SETTINGS_BASE);
    if (response.success === true && response.data) {
      return response.data;
    }
    throw new Error(getErrorMessage(response, 'common.UnexpectedError'));
  },

  update: async (data: UpdateSmtpSettingsDto): Promise<SmtpSettingsDto> => {
    const response = await api.put<ApiResponse<SmtpSettingsDto>>(SMTP_SETTINGS_BASE, data);
    if (response.success === true && response.data) {
      return response.data;
    }
    throw new Error(getErrorMessage(response, 'common.UnexpectedError'));
  },
};
