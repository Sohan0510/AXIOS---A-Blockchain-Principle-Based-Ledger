import { createBrowserRouter } from "react-router";
import { PublicLayout } from "./components/layout/PublicLayout";
import { DashboardLayout } from "./components/layout/DashboardLayout";
import { PublicLanding } from "./pages/PublicLanding";
import { PublicLookup } from "./pages/PublicLookup";
import { Login } from "./pages/Login";
import { Register } from "./pages/Register";
import { PrivacyPolicy } from "./pages/PrivacyPolicy";
import { TermsOfService } from "./pages/TermsOfService";
import { ContactSupport } from "./pages/ContactSupport";
import { Dashboard } from "./pages/Dashboard";
import { CreateLand } from "./pages/CreateLand";
import { LandDetail } from "./pages/LandDetail";
import { IntegrityVerify } from "./pages/IntegrityVerify";
import { Witnesses } from "./pages/Witnesses";
import { TransferLand } from "./pages/TransferLand";
import TransferredLands from "./pages/TransferredLands";
import { NotFound } from "./pages/NotFound";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: PublicLayout,
    children: [
      { index: true, Component: PublicLanding },
      { path: "privacy", Component: PrivacyPolicy },
      { path: "terms", Component: TermsOfService },
      { path: "support", Component: ContactSupport },
      { path: "login", Component: Login },
      { path: "register", Component: Register },
      { path: "verify", Component: IntegrityVerify },
      { path: "*", Component: NotFound },
    ],
  },
  {
    path: "/dashboard",
    Component: DashboardLayout,
    children: [
      { index: true, Component: Dashboard },
      { path: "create", Component: CreateLand },
      { path: "witnesses", Component: Witnesses },
      { path: "transferred", Component: TransferredLands },
      { path: "verify", Component: IntegrityVerify },
      { path: "public", Component: PublicLookup },
      { path: "land/:landId", Component: LandDetail },
      { path: "transfer", Component: TransferLand },
    ],
  },
]);
