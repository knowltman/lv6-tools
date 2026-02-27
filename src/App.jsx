import React, { useEffect, useState } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  useLocation,
  useNavigate,
  Navigate,
} from "react-router-dom";
import { Suspense, lazy } from "react";
import Navbar from "./components/NavBar";
import MemberEditor from "./components/MemberEditor/MemberEditor";
import axios from "axios";
import SnackBar from "./components/SnackBar";
import { format } from "date-fns";
import LoadingOverlay from "./components/LoadingOverlay/LoadingOverlay";
import { createTheme, ThemeProvider } from "@mui/material/styles";
// import Members from "./pages/Members";
// import Prayers from "./pages/Prayers";
// import Speakers from "./pages/Speakers";
// import Music from "./pages/Music";
//import Program from "./pages/program";
// import Login from "./pages/login";
// import Dashboard from "./pages/Dashboard";
const Program = lazy(() => import("./pages/Program"));
const Login = lazy(() => import("./pages/Login"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Prayers = lazy(() => import("./pages/Prayers"));
const Speakers = lazy(() => import("./pages/Speakers"));
const Music = lazy(() => import("./pages/Music"));
const Members = lazy(() => import("./pages/Members"));
const Settings = lazy(() => import("./pages/Settings"));
const Bulletin = lazy(() => import("./pages/Bulletin"));
const Hymns = lazy(() => import("./pages/Hymns"));
const MyAccount = lazy(() => import("./pages/MyAccount"));

import { getNextSunday } from "./pages/Dashboard.logic";
import { programStore } from "./stores/program";
import { dataStore } from "./stores/data";
import { membersStore } from "./stores/members";
import { formStore } from "./stores/formValues";
import { prayersStore } from "./stores/prayers";
import { musicStore } from "./stores/music";
import { speakersStore } from "./stores/speakers";
import { settingsStore } from "./stores/settings";

function App() {
  const fetchAllDataCalled = React.useRef(false);
  const { wardName } = settingsStore();
  // Update document title and favicon when wardName changes

  useEffect(() => {
    if (wardName) {
      document.title = `${wardName} Program Generator`;
      // Update favicon
      const favicon = document.querySelector('link[rel="icon"]');
      if (favicon) {
        if (wardName.toLowerCase().includes("lakeview")) {
          favicon.href = "/lv6.svg";
        } else {
          favicon.href = "/generic_favicon.svg";
        }
      }
      // Update apple-touch-icon
      const appleTouchIcon = document.querySelector(
        'link[rel="apple-touch-icon"]',
      );
      if (appleTouchIcon) {
        if (wardName.toLowerCase().includes("lakeview")) {
          appleTouchIcon.href = "/lv6_logo_touch.svg";
        } else {
          appleTouchIcon.href = "/generic_touch_icon.png";
        }
      }
    }
  }, [wardName]);
  const location = useLocation();
  const navigate = useNavigate();
  const [isProgramSaved, setIsProgramSaved] = useState(false);
  const [savedStatus, setSavedStatus] = useState("");
  const [prayerHistory, setPrayerHistory] = useState([]);
  const [speakerHistory, setSpeakerHistory] = useState([]);
  const [musicHistory, setMusicHistory] = useState([]);
  // const [musicAdmin, setMusicAdmin] = useState([]);

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true); // true by default to block UI until login check
  const [loginChecked, setLoginChecked] = useState(false); // track if login check is done
  // const [programsList, setProgramsList] = useState([]);

  const theme = createTheme({
    // typography: {
    //   fontFamily: "Open-Sans, sans-serif !important",
    // },
  });

  const { getAllHymns, hymns } = dataStore();
  const { setSpecialSundays, getProgramData, programsList, getProgramsList } =
    programStore();
  const { user, fetchAllMembers } = membersStore();
  const { formValues2 } = formStore();

  const { getPrayerHistory2 } = prayersStore();
  const { getMusicHistory2, musicAdmin } = musicStore();
  const { getSpeakerHistory2 } = speakersStore();

  const nextSunday = getNextSunday();
  const date = format(nextSunday, "yyyy-MM-dd");

  const fetchAllData = async () => {
    getProgramData(date);
    getPrayerHistory2(date);
    getMusicHistory2(date);
    getSpeakerHistory2();
    getProgramsList();
    getAllHymns();

    try {
      setIsLoading(true);
      fetchAllMembers();
      getAllHymns();

      const [sundaysSpeakersResponse] = await Promise.all([
        axios.get(`/api/sunday-history`),
      ]);

      const sundaySpeakersHistory = sundaysSpeakersResponse.data;
      setSpecialSundays(sundaySpeakersHistory);

      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching data:", error);
      setIsLoading(false);
    }
  };

  // On mount, check login state by hitting a protected endpoint
  useEffect(() => {
    const checkLogin = async () => {
      try {
        await axios.get("/api/members");
        setIsLoggedIn(true);
        // Fetch current user and set in store
        const meRes = await axios.get("/api/me");
        membersStore.getState().setUser(meRes.data);
      } catch (err) {
        setIsLoggedIn(false);
        membersStore.getState().setUser(null);
      }
      setIsLoading(false);
      setLoginChecked(true);
    };
    checkLogin();
  }, []);

  useEffect(() => {
    if (loginChecked && isLoggedIn && !fetchAllDataCalled.current) {
      fetchAllDataCalled.current = true;
      fetchAllData();
    }
    // Only run once after login check
    // eslint-disable-next-line
  }, [loginChecked, isLoggedIn]);

  // Redirect from /login to / if already logged in (after refresh)
  useEffect(() => {
    if (loginChecked && isLoggedIn && location.pathname === "/login") {
      navigate("/");
    }
  }, [loginChecked, isLoggedIn, location.pathname, navigate]);

  const handleSaveProgram = async (event) => {
    event.preventDefault();
    try {
      const response = await axios.post(`/api/programs`, {
        date,
        formValues: formValues2,
        user,
      });
      setSavedStatus(response.data.message);
      setIsProgramSaved(true);
    } catch (error) {
      console.error("Error saving program:", error);
    }
  };

  const handleLogout = () => {
    // Clear the cookie by setting it to expire
    document.cookie = "lv6_access_token=; path=/; max-age=0; SameSite=Lax";
    setIsLoggedIn(false);
    fetchAllDataCalled.current = false;
  };

  if (isLoading) {
    return <LoadingOverlay />;
  }

  return (
    <ThemeProvider theme={theme}>
      {location.pathname !== "/login" && (
        <Navbar
          handleLogout={handleLogout}
          programsList={programsList}
          setIsLoading={setIsLoading}
        />
      )}
      <Suspense fallback={<LoadingOverlay />}>
        <Routes>
          <Route
            path="/login"
            element={<Login setIsLoggedIn={setIsLoggedIn} />}
          />
          <Route
            path="/"
            element={
              isLoggedIn ? (
                <Dashboard
                  prayerSchedule={prayerHistory}
                  speakerSchedule={speakerHistory}
                  musicSchedule={musicHistory}
                  setIsLoading={setIsLoading}
                />
              ) : (
                <Navigate to="/login" />
              )
            }
          />
          <Route
            path="/members"
            element={
              isLoggedIn ? (
                <Members formValues={formValues2} />
              ) : (
                <Navigate to="/login" />
              )
            }
          />
          <Route
            path="/conduct"
            element={
              isLoggedIn ? (
                <Program
                  handleSaveProgram={handleSaveProgram}
                  isLoading={isLoading}
                  setIsLoading={setIsLoading}
                />
              ) : (
                <Navigate to="/login" />
              )
            }
          />
          <Route
            path="/prayers"
            element={isLoggedIn ? <Prayers /> : <Navigate to="/login" />}
          />
          <Route
            path="/speakers"
            element={isLoggedIn ? <Speakers /> : <Navigate to="/login" />}
          />
          <Route
            path="/music"
            element={
              isLoggedIn ? <Music date={date} /> : <Navigate to="/login" />
            }
          />
          <Route
            path="/settings"
            element={isLoggedIn ? <Settings /> : <Navigate to="/login" />}
          />
          <Route
            path="/hymns"
            element={isLoggedIn ? <Hymns /> : <Navigate to="/login" />}
          />
          <Route
            path="/bulletin"
            element={isLoggedIn ? <Bulletin /> : <Navigate to="/login" />}
          />
          <Route
            path="/my-account"
            element={isLoggedIn ? <MyAccount /> : <Navigate to="/login" />}
          />
        </Routes>
      </Suspense>
      <>
        <MemberEditor />
      </>
      <SnackBar
        open={isProgramSaved}
        setOpen={setIsProgramSaved}
        severity={"success"}
        message={savedStatus}
      />
    </ThemeProvider>
  );
}

// Wrap App component with Router
export default () => (
  <BrowserRouter basename="/">
    <App />
  </BrowserRouter>
);
