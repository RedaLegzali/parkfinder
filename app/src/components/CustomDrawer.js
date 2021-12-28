import React, { useState, useEffect } from 'react'
import { DrawerContentScrollView, DrawerItemList, DrawerItem } from '@react-navigation/drawer'
import { View, Image, Text, StyleSheet, TouchableOpacity } from "react-native"
import { MaterialIcons } from '@expo/vector-icons'
import { theme } from '../core/theme'
import { API_URL } from '../core/globals'

const CustomDrawer = (props) => {
	return (
		<DrawerContentScrollView style={styles.container} {...props} >
			<TouchableOpacity onPress={() => props.navigation.navigate('Profile')} style={styles.header}>
				<Image style={styles.image} source={{ uri: `${API_URL}/${props.user.image}` }} />
				<View>
					<Text style={styles.title}>{ props.user.username }</Text>
					<Text style={styles.subtitle}>{ props.user.email }</Text>
				</View>
			</TouchableOpacity>
			<View style={styles.separator}></View>
			<DrawerItemList {...props} />
		</DrawerContentScrollView>
	)
}

const styles = StyleSheet.create({
	container: {
		paddingTop: 20,
	},
	header: {
		flex: 1,
		flexDirection: 'row',
		height: 80,
		marginVertical: 5
	},
	title: {
		fontFamily: 'fira-bold',
		fontSize: 25,
		marginBottom: 10,
		color: '#696969'
	},
	subtitle: {
		fontFamily: 'fira-regular',
		fontSize: 15,
		color: '#a9a9a9'
	},
	image: {
		width: 60,
		height: 60,
		borderRadius: 30,
		marginHorizontal: 10
	},
	separator: {
		borderBottomWidth: 1,
		borderBottomColor: '#d3d3d3',
		alignSelf: 'center',
		width: '80%',
		marginVertical: 10
	}
})

export default CustomDrawer
