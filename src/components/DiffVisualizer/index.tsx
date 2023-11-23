import { forwardRef } from "react";
import styles from "./index.module.scss";
import classNames from "classnames/bind";
import { IMAGE_SIZES } from "../../constants";

const cx = classNames.bind(styles);

const DiffVisualizer = forwardRef<HTMLCanvasElement>((_, ref) => {
  return (
    <div className={cx("container")}>
      <p className={cx("label")}>Image Diff</p>
      <canvas
        ref={ref}
        className={cx("canvas")}
        width={IMAGE_SIZES.destination.width}
        height={IMAGE_SIZES.destination.height}
      />
    </div>
  );
});

export default DiffVisualizer;
