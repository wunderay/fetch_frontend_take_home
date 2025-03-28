<script setup lang="ts">
import { ref } from 'vue'
import FetchLogo from './FetchLogo.vue'

defineProps(['loginStatus'])
const emit = defineEmits(['authenticated'])

const name = ref('')
const email = ref('')
const errorMessage = ref('')
const nameRules = [
  (name: string) => {
    if (name) return true
    return 'Name is required.'
  },
]
const emailRules = [
  (value: string) => {
    if (value) return true

    return 'E-mail is required.'
  },
  (value: string) => {
    if (/.+@.+\..+/.test(value)) return true

    return 'E-mail address must be valid e.g. exanple@email.com'
  },
]

const login = async () => {
  const fullname = name.value
  const emailAddress = email.value
  errorMessage.value = ''

  try {
    const response = await fetch('https://frontend-take-home-service.fetch.com/auth/login', {
      method: 'post',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name: fullname, email: emailAddress }),
    })

    if (response.ok) {
      emit('authenticated')
      return
    }
  } catch (error) {
    console.error(error)
  }
  errorMessage.value = 'Incorrect login credentials'
}

const handleClear = () => {
  name.value = ''
  email.value = ''
}
</script>

<template>
  <FetchLogo></FetchLogo>
  <v-container>
    <v-form @submit.prevent="login">
      <v-row justify="center">
        <v-col cols="12" lg="6" align-self="center" justify="center">
          <v-text-field label="Name" v-model="name" :rules="nameRules"></v-text-field>
          <v-text-field label="Email Address" v-model="email" :rules="emailRules"></v-text-field>
          <v-btn class="me-4 button" type="submit"> submit </v-btn>
          <v-btn class="button" @click="handleClear"> clear </v-btn>
        </v-col>
      </v-row>
    </v-form>
  </v-container>
</template>

<style lang="css" scoped>
.button {
  background-color: rgb(59, 11, 63);
  color: white;
}
</style>
