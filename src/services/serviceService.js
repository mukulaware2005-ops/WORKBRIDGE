import * as api from '../api/api';

export async function listServices() {
  return api.listServices();
}

export async function createService(serviceData) {
  return api.createService(serviceData);
}

export async function updateService(id, serviceData) {
  return api.updateService(id, serviceData);
}

export async function deleteService(id) {
  return api.deleteService(id);
}

export async function getService(id) {
  return api.getService(id);
}