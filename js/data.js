const IMAGE_BASE = "images/dishes/";

const CATEGORIES = [
  { id: "north-indian", label: "North Indian", image: "images/categories/north-indian.jpg" },
  { id: "south-indian", label: "South Indian", image: "images/categories/south-indian.jpg" },
  { id: "pizza", label: "Pizza", image: "images/categories/pizza.jpg" },
  { id: "burger", label: "Burger", image: "images/categories/burger.jpg" },
  { id: "sandwich", label: "Sandwich", image: "images/categories/sandwich.jpg" },
  { id: "chinese", label: "Chinese", image: "images/categories/chinese.jpg" },
  { id: "salads", label: "Salads", image: "images/categories/salads.jpg" },
  { id: "beverages", label: "Beverages", image: "images/categories/beverages.jpg" },
  { id: "desserts", label: "Desserts", image: "images/categories/desserts.jpg" },
];

const DISHES = [
  { id: "ni-01", name: "Paneer Butter Masala", category: "north-indian", price: 249, rating: 4.8, image: IMAGE_BASE + "paneer-butter-masala.jpg", desc: "Paneer cubes simmered in a velvety tomato-butter gravy.", tags: ["bestseller"] },
  { id: "ni-02", name: "Dal Makhani", category: "north-indian", price: 199, rating: 4.7, image: IMAGE_BASE + "dal-makhani.jpg", desc: "Black lentils slow-cooked overnight with butter and cream.", tags: ["popular"] },
  { id: "ni-03", name: "Chole Bhature", category: "north-indian", price: 179, rating: 4.6, image: IMAGE_BASE + "chole-bhature.jpg", desc: "Spiced chickpea curry with fluffy fried bread.", tags: ["special"] },
  { id: "ni-04", name: "Malai Kofta", category: "north-indian", price: 229, rating: 4.5, image: IMAGE_BASE + "malai-kofta.jpg", desc: "Cottage cheese dumplings in a creamy cashew gravy.", tags: [] },
  { id: "ni-05", name: "Rajma Chawal", category: "north-indian", price: 169, rating: 4.4, image: IMAGE_BASE + "rajma-chawal.jpg", desc: "Kidney bean curry served with steamed basmati rice.", tags: [] },
  { id: "ni-06", name: "Tandoori Roti", category: "north-indian", price: 60, rating: 4.6, image: IMAGE_BASE + "tandoori-roti.jpg", desc: "Whole-wheat bread baked fresh in a clay tandoor.", tags: [] },
  { id: "si-01", name: "Masala Dosa", category: "south-indian", price: 149, rating: 4.8, image: IMAGE_BASE + "masala-dosa.jpg", desc: "Crisp rice crepe filled with spiced potato masala.", tags: ["bestseller"] },
  { id: "si-02", name: "Idli Sambar", category: "south-indian", price: 119, rating: 4.6, image: IMAGE_BASE + "idli-sambar.jpg", desc: "Steamed rice cakes with lentil sambar and chutney.", tags: ["popular"] },
  { id: "si-03", name: "Medu Vada", category: "south-indian", price: 109, rating: 4.5, image: IMAGE_BASE + "medu-vada.jpg", desc: "Crunchy lentil doughnuts served piping hot.", tags: [] },
  { id: "si-04", name: "Uttapam", category: "south-indian", price: 139, rating: 4.4, image: IMAGE_BASE + "uttapam.jpg", desc: "Thick rice pancake topped with onion, tomato and chilli.", tags: [] },
  { id: "si-05", name: "Curd Rice", category: "south-indian", price: 99, rating: 4.3, image: IMAGE_BASE + "curd-rice.jpg", desc: "Comforting rice tempered with curry leaves and yoghurt.", tags: [] },
  { id: "pz-01", name: "Margherita Pizza", category: "pizza", price: 229, rating: 4.6, image: IMAGE_BASE + "margherita-pizza.jpg", desc: "Classic tomato, mozzarella and fresh basil.", tags: ["popular"] },
  { id: "pz-02", name: "Farmhouse Pizza", category: "pizza", price: 279, rating: 4.7, image: IMAGE_BASE + "farmhouse-pizza.jpg", desc: "Loaded with capsicum, onion, tomato and corn.", tags: ["bestseller"] },
  { id: "pz-03", name: "Paneer Tikka Pizza", category: "pizza", price: 299, rating: 4.8, image: IMAGE_BASE + "paneer-tikka-pizza.jpg", desc: "Tandoori paneer chunks on a smoky tikka base.", tags: ["special"] },
  { id: "pz-04", name: "Cheese Burst Pizza", category: "pizza", price: 319, rating: 4.5, image: IMAGE_BASE + "cheese-burst-pizza.jpg", desc: "Extra mozzarella stuffed into every slice.", tags: [] },
  { id: "bg-01", name: "Classic Veg Burger", category: "burger", price: 99, rating: 4.4, image: IMAGE_BASE + "classic-veg-burger.jpg", desc: "Crisp potato patty, lettuce and house sauce.", tags: [] },
  { id: "bg-02", name: "Paneer Tikka Burger", category: "burger", price: 149, rating: 4.7, image: IMAGE_BASE + "paneer-tikka-burger.jpg", desc: "Grilled paneer patty with mint mayo.", tags: ["bestseller"] },
  { id: "bg-03", name: "Cheese Loaded Burger", category: "burger", price: 169, rating: 4.6, image: IMAGE_BASE + "cheese-loaded-burger.jpg", desc: "Double cheese slices over a crunchy veg patty.", tags: ["popular"] },
  { id: "bg-04", name: "Mexican Bean Burger", category: "burger", price: 159, rating: 4.3, image: IMAGE_BASE + "mexican-bean-burger.jpg", desc: "Spiced bean patty with jalapeno salsa.", tags: [] },
  { id: "sw-01", name: "Grilled Veg Sandwich", category: "sandwich", price: 89, rating: 4.3, image: IMAGE_BASE + "grilled-veg-sandwich.jpg", desc: "Buttery grilled bread with fresh vegetables.", tags: [] },
  { id: "sw-02", name: "Club Sandwich", category: "sandwich", price: 139, rating: 4.6, image: IMAGE_BASE + "club-sandwich.jpg", desc: "Triple-layer sandwich with cheese and veggies.", tags: ["popular"] },
  { id: "sw-03", name: "Paneer Tikka Sandwich", category: "sandwich", price: 129, rating: 4.5, image: IMAGE_BASE + "paneer-tikka-sandwich.jpg", desc: "Smoky paneer tikka filling, toasted golden.", tags: [] },
  { id: "sw-04", name: "Corn and Cheese Sandwich", category: "sandwich", price: 109, rating: 4.4, image: IMAGE_BASE + "corn-cheese-sandwich.jpg", desc: "Sweet corn kernels with melted cheese.", tags: [] },
  { id: "ch-01", name: "Veg Hakka Noodles", category: "chinese", price: 149, rating: 4.5, image: IMAGE_BASE + "veg-hakka-noodles.jpg", desc: "Wok-tossed noodles with crunchy vegetables.", tags: ["popular"] },
  { id: "ch-02", name: "Veg Manchurian", category: "chinese", price: 159, rating: 4.6, image: IMAGE_BASE + "veg-manchurian.jpg", desc: "Fried veg balls tossed in a tangy Indo-Chinese sauce.", tags: ["bestseller"] },
  { id: "ch-03", name: "Fried Rice", category: "chinese", price: 139, rating: 4.4, image: IMAGE_BASE + "fried-rice.jpg", desc: "Classic wok-fried rice with garden vegetables.", tags: [] },
  { id: "ch-04", name: "Spring Rolls", category: "chinese", price: 129, rating: 4.3, image: IMAGE_BASE + "spring-rolls.jpg", desc: "Crispy rolls stuffed with cabbage and carrot.", tags: [] },
  { id: "sl-01", name: "Greek Salad", category: "salads", price: 149, rating: 4.4, image: IMAGE_BASE + "greek-salad.jpg", desc: "Cucumber, olives, feta and cherry tomatoes.", tags: [] },
  { id: "sl-02", name: "Sprouts Salad", category: "salads", price: 99, rating: 4.2, image: IMAGE_BASE + "sprouts-salad.jpg", desc: "Protein-packed sprouts with lemon and spices.", tags: [] },
  { id: "sl-03", name: "Caesar Salad Veg", category: "salads", price: 169, rating: 4.5, image: IMAGE_BASE + "caesar-salad-veg.jpg", desc: "Crisp romaine, croutons and creamy dressing.", tags: ["popular"] },
  { id: "bv-01", name: "Masala Chaas", category: "beverages", price: 49, rating: 4.6, image: IMAGE_BASE + "masala-chaas.jpg", desc: "Spiced buttermilk, cooling and refreshing.", tags: [] },
  { id: "bv-02", name: "Fresh Lime Soda", category: "beverages", price: 59, rating: 4.5, image: IMAGE_BASE + "fresh-lime-soda.jpg", desc: "Zesty lime with a fizzy soda finish.", tags: [] },
  { id: "bv-03", name: "Mango Lassi", category: "beverages", price: 79, rating: 4.8, image: IMAGE_BASE + "mango-lassi.jpg", desc: "Thick yoghurt smoothie with Alphonso mango.", tags: ["bestseller"] },
  { id: "bv-04", name: "Cold Coffee", category: "beverages", price: 89, rating: 4.5, image: IMAGE_BASE + "cold-coffee.jpg", desc: "Chilled coffee blended with ice cream.", tags: [] },
  { id: "ds-01", name: "Gulab Jamun", category: "desserts", price: 79, rating: 4.7, image: IMAGE_BASE + "gulab-jamun.jpg", desc: "Soft milk dumplings soaked in rose syrup.", tags: ["popular"] },
  { id: "ds-02", name: "Rasmalai", category: "desserts", price: 99, rating: 4.8, image: IMAGE_BASE + "rasmalai.jpg", desc: "Cottage cheese discs in saffron-cardamom milk.", tags: ["bestseller"] },
  { id: "ds-03", name: "Chocolate Brownie", category: "desserts", price: 109, rating: 4.6, image: IMAGE_BASE + "chocolate-brownie.jpg", desc: "Warm fudgy brownie with a molten centre.", tags: ["special"] },
  { id: "ds-04", name: "Kulfi Stick", category: "desserts", price: 69, rating: 4.5, image: IMAGE_BASE + "kulfi-stick.jpg", desc: "Traditional malai kulfi on a wooden stick.", tags: [] },
];

const REVIEWS = [
  { name: "Ananya Sharma", city: "Lucknow", rating: 5, text: "The paneer butter masala tastes exactly like home-cooked food. Fast delivery too!" },
  { name: "Rohan Mehta", city: "Indore", rating: 5, text: "Been ordering from VegBite for months and never had a mix-up on the veg promise." },
  { name: "Priya Nair", city: "Kochi", rating: 4, text: "Loved the dosa and filter coffee combo. Packaging keeps everything crisp." },
  { name: "Karan Verma", city: "Delhi", rating: 5, text: "Their Chole Bhature is the closest I have found to a Chandni Chowk stall." },
  { name: "Sneha Iyer", city: "Chennai", rating: 5, text: "Clean app, honest pricing, and the food actually arrives hot." },
];

const TEAM = [
  { name: "Aarav Kapoor", role: "Founder and Head Chef", image: "images/team/aarav-kapoor.jpg" },
  { name: "Meera Joshi", role: "Culinary Director", image: "images/team/meera-joshi.jpg" },
  { name: "Devansh Rao", role: "Operations Lead", image: "images/team/devansh-rao.jpg" },
  { name: "Ishita Sen", role: "Quality and Sourcing", image: "images/team/ishita-sen.jpg" },
];
