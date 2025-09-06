interface Item {
  id: string;
  title: string;
  description: string;
  category: string;
  type: "lost" | "found";
  images: string[];
  location: string;
  specificLocation?: string;
  date?: string;
  createdAt?: any;
  userId: string;
}
