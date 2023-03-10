import { browser } from '$app/environment';
import * as fcl from '@onflow/fcl';
import { flowUser } from '../lib/stores/flow/flowStore';

if (browser) {
	// set Svelte $user store to currentUser,
	// so other components can access it
	fcl.currentUser.subscribe(flowUser.set, []);
}

// Lifecycle FCL Auth functions
export const unauthenticate = () => fcl.unauthenticate();
export const logIn = async () => await fcl.logIn();
export const signUp = () => fcl.signUp();
