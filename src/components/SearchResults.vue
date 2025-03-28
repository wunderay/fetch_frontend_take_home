<script setup lang="ts">
import { ref, watch } from 'vue'
import type { Dog, Locations } from './definitions'
import DogCard from './DogCard.vue'

const props = defineProps({
  dogList: {
    type: Array<string>,
    required: true,
  },
})

const dogs = ref<Array<Dog>>()

const getDogs = async () => {
  //API has 100 dog limit
  if (props.dogList.length > 100) {
    const splitArray = props.dogList.reduce((resultArray: Array<Array<string>>, item, index) => {
      const chunkIndex = Math.floor(index / 100)

      if (!resultArray[chunkIndex]) {
        resultArray[chunkIndex] = [] // start a new chunk
      }

      resultArray[chunkIndex].push(item)

      return resultArray
    }, [])

    dogs.value = []
    splitArray.forEach(async (dogArray) => {
      const result = await fetchDogs(dogArray)
      dogs.value = dogs.value?.concat(result)
    })
    return
  }

  dogs.value = await fetchDogs(props.dogList)
}

const fetchDogs = async (dogIDs: Array<string>) => {
  try {
    const response = await fetch('https://frontend-take-home-service.fetch.com/dogs', {
      method: 'post',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(dogIDs),
    })

    if (response.ok) {
      const dogPack: Dog[] = await response.json()
      const newDogPack = await setLocations(dogPack)
      return newDogPack
    }

    throw new Error(response.statusText)
  } catch (error) {
    console.error(error)
  }

  return []
}

const setLocations = async (dogList: Array<Dog>) => {
  const zipCodes: Array<string> = []
  const updatedDogList = dogList

  updatedDogList.forEach((dog) => {
    zipCodes.push(dog.zip_code)
  })

  try {
    const response = await fetch('https://frontend-take-home-service.fetch.com/locations', {
      method: 'post',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(zipCodes),
    })

    if (!response.ok) {
      throw new Error(response.statusText)
    }

    const locations: Locations[] = await response.json()

    updatedDogList.forEach((dog) => [
      (dog.location = locations.find((location) => location.zip_code === dog.zip_code)),
    ])
  } catch (error) {
    console.error(error)
  }
  return updatedDogList
}

const emit = defineEmits(['favorited', 'unFavorited'])

watch(
  () => props.dogList,
  async () => {
    if (props.dogList) {
      await getDogs()
    }
  },
)
</script>

<template>
  <div>
    <v-container>
      <v-row>
        <v-col cols="6" md="2" v-for="dog in dogs" :key="dog.id">
          <DogCard
            :dog="dog"
            :key="dog.id"
            @favorited="emit(`favorited`, dog)"
            @un-favorited="emit('unFavorited', dog)"
          ></DogCard>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<style lang="css" scoped></style>
