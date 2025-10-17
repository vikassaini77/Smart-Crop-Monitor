import axios from 'axios';

const API_KEY = 'ede8a9930bdf44d621d7d5fd10534916'; // Make sure your API key is pasted here
const API_URL = 'https://api.openweathermap.org/data/2.5/weather';

export const getWeatherData = async (lat, lon) => {
  try {
    const response = await axios.get(API_URL, {
      params: {
        lat: lat,
        lon: lon,
        appid: API_KEY,
        units: 'metric'
      }
    });

    const data = response.data;
    
    // THIS IS THE FIX: We now extract the 'main' condition from the 'weather' array
    const mainCondition = data.weather && data.weather[0] ? data.weather[0].main : "Clear";

    return {
      temperature: data.main.temp,
      humidity: data.main.humidity,
      location: data.name,
      main: mainCondition, // <-- We now include the main condition in our response
      weather: data.weather // Pass the whole weather object for more detail if needed
    };

  } catch (error) {
    console.error("Error fetching weather data:", error);
    throw new Error('Could not fetch weather data.');
  }
};

