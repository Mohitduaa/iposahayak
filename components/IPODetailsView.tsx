import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  useColorScheme,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { X, TrendingUp, Building, Target, Search, Clock } from 'lucide-react-native';
import { router } from 'expo-router';
import { IPO } from '@/types';
import { apiUrl, fetchJson } from '@/services/api';
import { findRegistrarCompany, RegistrarCompany } from '@/services/registrar';
import { useSavedPANs } from '@/hooks/useSavedPANs';
import { track } from '@/services/analytics';

interface IPODetailsViewProps {
  ipo: IPO;
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

/**
 * The IPO sheet's contents, rendered as a plain screen.
 *
 * This used to be wrapped in a React Native `Modal`. On Android that creates a
 * separate dialog window, and on this RN version the window is laid out before
 * it has been sized — so opening the sheet flashed a small white box in the
 * top-left corner before snapping to full screen. Dropping the Modal and
 * pushing a route instead removes the extra window entirely, and the app
 * already navigates this way for the allotment results screen.
 */
export function IPODetailsView({ ipo, onClose }: IPODetailsViewProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const insets = useSafeAreaInsets();
  const [full, setFull] = useState<FullIPO | null>(null);
  const [loadingFull, setLoadingFull] = useState(false);

  const { savedPANs } = useSavedPANs();
  const [findingRegistrar, setFindingRegistrar] = useState(false);
  const [allotmentNote, setAllotmentNote] = useState<string>('');
  const [registrar, setRegistrar] = useState<RegistrarCompany | null>(null);

  // A registrar lists a company only once allotment is finalised, so its own
  // list is the honest answer to "is the result out". Looked up when the sheet
  // opens (the lists are cached) so the button can say so before it is tapped.
  useEffect(() => {
    let cancelled = false;
    track.ipoOpened(ipo.companyName, ipo.status);
    setRegistrar(null);
    setFindingRegistrar(true);

    (async () => {
      const company = await findRegistrarCompany(ipo.companyName, ipo.registrar);
      if (cancelled) return;
      setRegistrar(company);
      setFindingRegistrar(false);
    })();

    return () => {
      cancelled = true;
    };
  }, [ipo.companyName, ipo.registrar]);

  const allotmentReady = Boolean(registrar);

  /**
   * Opens the results on their own screen. Ten or fifteen saved PANs make a
   * list that does not belong inside a sheet already carrying the issue's
   * tables. The registrar publishes a company only once allotment is
   * finalised, so an unmatched lookup means the result is not out yet rather
   * than that something went wrong.
   */
  const runAllotmentCheck = () => {
    if (!registrar) return;

    if (savedPANs.length === 0) {
      setAllotmentNote('Add a PAN on the Allotment tab first.');
      return;
    }

    setAllotmentNote('');
    // The sheet has to go first, or it sits over the screen being pushed
    onClose();
    router.push({
      pathname: '/allotment-result',
      params: { name: ipo.companyName, company: registrar.value, type: registrar.companyType },
    } as never);
  };

  /** What the button says when there is nothing to check yet. */
  const waitingLabel = () => {
    if (findingRegistrar) return 'Checking availability…';
    if (ipo.allotment) return `Allotment on ${ipo.allotment}`;
    return 'Allotment not out yet';
  };

  // A different IPO in the same sheet must not keep the last one's message
  useEffect(() => {
    setAllotmentNote('');
  }, [ipo.id]);

  // The list endpoint strips the write-up, the analysis and the scraped data
  // blocks to keep the payload small, so the sheet asks for the whole record
  // once it is actually opened.
  useEffect(() => {
    if (!isObjectId(ipo.id)) {
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
  }, [ipo.id]);

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
    <View style={styles.container}>
        {/* Header */}
        <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
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

        {/* The one action this sheet offers, directly under the title and
            spelled out. A bare icon next to the close button gave no clue what
            it did, and the same button placed further down read as part of
            whichever table it landed between. */}
        <View style={styles.actionBar}>
          <TouchableOpacity
            style={[styles.checkButton, !allotmentReady && styles.checkButtonDisabled]}
            onPress={runAllotmentCheck}
            disabled={!allotmentReady}
            activeOpacity={0.85}
          >
            {findingRegistrar ? (
              <ActivityIndicator size="small" color={allotmentReady ? '#FFFFFF' : '#94A3B8'} />
            ) : allotmentReady ? (
              <Search size={18} color="#FFFFFF" />
            ) : (
              <Clock size={18} color={isDark ? '#94A3B8' : '#64748B'} />
            )}
            <Text style={[styles.checkButtonText, !allotmentReady && styles.checkButtonTextDisabled]}>
              {allotmentReady ? 'Check allotment' : waitingLabel()}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Why the allotment check could not run — right under the button that
            was tapped, not buried further down the sheet. */}
        {!!allotmentNote && (
          <View style={styles.noteBar}>
            <Text style={styles.noteText}>{allotmentNote}</Text>
          </View>
        )}

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
              {/*
                The table has to fit the screen — no sideways scrolling. Two
                things make that work at the largest system font: the columns
                share the row instead of sizing to their content, and the text
                is capped so it cannot grow past what a four-column table can
                hold. The cap applies to every cell equally, so the table keeps
                one type size rather than each cell shrinking on its own.

                The cap is 1: a four-column table of rupee figures has no room
                to grow, and the owner chose a small, intact table over a large
                broken one. Every other piece of text on the screen still scales
                with the system setting.
              */}
              <View style={styles.subscriptionTable}>
                {(section.headers || []).length > 0 && (
                  <View style={styles.subscriptionRow}>
                    {(section.headers || []).map((header, headerIndex) => (
                      <Text
                        key={headerIndex}
                        numberOfLines={2}
                        maxFontSizeMultiplier={1}
                        style={[
                          styles.subscriptionLabel,
                          headerIndex === 0 && styles.subscriptionFirstCol,
                        ]}
                      >
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
                        numberOfLines={2}
                        maxFontSizeMultiplier={1}
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
    paddingVertical: 14,
    paddingHorizontal: 10,
    // Without this the columns touch — "Subscribe" ran straight into
    // "May Apply" once the cells were flexed to share the row.
    gap: 6,
    borderBottomWidth: 1,
    borderBottomColor: isDark ? '#334155' : '#F1F5F9',
  },
  // These rows hold a table of unknown width: the number of columns comes from
  // the API. None of the cells could flex, so the columns did not share the row
  // — they ran together with no gap and the last one was cut off at the screen
  // edge ("Review BySubscribeMay ApplyNeut"). Giving every cell a share of the
  // row makes the table fit whatever it is handed, at any font size. The first
  // column is the row's name, so it reads left and gets a little more room.
  subscriptionLabel: {
    flex: 1,
    textAlign: 'center',
    fontSize: 13,
    fontWeight: '600',
    color: isDark ? '#F1F5F9' : '#1E293B',
  },
  subscriptionFirstCol: {
    flex: 1.4,
    textAlign: 'left',
  },
  subscriptionCategory: {
    flex: 1.4,
    fontSize: 13,
    color: isDark ? '#94A3B8' : '#64748B',
  },
  subscriptionValue: {
    flex: 1,
    textAlign: 'center',
    fontSize: 13,
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
  // Neither side could shrink before, so a long value — "73,96,437 shares
  // (agg. up to ₹500 Cr)" — ran straight off the right edge and was clipped
  // mid-word. It showed up at any font size on a narrow phone and on every
  // phone at the largest system font. The label keeps what it needs, the value
  // takes the rest and wraps inside the row.
  detailLabel: {
    fontSize: 14,
    color: isDark ? '#94A3B8' : '#64748B',
    flexShrink: 1,
    marginRight: 12,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: isDark ? '#F1F5F9' : '#1E293B',
    flex: 1,
    textAlign: 'right',
  },
  actionBar: {
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 4,
  },
  checkButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#1E40AF',
    paddingVertical: 13,
    borderRadius: 12,
  },
  // Reads as unavailable rather than as a dimmed primary button, so it is
  // clear the result is not out rather than that the tap failed.
  checkButtonDisabled: {
    backgroundColor: isDark ? '#1E293B' : '#F1F5F9',
    borderWidth: 1,
    borderColor: isDark ? '#334155' : '#E2E8F0',
  },
  checkButtonText: { color: '#FFFFFF', fontSize: 15, fontWeight: '600' },
  checkButtonTextDisabled: { color: isDark ? '#94A3B8' : '#64748B' },
  noteBar: {
    backgroundColor: isDark ? '#1E293B' : '#EFF6FF',
    borderBottomWidth: 1,
    borderBottomColor: isDark ? '#334155' : '#DBEAFE',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  noteText: {
    fontSize: 13,
    lineHeight: 19,
    color: isDark ? '#CBD5E1' : '#1E3A8A',
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