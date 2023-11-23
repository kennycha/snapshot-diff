import { forwardRef } from "react";
import styles from "./index.module.scss";
import classNames from "classnames/bind";

const cx = classNames.bind(styles);

type Props = {
  label: string;
  labelColor: "red" | "blue";
  imageUrl: string;
};

const ImageCard = forwardRef<HTMLImageElement, Props>(
  ({ label, labelColor, imageUrl }, ref) => {
    return (
      <div className={cx("container")}>
        <p className={cx("label", labelColor)}>{label}</p>
        <img
          ref={ref}
          src={imageUrl}
          alt={label.toLowerCase()}
          className={cx("image")}
        />
      </div>
    );
  }
);

export default ImageCard;
