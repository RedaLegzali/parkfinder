import React, { useState, useEffect } from 'react'
import Background from '../components/Background'
import Header from "../components/Header"
import Button from "../components/Button"
import Alert from "../components/Alert"
import { StyleSheet, FlatList, TouchableOpacity, Text } from 'react-native'
import { theme } from "../core/theme"
import * as SecureStore from 'expo-secure-store'
import axios from 'axios'
import { API_URL } from "../core/globals"

export default function Balance({ navigation }) {
  const [packs, setPacks] = useState([
    {id: '1', value: '20'},
    {id: '2', value: '50'},
    {id: '3', value: '100'},
    {id: '4', value: '300'},
    {id: '5', value: '500'}
  ])
  const [token, setToken] = useState()
  const [selectedPack, setSelectedPack] = useState(null)
  const [alert, setAlert] = useState({ success: false, value: '' })
  const [showAlert, setShowAlert] = useState(false)
  const getToken = async () => {
    let token = await SecureStore.getItemAsync('token')
    setToken(token)
  }
  const handleSubmit = async () => {
    if (!selectedPack) {
      setAlert({ success: false, value: 'You have to select a pack' })
      setShowAlert(true)
    } else {
      let pack = packs.filter(item => item.id == selectedPack)[0]
      try {
        let response = await axios.post(`${API_URL}/profile/balance`, 
          { pack: pack.value },
          { headers: { Authorization: token } }
        )
        setAlert({ success: true, value: `${response.data.message}` })
      } catch (err) { 
        setAlert({ success: false, value: `${err.response.data.message}` })
      }
      setShowAlert(true)
    }
  }
  useEffect(() => {
    getToken()
  }, [])
  return (
    <Background>
      <Header style={styles.header}>Choose a pack</Header>
      {
        showAlert && ( 
          <Alert alert={alert} dismissAlert={() => setShowAlert(false)} />
        )
      }
      <FlatList 
        style={styles.container}
        data={packs}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity 
            style={ (selectedPack == item.id) ? { ...styles.pack, ...styles.selected } : styles.pack }
            onPress={() => setSelectedPack(item.id)}
          >
            <Text style={styles.text}> {item.value} DH </Text>
          </TouchableOpacity>
        )}
      />
      <Button mode='contained' onPress={handleSubmit}>Buy Pack</Button>
    </Background>
  )
}

const styles = StyleSheet.create({
  header: {
    position: 'absolute',
    top: 30,
    fontSize: 30,
    color: theme.colors.primary,
    fontWeight: 'bold',
    paddingVertical: 12,
    fontFamily: 'fira-bold'
  },
  container: {
    width: '100%',
    flexGrow: 0,
    marginBottom: 20
  },
  pack: {
    borderWidth: 1,
    borderColor: theme.colors.secondary,
    borderRadius: 5,
    padding: 10,
    marginVertical: 10,
    width: '100%'
  },
  text: {
    fontFamily: 'fira-regular',
    fontSize: 18,
    textAlign: 'center'
  },
  selected: {
    borderColor: theme.colors.success
  }
})
