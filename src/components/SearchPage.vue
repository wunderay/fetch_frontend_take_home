<script setup lang="ts">
import { computed, defineAsyncComponent, ref, watch } from 'vue'
import type { SearchQuery, SearchResults } from './definitions'

const SearchBar = defineAsyncComponent(() => import('@/components/SearchBar.vue'))
const DogCards = defineAsyncComponent(() => import('@/components/DogCards.vue'))

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

async function searchDogs(queryParams: URLSearchParams = new URLSearchParams()) {
  console.log(queryParams)
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
  if (!linkParams) {
    return
  }

  const newFromNumber = sr.resultIds.length * (currentPage.value - 1)

  linkParams.set('from', newFromNumber.toString())

  const keys = [...linkParams.keys()]
  const value = [...linkParams.values()]

  console.log(keys)
  console.log(value)

  searchDogs(linkParams)
})

searchDogs()
</script>

<template>
  <div>
    <v-pagination v-model="currentPage" :length="totalPages"></v-pagination>
    <Suspense>
      <SearchBar @query="handleQuery" />
      <template #fallback> Loading... </template>
    </Suspense>
  </div>
  <div>
    <Suspense>
      <DogCards :dog-list="searchResults.resultIds" />
      <template #fallback> Loading... </template>
    </Suspense>
    <v-pagination v-model="currentPage" :length="totalPages"></v-pagination>
  </div>
</template>

<style lang="css" scoped></style>
