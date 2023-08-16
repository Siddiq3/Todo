import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Linking, Image, SafeAreaView } from "react-native";
import { auth } from "./config/firebaseAuth";



export default function SignInScreen({ promtAsync }) {

    return (
        <SafeAreaView>
            <TouchableOpacity onPress={() => promtAsync()}>
                <Text style={{ fontSize: 20 }}> SIGN IN WITH GOOGLE</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={async () => {
                await signOut(auth)
            }}>
                <Text style={{ fontSize: 20 }}>SIGN OUT</Text>
            </TouchableOpacity>
        </SafeAreaView>
    );
}














import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, ActivityIndicator } from 'react-native';


import OneSignal from 'react-native-onesignal';
import { useEffect, useState } from 'react';


import { NavigationContainer } from '@react-navigation/native';
import TabNavigation from './TabNavigation';





import SignInScreen from './SignIn';
import {
  GoogkleAuthProvider,
  onAuthStateChanged,
  signInWithCredential
} from 'firebase/auth';

import * as  Google from "expo-auth-session/providers/google";
import * as WebBrowser from "expo-web-browser";
import { auth } from './config/firebaseAuth';

import AsyncStorage from '@react-native-async-storage/async-storage';


WebBrowser.maybeCompleteAuthSession();

export default function App() {


  const [userInfo, setUserInfo] = useState();
  const [loading, setLoading] = useState(false);
  const [request, response, promtAsync] = Google.useAuthRequest({
    androidClientId: '385154235075-j5kmrqfij7i9t8fngrccema9eb2iee1p.apps.googleusercontent.com'

  });


  const CheckLocalUser = async () => {
    setLoading(true)
    try {
      const userJSON = await AsyncStorage.getItem('@user');
      const userData = userJSON ? JSON.parse(userJSON) : null;
      console.log('local storage', userData);
      setUserInfo(userData);
    }
    catch (e) {
      alert(e.message);
    }
    finally {
      setLoading(false);
    }
  }


  useEffect(() => {
    if (response?.type == 'success') {
      const { id_token } = response.params;
      const credential = GoogkleAuthProvider.credential(id_token);
      signInWithCredential(auth, credential);
    }
  }, [response]);
  useEffect(() => {
    CheckLocalUser();
    const unSub = onAuthStateChanged(auth, async (user) => {
      if (user) {
        console.log(JSON.stringify(user, null, 2))
        setUserInfo(user);
        await AsyncStorage.setItem("@user", JSON.stringify(user));
      }
      else {
        console.log('else')
      }
    });

    return () => unSub();
  }, []);




  useEffect(() => {
    // OneSignal Initialization
    OneSignal.setAppId("095d99d3-5a72-47e3-a8f2-f1a4d51671d6");

    //Method for handling notifications opened
    OneSignal.setNotificationOpenedHandler(notification => {
      console.log("OneSignal: notification opened:", notification);
    });
  }, [])



  if (loading)
    return (
      <View style={styles.container}>
        <ActivityIndicator size={'large'} />
      </View>
    );


  return (
    <NavigationContainer style={styles.container} >


      {userInfo ? <TabNavigation /> : <SignInScreen promtAsync={promtAsync} />}

    </NavigationContainer>

  );

}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
