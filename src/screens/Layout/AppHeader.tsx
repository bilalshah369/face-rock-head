import React from 'react';
import {View, Text, TouchableOpacity, StyleSheet, Image} from 'react-native';

type Props = {
  title: string;
  onMenuPress: () => void;
  onProfilePress: () => void;
};

const AppHeader: React.FC<Props> = ({title, onMenuPress, onProfilePress}) => {
  return (
    <View style={styles.container}>
      {/* Left: Drawer Menu */}
      <TouchableOpacity onPress={onMenuPress} style={styles.iconButton}>
        <Image
          source={{
            uri: `https://package-tracking-files-prod.s3.eu-north-1.amazonaws.com/app_images/menunew.png`,
          }}
          style={{
            width: 40,
            height: 40,
            //tintColor: '#111827', // remove if icon already colored
          }}
          //resizeMode="contain"
        />
      </TouchableOpacity>

      {/* Center: Title */}
      <Text style={styles.title}>{title}</Text>

      {/* Right: Profile */}
      <TouchableOpacity onPress={onProfilePress} style={styles.iconButton}>
        <Image
          source={{
            uri: `https://package-tracking-files-prod.s3.eu-north-1.amazonaws.com/app_images/user_profile.png`,
          }}
          style={styles.icon}
          //resizeMode="contain"
        />
      </TouchableOpacity>
    </View>
  );
};
const styles = StyleSheet.create({
  container: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },

  iconButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },

  icon: {
    width: 80,
    height: 80,
    //tintColor: '#111827', // remove if icon already colored
  },

  title: {
    flex: 1,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
});

export default AppHeader;
