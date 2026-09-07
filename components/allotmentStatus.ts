import { AllotmentStatus } from '@/types';

/**
 * What each outcome is called and coloured, shared by the allotment tab, the
 * result screen and the results sheet so a PAN reads the same everywhere.
 */
export function describeStatus(status: AllotmentStatus['status'], isDark: boolean) {
  switch (status) {
    case 'allotted':
      return { label: 'Allotted', tone: '#10B981' };
    case 'not_allotted':
      return { label: 'Not allotted', tone: '#EF4444' };
    case 'no_record':
      return { label: 'No record', tone: isDark ? '#94A3B8' : '#64748B' };
    case 'error':
      return { label: 'Could not check', tone: '#F59E0B' };
    default:
      // The registrar returned the application but not a verdict
      return { label: 'Record found', tone: '#F59E0B' };
  }
}
