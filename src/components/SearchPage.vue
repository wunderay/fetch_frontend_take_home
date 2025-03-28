<script setup lang="ts">
import { computed, defineAsyncComponent, provide, ref, shallowRef, watch } from 'vue'
import type { Dog, SearchQuery, SearchResults } from './definitions'
import DogCard from './DogCard.vue'
const SearchBar = defineAsyncComponent(() => import('@/components/SearchBar.vue'))
const SearchResults = defineAsyncComponent(() => import('@/components/SearchResults.vue'))

const searchResults = ref<SearchResults>({
  resultIds: [],
  total: 0,
})
const currentPage = ref(1)
const totalPages = computed(() => {
  if (searchResults.value.total < 1) {
    return 1
  }
  return Math.ceil(searchResults.value.total / searchResults.value.resultIds.length)
})
let ignoreWatch = false

const handleQuery = (query: SearchQuery) => {
  ignoreWatch = true
  const queryParams = new URLSearchParams()

  if (!!query.breeds) {
    queryParams.append('breeds', query.breeds.toString())
  }
  if (!!query.ageMin) {
    queryParams.append('ageMin', query.ageMin.toString())
  }
  if (!!query.ageMax) {
    queryParams.append('ageMax', query.ageMax.toString())
  }
  if (!!query.sort) {
    queryParams.append('sort', query.sort.toString())
  }
  if (!!query.size) {
    queryParams.append('size', query.size.toString())
  }

  currentPage.value = 1
  searchDogs(queryParams)
  ignoreWatch = false
}

const searchDogs = async (queryParams: URLSearchParams = new URLSearchParams()) => {
  const response = await fetch(
    'https://frontend-take-home-service.fetch.com/dogs/search?' + queryParams.toString(),
    {
      method: 'get',
      credentials: 'include',
    },
  )
  const dogsFound: SearchResults = await response.json()
  searchResults.value = dogsFound
}

const favoriteDogs = shallowRef<Array<Dog>>([])

const handleAddFavorited = (dog: Dog) => {
  favoriteDogs.value.push(dog)
}

const handleRemoveFavorited = (dog: Dog) => {
  favoriteDogs.value = favoriteDogs.value.filter((element) => element.id !== dog.id)
}

watch(currentPage, async () => {
  if (ignoreWatch) return
  if (totalPages.value == 1) {
    return
  }
  const sr = searchResults.value
  const linkParams = sr.next
    ? new URLSearchParams(sr.next.replace('/dogs/search?', ''))
    : sr.prev
      ? new URLSearchParams(sr.prev.replace('/dogs/search?', ''))
      : null
  if (!linkParams) return

  const newFromNumber = sr.resultIds.length * (currentPage.value - 1)
  linkParams.set('from', newFromNumber.toString())

  searchDogs(linkParams)
})

searchDogs()
//TODO Add favorites
</script>

<template>
  <div>
    <Suspense>
      <SearchBar @query="handleQuery" />
      <template #fallback> Loading... </template>
    </Suspense>
  </div>
  <div class="favoriteDogs">
    <DogCard
      v-for="dog in favoriteDogs"
      :key="dog.id"
      :dog="dog"
      :favorited="true"
      @favorited="handleAddFavorited"
      @un-favorited="handleRemoveFavorited"
    ></DogCard>
  </div>
  <v-pagination v-model="currentPage" :length="totalPages"></v-pagination>

  <div>
    <Suspense>
      <SearchResults
        :dog-list="searchResults.resultIds"
        @favorited="handleAddFavorited"
        @unFavorited="handleRemoveFavorited"
      />
      <template #fallback> Loading... </template>
    </Suspense>
    <v-pagination v-model="currentPage" :length="totalPages"></v-pagination>
  </div>
</template>

<style lang="css" scoped></style>
