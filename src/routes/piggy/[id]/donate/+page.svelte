<script lang="ts">
	import { page } from '$app/stores';
  import { goto } from '$app/navigation'
  import { onMount } from 'svelte'
  import { loadStripe } from '@stripe/stripe-js'
  import { env } from '$env/dynamic/public'
  import { Elements, PaymentElement, LinkAuthenticationElement } from 'svelte-stripe'
	import Icon from '@iconify/svelte';

  let stripe = null
  let clientSecret = null
  let error = null
  let elements
  let processing = false

  onMount(async () => {
    stripe = await loadStripe(env.PUBLIC_STRIPE_KEY)
    // create payment intent server side
    clientSecret = await createPaymentIntent()
  })
  
  async function createPaymentIntent() {
    const response = await fetch('/api/payment-intent', {
      method: 'POST',
      headers: {
        'content-type': 'application/json'
      },
      body: JSON.stringify({})
    })
    const { clientSecret } = await response.json()
    return clientSecret
  }

  async function submit() {
    // avoid processing duplicates
    if (processing) return
    processing = true
    // confirm payment with stripe
    const result = await stripe.confirmPayment({
      elements,
      redirect: 'if_required'
    })

    console.log(elements);
    
    // log results, for debugging
    console.log({ result })
    if (result.error) {
      // payment failed, notify user
      error = result.error
      processing = false
    } else {
      // payment succeeded, redirect to "thank you" page
      goto(`${$page.url.pathname}/thank-you`)
    }
  }
</script>

{#if error}
  <p>{error.message} Please try again.</p>
{/if}

{#if stripe && clientSecret}
  <Elements
    {stripe}
    {clientSecret}
    theme="flat"
    labels="floating"
    variables={{ colorPrimary: '#7c4dff' }}
    rules={{ '.Input': { border: 'solid 1px #0002' } }}
    bind:elements
  >
    <form on:submit|preventDefault={submit}>
      <LinkAuthenticationElement />
      <PaymentElement />
      <button disabled={processing}>
        {#if processing}
          Processing...
        {:else}
          Donate
        {/if}
      </button>
    </form>
  </Elements>
{:else}
  <div class="spinner-wrapper">
    <Icon icon="svg-spinners:gooey-balls-2" color="var(--md-sys-color-primary)" width="40px" />
  </div>
{/if}

<style>
  form {
    display: flex;
    flex-direction: column;
    gap: 10px;
    padding: 2rem;
    border-radius: 20px;
  }

  button {
    padding: 0.9rem;
    font-size: 1.2rem;
    margin: 0.6rem 0;
  }

  .spinner-wrapper {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100%;
  }
</style>