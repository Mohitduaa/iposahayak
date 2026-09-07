import { useState } from 'react';
import { AllotmentStatus } from '@/types';
import { apiUrl } from '@/services/api';
import { RegistrarType } from '@/services/registrar';

// Two registrars used to be checked here, each with its own request and its
// own way of reading the answer. The backend now checks any registrar and
// answers in one shape, so this only has to carry the result to the screen.

// Two of the registrars put a captcha in front of every lookup; a batch of
// PANs against one of those can take a while.
const TIMEOUT_MS = 120000;

interface CheckResponse {
  registrar?: string;
  results?: {
    pan: string;
    status: AllotmentStatus['status'];
    name?: string;
    applicationNo?: string;
    dpId?: string;
    applied?: number;
    allotted?: number;
    amount?: number;
    refund?: number;
    message?: string;
  }[];
  error?: string;
}

export function useAllotmentCheck() {
  const [loading, setLoading] = useState(false);

  const checkAllotment = async (
    panNumbers: string[],
    companyValue: string,
    companyType: RegistrarType,
    companyName?: string
  ): Promise<AllotmentStatus[]> => {
    setLoading(true);
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

    try {
      const response = await fetch(apiUrl('/allotment-check'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ companyType, companyValue, companyName, panNumbers }),
        signal: controller.signal,
      });

      const data: CheckResponse = await response.json().catch(() => ({}));

      if (!response.ok) {
        // The registrar itself was unreachable: say so against every PAN
        // rather than showing an empty screen
        const message = data?.error || `The registrar could not be reached (HTTP ${response.status})`;
        return panNumbers.map((pan) => ({ pan, status: 'error' as const, message }));
      }

      return (data.results || []).map((row) => ({
        pan: row.pan,
        status: row.status || 'unknown',
        name: row.name,
        applicationNo: row.applicationNo,
        dpId: row.dpId,
        shares: row.applied,
        allottedShares: row.allotted,
        amount: row.amount,
        refundAmount: row.refund,
        message: row.message,
      }));
    } catch (error: any) {
      console.error('Error checking allotment:', error?.message || error);
      const message =
        error?.name === 'AbortError'
          ? 'The registrar took too long to answer. Try again.'
          : 'Could not reach the server. Check your connection and try again.';
      return panNumbers.map((pan) => ({ pan, status: 'error' as const, message }));
    } finally {
      clearTimeout(timer);
      setLoading(false);
    }
  };

  return { checkAllotment, loading };
}
