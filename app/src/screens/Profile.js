import React, { useState, useEffect, useContext } from 'react'
import { Alert as PopAlert, Image, View, StyleSheet, TouchableOpacity, ScrollView } from 'react-native'
import { Text } from 'react-native-paper'
import DateTimePicker from '@react-native-community/datetimepicker';
import Background from '../components/Background'
import Header from '../components/Header'
import Button from '../components/Button'
import TextInput from '../components/TextInput'
import BackButton from '../components/BackButton'
import { theme } from '../core/theme'
import dateformat from "dateformat"
import * as SecureStore from 'expo-secure-store'
import axios from 'axios'
import { API_URL } from "../core/globals"
import Alert from "../components/Alert"
import { AuthContext, UserContext } from "../components/Context"

export default function Profile() {
  const { logout } = useContext(AuthContext)
  const { edit, get } = useContext(UserContext)
  const [image, setImage] = useState({ value: '', error: '' })
  const [username, setUsername] = useState({ value: '', error: '' })
  const [email, setEmail] = useState({ value: '', error: '' })
  const [oldPassword, setOldPassword] = useState({ value: '', error: '' })
  const [password, setPassword] = useState({ value: '', error: '' })
  const [passwordConfirm, setPasswordConfirm] = useState({ value: '', error: '' })
  const [birthDate, setBirthDate] = useState({ value: new Date(), error: '' })
  const [showAlert, setShowAlert] = useState(false)
  const [alertMessage, setAlertMessage] = useState({ value: '', success: false})
  const [showDate, setShowDate] = useState(false)
  const launchAlert = () => {
    PopAlert.alert( "Are you sure ?", "If you delete your account all your data will be permanently deleted",
      [ { text: "Cancel", style: "cancel" },
        { text: "Delete", style: "destructive", onPress: deleteUser }
      ])
  }
  const deleteUser = async () => {
    try {
      let token = await SecureStore.getItemAsync('token')
      let response = await axios.delete(`${API_URL}/profile`, { headers: { Authorization: token } })
      logout()
    } catch(err) { console.error(err) }
  }
  const editUser = async () => {
    try {
      let token = await SecureStore.getItemAsync('token')
      let response = await axios.put(`${API_URL}/profile`, 
        { username: username.value, email: email.value, oldPassword: oldPassword.value, password: password.value, passwordConfirm: passwordConfirm.value,
          birthDate: dateformat(birthDate.value, "isoDate") },
        { headers: { Authorization: token } })
      edit(response.data.user)
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
          case 'oldPassword':
            setOldPassword({...oldPassword, error: value})
            break
          case 'password':
            setPassword({...password, error: value})
            break
          case 'birthDate':
            setShowAlert(true)
            setAlertMessage({ value, success: false })
            break
        }
      }
    }
  }
  const getUser = async () => {
    try {
      let user = get()
      setUsername({ ...username, value: user.username })
      setEmail({ ...email, value: user.email })
      setImage({ ...image, value: user.image })
      setBirthDate({ ...birthDate, value: new Date(user.birthDate) })
    } catch(err) { console.error(err) }
  }
  useEffect(() => {
    getUser()
  }, [])
  return (
    <ScrollView>
      <Background>
        { showAlert && <Alert alert={alertMessage} dismissAlert={() => setShowAlert(false)} /> }
        <Image style={styles.image} source={{ uri: `${API_URL}/${image.value}` }} />
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
          label="Old Password"
          returnKeyType="done"
          value={oldPassword.value}
          onChangeText={(text) => setOldPassword({ value: text, error: '' })}
          error={!!oldPassword.error}
          errorText={oldPassword.error}
          secureTextEntry
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
          onPress={editUser}
          style={{ marginTop: 24 }}
        >
          Edit
        </Button>
        <Button
          mode="contained"
          onPress={launchAlert}
          style={{ backgroundColor: theme.colors.danger }}
        >
          Delete
        </Button>
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
