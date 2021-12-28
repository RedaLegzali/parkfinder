import React from 'react'
import { StyleSheet, TouchableOpacity, Text } from 'react-native'
import { theme } from "../core/theme"
import { Feather } from '@expo/vector-icons';

const Alert = ({ alert, dismissAlert }) => {
  const styles = StyleSheet.create({
    icon: {
      position: 'absolute',
      right: 16
    },
    container: {
      justifyContent: 'center',
      flexDirection: 'row',
      width: '100%',
      borderWidth: 1,
      borderRadius: 6,
      alignItems: 'center',
      alignContent: 'center',
      padding: 10,
      borderColor: alert.success ? theme.colors.success : theme.colors.danger,
    },
    alert: {
      textAlign: 'center',
      fontSize: 18,
      fontFamily: 'fira-regular',
      color: alert.success ? theme.colors.success : theme.colors.danger,
    }
  })
    return (
      <TouchableOpacity onPress={dismissAlert} style={styles.container}>
        <Text style={styles.alert}> {alert.value} </Text>
      </TouchableOpacity>
    )
}

export default Alert
