import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch } from 'react-native';
import { User, Settings, Heart, MapPin, CreditCard, Bell, CircleHelp as HelpCircle, LogOut, ChevronRight, Moon, Download } from 'lucide-react-native';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import updateService from '@/services/updateService';

export default function AccountScreen() {
  const router = useRouter();
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState(true);

  const menuItems = [
    {
      id: 'profile',
      title: 'Edit Profile',
      icon: User,
      onPress: () => router.push('/profile'),
    },
    {
      id: 'addresses',
      title: 'Shipping Addresses',
      icon: MapPin,
      onPress: () => router.push('/addresses'),
    },
    {
      id: 'payment',
      title: 'Payment Methods',
      icon: CreditCard,
      onPress: () => router.push('/payment-methods'),
    },
    {
      id: 'wishlist',
      title: 'Wishlist',
      icon: Heart,
      onPress: () => router.push('/wishlist'),
    },
  ];

  const settingsItems = [
    {
      id: 'notifications',
      title: 'Push Notifications',
      icon: Bell,
      type: 'switch',
      value: notifications,
      onToggle: setNotifications,
    },
    {
      id: 'darkmode',
      title: 'Dark Mode',
      icon: Moon,
      type: 'switch',
      value: darkMode,
      onToggle: setDarkMode,
    },
    {
      id: 'settings',
      title: 'App Settings',
      icon: Settings,
      type: 'navigation',
      onPress: () => router.push('/settings'),
    },
    {
      id: 'updates',
      title: 'Check for Updates',
      icon: Download,
      type: 'navigation',
      onPress: () => updateService.forceCheckForUpdates(),
    },
  ];

  const supportItems = [
    {
      id: 'help',
      title: 'Help & Support',
      icon: HelpCircle,
      onPress: () => router.push('/help'),
    },
  ];

  const handleLogout = () => {
    // TODO: Implement logout logic
    router.push('/welcome');
  };

  const renderMenuItem = (item: any) => (
    <TouchableOpacity key={item.id} style={styles.menuItem} onPress={item.onPress}>
      <View style={styles.menuItemLeft}>
        <View style={styles.iconContainer}>
          <item.icon size={20} color="#007AFF" />
        </View>
        <Text style={styles.menuItemText}>{item.title}</Text>
      </View>
      <ChevronRight size={20} color="#8E8E93" />
    </TouchableOpacity>
  );

  const renderSettingsItem = (item: any) => (
    <View key={item.id} style={styles.menuItem}>
      <View style={styles.menuItemLeft}>
        <View style={styles.iconContainer}>
          <item.icon size={20} color="#007AFF" />
        </View>
        <Text style={styles.menuItemText}>{item.title}</Text>
      </View>
      {item.type === 'switch' ? (
        <Switch
          value={item.value}
          onValueChange={item.onToggle}
          trackColor={{ false: '#E5E5EA', true: '#007AFF' }}
          thumbColor="#FFFFFF"
        />
      ) : (
        <TouchableOpacity onPress={item.onPress}>
          <ChevronRight size={20} color="#8E8E93" />
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Account</Text>
      </View>

      {/* User Profile */}
      <View style={styles.profileSection}>
        <View style={styles.profileInfo}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>JD</Text>
          </View>
          <View style={styles.userDetails}>
            <Text style={styles.userName}>John Doe</Text>
            <Text style={styles.userEmail}>john.doe@example.com</Text>
            <Text style={styles.memberSince}>Member since Jan 2024</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.editButton} onPress={() => router.push('/profile')}>
          <Text style={styles.editButtonText}>Edit</Text>
        </TouchableOpacity>
      </View>

      {/* Account Menu */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account</Text>
        <View style={styles.menuContainer}>
          {menuItems.map(renderMenuItem)}
        </View>
      </View>

      {/* Settings */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Settings</Text>
        <View style={styles.menuContainer}>
          {settingsItems.map(renderSettingsItem)}
        </View>
      </View>

      {/* Support */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Support</Text>
        <View style={styles.menuContainer}>
          {supportItems.map(renderMenuItem)}
        </View>
      </View>

      {/* Logout */}
      <View style={styles.section}>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <LogOut size={20} color="#FF3B30" />
          <Text style={styles.logoutText}>Sign Out</Text>
        </TouchableOpacity>
      </View>

      {/* App Version */}
      <View style={styles.footer}>
        <Text style={styles.versionText}>OpenCart Mobile v1.0.0</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1D1D1F',
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 20,
    backgroundColor: '#F2F2F7',
    marginHorizontal: 20,
    borderRadius: 16,
    marginBottom: 32,
  },
  profileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#007AFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  avatarText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1D1D1F',
  },
  userEmail: {
    fontSize: 14,
    color: '#8E8E93',
    marginTop: 2,
  },
  memberSince: {
    fontSize: 12,
    color: '#8E8E93',
    marginTop: 4,
  },
  editButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  editButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1D1D1F',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  menuContainer: {
    backgroundColor: '#F2F2F7',
    marginHorizontal: 20,
    borderRadius: 16,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F7',
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#F2F2F7',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  menuItemText: {
    fontSize: 16,
    color: '#1D1D1F',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F2F2F7',
    marginHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 16,
    gap: 8,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#FF3B30',
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 20,
    marginBottom: 100,
  },
  versionText: {
    fontSize: 12,
    color: '#8E8E93',
  },
});