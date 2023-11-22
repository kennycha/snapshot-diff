import styles from "./index.module.scss";
import classNames from "classnames/bind";

const cx = classNames.bind(styles);

const Loading = () => {
  return (
    <div className={cx("container")}>
      <img
        src="/assets/images/loading.jpeg"
        alt="loading"
        className={cx("image")}
      />
    </div>
  );
};

export default Loading;
