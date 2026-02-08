import React, { useEffect, useState } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  useLocation,
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

import { getNextSunday } from "./pages/Dashboard.logic";
import { programStore } from "./stores/program";
import { dataStore } from "./stores/data";
import { membersStore } from "./stores/members";
import { formStore } from "./stores/formValues";
import { prayersStore } from "./stores/prayers";
import { musicStore } from "./stores/music";
import { speakersStore } from "./stores/speakers";

function App() {
  const [isProgramSaved, setIsProgramSaved] = useState(false);
  const [savedStatus, setSavedStatus] = useState("");
  const [prayerHistory, setPrayerHistory] = useState([]);
  const [speakerHistory, setSpeakerHistory] = useState([]);
  const [musicHistory, setMusicHistory] = useState([]);
  // const [musicAdmin, setMusicAdmin] = useState([]);

  const [isLoggedIn, setIsLoggedIn] = useState(
    localStorage.getItem("token") && localStorage.getItem("user")
      ? true
      : false,
  );
  const [isLoading, setIsLoading] = useState(false);
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

  const location = useLocation();
  //console.log(musicAdmin);
  // const fetchMusicAdmin = async () => {
  //   try {
  //     const response = await axios.get(`${apiURL}/api/music-admin`);
  //     console.log("Music admin:", response.data);
  //     setMusicAdmin(response.data);
  //     const hasMusicAdmin = getNextSundayAdmin(response.data);
  //     //NOTE: Add logic here to massage the music admin data so I can find the chorister and organist
  //   } catch (error) {
  //     console.error("Error fetching music admin:", error);
  //   }
  // };

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

  useEffect(() => {
    fetchAllData();
  }, [date]);

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
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setIsLoggedIn(false);
  };

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
      {isLoading ? <LoadingOverlay /> : null}
    </ThemeProvider>
  );
}

// Wrap App component with Router
export default () => (
  <BrowserRouter basename="/">
    <App />
  </BrowserRouter>
);
