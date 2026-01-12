import {
  startOfYear,
  endOfYear,
  endOfMonth,
  format,
  addDays,
  parseISO,
  getYear,
  getWeek,
  getMonth,
  startOfMonth,
  startOfWeek,
  endOfWeek,
  isSameMonth,
} from "date-fns";

const getSundaysOfYear = (year) => {
  const sundays = [];
  let date = startOfYear(new Date(year, 0, 1));
  const end = endOfYear(date);

  while (date <= end) {
    if (date.getDay() === 0) {
      sundays.push(format(date, "yyyy-MM-dd"));
    }
    date = addDays(date, 1);
  }

  return sundays;
};

// Map data to Sunday format for the whole year
export const mapToSundaysFormat = (rows, year) => {
  const sundays = getSundaysOfYear(year);
  const sundaySchedule = sundays.map((date) => ({
    date,
    invocation: {},
    benediction: {},
  }));

  rows.forEach((row) => {
    const { date, id, first_name, last_name, type } = row;
    const normalizedDate = date; //format(parseISO(date), "yyyy-MM-dd");
    const sundayEntry = sundaySchedule.find(
      (entry) => entry.date === normalizedDate
    );

    if (sundayEntry) {
      if (type === "invocation" && !sundayEntry.invocation.id) {
        sundayEntry.invocation = { id, name: `${first_name} ${last_name}` };
      } else if (type === "benediction" && !sundayEntry.benediction.id) {
        sundayEntry.benediction = { id, name: `${first_name} ${last_name}` };
      }
    }
  });

  return sundaySchedule;
};

export const mapToSundaysSpeakerFormat = (rows, year) => {
  const sundays = getSundaysOfYear(year);
  const sundaySchedule = sundays.map((date) => ({
    date,
    speakers: [], // Use an array to hold all speakers for the date
  }));

  const filteredRows = rows.filter((row) => {
    const rowYear = getYear(parseISO(row.date));
    return rowYear === year;
  });

  filteredRows.forEach((row) => {
    const { date, id, first_name, last_name, subject, order, speaker_id } = row;
    const normalizedDate = format(parseISO(date), "yyyy-MM-dd");
    const sundayEntry = sundaySchedule.find(
      (entry) => entry.date === normalizedDate
    );

    if (sundayEntry) {
      // Push the speaker into the speakers array
      sundayEntry.speakers.push({
        id,
        name: `${first_name} ${last_name}`,
        subject: subject || "TBD", // Default to 'TBD' if subject is null
        order: order,
        speaker_id: speaker_id,
      });
    }
  });

  return sundaySchedule;
};

// export const mapToSundaysMusicFormat = (rows, musicAdmin, year) => {
//   const sundays = getSundaysOfYear(year);
//   const sundaySchedule = sundays.map((date) => ({
//     date,
//     opening: {},
//     sacrament: {},
//     intermediate: {},
//     closing: {},
//   }));

//   rows.forEach((row) => {
//     const {
//       id,
//       date,
//       hymn_number,
//       name,
//       song_title,
//       performer,
//       type,
//       organist,
//       chorister,
//     } = row;
//     const normalizedDate = format(parseISO(date), "yyyy-MM-dd");
//     const sundayEntry = sundaySchedule.find(
//       (entry) => entry.date === normalizedDate
//     );

//     if (sundayEntry) {
//       if (type === "opening" && !sundayEntry.opening.hymn_number) {
//         sundayEntry.opening = {
//           id,
//           hymn_number: hymn_number,
//           name: name,
//           performer: "congregation",
//           type: type,
//           date: date,
//           organist: organist,
//           chorister: chorister,
//         };
//       } else if (type === "sacrament" && !sundayEntry.sacrament.hymn_number) {
//         sundayEntry.sacrament = {
//           id,
//           hymn_number: hymn_number,
//           name: name,
//           performer: "congregation",
//           type: type,
//           date: date,
//           organist: organist,
//           chorister: chorister,
//         };
//       } else if (
//         type === "intermediate" &&
//         !sundayEntry.intermediate.hymn_number
//       ) {
//         sundayEntry.intermediate = {
//           id,
//           hymn_number: hymn_number,
//           name: song_title,
//           performer: performer,
//           type: type,
//           date: date,
//           organist: organist,
//           chorister: chorister,
//         };
//       }
//       if (type === "closing" && !sundayEntry.closing.hymn_number) {
//         sundayEntry.closing = {
//           id,
//           hymn_number: hymn_number,
//           name: name,
//           performer: "congregation",
//           type: type,
//           date: date,
//           organist: organist,
//           chorister: chorister,
//         };
//       }
//     }
//   });

//   return sundaySchedule;
// };

export const mapToSundaysMusicFormat = (rows, musicAdmin, year) => {
  //console.log(musicAdmin);
  const sundays = getSundaysOfYear(year);
  const sundaySchedule = sundays.map((date) => ({
    date,
    opening: {},
    sacrament: {},
    intermediate: {},
    closing: {},
    chorister: null,
    organist: null,
  }));

  sundaySchedule.forEach((entry) => {
    const admin = musicAdmin.find((a) => {
      const adminDate = a.date; //format(parseISO(a.date), "yyyy-MM-dd");
      //console.log(adminDate);
      const match = adminDate === entry.date;
      //console.log("comparing", adminDate, "vs", entry.date, "->", match);
      return match;
    });

    if (admin) {
      entry.chorister = admin.chorister_id;
      entry.organist = admin.organist_id;
    }
  });

  //console.log(sundaySchedule);

  rows.forEach((row) => {
    const { id, date, hymn_number, name, song_title, performer, type } = row;

    const normalizedDate = format(parseISO(date), "yyyy-MM-dd");
    const sundayEntry = sundaySchedule.find(
      (entry) => entry.date === normalizedDate
    );

    if (sundayEntry) {
      const commonData = {
        id,
        hymn_number,
        date,
        type,
        organist: sundayEntry.organist,
        chorister: sundayEntry.chorister,
      };

      if (type === "opening" && !sundayEntry.opening.hymn_number) {
        sundayEntry.opening = {
          ...commonData,
          name,
          performer: "congregation",
        };
      } else if (type === "sacrament" && !sundayEntry.sacrament.hymn_number) {
        sundayEntry.sacrament = {
          ...commonData,
          name,
          performer: "congregation",
        };
      } else if (
        type === "intermediate" &&
        !sundayEntry.intermediate.hymn_number
      ) {
        sundayEntry.intermediate = {
          ...commonData,
          name: song_title,
          performer,
        };
      } else if (type === "closing" && !sundayEntry.closing.hymn_number) {
        sundayEntry.closing = {
          ...commonData,
          name,
          performer: "congregation",
        };
      }
    }
  });

  return sundaySchedule;
};

export const groupSundaysByMonth = (sundays) => {
  const grouped = {};

  sundays.forEach((sunday) => {
    const date = parseISO(sunday.date); // Parse the date using parseISO
    const monthYear = format(date, "MMMM yyyy");

    if (!grouped[monthYear]) {
      grouped[monthYear] = [];
    }
    grouped[monthYear].push(sunday);
  });

  // Convert the object to an array and sort by date
  const sortedMonths = Object.entries(grouped).sort(([monthA], [monthB]) => {
    // Convert string (like 'December 2024') to Date object and compare
    return new Date(monthB) - new Date(monthA);
  });

  return sortedMonths;
};

function getAllSundaysOfMonth(year, month) {
  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month, getDaysInMonth(firstDayOfMonth));

  // Find all Sundays within the current month
  const sundays = eachSundayOfInterval({
    start: startOfMonth(firstDayOfMonth),
    end: endOfMonth(lastDayOfMonth),
  });

  // Filter out any Sundays that fall outside of the given month
  return sundays.filter((sunday) => sunday.getMonth() === month);
}

export function generateMonthlySchedule(year) {
  const schedule = [];

  for (let month = 0; month < 12; month++) {
    const sundays = getAllSundaysOfMonth(year, month);

    const monthName = format(new Date(year, month, 1), "MMMM yyyy");
    const monthData = sundays.map((sunday) => ({
      date: format(sunday, "yyyy-MM-dd"),
      opening: {},
      sacrament: {},
      intermediate: {},
      closing: {},
    }));

    schedule.push([monthName, monthData]);
  }

  return schedule;
}

export const getCurrentMonth = () => {
  const date = new Date();
  return date.toLocaleString("default", { month: "long", year: "numeric" });
};

export const arrayMove = (arr, fromIndex, toIndex) => {
  const item = arr[fromIndex];
  const newArr = [...arr];
  newArr.splice(fromIndex, 1); // Remove item from old position
  newArr.splice(toIndex, 0, item); // Insert item at the new position
  return newArr;
};

export function parseMusicInfo(musicString) {
  const [type, performer] = musicString.split("-");
  return {
    type: type.trim(),
    performer: performer.trim(),
  };
}

export const processSongsArray = (songsArray) => {
  return songsArray.map((song) => {
    const songTypes = ["opening", "sacrament", "intermediate", "closing"];

    const result = {};

    songTypes.forEach((type) => {
      result[type] = Object.keys(song[type] || {}).length > 0;
    });

    return {
      date: song.date,
      ...result,
    };
  });
};
