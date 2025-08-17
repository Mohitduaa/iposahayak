import { useState } from 'react';

export type AllotmentStatus = {
  pan: string;
  status: 'allotted' | 'not_allotted' | 'no_record';
  shares?: number;
  amount?: number;
  refundAmount?: number;
  applicationNo?: string;
  name?: string;
  dpId?: string;
};

export function useAllotmentCheck() {
  const [loading, setLoading] = useState(false);

  const checkAllotment = async (
    panNumbers: string[],
    companyValue: string
  ): Promise<AllotmentStatus[]> => {
    setLoading(true);
    try {
      const mufgResponse = await fetch(
        'https://rechat.sbs/mufg-ipo-allotment',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ panNumbers, companyValue }),
        }
      );

      const bigshareResponse = await fetch(
        'https://rechat.sbs/bigshare-multi-pan',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ panNumbers, companyValue }),
        }
      );

      const mufgData = mufgResponse.ok ? await mufgResponse.json() : { results: [] };
      const bigshareData = bigshareResponse.ok ? await bigshareResponse.json() : { results: [] };

      const finalResults: AllotmentStatus[] = [];

      // Handle MUFG response
      if (Array.isArray(mufgData.results)) {
        for (const item of mufgData.results) {
          const allotment = item.allotment;

          if (!allotment || allotment === 'No Record Found') {
            finalResults.push({
              pan: item.pan,
              status: 'no_record',
            });
            continue;
          }

          const allotmentsArray = Array.isArray(allotment) ? allotment : [allotment];

          for (const record of allotmentsArray) {
            if (parseInt(record.ALLOT || '0') > 0) {
              finalResults.push({
                pan: item.pan,
                status: 'allotted',
                shares: parseInt(record.ALLOT || '0'),
                amount: parseInt(record.AMTADJ || '0'),
                refundAmount: parseInt(record.RFNDAMT || '0'),
              });
            } else {
              finalResults.push({
                pan: item.pan,
                status: 'not_allotted',
                refundAmount: parseInt(record.RFNDAMT || '0'),
              });
            }
          }
        }
      }

      // Handle Bigshare response
      if (Array.isArray(bigshareData.results)) {
        for (const item of bigshareData.results) {
          finalResults.push({
            pan: item.pan,
            applicationNo: item.applicationNo,
            dpId: item.dpId,
            name: item.name,
            shares: item.applied,
            status: item.allotted === 'ALLOTTE' ? 'allotted' : 'not_allotted',
          });
        }
      }

      return finalResults;
    } catch (error) {
      console.error('Error checking allotment:', error);
      return [];
    } finally {
      setLoading(false);
    }
  };

  return { checkAllotment, loading };
}
