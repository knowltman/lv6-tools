import { getNextSunday } from "./pages/Dashboard.logic";
import { format } from "date-fns";

export async function findSongsByDate(dataArray, targetDate) {
  const defaultSong = { number: "", name: "" };

  // Filter data for the target date
  const filteredData = dataArray.filter(
    (item) => item.date.startsWith(targetDate) // Check if the date starts with the targetDate
  );

  // Define the song types
  const types = ["intermediate", "opening", "closing", "sacrament"];

  // Build the result object
  const result = types.reduce((acc, type) => {
    const song = filteredData.find((item) => item.type === type);
    acc[type] = song
      ? {
          number: song.hymn_number || "",
          name: song.name || song.song_title || "",
        }
      : defaultSong;
    return acc;
  }, {});

  return result;
}

// export const getCheckedBoxes = (
//   programData,
//   setHaveSpeakers,
//   setHaveNewMembers,
//   setHaveReleases,
//   setHaveCallings,
//   setHaveOtherWardBusiness,
//   setHaveStakeBusiness,
//   setHaveAnnouncements
// ) => {
//   console.log("*********************");
//   programData?.speaker_1?.first_name?.length > 0
//     ? setHaveSpeakers(true)
//     : setHaveSpeakers(false);
//   programData?.new_members[0].length > 0
//     ? setHaveNewMembers(true)
//     : setHaveNewMembers(false);
//   programData?.releases?.[0].length > 0
//     ? setHaveReleases(true)
//     : setHaveReleases(false);
//   programData.callings?.length === 0 ||
//   (programData.callings?.length === 1 && programData.callings[0] === "")
//     ? setHaveCallings(false)
//     : setHaveCallings(true);
//   programData.other_ward_business?.length === 0 ||
//   (programData.other_ward_business?.length === 1 &&
//     programData.other_ward_business[0] === "")
//     ? setHaveOtherWardBusiness(false)
//     : setHaveOtherWardBusiness(true);
//   programData.stakeBusiness?.length === 0 ||
//   (programData.stakeBusiness?.length === 1 &&
//     programData.stakeBusiness[0] === "") ||
//   programData.stakeBusiness === undefined
//     ? setHaveStakeBusiness(false)
//     : setHaveStakeBusiness(true);
//   programData.announcements?.length === 0 ||
//   (programData.announcements?.length === 1 &&
//     programData.announcements[0] === "")
//     ? setHaveAnnouncements(false)
//     : setHaveAnnouncements(true);
// };

const nextSunday = getNextSunday();
const date = format(nextSunday, "yyyy-MM-dd");

export const defaultFormValues = {
  presiding: {
    id: 181,
    first_name: "Bishop",
    last_name: "Odell",
    active: 1,
    last_spoke: null,
    can_ask: 1,
    calling: "bishop",
  },
  conducting: { first_name: "", last_name: "" },
  opening_hymn: { number: "", name: "" },
  sacrament_hymn: { number: "", name: "" },
  intermediate_hymn: { number: "", name: "", performer: "" },
  closing_hymn: { number: "", name: "" },
  invocation: { first_name: "", last_name: "" },
  chorister: {
    active: 1,
    calling: "Chorister",
    can_ask: 1,
    first_name: "Karen",
    id: 9,
    isYouth: null,
    last_name: "Barraclough",
    sex: "F",
  },
  organist: { first_name: "", last_name: "" },
  speaker_1: { first_name: "", last_name: "" },
  speaker_2: { first_name: "", last_name: "" },
  speaker_3: { first_name: "", last_name: "" },
  new_members: [],
  announcements: [],
  releases: [],
  callings: [],
  other_ward_business: [],
  stake_business: [],
  benediction: { first_name: "", last_name: "" },
  date: date,
};

export const getImageName = (user) => {
  if (!user.first_name || !user.last_name) return "";
  return `/${user.first_name
    .charAt(0)
    .toLowerCase()}${user.last_name.toLowerCase()}.webp`;
};
