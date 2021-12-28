import React, { useState, useEffect } from 'react'
import Background from '../components/Background'
import { FlatList, Text, StyleSheet } from 'react-native'
import Header from "../components/Header"
import * as SecureStore from 'expo-secure-store'
import axios from 'axios'
import { API_URL } from "../core/globals"
import { theme } from "../core/theme"
import Card from "../components/Card"

export default function Dashboard({ navigation }) {
  const [data, setData] = useState()
  const [user, setUser] = useState()
  const [refreshing, setRefreshing] = useState(false)
  const getData = async () => {
    let token = await SecureStore.getItemAsync('token')
    let response = await axios.get(`${API_URL}/dashboard/user`, {headers: {Authorization: token}})
    setData(response.data)
  }
  const getUser = async () => {
    let token = await SecureStore.getItemAsync('token')
    let response = await axios.get(`${API_URL}/profile`, {headers: {Authorization: token}})
    setUser(response.data.username)
  }
  const handleRefresh = () => {
    setRefreshing(true)
    getUser()
    getData()
    setRefreshing(false)
  }
  useEffect(() => {
    getData()
    getUser()
  }, [])

  return (
    <Background>
      <Text style={styles.title}> Welcome Back </Text>
      <Text style={styles.subtitle}> { user } </Text>
      <FlatList
        refreshing={refreshing}
        onRefresh={handleRefresh}
        style={styles.container}
        data={data}
        keyExtractor={item => item.id.toString()}
        renderItem={({ item }) => (
            <Card title={item.title} body={item.value} color={item.color} icon={item.icon} />
        )}
      />
    </Background>
  )
}

const styles = StyleSheet.create({
  container: {
    width: '100%'
  },
  title: {
    fontSize: 30,
    color: theme.colors.primary,
    fontWeight: 'bold',
    fontFamily: 'fira-bold',
    width: '100%',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 30,
    color: theme.colors.primary,
    fontWeight: 'bold',
    fontFamily: 'fira-bold',
    textAlign: 'center',
    paddingBottom: 30
  }
})
