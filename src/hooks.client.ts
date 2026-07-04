// TYPES
import type { HandleClientError } from '@sveltejs/kit';

export const handleError: HandleClientError = ({ message }) => {
	return { message };
};
