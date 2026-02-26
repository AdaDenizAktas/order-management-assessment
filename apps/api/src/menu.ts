import type { MenuItem } from "@app/shared";

export const MENU: MenuItem[] = [
  {
    id: "pizza-margherita",
    name: "Margherita Pizza",
    description: "Tomato, mozzarella, basil.",
    price: 9.5,
    imageUrl: "https://picsum.photos/seed/pizza/640/480",
    isAvailable: true
  },
  {
    id: "burger-classic",
    name: "Classic Burger",
    description: "Beef patty, lettuce, tomato, onion.",
    price: 8.25,
    imageUrl: "https://picsum.photos/seed/burger/640/480",
    isAvailable: true
  },
  {
    id: "wrap-chicken",
    name: "Chicken Wrap",
    description: "Grilled chicken, veggies, sauce.",
    price: 7.75,
    imageUrl: "https://picsum.photos/seed/wrap/640/480",
    isAvailable: true
  },
  {
    id: "fries",
    name: "Fries",
    description: "Crispy fries.",
    price: 3.0,
    imageUrl: "https://picsum.photos/seed/fries/640/480",
    isAvailable: true
  }
];
