import { View, FlatList, Image, RefreshControl , Alert, TouchableOpacity} from 'react-native'
import React, { useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import InfoBox  from '../../components/InfoBox'

import EmptyState from '../../components/EmptyState'
import useAppwrite from '../../lib/useAppwrite'
import {  getUserPosts, signOut } from '../../lib/appwrite'
import VideoCard from '../../components/VideoCard'

import { useGlobalContext } from '../../context/GlobalProvider'
import { icons } from '../../constants'
import { router } from 'expo-router'

const Profile = () => { //66c4707f002046340d32

  const { user, setuser, setisLoggedIn } = useGlobalContext();

  const {data: posts, refetch} = useAppwrite(() => getUserPosts(user.$id));
 
  const [refreshing, setrefreshing] = useState(false);

  const onRefresh = async () =>{
    setrefreshing(true);
    await refetch();
    setrefreshing(false);
  }

  const logout = async() => {
    await signOut()
    setuser(null)
    setisLoggedIn(false)

    router.replace('/sign-in')
  }
  return (
    <SafeAreaView className="bg-primary h-full">
      <FlatList
        data={posts}
        keyExtractor={(item) => item.$id}
        renderItem={({item}) => (
          <VideoCard             
          title={item.title}
          thumbnail={item.thumbnail}
          video={item.video}
          creator={item.creator.username}
          avatar={item.creator.avatar}/>
        )}
        ListHeaderComponent={() => (
          <View className="w-full justify-center items-center mt-6 mb-12 px-4">
            <TouchableOpacity 
              onPress={logout}
              className="w-full items-end mb-10"
              >
              <Image 
                source={icons.logout}
                resizeMode='contain'
                className="w-6 h-6"
              />
            </TouchableOpacity>
            <View className="w-16 h-16 border border-secondary rounded-lg justify-center items-center">
              <Image
                source={{ uri:user?.avatar }}
                className="w-[90%] h-[90%] rounded-lg"
                resizeMode='cover'
              />
            </View>

          <InfoBox 
            title={user?.username}
            containerStyles='mt-5'
            titleStyles='text-lg'
          />

            <View
              className="mt-5 flex-row"
            >
              <InfoBox 
                title={posts.length || 0}
                subtitle="Posts"
                containerStyles="mr-10"
                titleStyles="text-xl"
              />
              <InfoBox 
                title="1.2k"
                subtitle="Followers"
                titleStyles="text-xl"
              />
            </View>
          </View>
        )}
        ListEmptyComponent={() =>(
          <EmptyState
            title="No Videos Found"
            subtitle="Search results returned 0 results"
          />
        )}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh}/>}
      />
    </SafeAreaView>
  )
}

export default Profile