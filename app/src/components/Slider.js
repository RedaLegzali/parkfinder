import React, { useContext } from 'react'
import { Button, StyleSheet, Text, View, Image } from 'react-native'
import Swiper from 'react-native-swiper'
import Header from './Header'
import { theme } from '../core/theme'
import { SlideContext } from "../components/Context"
import slide1 from "../assets/slide1.jpg"
import slide2 from "../assets/slide2.jpg"
import slide3 from "../assets/slide3.jpg"
import { Ionicons } from '@expo/vector-icons';

const Slide = ({ image, text, last, finish }) => {
  return (
    <View style={{ padding: 20, height: '100%' }}>
      <Text style={styles.text}>{text}</Text>
      <View style={styles.container}>
        <Image style={styles.image} source={image} />
      </View>
      <View style={styles.footer}>
        <Ionicons name="play-skip-forward-circle-sharp" size={40} color={theme.colors.primary} onPress={finish} />
        { last && <Ionicons name="checkmark-done-circle" size={40} color={theme.colors.primary} onPress={finish} /> }
      </View>
    </View>
  )
}

export default function Slider() {
  const { done } = useContext(SlideContext)
  const finish = () => done()
	return (
	  <Swiper loop={false}>
        <Slide image={slide1} text="Find all the parkings near you!" finish={finish} />
        <Slide image={slide2} text="Reserve your place instantly!" finish={finish} />
        <Slide image={slide3} text="Cancel easily and anytime" last={true} finish={finish} />
	  </Swiper>
	)
}

const styles = StyleSheet.create({
  container: {
    height: '90%',
    width: '100%',
  },
  image: {
    height: '100%',
    width: '100%',
    borderRadius: 20
  },
  text: {
    fontSize: 21,
    fontFamily: 'fira-bold',
    textAlign: 'center',
    color: theme.colors.primary,
    marginBottom: 10
  },
  btn: {
    height: '100%',
    width: '100%',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  }
})
