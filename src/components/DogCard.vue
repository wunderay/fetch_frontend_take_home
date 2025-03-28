<script setup lang="ts">
import { computed, inject, ref, type PropType } from 'vue'
import type { Dog } from './definitions'
import { mdiHeart, mdiHeartOutline } from '@mdi/js'

const props = defineProps({
  dog: {
    type: Object as PropType<Dog>,
    required: true,
  },
  favorited: {
    type: Boolean,
    required: false,
  },
})

const emit = defineEmits(['favorited', 'unFavorited'])
const favorite = ref(props.favorited ? props.favorited : false)
const icon = computed(() => (favorite.value ? mdiHeart : mdiHeartOutline))

const handleClick = () => {
  favorite.value = !favorite.value
  if (favorite.value) {
    emit('favorited')
    return
  }
  emit('unFavorited')
}
</script>

<template>
  <v-card class="dogCard">
    <v-img :src="dog.img" width="200" height="200" class="dog-picture align-end"> </v-img>
    <v-card-title>{{ dog.name }}</v-card-title>

    <v-card-text>
      <span>{{ dog.breed }} | </span>
      <span>Age: {{ dog.age }}</span>
    </v-card-text>
    <v-card-subtitle class="pt-4">
      <div>{{ dog.location?.city }}, {{ dog.location?.state }} {{ dog.zip_code }}</div>
    </v-card-subtitle>
    <v-card-actions>
      <v-btn color="medium-emphasis" :icon="icon" size="medium" @click="handleClick"></v-btn>
    </v-card-actions>
  </v-card>
</template>

<style lang="css" scoped>
.dog-picture {
  object-fit: fill;
}

.dogCard {
}
</style>
