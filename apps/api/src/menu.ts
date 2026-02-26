import type { MenuItem } from "@app/shared";

export const MENU: MenuItem[] = [
  {
    id: "pizza-margherita",
    name: "Margherita Pizza",
    description: "Tomato, mozzarella, basil.",
    price: 9.5,
    imageUrl:
      "https://images.unsplash.com/photo-1595854341625-f33ee10dbf94?auto=format&fit=crop&fm=jpg&q=80&w=1600",
    isAvailable: true
  },
  {
    id: "burger-classic",
    name: "Classic Burger",
    description: "Beef patty, lettuce, tomato, onion.",
    price: 8.25,
    imageUrl:
      "https://images.unsplash.com/photo-1586190848861-99aa4a171e90?auto=format&fit=crop&fm=jpg&q=80&w=1600",
    isAvailable: true
  },
  {
    id: "wrap-chicken",
    name: "Chicken Wrap",
    description: "Grilled chicken, veggies, sauce.",
    price: 7.75,
    imageUrl:
      "https://images.unsplash.com/photo-1626700051175-6818013e1d4f?auto=format&fit=crop&fm=jpg&q=80&w=1600",
    isAvailable: true
  },
  {
    id: "fries",
    name: "Fries",
    description: "Crispy fries.",
    price: 3.0,
    imageUrl:
      "https://images.unsplash.com/photo-1761545832967-556acd6b6c2b?auto=format&fit=crop&fm=jpg&q=80&w=1600",
    isAvailable: true
  }
];