import React from 'react'
import Background from '../components/Background'
import { StyleSheet, View, Image, Text } from 'react-native'
import Paragraph from '../components/Paragraph'
import Header from '../components/Header'

export default function About({ navigation }) {
  return (
    <Background>
      <Image style={styles.image} source={require('../assets/cyberpunks.png')} />
      <Header>Who we are ?</Header>
      <Paragraph>
        We are Cyberpunks, a team of young developpers and designers who want to use technology to create a difference.
      </Paragraph>
      <Paragraph>
        Parkfinder is our first project and we hope to make parking an effortless task
      </Paragraph>
      <Text style={styles.sub}>
        © Cyberpunks - ParkFinder
      </Text>
    </Background>
  )
}

const styles = StyleSheet.create({
  image: {
    width: 200,
    height: 100,
    position: 'absolute',
    top: 20
  },
  sub: {
    color: 'gray',
    fontSize: 18,
    fontFamily: 'fira-regular',
    position: 'absolute',
    bottom: 50
  },
})
