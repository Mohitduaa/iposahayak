import React from 'react';
import { View, Text, StyleSheet, useColorScheme, TouchableOpacity } from 'react-native';
import { CalendarClock, Clock, FileSearch, RefreshCw } from 'lucide-react-native';

interface EmptyStateProps {
  type: 'upcoming' | 'ongoing' | 'closed';
  onRefresh?: () => void;
}

/**
 * An empty list is a normal state, not a failure, so this is written to read
 * as an answer rather than an alarm.
 *
 * The previous version put a 100px saturated disc and an emoji heading over
 * "Check back soon", which is louder than the news deserves and says nothing
 * the heading has not. This keeps the card the rest of the screen uses, but
 * with a muted icon, plain wording, and a line that explains when the list
 * fills — the 5 PM close is the answer to "why is Live empty this evening".
 */
export function EmptyState({ type, onRefresh }: EmptyStateProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const styles = getStyles(isDark);

  const content = (() => {
    switch (type) {
      case 'upcoming':
        return {
          icon: <CalendarClock size={24} color={isDark ? '#93C5FD' : '#1E40AF'} />,
          tint: isDark ? 'rgba(59,130,246,0.14)' : '#EFF6FF',
          title: 'No upcoming IPOs',
          body: 'Nothing is lined up for subscription yet. New issues appear here as soon as their dates are announced.',
        };
      case 'ongoing':
        return {
          icon: <Clock size={24} color={isDark ? '#6EE7B7' : '#047857'} />,
          tint: isDark ? 'rgba(16,185,129,0.14)' : '#ECFDF5',
          title: 'No IPO is open right now',
          body: 'Bidding closes at 5:00 PM on the last day of an issue. The Upcoming tab has the ones still to come.',
        };
      case 'closed':
        return {
          icon: <FileSearch size={24} color={isDark ? '#FCD34D' : '#B45309'} />,
          tint: isDark ? 'rgba(245,158,11,0.14)' : '#FFFBEB',
          title: 'No results yet',
          body: 'Allotment shows up here once an issue closes and its registrar publishes the result, usually two working days later.',
        };
      default:
        return {
          icon: <FileSearch size={24} color={isDark ? '#94A3B8' : '#64748B'} />,
          tint: isDark ? '#334155' : '#F1F5F9',
          title: 'Nothing to show',
          body: 'There is no data for this view at the moment.',
        };
    }
  })();

  return (
    <View style={styles.wrapper}>
      <View style={styles.card}>
        <View style={[styles.iconTile, { backgroundColor: content.tint }]}>{content.icon}</View>

        <Text style={styles.title}>{content.title}</Text>
        <Text style={styles.body}>{content.body}</Text>

        {onRefresh && (
          <TouchableOpacity style={styles.refresh} onPress={onRefresh} activeOpacity={0.7}>
            <RefreshCw size={14} color={isDark ? '#94A3B8' : '#64748B'} />
            <Text style={styles.refreshText}>Refresh</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const getStyles = (isDark: boolean) =>
  StyleSheet.create({
    wrapper: {
      paddingHorizontal: 16,
      paddingTop: 32,
      paddingBottom: 24,
    },
    card: {
      backgroundColor: isDark ? '#1E293B' : '#FFFFFF',
      borderRadius: 16,
      borderWidth: 1,
      borderColor: isDark ? '#334155' : '#E2E8F0',
      paddingVertical: 32,
      paddingHorizontal: 24,
      alignItems: 'center',
    },
    iconTile: {
      width: 52,
      height: 52,
      borderRadius: 14,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 18,
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
      maxWidth: 300,
    },
    refresh: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      marginTop: 20,
      paddingHorizontal: 16,
      paddingVertical: 10,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: isDark ? '#334155' : '#E2E8F0',
    },
    refreshText: {
      fontSize: 14,
      fontWeight: '500',
      color: isDark ? '#CBD5E1' : '#475569',
    },
  });
