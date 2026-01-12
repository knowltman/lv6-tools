import DynamicListInline from "../ProgramPreview/DynamicListInline";
import { useState } from "react";
const BusinessItem = (props) => {
  const {
    title,
    value,
    stateName,
    intro,
    conclusion,
    checkboxState,
    setCheckboxState,
  } = props;

  const [isFocused, setIsFocused] = useState(false);
  return (
    <div
      className="info-block"
      onMouseEnter={() => setIsFocused(true)}
      onMouseLeave={() => setIsFocused(false)}
    >
      <div className="info-block__title">{title}</div>
      <div className="info-block-inline__value">
        {<div style={{ marginTop: ".2rem" }}>{intro}</div>}
        <DynamicListInline
          fieldName={title}
          stateName={stateName}
          checkboxState={checkboxState}
          setCheckboxState={setCheckboxState}
          value={value}
          isFocused={isFocused}
        />
        {conclusion ? (
          <div className="business-item__conclusion">{conclusion}</div>
        ) : null}
      </div>
    </div>
  );
};

export default BusinessItem;
