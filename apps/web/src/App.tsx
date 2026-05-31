import { BookingPage } from "./features/booking/BookingPage";
import { AdminAvailabilityPage } from "./pages/AdminAvailabilityPage";
import { AdminBookingsPage } from "./pages/AdminBookingsPage";
import { AdminProfilePage } from "./pages/AdminProfilePage";
import { HomePage } from "./pages/HomePage";
import { LoginPage } from "./pages/LoginPage";
import { SuccessPage } from "./pages/SuccessPage";
import { usePath } from "./lib/router";

export const App = () => {
  const path = usePath();

  if (path.startsWith("/success/")) {
    return <SuccessPage bookingId={path.split("/").at(-1) || ""} />;
  }

  if (path === "/login") return <LoginPage />;
  if (path === "/book") return <BookingPage />;
  if (path === "/admin/availability") return <AdminAvailabilityPage />;
  if (path === "/admin/profile") return <AdminProfilePage />;
  if (path === "/admin") return <AdminBookingsPage />;
  return <HomePage />;
};
