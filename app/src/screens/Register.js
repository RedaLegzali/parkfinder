import React, { useState } from 'react'
import { Image, View, StyleSheet, TouchableOpacity, ScrollView } from 'react-native'
import { Text } from 'react-native-paper'
import DateTimePicker from '@react-native-community/datetimepicker';
import Background from '../components/Background'
import Header from '../components/Header'
import Button from '../components/Button'
import TextInput from '../components/TextInput'
import BackButton from '../components/BackButton'
import { theme } from '../core/theme'
import dateformat from "dateformat"
import axios from 'axios'
import { API_URL } from "../core/globals"
import Alert from "../components/Alert"

export default function Register({ navigation }) {
  const [username, setUsername] = useState({ value: '', error: '' })
  const [email, setEmail] = useState({ value: '', error: '' })
  const [password, setPassword] = useState({ value: '', error: '' })
  const [passwordConfirm, setPasswordConfirm] = useState({ value: '', error: '' })
  const [birthDate, setBirthDate] = useState({ value: new Date(), error: '' })
  const [showAlert, setShowAlert] = useState(false)
  const [alertMessage, setAlertMessage] = useState({ value: '', success: false})
  const [showDate, setShowDate] = useState(false)

  const handleRegister = async () => {
    try {
      if (birthDate.value.getDate() == new Date().getDate()) {
        setBirthDate({...birthDate, error: "Birth Date is required"})
        return
      } else {
        setBirthDate({...birthDate, error: ""})
      }
      let response = await axios.post(`${API_URL}/auth/register`, {
        username: username.value, 
        email: email.value, 
        password: password.value, 
        passwordConfirm: passwordConfirm.value, 
        birthDate: dateformat(birthDate.value, "isoDate")
      })
      setShowAlert(true)
      setAlertMessage({ value: response.data.message, success: true })
    } catch(err) {
      let errors = err.response.data
      for (let key in errors) {
        let value = errors[key]
        switch (key) {
          case 'username':
            setUsername({...username, error: value})
            break
          case 'email':
            setEmail({...email, error: value})
            break
          case 'password':
            setPassword({...password, error: value})
            break
          case 'birthDate':
            setAlertMessage({ value, success: false })
            break
        }
      }
    }
  }

  return (
    <ScrollView>
      <Background>
        <BackButton goBack={navigation.goBack} />
        <Header>Create Account</Header>
        { showAlert && <Alert alert={alertMessage} dismissAlert={() => setShowAlert(false)} /> }
        <Image style={styles.image} source={{ uri: `${API_URL}/user.png` }} />
        <TextInput
          label="Username"
          returnKeyType="next"
          value={username.value}
          onChangeText={(text) => setUsername({ value: text, error: '' })}
          error={!!username.error}
          errorText={username.error}
        />
        <TextInput
          label="Email"
          returnKeyType="next"
          value={email.value}
          onChangeText={(text) => setEmail({ value: text, error: '' })}
          error={!!email.error}
          errorText={email.error}
          autoCapitalize="none"
          autoCompleteType="email"
          textContentType="emailAddress"
          keyboardType="email-address"
        />
        <TextInput
          label="Password"
          returnKeyType="done"
          value={password.value}
          onChangeText={(text) => setPassword({ value: text, error: '' })}
          error={!!password.error}
          errorText={password.error}
          secureTextEntry
        />
        <TextInput
          label="Confirm Password"
          returnKeyType="done"
          value={passwordConfirm.value}
          onChangeText={(text) => setPasswordConfirm({ value: text, error: '' })}
          error={!!password.error}
          secureTextEntry
        />
        <TouchableOpacity style={styles.datelink} onPress={() => setShowDate(!showDate)}>
          <Text style={styles.datelinktext}>Birth Date</Text>
        </TouchableOpacity>
        {
          birthDate.error != '' && (
            <Text style={styles.error}>{birthDate.error}</Text>
          )
        }
        {
          showDate &&
          <DateTimePicker
            placeholder="Birth Date"
            style={styles.date}
            value={birthDate.value}
            mode='date'
            display="spinner"
            onChange={(e, date) => setBirthDate({ value: new Date(date), error: '' })}
          />
        }
        <Button
          mode="contained"
          onPress={handleRegister}
          style={{ marginTop: 24 }}
        >
          Sign Up
        </Button>
        <View style={styles.row}>
          <Text>Already have an account? </Text>
          <TouchableOpacity onPress={() => navigation.replace('Login')}>
            <Text style={styles.link}>Login</Text>
          </TouchableOpacity>
        </View>
      </Background>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    marginTop: 4,
  },
  link: {
    fontWeight: 'bold',
    color: theme.colors.primary,
  },
  datelink: {
    borderWidth: 1,
    borderRadius: 5,
    borderColor: theme.colors.secondary,
    width: '100%',
    padding: 10,
    marginVertical: 10
  },
  datelinktext: {
    fontSize: 20,
    textAlign: 'center',
    fontFamily: 'fira-regular',
    color: theme.colors.secondary,
  },
  date: {
    width: '100%',
    height: 150
  },
  label: {
    fontSize: 20,
    marginVertical: 10
  },
  error: {
    fontSize: 13,
    color: theme.colors.danger,
    paddingTop: 8,
    fontFamily: 'fira-regular'
  },
  image: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
})
