<script setup lang="ts">
import { onBeforeMount, ref } from 'vue'
import type { SearchQuery } from './definitions'

const breeds = ref([''])
const valid = defineModel<boolean>('valid')
const range = ref([0, 20])
const selectedBreeds = defineModel<Array<string>>('selectedBreeds')
const size = ref(24)
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
    console.error(error)
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
  size.value = 24
  sort.value = ''
  range.value = [0, 20]
}

onBeforeMount(async () => {
  await getBreeds()
})
</script>

<template>
  <v-container>
    <v-form v-model="valid" @submit.prevent="handleSubmit">
      <v-row>
        <v-col cols="12" md="8">
          <v-autocomplete
            label="Breed"
            :items="breeds"
            clearable
            multiple
            chips
            v-model="selectedBreeds"
          ></v-autocomplete>
        </v-col>
        <v-col cols="12" md="4"> <v-text-field clearable label="Zipcode"></v-text-field> </v-col>
      </v-row>
      <v-row>
        <v-col cols="12" md="6">
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
        </v-col>
        <v-col cols="6" md="2">
          <v-select
            label="Sort"
            :items="['breed:desc', 'breed:asc', 'name:desc', 'name:asc', 'age:desc', 'age:asc']"
            v-model="sort"
          ></v-select>
        </v-col>
        <v-col cols="6" md="2">
          <v-select label="# of Results" :items="[24, 48, 72, 96, 108]" v-model="size"></v-select>
        </v-col>
        <v-col cols="12" md="2" align-self="center">
          <v-row>
            <v-btn class="me-4 button" type="submit"> submit </v-btn>
            <v-btn @click="handleReset" class="button"> clear </v-btn>
          </v-row>
        </v-col>
      </v-row>
    </v-form>
  </v-container>
</template>

<style lang="css" scoped></style>
