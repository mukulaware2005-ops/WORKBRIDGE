import {
  listBookings as apiListBookings,
  createBooking as apiCreateBooking,
  updateBookingStatus,
} from '../api/api';

export async function listBookings(status) {
  return await apiListBookings(status);
}

export async function createBooking(payload) {
  return await apiCreateBooking(payload);
}

export async function changeBookingStatus(id, status) {
  return await updateBookingStatus(id, status);
}