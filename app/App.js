import React, { useState, useEffect, useMemo } from 'react'
import { Provider } from 'react-native-paper'
import { NavigationContainer } from '@react-navigation/native'
import { createStackNavigator } from '@react-navigation/stack'
import { createDrawerNavigator } from '@react-navigation/drawer'
import { theme } from './src/core/theme'
import CustomDrawer from './src/components/CustomDrawer'
import { 
  Home, Login, Register, ResetPassword, 
  Dashboard, About, Map, Reservations, Balance, Profile
} from './src/screens'
import axios from 'axios'
import * as Font from 'expo-font'
import AppLoading from 'expo-app-loading'
import Slider from './src/components/Slider'
import Logout from './src/components/Logout'
import { AuthContext, SlideContext, UserContext } from "./src/components/Context"
import * as SecureStore from 'expo-secure-store'
import { API_URL } from "./src/core/globals"
import { MaterialCommunityIcons, MaterialIcons, FontAwesome } from '@expo/vector-icons'

const Stack = createStackNavigator()
const Drawer = createDrawerNavigator()
const getFonts = () => Font.loadAsync({
  'fira-regular': require('./assets/fonts/FiraSans-Regular.ttf'),
  'fira-bold': require('./assets/fonts/FiraSans-Bold.ttf')
})

export default function App() {
  const [isLogged, setIsLogged] = useState(false)
  const [slides, setSlides] = useState(true)
  const [fontsLoaded, setFontsLoaded] = useState(false)
  const [user, setUser] = useState()

  const authContext = useMemo(() => ({
    login: (token) => {
      setSecureToken(token)
      setIsLogged(true)
      getSecureSlides()
    },
    logout: () => {
      deleteSecureToken(null)
      setIsLogged(false)
    }
  }))
  const slideContext = useMemo(() => ({
    done: () => {
      // setSecureSlides(false)
      setSlides(false)
    }
  }))
  const userContext = useMemo(() => ({
    edit: (user) => {
      setUser(user)
    },
    get: () => user
  }))
  const checkLogged = async () => {
    let token = await getSecureToken()
    try {
      let res = await axios.get(`${API_URL}/profile`, { headers: { Authorization: token } })
      setUser(res.data)
      setIsLogged(true)
    } catch(err) {
      setIsLogged(false)
    }
  }
  const deleteSecureToken = async () => await SecureStore.deleteItemAsync('token')
  const setSecureToken  = async (token) => await SecureStore.setItemAsync('token', token)
  const setSecureSlides = async (value) => await SecureStore.setItemAsync('slides', value)
  const getSecureToken  = async () => await SecureStore.getItemAsync('token')
  const getSecureSlides = async () => { 
    let value = await SecureStore.getItemAsync('slides')
    value = value == null ? true : value
    setSlides(value)
  }

  useEffect(() => { 
    checkLogged() 
    getSecureSlides()
  }, [])

  if (fontsLoaded) {
    return (
      <AuthContext.Provider value={authContext}>
        <Provider theme={theme}>
          <NavigationContainer>
            {
              !isLogged ? (
                  <Stack.Navigator initialRouteName="Home" screenOptions={ { headerShown: false} }>
                    <Stack.Screen name="Home" component={Home} />
                    <Stack.Screen name="Login" component={Login} />
                    <Stack.Screen name="Register" component={Register} />
                    <Stack.Screen name="ResetPassword" component={ResetPassword} />
                  </Stack.Navigator>
                ) : (
                  !slides && user ? (
                    <UserContext.Provider value={userContext}>
                  <Drawer.Navigator initialRouteName="Dashboard" 
                    drawerContent={props => <CustomDrawer user={user} {...props} />}
                    screenOptions={{ 
                      headerShown: true, 
                      swipeEnabled: false, 
                      headerTitleStyle: { fontFamily: 'fira-bold', color: theme.colors.primary } 
                    }}
                  >
                    <Drawer.Screen name="Dashboard" component={Dashboard} 
                      options={{ drawerIcon: ({focused, color, size}) => <FontAwesome name="dashboard" size={size} color={color} /> }} />
                    <Drawer.Screen name="Find Parking" component={Map} 
                      options={{ drawerIcon: ({focused, color, size}) => <FontAwesome name="map-marker" size={size} color={color} /> }} />
                    <Drawer.Screen name="Reservations" component={Reservations}
                      options={{ drawerIcon: ({focused, color, size}) => <FontAwesome name="list" size={size} color={color} /> }} />
                    <Drawer.Screen name="Balance" component={Balance}
                      options={{ drawerIcon: ({focused, color, size}) => <FontAwesome name="dollar" size={size} color={color} /> }} />
                    <Drawer.Screen name="About" component={About}
                      options={{ drawerIcon: ({focused, color, size}) => <MaterialCommunityIcons name="information-variant" size={size} color={color} /> }} />
                    <Drawer.Screen name="Profile" component={Profile}
                      options={{ drawerIcon: ({focused, color, size}) => <FontAwesome name="user" size={size} color={color} /> }} />
                    <Drawer.Screen name="Logout" component={Logout}
                      style={{ marginTop: 100 }}
                      options={{ drawerIcon: ({focused, color, size}) => <MaterialIcons name="logout" size={size} color={color} /> }} />
                  </Drawer.Navigator>
                    </UserContext.Provider>
                  ) : (
                    <SlideContext.Provider value={slideContext}>
                      <Slider />
                    </SlideContext.Provider>
                  )
                )
            }
          </NavigationContainer>
        </Provider>
      </AuthContext.Provider>
    )
  } else {
    return (
      <AppLoading 
        startAsync={getFonts}
        onFinish={() => setFontsLoaded(true)}
        onError={() => console.error('Error loading fonts')}
      />
    )
  }
}
