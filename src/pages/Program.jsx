import { useRef, useState } from "react";
import ProgramPreview from "../components/ProgramPreview/ProgramPreview";
import ProgramPreviewSimple from "../components/ProgramPreview/ProgramPreviewSimple";
import { useReactToPrint } from "react-to-print";
import { programStore } from "../stores/program";
import { formStore } from "../stores/formValues";
import { ProgramSidebar } from "./ProgramSidebar";
import { useMediaQuery } from "@mui/material";

const Program = (props) => {
  const { handleSaveProgram, isLoading } = props;
  const { formValues2 } = formStore();
  const {
    isSimple,
    specialSundays,
    haveSpeakers,
    haveAnnouncements,
    haveClosingAnnouncements,
    haveNewMembers,
    haveCallings,
    haveReleases,
    haveOtherWardBusiness,
    haveStakeBusiness,
  } = programStore((state) => state);

  const [isMobile, setIsMobile] = useState(
    useMediaQuery("(max-width: 1366px)"),
  );

  const programRef = useRef();

  const reactPrint = useReactToPrint({
    // support both modern `content` (function returning element)
    // and older `contentRef` shapes by providing both.
    content: () => programRef.current,
    contentRef: programRef,
    onBeforeGetContent: () => {
      if (!programRef.current) {
        console.warn("react-to-print: programRef is not set yet");
      }
    },
  });

  const isIOS =
    typeof navigator !== "undefined" &&
    (/iPad|iPhone|iPod/.test(navigator.userAgent) ||
      (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1));

  const openWindowAndPrint = (el) => {
    try {
      const win = window.open("", "_blank");
      if (!win) {
        alert(
          "Unable to open print window (popup blocked). Please allow popups for this site.",
        );
        return;
      }
      const headContent = document.head.innerHTML;
      const html = `<!doctype html><html><head>${headContent}</head><body>${el.innerHTML}</body></html>`;
      win.document.open();
      win.document.write(html);
      win.document.close();
      win.focus();
      // Delay to allow styles to load
      setTimeout(() => {
        try {
          win.print();
        } catch (e) {
          console.warn("Fallback print failed:", e);
        }
      }, 500);
    } catch (e) {
      console.error("openWindowAndPrint error:", e);
    }
  };

  const handlePrint = () => {
    // For iOS devices use the new-window fallback which is more reliable
    if (isIOS) {
      if (programRef.current) openWindowAndPrint(programRef.current);
      else console.warn("No programRef available for printing");
      return;
    }
    try {
      reactPrint();
    } catch (err) {
      console.warn("react-to-print failed, falling back to window print:", err);
      if (programRef.current) openWindowAndPrint(programRef.current);
    }
  };

  // const handleProgramOpen = (programDate) => {
  //   // if (data === undefined) {
  //   //   setFormValues(defaultFormValues);
  //   //   return;
  //   // }

  //   setIsLoading(true);
  //   setFormValues({});
  //   const programData = JSON.parse(data);
  //   setFormValues(programData);
  //   getCheckedBoxes(
  //     programData,
  //     setHaveSpeakers,
  //     setHaveNewMembers,
  //     setHaveReleases,
  //     setHaveCallings,
  //     setHaveOtherWardBusiness,
  //     setHaveAnnouncements
  //   );
  //   setIsLoading(false);
  // };

  // useEffect(() => {
  //   // fetchPrayerHistory();
  //   //fetchSpeakerHistory();
  //   //fetchMusicHistory();
  // }, []);

  return (
    <div className="container fadeIn" style={{ display: "flex" }}>
      <ProgramSidebar
        handlePrint={handlePrint}
        handleSaveProgram={handleSaveProgram}
        isMobile={isMobile}
        setIsMobile={setIsMobile}
      />
      <div
        className={`${"scroll-box right"} ${isMobile ? "right-mobile" : ""}`}
        ref={programRef}
      >
        {isSimple ? (
          <ProgramPreviewSimple
            programData={formValues2}
            isLoading={isLoading}
            isMobile={isMobile}
            setIsMobile={setIsMobile}
          />
        ) : (
          <ProgramPreview
            formValues={formValues2}
            haveNewMembers={haveNewMembers}
            haveReleases={haveReleases}
            haveCallings={haveCallings}
            haveOtherWardBusiness={haveOtherWardBusiness}
            haveStakeBusiness={haveStakeBusiness}
            haveSpeakers={haveSpeakers}
            haveAnnouncements={haveAnnouncements}
            isLoading={isLoading}
            specialSundays={specialSundays}
          />
        )}
        <div className="print-only sacrament-prayers">
          <h2>Blessing on the Bread</h2>
          <p>
            O God, the Eternal Father, we ask thee in the name of thy Son, Jesus
            Christ, to bless and sanctify this bread to the souls of all those
            who partake of it, that they may eat in remembrance of the body of
            thy Son, and witness unto thee, O God, the Eternal Father, that they
            are willing to take upon them the name of thy Son, and always
            remember him and keep his commandments which he has given them; that
            they may always have his Spirit to be with them. Amen.
          </p>
          <h2>Blessing on the Water</h2>
          <p>
            O God, the Eternal Father, we ask thee in the name of thy Son, Jesus
            Christ, to bless and sanctify this water to the souls of all those
            who drink of it, that they may do it in remembrance of the blood of
            thy Son, which was shed for them; that they may witness unto thee, O
            God, the Eternal Father, that they do always remember him, that they
            may have his Spirit to be with them. Amen.
          </p>
        </div>
      </div>
    </div>
  );
};
export default Program;
