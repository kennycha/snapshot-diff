import { forwardRef } from "react";
import styles from "./index.module.scss";
import classNames from "classnames/bind";

const cx = classNames.bind(styles);

const DiffVisualizer = forwardRef<HTMLCanvasElement>((_, ref) => {
  return (
    <div className={cx("container")}>
      <p className={cx("label")}>Image Diff</p>
      <canvas ref={ref} className={cx("canvas")} />
    </div>
  );
});

export default DiffVisualizer;
