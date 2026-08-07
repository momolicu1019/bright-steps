
import axios from 'axios';
const API = axios.create({baseURL: 'http://YOUR_LOCAL_IP:8000/api', timeout:5000});
export const getActivities = (module:string)=> API.get(`/activities?module=${module}`).then(r=>r.data);
export const logProgress = (data:any)=> API.post('/progress/', data);
export const explain = (child_id:number, concept:string, lang:string)=> API.post('/ai/explain',{child_id, concept, language:lang});
export default API;
