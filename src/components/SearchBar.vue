<script setup lang="ts">
import { onBeforeMount, ref } from 'vue'
import type { SearchQuery } from './definitions'
// import type { SearchResults } from './definitions'

// const searchResults: ModelRef<SearchResults> = defineModel()
const breeds = ref([''])
const valid = defineModel<boolean>('valid')
const range = ref([0, 20])
const selectedBreeds = defineModel<Array<string>>('selectedBreeds')
const size = ref(25)
const sort = ref('')

const emit = defineEmits(['query'])

async function getBreeds() {
  try {
    const response = await fetch('https://frontend-take-home-service.fetch.com/dogs/breeds', {
      method: 'get',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (response.ok) {
      breeds.value = await response.json()
      return
    }

    throw new Error(response.statusText)
  } catch (error) {
    console.log(error)
    breeds.value = ['Dog Breeds']
  }
}

function handleSubmit() {
  // eslint-disable-next-line prefer-const
  let query: SearchQuery = {
    size: undefined,
  }

  if (!!selectedBreeds.value) query.breeds = selectedBreeds.value
  if (!!range.value[0]) query.ageMin = range.value[0]
  if (!!range.value[1]) query.ageMax = range.value[1]
  if (!!size.value) query.size = size.value
  if (!!sort.value) query.sort = sort.value

  emit('query', query)
}

function handleReset() {
  selectedBreeds.value = []
  size.value = 25
  sort.value = ''
  range.value = [0, 20]
}

onBeforeMount(async () => {
  await getBreeds()
})

//TODO add better location search
</script>

<template>
  <v-form v-model="valid" @submit.prevent="handleSubmit">
    <v-autocomplete
      label="Breed"
      :items="breeds"
      clearable
      multiple
      chips
      v-model="selectedBreeds"
    ></v-autocomplete>
    <v-text-field clearable label="Zipcode"></v-text-field>
    <v-range-slider
      v-model="range"
      :max="20"
      :min="0"
      :step="1"
      class="align-center"
      hide-details
      strict
      label="Age Range"
      thumb-label="always"
    >
      <template v-slot:prepend>
        <v-text-field
          v-model="range[0]"
          density="compact"
          style="width: 100px"
          type="number"
          variant="outlined"
          hide-details
          single-line
        ></v-text-field>
      </template>
      <template v-slot:append>
        <v-text-field
          v-model="range[1]"
          density="compact"
          style="width: 100px"
          type="number"
          variant="outlined"
          hide-details
          single-line
        ></v-text-field>
      </template>
    </v-range-slider>
    <v-select
      label="Sort"
      :items="['breed:desc', 'breed:asc', 'name:desc', 'name:asc', 'age:desc', 'age:asc']"
      v-model="sort"
    ></v-select>
    <v-select label="Number of Results" :items="[25, 50, 75, 100]" v-model="size"></v-select>
    <v-btn class="me-4" type="submit"> submit </v-btn>

    <v-btn @click="handleReset"> clear </v-btn>
  </v-form>
</template>

<style lang="css" scoped></style>
