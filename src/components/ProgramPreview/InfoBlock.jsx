import { Skeleton } from "@mui/material";

const InfoBlock = (props) => {
  const { title, value, isLoading } = props;

  return (
    <div className="info-block">
      <div className="info-block__title">{title}</div>
      <div className="info-block__value">
        {isLoading ? (
          <Skeleton width={400} />
        ) : value.length === 1 ? (
          <span className="error-text">NO VALUE</span>
        ) : (
          <span
            style={{ lineHeight: "1.4" }}
            dangerouslySetInnerHTML={{ __html: value }}
          />
        )}
      </div>
    </div>
  );
};

export default InfoBlock;
