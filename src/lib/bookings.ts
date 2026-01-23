import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";

export type BookingInput = {
  tourName: string;
  customerName: string;
  email: string;
  phone: string;
  guests: number;
  date: string; // like "2026-01-30"
};

export async function createBooking(data: BookingInput) {
  // Basic validation
  if (!data.tourName || !data.customerName || !data.email) {
    throw new Error("Missing required fields");
  }

  const docRef = await addDoc(collection(db, "bookings"), {
    ...data,
    status: "pending",
    createdAt: serverTimestamp(),
  });

  return docRef.id;
}
