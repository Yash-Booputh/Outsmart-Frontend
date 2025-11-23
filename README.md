# Outsmart - After-School Lessons Booking Website (FRONTEND)

This is the frontend of my coursework project for the Fullstack module.

Outsmart is a website where students can explore a variety of after-school lessons, view detailed information, add lessons to a shopping cart, search for specific activities, and complete checkout — all without needing to create an account.

The Frontend of the website was deployed through GitHub Pages on the following link: https://yash-booputh.github.io/Outsmart-Frontend/

## Features

### Home / Lessons Page
- Retrieves and displays all lessons from the backend
- Each lesson shows its subject, location, price, available spaces, and image
- Users can sort lessons by:
  - Subject (A-Z or Z-A)
  - Location (A-Z or Z-A)
  - Price (low to high or high to low)
  - Spaces/Availability (ascending or descending)
- Filter lessons by categories, price range, locations, and minimum seats
- Search for lessons with "search as you type" functionality

### Lesson Details
- View detailed information about each lesson
- Image gallery with multiple images
- See what's included in the lesson

### Shopping Cart
- Add lessons to the cart dynamically using JavaScript
- Cart quantity updates automatically
- Lessons can be removed from the cart
- Prevents adding an item if there are no spaces left
- Updates available spaces on the frontend immediately after adding

### Checkout Form
- Checkout form appears on the cart page
- "Checkout" button is always visible, but only enabled when:
  - Name contains letters only
  - Phone number contains digits only
- Validation is done using JavaScript and regular expressions
- After submitting, a confirmation message is displayed

### API Integration
Uses fetch to:
- Load lesson data from MongoDB Database (GET)
- Submit orders via POST and save in MongoDB database
- Trigger PUT requests that update available lesson spaces after checkout
- Search lessons via backend API

## Technologies Used
- Vue.js 2 (CDN version, Options API only, no SFC)
- HTML, CSS, JavaScript
- Bootstrap
- Font Awesome
- Fully client-side, interacts with backend via REST APIs

## Project Structure
```
frontend/
├── index.html
├── css/
│   └── style.css
├── js/
│   └── app.js
└── assets/
```

## Links
- **GitHub Repository:** https://github.com/Yash-Booputh/Outsmart-Frontend.git
- **Live Demo (GitHub Pages):** https://yash-booputh.github.io/Outsmart-Frontend/
- **Backend API:** https://outsmart-backend-osm4.onrender.com/api/lessons
