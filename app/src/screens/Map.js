import React, { useState, useEffect } from 'react';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';
import { Alert as PopAlert, Keyboard, Pressable, Image, Modal, StyleSheet, Text, View, Dimensions } from 'react-native';
import * as Location from 'expo-location'
import Header from "../components/Header"
import Button from "../components/Button"
import Paragraph from "../components/Paragraph"
import TextInput from "../components/TextInput"
import Alert from "../components/Alert"
import { API_URL, API_KEY } from "../core/globals"
import { decode } from "../core/decoder"
import axios from "axios"
import * as SecureStore from 'expo-secure-store'
import { theme } from "../core/theme"
import { Feather, Ionicons } from '@expo/vector-icons'

const Map = () => {
  const [location, setLocation] = useState()
  const [marker, setMarker] = useState()
  const [destination, setDestination] = useState(false)
  const [polyline, setPolyline] = useState()
  const [showAlert, setShowAlert] = useState(false)
  const [alert, setAlert] = useState({ success: false, value: '' })
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState()
  const [parkings, setParkings] = useState()
  const [token, setToken] = useState()
  const [showModal, setShowModal] = useState(false)
  const [selected, setSelectedParking] = useState({})
  const [licensePlate, setLicensePlate] = useState({ value: '', error: '' })
  const [keyboard, setKeyboard] = useState(false)
  const [parkingInterval, setParkingInterval] = useState()
  const [reservation, setReservation] = useState()
  
  const launchAlert = () => {
    PopAlert.alert( "Are you sure ?", "If you cancel your reservation you will pay a 10 DH penalty",
      [ 
        { text: "Cancel", style: "destructive", onPress: cancelReservation },
        { text: "Resume", style: "default" }
      ])
  }
  const createReservation = async () => {
    try {
      let response = await axios.post(`${API_URL}/reservations`, { parking: selected._id, licensePlate: licensePlate.value }, { headers: { Authorization: token } })
      setReservation(response.data.reservation)
      setLicensePlate({ value: '', error: '' })
      setShowAlert(true)
      setAlert({ value: response.data.message, success: true })
      setShowModal(false)
      let res = await axios.get(`https://router.hereapi.com/v8/routes?transportMode=car&origin=${marker.latitude},${marker.longitude}&destination=${selected.latitude},${selected.longitude}&return=polyline&apiKey=${API_KEY}`)
      let data = decode(res.data.routes[0].sections[0].polyline)
      let polyline = data.polyline.map(coord => {
        return { latitude: coord[0], longitude: coord[1] }
      })
      setPolyline(polyline)
      setDestination({latitude: selected.latitude, longitude: selected.longitude })
      setLocation({latitude: marker.latitude, longitude: marker.longitude, latitudeDelta: 0.004, longitudeDelta: 0.003})
      setShowAlert(false)
    } catch(err) {
      let errors = err.response.data
      for (let key in errors) {
        let value = errors[key]
        switch (key) {
          case 'licensePlate':
            setLicensePlate({ ...licensePlate, error: errors.licensePlate })
            break
          default:
            setShowAlert(true)
            setAlert({ value, success: false })
        }
      }
    }
  }
  const cancelReservation = async () => {
    try {
      let response = await axios.delete(`${API_URL}/reservations/${reservation._id}`, { headers: { Authorization: token } })
      setDestination(false)
      setPolyline(false)
      setShowModal(false)
    } catch(err) {
      console.log(err)
    }
  }
  const selectParking = async (parking) => {
    try {
      let response = await axios.get(`https://router.hereapi.com/v8/routes?transportMode=car&origin=${marker.latitude},${marker.longitude}&destination=${parking.latitude},${parking.longitude}&return=travelSummary&apiKey=${API_KEY}`
      )
      let duration = response.data.routes[0].sections[0].travelSummary.duration / 60
      let length = response.data.routes[0].sections[0].travelSummary.length / 1000
      duration = parseFloat(duration.toFixed(0))
      length = parseFloat(length.toFixed(1))
      setSelectedParking({...parking, duration, length})
      setShowModal(true)
    } catch(err) {
      console.log(err)
    }
  }
  const getToken = async () => {
    let token = await SecureStore.getItemAsync('token')
    setToken(token)
  }
  const getUser = async () => {
    let response = await axios.get(`${API_URL}/profile`, {headers: {Authorization: token}})
    setUser(response.data.username)
  }
  const getParkings = async (value) => {
    if (!value) {
      let response = await axios.get(`${API_URL}/parkings`, {headers: {Authorization: token}})
      setParkings(response.data)
    }
  }
  const getLocation = async () => {
    let { status } = await Location.requestPermissionsAsync()
    if (status !== 'granted') {
      setAlert({ success: false, value: 'Location permission denied' })
      setLoading(false)
    } else {
      let geolocation = await Location.getCurrentPositionAsync({})
      if (!location) {
        setLocation({latitude: geolocation.coords.latitude, longitude: geolocation.coords.longitude, latitudeDelta: 0.004, longitudeDelta: 0.003})
      }
      setMarker({latitude: geolocation.coords.latitude, longitude: geolocation.coords.longitude })
      setLoading(false)
    }
  }

  useEffect(() => {
    Keyboard.addListener('keyboardDidShow', () => setKeyboard(true))
    Keyboard.addListener('keyboardDidHide', () => setKeyboard(false))
    getToken()
    getLocation()
    getParkings()
  }, [])
  useEffect(() => {
    if (parkingInterval) { clearInterval(parkingInterval) } 
    let value = showModal || destination
    const interval = setInterval(() => getParkings(value), 5000)
    setParkingInterval(interval)
  }, [showModal, destination])


  return (
    <View style={styles.container}>
      <Modal animationType="slide" transparent={true} visible={showModal}>
        <View style={keyboard ? styles.centeredViewKeyboard : styles.centeredView}>
          <View style={styles.modalView}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Header>{selected.name}</Header>
              <Feather onPress={() => setShowModal(false)} name="x" size={28} color={theme.colors.danger} />
            </View>
            <View style={{ flex: 1, flexDirection: 'column' , justifyContent: 'space-around' }}>
              { showAlert && <Alert alert={alert} dismissAlert={() => setShowAlert(false)} /> }
              <Paragraph>{selected.description}</Paragraph>
              <View style={{ height: 130 }}>
                <View style={styles.textContainer}>
                  <Ionicons name="ios-pricetag-sharp" size={24} color="black" />
                  <Text style={styles.text}> {selected.price} DH / Hour </Text>
                </View>
                <View style={styles.textContainer}>
                  <Ionicons name="car" size={24} color="black" />
                  <Text style={styles.text}> {selected.length} KM - {selected.duration} Minutes </Text>
                </View>
              </View>
              {
                destination ? (
                  <Button mode='contained' style={{ backgroundColor: theme.colors.danger }} onPress={launchAlert}>Cancel your reservation!</Button>
                ) : (
                  <>
                  <TextInput
                    label="License Plate"
                    returnKeyType="next"
                    value={licensePlate.value}
                    onChangeText={(text) => setLicensePlate({ value: text, error: '' })}
                    error={!!licensePlate.error}
                    errorText={licensePlate.error}
                  />
                  <Button mode='contained' onPress={createReservation}>Reserve your parking!</Button>
                  </>
                )
              }
            </View>
          </View>
        </View>
      </Modal>
      {
        loading ? (
          <View style={styles.container}>
            <Image style={styles.image} source={require('../assets/loading.gif')} />
            <Header>Loading...</Header>
          </View>
        ) :
        location ? ( 
          <MapView provider={PROVIDER_GOOGLE} 
            style={styles.map} region={location}
            onRegionChangeComplete={(region) => setLocation(region)}
          >
            <Marker key={user} coordinate={marker} />
            {
              destination ? (
                <>
                  <Marker key={selected._id} onPress={() => setShowModal(true)} coordinate={destination} >
                    <Image style={styles.parking} source={require('../assets/parking1.png')} />
                  </Marker>
                  <Polyline coordinates={polyline} strokeColor={theme.colors.primary} strokeWidth={4} />
                </>
              ) : (
                parkings.map(parking => (
                  <Marker 
                    key={parking._id} onPress={() => selectParking(parking)}
                    coordinate={{ longitude: parking.longitude, latitude: parking.latitude}} 
                  >
                    <Image style={styles.parking} source={require('../assets/parking1.png')} />
                  </Marker>
                ))
              )
            }
          </MapView>
        ) : (
          <View style={{ width: '80%' }}>
            <Alert alert={alert} />
          </View>
        )
      }
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  textContainer: {
    marginVertical: 5,
    borderBottomWidth: 1,
    borderRadius: 10,
    justifyContent: 'space-around',
    alignItems: 'center',
    flex: 1,
    flexDirection: 'row'
  },
  text: {
    textAlign: 'center',
    fontFamily: 'fira-regular',
    fontSize: 18,
    color: theme.colors.primary,
    width: '80%'
  },
  map: {
    width: '100%',
    height: '100%'
  },
  image: {
    width: 150,
    height: 150
  },
  centeredViewKeyboard: {
    alignItems: "center",
    marginTop: 80
  },
  centeredView: {
    flex: 1,
    alignItems: "center",
    justifyContent: 'flex-end',
    marginBottom: 10
  },
  modalView: {
    width: '90%',
    height: 450,
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
  parking: {
    width: 50,
    height: 50
  }
})

export default Map
