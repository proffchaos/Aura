import { AxiosInstance } from 'axios'
import { backendApi } from '.'
import { encryptDataWithPrivateKey } from '~/scripts/utils/crypto'
import {
  EnergyAllocationList,
  EnergyAllocationRetrieveResponse,
  EnergyAllocationUpdateResponse,
  InboundEnergyAllocationRetrieveResponse,
} from '~/types'

export const transferEnergy = async (
  backendApi: AxiosInstance,
  transfers: EnergyAllocationList
) => {
  try {
    const brightId = localStorage.getItem('brightId')

    const encryptedData = {
      transfers,
    }
    const encryptedTransfers = encryptDataWithPrivateKey(encryptedData)
    return await backendApi.post<EnergyAllocationUpdateResponse>(
      '/v1/energy/' + brightId,
      {
        encryptedTransfers,
      }
    )
  } catch (error) {
    console.log(error)
    throw error
  }
}

export const getEnergy = async (fromBrightId: string) => {
  try {
    const res = await backendApi.get<EnergyAllocationRetrieveResponse>(
      '/v1/energy/' + fromBrightId
    )
    if (!res.data) {
      throw new Error('Energy data in not defined')
    }
    return res.data
  } catch (error) {
    console.log(error)
    throw error
  }
}

export const getInboundEnergy = async (toBrightId: string) => {
  try {
    const res = await backendApi.get<InboundEnergyAllocationRetrieveResponse>(
      '/v1/energy/inbound/' + toBrightId
    )
    if (!res.data) {
      throw new Error('Energy data in not defined')
    }
    return res.data
  } catch (error) {
    console.log(error)
    throw error
  }
}
