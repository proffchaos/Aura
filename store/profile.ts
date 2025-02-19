import { ActionTree, GetterTree, MutationTree } from 'vuex'
import { getProfile } from '~/scripts/api/connections.service'
import {
  pullDecryptedUserData,
  pullProfilePhoto,
} from '~/scripts/api/login.service'
import { getIncomingRatings, getRatedUsers } from '~/scripts/api/rate.service'
import { ProfileState, RootState } from '~/types/store'
import { LocalForageBrightIdBackup } from '~/types'

export const state = (): ProfileState => ({
  localForageBrightIdBackup: null,
  profileData: null,
  connections: [],
  ratedUsers: [],
  incomingRatings: [],
})

export const getters: GetterTree<ProfileState, RootState> = {
  profileData: state => state.profileData,
  connections: state => state.connections,
  ratedUsers: state => state.ratedUsers,
  incomingRatings: state => state.incomingRatings,
  fourUnrated: state => {
    let fourUnrated: any = Object.assign([], state.profileData?.fourUnrated)
    fourUnrated = fourUnrated?.map((profile: any) => {
      const brightId = profile.conn?._to.replace('users/', '')
      const connectionInfo = state.connections.find(
        conn => conn.id === brightId
      )
      return {
        ...connectionInfo,
      }
    })
    return fourUnrated
  },
}

export const mutations: MutationTree<ProfileState> = {
  setProfileData(state, value) {
    state.profileData = value
  },
  setConnections(state, value) {
    state.connections = value
  },
  setRatedUsers(state, value) {
    state.ratedUsers = value
  },
  setIncomingRatings(state, value) {
    state.incomingRatings = value
  },
  setAndSaveLocalForageBrightIdBackup(state, value: any) {
    if (value.userData) {
      delete value.userData
    }
    state.localForageBrightIdBackup = value
    // @ts-ignore
    this.$localForage.setItem('profileData', value)
  },
}

export const actions: ActionTree<ProfileState, RootState> = {
  async getLocalForageBrightIdBackup(
    { commit },
    { authKey, password }: { authKey: string; password: string }
  ) {
    try {
      const profileData = await pullDecryptedUserData(authKey, password, this)
      commit('setAndSaveLocalForageBrightIdBackup', {
        ...profileData,
        profile: { ...profileData.userData, password },
      })
    } catch (error) {
      console.log(error)
      throw error
    }
  },
  async refreshLocalForageBrightIdBackup({ state, dispatch }) {
    const authKey = localStorage.getItem('authKey')
    const password = state.localForageBrightIdBackup?.profile.password
    if (!authKey || !password) return
    await dispatch('getLocalForageBrightIdBackup', { authKey, password })
  },
  async loadProfileData({ commit }, isPublic) {
    try {
      const profileData: LocalForageBrightIdBackup =
        // @ts-ignore
        await this.$localForage.getItem('profileData')

      if (!profileData) {
        return
      }

      const profile = profileData?.profile
      const connections = profileData?.connections

      const res = await getProfile(profileData.profile.id, isPublic)
      const ratedUsers = await getRatedUsers()

      // TODO: fix the issues with aura public and private profile types
      // @ts-ignore
      const nicknames: any[] = res?.data?.nicknames

      if (!nicknames) {
        return
      }

      const connectionsWithNicknames = connections.map(conn => ({
        ...conn,
        nickname: nicknames.find(nn => nn.toBrightId === conn.id)?.nickName,
        rating: ratedUsers.find(ru => ru.toBrightId === conn.id)?.rating,
      }))

      commit('setProfileData', { ...profile, ...res.data })
      commit('setConnections', connectionsWithNicknames)
      commit('setRatedUsers', ratedUsers)
    } catch (error) {
      throw error
    }
  },

  async getProfilePhoto(_ctx, brightId) {
    const privateKey = localStorage.getItem('authKey')!
    // @ts-ignore
    const profileInfo = await this.$localForage.getItem('profileData')
    if (!profileInfo) {
      return
    }

    return pullProfilePhoto(
      privateKey,
      brightId,
      profileInfo.profile.password,
      this
    )
  },

  async getIncomingRatings({ commit }) {
    try {
      const brightId = localStorage.getItem('brightId')
      if (!brightId) return
      const ratings = await getIncomingRatings(brightId)
      commit('setIncomingRatings', ratings)
    } catch (error) {
      console.log(error)
      throw error
    }
  },
}
