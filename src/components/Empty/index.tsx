import styles from "./index.module.scss";
import classNames from "classnames/bind";

const cx = classNames.bind(styles);

const Empty = () => {
  return (
    <div className={cx("container")}>
      <div className={cx("inner")}>
        <p>
          Click <strong>Get Diff</strong> Button!
        </p>
      </div>
    </div>
  );
};

export default Empty;
