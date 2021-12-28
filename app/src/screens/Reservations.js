import React, { useState, useEffect } from 'react'
import Background from '../components/Background'
import Card from "../components/Card"
import Header from "../components/Header"
import Button from "../components/Button"
import { StyleSheet, FlatList, TouchableOpacity, Text, Modal, View } from 'react-native'
import { theme } from "../core/theme"
import * as SecureStore from 'expo-secure-store'
import axios from 'axios'
import { API_URL } from "../core/globals"
import { Feather } from '@expo/vector-icons'
import QRCode from 'react-native-qrcode-svg'

export default function Reservations({ navigation }) {
  const [reservations, setReservations] = useState()
  const [showModal, setShowModal] = useState(false)
  const [selected, setSelectedReservation] = useState()
  const [refreshing, setRefreshing] = useState(false)
  const selectReseravtion = (reservation) => {
    setSelectedReservation(reservation)
    setShowModal(true)
  }
  const getReservations = async () => {
    try {
      let token = await SecureStore.getItemAsync('token')
      let response = await axios.get(`${API_URL}/reservations`, {headers: {Authorization: token}})
      setReservations(response.data)
    } catch(err) {
      console.error(err)
    }
  }
  const handleRefresh = () => {
    setRefreshing(true)
    getReservations()
    setRefreshing(false)
  }
  useEffect(() => {
    getReservations()
  }, [])
  return (
    <Background>
      <Modal animationType="slide" transparent={true} visible={showModal}>
        <View style={styles.centeredView}>
          {
            selected && (
              <View style={styles.modalView}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <Header>{selected.parking.name}</Header>
                  <Feather onPress={() => setShowModal(false)} name="x" size={28} color={theme.colors.danger} />
                </View>
                <View>
                  <Text style={styles.dateText}>Arrival: {new Date(selected.arrival).toLocaleString()}</Text>
                  { selected.departure && (
                      <Text style={styles.dateText}>Departure: {new Date(selected.arrival).toLocaleString()}</Text>
                    )
                  }
                </View>
                <View style={styles.code}>
                  <QRCode size={250} value={`${API_URL}/reservations/scan/${selected._id}`} />
                </View>
              </View>
            )
          }
        </View>
      </Modal>
      {
        reservations && reservations.length > 0 ? (
      <FlatList
        refreshing={refreshing}
        onRefresh={handleRefresh}
        style={styles.container}
        data={reservations}
        keyExtractor={item => item._id.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity 
            style={styles.pack}
            onPress={() => selectReseravtion(item)}
          >
            <Text style={styles.text}>
              <Text style={{ color: item.status == 'Canceled' ? theme.colors.danger : theme.colors.success }}>
                { item.status }
              </Text> - { item.parking.name }
            </Text>
          </TouchableOpacity>
        )}
      />
        ) : (
          <View style={{ ...styles.container, marginTop: 100 }}>
            <Text style={{ ...styles.text, fontSize: 25, marginBottom: 15 }}>You have no reservations.</Text>
            <Text style={{ ...styles.text, fontSize: 20, lineHeight: 30, marginBottom: 20 }}>Go to Find Parking and create one now!</Text>
            <Button mode='contained' onPress={handleRefresh}>
              { refreshing ? 'Loading..' : 'Refresh' }
            </Button>
          </View>
        )
      }
    </Background>
  )
}

const styles = StyleSheet.create({
  container: {
    height: '100%',
    width: '100%',
    flexGrow: 0,
    marginBottom: 20
  },
  pack: {
    borderWidth: 1,
    borderColor: theme.colors.primary,
    borderRadius: 5,
    padding: 10,
    marginVertical: 10,
  },
  dateText: {
    fontFamily: 'fira-regular',
    fontSize: 18,
    lineHeight: 30,
    textAlign: 'left',
    color: theme.colors.primary
  },
  text: {
    fontFamily: 'fira-regular',
    fontSize: 18,
    textAlign: 'center',
    textTransform: 'capitalize',
    color: theme.colors.primary
  },
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center"
  },
  modalView: {
    width: '90%',
    height: 500,
    marginBottom: 20,
    marginHorizontal: 30,
    backgroundColor: "white",
    borderRadius: 20,
    padding: 35,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5
  },
  code: {
    alignSelf: 'center',
    marginTop: 30
  }
})
