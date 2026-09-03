import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
  ActivityIndicator,
  useColorScheme,
} from 'react-native';
import { X, Calendar, TrendingUp, Users, Crown, Building, DollarSign, Target, Clock } from 'lucide-react-native';
import { IPO } from '@/types';
import { apiUrl, fetchJson } from '@/services/api';

interface IPODetailsModalProps {
  ipo: IPO;
  visible: boolean;
  onClose: () => void;
}

/** Everything the list response leaves out, fetched when the sheet opens. */
interface FullIPO {
  about?: string;
  subject?: string;
  detailUrl?: string;
  subscriptionCategories?: { category?: string; subscription?: string }[];
  sections?: { title?: string; headers?: string[]; rows?: string[][] }[];
  analysis?: {
    highlights?: { label: string; value: string; note?: string }[];
    paragraphs?: string[];
    strengths?: string[];
    risks?: string[];
  } | null;
}

const isObjectId = (value: string) => /^[0-9a-fA-F]{24}$/.test(value || '');

export function IPODetailsModal({ ipo, visible, onClose }: IPODetailsModalProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const [full, setFull] = useState<FullIPO | null>(null);
  const [loadingFull, setLoadingFull] = useState(false);

  // The list endpoint strips the write-up, the analysis and the scraped data
  // blocks to keep the payload small, so the sheet asks for the whole record
  // once it is actually opened.
  useEffect(() => {
    if (!visible || !isObjectId(ipo.id)) {
      setFull(null);
      return;
    }

    let cancelled = false;
    setLoadingFull(true);

    (async () => {
      const data = await fetchJson<{ ipo?: FullIPO }>(apiUrl(`/upcoming-ipos/${ipo.id}`));
      if (cancelled) return;
      setFull(data?.ipo || null);
      setLoadingFull(false);
    })();

    return () => {
      cancelled = true;
    };
  }, [visible, ipo.id]);

  const categories = (full?.subscriptionCategories || []).filter(
    (row) => row?.category || row?.subscription
  );

  // Only the tables an applicant actually needs, in the order they are useful.
  // The record also carries the generated analysis, the company write-up,
  // financials, KPIs and peer tables; those belong on the website, not in a
  // sheet someone opens to check a lot size.
  const WANTED_SECTIONS = [
    /^ipo details$/i,
    /reservation/i,
    /lot size/i,
    /^company address$/i,
  ];

  const sections = (full?.sections || []).filter((section) =>
    WANTED_SECTIONS.some((pattern) => pattern.test(String(section?.title || '')))
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'upcoming': return '#F59E0B';
      case 'ongoing': return '#10B981';
      case 'closed': return '#EF4444';
      case 'listed': return '#8B5CF6';
      default: return '#6B7280';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'upcoming': return 'Upcoming';
      case 'ongoing': return 'Live';
      case 'closed': return 'Closed';
      case 'listed': return 'Listed';
      default: return status;
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString || dateString === 'Will be announced soon') {
      return 'TBA';
    }
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return dateString; // Return original if can't parse
    }
    return date.toLocaleDateString('en-IN', { 
      day: '2-digit', 
      month: 'short',
      year: 'numeric'
    });
  };

  const styles = getStyles(isDark);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.companyName} numberOfLines={2}>
              {ipo.companyName}
            </Text>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(ipo.status) + '20' }]}>
              <Text style={[styles.statusText, { color: getStatusColor(ipo.status) }]}>
                {getStatusText(ipo.status)}
              </Text>
            </View>
          </View>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <X size={24} color={isDark ? '#F1F5F9' : '#1E293B'} />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* Key Stats */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Key Information</Text>
            <View style={styles.statsGrid}>
              <View style={styles.statCard}>
<Text style={{ fontSize: 20, color: '#10B981', fontWeight: 'bold' }}>₹</Text>
                <Text style={styles.statLabel}>Issue Price</Text>
                <Text style={styles.statValue}>{ipo.issuePrice}</Text>
              </View>
              <View style={styles.statCard}>
                <Target size={20} color="#F59E0B" />
                <Text style={styles.statLabel}>Lot Size</Text>
                <Text style={styles.statValue}>{ipo.lotSize}</Text>
              </View>
              <View style={styles.statCard}>
                <Building size={20} color="#8B5CF6" />
                <Text style={styles.statLabel}>Category</Text>
                <Text style={styles.statValue}>{ipo.category}</Text>
              </View>
              <View style={styles.statCard}>
                <TrendingUp size={20} color={ipo.gmp && ipo.gmp > 0 ? '#10B981' : '#EF4444'} />
                <Text style={styles.statLabel}>GMP</Text>
                <Text style={[styles.statValue, { color: ipo.gmp && ipo.gmp > 0 ? '#10B981' : '#EF4444' }]}>
                  ₹{ipo.gmp || 0}
                </Text>
              </View>
            </View>
          </View>

          {/* Timeline */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Timeline</Text>
            <View style={styles.timelineTable}>
              <View style={styles.timelineRow}>
                <Text style={styles.timelineLabel}>Event</Text>
                <Text style={styles.timelineLabel}>Date</Text>
              </View>
              <View style={styles.timelineRow}>
                <Text style={styles.timelineEvent}>Open Date</Text>
                <Text style={styles.timelineDate}>{formatDate(ipo.openDate)}</Text>
              </View>
              <View style={styles.timelineRow}>
                <Text style={styles.timelineEvent}>Close Date</Text>
                <Text style={styles.timelineDate}>{formatDate(ipo.closeDate)}</Text>
              </View>
              {!!ipo.allotment && (
                <View style={styles.timelineRow}>
                  <Text style={styles.timelineEvent}>Allotment Date</Text>
                  <Text style={styles.timelineDate}>{ipo.allotment}</Text>
                </View>
              )}
              {!!ipo.listingDate && (
                <View style={styles.timelineRow}>
                  <Text style={styles.timelineEvent}>Listing Date</Text>
                  <Text style={styles.timelineDate}>{ipo.listingDate}</Text>
                </View>
              )}
            </View>
          </View>

          {/* How the issue is split between categories — a share of the offer,
              not a subscription figure. These were previously printed as "35x",
              which read as an issue 35 times covered before a single bid. */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>IPO Reservation</Text>
            <View style={styles.subscriptionTable}>
              <View style={styles.subscriptionRow}>
                <Text style={styles.subscriptionLabel}>Category</Text>
                <Text style={styles.subscriptionLabel}>Share of issue</Text>
              </View>
              <View style={styles.subscriptionRow}>
                <Text style={styles.subscriptionCategory}>Retail</Text>
                <Text style={styles.subscriptionValue}>{ipo.quota?.retail ? `${ipo.quota.retail}%` : '—'}</Text>
              </View>
              <View style={styles.subscriptionRow}>
                <Text style={styles.subscriptionCategory}>QIB</Text>
                <Text style={styles.subscriptionValue}>{ipo.quota?.qib ? `${ipo.quota.qib}%` : '—'}</Text>
              </View>
              <View style={styles.subscriptionRow}>
                <Text style={styles.subscriptionCategory}>HNI</Text>
                <Text style={styles.subscriptionValue}>{ipo.quota?.hni ? `${ipo.quota.hni}%` : '—'}</Text>
              </View>
            </View>
          </View>

          {/* Category-wise figures straight from the exchange table */}
          {categories.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Category-wise Subscription</Text>
              <View style={styles.subscriptionTable}>
                <View style={styles.subscriptionRow}>
                  <Text style={styles.subscriptionLabel}>Category</Text>
                  <Text style={styles.subscriptionLabel}>Times subscribed</Text>
                </View>
                {categories.map((row, index) => (
                  <View style={styles.subscriptionRow} key={`${row.category}-${index}`}>
                    <Text style={styles.subscriptionCategory}>{row.category || '—'}</Text>
                    <Text style={styles.subscriptionValue}>{row.subscription || '—'}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* The live figures, shown only once bidding has produced some */}
          {ipo.hasSubscriptionData && categories.length === 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Subscription</Text>
              <View style={styles.subscriptionTable}>
                <View style={styles.subscriptionRow}>
                  <Text style={styles.subscriptionLabel}>Category</Text>
                  <Text style={styles.subscriptionLabel}>Times subscribed</Text>
                </View>
                <View style={styles.subscriptionRow}>
                  <Text style={styles.subscriptionCategory}>Retail</Text>
                  <Text style={styles.subscriptionValue}>
                    {ipo.subscription.retail ? `${ipo.subscription.retail}x` : '—'}
                  </Text>
                </View>
                <View style={styles.subscriptionRow}>
                  <Text style={styles.subscriptionCategory}>QIB</Text>
                  <Text style={styles.subscriptionValue}>
                    {ipo.subscription.qib ? `${ipo.subscription.qib}x` : '—'}
                  </Text>
                </View>
                <View style={styles.subscriptionRow}>
                  <Text style={styles.subscriptionCategory}>HNI</Text>
                  <Text style={styles.subscriptionValue}>
                    {ipo.subscription.hni ? `${ipo.subscription.hni}x` : '—'}
                  </Text>
                </View>
                {!!ipo.subscribed && (
                  <View style={styles.subscriptionRow}>
                    <Text style={styles.subscriptionCategory}>Overall</Text>
                    <Text style={styles.subscriptionValue}>{ipo.subscribed}x</Text>
                  </View>
                )}
              </View>
            </View>
          )}

          {/* Additional Details */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Additional Details</Text>
            <View style={styles.detailsList}>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Total Issue Size</Text>
                <Text style={styles.detailValue}>{ipo.totalIssueSize}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Face Value</Text>
                <Text style={styles.detailValue}>{ipo.faceValue ? `₹${ipo.faceValue}` : '—'}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Price Range</Text>
                <Text style={styles.detailValue}>{ipo.priceRange || '—'}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Registrar</Text>
                <Text style={styles.detailValue}>{ipo.registrar || '—'}</Text>
              </View>
              {!!full?.subject && (
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Subject</Text>
                  <Text style={styles.detailValue}>{full.subject}</Text>
                </View>
              )}
            </View>
          </View>

          {loadingFull && (
            <View style={styles.inlineLoader}>
              <ActivityIndicator size="small" color="#3B82F6" />
            </View>
          )}

          {/* Issue details, reservation, lot distribution and the address */}
          {sections.map((section, index) => (
            <View style={styles.section} key={`${section.title}-${index}`}>
              <Text style={styles.sectionTitle}>{section.title || 'Details'}</Text>
              <View style={styles.subscriptionTable}>
                {(section.headers || []).length > 0 && (
                  <View style={styles.subscriptionRow}>
                    {(section.headers || []).map((header, headerIndex) => (
                      <Text style={styles.subscriptionLabel} key={headerIndex} numberOfLines={2}>
                        {header}
                      </Text>
                    ))}
                  </View>
                )}
                {(section.rows || []).map((row, rowIndex) => (
                  <View style={styles.subscriptionRow} key={rowIndex}>
                    {row.map((cell, cellIndex) => (
                      <Text
                        key={cellIndex}
                        style={cellIndex === 0 ? styles.subscriptionCategory : styles.subscriptionValue}
                      >
                        {cell}
                      </Text>
                    ))}
                  </View>
                ))}
              </View>
            </View>
          ))}

          <View style={styles.lastSection} />
        </ScrollView>
      </View>
    </Modal>
  );
}

const getStyles = (isDark: boolean) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: isDark ? '#0F172A' : '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: 20,
    backgroundColor: isDark ? '#1E293B' : '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: isDark ? '#334155' : '#E2E8F0',
  },
  headerLeft: {
    flex: 1,
    marginRight: 16,
  },
  companyName: {
    fontSize: 20,
    fontWeight: '700',
    color: isDark ? '#F1F5F9' : '#1E293B',
    marginBottom: 8,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
  },
  closeButton: {
    padding: 4,
  },
  scrollView: {
    flex: 1,
  },
  section: {
    marginHorizontal: 20,
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: isDark ? '#F1F5F9' : '#1E293B',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  // Sized against the row it sits in, not against the screen. The old
  // minWidth was half the window width measured once at import, so inside a
  // sheet narrower than the window two cards never fitted on a line and every
  // one of them stretched to full width.
  statCard: {
    flexGrow: 1,
    flexBasis: '47%',
    minWidth: 130,
    backgroundColor: isDark ? '#1E293B' : '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: isDark ? '#334155' : '#E2E8F0',
  },
  statLabel: {
    fontSize: 12,
    color: isDark ? '#94A3B8' : '#64748B',
    marginTop: 8,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '600',
    color: isDark ? '#F1F5F9' : '#1E293B',
  },
  timelineTable: {
    backgroundColor: isDark ? '#1E293B' : '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: isDark ? '#334155' : '#E2E8F0',
    overflow: 'hidden',
  },
  timelineRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: isDark ? '#334155' : '#F1F5F9',
  },
  timelineLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: isDark ? '#F1F5F9' : '#1E293B',
  },
  timelineEvent: {
    fontSize: 14,
    color: isDark ? '#94A3B8' : '#64748B',
  },
  timelineDate: {
    fontSize: 14,
    fontWeight: '600',
    color: isDark ? '#F1F5F9' : '#1E293B',
  },
  subscriptionTable: {
    backgroundColor: isDark ? '#1E293B' : '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: isDark ? '#334155' : '#E2E8F0',
    overflow: 'hidden',
  },
  subscriptionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: isDark ? '#334155' : '#F1F5F9',
  },
  subscriptionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: isDark ? '#F1F5F9' : '#1E293B',
  },
  subscriptionCategory: {
    fontSize: 14,
    color: isDark ? '#94A3B8' : '#64748B',
  },
  subscriptionValue: {
    fontSize: 14,
    fontWeight: '600',
    color: isDark ? '#F1F5F9' : '#1E293B',
  },
  detailsList: {
    backgroundColor: isDark ? '#1E293B' : '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: isDark ? '#334155' : '#E2E8F0',
    overflow: 'hidden',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: isDark ? '#334155' : '#F1F5F9',
  },
  detailLabel: {
    fontSize: 14,
    color: isDark ? '#94A3B8' : '#64748B',
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: isDark ? '#F1F5F9' : '#1E293B',
  },
  inlineLoader: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  paragraph: {
    fontSize: 14,
    lineHeight: 21,
    color: isDark ? '#CBD5E1' : '#475569',
    marginTop: 12,
  },
  pointsBlock: {
    marginTop: 14,
  },
  pointsHeading: {
    fontSize: 14,
    fontWeight: '600',
    color: isDark ? '#F1F5F9' : '#1E293B',
    marginBottom: 6,
  },
  pointPositive: {
    fontSize: 13,
    lineHeight: 20,
    color: '#10B981',
    marginBottom: 4,
  },
  pointNegative: {
    fontSize: 13,
    lineHeight: 20,
    color: '#EF4444',
    marginBottom: 4,
  },
  lastSection: {
    marginBottom: 40,
  },
});