import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  useColorScheme,
  Platform,
  Share,
  Linking,
  Modal,
  ActivityIndicator,
} from 'react-native';
import { Calendar, TrendingUp, Users, Crown, Clock, Share2 } from 'lucide-react-native';
import ViewShot from 'react-native-view-shot';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { WebView } from 'react-native-webview';
import { IPO } from '@/types';
import { IPODetailsModal } from '@/components/IPODetailsModal';
import Animated, {
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

// Only the first screenful cascades in. Beyond that a card is entering because
// the list scrolled, and a fresh animation on every scroll reads as flicker.
const STAGGERED_CARDS = 8;

interface IPOCardProps {
  ipo: IPO;
  /** Position in the list, for the staggered entrance. */
  index?: number;
}

export function IPOCard({ ipo, index = 0 }: IPOCardProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const [showDetails, setShowDetails] = useState(false);
  const [countdown, setCountdown] = useState<string | null>(ipo.timeLeft || null);
  const [showWebView, setShowWebView] = useState(false);
  const [webViewUrl, setWebViewUrl] = useState<string | null>(null);
  const [loadingWebView, setLoadingWebView] = useState(true);

  const viewShotRef = useRef<ViewShot>(null);

  const isValidUrl = (url: string) => {
    return /^https?:\/\/.+/.test(url);
  };

  useEffect(() => {
    if (ipo.status !== 'ongoing') return;

    const closeDate = new Date(ipo.closeDate);
    closeDate.setHours(17, 0, 0, 0);

    const updateCountdown = () => {
      const now = new Date();
      const diffMs = closeDate.getTime() - now.getTime();

      if (diffMs <= 0) {
        setCountdown(null);
        return;
      }

      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

      if (diffDays > 1) {
        setCountdown(`${diffDays} days left`);
      } else if (diffDays === 1 && diffHours === 0) {
        setCountdown('Last day');
      } else if (diffDays === 0 && diffHours === 0 && diffMinutes <= 59) {
        setCountdown(`Last ${diffMinutes} min`);
      } else if (diffDays === 0) {
        setCountdown(`${diffHours}h ${diffMinutes}m left`);
      } else {
        setCountdown('Last day');
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 60000);
    return () => clearInterval(interval);
  }, [ipo.closeDate, ipo.status]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'upcoming':
        return '#F59E0B';
      case 'ongoing':
        return '#10B981';
      case 'closed':
        return '#EF4444';
      case 'listed':
        return '#8B5CF6';
      default:
        return '#6B7280';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'upcoming':
        return 'Upcoming';
      case 'ongoing':
        return 'Live';
      case 'closed':
        return 'Closed';
      case 'listed':
        return 'Listed';
      default:
        return status;
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    if (dateString === 'Will be announced soon') return dateString;
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Will be announced soon';
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const handleShare = async () => {
    try {
      if (viewShotRef.current && typeof viewShotRef.current.capture === 'function') {
        const uri = await viewShotRef.current.capture();
        
        const shareMessage = `${ipo.companyName || ''} (${ipo.category || ''})\n\nIPO Date: ${formatDate(
          ipo.openDate
        )} - ${formatDate(ipo.closeDate)}\nPrice: ₹${ipo.issuePrice || ''}\nLot Size: ${
          ipo.lotSize || ''
        } shares\n\nHey, I'm using IPO Sahayak App to see all IPO Details and Live Premium.\nDownload for free:\nhttps://www.iposahayak.com/download`;

        const fileName = `${FileSystem.cacheDirectory}ipo-${Date.now()}.jpg`;
        await FileSystem.copyAsync({ from: uri, to: fileName });
        
        await Share.share({
          message: shareMessage,
          url: `file://${fileName}`,
        });
      }
    } catch (error: any) {
      console.error('Error sharing IPO:', error.message);
    }
  };

  const hasRibbon = Boolean(ipo.listedToday || ipo.allotmentToday);

  // A slight settle under the finger, so a tap feels acknowledged before the
  // sheet opens
  const pressed = useSharedValue(1);
  const pressStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pressed.value }],
  }));

  const styles = getStyles(isDark);

  return (
    <>
      <ViewShot ref={viewShotRef} options={{ format: 'jpg', quality: 0.9 }}>
        <Animated.View
          entering={
            index < STAGGERED_CARDS
              ? FadeInDown.duration(260).delay(index * 45)
              : undefined
          }
          style={pressStyle}
        >
        <TouchableOpacity
          style={styles.container}
          onPress={() => setShowDetails(true)}
          onPressIn={() => {
            pressed.value = withSpring(0.98, { damping: 18, stiffness: 260 });
          }}
          onPressOut={() => {
            pressed.value = withSpring(1, { damping: 18, stiffness: 260 });
          }}
          activeOpacity={0.9}
        >
          {/* A corner ribbon rather than another pill among the badges: it is
              true for one day only, so it should read before anything else on
              the card. Its top-right radius matches the card's so it sits
              flush in the corner. */}
          {ipo.listedToday ? (
            <View style={[styles.ribbon, styles.ribbonListed]}>
              <Text style={styles.ribbonText}>Listed Today</Text>
            </View>
          ) : ipo.allotmentToday ? (
            <View style={[styles.ribbon, styles.ribbonAllotment]}>
              <Text style={styles.ribbonText}>Allotment Today</Text>
            </View>
          ) : null}

          {ipo.status === 'ongoing' && !!countdown && (
            <View style={styles.detailRoww}>
              <Clock size={16} color="red" />
              <Text
                style={[
                  styles.countdownText,
                  countdown === 'Last day' && { fontWeight: 'bold', color: 'red' },
                ]}
              >
                {countdown}
              </Text>
            </View>
          )}

          {/* The ribbon sits over the top-right corner, where the share button
              is, so the header starts below it when one is showing. */}
          <View style={[styles.header, hasRibbon && styles.headerWithRibbon]}>
            <View style={styles.companyInfo}>
              <Text style={styles.companyName} numberOfLines={1}>
                {ipo.companyName || ''}
              </Text>
              <Text style={styles.category}>{ipo.category || ''}</Text>
            </View>

            <View style={{ alignItems: 'flex-end' }}>
              <TouchableOpacity onPress={handleShare} style={styles.shareIconButton}>
                <Share2 size={24} color="#F59E0B" />
              </TouchableOpacity>

              <View
                style={[
                  styles.statusBadge,
                  { backgroundColor: getStatusColor(ipo.status) + '20' },
                ]}
              >
                <Text style={[styles.statusText, { color: getStatusColor(ipo.status) }]}>
                  {getStatusText(ipo.status)}
                </Text>
              </View>

            </View>
          </View>

          <View style={styles.details}>
            <View style={styles.detailRow}>
              <Calendar size={16} color={isDark ? '#94A3B8' : '#64748B'} />
              <Text style={styles.detailText}>
                {ipo.openDate === 'Will be announced soon' ? 
                  'Will be announced soon' : 
                  `${formatDate(ipo.openDate)} - ${formatDate(ipo.closeDate)}`
                }
              </Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Issue Price:</Text>
              <Text style={styles.detailValue}>{ipo.issuePrice || ''}</Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Allotment Date:</Text>
              <Text style={styles.detailValue}>{ipo.allotment || ''}</Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Listing Date:</Text>
              <Text style={styles.detailValue}>{ipo.listingDate || ''}</Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Lot Size:</Text>
              <Text style={styles.detailValue}>{String(ipo.lotSize || 0)} shares</Text>
            </View>
            
            {/* Profit Per Lot */}
            {!!(ipo.gmp && ipo.issuePrice && ipo.lotSize) && (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Profit Per lot:</Text>
                <Text style={[
                  styles.detailValue,
                  { color: ipo.gmp > 0 ? '#10B981' : '#EF4444', fontWeight: '700' }
                ]}>
                  ₹{(() => {
                    const gmp = Number(ipo.gmp) || 0;
                    const lotSize = Number(ipo.lotSize?.toString().replace(/[^0-9]/g, '')) || 0;
                    const profit = gmp * lotSize;
                    return isNaN(profit) ? '0' : profit.toLocaleString();
                  })()}
                </Text>
              </View>
            )}
                      
         {ipo.status === 'closed' && (
  <View style={styles.allotmentSection}>
    <TouchableOpacity
      style={[
        styles.allotmentButton,
        !isValidUrl(ipo.allotmentout || '') && styles.disabledButton,
      ]}
      disabled={!isValidUrl(ipo.allotmentout || '')}
      onPress={() => {
        if (isValidUrl(ipo.allotmentout || '')) {
          setWebViewUrl(ipo.allotmentout || '');
          setShowWebView(true);
        }
      }}
    >
      <Text style={styles.allotmentButtonText}>
        {isValidUrl(ipo.allotmentout || '') ? 'View Allotment' : 'Waiting for Allotment'}
      </Text>
    </TouchableOpacity>
  </View>
)}

          </View>

          <View style={styles.footer}>
            <View style={styles.gmpSection}>
              <TrendingUp
                size={16}
                color={ipo.gmp && ipo.gmp > 0 ? '#10B981' : '#EF4444'}
              />
              <Text style={styles.gmpLabel}>GMP:</Text>
              <Text
                style={[
                  styles.gmpValue,
                  { color: ipo.gmp && ipo.gmp > 0 ? '#10B981' : '#EF4444' },
                ]}
              >
                ₹{String(ipo.gmp || 0)} ({ipo.gain || '0%'})
              </Text>
            </View>

            <View style={styles.subscriptionSection}>
              <Users size={16} color={isDark ? '#94A3B8' : '#64748B'} />
              <Text style={styles.subscriptionText}>{String(ipo.subscribed || 0)}</Text>
              {ipo.subscription?.retail > 50 && <Crown size={14} color="#F59E0B" />}
            </View>
          </View>

          
          {/* Board Type Badge */}
          <View style={[
            styles.boardTypeBadge,
            ipo.category === 'SME' ? styles.smeBadge : styles.mainboardBadge
          ]}>
            <Text style={styles.boardTypeText}>
              {ipo.category === 'SME' ? 'SME' : 'Mainboard'}
            </Text>
          </View>
        </TouchableOpacity>
        </Animated.View>
      </ViewShot>

      <IPODetailsModal ipo={ipo} visible={showDetails} onClose={() => setShowDetails(false)} />

      <Modal
        visible={showWebView}
        animationType="slide"
        onRequestClose={() => setShowWebView(false)}
      >
        <View style={{ flex: 1 }}>
          {loadingWebView && (
            <ActivityIndicator
              size="large"
              style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                marginLeft: -25,
                marginTop: -25,
                zIndex: 10,
              }}
            />
          )}
          <WebView
            source={{ uri: webViewUrl || '' }}
            style={{ flex: 1, backgroundColor: 'transparent' }}
            onLoadStart={() => setLoadingWebView(true)}
            onLoadEnd={() => setLoadingWebView(false)}
          />
          <TouchableOpacity
            style={{
              position: 'absolute',
              top: 40,
              right: 20,
              backgroundColor: '#1E40AF',
              padding: 10,
              borderRadius: 20,
            }}
            onPress={() => setShowWebView(false)}
          >
            <Text style={{ color: 'white', fontWeight: 'bold'    }}>Close</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </>
  );
}

const getStyles = (isDark: boolean) =>
  StyleSheet.create({
    container: {
      backgroundColor: isDark ? '#1E293B' : '#FFFFFF',
      borderRadius: 16,
      padding: 16,
      elevation: 2,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      borderWidth: 1,
      borderColor: isDark ? '#334155' : '#E2E8F0',
      marginBottom: 2,
    },
    headerWithRibbon: {
      marginTop: 22,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 12,
    },
    companyInfo: {
      flex: 1,
      marginRight: 12,
    },
    companyName: {
      fontSize: 18,
      fontWeight: '600',
      color: isDark ? '#F1F5F9' : '#1E293B',
      marginBottom: 8,
    },
    category: {
      fontSize: 14,
      color: isDark ? '#94A3B8' : '#64748B',
    },
    shareIconButton: {
      marginLeft: 'auto',
      padding: 8,
    },
    ribbon: {
      position: 'absolute',
      top: -1,
      right: -1,
      paddingHorizontal: 14,
      paddingVertical: 7,
      // Matches the card corner so it sits flush, and curves away on the
      // inside edge like a ribbon folded over the top
      borderTopRightRadius: 16,
      borderBottomLeftRadius: 14,
      zIndex: 2,
      elevation: 3,
    },
    ribbonListed: { backgroundColor: '#EF4444' },
    ribbonAllotment: { backgroundColor: '#F59E0B' },
    ribbonText: {
      fontSize: 12,
      fontWeight: '700',
      color: '#FFFFFF',
      letterSpacing: 0.2,
    },
    statusBadge: {
      alignSelf: 'flex-start',
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 12,
      marginTop: 4,
    },
    statusText: {
      fontSize: 12,
      fontWeight: '600',
    },
    details: {
      gap: 8,
      marginBottom: 16,
    },
    detailRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    detailText: {
      fontSize: 14,
      color: isDark ? '#94A3B8' : '#64748B',
    },
    detailLabel: {
      fontSize: 14,
      color: isDark ? '#94A3B8' : '#64748B',
    },
    detailValue: {
      fontSize: 14,
      fontWeight: '500',
      color: isDark ? '#F1F5F9' : '#1E293B',
      marginLeft: 'auto',
    },
    countdownText: {
      fontSize: 16,
      fontWeight: '500',
      color: 'red',
    },
    
    allotmentButton: {
  backgroundColor: '#2cb756', // Green color for active button
  paddingVertical: 12,
  paddingHorizontal: 24,
  borderRadius: 8,
  minWidth: 180,
  alignItems: 'center',
},
disabledButton: {
  backgroundColor: '#9CA3AF', // Gray color when disabled
},
    allotmentButtonText: {
      color: '#FFFFFF',
      fontSize: 16,
      fontWeight: '600',
      textAlign: 'center',
    },
    allotmentSection: {
      marginTop: 8,
      alignItems: 'center',
    },
    footer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingTop: 12,
      borderTopWidth: 1,
      borderTopColor: isDark ? '#334155' : '#E2E8F0',
    },
    gmpSection: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    gmpLabel: {
      fontSize: 14,
      color: isDark ? '#94A3B8' : '#64748B',
    },
    gmpValue: {
      fontSize: 14,
      fontWeight: '600',
    },
    subscriptionSection: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    subscriptionText: {
      fontSize: 14,
      fontWeight: '500',
      color: isDark ? '#F1F5F9' : '#1E293B',
    },
    
    detailRoww: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      marginTop: 4,
    },
    boardTypeBadge: {
      marginTop: 12,
      paddingVertical: 8,
      borderTopWidth: 1,
      borderTopColor: isDark ? '#334155' : '#E2E8F0',
      alignItems: 'center',
      marginHorizontal: -16,
      marginBottom: -16,
      borderBottomLeftRadius: 16,
      borderBottomRightRadius: 16,
    },
    mainboardBadge: {
      backgroundColor: isDark ? '#60A5FA' : '#3B82F6',
    },
    smeBadge: {
      backgroundColor: isDark ? '#FB923C' : '#EA580C',
    },
    boardTypeText: {
      fontSize: 12,
      fontWeight: '600',
      color: '#FFFFFF',
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },

  });
