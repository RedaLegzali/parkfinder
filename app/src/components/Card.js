import * as React from 'react'
import { View, StyleSheet, Text } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { theme } from "../core/theme"

const Card = ({ title, body, icon }) => {

	return (
		<View style={styles.card}>
			<View style={styles.container}>
				<View style={styles.icon}>
      				<Feather name={icon} size={40} color={theme.colors.primary} />
				</View>
				<View style={{ width: '90%' }}>
					<Text style={styles.text}> {title} </Text>
					<Text style={styles.text}> {body} </Text>
				</View>
			</View>
		</View>
	)
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		flexDirection: 'row',
	},
	icon: {
		alignSelf: 'center'
	},
	card: {
		borderWidth: 2,
		borderRadius: 10,
		borderColor: theme.colors.primary,
		width: '100%',
		marginVertical: 10,
		padding: 10
	},
	text: {
		fontSize: 20,
		fontFamily: 'fira-regular',
		color: theme.colors.primary,
		textAlign: 'center',
		paddingVertical: 5
	}
})

export default Card
