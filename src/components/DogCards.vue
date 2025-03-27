<script setup lang="ts">
import { ref, watch, watchEffect } from 'vue'
import type { Dog, Locations } from './definitions'

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

    console.log('Array is split')
    console.log(splitArray)

    const combinedArray: Array<Dog> = []

    splitArray.forEach(async (dogArray) => {
      const result = await fetchDogs(dogArray)
      combinedArray.push(...result)
    })

    console.log(combinedArray)

    dogs.value = combinedArray

    console.log(dogs.value)
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
    console.log(error)
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
    console.log(error)
  }
  return updatedDogList
}

watchEffect(async () => {
  if (props.dogList) {
    await getDogs()
  }
})
//TODO add favorites button

//TODO split cards into seperate component
</script>

<template>
  <div>
    <v-card v-for="dog in dogs" :key="dog.id" class="dogCard">
      <v-img :src="dog.img" width="200" height="200" class="dog-picture align-end"> </v-img>
      <v-card-title>{{ dog.name }}</v-card-title>
      <v-card-subtitle class="pt-4">
        <span>{{ dog.breed }} | </span>
        <span>Age: {{ dog.age }}</span>
      </v-card-subtitle>
      <v-card-text>
        <div>{{ dog.location?.city }}, {{ dog.location?.state }} {{ dog.zip_code }}</div>
      </v-card-text>
    </v-card>
  </div>
</template>

<style lang="css" scoped>
.dog-picture {
  object-fit: fill;
}

.dogCard {
}
</style>
