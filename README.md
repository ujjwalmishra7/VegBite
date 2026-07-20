# VegBite — Pure Vegetarian Food Ordering Website

VegBite is a modern and responsive vegetarian food ordering website designed to provide a simple, attractive, and user-friendly online food ordering experience.

The platform offers **100% pure vegetarian food** across multiple categories, allowing users to explore dishes, manage their cart, create an account, and proceed through a checkout flow.

## Developer

**Ujjwal Mishra**

## Features

- 100% Pure Vegetarian Food Platform
- 38 Dishes Across 9 Food Categories
- Food Search and Category Filtering
- Add to Cart and Cart Management
- Increase or Decrease Item Quantity
- Automatic Cart Total Calculation
- User Signup and Login
- OTP-Based Authentication Support (Currently used only Emails)
- User Profile Management
- Checkout and Payment Integration Support
- Fully Responsive Design
- Smooth and Interactive User Experience
- Supabase Integration
- Local Storage Cart Support

## Food Categories

VegBite provides a variety of vegetarian dishes across the following categories:

- North Indian
- South Indian
- Pizza
- Burger
- Chinese
- Sandwich
- Salads
- Desserts
- Beverages

## Technologies Used

- `HTML5` — Website structure and content
- `CSS3` — Styling, layouts, and responsive design
- `JavaScript` — Website functionality and interactions
- `Supabase` — Authentication and cloud database integration
- `Razorpay` — Payment integration support (Currently Disable)
- `Font Awesome` — Icons
- `Google Fonts` — Website typography
- `Local Storage` — Cart and local user data management

## Project Structure

VegBite/
│
├── index.html
├── menu.html
├── cart.html
├── checkout.html
├── login.html
├── signup.html
├── profile.html
├── about.html
│
├── css/
│   ├── style.css
│   ├── menu.css
│   ├── cart.css
│   └── responsive.css
│
├── js/
│   ├── config.js
│   ├── script.js
│   ├── data.js
│   ├── menu.js
│   ├── cart.js
│   ├── auth.js
│   └── profile.js
│
├── images/
│   ├── categories/
│   ├── dishes/
│   └── team/
│
├── SUPABASE_SCHEMA.sql
└── README.md

## Website Pages

### Home Page

The home page introduces VegBite and displays food categories, popular dishes, best sellers, and special food items.

### Menu Page

Users can explore available vegetarian dishes, search for food, and browse dishes by category.

### Cart Page

The cart page allows users to view selected food items, update quantities, remove products, and check the total order amount.

### Checkout Page

Users can review their order details and continue through the checkout process.

### Login & Signup

The authentication pages allow users to create an account and log in using the configured Supabase authentication system.

### Profile Page

Logged-in users can manage and view their profile information.

### About Page

The About page provides information about VegBite, its food philosophy, kitchen, and team.

## Supabase Setup

1. Create a project on Supabase.
2. Open the `SQL Editor`.
3. Run the SQL code available in `SUPABASE_SCHEMA.sql`.
4. Open `js/config.js`.
5. Add your Supabase Project URL and Publishable Key.

## Deployment

VegBite can be deployed using Vercel.
Link: - https://veg-bite.vercel.app/

## Responsive Design

VegBite is designed to work across different screen sizes, including:

* Desktop
* Laptop
* Tablet
* Mobile Devices

The responsive layout provides a smooth browsing and food ordering experience across devices.

## Future Improvements

* Complete Razorpay Payment Integration
* Live Order Tracking
* Admin Dashboard
* Restaurant Management
* Food Reviews and Ratings
* Wishlist Feature
* Discount Coupons
* Order Notifications
* Advanced Search and Filters

## Project Purpose

VegBite was developed as a web development project to demonstrate frontend development, responsive UI design, JavaScript functionality, authentication integration, cart management, and a modern food ordering website experience.
