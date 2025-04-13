import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
});

export const fetchRoutesByGroup = async (groupName = 'group_1') => {
  const res = await api.get(`/routes/${groupName}`);
  return res.data;
};

export const fetchStopCoordinates = async () => {
  const res = await api.get('/stops');
  return res.data;
};
