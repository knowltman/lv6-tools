import { useRef } from "react";
import ProgramPreview from "../components/ProgramPreview/ProgramPreview";
import ProgramPreviewSimple from "../components/ProgramPreview/ProgramPreviewSimple";
import { useReactToPrint } from "react-to-print";
import { programStore } from "../stores/program";
import { formStore } from "../stores/formValues";
import { ProgramSidebar } from "./ProgramSidebar";
import { TextareaAutosize, useMediaQuery } from "@mui/material";
import BulletinEditor from "../components/BulletinEditor";
const Bulletin = (props) => {
  const { handleSaveProgram, isLoading } = props;
  const { formValues2 } = formStore();
  const {
    isSimple,
    specialSundays,
    haveSpeakers,
    haveAnnouncements,
    haveNewMembers,
    haveCallings,
    haveReleases,
    haveOtherWardBusiness,
    haveStakeBusiness,
  } = programStore((state) => state);

  const isMobile = useMediaQuery("(max-width: 768px)");

  const programRef = useRef();

  const handlePrint = useReactToPrint({
    contentRef: programRef,
  });

  return (
    <div className="container fadeIn" style={{ display: "flex" }}>
      <div
        className={`${"scroll-box half"} ${isMobile ? "right-mobile" : ""}`}
        ref={programRef}
      >
        <ProgramPreviewSimple programData={formValues2} isLoading={isLoading} />
      </div>
      <div
        className={`${"scroll-box half"} ${isMobile ? "right-mobile" : ""}`}
        ref={programRef}
      >
        Announcements
        <BulletinEditor />
      </div>
    </div>
  );
};
export default Bulletin;
