# Smart Itinerary Planner ✈️

A feature-rich, full-stack web application designed to help users plan their travel itineraries. Users can search for any city to discover attractions and restaurants, view a 5-day weather forecast, and see everything plotted on an interactive map. Registered users can create a personalized, categorized itinerary with drag-and-drop reordering and save their plans to their account.

**Live Demo:** [https://itinerary-planner-gamma.vercel.app/]

---

## ## Key Features

* **Multi-API Data Aggregation:** Fetches and displays attractions, restaurants (Geoapify), and 5-day weather forecasts (OpenWeatherMap).
* **Interactive Mapping:** Plots all locations on a dynamic Leaflet.js map with custom color-coded markers.
* **Full User Authentication:** Secure user registration and login system using JWT for session management.
* **Persistent Data:** User itineraries are saved to a MongoDB database.
* **Categorized Itinerary Builder:** Users can add/remove items to a categorized itinerary (Attractions and Food & Dining).
* **Drag-and-Drop Reordering:** The itinerary list is fully re-orderable using SortableJS.

---

## ## Tech Stack

**Frontend:**
* Vanilla JavaScript (ES6+)
* HTML5 & CSS3
* Leaflet.js
* SortableJS

**Backend:**
* Node.js
* Express.js
* MongoDB Atlas
* Mongoose
* JSON Web Tokens (JWT)
* Bcrypt.js

**Deployment:**
* Backend on **Render**
* Frontend on **Vercel**

---

## ## Setup & Installation

To run this project locally, follow these steps:

1.  Clone the repository:
    `git clone https://github.com/Chiragg13/itinerary-planner.git`
2.  Navigate to the backend and install dependencies:
    `cd itinerary-planner/backend && npm install`
3.  Create a `.env` file in the `backend` folder with the required API keys:
    * `MONGO_URI`
    * `GEOAPIFY_API_KEY`
    * `OPENWEATHER_API_KEY`
    * `JWT_SECRET`
4.  Start the backend server:
    `node server.js`
5.  Open the `frontend/index.html` file in your browser.