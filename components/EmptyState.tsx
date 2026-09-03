import React from 'react';
import { View, Text, StyleSheet, useColorScheme, TouchableOpacity } from 'react-native';
import { CalendarClock, Clock, FileSearch, ArrowRight, RefreshCw } from 'lucide-react-native';

interface EmptyStateProps {
  type: 'upcoming' | 'ongoing' | 'closed';
  onRefresh?: () => void;
  /** Lets the empty state point at the tab that does have something in it. */
  upcomingCount?: number;
  onGoToUpcoming?: () => void;
}

/**
 * An empty list is a normal state, not a failure, so this is written to read
 * as an answer rather than an alarm: a muted icon instead of a saturated
 * circle, the reason in plain words, and a way onward when one exists.
 *
 * The previous version announced "⏰ No Live IPOs" over a large green disc and
 * offered "Check Later", which said nothing the heading had not and left the
 * ten upcoming issues sitting one tab away unmentioned.
 */
export function EmptyState({ type, onRefresh, upcomingCount = 0, onGoToUpcoming }: EmptyStateProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const styles = getStyles(isDark);

  const content = (() => {
    switch (type) {
      case 'upcoming':
        return {
          icon: <CalendarClock size={26} color={isDark ? '#93C5FD' : '#1E40AF'} />,
          tint: isDark ? 'rgba(59,130,246,0.14)' : '#EFF6FF',
          title: 'No upcoming IPOs',
          body: 'Nothing has been announced for subscription yet. New issues appear here as soon as their dates are out.',
        };
      case 'ongoing':
        return {
          icon: <Clock size={26} color={isDark ? '#6EE7B7' : '#047857'} />,
          tint: isDark ? 'rgba(16,185,129,0.14)' : '#ECFDF5',
          title: 'No IPO is open right now',
          body:
            upcomingCount > 0
              ? `Bidding closes at 5:00 PM on the last day of an issue. ${upcomingCount} ${upcomingCount === 1 ? 'issue is' : 'issues are'} lined up next.`
              : 'Bidding closes at 5:00 PM on the last day of an issue. The next one will show up here when it opens.',
        };
      case 'closed':
        return {
          icon: <FileSearch size={26} color={isDark ? '#FCD34D' : '#B45309'} />,
          tint: isDark ? 'rgba(245,158,11,0.14)' : '#FFFBEB',
          title: 'No results yet',
          body: 'Allotment appears here once an issue closes and its registrar publishes the result — usually two working days later.',
        };
      default:
        return {
          icon: <FileSearch size={26} color={isDark ? '#94A3B8' : '#64748B'} />,
          tint: isDark ? '#334155' : '#F1F5F9',
          title: 'Nothing to show',
          body: 'There is no data for this view at the moment.',
        };
    }
  })();

  // Only offered when it actually leads somewhere
  const showUpcomingLink = type === 'ongoing' && upcomingCount > 0 && Boolean(onGoToUpcoming);

  return (
    <View style={styles.container}>
      <View style={[styles.iconTile, { backgroundColor: content.tint }]}>{content.icon}</View>

      <Text style={styles.title}>{content.title}</Text>
      <Text style={styles.body}>{content.body}</Text>

      {showUpcomingLink && (
        <TouchableOpacity style={styles.primary} onPress={onGoToUpcoming} activeOpacity={0.85}>
          <Text style={styles.primaryText}>See upcoming IPOs</Text>
          <ArrowRight size={16} color="#FFFFFF" />
        </TouchableOpacity>
      )}

      {onRefresh && (
        <TouchableOpacity style={styles.secondary} onPress={onRefresh} activeOpacity={0.7}>
          <RefreshCw size={14} color={isDark ? '#94A3B8' : '#64748B'} />
          <Text style={styles.secondaryText}>Refresh</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const getStyles = (isDark: boolean) =>
  StyleSheet.create({
    container: {
      alignItems: 'center',
      paddingHorizontal: 32,
      paddingTop: 56,
      paddingBottom: 40,
    },
    iconTile: {
      width: 56,
      height: 56,
      borderRadius: 16,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 20,
    },
    title: {
      fontSize: 17,
      fontWeight: '600',
      color: isDark ? '#F1F5F9' : '#1E293B',
      textAlign: 'center',
      marginBottom: 8,
    },
    body: {
      fontSize: 14,
      lineHeight: 21,
      color: isDark ? '#94A3B8' : '#64748B',
      textAlign: 'center',
      maxWidth: 320,
    },
    primary: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      backgroundColor: '#1E40AF',
      paddingHorizontal: 20,
      paddingVertical: 12,
      borderRadius: 12,
      marginTop: 24,
    },
    primaryText: { color: '#FFFFFF', fontSize: 15, fontWeight: '600' },
    secondary: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      paddingHorizontal: 12,
      paddingVertical: 10,
      marginTop: 12,
    },
    secondaryText: {
      fontSize: 14,
      fontWeight: '500',
      color: isDark ? '#94A3B8' : '#64748B',
    },
  });
