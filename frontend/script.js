// File: frontend/script.js
// --- DOM Element Selection ---
const searchForm = document.getElementById('search-form');
const cityInput = document.getElementById('city-input');
const attractionsList = document.getElementById('attractions-list');
const restaurantsList = document.getElementById('restaurants-list');
const mapContainer = document.getElementById('map-container');
const itineraryPlacesList = document.getElementById('itinerary-places-list');
const itineraryRestaurantsList = document.getElementById('itinerary-restaurants-list');
const nearbyModal = document.getElementById('modal');
const nearbyModalBody = document.getElementById('modal-body');
const userActions = document.getElementById('user-actions');
const authModal = document.getElementById('auth-modal');
const authModalBody = document.getElementById('auth-modal-body');
const myItinerariesModal = document.getElementById('my-itineraries-modal');
const myItinerariesList = document.getElementById('my-itineraries-list');
const weatherContainer = document.getElementById('weather-container');
// CHANGED: Use the new unique classes for each close button
const closeNearbyModalBtn = document.querySelector('.nearby-close');
const closeAuthModalBtn = document.querySelector('.auth-close');
const closeMyItinerariesModalBtn = document.querySelector('.my-itineraries-close');

// --- Global State ---
let map;
let searchResults = { places: [], restaurants: [] };
let itinerary = { places: [], restaurants: [] };
let currentCity = { name: null, coords: null };
let savedItineraries = [];
// --- Main Search Event Listener ---
searchForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const city = cityInput.value;
  attractionsList.innerHTML = '<p>Loading attractions...</p>';
  restaurantsList.innerHTML = '<p>Loading restaurants...</p>';
  weatherContainer.innerHTML = '';
  if (map) map.remove();
  try {
    const response = await fetch('https://itinerary-planner-9t1q.onrender.com/api/places', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ city }),
    });
    if (!response.ok) throw new Error((await response.json()).error || 'Something went wrong');
    const data = await response.json();
    searchResults = { places: data.places, restaurants: data.restaurants };
    currentCity = { name: city, coords: data.city_coords };
    if (data.places.length > 0 || data.restaurants.length > 0) {
      const { lon, lat } = data.city_coords;
      initMap([lat, lon]);
    }
    displayResults(data.places, attractionsList, 'places');
    displayResults(data.restaurants, restaurantsList, 'restaurants');
    displayWeather(data.weather);
  } catch (error) {
    attractionsList.innerHTML = `<p class="error">${error.message}</p>`;
    restaurantsList.innerHTML = '';
  }
});
// --- Map and Display Functions ---
function initMap(coords) {
  map = L.map(mapContainer).setView(coords, 13);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  }).addTo(map);
}
function displayResults(items, container, type) {
  if (items.length === 0) {
    container.innerHTML = `<p>No ${type} found.</p>`; return;
  }
  const html = items.map(item => {
    const { name, address_line2, place_id } = item.properties;
    return `<div class="place" data-place-id="${place_id}" data-type="${type}"><h3>${name||'Unnamed Place'}</h3><p>${address_line2||''}</p><button class="add-btn" data-type="${type}" data-place-id="${place_id}">Add to Itinerary</button></div>`;
  }).join('');
  container.innerHTML = html;
  items.forEach(item => addMarker(item, type === 'places' ? 'blue' : 'red'));
}
function addMarker(item, color) {
    const { lon, lat, name } = item.properties;
    if (lat && lon) {
        const marker = L.marker([lat, lon], { icon: L.icon({ iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-${color}.png`, shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png', iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41] }) });
        marker.addTo(map).bindPopup(`<b>${name||'Unnamed Place'}</b>`);
    }
}
function displayWeather(forecasts) {
    if (!forecasts || forecasts.length === 0) {
        weatherContainer.innerHTML = ''; return;
    }
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const html = forecasts.map((day, index) => {
        const date = new Date();
        date.setDate(date.getDate() + index);
        const dayName = days[date.getDay()];
        const formattedDate = `${months[date.getMonth()]} ${date.getDate()}`;
        
        // NEW: Updated HTML structure for a horizontal layout
        return `
            <div class="weather-day">
                <div class="weather-date-group">
                    <h4>${dayName}</h4>
                    <p class="weather-date">${formattedDate}</p>
                </div>
                <img src="https://openweathermap.org/img/wn/${day.icon}@2x.png" alt="${day.description}">
                <p class="temp">${Math.round(day.temp)}°C</p>
            </div>`;
    }).join('');
    weatherContainer.innerHTML = html;
}
// --- Itinerary Functions ---
function addToItinerary(placeId, type) {
  const listToSearch = searchResults[type];
  const placeToAdd = listToSearch.find(p => p.properties.place_id === placeId);
  const isAlreadyIn = itinerary[type].some(p => p.properties.place_id === placeId);
  if (placeToAdd && !isAlreadyIn) {
    itinerary[type].push(placeToAdd);
    renderItinerary();
  }
}
function removeFromItinerary(placeId, type) {
  itinerary[type] = itinerary[type].filter(p => p.properties.place_id !== placeId);
  renderItinerary();
}
function renderItinerary() {
  if (itinerary.places.length === 0) {
    itineraryPlacesList.innerHTML = '<li>No attractions added yet.</li>';
  } else {
    itineraryPlacesList.innerHTML = itinerary.places.map(place => renderItineraryItem(place, 'places')).join('');
  }
  if (itinerary.restaurants.length === 0) {
    itineraryRestaurantsList.innerHTML = '<li>No restaurants added yet.</li>';
  } else {
    itineraryRestaurantsList.innerHTML = itinerary.restaurants.map(place => renderItineraryItem(place, 'restaurants')).join('');
  }
}
function renderItineraryItem(place, type) {
    const { name, place_id, lon, lat } = place.properties;
    return `<li class="itinerary-item" data-place-id="${place_id}" data-type="${type}"><div><span>${name}</span><button class="remove-btn" data-place-id="${place_id}" data-type="${type}">Remove</button></div><a href="#" class="more-info-btn" data-lon="${lon}" data-lat="${lat}">Click for nearby restaurants</a></li>`;
}
// --- Save and Load Functions ---
async function saveItinerary() {
    const token = localStorage.getItem('token');
    if (!token) { alert('Please log in to save your itinerary.'); return; }
    if (!currentCity.name || (itinerary.places.length === 0 && itinerary.restaurants.length === 0)) {
        alert('Please search for a city and add items to your itinerary before saving.'); return;
    }
    try {
        const response = await fetch('https://itinerary-planner-9t1q.onrender.com/api/itineraries', { method: 'POST', headers: { 'Content-Type': 'application/json', 'x-auth-token': token }, body: JSON.stringify({ cityName: currentCity.name, city_coords: currentCity.coords, places: itinerary.places, restaurants: itinerary.restaurants }) });
        if (!response.ok) throw new Error('Failed to save itinerary');
        alert('Itinerary saved successfully!');
    } catch (err) {
        alert(err.message);
    }
}
async function showMyItineraries() {
    const token = localStorage.getItem('token');
    if (!token) return;
    myItinerariesList.innerHTML = '<p>Loading...</p>';
    myItinerariesModal.style.display = 'block';
    try {
        const response = await fetch('https://itinerary-planner-9t1q.onrender.com/api/itineraries', { headers: { 'x-auth-token': token } });
        if (!response.ok) throw new Error('Could not fetch itineraries');
        savedItineraries = await response.json();
        if (savedItineraries.length === 0) {
            myItinerariesList.innerHTML = '<p>You have no saved itineraries.</p>'; return;
        }
        myItinerariesList.innerHTML = savedItineraries.map((saved, index) => {
            const date = new Date(saved.createdAt).toLocaleDateString();
            return `<div class="itinerary-item" data-index="${index}"><h4>${saved.cityName}</h4><p>Saved on ${date}</p><p>${saved.places.length} attractions, ${saved.restaurants.length} restaurants</p></div>`;
        }).join('');
    } catch (err) {
        myItinerariesList.innerHTML = `<p class="error">${err.message}</p>`;
    }
}
function loadItinerary(index) {
    const loaded = savedItineraries[index];
    if (!loaded) return;
    itinerary = { places: loaded.places, restaurants: loaded.restaurants };
    currentCity = { name: loaded.cityName, coords: loaded.city_coords };
    cityInput.value = currentCity.name;
    if (map) map.remove();
    initMap([currentCity.coords.lat, currentCity.coords.lon]);
    renderItinerary();
    itinerary.places.forEach(p => addMarker(p, 'blue'));
    itinerary.restaurants.forEach(p => addMarker(p, 'red'));
    myItinerariesModal.style.display = 'none';
}
// --- Nearby Restaurants Modal ---
async function showNearbyRestaurants(lon, lat) {
    nearbyModalBody.innerHTML = '<p>Searching...</p>';
    nearbyModal.style.display = 'block';
    try {
        const response = await fetch('https://itinerary-planner-9t1q.onrender.com/api/places/nearby-restaurants', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ lon, lat }) });
        if (!response.ok) throw new Error('Failed to fetch nearby restaurants');
        const nearby = await response.json();
        if (nearby.length === 0) {
            nearbyModalBody.innerHTML = '<p>No nearby restaurants found.</p>'; return;
        }
        nearbyModalBody.innerHTML = nearby.map(place => `<div class="place"><h3>${place.properties.name||'Unnamed Place'}</h3><p>${place.properties.address_line2||''}</p></div>`).join('');
    } catch (error) {
        nearbyModalBody.innerHTML = `<p class="error">${error.message}</p>`;
    }
}
// --- Authentication Logic ---
function updateUIForAuthState() {
    const token = localStorage.getItem('token');
    if (token) {
        userActions.innerHTML = `<button id="save-itinerary-btn">Save Itinerary</button><button id="my-itineraries-btn">My Itineraries</button><button id="logout-btn">Logout</button>`;
        document.getElementById('logout-btn').addEventListener('click', () => { localStorage.removeItem('token'); itinerary = { places: [], restaurants: [] }; currentCity = { name: null, coords: null }; cityInput.value = ''; renderItinerary(); updateUIForAuthState(); });
        document.getElementById('save-itinerary-btn').addEventListener('click', saveItinerary);
        document.getElementById('my-itineraries-btn').addEventListener('click', showMyItineraries);
    } else {
        userActions.innerHTML = `<button id="register-btn">Register</button><button id="login-btn">Login</button>`;
        document.getElementById('register-btn').addEventListener('click', () => showAuthForm('register'));
        document.getElementById('login-btn').addEventListener('click', () => showAuthForm('login'));
    }
}
function showAuthForm(type) {
    const isLogin = type === 'login';
    authModalBody.innerHTML = `<form class="auth-form" id="${type}-form"><h2>${isLogin ? 'Login' : 'Register'}</h2> ${!isLogin ? '<input type="text" name="name" placeholder="Name" required>' : ''}<input type="email" name="email" placeholder="Email" required><input type="password" name="password" placeholder="Password" required><button type="submit">${isLogin ? 'Login' : 'Register'}</button><p class="auth-error" id="auth-error"></p><p class="form-toggle-link" id="form-toggle">${isLogin ? 'Need an account? Register' : 'Already have an account? Login'}</p></form>`;
    authModal.style.display = 'block';
    document.getElementById('form-toggle').addEventListener('click', () => showAuthForm(isLogin ? 'register' : 'login'));
    document.getElementById(`${type}-form`).addEventListener('submit', handleAuthSubmit);
}
async function handleAuthSubmit(e) {
    e.preventDefault();
    const form = e.target; const type = form.id.replace('-form', ''); const errorEl = document.getElementById('auth-error'); const data = Object.fromEntries(new FormData(form).entries());
    try {
        const response = await fetch(`https://itinerary-planner-9t1q.onrender.com/api/users/${type}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
        const result = await response.json();
        if (!response.ok) throw new Error(result.msg || 'An error occurred');
        localStorage.setItem('token', result.token);
        authModal.style.display = 'none';
        updateUIForAuthState();
    } catch (err) {
        errorEl.textContent = err.message;
    }
}
// --- Event Listeners ---
document.getElementById('results-container').addEventListener('click', (e) => {
    const addBtn = e.target.closest('.add-btn');
    if (addBtn) {
        const placeDiv = addBtn.closest('.place');
        const { placeId, type } = placeDiv.dataset;
        addToItinerary(placeId, type);
    }
});
document.getElementById('itinerary-container').addEventListener('click', (e) => {
    e.preventDefault();
    if (e.target.classList.contains('remove-btn')) {
        const { placeId, type } = e.target.dataset;
        removeFromItinerary(placeId, type);
    }
    if (e.target.classList.contains('more-info-btn')) {
        const { lon, lat } = e.target.dataset;
        showNearbyRestaurants(lon, lat);
    }
});
myItinerariesList.addEventListener('click', (e) => {
    const item = e.target.closest('.itinerary-item');
    if (item) loadItinerary(item.dataset.index);
});
// CHANGED: Use the correct variables for each close button
closeNearbyModalBtn.onclick = () => { nearbyModal.style.display = "none"; }
closeAuthModalBtn.onclick = () => { authModal.style.display = "none"; }
closeMyItinerariesModalBtn.onclick = () => { myItinerariesModal.style.display = "none"; }
window.onclick = (e) => {
    if (e.target == nearbyModal) nearbyModal.style.display = "none";
    if (e.target == authModal) authModal.style.display = "none";
    if (e.target == myItinerariesModal) myItinerariesModal.style.display = "none";
}
// --- SortableJS ---
new Sortable(itineraryPlacesList, { group: 'itinerary', animation: 150, onEnd: (evt) => updateItineraryOrder(evt) });
new Sortable(itineraryRestaurantsList, { group: 'itinerary', animation: 150, onEnd: (evt) => updateItineraryOrder(evt) });
function updateItineraryOrder(evt) {
    const { from, to, oldIndex, newIndex } = evt;
    const fromType = from.id === 'itinerary-places-list' ? 'places' : 'restaurants';
    const toType = to.id === 'itinerary-places-list' ? 'places' : 'restaurants';
    const [movedItem] = itinerary[fromType].splice(oldIndex, 1);
    itinerary[toType].splice(newIndex, 0, movedItem);
}
// --- Initial Render ---
renderItinerary();
updateUIForAuthState();