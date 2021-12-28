import React from 'react'
import Background from '../components/Background'
import Header from '../components/Header'
import Button from '../components/Button'
import Paragraph from '../components/Paragraph'
import { StyleSheet, View, Image } from 'react-native'

export default function Home({ navigation }) {
  return (
    <Background>
      <Image source={require('../assets/parkfinder.png')} style={styles.image} />
      <Header>Parkfinder</Header>
      <Paragraph>
        Find the closest and cheapest parking in seconds
      </Paragraph>
      <Button
        mode="contained"
        onPress={() => navigation.navigate('Login')}
      >
        Login
      </Button>
      <Button
        mode="outlined"
        onPress={() => navigation.navigate('Register')}
      >
        Sign Up
      </Button>
    </Background>
  )
}

const styles = StyleSheet.create({
  image: {
    width: 300,
    height: 200
  },
})
