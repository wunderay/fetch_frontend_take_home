<script setup lang="ts">
import { computed, defineAsyncComponent, ref, watch } from 'vue'
import type { Dog, Match, SearchQuery, SearchResults } from './definitions'
import DogCard from './DogCard.vue'
import FetchLogo from './FetchLogo.vue'
const SearchBar = defineAsyncComponent(() => import('@/components/SearchBar.vue'))
const SearchResults = defineAsyncComponent(() => import('@/components/SearchResults.vue'))

const emit = defineEmits(['logout'])

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

const searchDogs = async (queryParams: URLSearchParams = new URLSearchParams('size=24')) => {
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

const favoriteDogs = ref<Array<Dog>>([])

const handleAddFavorited = (dog: Dog) => {
  favoriteDogs.value.push(dog)
}

const handleRemoveFavorited = (dog: Dog) => {
  favoriteDogs.value = favoriteDogs.value.filter((element) => element.id !== dog.id)
}

const loading = ref(false)
const overlay = ref(false)
const matchDog = ref<Dog>()

const handleMatch = async () => {
  loading.value = true
  overlay.value = !overlay.value
  const matchId = await fetchFavorite()
  matchDog.value = favoriteDogs.value.find((dog) => dog.id === matchId)
  loading.value = false
}
const fetchFavorite = async () => {
  const matchIDs: Array<string> = []

  favoriteDogs.value.forEach((fav) => {
    matchIDs.push(fav.id)
  })

  try {
    const response = await fetch('https://frontend-take-home-service.fetch.com/dogs/match', {
      method: 'post',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(matchIDs),
    })

    if (response.ok) {
      const dog: Match = await response.json()

      return dog.match
    }

    throw new Error(response.statusText)
  } catch (error) {
    console.error(error)
  }
  return ''
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
</script>

<template>
  <v-toolbar title="Fetch Adoption">
    <template v-slot:append>
      <v-btn @click="emit('logout')">Logout</v-btn>
    </template>
  </v-toolbar>
  <FetchLogo></FetchLogo>
  <div>
    <Suspense>
      <SearchBar @query="handleQuery" />
      <template #fallback> Loading... </template>
    </Suspense>
  </div>
  <v-expansion-panels v-if="favoriteDogs.length > 0">
    <v-expansion-panel title="Favorites" class="favorites">
      <v-expansion-panel-text>
        <v-container class="favoriteDogs">
          <v-row>
            <v-col cols="6" md="2" v-for="dog in favoriteDogs" :key="dog.id">
              <DogCard :key="dog.id" :dog="dog" :favorited="true" class="favoriteDogs"></DogCard>
            </v-col>
          </v-row>
          <v-row justify="center"> <v-btn @click="handleMatch" class="button">Match</v-btn> </v-row>
        </v-container>
      </v-expansion-panel-text>
    </v-expansion-panel>
    <v-overlay
      :model-value="overlay"
      class="align-center justify-center"
      @click:outside="overlay = !overlay"
    >
      <v-progress-circular v-if="loading" color="primary" size="64" indeterminate>
      </v-progress-circular>
      <DogCard v-if="!loading && matchDog" :dog="matchDog" :favorited="true"></DogCard>
    </v-overlay>
  </v-expansion-panels>
  <div>
    <v-pagination v-model="currentPage" :length="totalPages"></v-pagination>
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

<style lang="css">
.favorites {
  background-color: lightyellow;
}
.button {
  background-color: rgb(59, 11, 63);
  color: white;
}
</style>
