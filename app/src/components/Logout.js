import React, { useContext, useEffect } from 'react'
import { AuthContext } from "../components/Context"
import Background from '../components/Background'

const Logout = () => {
  const { logout } = useContext(AuthContext)
  useEffect(() => { logout() })
  return (
    <Background>
    </Background>
  )
}

export default Logout
