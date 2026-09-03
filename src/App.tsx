import {
  lazy,
  Suspense,
} from "react";

import CookieBanner from "./components/common/CookieBanner";

const Home = lazy(() => import("./pages/Home"));
const Login = lazy(() => import("./pages/Login"));
const Register = lazy(() => import("./pages/Register"));
const Client = lazy(() => import("./pages/Client"));

const ResetPassword = lazy(
  () => import("./pages/ResetPassword")
);

const Admin = lazy(() => import("./pages/Admin"));
const Services = lazy(() => import("./pages/Services"));
const Projects = lazy(() => import("./pages/Projects"));
const News = lazy(() => import("./pages/News"));
const Store = lazy(() => import("./pages/Store"));

const StoreProduct = lazy(
  () => import("./pages/StoreProduct")
);

const Academy = lazy(() => import("./pages/Academy"));
const Business = lazy(() => import("./pages/Business"));

const Innovation = lazy(
  () => import("./pages/Innovation")
);

const About = lazy(() => import("./pages/About"));
const Contact = lazy(() => import("./pages/Contact"));
const Partners = lazy(() => import("./pages/Partners"));
const Support = lazy(() => import("./pages/Support"));
const Privacy = lazy(() => import("./pages/Privacy"));

const DeleteAccount = lazy(
  () => import("./pages/DeleteAccount")
);

const Cookies = lazy(() => import("./pages/Cookies"));
const Legal = lazy(() => import("./pages/Legal"));
const Terms = lazy(() => import("./pages/Terms"));
const NotFound = lazy(() => import("./pages/NotFound"));

function LoadingScreen() {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        background: "#020617",
        color: "#e2e8f0",
        fontFamily: "inherit",
        fontWeight: 700,
        letterSpacing: "0.02em",
      }}
    >
      Chargement...
    </div>
  );
}

function App() {
  const path =
    window.location.pathname.replace(/\/+$/, "") || "/";

  const hash = window.location.hash;

  const isPasswordRecovery =
    hash.includes("type=recovery");

  const isStoreProductPath =
    path.startsWith("/store/product/") &&
    path.length > "/store/product/".length;

  let page;

  if (isPasswordRecovery) {
    page = <ResetPassword />;
  } else if (path === "/") {
    page = <Home />;
  } else if (path === "/login") {
    page = <Login />;
  } else if (path === "/register") {
    page = <Register />;
  } else if (path === "/reset-password") {
    page = <ResetPassword />;
  } else if (path === "/client") {
    page = <Client />;
  } else if (path === "/admin") {
    page = <Admin />;
  } else if (path === "/services") {
    page = <Services />;
  } else if (path === "/projects") {
    page = <Projects />;
  } else if (path === "/news") {
    page = <News />;
  } else if (path === "/store") {
    page = <Store />;
  } else if (isStoreProductPath) {
    page = <StoreProduct />;
  } else if (path === "/academy") {
    page = <Academy />;
  } else if (path === "/business") {
    page = <Business />;
  } else if (path === "/innovation") {
    page = <Innovation />;
  } else if (path === "/about") {
    page = <About />;
  } else if (path === "/contact") {
    page = <Contact />;
  } else if (path === "/partners") {
    page = <Partners />;
  } else if (path === "/support") {
    page = <Support />;
  } else if (path === "/privacy") {
    page = <Privacy />;
  } else if (path === "/delete-account") {
    page = <DeleteAccount />;
  } else if (path === "/cookies") {
    page = <Cookies />;
  } else if (path === "/legal") {
    page = <Legal />;
  } else if (path === "/terms") {
    page = <Terms />;
  } else {
    page = <NotFound />;
  }

  return (
    <>
      <Suspense fallback={<LoadingScreen />}>
        {page}
      </Suspense>

      <CookieBanner />
    </>
  );
}

export default App;
